/*  Neon Serpent — single‑file playable build
    React + HTML5 canvas
    2025‑04‑16   */

/*  ----------  React component  ----------  */
import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import MenuOverlay from './components/MenuOverlay';
import ControlsOverlay from './components/ControlsOverlay';

export default function NeonSerpentGame() {
  const [gameState, setGameState] = useState('menu');
  const [menuIndex, setMenuIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const handleMenuSelect = idx => {
    setMenuIndex(idx);
    // TODO: implement actions for each menu index: start game, show controls, restart game
  };

  const handleControlsBack = () => {
    setShowControls(false);
  };

  return (
    <>
      <GameCanvas gameState={gameState} setGameState={setGameState} />

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
