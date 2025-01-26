// maybe position same-area jewels symmetrically
// one jewel in the middle, the rest in a circle?
// show branches that hold the jewels?

// or show a static fractal tree and put the jewels on the nearest node
// to its circle position?

import { Jewel } from './jewels.js';

interface JewelPlaced {
  jewel: Jewel;
  flip: boolean;
  x: number;
  y: number;
  el: SVGElement;
}

export class Tree {
  private readonly treeEl = document.querySelector<HTMLElement>('#tree')!;
  private readonly treeSvgEl = document.querySelector<SVGElement>('#treeSvg')!;

  private jewels: JewelPlaced[] = [];

  constructor() {
    if (this.treeEl == null || this.treeSvgEl == null) {
      throw new Error('cannot find expected HTML elements');
    }
  }

  reset() {
    this.treeSvgEl.textContent = '';
    this.jewels = [];
  }

  show() {
    positionJewels(this.jewels);

    // first add branches so they're behind all the jewels
    for (const { x, y } of this.jewels) {
      this.treeSvgEl.append(branchTo(x, y));
    }

    // then the jewels
    for (const { jewel, flip, el, x, y } of this.jewels) {
      setAttr(el, 'x', x);
      setAttr(el, 'y', y);
      setAttr(
        el,
        'transform',
        `${flip ? `rotate(90 ${x} ${y})` : ''} translate(${-jewel.w / 2}, ${-jewel.h / 2})`
      );

      this.treeSvgEl.append(el);
    }
  }

  addJewel(jewel: Jewel, flip: boolean) {
    const jewelEl = svg('image', {
      href: jewel.svg,
      width: jewel.w,
      height: jewel.h,
    });

    jewelEl.classList.add('jewel', 'shadow');

    this.jewels.push({ jewel, flip, x: 0, y: 0, el: jewelEl });

    return jewelEl;
  }
}

function svg(name: string, attrs: Record<string, unknown>) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttributeNS(null, key, String(value));
  }
  return el;
}

function branchTo(x: number, y: number) {
  return svg('path', {
    class: 'branch',
    d: `M 4.9,9.5 Q 5,5 ${x},${y} Q 5,5 5.1,9.5 z`,
  });
}

function setAttr(el: SVGElement, name: string, val: unknown) {
  el.setAttributeNS(null, name, String(val));
}

// position the given jewels on the 10x10 grid, at least 2 away from the border
function positionJewels(jewels: JewelPlaced[]) {
  for (const placement of jewels) {
    placement.x = Math.random() * 10;
    placement.y = Math.random() * 10;
  }

  const all = jewels.length;
  if (all === 0) return;

  let next = 0;

  if (all >= 5) {
    jewels[next]!.x = 5;
    jewels[next]!.y = 5;
    next += 1;
  }

  if (all >= 8) {
    jewels[next]!.x = 5;
    jewels[next]!.y = 8;
    next += 1;
  }

  const rest = all - next;
  const angleStep = 360 / (rest + 1);

  let angle;

  // odd start at 0, even start at angleStep/2
  if (rest % 2 > 0) {
    setNextToAngle(0);
    angle = angleStep;
  } else {
    angle = angleStep / 2;
  }

  while (next < all) {
    setNextToAngle(angle);
    setNextToAngle(-angle);
    angle += angleStep;
  }

  function setNextToAngle(a: number) {
    const rad = (a / 180) * Math.PI;
    jewels[next]!.x = 5 + Math.sin(rad) * 3;
    jewels[next]!.y = 5 - Math.cos(rad) * 3;
    next += 1;
  }
}
