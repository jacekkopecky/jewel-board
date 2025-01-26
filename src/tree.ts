// maybe position same-area jewels symmetrically
// one jewel in the middle, the rest in a circle?
// show branches that hold the jewels?

// or show a static fractal tree and put the jewels on the nearest node
// to its circle position?

import { Jewel } from './jewels.js';

export class Tree {
  private readonly treeEl = document.querySelector<HTMLElement>('#tree')!;

  constructor() {
    if (this.treeEl == null) {
      throw new Error('cannot find expected HTML elements');
    }
  }

  reset() {
    this.treeEl.textContent = '';
  }

  show() {
    // todo
  }

  addJewel(jewel: Jewel, flip: boolean) {
    const shadow = document.createElement('img');
    shadow.src = jewel.svg;
    shadow.classList.add('jewel', 'shadow');
    if (flip) shadow.classList.add('flip');

    this.treeEl.append(shadow);
    return shadow;
  }
}
