// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { rand } from '../utils/math'; // Assuming rand is in math utils

export default class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const roll = Math.random(); // Use Math.random directly or import rand if it handles specific ranges
    if (roll < 0.02)       { this.type = 'rare';      this.r = 9; }
    else if (roll < 0.07)  { this.type = 'uncommon';  this.r = 7; }
    else                   { this.type = 'common';    this.r = 5; }
  }

  draw(ctx, cam) {
    const sx = this.x - cam.x, sy = this.y - cam.y;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r);
    const core = this.type === 'rare' ? '#ff4bff' :
                 this.type === 'uncommon' ? '#4bffec' : '#ffffff';
    g.addColorStop(0, core);
    g.addColorStop(1, 'rgba(0,255,255,0)'); // Assuming alpha fade is desired
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, this.r, 0, Math.PI * 2); ctx.fill();
  }
}
