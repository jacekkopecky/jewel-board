import { selectRandom } from './lib.js';

export interface Jewel {
  w: number;
  h: number;
  svg: string;
  el?: HTMLElement;
  shadowEl?: HTMLElement;
}

export const jewels: Jewel[] = [
  { w: 2, h: 2, svg: 'svgs/2x2-green-triangle.svg' },
  { w: 1, h: 3, svg: 'svgs/1x3-blue.svg' },
  { w: 1, h: 2, svg: 'svgs/1x2-aqua.svg' },
  { w: 2, h: 2, svg: 'svgs/2x2-yellow.svg' },
];

export function selectJewels(areaSizes: number[]) {
  return areaSizes.map((size) => {
    const jewelsOfSize = jewels.filter((j) => j.w * j.h === size);
    return selectRandom(jewelsOfSize);
  });
}
