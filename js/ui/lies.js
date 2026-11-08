// "Lying HUD": above ~0.4 Static the instruments sometimes show wrong values for a couple of seconds.
// Display only: never touches game logic. Changes at most every 5 s, so there are no flashes.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SEG = 5, LEN = 2.2, SYM = '#%?/\\*';
export const reverse = s => [...s].reverse().join('');
export function lies(st, t) {
  const seg = Math.floor(t / SEG), r = k => hash(seg * 7 + k);
  const on = t - seg * SEG < LEN && r(0) < clamp((st - 0.4) * 1.6, 0, 0.9);
  return {
    on,
    w: w => (on ? clamp(w + (r(1) < 0.5 ? -1 : 1) * (1 + Math.floor(r(2) * 2)), 0, 6) : w),
    dir: d => (on && r(3) < 0.5 ? -d : d),
    text: s => {
      if (!on || st < 0.55 || !s) return s;
      if (st > 0.85 && r(4) < 0.5) return reverse(s);
      const a = [...s];
      for (let i = 0; i < (st > 0.8 ? 3 : 1); i++) a[Math.floor(r(5 + i) * a.length)] = SYM[Math.floor(r(9 + i) * SYM.length)];
      return a.join('');
    },
    tip: s => (on && st > 0.85 ? reverse(s) : s),
  };
}
