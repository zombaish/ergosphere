// W-shift. Hold the W control to slide along W (0..6); release to settle on the nearest layer.
// A quick tap (< TAP s) flips the slide direction instead. Pure function of (state, frame).
const DT = 1 / 60, SPEED = 1.6, SETTLE = 4, MAXW = 6, R = 0.3, TAP = 0.22;
export const newWl = () => ({ w: 0, dir: 1, held: 0, w0: 0, tgt: 0, prev: false, blocked: false });

export function stepW(s, f, p, world) {
  let want = s.w;
  s.blocked = false;
  if (f.w) {
    if (!s.prev) { s.held = 0; s.w0 = Math.round(s.w); }
    s.held += DT;
    want = s.w + s.dir * SPEED * DT;
    if (want >= MAXW) { want = MAXW; s.dir = -1; } else if (want <= 0) { want = 0; s.dir = 1; }
  } else {
    if (s.prev) {
      if (s.held < TAP) { s.tgt = s.w0; s.dir = s.w0 >= MAXW ? -1 : s.w0 <= 0 ? 1 : -s.dir; }
      else s.tgt = Math.round(s.w);
    }
    const d = s.tgt - s.w, m = SETTLE * DT;
    want = Math.abs(d) <= m ? s.tgt : s.w + Math.sign(d) * m;
  }
  s.prev = !!f.w;
  if (want === s.w) return;
  // never slide into something solid; if already overlapping, allow (cannot get worse)
  if (world.wBlocked(p.x, p.z, R, want) && !world.wBlocked(p.x, p.z, R, s.w)) {
    s.blocked = true;
    if (!f.w) s.tgt = s.w0;
  } else s.w = want;
}
