// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import { useEffect, useState, useRef, useCallback } from 'react';
import { JOY_MAX_R, JOY_DEADZONE, SAFE_PX } from '../constants'; // Import constants
import { snapToCardinal } from '../utils/math';

/**
 * Hook to manage virtual joystick state and calculate direction vector.
 * @returns {{ joystickState: { active: boolean, cx: number, cy: number, dx: number, dy: number }, vec: { x: number, y: number } | null }}
 */
export function useJoystick() {
  const [joystickState, setJoystick] = useState({ active: false, cx: 0, cy: 0, dx: 0, dy: 0 });
  const [vec, setVec] = useState(null); // Store the calculated direction vector
  const lastTouchTimeRef = useRef(0);

  const handleTouchStart = useCallback((e) => {
    // Only handle single touch
    if (e.touches.length !== 1) return;

    // Check if the touch target is interactive (button or tappable overlay)
    let targetElement = e.target;
    let isInteractive = false;
    while (targetElement && targetElement !== document.body) {
      if (targetElement.tagName === 'BUTTON' || targetElement.classList.contains('tappable-overlay')) {
        isInteractive = true;
        break;
      }
      targetElement = targetElement.parentElement;
    }

    // Only prevent default if not interacting with a specific UI element
    if (!isInteractive) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    // Only activate joystick if the touch wasn't on an interactive element
    if (!isInteractive) {
        setJoystick(prev => ({ ...prev, active: true, cx: touch.clientX, cy: touch.clientY, dx: 0, dy: 0 }));
        setVec(null); // Reset vector on new touch
        lastTouchTimeRef.current = Date.now();
    }
    // else: If touch started on a button/overlay, let the click event handle it.

  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!joystickState.active || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    // Use temporary variables for raw displacement
    const raw_dx = touch.clientX - joystickState.cx;
    const raw_dy = touch.clientY - joystickState.cy;
    const len = Math.hypot(raw_dx, raw_dy);

    // Calculate direction vector FIRST using raw values if outside deadzone
    const deadzone = JOY_DEADZONE;
    if (len > deadzone) {
      const nx = raw_dx / len; // Normalize using raw displacement
      const ny = raw_dy / len;
      setVec({ x: nx, y: ny }); // Set the CORRECTLY normalized vector
      lastTouchTimeRef.current = Date.now();
    } else {
      setVec(null); // Inside deadzone, no direction
    }

    // NOW, determine the clamped values for the visual knob position
    let clamped_dx = raw_dx;
    let clamped_dy = raw_dy;
    if (len > JOY_MAX_R) {
      // Clamp visual position based on original raw direction
      clamped_dx = (raw_dx / len) * JOY_MAX_R;
      clamped_dy = (raw_dy / len) * JOY_MAX_R;
    }
    // Update the visual state with the (potentially) clamped values
    setJoystick(prev => ({ ...prev, dx: clamped_dx, dy: clamped_dy }));

  }, [joystickState.active, joystickState.cx, joystickState.cy]);

  const handleTouchEnd = useCallback(() => {
    if (!joystickState.active) return;
    // Don't prevent default for touchend/cancel
    setJoystick(prev => ({ ...prev, active: false, dx: 0, dy: 0 }));
    setVec(null); // Explicitly set vec to null on release
    // Keep the last valid vector for a short time or until next move?
    // setVec(null); // Option 1: Reset vector immediately
    // Option 2: Keep last vector (current behavior)
  }, [joystickState.active]);

  useEffect(() => {
    // Use passive: false ONLY if preventDefault is called inside the handler
    // We conditionally call preventDefault in handleTouchStart now.
    // passive: false is still needed as preventDefault *might* be called.
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
