// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useResizeCanvas } from '../hooks/useResizeCanvas';
import { drawWorld } from '../render/drawWorld';
import { updateWorld } from '../world'; // <-- Corrected import path
// Import BG_SCALE, BG_PARALLAX, and WORLD_SIZE from constants
import { BG_SCALE, BG_PARALLAX, WORLD_SIZE } from '../constants';
import { playerSkip } from '../utils/math'; // <-- Import playerSkip
// import vignette from '/vignette_4k.png'; // <-- No longer importing single vignette

export default function GameCanvas({ gameState, worldRef, playerSkipCount, setGameState, setPlayerSkipCount }) {
  const canvasRef = useRef(null);
  const bgVidRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  // --- FPS State & Ref ---
  const [fps, setFps] = useState(0); // Keep state for potential other uses
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const currentFpsRef = useRef(0); // <-- Ref to hold the latest calculated FPS
  const lastLogicTs = useRef(performance.now()); // <-- Ref for logic update timing
  // --- End FPS State & Ref ---

  // --- Effect Toggle State & Refs ---
  const [showTiltShift, setShowTiltShift] = useState(true);
  const [showVignette, setShowVignette] = useState(true);
  const showTiltShiftRef = useRef(showTiltShift);
  const showVignetteRef = useRef(showVignette);

  // --- Vignette Slider State & Image Loading ---
  const [selectedVignetteIndex, setSelectedVignetteIndex] = useState(2); // <-- Default to index 2 (Vignette #3)
  const [currentVignetteImage, setCurrentVignetteImage] = useState(null); // State for potential UI use
  const currentVignetteImageRef = useRef(null); // Ref for direct access in game loop
  const NUM_VIGNETTES = 10;

  useEffect(() => {
    showTiltShiftRef.current = showTiltShift;
  }, [showTiltShift]);

  useEffect(() => {
    showVignetteRef.current = showVignette;
  }, [showVignette]);

  // Load vignette image when index changes
  useEffect(() => {
    const vignetteNumber = selectedVignetteIndex + 1;
    const formattedNumber = String(vignetteNumber).padStart(2, '0');
    const img = new Image();
    img.onload = () => {
      console.log(`Vignette vignette_4k_${formattedNumber}.png loaded.`);
      setCurrentVignetteImage(img); // Update state (optional, but good practice)
      currentVignetteImageRef.current = img; // <-- Update ref for the loop
    };
    img.onerror = () => {
      console.error(`Failed to load vignette vignette_4k_${formattedNumber}.png.`);
      setCurrentVignetteImage(null); // Clear state
      currentVignetteImageRef.current = null; // <-- Clear ref on error
    };
    // Use the correct file naming pattern
    img.src = `/vignettes/vignette_4k_${formattedNumber}.png`;
    // Clear ref immediately? Could prevent drawing stale image if loading is slow.
    // currentVignetteImageRef.current = null;
  }, [selectedVignetteIndex]);
  // --- End Effect Toggle State & Refs ---

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
    const ctx = canvas?.getContext('2d');
    let animationFrameId;

    const gameLoop = (timestamp) => { // timestamp is provided by requestAnimationFrame
      // Calculate FPS
      frameCountRef.current++;
      const now = timestamp; // Use the timestamp from requestAnimationFrame
      const delta = now - lastFpsUpdateRef.current;

      if (delta >= 1000) { // Update FPS calculation every second
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(calculatedFps); // Update state (for potential future use)
        currentFpsRef.current = calculatedFps; // <-- Update the ref immediately
        lastFpsUpdateRef.current = now;
        frameCountRef.current = 0;
      }

      // --- World Update Logic ---
      // Calculate dt for world simulation
      const dt = timestamp - lastLogicTs.current;
      lastLogicTs.current = timestamp;

      // Calculate view dimensions (needed for world update and drawing)
      const rect = canvas.getBoundingClientRect();
      const viewW = rect.width;   // CSS width
      const viewH = rect.height;  // CSS height

      // Update world only if playing and world exists
      if (gameState === 'playing' && worldRef.current) {
        worldRef.current = updateWorld(worldRef.current, dt, viewW, viewH);

        // --- Calculate player skip count (after world update) ---
        if (worldRef.current.player) { // Ensure player exists after update
          const skipCount = playerSkip(worldRef.current.player);
          setPlayerSkipCount(skipCount); // Update state in parent
        } else {
          setPlayerSkipCount(0); // Reset if player somehow doesn't exist
        }
        // --- End Skip Count Calculation ---

        // Check for game over after updating world
        if (worldRef.current.player.dead) {
          console.log("Player died! Setting game state to gameover (from GameCanvas).");
          setGameState('gameover');
          // Don't request the next frame if game is over
          return; 
        }
      }
      // --- End World Update Logic ---

      // --- Drawing Logic (Background & World) ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- START BACKGROUND DRAWING LOGIC (Always runs) ---
      if (bgVidRef.current?.readyState >= 2) {
        const vid = bgVidRef.current;
        // Use player spawn position (world center) if worldRef doesn't exist yet
        // This prevents camera jump when game starts.
        const initialCamPos = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
        const cam = worldRef.current?.cam || initialCamPos;

        ctx.save();
        // ctx.filter = 'blur(2px) brightness(0.7) saturate(0.9)'; // <-- REMOVED Filter line

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

        ctx.restore(); // Restore after drawing the video

        // --- START Tilt-Shift Effect (using source-over overlay) ---
        if (showTiltShiftRef.current) {
          ctx.save();
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.2)'); // Top
          grad.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)'); // Bottom (Still using 0.2, not the test 0.8)
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
        // --- END Tilt-Shift Effect ---

      } else {
        // Fallback background (if video not ready)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the raw canvas buffer
      }
      // --- END BACKGROUND DRAWING LOGIC ---

      // Draw the game world entities (only if world exists)
      if (worldRef.current) {
        // Pass the current FPS value from the ref
        // Draw even if not 'playing' to show final state on game over
        drawWorld(ctx, worldRef.current, playerSkipCount, currentFpsRef.current);

        // Debug: Draw bounding boxes
        // ... existing code ...
      }

      // --- START Vignette Overlay --- // (Now uses slider)
      if (showVignetteRef.current && currentVignetteImageRef.current) {
        ctx.save();
        ctx.globalAlpha = 1.0; // Keep at full strength for now, adjust later if needed
        try {
            // Use the image from the ref
            const imgToDraw = currentVignetteImageRef.current;
            // --- Calculate aspect-ratio-preserving scale & position ---
            const vignetteW = imgToDraw.naturalWidth;
            const vignetteH = imgToDraw.naturalHeight;
            const canvasW = canvas.width;
            const canvasH = canvas.height;

            const scaleW = canvasW / vignetteW;
            const scaleH = canvasH / vignetteH;
            const scale = Math.max(scaleW, scaleH);

            const dw = vignetteW * scale;
            const dh = vignetteH * scale;
            const dx = (canvasW - dw) / 2;
            const dy = (canvasH - dh) / 2;

            ctx.drawImage(imgToDraw, dx, dy, dw, dh);
            // --- End calculation ---
        } catch (e) {
          console.error("Error drawing vignette:", e);
        }
        ctx.restore(); // Restore outside try-catch
      }
      // --- END Vignette Overlay ---

      // Potentially draw other state-specific things on canvas if needed (e.g., simple "PAUSED" text)
      // else if (gameState === 'paused') { ... }
      // --- End Drawing Logic ---

      // Request next frame
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Reset state/refs when effect re-runs or unmounts
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = performance.now();
    currentFpsRef.current = 0; // <-- Reset the ref
    lastLogicTs.current = performance.now(); // <-- Reset logic timer
    setFps(0);

    gameLoop(performance.now()); // Start the loop with initial timestamp

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // Dependencies: Add setGameState, setPlayerSkipCount
  }, [gameState, worldRef, playerSkipCount, setGameState, setPlayerSkipCount]);

  return (
    <>
      {/* UI Container - Commented out to hide controls
      <div style={{ position: 'absolute', top: '60px', left: '10px', zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button
            onClick={() => setShowTiltShift(prev => !prev)}
            style={{ padding: '5px 10px', cursor: 'pointer', background: 'rgba(0,0,0,0.7)', color: 'white', border: '1px solid white' }}
          >
            Tilt-Shift ({showTiltShift ? 'ON' : 'OFF'})
          </button>
          <button
            onClick={() => setShowVignette(prev => !prev)}
            style={{ padding: '5px 10px', cursor: 'pointer', background: 'rgba(0,0,0,0.7)', color: 'white', border: '1px solid white' }}
          >
            Vignette ({showVignette ? 'ON' : 'OFF'})
          </button>
        </div>

        {showVignette && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.7)', padding: '5px', borderRadius: '3px' }}>
            <span style={{ color: 'white', fontSize: '10px', marginBottom: '3px' }}>Vignette #{selectedVignetteIndex + 1}</span>
            <input
              type="range"
              min="0"
              max={NUM_VIGNETTES - 1}
              step="1"
              value={selectedVignetteIndex}
              onChange={(e) => setSelectedVignetteIndex(parseInt(e.target.value, 10))}
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
                width: '20px',
                height: '100px',
                cursor: 'pointer'
              }}
              orient="vertical"
            />
          </div>
        )}
      </div>
      */}

      {/* Canvas and Video */}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <video
        ref={bgVidRef}
        loop
        muted
        playsInline
        style={{ display: 'none', pointerEvents: 'none' }}
        preload="auto"
      >
        {/* AV1 for modern browsers */}
        <source src="/cave_city.mp4" type="video/mp4; codecs=av01" />
        {/* H.264 for wider compatibility (Safari, older browsers) */}
        <source src="/cave_city_h264_compat.mp4" type="video/mp4; codecs=avc1" />
        Your browser does not support the video tag.
      </video>
    </>
  );
}
