// M0 test room (replaced by data-driven deck0.js in M1).
import { makeTex } from '../engine/textures.js';
const W = 14, H = 3.2, h = W / 2;
export function buildStage(THREE, scene) {
  const floorT = makeTex(THREE, '#2a2d38', '#23262f', 8, 32, 1);
  const wallT = makeTex(THREE, '#3a3340', '#332d38', 16, 32, 2);
  const crateT = makeTex(THREE, '#5a4630', '#4d3b28', 4, 32, 3);
  const mat = (t, rx, ry) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return new THREE.MeshLambertMaterial({ map: c }); };
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => {
    const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); scene.add(o); return o;
  };
  const P = (w, hh) => new THREE.PlaneGeometry(w, hh);
  add(P(W, W), mat(floorT, 7, 7), 0, 0, 0, -Math.PI / 2);
  add(P(W, W), mat(floorT, 7, 7), 0, H, 0, Math.PI / 2);
  add(P(W, H), mat(wallT, 7, 2), 0, H / 2, -h);
  add(P(W, H), mat(wallT, 7, 2), 0, H / 2, h, 0, Math.PI);
  add(P(W, H), mat(wallT, 7, 2), -h, H / 2, 0, 0, Math.PI / 2);
  add(P(W, H), mat(wallT, 7, 2), h, H / 2, 0, 0, -Math.PI / 2);
  // A glowing "Seam surface" (portals will go here in M5)
  add(P(3, 2), new THREE.MeshBasicMaterial({ color: 0x7a4dff }), 0, 1.5, -h + 0.02);
  const glow = new THREE.PointLight(0x7a4dff, 6, 0, 1); glow.position.set(0, 1.5, -h + 1); scene.add(glow);
  const boxes = [];
  const box = (x, z, w, d, hh) => {
    add(new THREE.BoxGeometry(w, hh, d), mat(crateT, 1, 1), x, hh / 2, z);
    boxes.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  };
  box(-3, -2, 1, 1, H); box(3, -2, 1, 1, H); box(0, 1, 1.2, 1.2, 1);
  box(-4.5, 3, 1, 1, 1); box(4, 3.5, 1.4, 1, 0.8);
  scene.add(new THREE.AmbientLight(0x6070a0, 2.2));
  return { bounds: { minX: -h, maxX: h, minZ: -h, maxZ: h }, boxes, spawn: { x: 0, z: 4 } };
}
