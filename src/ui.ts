import { delay, percent } from './lib.js';
import { State } from './state.js';
import { Tree } from './tree.js';

const CLASS_UNCOVERED = 'uncovered';

export class UI {
  private readonly canvasBoxEl = document.querySelector<HTMLElement>('#canvasBox')!;
  private readonly jewelsEl = document.querySelector<HTMLElement>('#jewels')!;
  private readonly claddingEl = document.querySelector<HTMLElement>('#cladding')!;
  private readonly movesCountEl = document.querySelector<HTMLElement>('#movesCount')!;

  private claddingTiles: HTMLElement[] = [];
  private tree = new Tree();

  constructor(private state: State) {
    if (
      this.canvasBoxEl == null ||
      this.jewelsEl == null ||
      this.claddingEl == null ||
      this.movesCountEl == null
    ) {
      throw new Error('cannot find expected HTML elements');
    }
  }

  static async show(state: State) {
    const ui = new UI(state);

    ui.doShow();
  }

  private async doShow() {
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
      if (flip) img.classList.add('flip');
      img.style.width = percent(w / size);
      img.style.height = percent(h / size);
      this.jewelsEl.append(img);

      const shadow = this.tree.addJewel(jewel, flip);

      jewel.el = img;
      jewel.treeEl = shadow;
    }

    this.tree.show();
    this.viewMoveCount();

    if (this.state.uncoveredTiles.length > 0) {
      await delay(200);
    }
    for (const [x, y] of this.state.uncoveredTiles) {
      await delay(100);
      this.uncoverTile(x, y, true);
    }
  }

  private generateCladding() {
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

  private viewMoveCount(allUncovered = false) {
    const moves = this.state.moves;
    const showTomorrow = !moves && !allUncovered;
    this.movesCountEl.textContent = showTomorrow ? 'play more tomorrow' : String(this.state.moves);
    this.movesCountEl.classList.toggle('tomorrow', showTomorrow);
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

    if (tileEl.classList.contains(CLASS_UNCOVERED)) return; // already uncovered

    tileEl?.classList.add(CLASS_UNCOVERED);
    if (!replaying) {
      this.state.addFlippedTile(x, y);
    }

    let allUncovered = this.checkFullyUncoveredJewels();
    this.viewMoveCount(allUncovered);

    if (allUncovered) this.nextGame();
  }

  private async nextGame() {
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

    // extra move to get started with the next game
    this.state.addBonusMoves(1);
    this.viewMoveCount();

    // todo let the jewels fall off the tree into my score

    // reset view
    this.doShow();
  }

  private checkFullyUncoveredJewels(): boolean {
    let allUncovered = true;
    for (const { jewel, position, flip } of this.state.jewelsPlaced) {
      if (!jewel.el || !jewel.treeEl) continue; // jewel not on board
      if (jewel.el.classList.contains(CLASS_UNCOVERED)) continue; // already uncovered

      const [w, h] = flip ? [jewel.h, jewel.w] : [jewel.w, jewel.h];
      const [px, py] = position;
      if (this.isAreaUncovered(px, py, w, h)) {
        jewel.el.classList.add(CLASS_UNCOVERED);
        jewel.treeEl.classList.add(CLASS_UNCOVERED);
      } else {
        allUncovered = false;
      }
    }
    return allUncovered;
  }

  private isAreaUncovered(px: number, py: number, w: number, h: number) {
    for (let x = px; x < px + w; x += 1) {
      for (let y = py; y < py + h; y += 1) {
        const tileEl = this.claddingTiles[y * this.state.size + x];
        if (!tileEl?.classList.contains(CLASS_UNCOVERED)) return false;
      }
    }
    return true;
  }
}
