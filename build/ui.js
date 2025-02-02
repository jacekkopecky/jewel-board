import { Cladding } from './cladding.js';
import { delay, delayInterruptible, percent } from './lib.js';
import { BONUS_MOVES_PER_JEWEL } from './state.js';
import { Tree } from './tree.js';
const CLASS_UNCOVERED = 'uncovered';
export class UI {
    state;
    jewelsEl = document.querySelector('#jewels');
    movesCountEl = document.querySelector('#movesCount');
    moveBonusFloatEl = document.querySelector('#moveBonusFloat');
    replayEl = document.querySelector('#replay');
    inert = false;
    tree = new Tree();
    cladding = new Cladding((x, y) => !this.inert && this.uncoverTile(x, y));
    constructor(state) {
        this.state = state;
        if (this.jewelsEl == null ||
            this.movesCountEl == null ||
            this.moveBonusFloatEl == null ||
            this.replayEl == null) {
            throw new Error('cannot find expected HTML elements');
        }
    }
    static async show(state) {
        const ui = new UI(state);
        await ui.doShow();
        return ui;
    }
    async replay(state) {
        try {
            const ui = new UI(state);
            await ui.doShow(true, async (delayFn) => {
                this.cladding.regenerate();
                await this.cladding.coverAllSlowly(delayFn, 2000);
            });
        }
        catch {
            // ignoring the exception, it must come from the replay being interrupted
        }
        // back to this - the original state
        await this.doShow();
        this.viewMoveCount();
    }
    async doShow(replaying = false, onDone) {
        const size = this.state.size;
        this.inert = true;
        this.cladding.generate(size);
        this.tree.reset();
        // put jewels in
        this.jewelsEl.textContent = '';
        for (const { jewel, position, flip } of this.state.jewelsPlaced) {
            const img = createJewelImg(jewel, position, flip, size);
            const shadow = this.tree.addJewel(jewel, flip);
            this.jewelsEl.append(img);
            jewel.el = img;
            jewel.treeEl = shadow;
        }
        this.tree.show();
        if (replaying) {
            this.viewMoveCount(false, 'replaying');
        }
        else {
            this.viewMoveCount(true);
        }
        const replayDelay = replaying ? 500 : 100;
        const delayFn = delayInterruptible();
        this.updateReplayButton(replaying, delayFn);
        if (replaying) {
            this.cladding.uncoverAll();
            await delayFn(replayDelay * 4);
            this.cladding.coverAll();
            await delayFn(replayDelay);
        }
        for (const [x, y] of this.state.uncoveredTiles) {
            await delayFn(replayDelay);
            this.uncoverTile(x, y, true);
        }
        if (replaying) {
            await delayFn(replayDelay * 4);
            await onDone?.(delayFn);
        }
        this.inert = replaying;
    }
    updateReplayButton(replaying, delayFn) {
        this.replayEl.classList.toggle('hidden', this.state.getPreviousState() == null);
        this.replayEl.classList.toggle('cancel', replaying);
        // set onclick so there can only be one handler
        this.replayEl.onclick = () => {
            if (replaying) {
                delayFn.interrupt();
            }
            else {
                const previousState = this.state.getPreviousState();
                if (previousState && !this.inert)
                    this.replay(previousState);
            }
        };
    }
    previousMoveCount = -1;
    viewMoveCount(showZero = false, message = 'play more tomorrow') {
        const moves = this.state.moves;
        const showTomorrow = !moves && !showZero;
        this.movesCountEl.textContent = showTomorrow ? message : String(this.state.moves);
        this.movesCountEl.classList.toggle('tomorrow', showTomorrow);
        if (this.previousMoveCount > -1 && moves > this.previousMoveCount) {
            const span = document.createElement('span');
            span.textContent = `+${moves - this.previousMoveCount}`;
            this.moveBonusFloatEl.append(span);
            setTimeout(() => span.remove(), 3000);
        }
        this.previousMoveCount = moves;
    }
    uncoverTile(x, y, replaying = false) {
        if (this.state.moves <= 0 && !replaying) {
            return;
        }
        this.cladding.uncover(x, y);
        if (!replaying) {
            this.state.addFlippedTile(x, y);
        }
        let { allUncovered, anyUncovered } = this.checkFullyUncoveredJewels(replaying);
        if (!replaying) {
            this.viewMoveCount(anyUncovered);
        }
        if (allUncovered)
            this.nextGame();
    }
    async nextGame() {
        this.inert = true;
        // make sure all tiles show as uncovered now
        this.cladding.uncoverAll();
        await delay(2000);
        this.state.newPuzzle();
        this.cladding.generate(this.state.size);
        await this.cladding.coverAllSlowly();
        // reset view
        this.doShow();
        this.inert = false;
    }
    checkFullyUncoveredJewels(replaying) {
        let allUncovered = !replaying;
        let anyUncovered = false;
        for (const { jewel, position, flip } of this.state.jewelsPlaced) {
            if (!jewel.el || !jewel.treeEl)
                continue; // jewel not on board
            if (jewel.el.classList.contains(CLASS_UNCOVERED))
                continue; // already uncovered
            const [w, h] = flip ? [jewel.h, jewel.w] : [jewel.w, jewel.h];
            const [px, py] = position;
            if (this.cladding.isAreaUncovered(px, py, w, h)) {
                jewel.el.classList.add(CLASS_UNCOVERED);
                jewel.treeEl.classList.add(CLASS_UNCOVERED);
                if (!replaying) {
                    anyUncovered = true;
                    // extra move as reward for uncovering a whole jewel
                    // if the user quickly reloads before getting the bonus, they lose it
                    setTimeout(() => {
                        this.state.addBonusMoves(BONUS_MOVES_PER_JEWEL);
                        this.viewMoveCount();
                    }, 1000);
                }
            }
            else {
                allUncovered = false;
            }
        }
        return { allUncovered, anyUncovered };
    }
}
function createJewelImg(jewel, position, flip, size) {
    let { w, h, svg } = jewel;
    const [x, y] = position;
    const [wf, hf] = flip ? [h, w] : [w, h];
    const img = document.createElement('img');
    img.src = svg;
    img.classList.add('jewel');
    img.style.top = percent((y + hf / 2) / size);
    img.style.left = percent((x + wf / 2) / size);
    if (flip)
        img.classList.add('flip');
    img.style.width = percent(w / size);
    img.style.height = percent(h / size);
    return img;
}
//# sourceMappingURL=ui.js.map