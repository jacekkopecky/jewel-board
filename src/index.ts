import { Board } from './jewel-board.js';
import { jewels } from './jewels.js';
import { percent, selectRandom } from './lib.js';

const canvasBoxEl = document.querySelector<HTMLElement>('#canvasBox')!;
const claddingEl = document.querySelector<HTMLElement>('#cladding')!;

const size = 4;

const board = new Board(size);
const jewelsOnBoard = [];
for (let i = 0; i < size; i += 1) {
  jewelsOnBoard.push(selectRandom(jewels));
}

const positions = board.tryPlacing(jewelsOnBoard)!;

console.log(positions);

for (const pos of positions) {
  const { jewel, position, flip } = pos;
  let { w, h, svg } = jewel;
  const [x, y] = position;
  const [wf, hf] = flip ? [h, w] : [w, h];
  const img = document.createElement('img');
  if (svg) img.src = svg;
  img.style.top = percent((y + hf / 2) / size);
  img.style.left = percent((x + wf / 2) / size);
  if (flip) img.classList.add('flip');
  img.style.width = percent(w / size);
  img.style.height = percent(h / size);
  canvasBoxEl.append(img);
}

// @ts-ignore
canvasBoxEl.style.setProperty('--size', String(size));

canvasBoxEl.addEventListener('click', handleClick);
for (let i = 0; i < size * size; i += 1) {
  claddingEl.append(document.createElement('div'));
}

function handleClick(e: MouseEvent) {
  if (e.target instanceof HTMLElement && e.target.matches('#cladding > *')) {
    e.target.classList.add('hidden');
  }
}
