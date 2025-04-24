/*
 * src/hooks/useResizeCanvas.js
 * Handles initial sizing and subsequent resizing for the PixiJS app.
 */
import { useEffect } from 'react';
import * as PIXI from 'pixi.js';

/**
 * Hook to handle PixiJS canvas resizing.
 * @param {React.RefObject<PIXI.Application | null>} pixiAppRef - Ref pointing to the PixiJS Application instance.
 */
export function useResizeCanvas(pixiAppRef) {
  useEffect(() => {
    const handleResize = () => {
      const app = pixiAppRef.current;
      // Ensure app and renderer are valid before resizing
      if (app && app.renderer && !app.renderer.destroyed) {
         try {
             // Use window dimensions for the resize target
             const newWidth = window.innerWidth;
             const newHeight = window.innerHeight;
             // Check if resize is actually needed (optional optimization)
             if (app.renderer.width !== newWidth || app.renderer.height !== newHeight) {
                  app.renderer.resize(newWidth, newHeight);
                  // console.log(`Pixi renderer resized to: ${newWidth}x${newHeight}`);
             }
         } catch (err) {
              console.error("Error during Pixi renderer resize:", err);
         }
      } else {
           // console.warn("useResizeCanvas: App or renderer not ready for resize.");
      }
    };

    // Call resize initially to set the correct size *after* component mounts
    // Use a small timeout to ensure Pixi app might be ready
    const initialResizeTimeout = setTimeout(handleResize, 0); // Run after current execution stack

    // Add event listener for subsequent resizes
    window.addEventListener('resize', handleResize);

    // Cleanup: remove listener and clear timeout
    return () => {
      clearTimeout(initialResizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [pixiAppRef]); // Depend only on the app ref change
}
