import * as THREE from 'three';
const SCALE = 0.6; // PS1 look: render small, CSS scales up with pixelated filtering
export function createRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060a);
  scene.fog = new THREE.Fog(0x05060a, 2, 26);
  const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 100);
  const lamp = new THREE.PointLight(0xaab8ff, 9, 0, 1);
  scene.add(lamp);
  function resize() {
    const w = innerWidth, h = innerHeight;
    r.setPixelRatio(1);
    r.setSize(Math.max(1, Math.floor(w * SCALE)), Math.max(1, Math.floor(h * SCALE)), false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();
  return { THREE, scene, camera, lamp, render: () => r.render(scene, camera) };
}
