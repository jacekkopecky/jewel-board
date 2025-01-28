# jewel board

find jewels (of known shapes) by uncovering tiles

you get one uncover per day

## todo

- [x] add a "tree" (box for now) or gray and dim jewels
- [x] load state from localStorage:
  - [x] how many tiles to open we have
  - [x] add to the above how many days it's been since started minus days seen
  - [x] update days seen to how many days it's been since started
  - [x] save in localStorage
  - [x] storage also contains:
    - [x] puzzle number we're on (number guiding puzzle selection)
    - [x] jewel placement
    - [x] flipped tiles
- [x] or initialize it:
  - 100 tiles to open
  - 0 days seen
  - date started today (last midnight)
  - we're on puzzle 0
  - newPuzzle()
  - remember placement in localStorage
  - increase puzzle in localStorage
- [x] newPuzzle()
  - empty flipped tiles
  - choose puzzle template with puzzleCount % templates.length
  - template says size and areas of jewels to select, e.g. 4; 2,2,3,4
- [x] initial animation: flip flipped tiles in order, quickly
- [x] move uncovered jewels to tree
- [x] show a state
  - replace cladding
  - place jewels on board
- [x] on click
  - remove 1 from tiles to open, save
  - flip tile, add it to flipped tiles, save
- [x] if all jewels are fully uncovered, newPuzzle, plus 1 move
- [x] tree of jewels so you know what to look for
  - hang jewels on a tree but in grey and dim, remember the tree in localStorage
  - move jewels from board to tree when fully uncovered
  - [x] fix moves indicator background
  - [x] give branches an outline, maybe little off-shoots?
- [x] BUG: repeated reload after a day shouldn't give me extra moves
- [x] give move counter block a min width so 999 fits without making it bigger
- [x] show an animated rising +1 (or +whatever) when we get an extra move
- [ ] make the jewels on the tree smaller still when not uncovered, then they can grow (but it's not
      just a simple CSS, so maybe not)
- [ ] let the jewels fall off the tree
  - shake the jewels off the tree, add them to a score in state
- [ ] make more jewels, use this for inspiration: https://c7.alamy.com/comp/2BP2WMA/2BP2WMA.jpg

## maybes

- [ ] clicking with 0 moves could show how long until next move is available
- [ ] select one type of jewel from a bag of the same size so the shape is unambiguous
- [ ] handle the case when the selected jewels cannot be placed
