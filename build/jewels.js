import { selectRandom } from './lib.js';
export const jewels = [
    { w: 1, h: 2, svg: 'svgs/1x2-aqua.svg' },
    { w: 1, h: 2, svg: 'svgs/1x2-purple.svg' },
    { w: 1, h: 3, svg: 'svgs/1x3-blue.svg' },
    { w: 1, h: 3, svg: 'svgs/1x3-dark-red.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-yellow.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-orange.svg' },
    { w: 2, h: 2, svg: 'svgs/2x2-green-triangle.svg' },
    { w: 2, h: 3, svg: 'svgs/2x3-purple.svg' },
];
export function selectJewels(areaSizes) {
    return areaSizes.map((size) => {
        const jewelsOfSize = jewels.filter((j) => j.w * j.h === size);
        // clone it so we can set el and shadow el for it
        return { ...selectRandom(jewelsOfSize) };
    });
}
//# sourceMappingURL=jewels.js.map