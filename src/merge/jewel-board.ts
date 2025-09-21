import { Jewel } from '../jewels.js';

// export let tryPlacingCount = 0;

export type Pos = [x: number, y: number];

export interface JewelPlaced {
  jewel: Jewel;
  position: Pos;
}
