# ERGOSPHERE — design (re-read this every session)

First-person 3D puzzle-horror about 4D space, portals and time. Static site on GitHub Pages: no backend, no build step, no npm.

## Status
- M0 done (see Milestones). Next: M1 only when asked.

## Hard rules
- Vanilla JS ES modules + Three.js r160 vendored once: `mkdir -p lib && curl -L https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js -o lib/three.module.js`. No Three addons; own controls.
- No external assets. Geometry, textures (canvas), audio (WebAudio synth) all procedural.
- Relative paths only (no leading "/"). Pages serves under /repo-name/; filenames are case-sensitive.
- Test locally: `python -m http.server 8000`
- Render at 0.6x resolution, CSS `image-rendering: pixelated` (PS1 look, phone friendly).
- Desktop (WASD + mouse, pointer lock) AND mobile (left joystick, right-side look drag, on-screen W / Portal / Rewind buttons).
- Settings from day one: Reduce effects (no flashes, aberration, screen warp), look sensitivity, vignette.
- Every file under ~300 lines. Split instead of growing.

## Workflow
1. DESIGN.md holds the whole design.
2. ONE milestone per session: make it run, commit, STOP, say what to test.
3. Every puzzle: written solution in docs/solutions.md, soft-lock escape (hold Reset restores room), auto-filling Notebook hint. "Confusing" is the vibe; "unsolvable" is a bug.

## File layout
index.html, style.css, js/main.js
js/engine/ renderer input player collision audio post portal (+ textures)
js/systems/ wlayer timeline echoes dilation static dust save
js/entities/ seam
js/levels/ deck0..deck6 (data-driven: rooms, objects, doors, laws) (M0 uses stage.js)
js/ui/ hud notebook menu touch
docs/solutions.md

## The game
Station Ergosphere orbits a spinning black hole. Crew vanished. You wake in an already-open airlock. The LOOM weaves time into a physical dimension; it is broken, and the SEAM hunts through time. Time is a place you can walk, reach into, and get trapped in.

### Mechanics
1. W-SHIFT: hold a button, world slides along extra axis W (layers 0-6). Objects have w position + w thickness; visible/solid only near your W. Hyperspheres: radius = sqrt(r^2 - dw^2). Tesseract morphs through cube cross-sections. Doors/floors/walls can exist only at certain W. Wrist W-compass.
2. THREAD PORTALS: only on glowing Seam surfaces. Pair color = time offset: red past (-N s), white present, violet future (+N s). You arrive in the same room at another time. Build (a) teleport + fade, (b) real see-through portals via render-to-texture.
3. ECHOES: record up to 20 s; echo replays in later loops, holds doors, stands on plates, carries items. Max 3. Each adds Static.
4. REWIND: hold R to scrub back (Braid-style), limited by Thread resource recharged at Spine stations.
5. TIMELINE SPINE: hub corridor, time = distance along Z; each door is a moment of a room. "Reach" into a slice and move an object; effects ripple forward deterministically.
6. DUST MESSAGES (bootstrap paradox): in the future layer write a 3-symbol code in floor dust; in the past the same code is already on the wall and you read it first. Where it originated is the puzzle. Write a different code: timeline branches, room glitches.
7. TIME DILATION DECKS: each deck has its own clock; lowest deck near the hole runs 100x slower. Carry ice, seeds, batteries, rust between decks to age them differently. The Seam obeys the same rule.
8. ROOM LAWS (engraved over door): "Gravity follows your gaze", "Doors open only after you leave", "Shadows are solid", "Things you look at stop moving", "Sound is light", "Only the observed is real". Swap with Law Cartridges for cross-room puzzles.
9. PRE-ECHO AUDIO: hear events up to 4 s before they happen (Seam footsteps arrive first, reverse-envelope). Warning system and clue.
10. TOPOLOGY ROOMS: hallway that loops after 4x90 deg is off by one W-rotation; rooms bigger inside; gravity portals turn walls into floors.

### Horror
- THE SEAM: tall figure stitched from different moments. Exists across the whole timeline. Sees you only if it shares your W (+-1). Hears portal placement and echo spawning. States: Dormant -> Listening -> Hunting (waypoint graph per room) -> Stalking. Through the W-lens it flickers between layers. Slowed, not killed, by acting in time.
- STATIC (paradox meter): rises from time jumps, echoes, W-sickness, Seam proximity. High Static: HUD lies (wrong clock, fake W), fake doors, reversed text, inverted audio, growing aberration, echoes move on their own. Truth Lamp shows what is real.
- DEATH: leaves a permanent CORPSE ECHO in all future loops; carries the item you held, can be stood on, attracts the Seam. Death is a resource and a clue.
- Gargantua window: lens-distortion shader of the black hole through observatory windows; bigger on lower decks.

### Items
Chronometer, W-lens flashlight, Brass compass, Truth Lamp, Thread spool, Law Cartridges, Dust chalk, 7 hidden Torn Pages.

### Chapters (in order, one mechanic each)
0 Open Airlock (movement, doors) · 1 Dormitory (W-shift; door only at W=2) · 2 Observatory (portals + Gargantua) · 3 Archive (dust, bootstrap) · 4 Reactor Vault (dilation) · 5 Library of Strings (tesseract bookshelf, Spine, Reach) · 6 The Loom (everything; Seam hunts) · 7 Finale

### Endings
SEVER (cut loop, escape alone) · STITCH (become the Seam) · OBSERVE (stand still forever; room stays real) · UNSPOOL (secret; all 7 pages + hand yourself the key through the Spine; time folds back to before the crew vanished)

### Tech notes
- Fixed 60 Hz timestep. Puzzle state is a plain cloneable object; everything that moves is a function of (tick, state). Snapshot every 60 ticks. Rewind, echoes, Spine come nearly free.
- Input is sampled once per tick into a plain frame object `{mx,mz,dyaw,dpitch,w,portal,rewind}`; Player.step(frame, world) consumes it. Echo = array of these frames.
- Collision: simple AABB/circle, no physics library.
- localStorage: chapter, pages found, corpse echoes, settings.
- Debug console on ` key: skip to room, set W, set Static, spawn Seam.

## Milestones
M0 repo + index + renderer + low-res look + movement + touch + settings + deploy check
M1 rooms from data (deck0.js), doors, collision, HUD, Notebook
M2 W-layers, hypersphere morph, compass, W button
M3 procedural audio: drone, heartbeat vs Static, footsteps
M4 Static meter, lying HUD, post effects with Reduce switch
M5 teleport time portals (fade), Seam surfaces, colors
M6 timeline recording, snapshots, Rewind
M7 Echoes
M8 Seam AI, pre-echo audio, corpse echoes
M9 Dust messages + bootstrap puzzle (Ch.3)
M10 Time dilation decks (Ch.4)
M11 See-through portals (render targets), Gargantua shader
M12 Spine + Reach (Ch.5), room laws, Loom finale (6-7), endings

## Status: M2 done (needs your phone test)

- M0, M1 done and confirmed. M2 built: W-layers.
- js/systems/wlayer.js: W state lives in `state.wl` {w, dir, held, ...}; `stepW(state.wl, frame, player, world)` runs once per tick after Player.step. Hold = slide along W 0..6 (bounces at the ends), release = settle on nearest layer, quick tap (<0.22 s) = flip direction. Refuses to slide into something solid ("blocked").
- Level data: `wobjs` (blocks and spheres with `w` centre and `wt` half-thickness) plus optional `w`/`wt` on doors. Visible and solid while |W - w| <= wt, fades just outside. Hypersphere cross-section radius = sqrt(r^2 - dW^2) (collision is an inscribed square).
- rooms.js: `world.setW(w)`, `world.wBlocked(x,z,r,w)`; world.boxes now include W-solid objects at the current W.
- HUD: W gauge at top centre (7 pips, W value, slide direction). Events: `w:move`, `w:<layer>`, `see:<door>`.
- deck0.js: new Dormitory room, door d4 that exists only at W 2 (sealed by fillers at other layers), hypersphere at W 3, new Notebook entries. Seam surface moved to the east wall of the antechamber.
- Not done on purpose: W-lens ghosts, tesseract morph (Chapter 5). Progress is still not saved.
- Next: M3 (procedural audio). Do not start until asked.
- M2.5: guided W tutorial tips (tutorial[] in deck0.js, game.tip(), HUD tip box).
