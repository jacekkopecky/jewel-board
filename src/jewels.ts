import { selectRandom } from './lib.js';

export interface Jewel {
  w: number;
  h: number;
  svg: string;
  el?: Element;
  treeEl?: Element;
}

export const jewels: Jewel[] = [
  { w: 1, h: 2, svg: 'svgs/1x2-aqua.svg' },
  { w: 1, h: 2, svg: 'svgs/1x2-purple.svg' },
  { w: 1, h: 2, svg: 'svgs/1x2-black.svg' },
  { w: 1, h: 3, svg: 'svgs/1x3-blue.svg' },
  { w: 1, h: 3, svg: 'svgs/1x3-dark-red.svg' },
  { w: 1, h: 3, svg: 'svgs/1x3-turquoise.svg' },
  { w: 1, h: 3, svg: 'svgs/1x3-gold.svg' },
  { w: 2, h: 2, svg: 'svgs/2x2-yellow.svg' },
  { w: 2, h: 2, svg: 'svgs/2x2-orange.svg' },
  { w: 2, h: 2, svg: 'svgs/2x2-green-triangle.svg' },
  { w: 2, h: 2, svg: 'svgs/2x2-blue.svg' },
  { w: 2, h: 3, svg: 'svgs/2x3-purple.svg' },
  { w: 2, h: 3, svg: 'svgs/2x3-pink.svg' },
  { w: 2, h: 3, svg: 'svgs/2x3-blue.svg' },
];

export function selectJewels(areaSizes: number[]): Jewel[] {
  return areaSizes.map((size) => {
    const jewelsOfSize = jewels.filter((j) => j.w * j.h === size);
    // clone it so we can set el and shadow el for it
    return { ...selectRandom(jewelsOfSize) };
  });
}

export function preloadJewels() {
  for (const jewel of jewels) {
    const img = document.createElement('img');
    img.src = jewel.svg;
    img.className = 'preload';
    document.body.append(img);
  }
}
