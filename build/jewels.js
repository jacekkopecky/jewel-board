import { selectRandom } from './lib.js';
export const jewels = [
    { w: 1, h: 2, svg: 'svgs/1x2-aqua.svg' },
    { w: 1, h: 2, svg: 'svgs/1x2-purple.svg' },
    { w: 1, h: 2, svg: 'svgs/1x2-black.svg' },
    { w: 1, h: 3, svg: 'svgs/1x3-blue.svg' },
    { w: 1, h: 3, svg: 'svgs/1x3-turquoise.svg' },
    { w: 1, h: 3, svg: 'svgs/1x3-gold.svg' },
    { w: 1, h: 3, svg: 'svgs/1x3-dark-red.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-orange.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-yellow.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-green-triangle.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-green-triangle-b.svg', upsideDown: true },
    { w: 2, h: 2, svg: 'svgs/2x2-blue.svg' },
    { w: 2, h: 3, svg: 'svgs/2x3-pink.svg' },
    { w: 2, h: 3, svg: 'svgs/2x3-purple.svg' },
    { w: 2, h: 3, svg: 'svgs/2x3-purple-b.svg', upsideDown: true },
    { w: 2, h: 3, svg: 'svgs/2x3-blue.svg' },
    { w: 3, h: 3, svg: 'svgs/3x3-white.svg' },
];
export function selectJewels(areaSizes) {
    return areaSizes.map((size) => {
        const jewelsOfSize = jewels.filter((j) => j.w * j.h === size);
        // clone it so we can set el and shadow el for it
        return clone(selectRandom(jewelsOfSize));
    });
}
export function isSame(j1, j2) {
    return j1.w === j2.w && j1.h === j2.h && j1.svg === j2.svg;
}
function clone(j) {
    return {
        w: j.w,
        h: j.h,
        svg: j.svg,
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
export const mergeJewels = jewels.filter((j) => !j.upsideDown);
export function selectMergeJewel(probabilities = [1]) {
    const r = Math.random();
    for (let i = 0; i < probabilities.length; i++) {
        const p = probabilities[i];
        if (r <= p) {
            return clone(mergeJewels[i]);
        }
    }
    throw new Error('probabilities should end with 1');
}
export function getMergedJewel(mergingJewel) {
    const level = findJewelMergeLevel(mergingJewel);
    return clone(mergeJewels[level + 1] || mergeJewels[0]);
}
export function findJewelMergeLevel(jewel) {
    return mergeJewels.findIndex((j) => j.svg === jewel.svg);
}
//# sourceMappingURL=jewels.js.map