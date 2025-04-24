// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Move handleCollisions, and world tick update logic here

import { INITIAL_AI, ORB_COUNT, WORLD_SIZE, ENEMY_NECK_GAP } from '../constants'; // Removed CAM_SMOOTH
import Snake, { createAISnake } from '../entities/Snake'; // Need Snake class and helper for respawn/creation
import Orb from '../entities/Orb'; // Need Orb class
// Removed Particle import
import { rand, randInt, dist, segRadius, playerSkip } from '../utils/math'; // Removed lerp

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
      w.player.speed  = 2.4 + w.player.length() / 60;
      w.player.glowFrames = 30;
      // start a new eat animation wave
      w.player.eatQueue.push(0);
      // --- Use Particle Pool ---
      if (w.particleManager && typeof w.particleManager.get === 'function') {
          const sparks = 6 + (o.type === 'rare' ? 12 : o.type === 'uncommon' ? 6 : 0);
          for (let i = 0; i < sparks; i++) {
              w.particleManager.get(head.x, head.y); // Get particle from pool using player head and orb position
          }
      } else {
          console.warn("Particle manager not found when eating orb");
      }
      // --- End Particle Pool ---
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
        // kill enemy on touching player tail
        s.dead = true;
        w.player.goal += Math.floor(s.length() / 2); // Use length() method
        w.player.score += s.score;
        // Add particles for enemy death
        if (w.particleManager && typeof w.particleManager.get === 'function') {
            const deathSparks = 15 + Math.floor(s.length() / 2); // More sparks for longer snakes
            for (let j = 0; j < deathSparks; j++) {
                // Spread sparks along the body? Or just at head? Let's do head.
                w.particleManager.get(eh.x + rand(-5, 5), eh.y + rand(-5, 5));
            }
        }
        break; // Exit inner loop once enemy is dead
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
          // Add player death particles
          if (w.particleManager && typeof w.particleManager.get === 'function') {
              const deathSparks = 20;
              for (let j = 0; j < deathSparks; j++) {
                  w.particleManager.get(head.x + rand(-8, 8), head.y + rand(-8, 8));
              }
          }
        } else { // Player hit an enemy tail
          w.deathInfo = { reason: 'player_hit_enemy_tail', enemyColor: s.color };
          w.player.dead = true; // Kill the player
          // Add player death particles
          if (w.particleManager && typeof w.particleManager.get === 'function') {
              const deathSparks = 20;
              for (let j = 0; j < deathSparks; j++) {
                  w.particleManager.get(head.x + rand(-8, 8), head.y + rand(-8, 8));
              }
          }
        }
      }
    }
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

  handleCollisions(world); // Handle collisions after updates

  // Check for player death *after* collisions
  if (world.player.dead) {
      if (!world.hasLoggedDeath) { // prevent spam
          world.hasLoggedDeath = true;
      }
  }

  // camera follows head - set target position (lerp happens in GameCanvas)
  if (world.player.segs && world.player.segs[0]) {
      world.cam.x = world.player.segs[0].x;
      world.cam.y = world.player.segs[0].y;
  }

  return world;
}
