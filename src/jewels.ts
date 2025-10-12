import { selectRandom } from './lib.js';

export type JewelType = 'jewel' | 'coin';

export interface Jewel {
  w: number;
  h: number;
  svg: string;
  type: JewelType;
  el?: HTMLImageElement;
  treeEl?: Element;
  upsideDown?: boolean;
}

export const jewels: Jewel[] = [
  { w: 1, h: 2, type: 'jewel', svg: 'svgs/1x2-aqua.svg' },
  { w: 1, h: 2, type: 'jewel', svg: 'svgs/1x2-purple.svg' },
  { w: 1, h: 2, type: 'jewel', svg: 'svgs/1x2-black.svg' },
  { w: 1, h: 3, type: 'jewel', svg: 'svgs/1x3-blue.svg' },
  { w: 1, h: 3, type: 'jewel', svg: 'svgs/1x3-turquoise.svg' },
  { w: 1, h: 3, type: 'jewel', svg: 'svgs/1x3-gold.svg' },
  { w: 1, h: 3, type: 'jewel', svg: 'svgs/1x3-dark-red.svg' },
  { w: 2, h: 2, type: 'jewel', svg: 'svgs/2x2-orange.svg' },
  { w: 2, h: 2, type: 'jewel', svg: 'svgs/2x2-yellow.svg' },
  { w: 2, h: 2, type: 'jewel', svg: 'svgs/2x2-green-triangle.svg' },
  { w: 2, h: 2, type: 'jewel', svg: 'svgs/2x2-green-triangle-b.svg', upsideDown: true },
  { w: 2, h: 2, type: 'jewel', svg: 'svgs/2x2-blue.svg' },
  { w: 2, h: 3, type: 'jewel', svg: 'svgs/2x3-pink.svg' },
  { w: 2, h: 3, type: 'jewel', svg: 'svgs/2x3-purple.svg' },
  { w: 2, h: 3, type: 'jewel', svg: 'svgs/2x3-purple-b.svg', upsideDown: true },
  { w: 2, h: 3, type: 'jewel', svg: 'svgs/2x3-blue.svg' },
  { w: 3, h: 3, type: 'jewel', svg: 'svgs/3x3-white.svg' },
];

export const mergeJewels = jewels.filter((j) => !j.upsideDown);

export const coins: Jewel[] = [
  { w: 2, h: 2, type: 'coin', svg: 'svgs/coin1.svg' },
  { w: 2, h: 2, type: 'coin', svg: 'svgs/coin2.svg' },
  { w: 2, h: 2, type: 'coin', svg: 'svgs/coin3.svg' },
];

export function selectJewels(areaSizes: number[]): Jewel[] {
  return areaSizes.map((size) => {
    const jewelsOfSize = jewels.filter((j) => j.w * j.h === size);
    // clone it so we can set el and shadow el for it
    return clone(selectRandom(jewelsOfSize));
  });
}

export function isSame(j1?: Jewel, j2?: Jewel): boolean {
  if (j1 === j2) return true;
  if (!j1 || !j2) return false;
  return j1.w === j2.w && j1.h === j2.h && j1.svg === j2.svg && j1.type === j2.type;
}

export function clone(j: undefined): undefined;
export function clone(j: Jewel): Jewel;
export function clone(j?: Jewel): Jewel | undefined;
export function clone(j?: Jewel): Jewel | undefined {
  if (j == null) return j;
  return {
    w: j.w,
    h: j.h,
    svg: j.svg,
    type: j.type,
  };
}

export function preloadJewels() {
  for (const jewel of jewels) {
    const img = document.createElement('img');
    img.src = jewel.svg;
    img.className = 'preload';
    document.body.append(img);
  }
}

export function selectByProbability(arr: Jewel[], probabilities: number[] = [1]): Jewel {
  if (arr.length < probabilities.length) {
    throw new Error('there must be at least as many probabilities as jewels');
  }

  const r = Math.random();
  for (let i = 0; i < probabilities.length; i++) {
    const p = probabilities[i]!;
    if (r <= p) {
      return clone(arr[i]!);
    }
  }

  throw new Error('probabilities should end with 1');
}

export function getMergedJewel(mergingJewel: Jewel): Jewel | undefined {
  const level = findJewelMergeLevel(mergingJewel);
  if (level > -1) {
    return clone(mergeJewels[level + 1] || mergeJewels[0]!);
  }

  const coinLevel = coins.findIndex((c) => isSame(c, mergingJewel));
  return clone(coins[coinLevel + 1]);
}

export function findJewelMergeLevel(jewel: Jewel): number {
  return mergeJewels.findIndex((j) => isSame(j, jewel));
}
