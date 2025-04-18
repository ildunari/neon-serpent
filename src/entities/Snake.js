// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { WORLD_SIZE } from '../constants';
import { rand, randInt, dist } from '../utils/math';

export default class Snake {
  constructor(x, y, isPlayer = false, brain = 'gather') {
    this.segs = [{ x, y }];          // head first
    this.goal = 6;                   // target length (# segments)
    this.isPlayer = isPlayer;
    // AI skill now spans 0.2 – 0.9 so some are clumsy, some are sharp
    this.skill = this.isPlayer ? 1 : rand(0.2, 0.9);
    this.baseSpeed = 2.4;
    // AI speed depends on skill, player speed is base (updated on eat)
    this.speed = this.baseSpeed * (this.isPlayer ? 1 : (0.5 + this.skill * 0.5));
    this.dir = { x: randInt(0,1) * 2 - 1, y: 0 }; // Start horizontal or vertical
    if (this.dir.x !== 0) this.dir.y = 0; else this.dir.y = randInt(0,1) * 2 - 1;

    this.brain = brain;
    this.score = 0;
    this.dead = false;
    this.color = isPlayer ? '#00eaff' :
      (brain === 'hunt' ? '#ff4b4b' : brain === 'coward' ? '#ffcf1b' : '#6cff6c');
    this.glowFrames = 0;
    // queue of segment indices for eat animations
    this.eatQueue = [];
    // control the speed of the eat wave animation (smaller = slower)
    this.eatSpeed = 0.5;
    this.trailPoints = []; // Add array to store recent head positions for trail effect
    this.maxTrailPoints = 3; // Reduced from 5
  }

  /* AI steering */
  think(world, player) {
    if (this.isPlayer || this.dead) return; // Don't think if player or dead
    // AI reaction based on skill: skip thinking occasionally for lower-skilled snakes
    if (Math.random() > this.skill) return;

    const head = this.segs[0];
    // avoid player's tail segments
    const avoidThresh = 10 + (1 - this.skill) * 20;   // 10–30 px depending on skill
    for (let i = 8; i < player.segs.length; i++) { // Start check further back on player tail
      const ts = player.segs[i];
      if (dist(head, ts) < avoidThresh) {
        // steer away from tail collision
        const fleeAngle = Math.atan2(head.y - ts.y, head.x - ts.x);
        this.dir.x = Math.cos(fleeAngle);
        this.dir.y = Math.sin(fleeAngle);
        return; // Prioritize avoidance
      }
    }

    let target = null;
    // Simple brain logic (can be expanded)
    if (this.brain === 'gather') {
       // Find closest orb (simple version: random orb)
       if (world.orbs.length > 0) {
         target = world.orbs.reduce((closest, orb) => {
            const d = dist(head, orb);
            return d < dist(head, closest) ? orb : closest;
         }, world.orbs[0]);
       } else {
         target = { x: rand(0, WORLD_SIZE), y: rand(0, WORLD_SIZE) }; // Wander if no orbs
       }
    } else if (this.brain === 'hunt') {
      // Target player head or closest other snake head
      const others = world.snakes.filter(s => s !== this && !s.dead);
      if (Math.random() < 0.5 || others.length === 0) { // Target player 50% or if no others
        target = player.segs[0];
      } else { // Target closest other snake
        const closest = others.reduce((best, s) =>
          (dist(head, s.segs[0]) < dist(head, best.segs[0]) ? s : best),
          others[0]);
        target = closest.segs[0];
      }
    } else if (this.brain === 'coward') {
      const playerHead = player.segs[0];
      const d = dist(head, playerHead);
      // Flee if player is bigger and close
      if (player.length() > this.length() && d < 300) {
        target = { x: head.x - (playerHead.x - head.x),
                   y: head.y - (playerHead.y - head.y) }; // Opposite direction
      } else { // Otherwise, gather orbs like 'gather' brain
        if (world.orbs.length > 0) {
          target = world.orbs.reduce((closest, orb) => {
             const d = dist(head, orb);
             return d < dist(head, closest) ? orb : closest;
          }, world.orbs[0]);
        } else {
          target = { x: rand(0, WORLD_SIZE), y: rand(0, WORLD_SIZE) }; // Wander
        }
      }
    }

    if (target) {
      const angle = Math.atan2(target.y - head.y, target.x - head.x);
      // Apply skill-based wobble/inaccuracy
      const wobble = (1 - this.skill) * 0.5; // up to ±0.5 rad inaccuracy
      const offset = rand(-wobble, wobble);
      const finalAngle = angle + offset;
      this.dir.x = Math.cos(finalAngle);
      this.dir.y = Math.sin(finalAngle);
    }
  }


  update(world) {
    if (this.dead) return;
    // compute new head with wrap-around world
    const head = {
      x: (this.segs[0].x + this.dir.x * this.speed + WORLD_SIZE) % WORLD_SIZE,
      y: (this.segs[0].y + this.dir.y * this.speed + WORLD_SIZE) % WORLD_SIZE
    };
    this.segs.unshift(head);

    // Add head to trail points (only for player)
    if (this.isPlayer) {
      this.trailPoints.unshift({ x: head.x, y: head.y });
      if (this.trailPoints.length > this.maxTrailPoints) {
        this.trailPoints.pop();
      }
    }

    // Grow snake if needed, otherwise remove tail segment
    if (this.segs.length > this.goal) {
        this.segs.pop();
    }
    // advance eat animation positions at reduced speed and remove finished
    this.eatQueue = this.eatQueue
      .map(p => p + this.eatSpeed)
      .filter(p => p < this.segs.length);

    // Decay glow effect
    if (this.glowFrames > 0) this.glowFrames--;
  }

  length() { return this.segs.length; }

  draw(ctx, cam, skipCount = 0) {
    if (this.dead) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // --- Player Specific Enhancements ---
    if (this.isPlayer) {
      // 1. Trail Effect (Optimized)
      const maxTrailSize = 3; // Slightly reduced size to match fewer points
      this.trailPoints.forEach((p, index) => {
        const trailProgress = index / this.maxTrailPoints;
        const sx = p.x - cam.x;
        const sy = p.y - cam.y;
        const trailSize = maxTrailSize * (1 - trailProgress);
        const trailAlpha = 0.3 * (1 - trailProgress); // Reduced alpha

        ctx.fillStyle = `rgba(0, 234, 255, ${trailAlpha})`; // Player color with alpha
        // --- Optimization: Reduce trail glow ---
        ctx.shadowBlur = 3 * (1 - trailProgress); // Reduced from 5
        ctx.shadowColor = `rgba(0, 234, 255, ${trailAlpha / 2})`; // Dimmer glow

        ctx.beginPath();
        ctx.arc(sx, sy, trailSize, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // --- End Player Specific Enhancements ---

    // --- Draw Snake Body Segments ---
    const baseColor = this.glowFrames > 0 ? '#ffffff' : this.color;
    const outlineColor = '#ffffff'; // White outline for contrast
    const playerGlowColor = '#ffff00'; // Bright yellow glow for player
    // --- Adjusted glow blur values ---
    const playerGlowBlur = 9;  // User requested value (was 6, originally 12)
    // AI Glow removed (aiGlowBlur not needed here)

    for (let i = 0; i < this.segs.length - 1; i++) {
      const p1 = this.segs[i], p2 = this.segs[i + 1];
      const sx1 = p1.x - cam.x, sy1 = p1.y - cam.y;
      const sx2 = p2.x - cam.x, sy2 = p2.y - cam.y;

      // --- Calculate Segment Width (incorporating existing eat wave) ---
      const baseW = 7 + (this.length() / 30);
      const swellDist = 5;
      const swellFactor = this.eatQueue.reduce((maxFactor, wavePos) => {
        const distFromWave = Math.abs(i - wavePos);
        const factor = Math.max(0, 1 - distFromWave / swellDist);
        return Math.max(maxFactor, factor);
      }, 0);
      const currentWidth = baseW * (1 + swellFactor * 0.5);
      const isPulsing = swellFactor > 0.01;

      // --- Determine Colors and Glow (AI Glow Removed) ---
      let segmentStrokeStyle;
      let segmentShadowColor = 'transparent';
      let segmentShadowBlur = 0;

      const isSafePlayerSegment = this.isPlayer && skipCount > 0 && i < skipCount;

      if (isSafePlayerSegment) {
        segmentStrokeStyle = '#0099aa';
        segmentShadowColor = '#0099aa';
        segmentShadowBlur = 3;
      } else if (this.isPlayer) {
        // Player (dangerous segments) or pulsing player
        segmentStrokeStyle = isPulsing ? '#ffffff' : baseColor;
        segmentShadowColor = playerGlowColor;
        // Use the adjusted playerGlowBlur
        segmentShadowBlur = isPulsing ? playerGlowBlur + 4 : playerGlowBlur;
      } else {
        // AI Snake (No Glow except pulsing)
        segmentStrokeStyle = isPulsing ? '#ffffff' : baseColor;
        if (isPulsing) {
          segmentShadowColor = '#ffffff'; // White glow when pulsing
          segmentShadowBlur = 15; // Pulsing AI glow (keep this intense for feedback)
        } else {
          // No glow/shadow for standard AI segments
          segmentShadowColor = 'transparent';
          segmentShadowBlur = 0;
        }
      }

      // --- Draw Outline (Player Only) ---
      if (this.isPlayer) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = currentWidth + 2;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }

      // --- Draw Main Segment with Glow ---
      ctx.strokeStyle = segmentStrokeStyle;
      ctx.lineWidth = currentWidth;
      ctx.shadowBlur = segmentShadowBlur;
      ctx.shadowColor = segmentShadowColor;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }
    // --- End Snake Body Segments ---

    // --- Draw Head (AI Glow Removed) ---
    if (this.segs.length > 0) {
      const headSeg = this.segs[0];
      const sx = headSeg.x - cam.x, sy = headSeg.y - cam.y;
      let headRadius = 5 + this.length() / 30;
      const headColor = this.glowFrames > 0 ? '#ffffff' : this.color;
      let headShadowColor = 'transparent';
      let headShadowBlur = 0;

      if (this.isPlayer) {
        headRadius += 1;
        headShadowColor = playerGlowColor;
        // Use adjusted playerGlowBlur for head
        headShadowBlur = playerGlowBlur + 2;

        // Draw Outline
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(sx, sy, headRadius + 1, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.glowFrames > 0) {
         // AI head pulsing white when recently eaten (No colored glow)
         headShadowColor = '#ffffff'; // Pulse white
         headShadowBlur = 15; // Keep pulse intense
      }

      // Draw Main Head Fill with Glow
      ctx.fillStyle = headColor;
      ctx.shadowColor = headShadowColor;
      ctx.shadowBlur = headShadowBlur;
      ctx.beginPath();
      ctx.arc(sx, sy, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Player Eyes (Reverted Shadow Blur)
      if (this.isPlayer) {
        ctx.fillStyle = '#ffffff'; // White eyes
        // --- Reverted eye glow ---
        ctx.shadowBlur = 3; // Reverted from 1
        ctx.shadowColor = '#ffffff';
        const angle = Math.atan2(this.dir.y, this.dir.x);
        const eyeDist = headRadius * 0.5;
        const eyeRadius = headRadius * 0.2;
        // Eye 1
        const eye1X = sx + Math.cos(angle + Math.PI / 4) * eyeDist;
        const eye1Y = sy + Math.sin(angle + Math.PI / 4) * eyeDist;
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        // Eye 2
        const eye2X = sx + Math.cos(angle - Math.PI / 4) * eyeDist;
        const eye2Y = sy + Math.sin(angle - Math.PI / 4) * eyeDist;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // --- End Head ---

    ctx.shadowBlur = 0; // Reset shadow for other draw calls
  }
}

/**
 * Helper to create AI snake with given brain
 */
export function createAISnake(brain) {
  // Place new AI snakes randomly in the world
  const x = rand(0, WORLD_SIZE);
  const y = rand(0, WORLD_SIZE);
  return new Snake(x, y, false, brain);
}
