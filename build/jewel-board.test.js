import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Board } from './jewel-board.js';
describe('jewel-board', () => {
    it('should start empty', () => {
        const board = new Board(5);
        assert.equal(board.toString(), trim(`>     <
            >     <
            >     <
            >     <
            >     <
            `));
    });
    it('should put correctly', () => {
        const board = new Board(5);
        board.put(3, 4);
        board.put(3, 0);
        board.put(3, 0);
        assert.equal(board.toString(), trim(`>   x <
            >     <
            >     <
            >     <
            >   x <
            `));
    });
    it('should get correctly', () => {
        const board = new Board(5);
        assert.equal(board.get(1, 2), undefined);
        board.put(1, 2);
        assert.equal(board.get(1, 2), true);
        // outside of bounds it's always true
        assert.equal(board.get(3, 7), true);
        board.put(3, 7);
        assert.equal(board.get(3, 7), true);
    });
    it('should clone with withJewel()', () => {
        const board = new Board(5);
        const newBoard = board.withJewel({ w: 2, h: 1 }, [1, 3]);
        assert.notEqual(board, newBoard);
        assert.equal(board.toString(), trim(`>     <
            >     <
            >     <
            >     <
            >     <
            `));
        assert.equal(newBoard.toString(), trim(`>     <
            >     <
            >     <
            > xx  <
            >     <
            `));
    });
    it('should check canPlace correctly', () => {
        const board = new Board(5);
        const newBoard = board.withJewel({ w: 2, h: 1 }, [1, 3]);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [0, 0]), true);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [1, 0]), true);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [1, 1]), true);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [3, 2]), true);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [4, 0]), true);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [5, 0]), false);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [1, 2]), true);
        assert.equal(board.canPlace({ w: 1, h: 3 }, [1, 3]), false);
        assert.equal(newBoard.canPlace({ w: 1, h: 3 }, [0, 0]), true);
        assert.equal(newBoard.canPlace({ w: 1, h: 3 }, [1, 0]), true);
        assert.equal(newBoard.canPlace({ w: 1, h: 3 }, [2, 2]), false);
        assert.equal(newBoard.canPlace({ w: 1, h: 3 }, [3, 2]), true);
    });
});
function trim(str) {
    return str
        .split('\n')
        .map((s) => s.trim())
        .join('\n');
}
//# sourceMappingURL=jewel-board.test.js.map