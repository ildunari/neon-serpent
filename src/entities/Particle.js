// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { rand } from '../utils/math'; // Assuming rand is in math utils

export default class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = rand(-2, 2);
    this.vy = rand(-2, 2);
    this.life = 30; // Lifespan in ticks/frames
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx, cam) {
    if (this.life <= 0) return;
    const alpha = this.life / 30;
    // Draw particle relative to camera
    const sx = this.x - cam.x;
    const sy = this.y - cam.y;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(sx, sy, 2, 2); // Simple square particle
  }
}
