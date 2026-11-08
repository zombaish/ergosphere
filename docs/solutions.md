# Solutions
One entry per puzzle: room, goal, step-by-step solution, Notebook hint text, soft-lock escape.
(No puzzles yet.)

## Deck 0 (M1): The Open Airlock

**Goal:** reach the Dormitory Antechamber (door d3 at the north end of the corridor is locked).

**Solution**
1. Airlock: walk to the door ahead (north) and use it (E / USE). It opens.
2. Corridor: the west door (about halfway along, left wall) opens into Storage.
3. Storage: the amber floating cube at the back-left (about x -9.5, z -10.5) is the Dormitory keycard. Pick it up.
4. Back in the corridor, go to the red-lit door at the far north end and use it. The keycard unlocks it (it is not consumed).

**Notebook hints (auto-fill):** entry "Dormitory door is locked" appears when you try d3. Hint 1 after 40 s, hint 2 after 80 s of staying stuck.

**Soft-lock escape:** hold Reset (X, or the RESET button) for 1.5 s. It restores the doors and items of the room you are in and moves you to that room's safe spot. In this deck nothing can actually be lost (the keycard is never consumed), so Reset is only a safety net.

## Deck 0 (M2): The hidden door (W-shift tutorial)

**Goal:** get from the Dormitory Antechamber into the Dormitory.

**Solution**
1. Antechamber: read the hatch console (west side). The north wall looks solid.
2. Hold the W control (touch: W button; keyboard: Shift or F). The W gauge at the top slides from 0 upward. Release to settle on the nearest whole layer. A quick tap instead flips the slide direction.
3. Settle on **W 2**. The north wall now has a door (it only exists at W 2). Open it (E / USE).
4. Walk through into the Dormitory. At W 2 the door stays passable. Do not shift W while standing in the doorway: the sealing wall exists at every other layer, so the shift is refused ("Blocked").
5. Optional: shift W in the Dormitory to see the hypersphere grow to full size at W 3 and shrink to nothing away from it. It is solid while visible.

**Notebook hints (auto-fill):** "Hatch override" appears after reading the hatch console (hints at 35 s, 70 s, 105 s); "A door at W 2" appears when you first see the door.

**Soft-lock escape:** hold Reset (X / RESET, 1.5 s). It restores the room's doors and items, moves you to the safe spot and sets W back to 0. W-shift itself never lets you end up inside a solid object.

## Deck 0 (M2.6): Locker 5 and the way down

**Goal:** reach the Observation Vestibule (end of Deck 0 for now).

**Solution**
1. Dormitory: read the bunk console. It says locker 5 holds the badge and opens only "when the station sits at 5".
2. Settle on **W 5** (hold W, release on layer 5). A door appears in the **east wall** (near the south end) and the wall gap opens.
3. Open it (USE), walk into the locker, take the **crew badge**. Leave through the same door while still on W 5.
4. Go to the dormitory's north door and use it with the badge. It opens into the Observation Vestibule.

**Notebook hints:** "Locker 5" (hints at 35, 70, 105 s), "The north door".

**Soft-lock escapes:** shifting W while standing in the doorway is refused. If you are sealed inside the locker (W is not 5), shift back to W 5 and the door reappears. Hold Reset also restores the room; note that Reset sets W to 0, so from inside the locker shift to W 5 again.
