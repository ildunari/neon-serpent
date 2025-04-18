// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { WORLD_SIZE } from '../constants'; // Assuming BG_SCALE is handled elsewhere or not needed for video

/**
 * Draw the entire game world to canvas context
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {object} world - current world state { orbs, snakes, particles, player, cam }
 * Note: Background drawing is now handled in GameCanvas.jsx
 * @param {number} [playerSkipCount=0] - Number of safe segments for the player snake
 * @param {number} [fps=0] - Current frames per second
 */
export function drawWorld(ctx, world, playerSkipCount = 0, fps = 0) {
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
  world.snakes.forEach(s => {
    if (s.isPlayer) {
      s.draw(ctx, world.cam, playerSkipCount);
    } else {
      s.draw(ctx, world.cam);
    }
  });

  /* Draw HUD */
  // Use fixed position for HUD elements
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left'; // Reset alignment
  ctx.shadowBlur = 0; // Ensure no leftover shadow from snake drawing
  // Draw Score
  ctx.fillText(`Score: ${world.player.score}`, 12, 20);
  // Draw FPS next to score
  ctx.textAlign = 'right'; // Align FPS to the right edge
  ctx.fillText(`FPS: ${fps}`, ctx.canvas.clientWidth - 12, 20); // Draw near top-right (CSS coordinates)
  ctx.textAlign = 'left'; // Reset alignment for potential future HUD elements

  // Restore context state
  ctx.restore();
}
