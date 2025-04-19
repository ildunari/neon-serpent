import orbSprites from '../assets/orbSprites';
import { ORB_RADIUS } from '../constants';

// extracted from NeonSerpentGame_backup.jsx on 2025-04-17

export default class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.pulseOffset = Math.random() * Math.PI * 2; // Random start for pulse
    const roll = Math.random();
    if (roll < 0.02)      { this.type = 'rare';      this.baseR = ORB_RADIUS; this.coreColor = '#ff4bff'; this.frame = 2; }
    else if (roll < 0.07) { this.type = 'uncommon';  this.baseR = ORB_RADIUS; this.coreColor = '#4bffec'; this.frame = 1; }
    else                  { this.type = 'common';    this.baseR = ORB_RADIUS; this.coreColor = '#ffffff'; this.frame = 0; }
    this.r = this.baseR; // Initialize radius
  }

  draw(ctx, cam) {
    // Pulse Calculation (temporarily disabled for sprite transition)
    // const pulseSpeed = 0.003;
    // const pulseMagnitude = 0.1; // 10% size variation
    // this.r = this.baseR * (1 + Math.sin(Date.now() * pulseSpeed + this.pulseOffset) * pulseMagnitude);

    const sx = this.x - cam.x;
    const sy = this.y - cam.y;

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.coreColor;

    if (orbSprites.complete && orbSprites.naturalWidth > 0) {
      // Use sprite image
      const frameWidth = 32; // Width of each frame in the sprite sheet
      const frameHeight = 32; // Height of each frame
      const spriteX = this.frame * frameWidth;
      const spriteY = 0; // Only one row of sprites
      const drawSize = this.r * 2; // Draw size based on radius

      ctx.drawImage(
        orbSprites,
        spriteX, spriteY,
        frameWidth, frameHeight,
        sx - this.r, sy - this.r, // Center the sprite
        drawSize, drawSize
      );
    } else {
      // Fallback: Gradient Fill (Kept from original)
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r);
      g.addColorStop(0, this.coreColor);
      // Make outer part of gradient transparent but retain core color for shadow
      g.addColorStop(1, this.coreColor + '00'); // Add alpha transparency

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, this.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset shadow for other draw calls
    ctx.shadowBlur = 0;
  }
}
