// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React, { useRef, useEffect } from 'react';
import { useResizeCanvas } from '../hooks/useResizeCanvas';
import { drawWorld } from '../render';
import { useKeyboard, useJoystick } from '../input';
import { createWorld, updateWorld } from '../world'; // Assuming world/camera logic is handled elsewhere or needs adding

export default function GameCanvas({ gameState, setGameState, worldRef }) { // Added worldRef prop
  const canvasRef = useRef(null);
  // const worldRef = useRef(null); // Removed, using prop instead
  const lastTurnRef = useRef(0);
  const lastTsRef = useRef(0);
  const bgVidRef = useRef(null); // Ref for the background video

  useResizeCanvas(canvasRef);

  // Autoplay the background video
  useEffect(() => {
    bgVidRef.current?.play().catch(error => {
      // Autoplay was prevented, handle error or inform user if necessary
      console.error("Video autoplay prevented:", error);
    });
  }, []); // Run once on mount

  // Game loop logic (assuming drawWorld handles drawing, including background)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderLoop = (timestamp) => {
      if (!canvas) return;
      // Clear canvas or handle background drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Example clear

      // Draw the video background with parallax
      if (bgVidRef.current?.readyState >= 2) { // HAVE_CURRENT_DATA or more
        const w = bgVidRef.current.videoWidth;
        const h = bgVidRef.current.videoHeight; // Assuming video height matches canvas or scales appropriately
        const camera = worldRef.current?.camera || { x: 0, y: 0 }; // Get camera from worldRef, provide default
        const parallaxX = camera.x * 0.3;

        // Scale video to canvas height if necessary, maintain aspect ratio
        const scale = canvas.height / h;
        const scaledWidth = w * scale;

        // Calculate the effective width for tiling, considering scaling
        const effectiveWidth = scaledWidth;

        // Draw first copy, adjusted for parallax and scaled width
        let drawX = -parallaxX % effectiveWidth;
        ctx.drawImage(bgVidRef.current, drawX, 0, effectiveWidth, canvas.height);

        // Draw second copy to cover the seam, placed right after the first copy
        ctx.drawImage(bgVidRef.current, drawX + effectiveWidth, 0, effectiveWidth, canvas.height);

        // Optional: Draw a third copy if the parallax shift could reveal the edge
        if (drawX + 2 * effectiveWidth < canvas.width) {
             ctx.drawImage(bgVidRef.current, drawX + 2 * effectiveWidth, 0, effectiveWidth, canvas.height);
        }

      } else {
        // Optional: Draw a placeholder color/image while video loads
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }


      // Draw the rest of the world state from worldRef
      if (worldRef.current && gameState === 'playing') {
        // Assuming drawWorld takes context, world state, and canvas dimensions
        drawWorld(ctx, worldRef.current, canvas.width, canvas.height);
      } else if (gameState === 'menu') {
         // Optionally draw something specific for the menu state if needed
         // e.g., a static frame of the video or a different background
      }


      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop(0); // Start the loop

    return () => {
      cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    };
  }, [gameState, worldRef]); // Rerun effect if gameState or worldRef changes


  // TODO: Initialize worldRef.current = createWorld(); // This should likely happen in the parent component (NeonSerpentGame)
  // TODO: Setup game loop: use keyboard and joystick input, call updateWorld, then drawWorld // Input/update logic likely in parent or separate effect

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <video
        ref={bgVidRef}
        src="/cave-city.mp4"    /* lives in /public, so root path works */
        loop
        muted // Muted is often required for autoplay
        playsInline // Important for mobile browsers
        style={{ display: 'none' }} // Hide the video element itself
        // preload="auto" // Helps ensure video is ready sooner
      />
    </>
  );
}
