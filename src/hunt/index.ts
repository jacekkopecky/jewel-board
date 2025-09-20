import { preloadJewels } from '../jewels.js';
import { delay } from '../lib.js';

import { State } from './state.js';
import { UI } from './ui.js';

window.addEventListener('load', async () => {
  preloadJewels();

  const state = State.load();

  const ui = await UI.show(state);

  updateMoves();

  document.addEventListener('visibilitychange', updateMoves);

  async function updateMoves() {
    await delay(1000);

    if (document.visibilityState === 'visible') {
      state.updateMoves();
      ui.viewMoveCount();
    }
  }
});
