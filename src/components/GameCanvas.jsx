// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React, { useRef, useEffect } from 'react';
import { useResizeCanvas } from '../hooks/useResizeCanvas';
import { drawWorld } from '../render';
import { createWorld } from '../world'; // Keep createWorld if needed elsewhere, or remove if only used in parent

export default function GameCanvas({ gameState, setGameState, worldRef }) { // Added worldRef prop
  const canvasRef = useRef(null);
  const lastTurnRef = useRef(0);
  const lastTsRef = useRef(0);
  const bgVidRef = useRef(null); // Ref for the background video

  useResizeCanvas(canvasRef);

  // Autoplay the background video
  useEffect(() => {
    bgVidRef.current?.play().catch(error => {
      console.error("Video autoplay prevented:", error);
    });
  }, []); // Run once on mount

  // Game loop logic (drawing only)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderLoop = (timestamp) => {
      if (!canvas) return;

      // Calculate view dimensions in CSS pixels
      const dpr = canvas.width / window.innerWidth; // Assuming canvas fills window width
      const viewW = canvas.width / dpr;
      const viewH = canvas.height / dpr;

      // Clear canvas or handle background drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Use raw canvas dimensions for clearing

      // Draw the video background with parallax
      if (bgVidRef.current?.readyState >= 2) { // HAVE_CURRENT_DATA or more
        const vid = bgVidRef.current;
        const cam = worldRef.current?.cam || { x: 0, y: 0 }; // Get camera from worldRef

        // Calculate scaling to fit video height to canvas height (CSS pixels)
        const vidAspect = vid.videoWidth / vid.videoHeight;
        const scaledVidHeight = viewH;
        const scaledVidWidth = scaledVidHeight * vidAspect;

        // Parallax factor (adjust as needed)
        const parallaxFactor = 0.3;
        const parallaxOffsetX = (cam.x * parallaxFactor) % scaledVidWidth;

        // Draw tiled video background (using CSS pixel dimensions for drawing)
        // We need to draw enough copies to cover the screen, considering the parallax offset.
        // Start drawing from a negative offset to handle wrapping.
        let currentX = -parallaxOffsetX;
        while (currentX < viewW) {
            ctx.drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight, currentX, 0, scaledVidWidth, scaledVidHeight);
            currentX += scaledVidWidth;
        }

      } else {
        // Fallback background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, viewW, viewH); // Use CSS dimensions for fallback fill
      }

      // Draw the rest of the world state from worldRef
      if (worldRef.current && gameState === 'playing') {
        // Pass CSS pixel dimensions to drawWorld
        drawWorld(ctx, worldRef.current, viewW, viewH);
      } else if (gameState === 'menu') {
         // Optionally draw menu-specific background/elements
      }
      // ... other gameState drawing logic ...

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop(0); // Start the loop

    return () => {
      cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    };
    // Update dependency array: worldRef is needed, gameState determines *what* to draw
  }, [gameState, worldRef]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <video
        ref={bgVidRef}
        src="/cave-city.mp4"    /* lives in /public, so root path works */
        loop
        muted // Muted is often required for autoplay
        playsInline // Important for mobile browsers
        style={{ display: 'none', pointerEvents: 'none' }} // Hide the video element and prevent pointer events
        preload="auto" // Helps ensure video is ready sooner
      />
    </>
  );
}
