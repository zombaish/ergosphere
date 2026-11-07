// Samples input once per tick into a plain frame object (echo-friendly).
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.look = { x: 0, y: 0 };
    this.stick = { x: 0, y: 0 };
    this.btn = { w: false, portal: false, rewind: false };
    this.sens = 1;
    addEventListener('keydown', e => {
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('mousemove', e => {
      if (document.pointerLockElement === canvas) this.addLook(e.movementX * 0.0022, e.movementY * 0.0022);
    });
  }
  addLook(dx, dy) { this.look.x += dx * this.sens; this.look.y += dy * this.sens; }
  reset() { this.keys.clear(); this.stick.x = this.stick.y = 0; this.look.x = this.look.y = 0; }
  sample() {
    const k = c => (this.keys.has(c) ? 1 : 0);
    let mx = k('KeyD') + k('ArrowRight') - k('KeyA') - k('ArrowLeft') + this.stick.x;
    let mz = k('KeyW') + k('ArrowUp') - k('KeyS') - k('ArrowDown') + this.stick.y;
    const m = Math.hypot(mx, mz);
    if (m > 1) { mx /= m; mz /= m; }
    const f = {
      mx, mz, dyaw: this.look.x, dpitch: this.look.y,
      w: !!(k('ShiftLeft') || k('KeyF') || this.btn.w),
      portal: !!(k('KeyQ') || this.btn.portal),
      rewind: !!(k('KeyR') || this.btn.rewind),
    };
    this.look.x = this.look.y = 0;
    return f;
  }
}
