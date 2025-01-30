// import { Board } from './jewel-board.js';
// import { jewels } from './jewels.js';
// import { percent, selectRandom } from './lib.js';
import { delay } from './lib.js';
import { State } from './state.js';
import { UI } from './ui.js';

window.addEventListener('load', async () => {
  const state = State.load();

  const ui = await UI.show(state);

  await delay(1000);

  state.updateMoves();
  ui.viewMoveCount();
});
