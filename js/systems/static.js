// Static: the paradox/anxiety meter (0..1). Anything that should raise it calls bump(); it drains slowly when W is still.
const DT = 1 / 60, W_RATE = 0.03, DRAIN = 0.012;
export const bump = (state, v) => { state.static = Math.min(1, Math.max(0, state.static + v)); };
export function stepStatic(state) {
  const w = state.wl.w, moved = Math.abs(w - state.stx.lw);
  state.stx.lw = w;
  if (state.stFreeze) return; // debug: hold the value
  if (moved > 0.0001) bump(state, moved * W_RATE); // W-sickness
  else bump(state, -DRAIN * DT);
}
