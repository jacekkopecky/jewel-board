import { delay } from './lib.js';
const CLASS_UNCOVERED = 'uncovered';
export class Cladding {
    canvasBoxEl = document.querySelector('#canvasBox');
    claddingEl = document.querySelector('#cladding');
    claddingTiles = [];
    onClick;
    onDrop;
    size = 0;
    constructor(opts) {
        if (this.canvasBoxEl == null || this.claddingEl == null) {
            throw new Error('cannot find expected HTML elements');
        }
        this.onClick = opts.onClick;
        this.onDrop = opts.onDrop;
    }
    regenerate() {
        this.generate(this.size);
    }
    generate(size) {
        this.size = size;
        this.canvasBoxEl.style.setProperty('--size', String(size));
        this.claddingEl.textContent = '';
        this.claddingTiles.length = 0;
        if (this.onDrop) {
            this.claddingEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (e.dataTransfer)
                    e.dataTransfer.dropEffect = 'move';
            });
        }
        for (let y = 0; y < size; y += 1) {
            for (let x = 0; x < size; x += 1) {
                const tileEl = document.createElement('div');
                tileEl.addEventListener('click', () => !tileEl.classList.contains(CLASS_UNCOVERED) && this.onClick(x, y));
                if (this.onDrop) {
                    tileEl.addEventListener('drop', () => this.onDrop?.(x, y));
                }
                this.claddingEl.append(tileEl);
                this.claddingTiles.push(tileEl);
            }
        }
    }
    uncover(x, y) {
        this.getTileEl(x, y)?.classList.add(CLASS_UNCOVERED);
    }
    uncoverAll() {
        this.claddingTiles.forEach((tile) => tile.classList.add(CLASS_UNCOVERED));
    }
    coverAll() {
        this.claddingTiles.forEach((tile) => tile.classList.remove(CLASS_UNCOVERED));
    }
    async coverAllSlowly(delayFn = delay, totalTimeMs = 5000) {
        this.uncoverAll();
        const stepDelay = totalTimeMs / (this.claddingTiles.length + 1);
        for (const tile of this.claddingTiles) {
            await delayFn(stepDelay);
            tile.classList.remove(CLASS_UNCOVERED);
        }
        await delayFn(stepDelay);
    }
    isAreaUncovered(px, py, w, h) {
        for (let x = px; x < px + w; x += 1) {
            for (let y = py; y < py + h; y += 1) {
                const tileEl = this.getTileEl(x, y);
                if (!tileEl?.classList.contains(CLASS_UNCOVERED))
                    return false;
            }
        }
        return true;
    }
    getTileEl(x, y) {
        return this.claddingTiles[x + y * this.size];
    }
}
//# sourceMappingURL=cladding.js.map