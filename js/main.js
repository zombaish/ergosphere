import { loadSettings, saveSettings } from './systems/save.js';
import { Input } from './engine/input.js';
import { Player } from './engine/player.js';
import { initMenu } from './ui/menu.js';
import { initTouch } from './ui/touch.js';

const $ = id => document.getElementById(id);
const canvas = $('game'), msg = $('msg');
const settings = loadSettings();
const touch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const input = new Input(canvas);
let started = false, paused = true;
const lock = () => { if (!touch) try { canvas.requestPointerLock(); } catch {} };

const menu = initMenu(settings, saveSettings, {
  onChange: s => { input.sens = s.sens; },
  onOpen: () => { paused = true; input.reset(); document.exitPointerLock?.(); },
  onClose: () => { if (started) { paused = false; lock(); } },
});
if (touch) initTouch(input);

$('go').onclick = () => {
  $('start').hidden = true; started = true; paused = false; lock();
  msg.textContent = touch ? '' : 'WASD move · mouse look · Esc menu';
  setTimeout(() => { msg.textContent = ''; }, 5000);
};
document.addEventListener('pointerlockchange', () => {
  if (!touch && started && !document.pointerLockElement && !menu.isOpen()) menu.open();
});
canvas.addEventListener('click', () => { if (started && !paused) lock(); });

async function boot() {
  try {
    const { createRenderer } = await import('./engine/renderer.js');
    const { buildStage } = await import('./levels/stage.js');
    const gfx = createRenderer(canvas);
    const world = buildStage(gfx.THREE, gfx.scene);
    const player = new Player(world.spawn.x, world.spawn.z);
    const STEP = 1 / 60;
    let acc = 0, last = performance.now();
    const frame = now => {
      requestAnimationFrame(frame);
      const dt = (now - last) / 1000; last = now;
      if (!paused) {
        acc = Math.min(acc + dt, 0.25);
        while (acc >= STEP) { player.step(input.sample(), world); acc -= STEP; }
      }
      player.applyTo(gfx.camera);
      gfx.lamp.position.copy(gfx.camera.position);
      gfx.render();
    };
    requestAnimationFrame(frame);
    $('go').disabled = false;
  } catch (e) {
    console.error(e);
    $('start').querySelector('p').textContent =
      'Could not start (' + e.message + '). Is lib/three.module.js vendored? See DESIGN.md.';
  }
}
boot();
