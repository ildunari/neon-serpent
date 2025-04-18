// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to track keyboard state and direction vector
 * @returns {{ keys: Record<string, boolean>, dir: {x: number, y: number} }}
 */
export function useKeyboard() {
  const [keys, setKeys] = useState({});
  const [dir, setDir] = useState({ x: 0, y: 0 }); // Start with no direction

  const updateDir = useCallback((currentKeys) => {
    let dx = 0;
    let dy = 0;

    // Check horizontal keys
    if (currentKeys['ArrowLeft']  || currentKeys['a']) dx = -1;
    if (currentKeys['ArrowRight'] || currentKeys['d']) dx =  1;

    // Check vertical keys
    if (currentKeys['ArrowUp']    || currentKeys['w']) dy = -1;
    if (currentKeys['ArrowDown']  || currentKeys['s']) dy =  1;

    // Normalize if diagonal
    if (dx !== 0 && dy !== 0) {
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      // Avoid division by zero, though magnitude should be sqrt(2) here
      if (magnitude > 0) { 
        dx /= magnitude;
        dy /= magnitude;
        // Optional: Round to avoid floating point issues if needed, 
        // but for unit vector it might be okay. 
        // dx = Math.round(dx * 100) / 100;
        // dy = Math.round(dy * 100) / 100;
      }
    }

    // Update direction if it has changed
    // This allows dir to become {x: 0, y: 0} if no keys are pressed
    setDir(prevDir => {
      if (prevDir.x !== dx || prevDir.y !== dy) {
        return { x: dx, y: dy };
      }
      return prevDir; // No change
    });

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
