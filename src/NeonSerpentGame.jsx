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
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameover'
  const [menuIndex, setMenuIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const worldRef = useRef(null); // Initialize as null, create world on start
  const lastTurnRef = useRef(0); // Track last turn time

  // Initialize input hooks
  const { keys, dir: keyDir } = useKeyboard();
  const { joystickState, vec: joyVec } = useJoystick(worldRef); // Pass worldRef

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
          // Add willHitTail check if needed, requires passing world state
          // const isSafeTurn = !(...) && !willHitTail(...);

          if (isSafeTurn) {
            player.vx = desiredDir.x;
            player.vy = desiredDir.y;
            lastTurnRef.current = now;
            // Add to lastMoves if that debugging feature is desired
          }
        }
        // --- End Input Processing ---

        // Update world logic
        worldRef.current = updateWorld(worldRef.current, dt);

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
  }, [gameState, keyDir, joyVec, joystickState.active, startGame]); // Add input states to dependencies

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
  }, [gameState, menuIndex, showControls]); // Dependencies for key handling

  const handleMenuSelect = useCallback((idx) => {
    setMenuIndex(idx);
    const action = menuOptions[idx];
    if (action === 'Start Game' || action === 'Restart Game') {
      startGame();
    } else if (action === 'Controls') {
      setShowControls(true);
    }
  }, [startGame]);

  const handleControlsBack = useCallback(() => {
    setShowControls(false);
  }, []);

  return (
    <>
      {/* Always render canvas, but drawing depends on state */}
      <GameCanvas gameState={gameState} setGameState={setGameState} worldRef={worldRef} />

      {/* Conditional Overlays */}
      {gameState === 'menu' && !showControls && (
        <MenuOverlay
          menuIndex={menuIndex}
          setMenuIndex={setMenuIndex}
          onSelect={handleMenuSelect}
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
    </>
  );
}
