import { moveCircle } from './collision.js';
const DT = 1 / 60, SPEED = 3.2, R = 0.3, EYE = 1.6;
export class Player {
  constructor(x, z) { this.x = x; this.z = z; this.yaw = 0; this.pitch = 0; this.bob = 0; this.speed = 0; }
  step(f, world) {
    this.yaw -= f.dyaw;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - f.dpitch));
    const s = Math.sin(this.yaw), c = Math.cos(this.yaw);
    moveCircle(this, (c * f.mx - s * f.mz) * SPEED * DT, (-s * f.mx - c * f.mz) * SPEED * DT, R, world);
    this.speed = Math.hypot(f.mx, f.mz);
    this.bob += this.speed * DT * 9;
  }
  applyTo(cam) {
    cam.position.set(this.x, EYE + Math.sin(this.bob) * 0.025 * Math.min(1, this.speed), this.z);
    cam.rotation.order = 'YXZ';
    cam.rotation.set(this.pitch, this.yaw, 0);
  }
}
