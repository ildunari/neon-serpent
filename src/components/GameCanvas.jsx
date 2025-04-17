// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React, { useRef, useEffect } from 'react';
import { useResizeCanvas } from '../hooks/useResizeCanvas';
import { drawWorld } from '../render';
// Import BG_SCALE, BG_PARALLAX, and WORLD_SIZE from constants
import { BG_SCALE, BG_PARALLAX, WORLD_SIZE } from '../constants';

export default function GameCanvas({ gameState, setGameState, worldRef }) {
  const canvasRef = useRef(null);
  const bgVidRef = useRef(null);

  useResizeCanvas(canvasRef);

  // Control background video playback based on gameState
  useEffect(() => {
    const video = bgVidRef.current;
    if (!video) return;

    if (gameState === 'playing') {
      // Attempt to play only when game is active
      video.play().catch(error => {
        // Log error if playing fails (e.g., browser restrictions still apply)
        // The error might still appear on the *first* play attempt if interaction
        // hasn't been registered yet, but subsequent plays should work.
        console.error("Video play attempt failed:", error);
      });
    } else {
      // Pause the video if not in 'playing' state
      video.pause();
    }
  }, [gameState]); // Depend on gameState

  // Game loop logic (drawing only)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderLoop = (timestamp) => {
      // Ensure canvas exists
      if (!canvas) {
        animationFrameId = requestAnimationFrame(renderLoop); // Keep trying
        return;
      }

      // Calculate view dimensions in CSS pixels using clientWidth/clientHeight
      const dpr = window.devicePixelRatio || 1;
      const viewW = canvas.clientWidth;   // CSS width
      const viewH = canvas.clientHeight;  // CSS height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Use raw canvas buffer dimensions

      // --- START BACKGROUND DRAWING LOGIC (Always runs) ---
      if (bgVidRef.current?.readyState >= 2) { // HAVE_CURRENT_DATA or more
        const vid = bgVidRef.current;
        // Use default camera position centered in the world if worldRef doesn't exist yet
        const cam = worldRef.current?.cam || { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };

        ctx.save();
        ctx.filter = 'blur(2px) brightness(0.7) saturate(0.9)';

        // --- Calculate Zoomed & Parallaxed Source Rectangle --- 
        // How much of the video *source* corresponds to one pixel on the canvas
        const invScale = 1.0 / BG_SCALE; 
        // Dimensions of the visible area in *video source* pixels
        const sourceViewW = viewW * invScale;
        const sourceViewH = viewH * invScale;
        
        // Top-left corner of the visible area in *video source* pixels, considering parallax
        // Center the view first, then apply parallax relative to the center of the world
        const parallaxX = (cam.x - WORLD_SIZE / 2) * BG_PARALLAX;
        const parallaxY = (cam.y - WORLD_SIZE / 2) * BG_PARALLAX;
        
        // Calculate source x/y (sx, sy) based on camera, parallax, and ensuring it's centered
        let sx = (cam.x + parallaxX - sourceViewW / 2);
        let sy = (cam.y + parallaxY - sourceViewH / 2);
        
        // Optional: Clamp sx/sy to prevent drawing outside the video bounds if needed
        // sx = Math.max(0, Math.min(vid.videoWidth - sourceViewW, sx));
        // sy = Math.max(0, Math.min(vid.videoHeight - sourceViewH, sy));
        // Or allow wrapping/tiling at edges if preferred (more complex)
        
        // --- Draw the calculated source portion to fill the canvas --- 
        ctx.drawImage(
          vid,
          sx, sy, sourceViewW, sourceViewH, // Source rectangle (part of the video)
          0, 0, viewW, viewH               // Destination rectangle (entire canvas view)
        );

        ctx.restore();
      } else {
        // Fallback background (if video not ready)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the raw canvas buffer
      }
      // --- END BACKGROUND DRAWING LOGIC ---

      // Draw the game world entities only when playing and world exists
      if (gameState === 'playing' && worldRef.current) {
        // Pass CSS pixel dimensions to drawWorld
        drawWorld(ctx, worldRef.current, viewW, viewH);
      }
      // Potentially draw other state-specific things on canvas if needed (e.g., simple "PAUSED" text)
      // else if (gameState === 'paused') { ... }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop(0); // Start the loop

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, worldRef]); // Dependencies remain the same

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <video
        ref={bgVidRef}
        src="/cave_city.mp4"
        loop
        muted
        playsInline
        style={{ display: 'none', pointerEvents: 'none' }}
        preload="auto"
      />
    </>
  );
}
