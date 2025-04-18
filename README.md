# Neon Serpent

A modern implementation of the classic Snake game using React and HTML5 Canvas.

## Project Structure

```
neon-serpent/
├── public/             # Static assets served directly
├── src/
│   ├── assets/         # Game-specific assets (images, sounds - if any)
│   ├── components/     # React UI components (GameCanvas, MenuOverlay, ControlsOverlay)
│   ├── entities/       # Game object classes (Snake, Orb, Particle)
│   ├── hooks/          # Custom React hooks (e.g., useGameLoop)
│   ├── input/          # Input handling logic (keyboard, joystick)
│   ├── render/         # Canvas rendering logic (drawWorld)
│   ├── utils/          # Helper functions (math, physics)
│   ├── world/          # World creation, update loop, collision logic
│   ├── App.css         # Styling for App component
│   ├── App.jsx         # Main App component (renders NeonSerpentGame)
│   ├── constants.js    # Game constants (sizes, speeds, etc.)
│   ├── index.css       # Global styles
│   ├── main.jsx        # React entry point (using Vite)
│   ├── NeonSerpentGame.jsx # Core game logic component
│   └── ...             # Other source files
├── .gitignore
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite configuration
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML entry point for Vite
└── README.md           # This file
```

## Key Modules

*   **`src/NeonSerpentGame.jsx`**: The main React component that orchestrates the game state (menu, playing, gameover), handles the main loop (possibly using custom hooks), processes inputs, and renders UI overlays.
*   **`src/components/GameCanvas.jsx`**: Responsible for setting up the HTML5 canvas and delegating drawing operations.
*   **`src/render/drawWorld.js`**: Contains the core logic for drawing game elements (background, orbs, snakes, particles) onto the canvas based on the world state.
*   **`src/world/index.js`**: Contains functions for creating the initial game world (`createWorld`), updating the world state each tick (`updateWorld`), and handling collisions between game entities (`handleCollisions`).
*   **`src/entities/`**: Defines the classes for game objects like `Snake`, `Orb`, and `Particle`, including their state, update logic, and possibly drawing methods (or data for the renderer).
*   **`src/input/`**: Manages user input from the keyboard (`keyboard.js`) and virtual joystick (`joystick.js`).
*   **`src/utils/math.js`**: Provides utility functions for math operations, physics calculations (`dist`, `lerp`, `willHitTail`, `playerSkip`), and random number generation.
*   **`src/constants.js`**: Centralizes game configuration values like world size, speeds, cooldowns, entity counts, etc.
*   **`src/main.jsx`**: The application entry point, responsible for rendering the root React component (`App.jsx`).
*   **`src/hooks/`**: Likely contains custom React Hooks for managing game state, loops, or other reusable logic.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd neon-serpent
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This should open the game in your default browser, typically at `http://localhost:5173`.

## Controls

*   **Keyboard:** Use WASD or Arrow Keys to move the snake.
*   **Touch:** Tap and drag on the screen to activate the virtual joystick.
*   **Space/Enter:** Start/Restart game, confirm menu selection.
*   **Escape:** Return to the main menu from the game or Controls screen.
