import { Cladding } from '../cladding.js';
import { clone, coins, findJewelMergeLevel, isSame, mergeJewels, selectByProbability, } from '../jewels.js';
import { percent } from '../lib.js';
export class UI {
    state;
    pyramidEl = document.querySelector('#pyramid');
    jewelsEl = document.querySelector('#jewels');
    movesCountEl = document.querySelector('#movesCount');
    moveBonusFloatEl = document.querySelector('#moveBonusFloat');
    draggingJewel = null;
    cladding = new Cladding({
        onClick: (x, y) => this.addJewel(x, y),
        onDrop: (x, y) => this.dropDraggingJewel(x, y),
    });
    constructor(state) {
        this.state = state;
        if (this.pyramidEl == null ||
            this.jewelsEl == null ||
            this.movesCountEl == null ||
            this.moveBonusFloatEl == null) {
            throw new Error('cannot find expected HTML elements');
        }
        this.movesCountEl.addEventListener('click', () => this.addRandomlyPlacedJewel());
    }
    static async show(state) {
        const ui = new UI(state);
        ui.doShow();
        return ui;
    }
    doShow(opts = {}) {
        const size = this.state.size;
        this.cladding.generate(size);
        // redraw pyramid
        this.showPyramid();
        // put jewels in
        const oldJewels = new Set(this.jewelsEl.children);
        for (const jewelPlaced of this.state.jewelsPlaced) {
            const { jewel, position } = jewelPlaced;
            const x = position[0] * 3 - 1.5;
            const y = position[1] * 3 + 1.5 - jewel.h;
            if (!(jewel.el instanceof HTMLImageElement)) {
                const img = createJewelImg(jewel, [x, y], size * 3);
                if (jewelPlaced === opts.newlyAddedJewel) {
                    img.classList.add('newlyPlaced');
                }
                img.draggable = true;
                img.addEventListener('dragstart', () => this.startDragging(jewelPlaced));
                img.addEventListener('dragend', () => this.stopDragging(jewelPlaced));
                img.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (e.dataTransfer)
                        e.dataTransfer.dropEffect = 'move';
                });
                img.addEventListener('dragenter', () => {
                    img.classList.add('dragover');
                });
                img.addEventListener('dragleave', () => {
                    img.classList.remove('dragover');
                });
                img.addEventListener('drop', () => {
                    for (const el of document.querySelectorAll('.dragover')) {
                        el.classList.remove('dragover');
                    }
                    this.dropDraggingJewel(position[0], position[1]);
                });
                this.jewelsEl.append(img);
                jewel.el = img;
                // make it appear gradually
                img.classList.add('appearing');
                setTimeout(() => img.classList.remove('appearing', 'newlyPlaced'), 0);
            }
            else {
                // update the image style - it may have moved
                createJewelImg(jewel, [x, y], size * 3, jewel.el);
                oldJewels.delete(jewel.el);
            }
        }
        for (const oldJewel of oldJewels) {
            // gradually remove jewels now removed
            oldJewel.classList.add('disappearing');
            setTimeout(() => oldJewel.remove(), 1000);
        }
        this.viewMoveCount(false);
    }
    startDragging(placed) {
        placed.jewel.el?.classList.add('dragging');
        this.draggingJewel = placed;
    }
    stopDragging(placed) {
        placed.jewel.el?.classList.remove('dragging');
        this.draggingJewel = null;
    }
    dropDraggingJewel(x, y) {
        if (this.draggingJewel) {
            const { moved, merged } = this.state.moveJewel(this.draggingJewel.position[0], this.draggingJewel.position[1], x, y);
            if (merged) {
                if (merged.type === 'jewel') {
                    // if it's a high jewel, add random coins
                    const bonusCoins = findJewelMergeLevel(merged) - 4;
                    if (bonusCoins > 0)
                        this.addBonusCoins(bonusCoins);
                }
                else if (merged.type === 'coin' && isSame(merged, coins.at(-1))) {
                    // if it's top coin, add bonus moves
                    const bonusMoves = 2 ** coins.length;
                    setTimeout(() => {
                        this.state.addBonusMoves(bonusMoves);
                        this.viewMoveCount();
                    }, 500);
                }
            }
            if (moved) {
                this.doShow();
                // prevent the jewel from moving slowly
                const el = this.draggingJewel.jewel.el;
                if (el) {
                    el.classList.add('justMoved');
                    setTimeout(() => el.classList.remove('justMoved'), 100);
                }
            }
        }
    }
    previousMoveCount = -1;
    viewMoveCount(showZero = false, message = 'add more tomorrow') {
        const moves = this.state.moves;
        const showTomorrow = !moves && !showZero;
        this.movesCountEl.textContent = showTomorrow ? message : String(this.state.moves);
        this.movesCountEl.classList.toggle('tomorrow', showTomorrow);
        if (this.previousMoveCount > -1 && moves > this.previousMoveCount) {
            const span = document.createElement('span');
            span.textContent = `+${moves - this.previousMoveCount}`;
            this.moveBonusFloatEl.append(span);
            setTimeout(() => span.remove(), 3000);
        }
        this.previousMoveCount = moves;
    }
    addJewel(x, y) {
        // make more of higher jewels the bigger jewels you have
        const highest = this.state.highestLevel;
        const probabilities = highest < 1 ? [1] : [3 / highest, 6 / highest, 9 / highest, 12 / highest, 1];
        const newlyAddedJewel = this.state.addJewel(x, y, selectByProbability(mergeJewels, probabilities));
        if (newlyAddedJewel) {
            this.doShow({ newlyAddedJewel });
        }
    }
    async addBonusCoins(bonusCoins) {
        const availablePositions = this.getAvailablePositions();
        while (bonusCoins > 0 && availablePositions.length > 0) {
            const maxCoinLevel = Math.min(coins.length - 1, Math.log2(bonusCoins));
            const nextCoinLevel = Math.floor(Math.random() * (maxCoinLevel + 1));
            const nextRandomPositionIndex = Math.floor(Math.random() * availablePositions.length);
            const pos = availablePositions[nextRandomPositionIndex];
            availablePositions.splice(nextRandomPositionIndex, 1);
            this.addCoin(pos[0], pos[1], nextCoinLevel);
            bonusCoins -= 2 ** nextCoinLevel;
            await new Promise((resolve) => setTimeout(resolve, 400));
        }
    }
    addCoin(x, y, level = 0) {
        const newlyAddedCoin = this.state.addJewel(x, y, clone(coins[level]));
        if (newlyAddedCoin) {
            this.doShow();
        }
    }
    getAvailablePositions() {
        const boardPositions = [];
        const N = this.state.size;
        for (let x = 0; x < N; x += 1) {
            for (let y = 0; y < N; y += 1) {
                boardPositions[y * N + x] = [x, y];
            }
        }
        for (const { position } of this.state.jewelsPlaced) {
            const [x, y] = position;
            boardPositions[y * N + x] = undefined;
        }
        return boardPositions.filter((pos) => pos != null);
    }
    addRandomlyPlacedJewel() {
        const available = this.getAvailablePositions();
        const random = Math.floor(Math.random() * available.length);
        const pos = available[random];
        if (pos)
            this.addJewel(pos[0], pos[1]);
    }
    showPyramid() {
        if (!mergeJewels[0]?.el) {
            this.pyramidEl.textContent = '';
        }
        const highest = this.state.highestLevel;
        // size 15 so we fit 5 rows of jewels up to 3 high
        const size = 15;
        let row = 0;
        let placedInRow = 0;
        for (let i = 0; i < mergeJewels.length; i += 1) {
            const jewelIndex = mergeJewels.length - 1 - i;
            const jewel = mergeJewels[jewelIndex];
            const x = size / 2 + row * 1.5 - placedInRow * 3 - 3;
            const y = row * 3 + 1.5 - jewel.h;
            if (!jewel.el) {
                jewel.el = createJewelImg(jewel, [x, y], size);
                this.pyramidEl.append(jewel.el);
            }
            jewel.el.classList.toggle('shadow', jewelIndex > highest);
            // do 1 in first row, 2 in second etc.
            placedInRow += 1;
            if (placedInRow > row) {
                row += 1;
                placedInRow = 0;
            }
        }
    }
}
function createJewelImg(jewel, position, size, oldEl) {
    let { h, svg } = jewel;
    const [x, y] = position;
    const img = oldEl ?? document.createElement('img');
    img.src = svg;
    img.classList.add('jewel');
    img.style.top = percent((y + h / 2) / size);
    img.style.left = percent((x + 3 / 2) / size);
    // set width to the widest - all jewels here are at least as tall as they are wide
    img.style.width = percent(3 / size);
    img.style.height = percent(h / size);
    return img;
}
//# sourceMappingURL=ui.js.map