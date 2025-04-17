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
