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

*   **`src/NeonSerpentGame.jsx`**: The main React component that manages the overall game state (`menu`, `playing`, `paused`, `gameover`), handles dynamic menu options (e.g., 'Resume' vs 'Start Game'), processes inputs via hooks, coordinates the `GameCanvas` and UI overlays (`MenuOverlay`, `ControlsOverlay`), and triggers game start/restart logic.
*   **`src/components/`**: Contains reusable React UI components.
    *   **`GameCanvas.jsx`**: Sets up the HTML5 canvas and likely manages the `requestAnimationFrame` loop, delegating drawing to the render logic.
    *   **`MenuOverlay.jsx`**: Displays the main menu with dynamic options based on game state.
    *   **`ControlsOverlay.jsx`**: Displays the controls information screen.
*   **`src/entities/`**: Defines the classes for game objects like `Snake`, `Orb`, and `Particle`, including their state, update logic, and possibly drawing methods (or data for the renderer).
*   **`src/input/`**: Manages user input using custom React hooks:
    *   **`useKeyboard()`**: Handles WASD/Arrow key input.
    *   **`useJoystick()`**: Handles virtual joystick input for touch devices.
    *   Includes logic for turn cooldowns and safety checks (`willHitTail`) to prevent immediate self-collision.
*   **`src/utils/math.js`**: Provides utility functions for math operations and physics calculations (e.g., `dist`, `lerp`, `willHitTail` for turn safety checks, `playerSkip` for collision lookahead).
*   **`src/constants.js`**: Centralizes game configuration values like world size, speeds, cooldowns, entity counts, etc.
*   **`src/main.jsx`**: The application entry point, responsible for rendering the root React component (`App.jsx`).
*   **`src/hooks/`**: Contains custom React Hooks, such as `useKeyboard` and `useJoystick` for input management, and potentially others for game loop or state logic.

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
