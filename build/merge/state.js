import { findJewelMergeLevel, getMergedJewel, isSame } from '../jewels.js';
const LOCAL_STORAGE_KEY = 'jewel-board-merge';
const STARTING_MOVES = 12;
const MOVES_PER_DAY = 5;
export class State {
    _moves = STARTING_MOVES;
    timeStarted = new Date().setHours(0, 0, 0, 0);
    daysSeen = 0;
    currentGame;
    get jewelsPlaced() {
        if (!this.currentGame)
            throw new Error('state not initialized yet');
        return this.currentGame.jewelsPlaced;
    }
    get moves() {
        return this._moves;
    }
    get size() {
        if (!this.currentGame)
            throw new Error('state not initialized yet');
        return this.currentGame.size;
    }
    get highestLevel() {
        if (!this.currentGame)
            throw new Error('state not initialized yet');
        return this.currentGame.highestLevel;
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
        if (!retval.currentGame) {
            retval.newGame();
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
    newGame() {
        this.currentGame = {
            size: 5,
            jewelsPlaced: [],
            highestLevel: -1,
        };
        this.save();
    }
    recomputeHighestLevel() {
        if (!this.currentGame)
            throw new Error('state not initialized yet');
        const highest = Math.max(...this.currentGame.jewelsPlaced.map((j) => findJewelMergeLevel(j.jewel)));
        this.currentGame.highestLevel = highest;
    }
    moveJewel(fromX, fromY, toX, toY) {
        if (!this.currentGame)
            throw new Error('state not initialized yet');
        if (fromX === toX && fromY === toY)
            return false;
        if (fromX < 0 || fromX >= this.size || fromY < 0 || fromY >= this.size) {
            console.warn('moving out of bounds, why?', { fromX, fromY, toX, toY });
            return false;
        }
        const fromPlacement = this.currentGame.jewelsPlaced.find((p) => p.position[0] === fromX && p.position[1] === fromY);
        if (!fromPlacement) {
            console.warn("moving a jewel that doesn't exist, why?", fromX, fromY);
            return false;
        }
        const toPlacement = this.currentGame.jewelsPlaced.find((p) => p.position[0] === toX && p.position[1] === toY);
        if (!toPlacement) {
            fromPlacement.position[0] = toX;
            fromPlacement.position[1] = toY;
            this.save();
            return true;
        }
        if (isSame(fromPlacement.jewel, toPlacement.jewel)) {
            this.currentGame.jewelsPlaced = this.currentGame.jewelsPlaced.filter((p) => p !== fromPlacement);
            toPlacement.jewel = getMergedJewel(fromPlacement.jewel);
            this.save();
            return true;
        }
        else {
            // swap places
            const pos = [...fromPlacement.position];
            fromPlacement.position[0] = toPlacement.position[0];
            fromPlacement.position[1] = toPlacement.position[1];
            toPlacement.position[0] = pos[0];
            toPlacement.position[1] = pos[1];
            this.save();
            return true;
        }
    }
    addJewel(x, y, jewel) {
        if (this._moves > 0 &&
            !this.jewelsPlaced.find(({ position }) => position[0] == x && position[1] == y)) {
            this.currentGame.jewelsPlaced.push({ jewel, position: [x, y] });
            this._moves -= 1;
            this.save();
            return true;
        }
        else {
            return false;
        }
    }
    save() {
        this.recomputeHighestLevel();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this));
    }
}
//# sourceMappingURL=state.js.map