// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { SAFE_PX } from '../constants'; // Import SAFE_PX for playerSkip

/** Returns random float between min (inclusive) and max (exclusive) */
export const rand = (min, max) => Math.random() * (max - min) + min;

/** Returns random integer between min and max inclusive */
export const randInt = (min, max) => Math.floor(rand(min, max + 1));

/** Clamps value v between a and b */
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Calculates Euclidean distance between two points {x, y} */
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Linear interpolation between a and b */
export const lerp = (a, b, t) => a + (b - a) * t;

/** Approximate half the drawn body width for a snake of given length */
export const segRadius = len => 3 + len / 60;

/** Snap any vector to nearest 4-way cardinal direction */
export const snapToCardinal = (x, y) =>
  Math.abs(x) > Math.abs(y)
    ? { x: Math.sign(x), y: 0 }
    : { x: 0, y: Math.sign(y) };

/** Dynamic dead-zone scales with snake speed (fat‑finger friendly) */
// Note: This seems related to touch input, might belong in input/ utils?
// Keeping here for now as it uses SAFE_PX constant.
export const dynamicDeadzone = speed => 0.12 * SAFE_PX * (1 + speed / 3);


/** Calculates how many segments to skip for self-collision based on speed */
export const playerSkip = player => {
  // each body link is roughly the distance moved per tick == current speed px
  const links = Math.round(SAFE_PX / player.speed);
  // hard‑cap so giant snakes can still die by turning too sharply
  return Math.min(links, 60);
};

/** Checks if moving head to (hx, hy) would collide with own tail segments */
export const willHitTail = (hx, hy, segs, skip) => {
  // Start checking after the 'skip' neck segments
  for (let i = skip; i < segs.length; i++) {
    // Use segRadius based on current length for collision threshold
    const thresh = segRadius(segs.length) + 1; // +1 for glow/buffer
    if (dist({ x: hx, y: hy }, segs[i]) < thresh) {
      return true; // Collision detected
    }
  }
  return false; // No collision
};
