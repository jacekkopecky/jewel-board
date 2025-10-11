# jewel board

find jewels (of known shapes) by uncovering tiles

you get one uncover per day

## todo

- [ ] try using white lines in the jewels, maybe add a sparkle
- [ ] at the end of replay, show all jewels on the board again?
- [ ] make more jewels, use this for inspiration: https://c7.alamy.com/comp/2BP2WMA/2BP2WMA.jpg
- [ ] make the jewels on the tree smaller still when not uncovered, then they can grow (but it's not
      just a simple CSS, so maybe not)
- [ ] let the jewels fall off the tree
  - shake the jewels off the tree, add them to a score in state

## maybes

- [ ] clicking with 0 moves could show how long until next move is available
- [ ] select one type of jewel from a bag of the same size so the shape is unambiguous
  - or select as many diverse ones as possible

---

## done 2025-10-11

- [x] make newly placed jewels fly onto the board from above
- [x] place new jewels randomly when tapping on moves
- [x] coins (bonus moves or other mergables in merging game)

## done 2025-09-21

- [x] add a sub-game like princess clothing, getting pearls, two pearls are a ring, two rings are a
      tiara etc.
  - basically a clone in a subdirectory, with shared jewels?

## done 2025-02-23

- [x] disable clickable things while not clickable (e.g. R button)

## done 2025-02-07

- [x] check for day bonus on wake (when I switch to that tab)

## done 2025-02-04

- [x] add a favicon - one of the jewels?
- [x] rotate jewels in all 4 directions?

## done 2025-02-02

- [x] add more jewels
- [x] in replay (and maybe always), highlight the tile you've clicked so it flashes and is more
      visible?

## done 2025-01-30

- [x] add a "replay previous game" button? it would want to be slower than on load
  - add a replay button in HTML and CSS
  - in doShow(), hide or show it depending on previousState and replaying
  - on press, replay or stop replay
- [x] refactor cladding into its own class
- [o] handle the case when the selected jewels cannot be placed?
  - templates are either possible or not, creating a new template will quickly show it's not
    possible

## done 2025-01-29

- [x] bug: when preparing new board, clicking on it misbehaves
  - similarly, on initial replay the board should not be clickable

## done earlier

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
