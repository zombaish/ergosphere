import { loadSettings, saveSettings } from './systems/save.js';
import { Input } from './engine/input.js';
import { Player } from './engine/player.js';
import { stepW } from './systems/wlayer.js';
import { initMenu } from './ui/menu.js';
import { initTouch } from './ui/touch.js';
import { initHud } from './ui/hud.js';
import { initNotebook } from './ui/notebook.js';

const $ = id => document.getElementById(id);
const canvas = $('game'), msg = $('msg');
const settings = loadSettings();
const touch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const input = new Input(canvas);
let started = false, paused = true;
let lastLayer = -1, wMoved = false, wasBlocked = false;
let game = null, player = null, target = null, holding = false, holdT = 0;
const pos = { x: 0, z: 0 };
const HOLD = 1.5; // seconds to hold Reset
const lock = () => { if (!touch) try { canvas.requestPointerLock(); } catch {} };

const hud = initHud(touch, { use: () => use(), notebook: () => toggleNotebook(), reset: v => { holding = v; } });
const notebook = initNotebook({ close: () => closeNotebook() });

const menu = initMenu(settings, saveSettings, {
  onChange: s => { input.sens = s.sens; },
  onOpen: () => { paused = true; input.reset(); notebook.close(); document.exitPointerLock?.(); },
  onClose: () => { if (started) { paused = false; lock(); } },
});
if (touch) initTouch(input);

function use() {
  if (!started || paused || !game) return;
  if (target) game.activate(target, pos.x, pos.z); else hud.clearSay();
}
function openNotebook() {
  if (!started || !game || menu.isOpen()) return;
  paused = true; input.reset(); document.exitPointerLock?.();
  notebook.open(game.notebookView()); hud.ping(false);
}
function closeNotebook() {
  notebook.close();
  if (started && !menu.isOpen()) { paused = false; lock(); }
}
const toggleNotebook = () => (notebook.isOpen() ? closeNotebook() : openNotebook());
function wUi() {
  const wl = game.state.wl, lay = Math.round(wl.w);
  hud.setW(wl.w, wl.dir);
  if (!wMoved && wl.held > 0.3) { wMoved = true; game.emit('w:move'); }
  if (Math.abs(wl.w - lay) < 0.02 && lay !== lastLayer) { lastLayer = lay; game.emit('w:' + lay); }
  if (wl.blocked && !wasBlocked) hud.toast('Blocked: something solid fills that layer here.');
  wasBlocked = wl.blocked;
}
function doReset() {
  const safe = game.reset();
  if (!safe) return;
  const t = Number.isFinite(player.x) ? player : (player.pos && Number.isFinite(player.pos.x) ? player.pos : null);
  if (t) { t.x = safe.x; t.z = safe.z; } else console.warn('reset: could not find player position');
}

addEventListener('keydown', e => {
  if (e.repeat || !started || menu.isOpen()) return;
  if (e.code === 'KeyN' || e.code === 'Tab') { e.preventDefault(); toggleNotebook(); }
  else if (paused) return;
  else if (e.code === 'KeyE') use();
  else if (e.code === 'KeyX') holding = true;
});
addEventListener('keyup', e => { if (e.code === 'KeyX') holding = false; });

$('go').onclick = () => {
  $('start').hidden = true; started = true; paused = false; lock();
  hud.show(); game.start();
  msg.textContent = touch ? 'USE interacts · NOTES opens notebook · hold RESET if stuck'
    : 'WASD move · mouse look · E use · N notebook · hold X reset · Esc menu';
  setTimeout(() => { msg.textContent = ''; }, 7000);
};
document.addEventListener('pointerlockchange', () => {
  if (!touch && started && !document.pointerLockElement && !menu.isOpen() && !notebook.isOpen()) menu.open();
});
canvas.addEventListener('click', () => { if (started && !paused) lock(); });

async function boot() {
  try {
    const { createRenderer } = await import('./engine/renderer.js');
    const { buildLevel } = await import('./engine/rooms.js');
    const { createGame } = await import('./systems/game.js');
    const data = (await import('./levels/deck0.js')).default;
    const gfx = createRenderer(canvas);
    const world = buildLevel(gfx.THREE, gfx.scene, data);
    game = createGame(data, world, {
      room: n => hud.setRoom(n),
      toast: m => hud.toast(m),
      say: (t, x) => hud.say(t, x),
      inv: names => hud.setInv(names),
      entry: e => { hud.toast('Notebook: ' + e.title); hud.ping(true); },
      hint: () => { hud.toast('New hint in Notebook'); hud.ping(true); },
    });
    player = new Player(world.spawn.x, world.spawn.z);
    const cam = gfx.camera.position, dir = new gfx.THREE.Vector3();
    const STEP = 1 / 60;
    let acc = 0, last = performance.now();
    const frame = now => {
      requestAnimationFrame(frame);
      const dt = (now - last) / 1000; last = now;
      if (!paused) {
        acc = Math.min(acc + dt, 0.25);
        while (acc >= STEP) {
          const f = input.sample();
          player.step(f, world);
          stepW(game.state.wl, f, player, world);
          world.setW(game.state.wl.w);
          acc -= STEP;
        }
      }
      player.applyTo(gfx.camera);
      if (game) wUi();
      gfx.lamp.position.copy(gfx.camera.position);
      if (!paused) {
        gfx.camera.getWorldDirection(dir);
        const n = Math.hypot(dir.x, dir.z) || 1;
        pos.x = cam.x; pos.z = cam.z;
        game.update(Math.min(dt, 0.1), cam.x, cam.z);
        target = game.target(cam.x, cam.z, dir.x / n, dir.z / n);
        hud.setPrompt(target ? (touch ? 'USE' : 'E') + ' \u00b7 ' + target.prompt : '');
        if (holding) {
          holdT += dt; hud.setReset(holdT / HOLD);
          if (holdT >= HOLD) { doReset(); holding = false; holdT = 0; hud.setReset(0); }
        } else if (holdT) { holdT = 0; hud.setReset(0); }
      }
      world.update(paused ? 0 : Math.min(dt, 0.1), game.state);
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
