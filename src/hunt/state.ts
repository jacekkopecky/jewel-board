import { selectJewels } from '../jewels.js';

import { Board, JewelPlaced, Pos } from './jewel-board.js';
import { templates } from './templates.js';

const LOCAL_STORAGE_KEY = 'jewel-board';

const STARTING_MOVES = 12;
const MOVES_PER_DAY = 5;
export const BONUS_MOVES_PER_JEWEL = 1;

interface Game {
  size: number;
  jewelsPlaced: JewelPlaced[];
  uncoveredTiles: Pos[];
}

export interface StateInterface {
  get jewelsPlaced(): readonly Readonly<JewelPlaced>[];
  get uncoveredTiles(): readonly (readonly [x: number, y: number])[];
  get size(): number;
  get moves(): number;

  updateMoves(): void;
  addBonusMoves(num: number): void;
  newPuzzle(): void;
  addFlippedTile(x: number, y: number): void;
  getPreviousState(): StateInterface | undefined;
}

export class State {
  private _moves = STARTING_MOVES;
  private timeStarted = new Date().setHours(0, 0, 0, 0);
  private daysSeen = 0;

  private puzzleNumber = -1;
  private currentGame?: Game;
  private previousGame?: Game;

  get jewelsPlaced(): readonly Readonly<JewelPlaced>[] {
    if (!this.currentGame) throw new Error('state not initialized yet');
    return this.currentGame.jewelsPlaced;
  }
  get uncoveredTiles(): readonly Readonly<Pos>[] {
    if (!this.currentGame) throw new Error('state not initialized yet');
    return this.currentGame.uncoveredTiles;
  }
  get moves() {
    return this._moves;
  }
  get size() {
    if (!this.currentGame) throw new Error('state not initialized yet');
    return this.currentGame.size;
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

    if (retval.puzzleNumber < 0 || !retval.currentGame) {
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

  addBonusMoves(num: number) {
    this._moves += num;
    this.save();
  }

  newPuzzle() {
    this.puzzleNumber += 1;

    const template = templates[this.puzzleNumber % templates.length]!;

    const jewels = selectJewels(template.jewelSizes);
    const placement = new Board(template.size).tryPlacing(jewels);

    if (!placement) {
      throw new Error(`cannot place jewels for template ${JSON.stringify(template, null, 2)}`);
    }

    if (this.currentGame) this.previousGame = this.currentGame;

    this.currentGame = {
      size: template.size,
      uncoveredTiles: [],
      jewelsPlaced: placement,
    };

    this.save();
  }

  addFlippedTile(x: number, y: number) {
    if (!this.currentGame) throw new Error('state not initialized yet');

    if (this.currentGame.uncoveredTiles.some(([tx, ty]) => tx === x && ty == y)) {
      console.warn('adding an already flipped tile, why?', this, { x, y });
    } else if (this._moves <= 0) {
      console.warn('should not uncover when no moves available');
    } else {
      this.currentGame.uncoveredTiles.push([x, y]);
      this._moves -= 1;
      this.save();
    }
  }

  private save(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this));
  }

  getPreviousState(): StateInterface | undefined {
    return this.previousGame ? new ReadonlyState(this.previousGame) : undefined;
  }
}

class ReadonlyState implements StateInterface {
  constructor(private game: Game) {}

  get jewelsPlaced(): readonly Readonly<JewelPlaced>[] {
    return this.game.jewelsPlaced;
  }
  get uncoveredTiles(): readonly (readonly [x: number, y: number])[] {
    return this.game.uncoveredTiles;
  }
  get size(): number {
    return this.game.size;
  }

  get moves(): number {
    return 0;
  }
  getPreviousState() {
    return this;
  }
  updateMoves() {}
  addBonusMoves() {}
  newPuzzle() {}
  addFlippedTile() {}
}
