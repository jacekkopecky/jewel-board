import { Board } from './jewel-board.js';
import { selectJewels } from './jewels.js';
import { templates } from './templates.js';
const LOCAL_STORAGE_KEY = 'jewel-board';
const STARTING_MOVES = 12;
const MOVES_PER_DAY = 5;
export const BONUS_MOVES_PER_JEWEL = 1;
export class State {
    _moves = STARTING_MOVES;
    timeStarted = new Date().setHours(0, 0, 0, 0);
    daysSeen = 0;
    puzzleNumber = -1;
    _size = 0;
    _jewelsPlaced = [];
    _uncoveredTiles = [];
    get jewelsPlaced() {
        return this._jewelsPlaced;
    }
    get uncoveredTiles() {
        return this._uncoveredTiles;
    }
    get moves() {
        return this._moves;
    }
    get size() {
        return this._size;
    }
    static load() {
        const retval = new State();
        try {
            const storedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedStr) {
                const data = JSON.parse(storedStr);
                Object.assign(retval, data);
            }
        }
        catch (e) {
            console.warn('error loading state from', LOCAL_STORAGE_KEY);
        }
        if (retval.puzzleNumber < 0) {
            retval.newPuzzle();
        }
        return retval;
    }
    updateMoves() {
        const now = Date.now();
        const daysSinceStart = Math.floor((now - this.timeStarted) / 1000 / 60 / 60 / 24);
        if (daysSinceStart > this.daysSeen) {
            this._moves += (daysSinceStart - this.daysSeen) * MOVES_PER_DAY;
            this.daysSeen = daysSinceStart;
            this.save();
        }
    }
    addBonusMoves(num) {
        this._moves += num;
        this.save();
    }
    newPuzzle() {
        this.puzzleNumber += 1;
        const template = templates[this.puzzleNumber % templates.length];
        this._size = template.size;
        this._uncoveredTiles = [];
        const jewels = selectJewels(template.jewelSizes);
        const placement = new Board(this._size).tryPlacing(jewels);
        if (!placement) {
            throw new Error(`cannot place jewels for template ${JSON.stringify(template, null, 2)}`);
        }
        this._jewelsPlaced = placement;
        this.save();
    }
    addFlippedTile(x, y) {
        if (this._uncoveredTiles.some(([tx, ty]) => tx === x && ty == y)) {
            console.warn('adding an already flipped tile, why?', this, { x, y });
        }
        else if (this._moves <= 0) {
            console.warn('should not uncover when no moves available');
        }
        else {
            this._uncoveredTiles.push([x, y]);
            this._moves -= 1;
            this.save();
        }
    }
    save() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this));
    }
}
//# sourceMappingURL=state.js.map