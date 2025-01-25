# jewel board

find jewels (of known shapes) by uncovering tiles

you get one uncover per day

## todo

- [ ] add a "tree" (box for now) or gray and dim jewels
- [ ] load state from localStorage:
  - how many tiles we have
  - add to the above how many days it's been since started minus days seen
  - update days seen to how many days it's been since started
  - save in localStorage
  - storage also contains:
    - puzzle number we're on (number guiding puzzle selection)
    - jewel placement
    - flipped tiles
  - initial animation: flip flipped tiles in order, quickly
  - move uncovered jewels to tree
- [ ] or initialize it:
  - 100 tiles to open
  - 0 days seen
  - date started today (past midnight)
  - we're on puzzle 0
  - newPuzzle()
- [ ] newPuzzle()
  - empty flipped tiles
  - choose puzzle template with puzzleCount % templates.length
  - template says size and areas of jewels to select, e.g. 4; 2,2,3,4
  - replace cladding
  - place jewels on board
  - remember placement in localStorage
  - increase puzzle in localStorage
- [ ] on click
  - remove 1 from tiles to open, save
  - flip tile, add it to flipped tiles, save
  - if all jewels are fully uncovered, newPuzzle
- [ ] tree of jewels so you know what to look for
  - hang jewels on a tree but in grey and dim, remember the tree in localStorage
  - move jewels from board to tree when fully uncovered

## maybes

- [ ] select one type of jewel from a bag of the same size so the shape is unambiguous
- [ ] handle the case when the selected jewels cannot be placed
