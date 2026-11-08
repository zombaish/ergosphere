// Builds meshes + collision from level data (js/levels/*.js). Visuals follow game state via update().
import { makeTex } from './textures.js';
const T = 0.3; // wall thickness
const DOOR_COL = { locked: 0xff3030, closed: 0x4aa8ff, open: 0x30ff80 };

export function buildLevel(THREE, scene, data) {
  const H = data.height, DH = data.doorHeight, DW = data.doorWidth;
  const tex = {
    floor: makeTex(THREE, '#2a2d38', '#23262f', 8, 32, 1),
    wall: makeTex(THREE, '#3a3340', '#332d38', 16, 32, 2),
    door: makeTex(THREE, '#4a4f5c', '#40444f', 6, 32, 4),
    crate: makeTex(THREE, '#5a4630', '#4d3b28', 4, 32, 3),
  };
  const cache = {};
  const mat = (k, rx, ry) => {
    const id = k + rx.toFixed(1) + '_' + ry.toFixed(1);
    if (!cache[id]) {
      const c = tex[k].clone(); c.repeat.set(rx, ry); c.needsUpdate = true;
      cache[id] = new THREE.MeshLambertMaterial({ map: c });
    }
    return cache[id];
  };
  const mesh = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const box = (w, h, d, m, x, y, z) => { const o = mesh(w, h, d, m); o.position.set(x, y, z); scene.add(o); return o; };
  const near = (w, c, wt) => Math.abs(w - c) <= wt;
  const fade = (w, c, wt) => { const d = Math.abs(w - c); return d <= wt ? 1 : Math.max(0, (wt + 0.3 - d) / 0.3); };
  // world-aligned wall UVs: pieces of one wall (and hidden-door fillers) tile as one continuous surface
  const wuv = o => {
    const g = o.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, q = o.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + q.x, y = p.getY(i) + q.y, z = p.getZ(i) + q.z;
      if (Math.abs(n.getY(i)) > 0.5) uv.setXY(i, x * 0.5, z * 0.5);
      else uv.setXY(i, (Math.abs(n.getX(i)) > 0.5 ? z : x) * 0.5, y * 0.625);
    }
    uv.needsUpdate = true;
  };
  const wMat = m => { const c = m.clone(); c.transparent = true; return c; };
  const statics = [];
  const solid = (minX, maxX, minZ, maxZ) => statics.push({ minX, maxX, minZ, maxZ });

  // rooms: floor, ceiling, accent light
  for (const r of data.rooms) {
    const w = r.maxX - r.minX, d = r.maxZ - r.minZ, cx = (r.minX + r.maxX) / 2, cz = (r.minZ + r.maxZ) / 2;
    for (const [y, rx] of [[0, -Math.PI / 2], [H, Math.PI / 2]]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat('floor', w * 0.5, d * 0.5));
      p.rotation.x = rx; p.position.set(cx, y, cz); scene.add(p);
    }
    if (r.light) {
      const l = new THREE.PointLight(r.light.color, r.light.i, 14, 1);
      l.position.set(cx, H - 0.5, cz); scene.add(l);
    }
  }

  // walls, cut around doors (lintel stays above each doorway)
  const wallBox = (ax, at, u0, u1, y0, y1, hard) => {
    const len = u1 - u0, uc = (u0 + u1) / 2, h = y1 - y0, m = mat('wall', 1, 1);
    wuv(ax === 'z' ? box(len, h, T, m, uc, y0 + h / 2, at) : box(T, h, len, m, at, y0 + h / 2, uc));
    if (hard) { if (ax === 'z') solid(u0, u1, at - T / 2, at + T / 2); else solid(at - T / 2, at + T / 2, u0, u1); }
  };
  for (const w of data.walls) {
    const ds = data.doors.filter(d => d.ax === w.ax && d.at === w.at && d.pos > w.from && d.pos < w.to)
      .sort((a, b) => a.pos - b.pos);
    let u = w.from - T / 2;
    for (const d of ds) {
      const g0 = d.pos - DW / 2, g1 = d.pos + DW / 2;
      if (g0 - u > 0.01) wallBox(w.ax, w.at, u, g0, 0, H, true);
      wallBox(w.ax, w.at, g0, g1, DH, H, false);
      u = g1;
    }
    wallBox(w.ax, w.at, u, w.to + T / 2, 0, H, true);
  }

  // doors: sliding panel + status strip (red locked / blue closed / green open)
  const doors = {};
  for (const d of data.doors) {
    const zAx = d.ax === 'z', x = zAx ? d.pos : d.at, z = zAx ? d.at : d.pos, th = T * 0.8;
    const m = d.w != null ? wMat(mat('door', DW * 0.5, DH * 0.5)) : mat('door', DW * 0.5, DH * 0.5);
    const panel = zAx ? box(DW, DH, th, m, x, DH / 2, z) : box(th, DH, DW, m, x, DH / 2, z);
    const ind = new THREE.MeshBasicMaterial({ color: DOOR_COL.closed, transparent: d.w != null });
    const strip = zAx ? mesh(0.16, 0.9, th + 0.04, ind) : mesh(th + 0.04, 0.9, 0.16, ind);
    strip.position.set(zAx ? DW / 2 - 0.25 : 0, 0.1, zAx ? 0 : DW / 2 - 0.25);
    panel.add(strip);
    const aabb = zAx ? { minX: x - DW / 2, maxX: x + DW / 2, minZ: z - T / 2, maxZ: z + T / 2 }
      : { minX: x - T / 2, maxX: x + T / 2, minZ: z - DW / 2, maxZ: z + DW / 2 };
    const open = d.open ? 1 : 0;
    doors[d.id] = { panel, ind, aabb, open, blocking: open < 0.7, w: d.w, wt: d.wt ?? 0.6 };
  }

  // props: floating pickups and solid consoles
  const props = {};
  for (const p of data.props) {
    let o;
    if (p.kind === 'item') o = box(0.28, 0.28, 0.28, new THREE.MeshBasicMaterial({ color: p.color || 0xffffff }), p.x, 0.9, p.z);
    else {
      const w = p.w || 0.5, d = p.d || 0.5;
      o = box(w, 1.1, d, mat('crate', 1, 1), p.x, 0.55, p.z);
      const scr = mesh(w * 0.7, 0.05, d * 0.7, new THREE.MeshBasicMaterial({ color: 0x40e0ff }));
      scr.position.y = 0.57; o.add(scr);
      solid(p.x - w / 2, p.x + w / 2, p.z - d / 2, p.z + d / 2);
    }
    props[p.id] = { o, kind: p.kind };
  }
  for (const s of data.scenery || []) {
    box(s.w, s.h, s.d, mat('crate', Math.max(s.w, s.d), s.h * 0.6), s.x, s.h / 2, s.z);
    solid(s.x - s.w / 2, s.x + s.w / 2, s.z - s.d / 2, s.z + s.d / 2);
  }
  for (const s of data.seams || []) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), new THREE.MeshBasicMaterial({ color: 0x7a4dff }));
    m.position.set(s.x, s.y, s.z); m.rotation.y = s.ry || 0; scene.add(m);
  }
  // W objects: blocks (fillers, walls) and hyperspheres (cross-section radius sqrt(r^2 - dW^2))
  const wobjs = (data.wobjs || []).map(o => {
    let m;
    if (o.kind === 'sphere') {
      m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshLambertMaterial({ color: o.color || 0x6fe0ff, transparent: true, opacity: 0.9 }));
      m.position.set(o.x, o.y, o.z);
    } else {
      m = mesh(o.sx, o.h, o.sz, wMat(mat('wall', 1, 1)));
      m.position.set(o.x, o.h / 2, o.z); wuv(m);
    }
    scene.add(m); return { ...o, m };
  });
  const sph = (o, w) => { const dw = Math.abs(w - o.w); return dw < o.r ? Math.sqrt(o.r * o.r - dw * dw) : 0; };
  const dynAt = w => {
    const out = [];
    for (const o of wobjs) {
      if (o.kind === 'sphere') { const h = sph(o, w) * 0.8; if (h > 0.15) out.push({ minX: o.x - h, maxX: o.x + h, minZ: o.z - h, maxZ: o.z + h }); }
      else if (near(w, o.w, o.wt)) out.push({ minX: o.x - o.sx / 2, maxX: o.x + o.sx / 2, minZ: o.z - o.sz / 2, maxZ: o.z + o.sz / 2 });
    }
    for (const id in doors) { const D = doors[id]; if (D.w != null && D.blocking && near(w, D.w, D.wt)) out.push(D.aabb); }
    return out;
  };
  let curW = 0;
  const paint = () => {
    for (const o of wobjs) {
      if (o.kind === 'sphere') { const rr = sph(o, curW); o.m.visible = rr > 0.05; o.m.scale.setScalar(Math.max(rr, 0.001)); }
      else { const a = fade(curW, o.w, o.wt); o.m.visible = a > 0; o.m.material.opacity = a; }
    }
    for (const id in doors) {
      const D = doors[id]; if (D.w == null) continue;
      const a = fade(curW, D.w, D.wt); D.panel.visible = a > 0; D.panel.material.opacity = a; D.ind.opacity = a;
    }
  };
  scene.add(new THREE.AmbientLight(0x6070a0, 2.2));

  const R = data.rooms, B = Math.min, X = Math.max;
  const world = {
    bounds: { minX: B(...R.map(r => r.minX)) - 1, maxX: X(...R.map(r => r.maxX)) + 1,
      minZ: B(...R.map(r => r.minZ)) - 1, maxZ: X(...R.map(r => r.maxZ)) + 1 },
    boxes: [], spawn: data.spawn, rooms: R,
    roomAt: (x, z) => R.find(r => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) || null,
  };
  const rebuild = () => {
    world.boxes.length = 0; world.boxes.push(...statics);
    for (const id in doors) if (doors[id].blocking && doors[id].w == null) world.boxes.push(doors[id].aabb);
    world.boxes.push(...dynAt(curW));
  };
  world.setW = w => { if (w === curW) return; curW = w; paint(); rebuild(); };
  world.wBlocked = (x, z, r, w) => dynAt(w).some(b => x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r);
  paint(); rebuild();

  // sync visuals to state (dt = 0 while paused)
  world.update = (dt, state) => {
    world.setW(state.wl.w);
    let changed = false;
    for (const id in doors) {
      const D = doors[id], S = state.doors[id];
      D.open += Math.max(-dt * 1.8, Math.min(dt * 1.8, (S.open ? 1 : 0) - D.open));
      D.panel.position.y = DH / 2 + D.open * DH;
      const blocking = D.open < 0.7;
      if (blocking !== D.blocking) { D.blocking = blocking; changed = true; }
      D.ind.color.setHex(S.locked ? DOOR_COL.locked : S.open ? DOOR_COL.open : DOOR_COL.closed);
    }
    if (changed) rebuild();
    for (const id in props) {
      const P = props[id];
      if (P.kind !== 'item') continue;
      P.o.visible = !state.items[id].taken;
      P.o.position.y = 0.9 + Math.sin(state.t * 2.2) * 0.06;
      P.o.rotation.y = state.t * 0.8;
    }
  };
  return world;
}
