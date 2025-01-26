// maybe position same-area jewels symmetrically
// one jewel in the middle, the rest in a circle?
// show branches that hold the jewels?
export class Tree {
    treeEl = document.querySelector('#tree');
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
    addJewel(jewel, flip) {
        const shadow = document.createElement('img');
        shadow.src = jewel.svg;
        shadow.classList.add('jewel', 'shadow');
        if (flip)
            shadow.classList.add('flip');
        this.treeEl.append(shadow);
        return shadow;
    }
}
//# sourceMappingURL=tree.js.map