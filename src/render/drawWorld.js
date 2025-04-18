// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { WORLD_SIZE } from '../constants'; // Assuming BG_SCALE is handled elsewhere or not needed for video

/**
 * Draw the entire game world to canvas context
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {object} world - current world state { orbs, snakes, particles, player, cam }
 * Note: Background drawing is now handled in GameCanvas.jsx
 */
export function drawWorld(ctx, world) {
  // Background is drawn in GameCanvas.jsx, so we only draw entities and HUD here.

  // Save context state before applying transformations/styles
  ctx.save();

  // Draw world boundary (red dashed border)
  ctx.strokeStyle = 'rgba(255,0,0,0.35)';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(-world.cam.x, -world.cam.y, WORLD_SIZE, WORLD_SIZE);
  ctx.setLineDash([]);

  /* Draw entities */
  // Ensure entities have draw methods that accept (ctx, world.cam)
  world.orbs.forEach(o => o.draw(ctx, world.cam));
  world.particles.forEach(p => p.draw(ctx, world.cam));
  world.snakes.forEach(s => s.draw(ctx, world.cam));

  /* Draw HUD */
  // Use fixed position for HUD elements
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left'; // Reset alignment
  ctx.shadowBlur = 0; // Ensure no leftover shadow from snake drawing
  ctx.fillText(`Score: ${world.player.score}`, 12, 20);
  // Add other HUD elements as needed (e.g., length, high score)

  // Restore context state
  ctx.restore();
}
