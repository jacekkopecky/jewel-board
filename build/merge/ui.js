import { Cladding } from '../cladding.js';
import { mergeJewels, selectMergeJewel } from '../jewels.js';
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
    }
    static async show(state) {
        const ui = new UI(state);
        ui.doShow();
        return ui;
    }
    doShow() {
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
                img.draggable = true;
                img.addEventListener('dragstart', () => this.startDragging(jewelPlaced));
                img.addEventListener('dragend', () => this.stopDragging(jewelPlaced));
                img.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (e.dataTransfer)
                        e.dataTransfer.dropEffect = 'move';
                });
                img.addEventListener('drop', () => this.dropDraggingJewel(position[0], position[1]));
                this.jewelsEl.append(img);
                jewel.el = img;
                // make it appear gradually
                img.classList.add('appearing');
                setTimeout(() => img.classList.remove('appearing'), 0);
            }
            else {
                // update the image style - it may have moved
                createJewelImg(jewel, [x, y], size * 3, jewel.el);
                oldJewels.delete(jewel.el);
            }
            // todo on merging higher levels, maybe just add bonus moves (copy fn from orig state.ts) but also N times try to click nearby fields
        }
        for (const oldJewel of oldJewels) {
            // gradually remove jewels now removed
            oldJewel.classList.add('disappearing');
            setTimeout(() => oldJewel.remove(), 1000);
        }
        // todo change this to true if we're adding bonus moves
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
            const moved = this.state.moveJewel(this.draggingJewel.position[0], this.draggingJewel.position[1], x, y);
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
    viewMoveCount(showZero = false, message = 'add more in an hour') {
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
        // make more of higher jewels (only three smallest jewels though) the bigger jewels you have
        const highest = this.state.highestLevel;
        const probabilities = highest < 1 ? [1] : [4 / highest, 8 / highest, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        if (this.state.addJewel(x, y, selectMergeJewel(probabilities))) {
            this.doShow();
        }
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