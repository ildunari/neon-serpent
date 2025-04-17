// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Implement keyboard input hook based on original onKey logic
import { useEffect, useState } from 'react';

/**
 * Hook to track keyboard state and direction vector
 * @returns {{ keys: Record<string, boolean>, dir: {x: number, y: number} }}
 */
export function useKeyboard() {
  const [keys, setKeys] = useState({});
  const [dir, setDir] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKey = e => {
      // TODO: update keys state and compute dir based on keys
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  return { keys, dir };
}
