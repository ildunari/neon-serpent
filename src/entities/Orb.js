/*
 * src/entities/Orb.js
 * Manages its own PIXI.Sprite lifecycle.
 * Uses textures provided by GameCanvas.
 */
import * as PIXI from 'pixi.js';
import { ORB_RADIUS } from '../constants'; // Assuming ORB_RADIUS is defined

export default class Orb {
    // --- Game State Properties ---
    x = 0;
    y = 0;
    type = 'common';
    baseR = ORB_RADIUS;
    r = ORB_RADIUS;
    coreColor = 0xffffff; // Use hex number
    spriteKey = 'orb_common.png'; // Key to look up in the loaded texture sheet
    visible = true; // Game logic visibility state
    pulseOffset = 0; // For animation

    // --- PixiJS Specific ---
    pixiObject = null; // Holds the PIXI.Sprite instance
    static nextId = 0;
    id = `orb_${Orb.nextId++}`;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pulseOffset = Math.random() * Math.PI * 2;

        const roll = Math.random();
        if (roll < 0.02) {
            this.type = 'rare';
            this.baseR = ORB_RADIUS;
            this.coreColor = 0xff4bff; // Use hex number
            this.spriteKey = 'orb_rare.png';
        } else if (roll < 0.07) {
            this.type = 'uncommon';
            this.baseR = ORB_RADIUS;
            this.coreColor = 0x4bffec; // Use hex number
            this.spriteKey = 'orb_uncommon.png';
        } else {
            this.type = 'common';
            this.baseR = ORB_RADIUS;
            this.coreColor = 0xffffff; // Use hex number
            this.spriteKey = 'orb_common.png';
        }
        this.r = this.baseR;
    }

    // Initializes the PIXI.Sprite object
    initPixi(container, texturesRef) { // Pass container and texturesRef
        if (this.pixiObject) return; // Already initialized

        const textures = texturesRef.current; // Get textures from ref
        const orbTexture = textures?.orbSheet?.textures?.[this.spriteKey];

        if (orbTexture) {
            this.pixiObject = new PIXI.Sprite(orbTexture);
            this.pixiObject.anchor.set(0.5);
            // Scale sprite based on desired radius vs texture frame size
            const sourceFrameWidth = orbTexture.width;
            const desiredDiameter = this.r * 2;

            if (sourceFrameWidth > 0) {
                 this.pixiObject.scale.set(desiredDiameter / sourceFrameWidth);
            } else {
                 console.warn(`Orb texture '${this.spriteKey}' has zero width. Cannot scale.`);
                 this.pixiObject.scale.set(1); // Default scale
            }

            this.pixiObject.position.set(this.x, this.y);
            this.pixiObject.visible = this.visible;
            this.pixiObject.zIndex = 1; // Render below snakes
            this.pixiObject.eventMode = 'none';
            if (container && !container.destroyed) { // Check container validity
                 container.addChild(this.pixiObject);
            } else {
                 console.error("Failed to add Orb PIXI object: Container invalid or destroyed.");
                 this.pixiObject.destroy(); // Clean up sprite if cannot add
                 this.pixiObject = null;
            }
        } else {
            console.warn(`Texture not found for key: ${this.spriteKey}. Creating fallback graphic.`);
            this.pixiObject = new PIXI.Graphics();
            this.pixiObject.beginFill(this.coreColor);
            this.pixiObject.drawCircle(0, 0, this.r);
            this.pixiObject.endFill();

            this.pixiObject.position.set(this.x, this.y);
            this.pixiObject.visible = this.visible;
            this.pixiObject.zIndex = 1;
            this.pixiObject.eventMode = 'none';
             if (container && !container.destroyed) {
                 container.addChild(this.pixiObject);
             } else {
                  console.error("Failed to add Orb fallback PIXI graphic: Container invalid or destroyed.");
                  this.pixiObject.destroy();
                  this.pixiObject = null;
             }
        }
    }

    // Updates the PIXI.Sprite state based on game logic state
    syncPixi(ticker) {
        if (!this.pixiObject || this.pixiObject.destroyed) return; // Check if destroyed

        // Debug first orb visibility once
        if (!window._debugOrbVisibility) {
            console.log(`⚪ First orb visibility: ${this.visible}, position: ${this.x},${this.y}`);
            window._debugOrbVisibility = true;
        }

        this.pixiObject.position.set(this.x, this.y);
        this.pixiObject.visible = this.visible; // Sync visibility

        // Add pulsing effect (example using scale)
        if (this.visible && this.pixiObject.texture && this.pixiObject.texture !== PIXI.Texture.WHITE) { // Check texture exists and isn't fallback
            const pulseSpeed = 0.003;
            const pulseMagnitude = 0.05;
            const time = ticker.lastTime;
            const scaleFactor = 1 + Math.sin(time * pulseSpeed + this.pulseOffset) * pulseMagnitude;

            const orbTexture = this.pixiObject.texture;
            // Use default width if texture somehow missing width property
            const sourceFrameWidth = orbTexture?.width || this.r * 2;
            const desiredDiameter = this.r * 2;
            const baseScale = sourceFrameWidth > 0 ? (desiredDiameter / sourceFrameWidth) : 1;
            this.pixiObject.scale.set(baseScale * scaleFactor);
        } else if (this.pixiObject.texture && this.pixiObject.texture !== PIXI.Texture.WHITE) { // Reset scale if not visible but texture exists
            const orbTexture = this.pixiObject.texture;
            const sourceFrameWidth = orbTexture?.width || this.r * 2;
            const desiredDiameter = this.r * 2;
            const baseScale = sourceFrameWidth > 0 ? (desiredDiameter / sourceFrameWidth) : 1;
            this.pixiObject.scale.set(baseScale);
        }
        // No scaling for fallback graphics needed unless desired
    }

    // Removes and destroys the PIXI.Sprite object
    destroyPixi(container) { // Pass container for removal check
        if (this.pixiObject && !this.pixiObject.destroyed) {
             // Remove from parent ONLY if it's the expected container or exists
             if (this.pixiObject.parent && (this.pixiObject.parent === container || container?.children.includes(this.pixiObject))) {
                 this.pixiObject.parent.removeChild(this.pixiObject);
             } else if (this.pixiObject.parent) {
                  // Fallback if parent mismatch but exists
                  this.pixiObject.parent.removeChild(this.pixiObject);
             }
            // Destroy the sprite, but NOT the base texture
            this.pixiObject.destroy({ children: true, texture: false, baseTexture: false });
        }
        this.pixiObject = null; // Clear reference
        this.visible = false; // Ensure game state matches
    }
}
