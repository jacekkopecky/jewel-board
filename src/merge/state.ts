import { findJewelMergeLevel, getMergedJewel, isSame, type Jewel } from '../jewels.js';

import { JewelPlaced, Pos } from './jewel-board.js';

const LOCAL_STORAGE_KEY = 'jewel-board-merge';

const STARTING_MOVES = 12;
const HOURS_PER_MOVE = 3;

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
  moveJewel(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): { moved?: boolean; merged?: Jewel };
  addJewel(x: number, y: number, jewel: Jewel): JewelPlaced | null;
  addBonusMoves(num: number): void;
}

export class State {
  private _moves = STARTING_MOVES;
  private timeStarted = getCurrentHour();
  private hoursSeen = 0;

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

        // fix up jewel types which may be missing in the state
        if (retval.currentGame) {
          for (const jewelPlaced of retval.currentGame?.jewelsPlaced) {
            jewelPlaced.jewel.type ??= 'jewel';
          }
        }
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
    if (hoursSinceStart > this.hoursSeen) {
      const movesToAdd = Math.floor((hoursSinceStart - this.hoursSeen) / HOURS_PER_MOVE);
      if (movesToAdd > 0) {
        this._moves += movesToAdd;
        this.hoursSeen += movesToAdd * HOURS_PER_MOVE;

        this.save();
      }
    }
  }

  addBonusMoves(num: number) {
    this._moves += num;
    this.save();
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

  moveJewel(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): { moved?: boolean; merged?: Jewel } {
    if (!this.currentGame) throw new Error('state not initialized yet');

    if (fromX === toX && fromY === toY) return {};
    if (fromX < 0 || fromX >= this.size || fromY < 0 || fromY >= this.size) {
      console.warn('moving out of bounds, why?', { fromX, fromY, toX, toY });
      return {};
    }

    const fromJewel = this.currentGame.jewelsPlaced.find(
      (p) => p.position[0] === fromX && p.position[1] === fromY
    );
    if (!fromJewel) {
      console.warn("moving a jewel that doesn't exist, why?", fromX, fromY);
      return {};
    }

    const toJewel = this.currentGame.jewelsPlaced.find(
      (p) => p.position[0] === toX && p.position[1] === toY
    );

    if (!toJewel) {
      fromJewel.position[0] = toX;
      fromJewel.position[1] = toY;
      this.save();
      return { moved: true };
    }

    if (isSame(fromJewel.jewel, toJewel.jewel)) {
      this.currentGame.jewelsPlaced = this.currentGame.jewelsPlaced.filter((p) => p !== fromJewel);
      const mergedJewel = getMergedJewel(fromJewel.jewel);
      if (mergedJewel) {
        toJewel.jewel = mergedJewel;
      } else {
        this.currentGame.jewelsPlaced = this.currentGame.jewelsPlaced.filter((p) => p !== toJewel);
      }
      this.save();
      return { moved: true, merged: fromJewel.jewel };
    } else {
      // swap places
      const pos: Pos = [...fromJewel.position];
      fromJewel.position[0] = toJewel.position[0];
      fromJewel.position[1] = toJewel.position[1];
      toJewel.position[0] = pos[0];
      toJewel.position[1] = pos[1];
      this.save();
      return { moved: true };
    }
  }

  addJewel(x: number, y: number, jewel: Jewel): JewelPlaced | null {
    if (!jewel) return null;
    if (
      this._moves > 0 &&
      !this.jewelsPlaced.find(({ position }) => position[0] == x && position[1] == y)
    ) {
      const newlyPlaced: JewelPlaced = { jewel, position: [x, y] };
      this.currentGame!.jewelsPlaced.push(newlyPlaced);
      this._moves -= 1;
      this.save();
      return newlyPlaced;
    } else {
      return null;
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
