# Gameplay Expansion Roadmap

This document outlines planned features, designs, and rough API thoughts for future Neon Serpent enhancements.

## 1. Smarter AI Brains
- Introduce modular brain strategies for enemy snakes.
- API: `createAISnake(brain: 'predator' | 'ambush' | 'pack')` returns a snake with the specified strategy.

## 2. Predator, Ambush, Pack
- **Predator**: Predicts player's future position and intercepts.
  - Design: Use linear projection of player heading.
  - API: `new Snake(x, y, false, 'predator')`.
- **Ambush**: Hides behind orbs, attacks when player is near.
  - Design: Compute nearest orb clusters.
- **Pack**: Multiple AI snakes coordinate to surround.
  - Design: Share world state and assign formation roles.

## 3. Difficulty Tiers
- Rookie, Normal, Brutal modes.
  - Tune reaction delay, path jitter, aggressiveness.
  - API: Pass `difficulty` param to `createWorld({ difficulty })`.

## 4. Dynamic World Scaling
- Scale world size and orb density per level or time.
- API: `updateWorld(world, timestamp)` dynamically adjusts `world.size` and spawn rates.

## 5. Timed AI Spawning
- Start with 6 AI snakes; every 3 minutes spawn +2 (cap 20).
- API: `world.maxSnakes = 20; world.spawnInterval = 180_000;`

## 6. Performance Safeguard
- Despawn far-off dead segments to free memory.
- API: In `updateWorld`, filter `snake.segs` by distance threshold.

## 7. Power‑Ups (Orb Variants)
- Introduce special orb types with sprites.
  - Turbo: speed burst (5 s).
  - Phase: no-collision (3 s).
  - Magnet: auto-attract orbs within 250 px (8 s).
  - ShrinkRay: halve length for agility.
  - Shield: negate next tail hit.
- API: `world.powerUps.spawn(type: string)`.

## 8. Enhanced Orb Rendering
- Replace circles with glowing 12 px sprites; rare orbs 16 px with animated pulse.
- Orb density scales with world size; respawn delay 0.5 s.
- API: `drawWorld` to read `orb.sprite` and `orb.size`.

## 9. Static Obstacles
- Random neon billboards (axis-aligned rectangles); collision = death.
- Store obstacles in `world.obstacles[]`; render under snakes.
- API: `createWorld({ obstacles: count })` generates obstacle list.

## 10. Portal Pairs
- Linked circles; enter one → exit other, conserve heading, 1 s cooldown.
- Store in `world.portals: Array<{a: Point, b: Point, lastUse: number}>`.

## 11. Tail‑Cutter Blaster
- Tap Space + Shift to fire bullet (4× snake speed).
- Cost: −1 segment; on hit: remove 3 segments from target, spawn loose orbs.
- Use object pool: `world.projectiles[]`.
- API: `world.fireProjectile({ x, y, dir })`.

## 12. Difficulty Settings Menu
- Easy, Normal, Hardcore toggles AI skill, starting speed, obstacle count.
- API: Extend `MenuOverlay` to include settings screen with callbacks.
