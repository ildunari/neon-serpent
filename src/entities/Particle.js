/*
 * src/entities/Particle.js
 * Simplified for pooling. Holds state and a reference to its Pixi object.
 * Reset logic included. No direct Pixi manipulation methods.
 */
import * as PIXI from 'pixi.js';
import { rand } from '../utils/math';

export default class Particle {
    // Game State
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    life = 30;
    maxLife = 30;
    visible = true; // Tracks if the particle should be active/rendered

    // PixiJS Reference (Managed externally by the pool)
    pixiObject = null; // Will hold a PIXI.Graphics or PIXI.Sprite instance

    // Unique ID for debugging
    static nextId = 0;
    id = `particle_${Particle.nextId++}`;

    constructor(x = 0, y = 0) {
        // Initial state set by constructor OR reset method
        this.reset(x, y);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = rand(-2, 2);
        this.vy = rand(-2, 2);
        this.life = this.maxLife;
        this.visible = true;
        // Pixi object state (position, alpha, visibility) is reset externally by the pool manager
    }

    update(dt = 1) { // Accept delta time (though current logic is frame-based)
        if (!this.visible) return; // Don't update if inactive

        // Simple frame-based update (adjust if using dt for physics)
        this.x += this.vx; // * (dt / (1000/60)); // Example dt usage
        this.y += this.vy; // * (dt / (1000/60));
        this.life--;

        if (this.life <= 0) {
            this.visible = false; // Mark as ready for pooling
        }
    }
}
