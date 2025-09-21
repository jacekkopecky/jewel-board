import { Jewel } from '../jewels.js';

// export let tryPlacingCount = 0;

export type Pos = [x: number, y: number];

// todo make JewelPlaced just add x,y to Jewel
export interface JewelPlaced {
  jewel: Jewel;
  position: Pos;
}
