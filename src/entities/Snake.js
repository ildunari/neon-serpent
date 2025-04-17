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
    this.baseSpeed = 1.2;
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

  draw(ctx, cam) {
    if (this.dead) return;
    const baseColor = this.glowFrames > 0 ? '#ffffff' : this.color; // Glow white when recently eaten

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round'; // Smoother joins

    for (let i = 0; i < this.segs.length - 1; i++) {
      const p1 = this.segs[i], p2 = this.segs[i + 1];
      // Calculate screen coordinates relative to camera
      const sx1 = p1.x - cam.x, sy1 = p1.y - cam.y;
      const sx2 = p2.x - cam.x, sy2 = p2.y - cam.y;

      // Smooth eat-wave gradient: swell peaks at wave center, falls off over swellDist
      const baseW = 6 + (this.length() / 30); // Base width grows with length
      const swellDist = 5; // How many segments the swell affects
      // Find max swell factor based on proximity to any eat wave position
      const swellFactor = this.eatQueue.reduce((maxFactor, wavePos) => {
        const distFromWave = Math.abs(i - wavePos);
        const factor = Math.max(0, 1 - distFromWave / swellDist); // Linear falloff
        return Math.max(maxFactor, factor);
      }, 0);

      // Width pulse: up to 50% larger at wave center
      const currentWidth = baseW * (1 + swellFactor * 0.5);

      // Stronger pulse effect travelling along the body
      const isPulsing = swellFactor > 0.01;
      const strokeColor  = isPulsing ? '#ffffff' : baseColor;
      const shadowColor  = isPulsing ? '#ffffff' : baseColor; // Glow matches pulse
      const shadowBlur   = isPulsing ? 25 : 10; // More intense glow during pulse

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = currentWidth;
      ctx.shadowBlur  = shadowBlur;
      ctx.shadowColor = shadowColor;

      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      // Use quadratic curve for smoother segment connections if needed, or just lineTo
      // ctx.quadraticCurveTo((sx1 + sx2) / 2, (sy1 + sy2) / 2, sx2, sy2);
      ctx.lineTo(sx2, sy2); // Simple line is often sufficient
      ctx.stroke();
    }

    // Draw a visible head if the snake is only 1 segment long (or enhance head always)
    if (this.segs.length > 0) { // Check length > 0
        const headSeg = this.segs[0];
        const sx = headSeg.x - cam.x, sy = headSeg.y - cam.y;
        const headRadius = 4 + this.length() / 30; // Head size based on length

        ctx.fillStyle = baseColor;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 10; // Consistent head glow

        ctx.beginPath();
        ctx.arc(sx, sy, headRadius, 0, Math.PI * 2);
        ctx.fill();
    }

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
