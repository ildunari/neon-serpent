// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { useEffect, useState, useRef, useCallback } from 'react';
import { JOY_MAX_R, JOY_DEADZONE, SAFE_PX } from '../constants'; // Import constants
import { dist, clamp, snapToCardinal, dynamicDeadzone } from '../utils/math'; // Import helpers

/**
 * Hook to manage virtual joystick state and calculate direction vector.
 * @param {React.RefObject<object>} worldRef - Ref to the game world to get player speed for dynamic deadzone.
 * @returns {{ joystickState: { active: boolean, cx: number, cy: number, dx: number, dy: number }, vec: { x: number, y: number } | null }}
 */
export function useJoystick(worldRef) { // Accept worldRef
  const [joystickState, setJoystick] = useState({ active: false, cx: 0, cy: 0, dx: 0, dy: 0 });
  const [vec, setVec] = useState(null); // Store the calculated direction vector
  const lastTouchTimeRef = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return; // Only handle single touch
    e.preventDefault();
    const touch = e.touches[0];
    setJoystick(prev => ({ ...prev, active: true, cx: touch.clientX, cy: touch.clientY, dx: 0, dy: 0 }));
    setVec(null); // Reset vector on new touch
    lastTouchTimeRef.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!joystickState.active || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    let dx = touch.clientX - joystickState.cx;
    let dy = touch.clientY - joystickState.cy;
    const len = Math.hypot(dx, dy);

    // Clamp knob position to joystick ring
    if (len > JOY_MAX_R) {
      dx = (dx / len) * JOY_MAX_R;
      dy = (dy / len) * JOY_MAX_R;
    }

    setJoystick(prev => ({ ...prev, dx, dy }));

    // Calculate direction vector if outside deadzone
    const deadzone = JOY_DEADZONE; // Use fixed tight deadzone

    if (len > deadzone) {
      const snapped = snapToCardinal(dx, dy);
      setVec(snapped); // Update the vector state
      lastTouchTimeRef.current = Date.now();
    } else {
      setVec(null); // Inside deadzone, no direction
    }
  }, [joystickState.active, joystickState.cx, joystickState.cy]); // Include dependencies

  const handleTouchEnd = useCallback((e) => {
    if (!joystickState.active) return;
    // Don't prevent default for touchend/cancel
    setJoystick(prev => ({ ...prev, active: false, dx: 0, dy: 0 }));
    // Keep the last valid vector for a short time or until next move?
    // setVec(null); // Option 1: Reset vector immediately
    // Option 2: Keep last vector (current behavior)
  }, [joystickState.active]);

  useEffect(() => {
    // Use passive: false ONLY if preventDefault is called inside the handler
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]); // Add handlers to dependencies

  // Return the state and the calculated vector
  return { joystickState, vec };
}
