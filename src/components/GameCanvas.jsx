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

  // Set random start time for video once metadata is loaded
  useEffect(() => {
    const video = bgVidRef.current;
    if (!video) return;

    const handleMetadata = () => {
      if (video.duration) {
        video.currentTime = Math.random() * video.duration;
        console.log(`Set video start time to: ${video.currentTime.toFixed(2)}s`);
      }
    };

    // If metadata is already loaded, set time immediately
    if (video.readyState >= 1) { // HAVE_METADATA
      handleMetadata();
    } else {
      // Otherwise, wait for the event
      video.addEventListener('loadedmetadata', handleMetadata);
    }

    // Cleanup function
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, []); // Run only once on mount

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
        // Use player spawn position (world center) if worldRef doesn't exist yet
        // This prevents camera jump when game starts.
        const initialCamPos = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
        const cam = worldRef.current?.cam || initialCamPos;

        ctx.save();
        ctx.filter = 'blur(2px) brightness(0.7) saturate(0.9)';

        // --- Calculate Zoomed & Parallaxed Source Rectangle --- 
        // How much of the video *source* corresponds to one pixel on the canvas
        const invScale = 1.0 / BG_SCALE; 
        // Dimensions of the visible area in *video source* pixels
        const sourceViewW = viewW * invScale;
        const sourceViewH = viewH * invScale;
        
        // Target camera position (center on player head if possible, else use initial pos)
        const targetCamX = worldRef.current?.player?.segs[0]?.x ?? initialCamPos.x;
        const targetCamY = worldRef.current?.player?.segs[0]?.y ?? initialCamPos.y;

        // Calculate source x/y (sx, sy) based on the *current* camera position,
        // but apply parallax based on the offset from the *target* center.
        // This centers the non-parallax view on the current camera pos.
        let sx = cam.x - sourceViewW / 2;
        let sy = cam.y - sourceViewH / 2;

        // Add parallax based on how far the camera *is* from its target center
        sx += (cam.x - targetCamX) * BG_PARALLAX;
        sy += (cam.y - targetCamY) * BG_PARALLAX;
        
        // Clamp sx/sy to prevent drawing outside the video bounds
        sx = Math.max(0, Math.min(vid.videoWidth - sourceViewW, sx));
        sy = Math.max(0, Math.min(vid.videoHeight - sourceViewH, sy));
        // Or allow wrapping/tiling at edges if preferred (more complex)
        
        // --- Draw the calculated source portion to fill the canvas --- 
        ctx.drawImage(
          vid,
          sx, sy, sourceViewW, sourceViewH, // Source rectangle (part of the video)
          0, 0, canvas.width, canvas.height // Destination rectangle (fill entire canvas buffer)
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
        loop
        muted
        playsInline
        style={{ display: 'none', pointerEvents: 'none' }}
        preload="auto"
      >
        {/* List AV1 first for efficiency */}
        <source src="/cave_city.mp4" type="video/mp4; codecs=av01" /> 
        {/* H.264 fallback (compatibility version) */}
        <source src="/cave_city_h264_compat.mp4" type="video/mp4; codecs=avc1" /> 
        Your browser does not support the video tag. 
      </video>
    </>
  );
}
