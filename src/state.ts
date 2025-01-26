import { Board, JewelPlaced, Pos } from './jewel-board.js';
import { selectJewels } from './jewels.js';
import { templates } from './templates.js';

const LOCAL_STORAGE_KEY = 'jewel-board';

export class State {
  private _moves = 5;
  private timeStarted = new Date().setHours(0, 0, 0, 0);
  private daysSeen = 0;

  private puzzleNumber = -1;
  private _size = 0;
  private _jewelsPlaced: JewelPlaced[] = [];
  private _uncoveredTiles: Pos[] = [];

  get jewelsPlaced(): readonly Readonly<JewelPlaced>[] {
    return this._jewelsPlaced;
  }
  get uncoveredTiles(): readonly Readonly<Pos>[] {
    return this._uncoveredTiles;
  }
  get moves() {
    return this._moves;
  }
  get size() {
    return this._size;
  }

  static load(): State {
    const retval = new State();
    try {
      const storedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedStr) {
        const data = JSON.parse(storedStr);
        Object.assign(retval, data);
        retval.updateMoves();
      }
    } catch (e) {
      console.warn('error loading state from', LOCAL_STORAGE_KEY);
    }

    if (retval.puzzleNumber < 0) {
      retval.newPuzzle();
      retval.save();
    }

    return retval;
  }

  private updateMoves() {
    const now = Date.now();
    const daysSinceStart = Math.trunc((now - this.timeStarted) / 1000 / 60 / 60 / 24);
    if (daysSinceStart > this.daysSeen) {
      this._moves += daysSinceStart - this.daysSeen;
      this.save();
    }
  }

  private newPuzzle() {
    this.puzzleNumber += 1;

    const template = templates[this.puzzleNumber % templates.length]!;
    this._size = template.size;
    this._uncoveredTiles = [];

    const jewels = selectJewels(template.jewelSizes);
    const placement = new Board(this._size).tryPlacing(jewels);
    if (!placement) {
      throw new Error(`cannot place jewels for template ${JSON.stringify(template, null, 2)}`);
    }

    this._jewelsPlaced = placement;
  }

  addFlippedTile(x: number, y: number) {
    if (this._uncoveredTiles.some(([tx, ty]) => tx === x && ty == y)) {
      console.warn('adding an already flipped tile, why?', this, { x, y });
    } else if (this._moves <= 0) {
      console.warn('should not uncover when no moves available');
    } else {
      this._uncoveredTiles.push([x, y]);
      this._moves -= 1;
      this.save();
    }
  }

  private save(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this));
  }
}
