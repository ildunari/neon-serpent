// extracted from NeonSerpentGame_backup.jsx on 2025-04-17

export default class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.pulseOffset = Math.random() * Math.PI * 2; // Random start for pulse
    const roll = Math.random();
    if (roll < 0.02)       { this.type = 'rare';      this.baseR = 11; this.coreColor = '#ff4bff'; }
    else if (roll < 0.07)  { this.type = 'uncommon';  this.baseR = 9;  this.coreColor = '#4bffec'; }
    else                   { this.type = 'common';    this.baseR = 7;  this.coreColor = '#ffffff'; }
    this.r = this.baseR; // Initialize radius
  }

  draw(ctx, cam) {
    // Pulse Calculation
    const pulseSpeed = 0.003;
    const pulseMagnitude = 0.1; // 10% size variation
    this.r = this.baseR * (1 + Math.sin(Date.now() * pulseSpeed + this.pulseOffset) * pulseMagnitude);

    const sx = this.x - cam.x, sy = this.y - cam.y;

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.coreColor;

    // Gradient Fill (Kept from original)
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r);
    g.addColorStop(0, this.coreColor);
    // Make outer part of gradient transparent but retain core color for shadow
    g.addColorStop(1, this.coreColor + '00'); // Add alpha transparency

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, this.r, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for other draw calls
    ctx.shadowBlur = 0;
  }
}
