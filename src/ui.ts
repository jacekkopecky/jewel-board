import { delay, percent } from './lib.js';
import { State } from './state.js';

const CLASS_UNCOVERED = 'uncovered';
const CLASS_HIDDEN = 'hidden';

export class UI {
  private readonly canvasBoxEl = document.querySelector<HTMLElement>('#canvasBox')!;
  private readonly jewelsEl = document.querySelector<HTMLElement>('#jewels')!;
  private readonly treeEl = document.querySelector<HTMLElement>('#tree')!;
  private readonly claddingEl = document.querySelector<HTMLElement>('#cladding')!;
  private readonly movesCountEl = document.querySelector<HTMLElement>('#movesCount')!;

  private claddingTiles: HTMLElement[] = [];

  constructor(private state: State) {
    if (
      this.canvasBoxEl == null ||
      this.jewelsEl == null ||
      this.treeEl == null ||
      this.claddingEl == null ||
      this.movesCountEl == null
    ) {
      throw new Error('cannot find expected HTML elements');
    }
  }

  static async show(state: State) {
    const ui = new UI(state);

    ui.reset();
    ui.doShow();
  }

  private async doShow() {
    const size = this.state.size;
    this.canvasBoxEl.style.setProperty('--size', String(size));

    // put cladding in
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const tileEl = document.createElement('div');
        tileEl.addEventListener('click', () => this.uncoverTile(x, y));
        this.claddingEl.append(tileEl);

        this.claddingTiles.push(tileEl);
      }
    }

    // put jewels in
    for (const { jewel, position, flip } of this.state.jewelsPlaced) {
      let { w, h, svg } = jewel;
      const [x, y] = position;
      const [wf, hf] = flip ? [h, w] : [w, h];

      const img = document.createElement('img');
      img.src = svg;
      img.classList.add('jewel');
      img.style.top = percent((y + hf / 2) / size);
      img.style.left = percent((x + wf / 2) / size);
      if (flip) img.classList.add('flip');
      img.style.width = percent(w / size);
      img.style.height = percent(h / size);
      this.jewelsEl.append(img);

      const shadow = img.cloneNode(true) as typeof img;
      shadow.classList.add('shadow');
      this.treeEl.append(shadow);

      jewel.el = img;
      jewel.shadowEl = shadow;
    }

    this.viewMoveCount();

    if (this.state.uncoveredTiles.length > 0) {
      await delay(200);
    }
    for (const [x, y] of this.state.uncoveredTiles) {
      await delay(100);
      this.uncoverTile(x, y, true);
    }
  }

  private viewMoveCount() {
    const moves = this.state.moves;
    this.movesCountEl.textContent = moves ? String(this.state.moves) : 'play more tomorrow';
    this.movesCountEl.classList.toggle('tomorrow', !moves);
  }

  private reset() {
    this.claddingEl.textContent = '';
    this.jewelsEl.textContent = '';
    this.treeEl.textContent = '';
    this.claddingTiles.length = 0;
  }

  private uncoverTile(x: number, y: number, replaying = false) {
    if (this.state.moves <= 0 && !replaying) {
      return;
    }

    const index = x + y * this.state.size;
    const tileEl = this.claddingTiles[index];
    if (!tileEl) {
      throw new Error(`cannot find tile ${x},${y}`);
    }

    if (tileEl.classList.contains(CLASS_HIDDEN)) return; // already uncovered

    tileEl?.classList.add(CLASS_HIDDEN);
    if (!replaying) {
      this.state.addFlippedTile(x, y);
    }

    this.checkFullyUncoveredJewels();
    this.viewMoveCount();
    // todo also let the user play a new puzzle if all jewels uncovered
  }

  private checkFullyUncoveredJewels() {
    for (const { jewel, position, flip } of this.state.jewelsPlaced) {
      if (!jewel.el || !jewel.shadowEl) continue; // jewel not on board
      if (jewel.el.classList.contains(CLASS_UNCOVERED)) continue; // already uncovered

      const [w, h] = flip ? [jewel.h, jewel.w] : [jewel.w, jewel.h];
      const [px, py] = position;
      if (this.isAreaUncovered(px, py, w, h)) {
        jewel.el.classList.add(CLASS_UNCOVERED);
        jewel.shadowEl.classList.add(CLASS_UNCOVERED);
      }
    }
  }

  private isAreaUncovered(px: number, py: number, w: number, h: number) {
    for (let x = px; x < px + w; x += 1) {
      for (let y = py; y < py + h; y += 1) {
        const tileEl = this.claddingTiles[y * this.state.size + x];
        if (!tileEl?.classList.contains(CLASS_HIDDEN)) return false;
      }
    }
    return true;
  }
}
