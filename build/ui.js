import { delay, percent } from './lib.js';
import { BONUS_MOVES_PER_JEWEL } from './state.js';
import { Tree } from './tree.js';
const CLASS_UNCOVERED = 'uncovered';
export class UI {
    state;
    canvasBoxEl = document.querySelector('#canvasBox');
    jewelsEl = document.querySelector('#jewels');
    claddingEl = document.querySelector('#cladding');
    movesCountEl = document.querySelector('#movesCount');
    moveBonusFloatEl = document.querySelector('#moveBonusFloat');
    claddingTiles = [];
    tree = new Tree();
    constructor(state) {
        this.state = state;
        if (this.canvasBoxEl == null ||
            this.jewelsEl == null ||
            this.claddingEl == null ||
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
    async doShow() {
        const size = this.state.size;
        this.generateCladding();
        this.tree.reset();
        // put jewels in
        this.jewelsEl.textContent = '';
        for (const { jewel, position, flip } of this.state.jewelsPlaced) {
            let { w, h, svg } = jewel;
            const [x, y] = position;
            const [wf, hf] = flip ? [h, w] : [w, h];
            const img = document.createElement('img');
            img.src = svg;
            img.classList.add('jewel');
            img.style.top = percent((y + hf / 2) / size);
            img.style.left = percent((x + wf / 2) / size);
            if (flip)
                img.classList.add('flip');
            img.style.width = percent(w / size);
            img.style.height = percent(h / size);
            this.jewelsEl.append(img);
            const shadow = this.tree.addJewel(jewel, flip);
            jewel.el = img;
            jewel.treeEl = shadow;
        }
        this.tree.show();
        this.viewMoveCount(true);
        if (this.state.uncoveredTiles.length > 0) {
            await delay(200);
        }
        for (const [x, y] of this.state.uncoveredTiles) {
            await delay(100);
            this.uncoverTile(x, y, true);
        }
    }
    generateCladding() {
        const size = this.state.size;
        this.canvasBoxEl.style.setProperty('--size', String(size));
        this.claddingEl.textContent = '';
        this.claddingTiles.length = 0;
        for (let y = 0; y < size; y += 1) {
            for (let x = 0; x < size; x += 1) {
                const tileEl = document.createElement('div');
                tileEl.addEventListener('click', () => this.uncoverTile(x, y));
                this.claddingEl.append(tileEl);
                this.claddingTiles.push(tileEl);
            }
        }
    }
    previousMoveCount = -1;
    viewMoveCount(showZero = false) {
        const moves = this.state.moves;
        const showTomorrow = !moves && !showZero;
        this.movesCountEl.textContent = showTomorrow ? 'play more tomorrow' : String(this.state.moves);
        this.movesCountEl.classList.toggle('tomorrow', showTomorrow);
        if (this.previousMoveCount > -1 && moves > this.previousMoveCount) {
            const span = document.createElement('span');
            span.textContent = `+${moves - this.previousMoveCount}`;
            this.moveBonusFloatEl.append(span);
            setTimeout(() => span.remove(), 3000);
        }
        this.previousMoveCount = moves;
    }
    uncoverTile(x, y, replaying = false) {
        if (this.state.moves <= 0 && !replaying) {
            return;
        }
        const index = x + y * this.state.size;
        const tileEl = this.claddingTiles[index];
        if (!tileEl) {
            throw new Error(`cannot find tile ${x},${y}`);
        }
        if (tileEl.classList.contains(CLASS_UNCOVERED))
            return; // already uncovered
        tileEl?.classList.add(CLASS_UNCOVERED);
        if (!replaying) {
            this.state.addFlippedTile(x, y);
        }
        let { allUncovered, anyUncovered } = this.checkFullyUncoveredJewels(replaying);
        this.viewMoveCount(anyUncovered);
        if (allUncovered)
            this.nextGame();
    }
    async nextGame() {
        // make sure all tiles show as uncovered now
        for (const tile of this.claddingTiles) {
            tile.classList.add(CLASS_UNCOVERED);
        }
        await delay(2000);
        this.state.newPuzzle();
        this.generateCladding();
        // hide all tiles again so we can slowly uncover them in a moment
        for (const tile of this.claddingTiles) {
            tile.classList.add(CLASS_UNCOVERED);
        }
        for (const tile of this.claddingTiles) {
            await delay(5000 / this.claddingTiles.length);
            tile.classList.remove(CLASS_UNCOVERED);
        }
        await delay(5000 / this.claddingTiles.length);
        // reset view
        this.doShow();
    }
    checkFullyUncoveredJewels(replaying) {
        let allUncovered = true;
        let anyUncovered = false;
        for (const { jewel, position, flip } of this.state.jewelsPlaced) {
            if (!jewel.el || !jewel.treeEl)
                continue; // jewel not on board
            if (jewel.el.classList.contains(CLASS_UNCOVERED))
                continue; // already uncovered
            const [w, h] = flip ? [jewel.h, jewel.w] : [jewel.w, jewel.h];
            const [px, py] = position;
            if (this.isAreaUncovered(px, py, w, h)) {
                jewel.el.classList.add(CLASS_UNCOVERED);
                jewel.treeEl.classList.add(CLASS_UNCOVERED);
                if (!replaying) {
                    anyUncovered = true;
                    // extra move as reward for uncovering a whole jewel
                    // if the user quickly reloads before getting the bonus, they lose it
                    setTimeout(() => {
                        this.state.addBonusMoves(BONUS_MOVES_PER_JEWEL);
                        this.viewMoveCount();
                    }, 1000);
                }
            }
            else {
                allUncovered = false;
            }
        }
        return { allUncovered, anyUncovered };
    }
    isAreaUncovered(px, py, w, h) {
        for (let x = px; x < px + w; x += 1) {
            for (let y = py; y < py + h; y += 1) {
                const tileEl = this.claddingTiles[y * this.state.size + x];
                if (!tileEl?.classList.contains(CLASS_UNCOVERED))
                    return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=ui.js.map