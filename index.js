import { Board, tryPlacingCount } from './jewel-board.js';
import { jewels } from './jewels.js';

const canvasBoxEl = document.querySelector('#canvasBox');
const claddingEl = document.querySelector('#cladding');

if (!canvasBoxEl || !claddingEl) {
  throw new Error('cannot find elements');
}

const size = 4;

const board = new Board(size);
const jewelsOnBoard = [];
for (let i = 0; i < size; i += 1) {
  jewelsOnBoard.push(selectRandom(jewels));
}

const positions = board.tryPlacing(jewelsOnBoard.map((j) => [j.w, j.h, j]));

console.log(positions);

for (const pos of positions) {
  const { jewel, position, flip } = pos;
  let [w, h, { svg }] = jewel;
  const [x, y] = position;
  const [wf, hf] = flip ? [h, w] : [w, h];
  const img = document.createElement('img');
  img.src = svg;
  img.style.top = percent((y + hf / 2) / size);
  img.style.left = percent((x + wf / 2) / size);
  if (flip) img.classList.add('flip');
  img.style.width = percent(w / size);
  img.style.height = percent(h / size);
  canvasBoxEl.append(img);
}

// @ts-ignore
canvasBoxEl.style.setProperty('--size', String(size));

canvasBoxEl?.addEventListener('click', handleClick);
for (let i = 0; i < size * size; i += 1) {
  claddingEl?.append(document.createElement('div'));
}

function handleClick(e) {
  if (e.target.matches('#cladding > *')) {
    e.target.classList.add('hidden');
  }
}

function selectRandom(arr) {
  return arr[Math.trunc(Math.random() * arr.length)];
}

function percent(num) {
  return `${(num * 100).toFixed(3)}%`;
}
