/*  Neon Serpent — Modular React Build
    React + HTML5 canvas
    2025-04-17   */
// Verification checklist (Updated 2025-05-20):
//   [X] NeonSerpentGame.jsx compiles without the old loop (handled by edit)
//   [ ] Only one RAF appears in DevTools Performance tab (Manual check required)
//   [ ] Game still enters 'gameover' correctly (Manual check required)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MenuOverlay from './components/MenuOverlay';
import ControlsOverlay from './components/ControlsOverlay';
import { createWorld, updateWorld } from './world';
import { useKeyboard, useJoystick } from './input'; // Import input hooks from barrel file
import { TURN_COOLDOWN_MS, JOY_TURN_COOLDOWN_MS, WORLD_SIZE } from './constants'; // Import cooldown constants & WORLD_SIZE
import { willHitTail, playerSkip } from './utils/math'; // Import turn safety helper & playerSkip

// Define menu options and controls info
const controlsInfo = [
  { label: 'Move', icons: ['/w.png', '/a.png', '/s.png', '/d.png'], fallback: 'WASD' },
  { label: 'Move', icons: ['/up.png', '/left.png', '/down.png', '/right.png'], fallback: 'Arrow Keys' },
  { label: 'Select/Pause', icons: ['/space.png'], fallback: 'Space/Enter' },
  { label: 'Back', icons: [], fallback: 'Esc' },
  { label: 'Touch', icons: [], fallback: 'Virtual Joystick (Tap & Drag)' },
];

export default function NeonSerpentGame() {
  const [gameState, setGameState] = useState('menu'); // Default to 'menu'
  console.log(`Rendering NeonSerpentGame with gameState: ${gameState}`); // Added log
  const [menuIndex, setMenuIndex] = useState(0);
  const [isGameInProgress, setIsGameInProgress] = useState(false); // Track if game is resumable
  const [playerSkipCount, setPlayerSkipCount] = useState(0); // <--- Add state for skip count
  const [showControls, setShowControls] = useState(false);
  const worldRef = useRef(null); // Initialize as null, create world on start
  const lastTurnRef = useRef(0); // Track last turn time
  const canvasSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight }); // Track canvas size
  const canSelectMenu = useRef(false); // Ref to prevent initial menu selection

  // Initialize input hooks
  const { dir: keyDir } = useKeyboard();
  const { joystickState, vec: joyVec } = useJoystick();

  // Update canvas size ref on resize (could also get from useResizeCanvas if needed)
  useEffect(() => {
    const handleResize = () => {
      canvasSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // <-- Add this initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Allow menu selection only after a short delay to prevent initial phantom space press
  useEffect(() => {
    const timer = setTimeout(() => {
      canSelectMenu.current = true;
    }, 100); // 100ms delay, adjust if needed
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Initialize world only when starting the game
  const startGame = useCallback(() => {
    console.log("Creating new world and starting game...");
    worldRef.current = createWorld();
    lastTurnRef.current = 0; // Reset turn timer
    setShowControls(false);
    setIsGameInProgress(true); // Mark game as in progress
    setGameState('playing');
  }, []);

  // Add this useEffect to snap camera when entering 'playing' state
  useEffect(() => {
    if (gameState === 'playing' && worldRef.current) {
      const { width, height } = canvasSizeRef.current;
      // Ensure dimensions and world/player refs are valid before calculation
      if (width && height && worldRef.current.player?.segs?.[0]) {
        const p = worldRef.current.player;
        worldRef.current.cam.x = p.segs[0].x - width  * 0.5;
        worldRef.current.cam.y = p.segs[0].y - height * 0.5;
        // console.log('Camera snapped on entering playing state.'); // Optional: for debugging
      }
    }
  }, [gameState]); // Re-run only when gameState changes

  // Define menu/controls handlers *before* the effect that uses them
  const handleMenuSelect = useCallback((idx, currentOptions) => {
    // We need currentOptions passed here now as it's dynamic
    setMenuIndex(idx);
    const action = currentOptions[idx]; // Use the passed options array
    console.log(`Menu action selected: ${action}`); // Debug log

    if (action === 'Resume') {
      setGameState('playing');
    } else if (action === 'Start Game' || action === 'Restart Game') {
      startGame(); // This sets isGameInProgress = true
    } else if (action === 'Controls') {
      setShowControls(true);
    }
  }, [startGame]); // startGame is a dependency

  const handleControlsBack = useCallback(() => {
    setShowControls(false);
  }, []);

  // Input Handling Effect (runs independently of render loop)
  useEffect(() => {
    // Only process input if playing and player exists
    if (gameState !== 'playing' || !worldRef.current?.player) return;

    const now = Date.now();
    const turnCooldown = joystickState.active ? JOY_TURN_COOLDOWN_MS : TURN_COOLDOWN_MS;
    let desiredDir = null;

    // Determine desired direction from input
    if (joystickState.active && joyVec) {
      desiredDir = joyVec;
    } else if (!joystickState.active && (keyDir.x !== 0 || keyDir.y !== 0)) {
      // Only use keyboard if joystick is not active
      desiredDir = keyDir;
    }

    // Process turn if a direction is desired and cooldown has passed
    if (desiredDir && now - lastTurnRef.current > turnCooldown) {
      const player = worldRef.current.player;
      const head = player.segs[0];

      // Calculate next head position based on desired direction for collision check
      // Ensures wrap-around logic is considered for the check
      const nextX = (head.x + desiredDir.x * player.speed + WORLD_SIZE) % WORLD_SIZE;
      const nextY = (head.y + desiredDir.y * player.speed + WORLD_SIZE) % WORLD_SIZE;

      // Check if the turn would immediately collide with the tail/neck
      const skipCount = playerSkip(player); // Calculate skip count for the check
      const wouldBite = willHitTail(nextX, nextY, player.segs, skipCount);

      // Update player direction if the turn is safe
      if (!wouldBite) {
        player.dir.x = desiredDir.x;
        player.dir.y = desiredDir.y;
        lastTurnRef.current = now;
        // console.log(`Turn accepted: ${desiredDir.x}, ${desiredDir.y}`); // Optional debug
      }
    }
  }, [gameState, keyDir, joyVec, joystickState.active, worldRef]); // Dependencies

  // Menu Navigation and Selection + Global Key Handlers
  useEffect(() => {
    // Define dynamic menu options based on game state
    const currentMenuOptions = isGameInProgress
      ? ['Resume', 'Controls', 'Restart Game']
      : ['Start Game', 'Controls', 'Restart Game'];

    const handleKeyDown = (e) => {
      // console.log(`[KeyDown] Key: ${e.key}, GameState: ${gameState}, InProgress: ${isGameInProgress}`); // DEBUG

      if (gameState === 'menu' && !showControls) {
        if (e.key === 'ArrowUp' || e.key === 'w') {
          setMenuIndex(prev => (prev - 1 + currentMenuOptions.length) % currentMenuOptions.length);
        } else if (e.key === 'ArrowDown' || e.key === 's') {
          setMenuIndex(prev => (prev + 1) % currentMenuOptions.length);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (canSelectMenu.current) {
            handleMenuSelect(menuIndex, currentMenuOptions);
          }
        } else if (e.key === 'Escape' && isGameInProgress) {
          // Add Escape key behavior for menu state: Resume if possible
          e.preventDefault();
          setGameState('playing'); // Resume the game
        }
      } else if (gameState === 'playing') { // Handle keys during gameplay
        if (e.key === 'Escape') {
          e.preventDefault();
          setGameState('menu'); // Go back to menu (will show Resume option)
        } else if (e.key === ' ') { // Space still uses simple pause
          e.preventDefault();
          setGameState('paused');
        }
      } else if (gameState === 'paused') { // Simple pause state
        if (e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          setGameState('playing'); // Resume from simple pause
        }
      } else if (gameState === 'gameover' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        setIsGameInProgress(false); // Game ended, no longer resumable
        setGameState('menu');
        setMenuIndex(0);
      } else if (showControls && e.key === 'Escape') {
        handleControlsBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, menuIndex, showControls, handleMenuSelect, handleControlsBack, isGameInProgress]);

  // Determine current menu options for rendering
  const currentMenuOptions = isGameInProgress
    ? ['Resume', 'Controls', 'Restart Game']
    : ['Start Game', 'Controls', 'Restart Game'];

  return (
    <div className="game-container"> {/* Add a container div */}
      {/* Always render canvas, but drawing depends on state */}
      <GameCanvas
        gameState={gameState}
        worldRef={worldRef}
        playerSkipCount={playerSkipCount}
        setGameState={setGameState}
        setPlayerSkipCount={setPlayerSkipCount}
      />

      {/* Conditional Overlays */}
      {gameState === 'menu' && !showControls && (
        <MenuOverlay
          menuIndex={menuIndex}
          setMenuIndex={setMenuIndex}
          onSelect={(idx) => handleMenuSelect(idx, currentMenuOptions)} // Pass options to handler
          menuOptions={currentMenuOptions} // Pass dynamic options
        />
      )}
      {showControls && (
        <ControlsOverlay onBack={handleControlsBack} controlsInfo={controlsInfo} /> // Pass info
      )}
      {/* Restored simple pause overlay with updated text and onClick */}
      {gameState === 'paused' && (
        <div
          className="overlay simple-overlay tappable-overlay"
          onClick={() => setGameState('playing')} // Add onClick to resume
        >
          <h2>Paused</h2>
          <p>Tap/Click or press Space/Esc to Resume</p>
        </div>
      )}
      {/* Add Game Over overlay with restart logic */}
      {gameState === 'gameover' && (
        <div
          className="overlay simple-overlay tappable-overlay"
          onClick={() => { // Add onClick to restart
            setIsGameInProgress(false);
            setGameState('menu');
            setMenuIndex(0);
          }}
        >
          <h2>Game Over</h2>
          <p>Score: {worldRef.current?.player?.score ?? 0}</p> {/* Display score */}
          <p>Tap/Click or press Enter/Space to Restart</p>
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
