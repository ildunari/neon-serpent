/*
 * src/entities/Snake.js
 * Manages its own PIXI.Graphics lifecycle.
 * Contains the complex drawing logic for snake body/head.
 */
import * as PIXI from 'pixi.js';
import { WORLD_SIZE } from '../constants';
import { rand, randInt, dist, playerSkip, segRadius } from '../utils/math'; // Import necessary utils

export default class Snake {
    // --- Game State ---
    segs = [];
    goal = 6;
    isPlayer = false;
    skill = 1;
    baseSpeed = 2.4; // Increased base speed
    speed = 2.4;
    // Use vx, vy for current movement direction/velocity magnitude
    vx = 1;
    vy = 0;
    // dir object can be removed or kept just for initial setting if preferred
    // dir = { x: 1, y: 0 }; // Redundant if using vx/vy primarily
    brain = 'gather';
    score = 0;
    dead = false;
    color = 0x00eaff; // Default player color (hex number)
    glowFrames = 0;
    eatQueue = [];
    eatSpeed = 0.5;
    visible = true; // Game logic visibility

    // --- PixiJS Specific ---
    pixiObject = null; // Holds the PIXI.Graphics instance

    // Debug ID
    static nextId = 0;
    id = `snake_${Snake.nextId++}`;

    constructor(x, y, isPlayer = false, brain = 'gather') {
        this.segs = [{ x, y }];
        this.isPlayer = isPlayer;
        this.brain = brain;
        this.skill = this.isPlayer ? 1 : rand(0.2, 0.9);
        this.speed = this.baseSpeed * (this.isPlayer ? 1 : (0.5 + this.skill * 0.5));

        // Initial direction (random horizontal/vertical)
        const startDir = randInt(0, 1) * 2 - 1;
        if (randInt(0, 1) === 0) {
            this.vx = startDir; this.vy = 0;
        } else {
            this.vx = 0; this.vy = startDir;
        }
        // this.dir.x = this.vx; // Sync dir if keeping it
        // this.dir.y = this.vy;

        this.color = isPlayer ? 0x00eaff : // Player: Cyan
            (brain === 'hunt' ? 0xff4b4b : // Hunt: Red
             brain === 'coward' ? 0xffcf1b : // Coward: Yellow
             0x6cff6c); // Gather: Green (Use hex numbers)

        this.visible = !this.dead;
    }

    // --- Core Logic Methods ---
    think(world, player) {
        if (this.isPlayer || this.dead) return;
        if (Math.random() > this.skill) return; // Skip thinking sometimes based on skill

        const head = this.segs[0];
        const avoidThresh = 10 + (1 - this.skill) * 20; // Skill-based avoidance radius

        // Avoid player tail
        // Use playerSkip to determine how many segments of player are "safe" to ignore
        const playerSafeSegments = playerSkip(player);
        for (let i = playerSafeSegments; i < player.segs.length; i++) {
            const ts = player.segs[i];
            if (dist(head, ts) < avoidThresh) {
                const fleeAngle = Math.atan2(head.y - ts.y, head.x - ts.x);
                // Update vx/vy directly, magnitude is handled by speed
                this.vx = Math.cos(fleeAngle);
                this.vy = Math.sin(fleeAngle);
                // this.dir.x = this.vx; this.dir.y = this.vy; // Sync dir if kept
                return; // Prioritize avoidance
            }
        }

        // Target selection based on brain
        let target = null;
        if (this.brain === 'gather') {
             // Find closest orb
             if (world.orbs.length > 0) {
                 target = world.orbs.reduce((closest, orb) => (dist(head, orb) < dist(head, closest) ? orb : closest), world.orbs[0]);
             } else { // Wander if no orbs
                 target = { x: rand(0, WORLD_SIZE), y: rand(0, WORLD_SIZE) };
             }
        } else if (this.brain === 'hunt') {
            const others = world.snakes.filter(s => s !== this && !s.dead);
            // Target player head or closest other snake head
            if (Math.random() < 0.5 || others.length === 0) {
                target = player.segs[0];
            } else {
                const closest = others.reduce((best, s) => (dist(head, s.segs[0]) < dist(head, best.segs[0]) ? s : best), others[0]);
                target = closest.segs[0];
            }
        } else if (this.brain === 'coward') {
            const playerHead = player.segs[0];
            const d = dist(head, playerHead);
            // Flee if player is bigger and close
            if (player.length() > this.length() && d < 300) {
                target = { x: head.x - (playerHead.x - head.x), y: head.y - (playerHead.y - head.y) }; // Flee point
            } else { // Otherwise, gather like gather brain
                 if (world.orbs.length > 0) {
                      target = world.orbs.reduce((closest, orb) => (dist(head, orb) < dist(head, closest) ? orb : closest), world.orbs[0]);
                 } else {
                      target = { x: rand(0, WORLD_SIZE), y: rand(0, WORLD_SIZE) };
                 }
            }
        }

        // Steer towards target with skill-based wobble
        if (target) {
            const angle = Math.atan2(target.y - head.y, target.x - head.x);
            const wobble = (1 - this.skill) * 0.5; // Wobble increases as skill decreases
            const offset = rand(-wobble, wobble);
            const finalAngle = angle + offset;
            // Update vx/vy directly
            this.vx = Math.cos(finalAngle);
            this.vy = Math.sin(finalAngle);
            // this.dir.x = this.vx; this.dir.y = this.vy; // Sync dir if kept
        }
    }

    update(world) { // world might not be needed unless accessing particles etc.
        if (this.dead) return;

        // Compute new head position using vx, vy and speed
        const head = {
            x: (this.segs[0].x + this.vx * this.speed + WORLD_SIZE) % WORLD_SIZE,
            y: (this.segs[0].y + this.vy * this.speed + WORLD_SIZE) % WORLD_SIZE
        };
        this.segs.unshift(head);

        // Remove tail segment if length exceeds goal
        if (this.segs.length > this.goal) {
            this.segs.pop();
        }

        // Update eat animation queue
        this.eatQueue = this.eatQueue
            .map(p => p + this.eatSpeed)
            .filter(p => p < this.segs.length);

        // Update glow effect timer
        if (this.glowFrames > 0) this.glowFrames--;

        // Update visibility state (redundant if only set on death?)
        this.visible = !this.dead;
    }

    length() { return this.segs.length; }

    // --- PixiJS Methods ---

    initPixi(container) { // Pass container (e.g., gameContainerRef.current)
        if (this.pixiObject) return; // Already initialized

        this.pixiObject = new PIXI.Graphics();
        this.pixiObject.visible = this.visible;
        this.pixiObject.zIndex = this.isPlayer ? 3 : 2; // Player on top
        this.pixiObject.eventMode = 'none';

        if (container && !container.destroyed) { // Check container validity
             container.addChild(this.pixiObject);
        } else {
             console.error(`Failed to add Snake PIXI object: Container invalid or destroyed. Snake ID: ${this.id}`);
             // Don't destroy the graphics object itself here, just fail to add
        }
    }

    // Syncs the PIXI.Graphics object with the current snake state
    syncPixi(playerSkipCount = 0) { // Pass skipCount for player rendering
        if (!this.pixiObject || this.pixiObject.destroyed) return; // Check if destroyed

        // Debug visibility - only log player visibility state once
        if (this.isPlayer && !window._debugPlayerVisibility) {
            console.log(`🐍 Player snake visible: ${this.visible}, has segments: ${this.segs.length}`);
            window._debugPlayerVisibility = true;
        }

        this.pixiObject.visible = this.visible;
        if (!this.visible || this.segs.length === 0) {
            this.pixiObject.clear(); // Clear graphics if not visible or no segments
            return;
        }

        const graphics = this.pixiObject;
        graphics.clear(); // Clear previous frame's drawing
        
        // DEBUG: Draw a simple test rectangle if this is the player
        if (this.isPlayer && !window._hasLoggedSnakePos) {
            console.log(`🐍 Snake position: ${this.segs[0].x}, ${this.segs[0].y}`);
            window._hasLoggedSnakePos = true;
            
            // Add a simple visible shape that's easier to see
            graphics.beginFill(0xFF00FF);
            graphics.drawRect(this.segs[0].x - 20, this.segs[0].y - 20, 40, 40);
            graphics.endFill();
        }

        const baseColor = this.glowFrames > 0 ? 0xffffff : this.color;
        const playerGlowColor = 0xFFFF00; // Bright yellow glow for player
        const outlineColor = 0xffffff; // White outline
        const playerGlowStrength = 9; // Base glow strength

        // --- Draw Snake Body Segments ---
        for (let i = 0; i < this.segs.length - 1; i++) {
            const p1 = this.segs[i];
            const p2 = this.segs[i + 1];

            // --- Calculate Segment Width (incorporating eat wave) ---
            const baseW = segRadius(this.length()) * 2; // Use segRadius for base width calculation
            const swellDist = 5; // How many segments the swell affects
            const swellFactor = this.eatQueue.reduce((maxFactor, wavePos) => {
                const distFromWave = Math.abs(i - wavePos);
                const factor = Math.max(0, 1 - distFromWave / swellDist);
                return Math.max(maxFactor, factor);
            }, 0);
            const currentWidth = baseW * (1 + swellFactor * 0.5); // Swell up to 50%
            const isPulsing = swellFactor > 0.01;

            // --- Determine Segment Style ---
            let segmentColor;
            let glowColor = null;
            let glowStrength = 0;
            const isSafePlayerSegment = this.isPlayer && playerSkipCount > 0 && i < playerSkipCount;

            if (isSafePlayerSegment) {
                segmentColor = 0x0099aa; // Teal for safe segments
                glowColor = 0x0099aa;
                glowStrength = 3; // Subtle glow for safe part
            } else if (this.isPlayer) {
                segmentColor = isPulsing ? 0xffffff : baseColor; // White pulse on player
                glowColor = playerGlowColor;
                glowStrength = isPulsing ? playerGlowStrength + 4 : playerGlowStrength; // Boost glow during pulse
            } else { // AI Snake
                segmentColor = isPulsing ? 0xffffff : baseColor; // White pulse on AI
                if (isPulsing) {
                    glowColor = 0xffffff;
                    glowStrength = 15; // Intense white glow for AI pulse
                }
                // Optional: Add subtle base glow for AI?
                // else { glowColor = baseColor; glowStrength = 2; }
            }

            // --- Draw Outline (Player Only, drawn first underneath) ---
            if (this.isPlayer) {
                graphics.moveTo(p1.x, p1.y);
                // Use lineStyle object format
                graphics.lineStyle({ width: currentWidth + 2, color: outlineColor, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND });
                graphics.lineTo(p2.x, p2.y);
                graphics.stroke(); // Stroke the outline path
            }

            // --- Draw Simple Glow (if applicable, underneath main segment) ---
            if (glowColor !== null && glowStrength > 0) {
                graphics.moveTo(p1.x, p1.y);
                graphics.lineStyle({
                    width: currentWidth + glowStrength, // Thicker for glow
                    color: glowColor,
                    alpha: 0.25, // Semi-transparent
                    cap: PIXI.LINE_CAP.ROUND,
                    join: PIXI.LINE_JOIN.ROUND
                });
                graphics.lineTo(p2.x, p2.y);
                graphics.stroke(); // Stroke the glow path
            }

            // --- Draw Main Segment (on top) ---
            graphics.moveTo(p1.x, p1.y);
            graphics.lineStyle({ width: currentWidth, color: segmentColor, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND });
            graphics.lineTo(p2.x, p2.y);
            graphics.stroke(); // Stroke the main segment path
        }


        // --- Draw Head ---
        if (this.segs.length > 0) {
            const headSeg = this.segs[0];
            let headRadius = segRadius(this.length()); // Use segRadius for head size
            const headColor = this.glowFrames > 0 ? 0xffffff : this.color;
            let headGlowColor = null;
            let headGlowStrength = 0;

            if (this.isPlayer) {
                headRadius += 1; // Slightly larger player head
                headGlowColor = playerGlowColor;
                headGlowStrength = playerGlowStrength + 2;
                // Draw Head Outline (using stroke on a circle path)
                 graphics.circle(headSeg.x, headSeg.y, headRadius + 1);
                 graphics.stroke({ width: 2, color: outlineColor });

            } else if (this.glowFrames > 0) { // AI head pulsing white
                headGlowColor = 0xffffff;
                headGlowStrength = 15;
            }

            // --- Draw Simple Head Glow (underneath fill) ---
            if (headGlowColor !== null && headGlowStrength > 0) {
                 graphics.circle(headSeg.x, headSeg.y, headRadius + headGlowStrength / 2);
                 graphics.fill({ color: headGlowColor, alpha: 0.3 });
            }

            // --- Draw Head Fill (on top) ---
             graphics.circle(headSeg.x, headSeg.y, headRadius);
             graphics.fill({ color: headColor });


            // --- Draw Player Eyes ---
            if (this.isPlayer) {
                // Use current velocity (vx, vy) for eye direction
                const angle = Math.atan2(this.vy, this.vx);
                const eyeDist = headRadius * 0.5; // Distance from center
                const eyeRadius = Math.max(2, headRadius * 0.2); // Ensure minimum size
                const eyeColor = 0xffffff;
                const eyeGlowColor = 0xffffff;
                const eyeGlowStrength = 1; // Subtle eye glow

                // Calculate eye positions
                const eye1X = headSeg.x + Math.cos(angle + Math.PI / 4) * eyeDist;
                const eye1Y = headSeg.y + Math.sin(angle + Math.PI / 4) * eyeDist;
                const eye2X = headSeg.x + Math.cos(angle - Math.PI / 4) * eyeDist;
                const eye2Y = headSeg.y + Math.sin(angle - Math.PI / 4) * eyeDist;

                // Simple Eye Glow (underneath fill)
                 graphics.circle(eye1X, eye1Y, eyeRadius + eyeGlowStrength);
                 graphics.fill({ color: eyeGlowColor, alpha: 0.4 });
                 graphics.circle(eye2X, eye2Y, eyeRadius + eyeGlowStrength);
                 graphics.fill({ color: eyeGlowColor, alpha: 0.4 });


                // Eye Fill (on top)
                 graphics.circle(eye1X, eye1Y, eyeRadius);
                 graphics.fill({ color: eyeColor });
                 graphics.circle(eye2X, eye2Y, eyeRadius);
                 graphics.fill({ color: eyeColor });

            }
        }
    }

    destroyPixi(container) { // Pass container for removal check
        if (this.pixiObject && !this.pixiObject.destroyed) {
            // Remove from parent ONLY if it's the expected container or exists
            if (this.pixiObject.parent && (this.pixiObject.parent === container || container?.children.includes(this.pixiObject))) {
                 this.pixiObject.parent.removeChild(this.pixiObject);
            } else if (this.pixiObject.parent) {
                 // Fallback if parent mismatch but exists
                 console.warn(`Snake ${this.id} parent mismatch during destroyPixi, attempting removal from current parent.`);
                 this.pixiObject.parent.removeChild(this.pixiObject);
            }
            this.pixiObject.destroy({ children: true }); // Destroy graphics object
        }
        this.pixiObject = null; // Clear reference
        this.visible = false; // Ensure game state matches
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
