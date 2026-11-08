// Game logic. State is a plain cloneable object so rewind/echoes can snapshot it later (M6+).
import { newWl } from './wlayer.js';
const REACH = 2.1, CONE = 0.5;
const dpos = d => (d.ax === 'z' ? { x: d.pos, z: d.at } : { x: d.at, z: d.pos });

export function hintLevel(e, n, t) {
  if (n.done || !e.hints) return 0;
  return Math.min(e.hints.length, Math.floor((t - n.at) / (e.hintAfter || 45)));
}

export function createGame(data, world, ui) {
  const defs = {}, props = {};
  data.doors.forEach(d => { defs[d.id] = d; });
  data.props.forEach(p => { props[p.id] = p; });
  const state = { t: 0, room: null, inv: [], doors: {}, items: {}, nb: {}, nbLvl: {}, seen: {}, wl: newWl() };
  const resetDoor = id => { state.doors[id] = { open: !!defs[id].open, locked: !!defs[id].key }; };
  data.doors.forEach(d => resetDoor(d.id));
  data.props.forEach(p => { if (p.kind === 'item') state.items[p.id] = { taken: false }; });
  const syncInv = () => ui.inv(state.inv.map(id => (props[id] ? props[id].name : id)));

  // Events drive the Notebook: "on" unlocks an entry, "done" crosses it off.
  const emit = ev => {
    state.seen[ev] = true;
    for (const e of data.notebook) {
      if (e.on === ev && !state.nb[e.id]) {
        state.nb[e.id] = { at: state.t, done: !!(e.done && state.seen[e.done]) };
        ui.entry(e);
      }
      if (e.done === ev && state.nb[e.id]) state.nb[e.id].done = true;
    }
  };

  const update = (dt, px, pz) => {
    state.t += dt;
    const r = world.roomAt(px, pz);
    if (r && r.id !== state.room) { state.room = r.id; ui.room(r.name); emit('enter:' + r.id); }
    for (const d of data.doors) {
      if (d.w != null && r && d.rooms.includes(r.id) && !state.seen['see:' + d.id] && Math.abs(state.wl.w - d.w) <= (d.wt ?? 0.6)) emit('see:' + d.id);
    }
    for (const e of data.notebook) {
      const n = state.nb[e.id];
      if (!n) continue;
      const lv = hintLevel(e, n, state.t);
      if (lv > (state.nbLvl[e.id] || 0)) { state.nbLvl[e.id] = lv; ui.hint(e); }
    }
  };

  // What is the player looking at / standing next to? Returns {kind,id,prompt} or null.
  const target = (px, pz, dx, dz) => {
    const here = world.roomAt(px, pz);
    let best = null, bs = 1e9;
    const consider = (kind, id, x, z, prompt) => {
      const vx = x - px, vz = z - pz, dist = Math.hypot(vx, vz);
      if (dist > REACH) return;
      const dot = dist < 0.01 ? 1 : (vx * dx + vz * dz) / dist;
      if (dist > 0.8 && dot < CONE) return;
      if (dist - dot < bs) { bs = dist - dot; best = { kind, id, prompt }; }
    };
    for (const d of data.doors) {
      if (d.w != null && Math.abs(state.wl.w - d.w) > (d.wt ?? 0.6)) continue; // door not present at this W
      const s = state.doors[d.id], c = dpos(d);
      const act = s.locked ? (state.inv.includes(d.key) ? 'unlock ' : '') : s.open ? 'close ' : 'open ';
      consider('door', d.id, c.x, c.z, act + d.label + (s.locked && !act ? ' (locked)' : ''));
    }
    for (const p of data.props) {
      if (!here || here.id !== p.home) continue;
      if (p.kind === 'item') { if (!state.items[p.id].taken) consider('item', p.id, p.x, p.z, 'pick up ' + p.name.toLowerCase()); }
      else consider('note', p.id, p.x, p.z, 'read ' + p.name.toLowerCase());
    }
    return best;
  };

  const activate = (t, px, pz) => {
    if (t.kind === 'door') {
      const d = defs[t.id], s = state.doors[t.id], c = dpos(d);
      if (s.locked) {
        if (d.key && state.inv.includes(d.key)) {
          s.locked = false; s.open = true; ui.toast(d.okMsg || 'Keycard accepted.'); ui.sfx?.('unlock'); ui.sfx?.('door');
          emit('unlock:' + t.id); emit('open:' + t.id);
        } else { ui.toast(d.lockedMsg || 'Locked.'); ui.sfx?.('locked'); emit('locked:' + t.id); }
      } else if (s.open) {
        if (Math.hypot(c.x - px, c.z - pz) < 1.1) ui.toast('Something is in the way.');
        else { s.open = false; ui.sfx?.('door'); emit('close:' + t.id); }
      } else { s.open = true; ui.sfx?.('door'); emit('open:' + t.id); }
    } else if (t.kind === 'item') {
      state.items[t.id].taken = true; state.inv.push(t.id); syncInv();
      ui.toast('Picked up: ' + props[t.id].name); ui.sfx?.('pickup'); emit('pickup:' + t.id);
    } else {
      ui.say(props[t.id].name, props[t.id].text); ui.sfx?.('note'); emit('read:' + t.id);
    }
  };

  // Soft-lock escape: restore the current room's doors and items; returns a safe spot to move to.
  const reset = () => {
    const room = data.rooms.find(r => r.id === state.room);
    if (!room) return null;
    data.doors.forEach(d => { if (d.rooms.includes(room.id)) resetDoor(d.id); });
    data.props.forEach(p => {
      if (p.kind === 'item' && p.home === room.id && !state.inv.includes(p.id)) state.items[p.id].taken = false;
    });
    Object.assign(state.wl, newWl());
    ui.toast('Room restored.'); ui.sfx?.('reset'); emit('reset:' + room.id);
    return room.safe;
  };

  const seenAny = u => [].concat(u).some(e => state.seen[e]);
  const tip = () => {
    for (const s of data.tutorial || []) { if (seenAny(s.until)) continue; return state.seen[s.on] ? s.text : ''; }
    return '';
  };

  const notebookView = () => data.notebook.filter(e => state.nb[e.id]).map(e => {
    const n = state.nb[e.id], lv = hintLevel(e, n, state.t), all = e.hints || [];
    return { id: e.id, title: e.title, text: e.text, done: n.done, at: n.at,
      hints: all.slice(0, lv), more: !n.done && lv < all.length };
  }).sort((a, b) => (a.done - b.done) || (a.at - b.at));

  return { state, emit, tip, start: () => emit('start'), update, target, activate, reset, notebookView };
}
