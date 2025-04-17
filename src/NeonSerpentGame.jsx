/*  Neon Serpent — single‑file playable build
    React + HTML5 canvas
    2025‑04‑16   */

/*  ----------  React component  ----------  */
import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MenuOverlay from './components/MenuOverlay';
import ControlsOverlay from './components/ControlsOverlay';
import { createWorld, updateWorld } from './world';

export default function NeonSerpentGame() {
  const [gameState, setGameState] = useState('menu');
  const [menuIndex, setMenuIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const worldRef = useRef(createWorld());

  useEffect(() => {
    let last = performance.now();
    const loop = ts => {
      const dt = ts - last;
      last = ts;
      if (gameState === 'playing') {
        updateWorld(worldRef.current, dt);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // No cleanup needed for animation frame in this simple loop
  }, [gameState]);

  const handleMenuSelect = idx => {
    setMenuIndex(idx);
    if (idx === 0) { // Start game
      worldRef.current = createWorld();
      setGameState('playing');
    } else if (idx === 1) { // Show controls
      setShowControls(true);
    } else if (idx === 2) { // Restart game
      worldRef.current = createWorld();
      setGameState('playing');
    }
  };

  const handleControlsBack = () => {
    setShowControls(false);
  };

  return (
    <>
      <GameCanvas gameState={gameState} setGameState={setGameState} worldRef={worldRef} />
      {gameState === 'menu' && !showControls && (
        <MenuOverlay
          menuIndex={menuIndex}
          setMenuIndex={setMenuIndex}
          onSelect={handleMenuSelect}
        />
      )}
      {showControls && (
        <ControlsOverlay onBack={handleControlsBack} />
      )}
    </>
  );
}
