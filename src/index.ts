// import { Board } from './jewel-board.js';
// import { jewels } from './jewels.js';
// import { percent, selectRandom } from './lib.js';
import { State } from './state.js';
import { UI } from './ui.js';

window.addEventListener('load', () => {
  const state = State.load();

  UI.show(state);
});
