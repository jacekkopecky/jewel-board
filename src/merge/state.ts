import { findJewelMergeLevel, getMergedJewel, isSame, type Jewel } from '../jewels.js';

import { JewelPlaced, Pos } from './jewel-board.js';

const LOCAL_STORAGE_KEY = 'jewel-board-merge';

const STARTING_MOVES = 12;
const MOVES_PER_HOUR = 1;

interface Game {
  size: number;
  jewelsPlaced: JewelPlaced[];
  highestLevel: number;
}

export interface StateInterface {
  get jewelsPlaced(): readonly Readonly<JewelPlaced>[];
  get size(): number;
  get moves(): number;
  get highestLevel(): number;

  updateMoves(): void;
  moveJewel(fromX: number, fromY: number, toX: number, toY: number): boolean;
  addJewel(x: number, y: number, jewel: Jewel): boolean;
}

export class State {
  private _moves = STARTING_MOVES;
  private timeStarted = getCurrentHour();
  private hoursSeen = 0;

  /** @deprecated we now use hoursSeen */
  private daysSeen = 0;

  private currentGame?: Game;

  get jewelsPlaced(): readonly Readonly<JewelPlaced>[] {
    if (!this.currentGame) throw new Error('state not initialized yet');
    return this.currentGame.jewelsPlaced;
  }
  get moves() {
    return this._moves;
  }
  get size() {
    if (!this.currentGame) throw new Error('state not initialized yet');
    return this.currentGame.size;
  }
  get highestLevel(): number {
    if (!this.currentGame) throw new Error('state not initialized yet');
    return this.currentGame.highestLevel;
  }

  static load(): StateInterface {
    const retval = new State();
    try {
      const storedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedStr) {
        const data = JSON.parse(storedStr);
        Object.assign(retval, data);
      }
    } catch (e) {
      console.warn('error loading state from', LOCAL_STORAGE_KEY);
    }

    if (!retval.currentGame) {
      retval.newGame();
    }

    return retval;
  }

  updateMoves() {
    const now = Date.now();
    const hoursSinceStart = Math.floor((now - this.timeStarted) / 1000 / 60 / 60);
    if (!this.hoursSeen && this.daysSeen) {
      this.hoursSeen = this.daysSeen * 24;
    }
    if (hoursSinceStart > this.hoursSeen) {
      this._moves += (hoursSinceStart - this.hoursSeen) * MOVES_PER_HOUR;
      this.hoursSeen = hoursSinceStart;

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

  private recomputeHighestLevel() {
    if (!this.currentGame) throw new Error('state not initialized yet');
    const highest = Math.max(
      ...this.currentGame.jewelsPlaced.map((j) => findJewelMergeLevel(j.jewel))
    );
    this.currentGame.highestLevel = highest;
  }

  moveJewel(fromX: number, fromY: number, toX: number, toY: number): boolean {
    if (!this.currentGame) throw new Error('state not initialized yet');

    if (fromX === toX && fromY === toY) return false;
    if (fromX < 0 || fromX >= this.size || fromY < 0 || fromY >= this.size) {
      console.warn('moving out of bounds, why?', { fromX, fromY, toX, toY });
      return false;
    }

    const fromPlacement = this.currentGame.jewelsPlaced.find(
      (p) => p.position[0] === fromX && p.position[1] === fromY
    );
    if (!fromPlacement) {
      console.warn("moving a jewel that doesn't exist, why?", fromX, fromY);
      return false;
    }

    const toPlacement = this.currentGame.jewelsPlaced.find(
      (p) => p.position[0] === toX && p.position[1] === toY
    );

    if (!toPlacement) {
      fromPlacement.position[0] = toX;
      fromPlacement.position[1] = toY;
      this.save();
      return true;
    }

    if (isSame(fromPlacement.jewel, toPlacement.jewel)) {
      this.currentGame.jewelsPlaced = this.currentGame.jewelsPlaced.filter(
        (p) => p !== fromPlacement
      );
      toPlacement.jewel = getMergedJewel(fromPlacement.jewel);
      this.save();
      return true;
    } else {
      // swap places
      const pos: Pos = [...fromPlacement.position];
      fromPlacement.position[0] = toPlacement.position[0];
      fromPlacement.position[1] = toPlacement.position[1];
      toPlacement.position[0] = pos[0];
      toPlacement.position[1] = pos[1];
      this.save();
      return true;
    }
  }

  addJewel(x: number, y: number, jewel: Jewel) {
    if (
      this._moves > 0 &&
      !this.jewelsPlaced.find(({ position }) => position[0] == x && position[1] == y)
    ) {
      this.currentGame!.jewelsPlaced.push({ jewel, position: [x, y] });
      this._moves -= 1;
      this.save();
      return true;
    } else {
      return false;
    }
  }

  private save(): void {
    this.recomputeHighestLevel();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this));
  }
}

function getCurrentHour() {
  const currentDate = new Date();
  return currentDate.setHours(currentDate.getHours(), 0, 0, 0);
}
