export let tryPlacingCount = 0;

export class Board {
  size = 0;
  board = [];

  constructor(sizeOrBoard) {
    if (sizeOrBoard instanceof Board) {
      this.size = sizeOrBoard.size;
      this.board = sizeOrBoard.board.slice();
    } else {
      this.size = sizeOrBoard;
      this.board = new Array(this.size * this.size);
    }
  }

  put(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      this.board[x + y * this.size] = true;
    }
  }

  // outside of bounds, it pretends there's something there
  get(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.board[x + y * this.size];
    } else {
      return true;
    }
  }

  withJewel(jewel, position, flip) {
    const newBoard = new Board(this);
    let [w, h] = jewel;
    const [xp, yp] = position;
    if (flip) [w, h] = [h, w];
    for (let x = 0; x < w; x += 1) {
      for (let y = 0; y < h; y += 1) {
        newBoard.put(x + xp, y + yp);
      }
    }
    return newBoard;
  }

  canPlace(jewel, position) {
    const [xp, yp] = position;
    const [w, h] = jewel;
    for (let x = 0; x < w; x += 1) {
      for (let y = 0; y < h; y += 1) {
        if (this.get(x + xp, y + yp)) return false;
      }
    }
    return true;
  }

  // returns {position, flip}[]
  computeAllowedPositions(jewel) {
    const positions = [];
    const [w, h] = jewel;
    for (let x = 0; x < this.size; x += 1) {
      for (let y = 0; y < this.size; y += 1) {
        const position = [x, y];
        if (this.canPlace(jewel, position)) {
          positions.push({ position: position });
        }
        if (h !== w && this.canPlace([h, w], position)) {
          positions.push({ position: position, flip: true });
        }
      }
    }
    return positions;
  }

  // tryPlacing(jewels) {
  //   console.log('trying to place', jewels);
  //   console.log(this.toString().trim());
  //   const retval = this.tryPlacing2(jewels);
  //   console.log(retval, '\n');
  //   return retval;
  // }

  tryPlacing(jewels) {
    tryPlacingCount += 1;
    if (jewels.length === 0) return []; // all placed
    const [jewel, ...rest] = jewels;
    const allowedPositions = this.computeAllowedPositions(jewel);

    while (allowedPositions.length > 0) {
      const index = Math.floor(Math.random() * allowedPositions.length);
      const { position, flip } = allowedPositions[index];
      const newBoard = this.withJewel(jewel, position, flip);
      const placed = newBoard.tryPlacing(rest);
      if (placed) {
        return [{ jewel, position, flip }, ...placed];
      } else {
        allowedPositions.splice(index, 1);
      }
    }
    return undefined; // not placed
  }

  toString() {
    let retval = '';
    for (let y = 0; y < this.size; y += 1) {
      retval += '>';
      for (let x = 0; x < this.size; x += 1) {
        retval += this.get(x, y) ? 'x' : ' ';
      }
      retval += '<\n';
    }
    return retval;
  }
}
