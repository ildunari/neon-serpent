// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Move handleCollisions, and world tick update logic here

import { INITIAL_AI, ORB_COUNT, WORLD_SIZE, ENEMY_NECK_GAP, CAM_SMOOTH } from '../constants'; // Need INITIAL_AI for respawn logic, ORB_COUNT, WORLD_SIZE, ENEMY_NECK_GAP for collisions, CAM_SMOOTH for update
import Snake, { createAISnake } from '../entities/Snake'; // Need Snake class and helper for respawn/creation
import Orb from '../entities/Orb'; // Need Orb class
import Particle from '../entities/Particle'; // Need Particle class
import { rand, randInt, dist, segRadius, lerp, playerSkip } from '../utils/math'; // Keep playerSkip for now, it seems used

export function createWorld() {
  const orbs = Array.from({ length: ORB_COUNT }, () =>
    new Orb(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE)));
  const player = new Snake(WORLD_SIZE / 2, WORLD_SIZE / 2, true);
  const snakes = [player];
  for (let i = 0; i < INITIAL_AI; i++) {
    const brains = ['gather', 'hunt', 'coward'];
    snakes.push(createAISnake(brains[i % brains.length]));
  }

  return {
    orbs,
    snakes,
    player,
    cam: { x: player.segs[0].x, y: player.segs[0].y },
    particles: [],
    deathInfo: null
  };
}

export function handleCollisions(w) {
  const head = w.player.segs[0];

  /* eat orbs */
  w.orbs = w.orbs.filter(o => {
    if (dist(head, o) < 10) {
      const grow  = o.type === 'rare' ? 10 : o.type === 'uncommon' ? 6 : 4;
      const score = o.type === 'rare' ? 50 : o.type === 'uncommon' ? 25 : 10;
      w.player.goal  += grow;
      w.player.score += score;
      w.player.speed  = 1.2 + w.player.length() / 60; // Use length() method
      w.player.glowFrames = 30;
      // start a new eat animation wave
      w.player.eatQueue.push(0);
      const sparks = 6 + (o.type === 'rare' ? 12 : o.type === 'uncommon' ? 6 : 0);
      for (let i = 0; i < sparks; i++) w.particles.push(new Particle(head.x, head.y));
      return false;
    }
    return true;
  });
  while (w.orbs.length < ORB_COUNT)
    w.orbs.push(new Orb(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE)));

  // enemy head colliding with player tail
  w.snakes.forEach(s => {
    if (s.isPlayer || s.dead) return;
    const eh = s.segs[0];
    for (let i = 8; i < w.player.segs.length; i++) { // Use constant or playerSkip? Original used 8
      if (dist(eh, w.player.segs[i]) < 8) { // Use constant or segRadius? Original used 8
        // kill enemy on touching tail
        s.dead = true;
        w.player.goal += Math.floor(s.length() / 2); // Use length() method
        w.player.score += s.score;
        break;
      }
    }
  });

  /* tail hits */
  const SELF_IGNORE  = playerSkip(w.player);   // speed‑aware for player
  const ENEMY_IGNORE = ENEMY_NECK_GAP; // Use imported constant

  w.snakes.forEach(s => {
    if (s.dead) return;
    const skip = s.isPlayer ? SELF_IGNORE : ENEMY_IGNORE;

    for (let i = skip; i < s.segs.length; i++) {
      // Use segRadius based on both snakes involved for better accuracy
      const hitR = segRadius(w.player.length()) + segRadius(s.length()) + 1; // Use length() method
      if (dist(head, s.segs[i]) < hitR) {
        // Death reason logic seems slightly different from backup, ensure it's intended
        if (s.isPlayer) { // Player hit their own tail
          w.deathInfo = { reason: 'self_tail_collision', segment: i };
          w.player.dead = true; // Kill the player specifically
        } else { // Player hit an enemy tail
          w.deathInfo = { reason: 'player_hit_enemy_tail', enemyColor: s.color };
          w.player.dead = true; // Kill the player
          // Original backup killed the *enemy* snake here and gave player points.
          // Current logic kills the *player*. Confirm which is intended.
          // If enemy should die:
          // s.dead = true;
          // w.player.goal += Math.floor(s.length() / 2);
          // w.player.score += s.score;
        }
        // If player dies, break outer loop?
        // break; // Break inner loop (segment check)
      }
    }
    // if (w.player.dead) break; // Break outer loop (snake check) if player died
  });


  /* clean dead snakes + respawn */
  // Filter out dead non-player snakes
  w.snakes = w.snakes.filter(s => !s.dead || s.isPlayer);

  // Respawn AI snakes if count is below target
  while (w.snakes.length < INITIAL_AI + 1) { // +1 for player
    const brains = ['gather', 'hunt', 'coward'];
    // Use createAISnake helper which places them randomly
    w.snakes.push(createAISnake(brains[randInt(0, brains.length - 1)]));
  }
}

export function updateWorld(world, dt, viewW, viewH) { // Add viewW, viewH params
  const p = world.player;

  if (p.dead) return world; // Don't update if player is dead

  // AI think and update
  world.snakes.forEach(s => s.think && s.think(world, p));
  world.snakes.forEach(s => s.update(world)); // Pass world to update if needed by logic inside
  world.particles.forEach(pr => pr.update());
  world.particles = world.particles.filter(pr => pr.life > 0);

  handleCollisions(world); // Handle collisions after updates

  // Check for player death *after* collisions
  if (world.player.dead) {
      if (!world.hasLoggedDeath) { // prevent spam
          console.log('Player died:', world.deathInfo ?? 'unknown cause');
          // console.table(lastMoves); // lastMoves is not available here
          world.hasLoggedDeath = true;
      }
      // Potentially set game state here or return a flag
  }

  // camera follows head, centered in view
  world.cam.x = lerp(world.cam.x, p.segs[0].x - viewW * 0.5, CAM_SMOOTH);
  world.cam.y = lerp(world.cam.y, p.segs[0].y - viewH * 0.5, CAM_SMOOTH);

  return world;
}
