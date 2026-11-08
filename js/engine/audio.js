// Procedural audio (WebAudio, no assets): drone, W-slide whoosh, heartbeat (rate/volume follow Static),
// footsteps and small sfx. Call start() from a user gesture, then update() every frame.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createAudio() {
  let ctx = null, master = null, white = null, brown = null, drone = null, whoosh = null;
  let vol = 0.8, nextBeat = 0, lastStep = 0, lastW = 0, foot = 0, muted = false;
  try { muted = localStorage.getItem('ergo_mute') === '1'; } catch {}

  const gain = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const filt = (type, f, q = 1) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; };
  const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(); return o; };
  const loop = buf => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  const buffer = fn => {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); let l = 0;
    for (let i = 0; i < d.length; i++) d[i] = fn(l, v => { l = v; });
    return b;
  };
  // one enveloped tone: sweeps f0 -> f1 over dur, fast attack, exponential decay
  const tone = (t, f0, f1, dur, vol, type = 'sine', dest = master) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  };
  const burst = (t, f, q, dur, vol) => {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = white; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(filt('bandpass', f, q)).connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  };

  function build() {
    master = ctx.createGain(); master.gain.value = muted ? 0 : vol;
    const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    white = buffer((l, set) => Math.random() * 2 - 1);
    brown = buffer((l, set) => { const v = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; set(v); return v * 3.5; });
    // drone: detuned saws through a slowly breathing low-pass, plus sub and rumble
    const dg = gain(0.16); dg.connect(master);
    const lp = filt('lowpass', 170, 3); lp.connect(dg);
    const o1 = osc('sawtooth', 55), o2 = osc('sawtooth', 55.7), o3 = osc('sine', 27.5);
    o1.connect(lp); o2.connect(lp); o3.connect(dg);
    const lfo = osc('sine', 0.07), lg = gain(70); lfo.connect(lg); lg.connect(lp.frequency);
    const rg = gain(0.5); loop(brown).connect(filt('lowpass', 110)).connect(rg); rg.connect(master);
    const sg = gain(0.0045), tr = osc('sine', 0.13), tg = gain(0.003);
    osc('sine', 1318).connect(sg); osc('sine', 1325).connect(sg); tr.connect(tg); tg.connect(sg.gain); sg.connect(master);
    drone = { o1, o2, o3 };
    // W-slide whoosh: noise whose pitch follows W, loud only while W is changing
    const wf = filt('bandpass', 400, 3), wg = gain(0);
    loop(white).connect(wf); wf.connect(wg); wg.connect(master);
    whoosh = { g: wg, f: wf };
  }

  const beat = (t, v) => { tone(t, 70, 40, 0.2, v); tone(t + 0.2, 62, 36, 0.2, v * 0.7); };
  const footstep = t => {
    foot ^= 1;
    burst(t, 140 + Math.random() * 80, 1.2, 0.09, 0.18);
    tone(t, foot ? 90 : 80, 50, 0.1, 0.16);
  };

  return {
    start() {
      if (ctx) { ctx.resume(); return; }
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); build(); } catch (e) { console.warn('audio off', e); ctx = null; return; }
      document.addEventListener('visibilitychange', () => { if (ctx) document.hidden ? ctx.suspend() : ctx.resume(); });
    },
    // s = { bob, speed, w, paused, stat }
    update(dt, s) {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, k = 1 + s.w * 0.035;
      master.gain.setTargetAtTime(muted ? 0 : s.paused ? vol * 0.4 : vol, t, 0.15);
      drone.o1.frequency.setTargetAtTime(55 * k, t, 0.3);
      drone.o2.frequency.setTargetAtTime(55.7 * k, t, 0.3);
      drone.o3.frequency.setTargetAtTime(27.5 * k, t, 0.3);
      const v = dt > 0 ? Math.abs(s.w - lastW) / dt : 0; lastW = s.w;
      whoosh.g.gain.setTargetAtTime(clamp(v * 0.1, 0, 0.2), t, 0.08);
      whoosh.f.frequency.setTargetAtTime(250 + s.w * 220, t, 0.1);
      if (s.paused) return;
      const st = clamp(s.stat || 0, 0, 1);
      if (t >= nextBeat) { beat(t + 0.02, 0.05 + st * 0.5); nextBeat = t + 60 / (52 + st * 80); }
      const idx = Math.floor(s.bob / Math.PI);
      if (idx !== lastStep) { lastStep = idx; if (s.speed > 0.1) footstep(t); }
    },
    sfx(name) {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime;
      if (name === 'door') { tone(t, 110, 70, 0.5, 0.08, 'sawtooth'); tone(t + 0.45, 80, 40, 0.25, 0.3); }
      else if (name === 'locked') { tone(t, 220, 215, 0.07, 0.05, 'square'); tone(t + 0.12, 220, 215, 0.07, 0.05, 'square'); }
      else if (name === 'unlock') { tone(t, 520, 530, 0.12, 0.07); tone(t + 0.1, 780, 790, 0.18, 0.07); }
      else if (name === 'pickup') tone(t, 660, 990, 0.2, 0.08);
      else if (name === 'note') tone(t, 880, 880, 0.25, 0.04);
      else if (name === 'settle') tone(t, 300, 200, 0.06, 0.08);
      else if (name === 'blocked') tone(t, 80, 70, 0.18, 0.12, 'sawtooth');
      else if (name === 'reset') tone(t, 220, 90, 0.4, 0.1);
    },
    setVolume(v) { vol = clamp(v, 0, 1); },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('ergo_mute', muted ? '1' : '0'); } catch {}
      return muted;
    },
    isMuted: () => muted,
  };
}
