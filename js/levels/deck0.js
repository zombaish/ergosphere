// Deck 0 (Chapter 0: The Open Airlock). DATA ONLY: no THREE here.
// Coordinates: x east, z south; the player starts facing -z.
// Walls: ax 'z' = wall running along X at z=at; ax 'x' = wall running along Z at x=at.
// A door sits in a wall (same ax/at) at coordinate pos. Room laws arrive in later chapters.
export default {
  id: 'deck0', name: 'Deck 0', height: 3.2, doorHeight: 2.4, doorWidth: 1.6,
  spawn: { x: 0, z: 6 },
  rooms: [
    { id: 'airlock', name: 'Airlock', minX: -3, maxX: 3, minZ: 0, maxZ: 8, safe: { x: 0, z: 5 }, light: { color: 0xffd9a0, i: 3 } },
    { id: 'corridor', name: 'Main Corridor', minX: -3, maxX: 3, minZ: -16, maxZ: 0, safe: { x: 0, z: -6 }, light: { color: 0x9fb8ff, i: 3 } },
    { id: 'storage', name: 'Storage', minX: -11, maxX: -3, minZ: -12, maxZ: -4, safe: { x: -5, z: -8 }, light: { color: 0xffc080, i: 3 } },
    { id: 'antechamber', name: 'Dormitory Antechamber', minX: -3, maxX: 3, minZ: -24, maxZ: -16, safe: { x: 0, z: -20 }, light: { color: 0xb090ff, i: 3 } },
  ],
  walls: [
    { ax: 'z', at: 8, from: -3, to: 3 },
    { ax: 'z', at: 0, from: -3, to: 3 },
    { ax: 'z', at: -16, from: -3, to: 3 },
    { ax: 'z', at: -24, from: -3, to: 3 },
    { ax: 'x', at: 3, from: -24, to: 8 },
    { ax: 'x', at: -3, from: -24, to: 8 },
    { ax: 'z', at: -4, from: -11, to: -3 },
    { ax: 'z', at: -12, from: -11, to: -3 },
    { ax: 'x', at: -11, from: -12, to: -4 },
  ],
  doors: [
    { id: 'd1', ax: 'z', at: 0, pos: 0, rooms: ['airlock', 'corridor'], label: 'airlock door' },
    { id: 'd2', ax: 'x', at: -3, pos: -8, rooms: ['corridor', 'storage'], label: 'storage door' },
    { id: 'd3', ax: 'z', at: -16, pos: 0, rooms: ['corridor', 'antechamber'], key: 'keycard',
      label: 'dormitory door', lockedMsg: 'Locked. The panel wants a keycard.' },
  ],
  // kind 'item' = pick up (goes in inventory under its id); 'note' = readable console (solid).
  props: [
    { id: 'log_airlock', kind: 'note', name: 'Airlock log', home: 'airlock', x: 2.65, z: 5, w: 0.4, d: 0.9,
      text: 'AIRLOCK LOG, last entry\nLOOM spin-up 03:12.\n"Everyone is still here. Everyone is still here. Everyone is still' },
    { id: 'keycard', kind: 'item', name: 'Dormitory keycard', home: 'storage', x: -9.5, z: -10.5, color: 0xffb030 },
    { id: 'hatch_note', kind: 'note', name: 'Hatch panel', home: 'antechamber', x: -2.65, z: -20, w: 0.4, d: 0.9,
      text: 'HATCH 1A, DORMITORY\nSeals on loss of crew.\nOverride requires leaving the plane.\nNOT AVAILABLE.' },
  ],
  scenery: [
    { x: -2.0, z: 7.0, w: 1.0, d: 1.0, h: 0.9 },
    { x: 2.1, z: -7, w: 0.7, d: 0.7, h: 3.2 },
    { x: -9.2, z: -5.3, w: 1.6, d: 1.0, h: 1.1 },
    { x: -5.0, z: -11.0, w: 1.2, d: 1.2, h: 2.2 },
    { x: -10.2, z: -8.5, w: 1.0, d: 1.6, h: 1.6 },
  ],
  seams: [{ x: 0, y: 1.5, z: -23.82, ry: 0, w: 3, h: 2 }], // portals go here in M5
  // Auto-filling Notebook. An entry unlocks on event "on", is crossed off on event "done",
  // and reveals one hint per hintAfter seconds (game time) while it is still open.
  notebook: [
    { id: 'wake', on: 'start', done: 'open:d1', title: 'Wake up',
      text: 'Station Ergosphere, Deck 0. The airlock was already open when I woke. Nobody answers.',
      hints: ['Walk up to the door ahead and use it.'], hintAfter: 30 },
    { id: 'log', on: 'read:log_airlock', title: 'Airlock log',
      text: 'The last log entry stops mid-sentence. The LOOM spun up and then everyone was gone.' },
    { id: 'sealed', on: 'locked:d3', done: 'unlock:d3', title: 'Dormitory door is locked',
      text: 'The door at the end of the corridor wants a keycard. A red light means locked.',
      hints: ['A keycard must be somewhere nearby. Try the other doors off the corridor.',
        'The storage room on the west side of the corridor. Look for something glowing amber.'], hintAfter: 40 },
    { id: 'card', on: 'pickup:keycard', done: 'unlock:d3', title: 'Keycard',
      text: 'A dormitory keycard. It has to fit the locked door at the end of the corridor.',
      hints: ['Take it to the red-lit door at the north end of the corridor.'], hintAfter: 30 },
    { id: 'ante', on: 'enter:antechamber', title: 'Dormitory antechamber',
      text: 'The hatch is sealed and the far wall glows violet. I can do nothing about either yet.' },
  ],
};
