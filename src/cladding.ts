import { delay } from './lib.js';

const CLASS_UNCOVERED = 'uncovered';

export class Cladding {
  private readonly canvasBoxEl = document.querySelector<HTMLElement>('#canvasBox')!;
  private readonly claddingEl = document.querySelector<HTMLElement>('#cladding')!;

  private claddingTiles: HTMLElement[] = [];

  private size = 0;

  constructor(private readonly onClick: (x: number, y: number) => void) {
    if (this.canvasBoxEl == null || this.claddingEl == null) {
      throw new Error('cannot find expected HTML elements');
    }
  }

  regenerate() {
    this.generate(this.size);
  }

  generate(size: number) {
    this.size = size;

    this.canvasBoxEl.style.setProperty('--size', String(size));
    this.claddingEl.textContent = '';
    this.claddingTiles.length = 0;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const tileEl = document.createElement('div');

        tileEl.addEventListener(
          'click',
          () => !tileEl.classList.contains(CLASS_UNCOVERED) && this.onClick(x, y)
        );

        this.claddingEl.append(tileEl);
        this.claddingTiles.push(tileEl);
      }
    }
  }

  uncover(x: number, y: number) {
    this.getTileEl(x, y)?.classList.add(CLASS_UNCOVERED);
  }

  uncoverAll() {
    this.claddingTiles.forEach((tile) => tile.classList.add(CLASS_UNCOVERED));
  }

  coverAll() {
    this.claddingTiles.forEach((tile) => tile.classList.remove(CLASS_UNCOVERED));
  }

  async coverAllSlowly(delayFn = delay) {
    this.uncoverAll();

    for (const tile of this.claddingTiles) {
      await delayFn(5000 / this.claddingTiles.length);
      tile.classList.remove(CLASS_UNCOVERED);
    }

    await delayFn(5000 / this.claddingTiles.length);
  }

  isAreaUncovered(px: number, py: number, w: number, h: number) {
    for (let x = px; x < px + w; x += 1) {
      for (let y = py; y < py + h; y += 1) {
        const tileEl = this.getTileEl(x, y);
        if (!tileEl?.classList.contains(CLASS_UNCOVERED)) return false;
      }
    }
    return true;
  }

  private getTileEl(x: number, y: number) {
    return this.claddingTiles[x + y * this.size];
  }
}
