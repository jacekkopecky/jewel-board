// maybe position same-area jewels symmetrically
// one jewel in the middle, the rest in a circle?
// show branches that hold the jewels?
export class Tree {
    treeEl = document.querySelector('#tree');
    treeSvgEl = document.querySelector('#treeSvg');
    jewels = [];
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
        for (const { x, y, angle } of this.jewels) {
            this.treeSvgEl.append(branchTo(x, y, angle));
        }
        // then the jewels
        for (const { jewel, flip, el, x, y } of this.jewels) {
            const { w, h } = scaleJewel(jewel, this.jewels.length);
            setAttr(el, 'x', x);
            setAttr(el, 'y', y);
            setAttr(el, 'width', w);
            setAttr(el, 'height', h);
            setAttr(el, 'transform', `${flip ? `rotate(90 ${x} ${y})` : ''} translate(${-w / 2}, ${-h / 2})`);
            this.treeSvgEl.append(el);
        }
    }
    addJewel(jewel, flip) {
        const jewelEl = svg('image', {
            href: jewel.svg,
        });
        jewelEl.classList.add('jewel', 'shadow');
        this.jewels.push({ jewel, flip, x: 0, y: 0, angle: 0, el: jewelEl });
        return jewelEl;
    }
}
function svg(name, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            el.setAttributeNS(null, key, String(value));
        }
    }
    return el;
}
function branchTo(x, y, angle) {
    const g = svg('g');
    const path = `M 4.9,9.5 Q 5,5 ${x},${y} Q 5,5 5.1,9.5 z`;
    g.append(svg('path', {
        class: 'branchOutline',
        d: path,
    }));
    g.append(svg('path', {
        class: 'branch',
        d: path,
        filter: `brightness(${(Math.abs(angle) - 90) / 400 + 1})`,
    }));
    return g;
}
function setAttr(el, name, val) {
    el.setAttributeNS(null, name, String(val));
}
// position the given jewels on the 10x10 grid, at least 2 away from the border
function positionJewels(jewels) {
    const all = jewels.length;
    if (all === 0)
        return;
    let next = 0;
    if (all >= 5) {
        jewels[next].x = 5;
        jewels[next].y = 5;
        jewels[next].angle = 180;
        next += 1;
    }
    if (all >= 8) {
        jewels[next].x = 5;
        jewels[next].y = 8;
        next += 1;
    }
    const rest = all - next;
    const angleStep = 360 / (rest + 1);
    let angle;
    // odd start at 0, even start at angleStep/2
    if (rest % 2 > 0) {
        setNextToAngle(0);
        angle = angleStep;
    }
    else {
        angle = angleStep / 2;
    }
    while (next < all) {
        setNextToAngle(angle);
        setNextToAngle(-angle);
        angle += angleStep;
    }
    jewels.sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle));
    function setNextToAngle(a) {
        const rad = (a / 180) * Math.PI;
        jewels[next].x = 5 + Math.sin(rad) * 3;
        jewels[next].y = 5 - Math.cos(rad) * 3;
        jewels[next].angle = a;
        next += 1;
    }
}
// make jewels smaller if there's more of them
function scaleJewel(j, num) {
    const scale = 0.93 ** (Math.max(num, 4) - 4);
    return { w: j.w * scale, h: j.h * scale };
}
//# sourceMappingURL=tree.js.map