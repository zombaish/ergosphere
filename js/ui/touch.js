const $ = id => document.getElementById(id);
export function initTouch(input) {
  $('touch').hidden = false;
  const base = $('stick'), nub = $('nub'), look = $('lookzone'), R = 50;
  let sid = null, lid = null, lx = 0, ly = 0;
  const move = e => {
    const r = base.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const m = Math.hypot(dx, dy);
    if (m > R) { dx *= R / m; dy *= R / m; }
    nub.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    input.stick.x = dx / R; input.stick.y = -dy / R;
  };
  const endStick = e => {
    if (e.pointerId !== sid) return;
    sid = null; input.stick.x = input.stick.y = 0; nub.style.transform = 'translate(-50%,-50%)';
  };
  base.addEventListener('pointerdown', e => { sid = e.pointerId; base.setPointerCapture(sid); move(e); });
  base.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); });
  base.addEventListener('pointerup', endStick); base.addEventListener('pointercancel', endStick);

  look.addEventListener('pointerdown', e => { lid = e.pointerId; lx = e.clientX; ly = e.clientY; look.setPointerCapture(lid); });
  look.addEventListener('pointermove', e => {
    if (e.pointerId !== lid) return;
    input.addLook((e.clientX - lx) * 0.006, (e.clientY - ly) * 0.006); lx = e.clientX; ly = e.clientY;
  });
  const endLook = e => { if (e.pointerId === lid) lid = null; };
  look.addEventListener('pointerup', endLook); look.addEventListener('pointercancel', endLook);

  document.querySelectorAll('#btns button').forEach(b => {
    const k = b.dataset.b;
    const L = { w: 'W', portal: 'PORTAL', rewind: 'REWIND' };
    if (L[k]) b.textContent = L[k];
    b.addEventListener('pointerdown', () => { input.btn[k] = true; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, () => { input.btn[k] = false; }));
  });
}
