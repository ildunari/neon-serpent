// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Move handleCollisions, and world tick update logic here

export function createWorld() {
  const orbs = Array.from({ length: ORB_COUNT }, () =>
    new Orb(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE)));
  const player = new Snake(WORLD_SIZE / 2, WORLD_SIZE / 2, true);
  const snakes = [player];
  const brains = ['gather', 'hunt', 'coward'];
  for (let i = 0; i < INITIAL_AI; i++) {
    snakes.push(
      new Snake(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE), false,
                brains[i % brains.length])
    );
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
      w.player.speed  = 1.2 + w.player.length() / 60;
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
    for (let i = 8; i < w.player.segs.length; i++) {
      if (dist(eh, w.player.segs[i]) < 8) {
        // kill enemy on touching tail
        s.dead = true;
        w.player.goal += Math.floor(s.length() / 2);
        w.player.score += s.score;
        break;
      }
    }
  });

  /* tail hits */
  const SELF_IGNORE  = playerSkip(w.player);   // speed‑aware for player
  const ENEMY_IGNORE = ENEMY_NECK_GAP;

  w.snakes.forEach(s => {
    if (s.dead) return;
    const skip = s.isPlayer ? SELF_IGNORE : ENEMY_IGNORE;

    for (let i = skip; i < s.segs.length; i++) {
      const hitR = segRadius(w.player.length()) + segRadius(s.length()) + 1;
      if (dist(head, s.segs[i]) < hitR) {
        if (s.isPlayer) {
          w.deathInfo = { reason: 'self_tail_collision', segment: i };
        } else {
          w.deathInfo = { reason: 'player_hit_enemy_tail', enemyColor: s.color };
        }
        s.dead = true;
        w.player.goal  += Math.floor(s.length() / 2);
        w.player.score += s.score;
        break;
      }
    }
  });
}

export function updateWorld(world, dt) {
  const p = world.player;
  // AI think and update
  world.snakes.forEach(s => s.think && s.think(world, p));
  world.snakes.forEach(s => s.update(world));
  world.particles.forEach(pr => pr.update());
  world.particles = world.particles.filter(pr => pr.life > 0);
  handleCollisions(world);
  world.cam.x = lerp(world.cam.x, p.segs[0].x, CAM_SMOOTH);
  world.cam.y = lerp(world.cam.y, p.segs[0].y, CAM_SMOOTH);
  return world;
}

export { createWorld, handleCollisions, updateWorld };
