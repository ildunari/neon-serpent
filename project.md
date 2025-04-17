
### src/App.css

```css
/* Remove or comment out default Vite styles if they conflict */
/* #root { ... } */
/* .logo { ... } */
/* ... etc ... */

/* Game Container - Establishes positioning context */
.game-container {
  position: relative; /* Needed for absolute positioning of children */
  width: 100vw;       /* Full viewport width */
  height: 100vh;      /* Full viewport height */
  overflow: hidden;   /* Ensure nothing spills out */
  background: #000;   /* Fallback background */
}

/* Canvas Styling (ensure it fills the container and is behind overlays) */
.game-container canvas {
  display: block; /* Remove extra space below canvas */
  width: 100%;
  height: 100%;
  position: absolute; /* Position it within the container */
  top: 0;
  left: 0;
  z-index: 0; /* Ensure canvas is behind overlays */
}

/* Base Overlay Styling (ensure they are above the canvas) */
.overlay,
.menu-overlay,
.controls-overlay,
.simple-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
  color: white;
  z-index: 10; /* Ensure overlays are above the canvas */
  box-sizing: border-box; /* Include padding/border in element's total width/height */
  padding: 20px;
}

/* Menu Specific Styles */
.menu-overlay h1 {
  font-size: 4em;
  margin-bottom: 1em;
  color: #0f0; /* Neon green */
  text-shadow: 0 0 10px #0f0, 0 0 20px #0f0;
}

.menu-buttons button {
  display: block;
  width: 250px;
  margin: 15px auto;
  padding: 15px;
  font-size: 1.5em;
  background-color: rgba(0, 255, 0, 0.1);
  border: 2px solid #0f0;
  color: #0f0;
  text-shadow: 0 0 5px #0f0;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.menu-buttons button:hover,
.menu-buttons button.selected {
  background-color: rgba(0, 255, 0, 0.3);
  box-shadow: 0 0 15px #0f0;
  outline: none;
}

.menu-overlay .hint {
  margin-top: 2em;
  font-size: 0.9em;
  color: #aaa;
}

/* Controls Specific Styles */
.controls-overlay {
  justify-content: flex-start; /* Align content to top */
  padding-top: 5vh;
}

.controls-overlay h2 {
  font-size: 3em;
  margin-bottom: 1em;
  color: #0ff; /* Neon cyan */
  text-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
}

.controls-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 15px 25px;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #0ff;
  max-width: 500px;
}

.control-item {
  display: contents; /* Allow grid layout to apply directly to children */
}

.control-label {
  text-align: right;
  font-weight: bold;
  color: #eee;
}

.control-icons {
  display: flex;
  gap: 5px;
  align-items: center;
}

.control-icons img {
  height: 24px; /* Adjust icon size */
  width: auto;
  background: #333;
  padding: 2px;
  border-radius: 3px;
}

.control-fallback {
  font-style: italic;
  color: #ccc;
}

.controls-overlay .back-button {
  margin-top: 2em;
  padding: 10px 20px;
  font-size: 1.2em;
  background-color: rgba(0, 255, 255, 0.1);
  border: 2px solid #0ff;
  color: #0ff;
  text-shadow: 0 0 5px #0ff;
}

.controls-overlay .back-button:hover {
  background-color: rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 15px #0ff;
}

/* Simple Overlay (Pause/Game Over) */
.simple-overlay {
  font-size: 2.5em;
  text-align: center;
  line-height: 1.4;
  color: #f00; /* Red for game over/pause */
  text-shadow: 0 0 10px #f00, 0 0 20px #f00;
}

/* Joystick UI Styling */
.joystick-ui {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Allow clicks/touches to pass through */
    z-index: 20; /* Above other overlays if needed */
}

.joystick-base,
.joystick-knob {
    position: absolute;
    border-radius: 50%;
    transform: translate(-50%, -50%); /* Center on coordinates */
}

.joystick-base {
    width: 96px; /* Match JOY_MAX_R * 2 */
    height: 96px;
    background-color: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.joystick-knob {
    width: 48px;
    height: 48px;
    background-color: rgba(255, 255, 255, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.6);
}

```

### src/App.jsx

```jsx
import NeonSerpentGame from './NeonSerpentGame';
export default function App() {
  return <NeonSerpentGame />;
}

```

### src/DIRECTORY.md

```md
# Project Directory (`src`)

This file provides a brief overview of the files within the `src` directory.

## Root Files

*   `App.css`: Contains CSS styles primarily for the overlays (menu, controls, game over, pause, joystick UI) and general layout.
*   `App.jsx`: The root React component that sets up the application structure (currently just renders `NeonSerpentGame`).
*   `constants.js`: Defines core game constants (world size, entity counts, speeds, cooldowns, UI sizes, etc.).
*   `index.css`: Contains base CSS resets and global styles, modified to remove default Vite centering/padding.
*   `main.jsx`: The entry point for the React application, renders the root `App` component.
*   `NeonSerpentGame_backup.jsx`: The original single-file version of the game (kept for reference).
*   `NeonSerpentGame.jsx`: The main game component. Manages game state (menu, playing, paused, gameover), orchestrates the game loop, handles input processing, and renders the canvas and relevant overlays.

## `components/`

*   `ControlsOverlay.jsx`: React component for rendering the controls display screen.
*   `GameCanvas.jsx`: React component responsible for rendering the HTML5 canvas, drawing the background video with parallax, and calling `drawWorld` to render entities.
*   `MenuOverlay.jsx`: React component for rendering the main menu screen.

## `entities/`

*   `index.js`: Exports the entity classes for easier importing.
*   `Orb.js`: Class definition for collectible orbs (food).
*   `Particle.js`: Class definition for particle effects (e.g., when eating orbs).
*   `Snake.js`: Class definition for the player and AI snakes, including movement, growth, drawing, and AI logic (`think` method).

## `hooks/`

*   `useResizeCanvas.js`: Custom React hook to handle canvas resizing and DPI scaling.

## `input/`

*   `index.js`: Exports the input hooks for easier importing.
*   `joystick.js`: Custom React hook (`useJoystick`) to manage virtual joystick state based on touch input.
*   `keyboard.js`: Custom React hook (`useKeyboard`) to track keyboard state and determine the desired direction vector.

## `render/`

*   `drawWorld.js`: Function responsible for drawing all game entities (orbs, snakes, particles) and the HUD onto the canvas context.
*   `index.js`: Exports the rendering functions for easier importing.

## `utils/`

*   `index.js`: Exports utility functions for easier importing.
*   `math.js`: Contains various mathematical helper functions (random numbers, distance, lerp, vector snapping, collision helpers like `playerSkip`, `segRadius`, `willHitTail`).

## `world/`

*   `index.js`: Contains the core world logic:
    *   `createWorld`: Initializes the game state (creates orbs, player, AI snakes).
    *   `handleCollisions`: Detects and resolves collisions (orb eating, snake-tail hits).
    *   `updateWorld`: The main game tick function; updates snake positions, AI, particles, handles collisions, and updates the camera.

```

### src/NeonSerpentGame.jsx

```jsx
/*  Neon Serpent — Modular React Build
    React + HTML5 canvas
    2025-04-17   */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MenuOverlay from './components/MenuOverlay';
import ControlsOverlay from './components/ControlsOverlay';
import { createWorld, updateWorld } from './world';
import { useKeyboard, useJoystick } from './input'; // Import input hooks
import { TURN_COOLDOWN_MS, JOY_TURN_COOLDOWN_MS } from './constants'; // Import cooldown constants
import { willHitTail } from './utils/math'; // Import turn safety helper

// Define menu options and controls info
const menuOptions = ['Start Game', 'Controls', 'Restart Game'];
const controlsInfo = [
  { label: 'Move', icons: ['/w.png', '/a.png', '/s.png', '/d.png'], fallback: 'WASD' },
  { label: 'Move', icons: ['/up.png', '/left.png', '/down.png', '/right.png'], fallback: 'Arrow Keys' },
  { label: 'Select/Pause', icons: ['/space.png'], fallback: 'Space/Enter' },
  { label: 'Back', icons: [], fallback: 'Esc' },
  { label: 'Touch', icons: [], fallback: 'Virtual Joystick (Tap & Drag)' },
];

export default function NeonSerpentGame() {
  const [gameState, setGameState] = useState('menu'); // Default to 'menu'
  const [menuIndex, setMenuIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const worldRef = useRef(null); // Initialize as null, create world on start
  const lastTurnRef = useRef(0); // Track last turn time
  const canvasSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight }); // Track canvas size

  // Initialize input hooks
  const { keys, dir: keyDir } = useKeyboard();
  const { joystickState, vec: joyVec } = useJoystick(worldRef); // Pass worldRef

  // Update canvas size ref on resize (could also get from useResizeCanvas if needed)
  useEffect(() => {
    const handleResize = () => {
      canvasSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize world only when starting the game
  const startGame = useCallback(() => {
    console.log("Creating new world and starting game...");
    worldRef.current = createWorld();
    lastTurnRef.current = 0; // Reset turn timer
    setShowControls(false);
    setGameState('playing');
  }, []);

  // Game Loop: Update world state
  useEffect(() => {
    if (gameState !== 'playing' || !worldRef.current) return;

    let animationFrameId;
    let lastTimestamp = performance.now();

    const loop = (timestamp) => {
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (gameState === 'playing' && worldRef.current) {
        // --- Input Processing --- (Moved here for consistency)
        const now = Date.now();
        const turnCooldown = joystickState.active ? JOY_TURN_COOLDOWN_MS : TURN_COOLDOWN_MS;
        let desiredDir = null;

        if (joystickState.active && joyVec) {
          desiredDir = joyVec;
        } else if (!joystickState.active && (keyDir.x !== 0 || keyDir.y !== 0)) {
          // Only use keyboard if joystick is not active
          desiredDir = keyDir;
        }

        if (desiredDir && now - lastTurnRef.current > turnCooldown) {
          const player = worldRef.current.player;
          // Check if the turn is safe (not immediate 180, not into own tail)
          const isSafeTurn = !(desiredDir.x === -player.vx && desiredDir.y === -player.vy);
          // TODO: Add willHitTail check if needed, requires passing world state
          // const isSafeTurn = !(...) && !willHitTail(player.segs[0].x + desiredDir.x * player.speed, player.segs[0].y + desiredDir.y * player.speed, player.segs, playerSkip(player));

          if (isSafeTurn) {
            player.vx = desiredDir.x;
            player.vy = desiredDir.y;
            lastTurnRef.current = now;
            // Add to lastMoves if that debugging feature is desired
          }
        }
        // --- End Input Processing ---

        // Update world logic - pass current canvas CSS dimensions
        const { width: viewW, height: viewH } = canvasSizeRef.current;
        worldRef.current = updateWorld(worldRef.current, dt, viewW, viewH);

        // Check for game over
        if (worldRef.current.player.dead) {
          console.log("Player died! Setting game state to gameover.");
          setGameState('gameover');
        }
      }

      if (gameState === 'playing') { // Continue loop only if still playing
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // Pass canvasSizeRef.current if needed? No, it's read inside the loop.
  }, [gameState, keyDir, joyVec, joystickState.active]); // Removed startGame from deps

  // Menu Navigation and Selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'menu' && !showControls) {
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setMenuIndex(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setMenuIndex(prev => (prev + 1) % menuOptions.length);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Prevent spacebar scrolling
          // Only call startGame from here or handleMenuSelect
          handleMenuSelect(menuIndex);
        }
      } else if (gameState === 'playing' && (e.key === 'Escape' || e.key === ' ')) {
        e.preventDefault();
        setGameState('paused'); // Simple pause example
      } else if (gameState === 'paused' && (e.key === 'Escape' || e.key === ' ')) {
        e.preventDefault();
        setGameState('playing');
      } else if (gameState === 'gameover' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        setGameState('menu'); // Return to menu
        setMenuIndex(0); // Reset menu selection
      } else if (showControls && e.key === 'Escape') {
        handleControlsBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, menuIndex, showControls, handleMenuSelect, handleControlsBack]); // Added handleMenuSelect/handleControlsBack

  const handleMenuSelect = useCallback((idx) => {
    setMenuIndex(idx);
    const action = menuOptions[idx];
    if (action === 'Start Game' || action === 'Restart Game') {
      startGame(); // Call startGame here
    } else if (action === 'Controls') {
      setShowControls(true);
    }
  }, [startGame]); // startGame is a dependency

  const handleControlsBack = useCallback(() => {
    setShowControls(false);
  }, []);

  return (
    <div className="game-container"> {/* Add a container div */}
      {/* Always render canvas, but drawing depends on state */}
      <GameCanvas gameState={gameState} setGameState={setGameState} worldRef={worldRef} />

      {/* Conditional Overlays */}
      {gameState === 'menu' && !showControls && (
        <MenuOverlay
          menuIndex={menuIndex}
          setMenuIndex={setMenuIndex}
          onSelect={handleMenuSelect} // Pass the memoized handler
          menuOptions={menuOptions} // Pass options
        />
      )}
      {showControls && (
        <ControlsOverlay onBack={handleControlsBack} controlsInfo={controlsInfo} /> // Pass info
      )}
      {gameState === 'paused' && (
        <div className="overlay simple-overlay">PAUSED (Press Esc/Space)</div>
      )}
      {gameState === 'gameover' && (
        <div className="overlay simple-overlay">
          GAME OVER<br />
          Score: {worldRef.current?.player?.score ?? 0}<br />
          (Press Enter/Space)
        </div>
      )}
      {/* Render Joystick UI only when playing and joystick is active */}
      {gameState === 'playing' && joystickState.active && (
          <div className="joystick-ui">
              <div className="joystick-base" style={{ left: `${joystickState.cx}px`, top: `${joystickState.cy}px` }}></div>
              <div className="joystick-knob" style={{ left: `${joystickState.cx + joystickState.dx}px`, top: `${joystickState.cy + joystickState.dy}px` }}></div>
          </div>
      )}
    </div> /* Close container div */
  );
}

```

### src/NeonSerpentGame_backup.jsx

```jsx
/*  Neon Serpent — single‑file playable build
    React + HTML5 canvas
    2025‑04‑16   */

/*  ----------  React component  ----------  */
import React, { useRef, useEffect, useState, useCallback } from 'react';

/*  ----------  helpers  ----------  */
const rand   = (min, max) => Math.random() * (max - min) + min;
const randInt= (min, max) => Math.floor(rand(min, max + 1));
const clamp  = (v, a, b)  => Math.max(a, Math.min(b, v));
const dist   = (a, b)     => Math.hypot(a.x - b.x, a.y - b.y);
const lerp   = (a, b, t)  => a + (b - a) * t;
/*  ----------  visual‑accurate segment radius ----------  */
// Returns approx. half the drawn body width for a snake of given length.
const segRadius = len => 3 + len / 60;
/*  ----------  touch‑helpers  ----------  */
// Snap any vector to the nearest 4‑way cardinal direction
const snapToCardinal = (x, y) =>
  Math.abs(x) > Math.abs(y)
    ? { x: Math.sign(x), y: 0 }
    : { x: 0, y: Math.sign(y) };

// Dynamic dead‑zone scales with snake speed (fat‑finger friendly)
const dynamicDeadzone = speed => 0.12 * SAFE_PX * (1 + speed / 3);

/*  ----------  turn‑safety helper  ----------  */
// returns true if (hx,hy) would overlap the snake’s own tail (ignoring the first
// `skip` neck segments)
const willHitTail = (hx, hy, segs, skip) => {
  for (let i = skip; i < segs.length; i++) {
    const thresh = segRadius(segs.length) + 1;      // +1 for glow pad
    if (dist({ x: hx, y: hy }, segs[i]) < thresh) return true;
  }
  return false;
};

/*  ----------  background constants  ----------  */
// path is relative to the public/ folder
const BG_SRC = '/big-city.png';   // renamed file
const BG_SCALE = 0.25;             // 0.25 = show 25 % of the full‑res image

/*  ----------  world constants  ----------  */
const WORLD_SIZE   = 4000;               // square wrap‑around world
const INITIAL_AI   = 6;
const TICK_MS      = 1000 / 60;          // 60 fps logic
const CAM_SMOOTH   = 0.08;
const ORB_COUNT    = 350;
const TURN_COOLDOWN_MS = 100;   // minimum interval (ms) between allowed turns
const SELF_GAP         = 8;     // ignore first N segments for player self‑collision
const TOUCH_DEADZONE_PX = 16;   // min drag distance before a touch turn registers
const ENEMY_NECK_GAP   = 4;     // ignore first N segments for AI necks
/* ---------- safety constant ---------- */
// “safe” tail distance (in px) used to decide how many neck links to ignore
// when checking if the player bites its own tail. Bigger == more forgiving.
const SAFE_PX = 64;

/* ---------- joystick constants ---------- */
const JOY_MAX_R    = 48;   // px – ring radius
// tighter dead‑zone for finer control
const JOY_DEADZONE = 4;    // px – ignore micro wobbles only
// per‑joystick turn throttle (lower = snappier feel)
const JOY_TURN_COOLDOWN_MS = 20;

/*  ----------  player collision‑gap helper  ----------  */
const playerSkip = player => {
  // each body link is roughly the distance moved per tick == current speed px
  const links = Math.round(SAFE_PX / player.speed);
  return Math.min(links, 60);   // hard‑cap so giant snakes can still die
};
const POWERUPS     = ['turbo', 'phase', 'magnet', 'size'];
// HTML overlay now handles the menu, so skip the old canvas text
const DRAW_CANVAS_MENU = false;

/*  ----------  game classes  ----------  */
class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const roll = Math.random();
    if (roll < 0.02)       { this.type = 'rare';      this.r = 9; }
    else if (roll < 0.07)  { this.type = 'uncommon';  this.r = 7; }
    else                   { this.type = 'common';    this.r = 5; }
  }
  draw(ctx, cam) {
    const sx = this.x - cam.x, sy = this.y - cam.y;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r);
    const core = this.type === 'rare' ? '#ff4bff' :
                 this.type === 'uncommon' ? '#4bffec' : '#ffffff';
    g.addColorStop(0, core);
    g.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, this.r, 0, Math.PI * 2); ctx.fill();
  }
}

class Snake {
  constructor(x, y, isPlayer = false, brain = 'gather') {
    this.segs = [{ x, y }];          // head first
    this.goal = 6;                   // target length (# segments)
    this.isPlayer = isPlayer;
    // AI skill now spans 0.2 – 0.9 so some are clumsy, some are sharp
    this.skill = this.isPlayer ? 1 : rand(0.2, 0.9);
    this.baseSpeed = 1.2;
    this.speed = this.baseSpeed * (this.isPlayer ? 1 : (0.5 + this.skill * 0.5));
    this.dir = { x: 1, y: 0 };
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
    if (this.isPlayer) return;
    // AI reaction based on skill: skip thinking occasionally for lower-skilled snakes
    if (Math.random() > this.skill) return;

    const head = this.segs[0];
    // avoid player's tail segments
    const avoidThresh = 10 + (1 - this.skill) * 20;   // 10–30 px depending on skill
    for (let i = 8; i < player.segs.length; i++) {
      const ts = player.segs[i];
      if (dist(head, ts) < avoidThresh) {
        // steer away from tail collision
        const fleeAngle = Math.atan2(head.y - ts.y, head.x - ts.x);
        this.dir.x = Math.cos(fleeAngle);
        this.dir.y = Math.sin(fleeAngle);
        return;
      }
    }
    let target = null;
    if (this.brain === 'gather') {
      target = world.orbs[randInt(0, world.orbs.length - 1)];
    } else if (this.brain === 'hunt') {
      // 50 % chase player, 50 % chase the nearest other snake’s head
      if (Math.random() < 0.5 || world.snakes.length <= 2) {
        target = player.segs[0];
      } else {
        const others = world.snakes.filter(s => s !== this && !s.dead);
        const closest = others.reduce((best, s) =>
          (dist(this.segs[0], s.segs[0]) < dist(this.segs[0], best.segs[0]) ? s : best),
          others[0]);
        target = closest ? closest.segs[0] : player.segs[0];
      }
    } else if (this.brain === 'coward') {
      const d = dist(head, player.segs[0]);
      if (player.length() > this.length() && d < 300) { // flee
        target = { x: head.x - (player.segs[0].x - head.x),
                   y: head.y - (player.segs[0].y - head.y) };
      } else {
        target = world.orbs[randInt(0, world.orbs.length - 1)];
      }
    }
    const angle = Math.atan2(target.y - head.y, target.x - head.x);
    this.dir.x = Math.cos(angle);
    this.dir.y = Math.sin(angle);
    // low‑skill snakes mis‑aim slightly
    if (!this.isPlayer) {
      const wobble = (1 - this.skill) * 0.5;         // up to ±0.5 rad
      const offset = rand(-wobble, wobble);
      const wobbleAngle = angle + offset;
      this.dir.x = Math.cos(wobbleAngle);
      this.dir.y = Math.sin(wobbleAngle);
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
    if (this.segs.length > this.goal) this.segs.pop();
    // advance eat animation positions at reduced speed and remove finished
    this.eatQueue = this.eatQueue
      .map(p => p + this.eatSpeed)
      .filter(p => p < this.segs.length);
  }

  length() { return this.segs.length; }

  /* collision with orbs / other snakes handled externally */

  draw(ctx, cam) {
    if (this.dead) return;
    const baseColor = this.glowFrames > 0 ? '#ffffff' : this.color;
    if (this.glowFrames > 0) this.glowFrames--;
    ctx.lineCap = 'round';
    for (let i = 0; i < this.segs.length - 1; i++) {
      const p1 = this.segs[i], p2 = this.segs[i + 1];
      const sx1 = p1.x - cam.x, sy1 = p1.y - cam.y;
      const sx2 = p2.x - cam.x, sy2 = p2.y - cam.y;

      // smooth eat-wave gradient: swell peaks at wave center, falls off over swellDist
      const baseW = 6 + (this.length() / 30);
      const swellDist = 5;
      const swellFactor = this.eatQueue.reduce((max, pos) => {
        const d = Math.abs(i - pos);
        const f = Math.max(0, 1 - d / swellDist);
        return f > max ? f : max;
      }, 0);
      // width pulse: up to 50% larger at wave center
      const w = baseW * (1 + swellFactor * 0.5);

      // stronger pulse effect travelling along the body
      const pulse = swellFactor > 0.01;
      const strokeColor  = pulse ? '#ffffff' : baseColor;
      const shadowColor  = pulse ? '#ffffff' : baseColor;
      const shadowBlur   = pulse ? 25 : 10;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = baseW * (1 + swellFactor * 0.7);   // bigger swell
      ctx.shadowBlur  = shadowBlur;
      ctx.shadowColor = shadowColor;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.quadraticCurveTo((sx1 + sx2) / 2, (sy1 + sy2) / 2, sx2, sy2);
      ctx.stroke();
    }
    // draw a visible head if the snake is only 1 segment long
    if (this.segs.length === 1) {
      const p = this.segs[0];
      const sx = p.x - cam.x, sy = p.y - cam.y;
      const r  = 4 + this.length() / 30;
      ctx.fillStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur  = 10;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.shadowBlur = 0;
  }
}

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = rand(-2, 2);
    this.vy = rand(-2, 2);
    this.life = 30;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  draw(ctx, cam) {
    if (this.life <= 0) return;
    const alpha = this.life / 30;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(this.x - cam.x, this.y - cam.y, 2, 2);
  }
}

/*  ----------  world factory  ----------  */
function createWorld() {
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

/*  ----------  collision helpers  ----------  */
function handleCollisions(w) {
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
        // record death reason
        if (s.isPlayer) {
          w.deathInfo = { reason: 'self_tail_collision', segment: i };
        } else {
          w.deathInfo = { reason: 'player_hit_enemy_tail', enemyColor: s.color };
        }
        // kill the snake that was hit
        s.dead = true;
        w.player.goal  += Math.floor(s.length() / 2);
        w.player.score += s.score;
        break;
      }
    }
  });

  /* clean dead snakes + respawn */
  w.snakes = w.snakes.filter(s => !s.dead || s.isPlayer);
  while (w.snakes.length < INITIAL_AI + 1) { // +1 for player
    const brains = ['gather', 'hunt', 'coward'];
    w.snakes.push(
      new Snake(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE), false,
                brains[randInt(0, 2)])
    );
  }
}

/*  ----------  render helpers  ----------  */
function drawWorld(w, ctx, view, bgImg, bgReady) {
  /* clear / parallax */
  ctx.clearRect(0, 0, view.w, view.h);
  if (bgReady) {
    ctx.save();
    ctx.filter = 'blur(4px) brightness(0.6) saturate(0.8)';   // heavier blur & dim
    const p = 0.25;                                   // parallax factor
    const scaledW = bgImg.width  * BG_SCALE;
    const scaledH = bgImg.height * BG_SCALE;
    const ox = (-w.cam.x * p) % scaledW;
    const oy = (-w.cam.y * p) % scaledH;
    for (let x = -scaledW; x < view.w + scaledW; x += scaledW) {
      for (let y = -scaledH; y < view.h + scaledH; y += scaledH) {
        ctx.drawImage(bgImg, ox + x, oy + y, scaledW, scaledH);
      }
    }
    // draw world boundary so player knows where death occurs
    ctx.strokeStyle = 'rgba(255,0,0,0.35)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(-w.cam.x, -w.cam.y, WORLD_SIZE, WORLD_SIZE);
    ctx.setLineDash([]);
    ctx.restore();  // reset filter
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, view.w, view.h);
  }

  /* orbs & snakes */
  w.orbs.forEach(o => o.draw(ctx, w.cam));
  w.particles.forEach(p => p.draw(ctx, w.cam));
  w.snakes.forEach(s => s.draw(ctx, w.cam));

  /* HUD */
  ctx.fillStyle = '#fff'; ctx.font = '16px monospace';
  ctx.fillText(`Score: ${w.player.score}`, 12, 20);
}

/*  ----------  debug helpers  ----------  */
// store the 15 most recent accepted turns (so we know what you did right before death)
const lastMoves = [];

/*  ----------  React component  ----------  */
export default function NeonSerpentGame() {
  const canvasRef = useRef(null);
  const [joystick, setJoystick] = useState({
    active: false,         // finger presently down?
    cx: 0, cy: 0,          // joystick centre
    dx: 0, dy: 0           // knob offset (clamped)
  });
  const joystickRef = useRef(joystick);
  useEffect(() => { joystickRef.current = joystick; }, [joystick]);

  const [bgReady, setBgReady] = useState(false);
  const [gameState, setGameState] = useState('menu');   // menu | playing | gameover
  const menuOptions = ['Start Game', 'Controls', 'Restart Game'];
  // tap / click on menu buttons
  const handleMenuClick = useCallback(idx => {
    if (idx === 0) {                 // Start
      worldRef.current = createWorld(); // fresh world each time
      setGameState('playing');
    } else if (idx === 1) {          // Controls
      setShowControls(true);
    } else if (idx === 2) {          // Restart
      worldRef.current = createWorld();
      setGameState('playing');
    }
  }, []);
  const [menuIndex, setMenuIndex] = useState(0);
  const menuIndexRef = useRef(menuIndex);
  useEffect(() => { menuIndexRef.current = menuIndex; }, [menuIndex]);
  const [showControls, setShowControls] = useState(false);
  // blur canvas when secondary menu
  useEffect(() => {
    if (!showControls) return;
    const onKeyControls = e => {
      if (e.type === 'keydown' && (e.code === 'Escape' || e.code === 'Enter')) {
        setShowControls(false);
      }
    };
    window.addEventListener('keydown', onKeyControls);
    return () => window.removeEventListener('keydown', onKeyControls);
  }, [showControls]);
  // controls data for overlay with image icons
  const controlsInfo = [
    { label: 'Move', icons: ['/w.png', '/a.png', '/s.png', '/d.png', '/up.png', '/left.png', '/down.png', '/right.png'] },
    { label: 'Start / Restart', icons: ['/space.png'] },
    { label: 'Back to Menu', icons: [], fallback: 'Escape (⎋)' }
  ];
  const worldRef = useRef(null);
  const bgImg = useRef(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    /* load background once */
    const img = new Image();
    img.src = BG_SRC;
    img.onload = () => setBgReady(true);
    img.onerror = err => console.error('BG image failed to load:', BG_SRC, err);
    bgImg.current = img;
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    worldRef.current = createWorld();
    const canvas = canvasRef.current;
    const ctx     = canvas.getContext('2d');
    const view = { w: window.innerWidth, h: window.innerHeight };
    // device‑pixel‑ratio for crisp rendering on Retina / 4K screens
    let dpr = window.devicePixelRatio || 1;
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = 'high';

    function resize() {
      dpr = window.devicePixelRatio || 1;
      // keep CSS size unchanged
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
 
      // set actual bitmap resolution for the canvas
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
 
      // reset any existing transforms then scale so 1 canvas unit = 1 CSS px
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
 
      view.w = window.innerWidth;
      view.h = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /*   --- input ---   */
    const keys = {};
    // ----- touch steering -----
    let lastTouchVec   = null; // { x, y, len } – live vector
    let lastTouchTime  = 0;    // for quick‑tap bookkeeping only

    const onTouchStart = e => {
      if (gameStateRef.current === 'gameover') {
        worldRef.current = createWorld();
        setGameState('playing');
        return;
      }
      const t = e.touches[0];
      setJoystick({ active: true, cx: t.clientX, cy: t.clientY, dx: 0, dy: 0 });
      lastTouchTime = performance.now();
      e.preventDefault();
    };
    const onTouchMove = e => {
      if (!joystickRef.current.active) return;
      const t   = e.touches[0];
      const dx0 = t.clientX - joystickRef.current.cx;
      const dy0 = t.clientY - joystickRef.current.cy;
      const len = Math.hypot(dx0, dy0);

      if (len < JOY_DEADZONE) {
        setJoystick(j => ({ ...j, dx: 0, dy: 0 }));
        return e.preventDefault();
      }

      const clampedLen = Math.min(len, JOY_MAX_R);
      const nx = dx0 / len, ny = dy0 / len;
      const dx = nx * clampedLen, dy = ny * clampedLen;

      setJoystick(j => ({ ...j, dx, dy }));
      lastTouchVec   = { x: nx, y: ny, len: clampedLen };
      lastTouchTime  = performance.now();
      e.preventDefault();
    };
    const onTouchEnd = () => {
      setJoystick(j => ({ ...j, active: false }));
      lastTouchVec = null;           // keep heading, stop steering
    };
  
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);
    canvas.addEventListener('touchcancel',onTouchEnd);
    const onKey = e => {
      keys[e.key.toLowerCase()] = e.type === 'keydown';
      if (e.type === 'keydown') {
        // menu navigation
        if (gameStateRef.current === 'menu' && !showControls) {
          if (e.code === 'ArrowUp') {
            setMenuIndex((menuIndexRef.current + menuOptions.length - 1) % menuOptions.length);
            return;
          }
          if (e.code === 'ArrowDown') {
            setMenuIndex((menuIndexRef.current + 1) % menuOptions.length);
            return;
          }
          if (e.code === 'Enter') {
            const idx = menuIndexRef.current;
            if (idx === 0) setGameState('playing');
            else if (idx === 1) setShowControls(true);
            else if (idx === 2) { worldRef.current = createWorld(); setGameState('playing'); }
            return;
          }
        }
        if (e.code === 'Space') {
          if (gameStateRef.current === 'menu') {
            setGameState('playing');
          } else if (gameStateRef.current === 'gameover') {
            worldRef.current = createWorld();
            setGameState('playing');
          }
        } else if (e.code === 'Escape') {
          if (showControls) setShowControls(false);
          if (gameStateRef.current === 'playing') {
            setGameState('menu');
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    let lastTurn = 0;            // last time a direction change was accepted
    /*   --- main loop ---   */
    let last = 0;
    function loop(ts) {
      if (ts - last >= TICK_MS) {
        last = ts;
        const world = worldRef.current; // always get latest world state

        if (gameStateRef.current === 'playing') {
          /* ---- touch steering (virtual joystick) ---- */
          const p = world.player;
          if (lastTouchVec) {
            const nx = lastTouchVec.x, ny = lastTouchVec.y;
          const isOpp   = (nx * p.dir.x + ny * p.dir.y) < -0.95;  // almost exact reverse
          const canTurn = (ts - lastTurn) > JOY_TURN_COOLDOWN_MS;

            const nextX = (p.segs[0].x + nx * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const nextY = (p.segs[0].y + ny * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const wouldBite = willHitTail(nextX, nextY, p.segs, playerSkip(p));

            if (!isOpp && canTurn && !wouldBite) {
              p.dir.x = nx; p.dir.y = ny;
              lastTurn = ts;
              lastMoves.push({ ts, method: 'touch', dir: { x: nx, y: ny } });
              if (lastMoves.length > 15) lastMoves.shift();
            }
          }

          /* player dir from keys */
          let dx = 0, dy = 0;
          if (keys['arrowup'] || keys['w']) dy -= 1;
          if (keys['arrowdown'] || keys['s']) dy += 1;
          if (keys['arrowleft'] || keys['a']) dx -= 1;
          if (keys['arrowright'] || keys['d']) dx += 1;
          if (dx || dy) {
            const len = Math.hypot(dx, dy);
            const nx  = dx / len, ny = dy / len;

            const isOpposite = (nx === -p.dir.x && ny === -p.dir.y);
            const canTurn    = (ts - lastTurn) > TURN_COOLDOWN_MS;

            // simulate next‑tick head position and see if we’d chomp our own neck
            const nextX = (p.segs[0].x + nx * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const nextY = (p.segs[0].y + ny * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const wouldNeckBite = willHitTail(nextX, nextY, p.segs, playerSkip(p));

            if (!isOpposite && canTurn && !wouldNeckBite) {
              p.dir.x = nx;
              p.dir.y = ny;
              lastTurn = ts;
              lastMoves.push({ ts, method: 'key', dir: { x: p.dir.x, y: p.dir.y } });
              if (lastMoves.length > 15) lastMoves.shift();
            }
          }

          /* AI think and update */
          world.snakes.forEach(s => s.think && s.think(world, p));
          world.snakes.forEach(s => s.update(world));
          world.particles.forEach(p => p.update());
          world.particles = world.particles.filter(p => p.life > 0);

          handleCollisions(world);
          /* camera follows head */
          world.cam.x = lerp(world.cam.x, p.segs[0].x - view.w / 2, CAM_SMOOTH);
          world.cam.y = lerp(world.cam.y, p.segs[0].y - view.h / 2, CAM_SMOOTH);
          if (world.player.dead) {
            if (!world.hasLoggedDeath) {               // prevent spam
              console.log('Player died:', world.deathInfo ?? 'unknown cause');
              console.table(lastMoves);
              world.hasLoggedDeath = true;
            }
            setGameState('gameover');
          }
        }

        drawWorld(world, ctx, view, bgImg.current, bgReady);

        if (gameStateRef.current !== 'playing') {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(0, 0, view.w, view.h);
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';

          if (gameStateRef.current === 'menu' && !showControls && DRAW_CANVAS_MENU) {
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText('Neon Serpent', view.w / 2, view.h / 2 - 40);
            ctx.font = '28px monospace'; // slightly larger
            // menu items with more spacing and glow on selection
            ['Press SPACE to start', 'Controls', 'Restart Game'].forEach((text, i) => {
              const y = view.h / 2 + 30 + i * 50; // more space
              if (menuIndexRef.current === i) {
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
              } else {
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
              }
              ctx.fillText(text, view.w / 2, y);
            });
            ctx.shadowBlur = 0; // reset glow
          } else if (gameStateRef.current === 'gameover') {
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText('Game Over', view.w / 2, view.h / 2 - 40);
            ctx.font = '24px monospace';
            ctx.fillText(`Score: ${world.player.score}`, view.w / 2, view.h / 2 + 10);
            ctx.fillText('Press SPACE to restart', view.w / 2, view.h / 2 + 40);
          }

          ctx.textAlign = 'left';
        }
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    /* cleanup */
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
      canvas.removeEventListener('touchcancel',onTouchEnd);
    };
  }, [bgReady, showControls]);

  return (
    <div style={{ position: 'relative' }}>
      {joystick.active && (
        <div
          style={{
            position: 'fixed',
            left: joystick.cx - JOY_MAX_R,
            top:  joystick.cy - JOY_MAX_R,
            width: JOY_MAX_R * 2,
            height: JOY_MAX_R * 2,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
            zIndex: 50
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: JOY_MAX_R + joystick.dx,
              top:  JOY_MAX_R + joystick.dy,
              width: 40,
              height: 40,
              marginLeft: -20,
              marginTop:  -20,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              border: '2px solid rgba(255,255,255,0.9)',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          touchAction: 'none',
          filter: showControls ? 'blur(4px)' : ''
        }}
      />

      {gameState === 'menu' && !showControls && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            pointerEvents: 'auto'
          }}
        >
          {menuOptions.map((opt, idx) => (
            <button
              key={opt}
              onClick={() => handleMenuClick(idx)}
              style={{
                width: 220,
                padding: '14px 24px',
                fontSize: 22,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid #fff',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* main menu now rendered directly on canvas via draw loop */}

      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h2 style={{ marginBottom: 20, fontSize: '32px', fontWeight: 'bold' }}>Game Controls</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: 30, alignItems: 'center' }}>
          {controlsInfo.map((c, idx) => (
            c.label === 'Move' ? (
              <div key={idx} style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  {/* WASD cluster */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img src='/w.png' alt='W key' style={{ width: 56, height: 56 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <img src='/a.png' alt='A key' style={{ width: 56, height: 56 }} />
                      <img src='/s.png' alt='S key' style={{ width: 56, height: 56 }} />
                      <img src='/d.png' alt='D key' style={{ width: 56, height: 56 }} />
                    </div>
                  </div>

                  {/* separator */}
                  <span style={{ fontSize: 40, color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>|</span>

                  {/* Arrow‑key cluster */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img src='/up.png' alt='Up arrow' style={{ width: 56, height: 56 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <img src='/left.png'  alt='Left arrow'  style={{ width: 56, height: 56 }} />
                      <img src='/down.png'  alt='Down arrow'  style={{ width: 56, height: 56 }} />
                      <img src='/right.png' alt='Right arrow' style={{ width: 56, height: 56 }} />
                    </div>
                  </div>

                  {/* label */}
                  <span style={{ marginLeft: 24, fontSize: 28, fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
                    Move
                  </span>
                </div>
              </div>
            ) : (
              <div key={idx} style={{ fontFamily: 'sans-serif', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.icons && c.icons.length > 0 ? (
                    c.icons.map(icon => (
                      <img
                        key={icon}
                        src={icon}
                        alt={`${c.label} icon`}
                        style={{ width: c.label === 'Start / Restart' ? 48 : 32, height: c.label === 'Start / Restart' ? 48 : 32 }}
                      />
                    ))
                  ) : (
                    <span style={{ fontSize: '24px', color: '#fff' }}>{c.fallback}</span>
                  )}
                  <span style={{ marginLeft: '8px', fontSize: '24px', fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
                    {c.label}
                  </span>
                </div>
              </div>
            )
          ))}
          </div>
          <button
            onClick={() => setShowControls(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 12px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '18px', fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}


/*  ----------  tiny sanity tests (run on import) ----------  */
console.assert(dist({ x: 0, y: 0 }, { x: 3, y: 4 }) === 5, 'dist fail');

```

### src/components/ControlsOverlay.jsx

```jsx
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React from 'react';

/**
 * Controls overlay component
 * @param {{ onBack: Function, controlsInfo: Array<{label: string, icons: string[], fallback?: string}> }} props
 */
export default function ControlsOverlay({ onBack, controlsInfo }) {
  return (
    <div className="controls-overlay">
      <h2>Controls</h2>
      <div className="controls-grid">
        {controlsInfo.map(control => (
          <div key={control.label} className="control-item">
            <span className="control-label">{control.label}:</span>
            <div className="control-icons">
              {control.icons.length > 0 ? (
                control.icons.map(icon => <img key={icon} src={icon} alt="" />)
              ) : (
                <span className="control-fallback">{control.fallback}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onBack} className="back-button">Back (Esc)</button>
    </div>
  );
}

```

### src/components/GameCanvas.jsx

```jsx
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React, { useRef, useEffect } from 'react';
import { useResizeCanvas } from '../hooks/useResizeCanvas';
import { drawWorld } from '../render';
import { createWorld } from '../world'; // Keep createWorld if needed elsewhere, or remove if only used in parent

export default function GameCanvas({ gameState, setGameState, worldRef }) { // Added worldRef prop
  const canvasRef = useRef(null);
  const lastTurnRef = useRef(0);
  const lastTsRef = useRef(0);
  const bgVidRef = useRef(null); // Ref for the background video

  useResizeCanvas(canvasRef);

  // Autoplay the background video
  useEffect(() => {
    bgVidRef.current?.play().catch(error => {
      console.error("Video autoplay prevented:", error);
    });
  }, []); // Run once on mount

  // Game loop logic (drawing only)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderLoop = (timestamp) => {
      if (!canvas) return;

      // Calculate view dimensions in CSS pixels
      const dpr = canvas.width / window.innerWidth; // Assuming canvas fills window width
      const viewW = canvas.width / dpr;
      const viewH = canvas.height / dpr;

      // Clear canvas or handle background drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Use raw canvas dimensions for clearing

      // Draw the video background with parallax
      if (bgVidRef.current?.readyState >= 2) { // HAVE_CURRENT_DATA or more
        const vid = bgVidRef.current;
        const cam = worldRef.current?.cam || { x: 0, y: 0 }; // Get camera from worldRef

        // Calculate scaling to fit video height to canvas height (CSS pixels)
        const vidAspect = vid.videoWidth / vid.videoHeight;
        const scaledVidHeight = viewH;
        const scaledVidWidth = scaledVidHeight * vidAspect;

        // Parallax factor (adjust as needed)
        const parallaxFactor = 0.3;
        const parallaxOffsetX = (cam.x * parallaxFactor) % scaledVidWidth;

        // Draw tiled video background (using CSS pixel dimensions for drawing)
        // We need to draw enough copies to cover the screen, considering the parallax offset.
        // Start drawing from a negative offset to handle wrapping.
        let currentX = -parallaxOffsetX;
        while (currentX < viewW) {
            ctx.drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight, currentX, 0, scaledVidWidth, scaledVidHeight);
            currentX += scaledVidWidth;
        }

      } else {
        // Fallback background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, viewW, viewH); // Use CSS dimensions for fallback fill
      }

      // Draw the rest of the world state from worldRef
      if (worldRef.current && gameState === 'playing') {
        // Pass CSS pixel dimensions to drawWorld
        drawWorld(ctx, worldRef.current, viewW, viewH);
      } else if (gameState === 'menu') {
         // Optionally draw menu-specific background/elements
      }
      // ... other gameState drawing logic ...

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop(0); // Start the loop

    return () => {
      cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    };
    // Update dependency array: worldRef is needed, gameState determines *what* to draw
  }, [gameState, worldRef]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <video
        ref={bgVidRef}
        src="/cave-city.mp4"    /* lives in /public, so root path works */
        loop
        muted // Muted is often required for autoplay
        playsInline // Important for mobile browsers
        style={{ display: 'none', pointerEvents: 'none' }} // Hide the video element and prevent pointer events
        preload="auto" // Helps ensure video is ready sooner
      />
    </>
  );
}

```

### src/components/MenuOverlay.jsx

```jsx
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React from 'react';

/**
 * Menu overlay component
 * @param {{ menuIndex: number, setMenuIndex: Function, onSelect: Function, menuOptions: string[] }} props
 */
export default function MenuOverlay({ menuIndex, setMenuIndex, onSelect, menuOptions }) {
  return (
    <div className="menu-overlay">
      <h1>Neon Serpent</h1>
      <div className="menu-buttons">
        {menuOptions.map((opt, idx) => (
          <button
            key={opt}
            className={idx === menuIndex ? 'selected' : ''}
            onClick={() => onSelect(idx)} // Use the passed onSelect handler
            onMouseEnter={() => setMenuIndex(idx)} // Update index on hover
          >
            {opt}
          </button>
        ))}
      </div>
      <p className="hint">Use Arrow Keys or WASD to navigate, Enter or Space to select.</p>
    </div>
  );
}

```

### src/constants.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17

/*  ----------  background constants  ----------  */
// path is relative to the public/ folder
export const BG_SRC = '/cave-city.mp4'; // Using video now, keep var name for potential future use? Or remove? Let's keep for now.
export const BG_SCALE = 0.25; // May not be relevant for video background tiling logic

/*  ----------  world constants  ----------  */
export const WORLD_SIZE   = 4000;               // square wrap‑around world
export const INITIAL_AI   = 6;
export const TICK_MS      = 1000 / 60;          // 60 fps logic
export const CAM_SMOOTH   = 0.08;
export const ORB_COUNT    = 350;
export const TURN_COOLDOWN_MS = 100;   // minimum interval (ms) between allowed turns (keyboard)
export const SELF_GAP         = 8;     // ignore first N segments for player self‑collision (DEPRECATED? see playerSkip)
export const TOUCH_DEADZONE_PX = 16;   // min drag distance before a touch turn registers (DEPRECATED? see JOY_DEADZONE)
export const ENEMY_NECK_GAP   = 4;     // ignore first N segments for AI necks
/* ---------- safety constant ---------- */
// “safe” tail distance (in px) used to decide how many neck links to ignore
// when checking if the player bites its own tail. Bigger == more forgiving.
export const SAFE_PX = 64;

/* ---------- joystick constants ---------- */
export const JOY_MAX_R    = 48;   // px – ring radius
// tighter dead‑zone for finer control
export const JOY_DEADZONE = 4;    // px – ignore micro wobbles only
// per‑joystick turn throttle (lower = snappier feel)
export const JOY_TURN_COOLDOWN_MS = 20;

export const POWERUPS     = ['turbo', 'phase', 'magnet', 'size']; // Not currently used?
// HTML overlay now handles the menu, so skip the old canvas text
export const DRAW_CANVAS_MENU = false; // Likely deprecated by React UI

```

### src/entities/Orb.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { rand } from '../utils/math'; // Assuming rand is in math utils

export default class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const roll = Math.random(); // Use Math.random directly or import rand if it handles specific ranges
    if (roll < 0.02)       { this.type = 'rare';      this.r = 9; }
    else if (roll < 0.07)  { this.type = 'uncommon';  this.r = 7; }
    else                   { this.type = 'common';    this.r = 5; }
  }

  draw(ctx, cam) {
    const sx = this.x - cam.x, sy = this.y - cam.y;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r);
    const core = this.type === 'rare' ? '#ff4bff' :
                 this.type === 'uncommon' ? '#4bffec' : '#ffffff';
    g.addColorStop(0, core);
    g.addColorStop(1, 'rgba(0,255,255,0)'); // Assuming alpha fade is desired
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, this.r, 0, Math.PI * 2); ctx.fill();
  }
}

```

### src/entities/Particle.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { rand } from '../utils/math'; // Assuming rand is in math utils

export default class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = rand(-2, 2);
    this.vy = rand(-2, 2);
    this.life = 30; // Lifespan in ticks/frames
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx, cam) {
    if (this.life <= 0) return;
    const alpha = this.life / 30;
    // Draw particle relative to camera
    const sx = this.x - cam.x;
    const sy = this.y - cam.y;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(sx, sy, 2, 2); // Simple square particle
  }
}

```

### src/entities/Snake.js

```js
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

```

### src/entities/index.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// Barrel file for entities
export { default as Orb } from './Orb';
export { default as Snake } from './Snake';
export { createAISnake } from './Snake';
export { default as Particle } from './Particle';

```

### src/hooks/useResizeCanvas.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Implement canvas resize and DPI scaling hook
import { useEffect } from 'react';

/**
 * Hook to handle canvas resizing and high-DPI scaling.
 * @param {HTMLCanvasElement} canvas Ref or DOM node of the canvas
 */
export function useResizeCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef]);
}

```

### src/index.css

```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  /* background-color: #242424; Remove default background */

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  /* display: flex; */
  /* place-items: center; */
  /* min-width: 320px; */
  min-height: 100vh;
  overflow: hidden; /* Prevent scrollbars */
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  color: rgba(255, 255, 255, 0.87); /* Ensure button text is visible */
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

```

### src/input/index.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// Barrel for input hooks
export * from './keyboard';
export * from './joystick';

```

### src/input/joystick.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { useEffect, useState, useRef, useCallback } from 'react';
import { JOY_MAX_R, JOY_DEADZONE, SAFE_PX } from '../constants'; // Import constants
import { dist, clamp, snapToCardinal, dynamicDeadzone } from '../utils/math'; // Import helpers

/**
 * Hook to manage virtual joystick state and calculate direction vector.
 * @param {React.RefObject<object>} worldRef - Ref to the game world to get player speed for dynamic deadzone.
 * @returns {{ joystickState: { active: boolean, cx: number, cy: number, dx: number, dy: number }, vec: { x: number, y: number } | null }}
 */
export function useJoystick(worldRef) { // Accept worldRef
  const [joystickState, setJoystick] = useState({ active: false, cx: 0, cy: 0, dx: 0, dy: 0 });
  const [vec, setVec] = useState(null); // Store the calculated direction vector
  const lastTouchTimeRef = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return; // Only handle single touch
    e.preventDefault();
    const touch = e.touches[0];
    setJoystick(prev => ({ ...prev, active: true, cx: touch.clientX, cy: touch.clientY, dx: 0, dy: 0 }));
    setVec(null); // Reset vector on new touch
    lastTouchTimeRef.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!joystickState.active || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    let dx = touch.clientX - joystickState.cx;
    let dy = touch.clientY - joystickState.cy;
    const len = Math.hypot(dx, dy);

    // Clamp knob position to joystick ring
    if (len > JOY_MAX_R) {
      dx = (dx / len) * JOY_MAX_R;
      dy = (dy / len) * JOY_MAX_R;
    }

    setJoystick(prev => ({ ...prev, dx, dy }));

    // Calculate direction vector if outside deadzone
    const playerSpeed = worldRef.current?.player?.speed || 1.2; // Get speed or default
    const deadzone = dynamicDeadzone(playerSpeed); // Use dynamic deadzone

    if (len > deadzone) {
      const snapped = snapToCardinal(dx, dy);
      setVec(snapped); // Update the vector state
      lastTouchTimeRef.current = Date.now();
    } else {
      setVec(null); // Inside deadzone, no direction
    }
  }, [joystickState.active, joystickState.cx, joystickState.cy, worldRef]); // Include dependencies

  const handleTouchEnd = useCallback((e) => {
    if (!joystickState.active) return;
    // Don't prevent default for touchend/cancel
    setJoystick(prev => ({ ...prev, active: false, dx: 0, dy: 0 }));
    // Keep the last valid vector for a short time or until next move?
    // setVec(null); // Option 1: Reset vector immediately
    // Option 2: Keep last vector (current behavior)
  }, [joystickState.active]);

  useEffect(() => {
    // Use passive: false ONLY if preventDefault is called inside the handler
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]); // Add handlers to dependencies

  // Return the state and the calculated vector
  return { joystickState, vec };
}

```

### src/input/keyboard.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to track keyboard state and direction vector
 * @returns {{ keys: Record<string, boolean>, dir: {x: number, y: number} }}
 */
export function useKeyboard() {
  const [keys, setKeys] = useState({});
  const [dir, setDir] = useState({ x: 1, y: 0 }); // Start facing right

  const updateDir = useCallback((currentKeys) => {
    let dx = 0, dy = 0;
    if (currentKeys['ArrowUp']    || currentKeys['w']) dy = -1;
    if (currentKeys['ArrowDown']  || currentKeys['s']) dy =  1;
    if (currentKeys['ArrowLeft']  || currentKeys['a']) dx = -1;
    if (currentKeys['ArrowRight'] || currentKeys['d']) dx =  1;

    // Prioritize vertical movement if both directions are pressed simultaneously
    // (Matches original behavior where vertical keys override horizontal)
    if (dy !== 0) dx = 0;

    if (dx !== 0 || dy !== 0) {
      setDir({ x: dx, y: dy });
    }
    // If no direction keys are pressed, dir remains the last valid direction
  }, []);

  useEffect(() => {
    const handleKey = e => {
      // Ignore irrelevant keys or modifier keys if needed
      if ([ 'w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ].includes(e.key)) {
        const isDown = e.type === 'keydown';
        setKeys(prevKeys => {
          const newKeys = { ...prevKeys, [e.key]: isDown };
          updateDir(newKeys); // Update direction based on the new key state
          return newKeys;
        });
      }
      // Prevent default browser behavior for arrow keys, etc.
      // e.preventDefault(); // This might interfere with menu navigation, handle carefully
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [updateDir]); // Add updateDir to dependency array

  return { keys, dir };
}

```

### src/main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

### src/render/drawWorld.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { WORLD_SIZE } from '../constants'; // Assuming BG_SCALE is handled elsewhere or not needed for video

/**
 * Draw the entire game world to canvas context
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {object} world - current world state { orbs, snakes, particles, player, cam }
 * @param {number} viewWidth - width of the canvas viewport
 * @param {number} viewHeight - height of the canvas viewport
 * Note: Background drawing is now handled in GameCanvas.jsx
 */
export function drawWorld(ctx, world, viewWidth, viewHeight) {
  // Background is drawn in GameCanvas.jsx, so we only draw entities and HUD here.

  // Save context state before applying transformations/styles
  ctx.save();

  // Optional: Draw world boundary (if desired, can be toggled with a constant)
  // This needs to be drawn relative to the camera
  // ctx.strokeStyle = 'rgba(255,0,0,0.35)';
  // ctx.lineWidth = 4;
  // ctx.setLineDash([12, 8]);
  // ctx.strokeRect(-world.cam.x, -world.cam.y, WORLD_SIZE, WORLD_SIZE);
  // ctx.setLineDash([]);

  /* Draw entities */
  // Ensure entities have draw methods that accept (ctx, world.cam)
  world.orbs.forEach(o => o.draw(ctx, world.cam));
  world.particles.forEach(p => p.draw(ctx, world.cam));
  world.snakes.forEach(s => s.draw(ctx, world.cam));

  /* Draw HUD */
  // Use fixed position for HUD elements
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left'; // Reset alignment
  ctx.shadowBlur = 0; // Ensure no leftover shadow from snake drawing
  ctx.fillText(`Score: ${world.player.score}`, 12, 20);
  // Add other HUD elements as needed (e.g., length, high score)

  // Restore context state
  ctx.restore();
}

```

### src/render/index.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// Barrel file for render utilities
export { drawWorld } from './drawWorld';

```

### src/utils/index.js

```js
// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
export * from './math';

```

### src/utils/math.js

```js
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

```

### src/world/index.js

```js
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
  if (viewW && viewH) { // Only update camera if view dimensions are provided
    world.cam.x = lerp(world.cam.x, p.segs[0].x - viewW * 0.5, CAM_SMOOTH);
    world.cam.y = lerp(world.cam.y, p.segs[0].y - viewH * 0.5, CAM_SMOOTH);
  } else {
    // Fallback or warning if dimensions missing? Keep old behavior for now?
    // Or just center based on last known good coords? Let's stick to the lerp without centering.
    world.cam.x = lerp(world.cam.x, p.segs[0].x, CAM_SMOOTH);
    world.cam.y = lerp(world.cam.y, p.segs[0].y, CAM_SMOOTH);
    if (!world.warnedAboutMissingViewDims) {
        console.warn("updateWorld called without viewW/viewH, camera centering disabled.");
        world.warnedAboutMissingViewDims = true; // Prevent spamming console
    }
  }


  return world;
}

```
