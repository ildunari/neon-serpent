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
