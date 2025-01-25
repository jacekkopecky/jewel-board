import { delay, percent } from './lib.js';
import { State } from './state.js';

const CLASS_UNCOVERED = 'uncovered';
const CLASS_HIDDEN = 'hidden';

export class UI {
  private readonly canvasBoxEl = document.querySelector<HTMLElement>('#canvasBox')!;
  private readonly jewelsEl = document.querySelector<HTMLElement>('#jewels')!;
  private readonly treeEl = document.querySelector<HTMLElement>('#tree')!;
  private readonly claddingEl = document.querySelector<HTMLElement>('#cladding')!;

  private claddingTiles: HTMLElement[] = [];

  constructor(private state: State) {
    if (
      this.canvasBoxEl == null ||
      this.jewelsEl == null ||
      this.treeEl == null ||
      this.claddingEl == null
    ) {
      throw new Error('cannot find expected HTML elements');
    }
  }

  static async show(state: State) {
    const ui = new UI(state);

    ui.reset();

    const size = state.size;
    ui.canvasBoxEl.style.setProperty('--size', String(size));

    // put cladding in
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const tileEl = document.createElement('div');
        tileEl.addEventListener('click', () => ui.uncoverTile(x, y));
        ui.claddingEl.append(tileEl);

        ui.claddingTiles.push(tileEl);
      }
    }

    // put jewels in
    for (const { jewel, position, flip } of state.jewelsPlaced) {
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
      ui.jewelsEl.append(img);

      const shadow = img.cloneNode(true) as typeof img;
      shadow.classList.add('shadow');
      ui.treeEl.append(shadow);

      jewel.el = img;
      jewel.shadowEl = shadow;
    }

    console.log(ui);

    if (state.uncoveredTiles.length > 0) {
      await delay(200);
    }
    for (const [x, y] of state.uncoveredTiles) {
      await delay(100);
      ui.uncoverTile(x, y, true);
    }
  }

  private reset() {
    this.claddingEl.textContent = '';
    this.jewelsEl.textContent = '';
    this.treeEl.textContent = '';
    this.claddingTiles.length = 0;
  }

  private uncoverTile(x: number, y: number, replaying = false) {
    if (this.state.moves <= 0) {
      return; // todo show out of moves, wait until tomorrow
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
    // todo also let the user play a new puzzle if all jewels uncovered

    // todo show moves
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
