/*
 * src/NeonSerpentGame.jsx
 * Manages game state, input, and the fixed-timestep logic loop.
 * Renders GameCanvas and UI overlays.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas'; // PixiJS version
import MenuOverlay from './components/MenuOverlay';
import ControlsOverlay from './components/ControlsOverlay';
import { createWorld, updateWorld } from './world'; // World simulation logic
import { useKeyboard, useJoystick } from './input'; // Input hooks
import { TURN_COOLDOWN_MS, JOY_TURN_COOLDOWN_MS, WORLD_SIZE, TICK_MS, BG_SRC } from './constants'; // Game constants
import { willHitTail, playerSkip } from './utils/math'; // Utility functions

// Controls info for the overlay
const controlsInfo = [
    { label: 'Move', icons: ['/w.png', '/a.png', '/s.png', '/d.png'], fallback: 'WASD' },
    { label: 'Move', icons: ['/up.png', '/left.png', '/down.png', '/right.png'], fallback: 'Arrow Keys' },
    { label: 'Select/Pause/Resume', icons: ['/space.png'], fallback: 'Space/Enter' },
    { label: 'Back/Pause', icons: [], fallback: 'Esc' },
    { label: 'Touch Move', icons: [], fallback: 'Virtual Joystick (Tap & Drag)' },
    { label: 'Touch Action', icons: [], fallback: 'Tap Overlay (Resume/Menu)' },
];

export default function NeonSerpentGame() {
    // --- State ---
    const [gameState, setGameState] = useState('menu'); // menu | playing | paused | gameover
    const [menuIndex, setMenuIndex] = useState(0);
    const [isGameInProgress, setIsGameInProgress] = useState(false); // Track if game is resumable
    const [showControls, setShowControls] = useState(false);
    const [isCanvasReady, setIsCanvasReady] = useState(false); // New state

    // --- Refs ---
    const worldRef = useRef(null); // Holds the game world state
    const lastTurnRef = useRef(0); // Tracks last player turn time
    const gameLogicIntervalRef = useRef(null); // Ref for the fixed timestep interval
    const canSelectMenu = useRef(false); // Prevent immediate menu selection on load
    const videoRef = useRef(null); // Ref for the background video element

    // --- Input Hooks ---
    const { dir: keyDir } = useKeyboard();
    const { joystickState, vec: joyVec } = useJoystick();

    // --- Functions ---

    // Stop the fixed timestep game logic loop
    const stopGameLogicLoop = useCallback(() => {
        if (gameLogicIntervalRef.current) {
            clearInterval(gameLogicIntervalRef.current);
            gameLogicIntervalRef.current = null;
            console.log("Game logic loop stopped.");
        }
    }, []);

    // Start/Restart Game
    const startGame = useCallback(() => {
        console.log("Starting/Restarting game...");
        stopGameLogicLoop(); // Ensure any previous loop is stopped
        setIsCanvasReady(false); // Reset canvas ready state
        worldRef.current = createWorld(); // Create fresh world state
        console.log("World created:", {
            hasPlayer: !!worldRef.current?.player,
            snakeCount: worldRef.current?.snakes?.length,
            orbCount: worldRef.current?.orbs?.length,
            camPosition: worldRef.current?.cam
        });
        lastTurnRef.current = 0;
        setShowControls(false);
        setIsGameInProgress(true);
        setGameState('playing');
        // Ensure video plays if paused
        if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(err => console.warn("Video autoplay failed:", err));
        }
    }, [stopGameLogicLoop]);

    // Callback for GameCanvas
    const handleCanvasReady = useCallback(() => {
        console.log("NeonSerpentGame received canvas ready signal.");
        setIsCanvasReady(true);
    }, []);

    // --- Effects ---

    // Prevent immediate menu selection on load
    useEffect(() => {
        const timer = setTimeout(() => { canSelectMenu.current = true; }, 200); // Slightly longer delay
        return () => clearTimeout(timer);
    }, []);

    // Game Logic Loop (Fixed Timestep)
    useEffect(() => {
        if (gameState === 'playing' && isCanvasReady) {
            console.log("Starting game logic loop (Canvas is ready)...");
            let lastLogicTimestamp = performance.now();

            // Ensure video is playing
            if (videoRef.current && videoRef.current.paused) {
                 videoRef.current.play().catch(err => console.warn("Video play failed on resume:", err));
            }

            gameLogicIntervalRef.current = setInterval(() => {
                const now = performance.now();
                const dt = now - lastLogicTimestamp; // Calculate delta time
                lastLogicTimestamp = now;

                if (worldRef.current && worldRef.current.player && !worldRef.current.player.dead) {
                    // --- Input Processing (Update player velocity directly) ---
                    const inputTimestamp = Date.now(); // Use Date.now for cooldowns
                    const turnCooldown = joystickState.active ? JOY_TURN_COOLDOWN_MS : TURN_COOLDOWN_MS;
                    let desiredDir = null;
                    const player = worldRef.current.player;

                    // Determine desired direction from input sources
                    if (joystickState.active && joyVec) {
                        desiredDir = joyVec; // Use normalized vector from joystick hook
                    } else if (!joystickState.active && (keyDir.x !== 0 || keyDir.y !== 0)) {
                        desiredDir = keyDir; // Use direction vector from keyboard hook
                    }

                    // Apply turn if valid
                    if (desiredDir && inputTimestamp - lastTurnRef.current > turnCooldown) {
                        const head = player.segs[0];
                        // Predict next position based on *desired* direction
                        const nextX = (head.x + desiredDir.x * player.speed + WORLD_SIZE) % WORLD_SIZE;
                        const nextY = (head.y + desiredDir.y * player.speed + WORLD_SIZE) % WORLD_SIZE;
                        const skipCount = playerSkip(player);
                        const wouldBite = willHitTail(nextX, nextY, player.segs, skipCount);

                        // Prevent exact 180 turns using dot product with current velocity
                        const isReversing = (desiredDir.x * player.vx + desiredDir.y * player.vy) < -0.9;

                        if (!wouldBite && !isReversing) {
                            // Update player's velocity vector
                            player.vx = desiredDir.x;
                            player.vy = desiredDir.y;
                            // player.dir.x = desiredDir.x; // Sync dir object if needed elsewhere
                            // player.dir.y = desiredDir.y;
                            lastTurnRef.current = inputTimestamp; // Update last turn time
                        }
                    }
                    // --- End Input Processing ---

                    // --- Update World Simulation ---
                    // Pass delta time (dt) for frame-independent physics/updates if needed
                    worldRef.current = updateWorld(worldRef.current, dt);

                    // Game over state check is handled by the Pixi render loop in GameCanvas
                    // based on worldRef.current.player.dead flag

                } else if (worldRef.current && worldRef.current.player && worldRef.current.player.dead) {
                     // Player is dead, stop the logic loop (render loop handles state change)
                     console.log("Player dead, stopping logic loop from within interval.");
                     stopGameLogicLoop();
                }
            }, TICK_MS); // Run at desired fixed interval (e.g., ~16.67ms for 60Hz)

            // Cleanup function for when gameState changes *away* from 'playing' or component unmounts
            return () => {
                 console.log("Cleaning up game logic loop effect (gameState changed or unmount).");
                 stopGameLogicLoop();
                 // Pause video when not playing
                 if (videoRef.current) {
                     videoRef.current.pause();
                 }
            };
        } else {
            // Ensure loop is stopped and video paused if not in 'playing' state
            stopGameLogicLoop();
            if (videoRef.current) {
                 videoRef.current.pause();
            }
        }
        // No explicit return needed here, the return inside the 'if (gameState === 'playing')' handles cleanup

    }, [gameState, isCanvasReady, stopGameLogicLoop, keyDir, joyVec, joystickState.active]);


    // Menu/Controls Handlers
    const handleMenuSelect = useCallback((idx, currentOptions) => {
        if (!canSelectMenu.current) return; // Prevent selection too early
        setMenuIndex(idx);
        const action = currentOptions[idx];
        console.log(`Menu action selected: ${action}`);
        if (action === 'Resume') {
            setGameState('playing');
        } else if (action === 'Start Game' || action === 'Restart Game') {
            startGame();
        } else if (action === 'Controls') {
            setShowControls(true);
        }
    }, [startGame]); // Added startGame dependency

    const handleControlsBack = useCallback(() => {
        setShowControls(false);
    }, []);


    // Global Key Handlers & Menu Navigation
    useEffect(() => {
        const currentMenuOptions = isGameInProgress
            ? ['Resume', 'Controls', 'Restart Game']
            : ['Start Game', 'Controls']; // Don't offer restart from initial menu

        const handleKeyDown = (e) => {
            // Stop propagation only if we handle the key to prevent default actions like scrolling
             let handled = false;

            if (gameState === 'menu' && !showControls) {
                if (e.key === 'ArrowUp' || e.key === 'w') {
                    setMenuIndex(prev => (prev - 1 + currentMenuOptions.length) % currentMenuOptions.length);
                    handled = true;
                } else if (e.key === 'ArrowDown' || e.key === 's') {
                    setMenuIndex(prev => (prev + 1) % currentMenuOptions.length);
                    handled = true;
                } else if (e.key === 'Enter' || e.key === ' ') {
                    if (canSelectMenu.current) {
                        handleMenuSelect(menuIndex, currentMenuOptions);
                    }
                    handled = true;
                } else if (e.key === 'Escape' && isGameInProgress) {
                    // Resume game if Esc pressed in menu and game is in progress
                    setGameState('playing');
                    handled = true;
                }
            } else if (gameState === 'playing') {
                if (e.key === 'Escape') {
                    setGameState('menu'); // Pause and show menu
                    handled = true;
                } else if (e.key === ' ') {
                    // Use space to toggle simple pause state
                    setGameState('paused');
                    handled = true;
                }
            } else if (gameState === 'paused') {
                if (e.key === 'Escape' || e.key === ' ') {
                    setGameState('playing'); // Resume from simple pause
                    handled = true;
                }
            } else if (gameState === 'gameover' && (e.key === 'Enter' || e.key === ' ')) {
                setIsGameInProgress(false); // Reset progress flag
                setGameState('menu');
                setMenuIndex(0); // Reset menu to top
                handled = true;
            } else if (showControls && e.key === 'Escape') {
                handleControlsBack();
                handled = true;
            }

            if (handled) {
                 e.preventDefault(); // Prevent default browser action only if key was handled
                 e.stopPropagation(); // Prevent other listeners if handled
            }
        };

        // Use capture phase to potentially catch events earlier
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);

    }, [gameState, menuIndex, showControls, handleMenuSelect, handleControlsBack, isGameInProgress]); // Dependencies


    // Determine current menu options for rendering based on game progress
    const currentMenuOptions = isGameInProgress
        ? ['Resume', 'Controls', 'Restart Game']
        : ['Start Game', 'Controls'];


    // --- Render ---
    return (
        <div className="game-container" style={{ background: '#000' }}> {/* Ensure fallback background */}
            {/* Background Video Element */}
             <video
                ref={videoRef} // Add ref
                // Use constant for source
                // Provide multiple sources for better compatibility
                // Order matters: browser picks the first it supports
                loop
                muted // Required for autoplay in many browsers
                playsInline // Important for mobile
                autoPlay // Attempt autoplay (might be blocked by browser)
                style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    objectFit: 'cover',
                    zIndex: 0, // Behind canvas and overlays
                    pointerEvents: 'none'
                 }}
              >
                 {/* Example using AV1 and H.264 fallback */}
                 {/* <source src="/cave_city.mp4" type="video/mp4; codecs=av01.0.05M.08" /> */}
                 <source src={BG_SRC} type="video/mp4" /> {/* Use H.264 as primary/fallback */}
                 Your browser does not support the video tag.
             </video>

            {/* Render PixiJS Canvas (handles its own drawing loop) */}
            <GameCanvas
                gameState={gameState}
                worldRef={worldRef}
                setGameState={setGameState} // Pass setter for game over detection
                onReady={handleCanvasReady} // Pass the callback here
            />

            {/* --- UI Overlays --- */}
            {gameState === 'menu' && !showControls && (
                <MenuOverlay
                    menuIndex={menuIndex}
                    setMenuIndex={setMenuIndex}
                    onSelect={(idx) => handleMenuSelect(idx, currentMenuOptions)}
                    menuOptions={currentMenuOptions}
                />
            )}
            {showControls && (
                <ControlsOverlay onBack={handleControlsBack} controlsInfo={controlsInfo} />
            )}
            {gameState === 'paused' && (
                <div
                    className="overlay simple-overlay tappable-overlay"
                    onClick={() => setGameState('playing')} // Tap/Click to resume
                    style={{ zIndex: 10 }} // Ensure above canvas
                >
                    <h2>Paused</h2>
                    <p style={{ fontSize: '0.6em' }}>Tap/Click or press Space/Esc to Resume</p>
                </div>
            )}
            {gameState === 'gameover' && (
                <div
                    className="overlay simple-overlay tappable-overlay"
                    onClick={() => { // Tap/Click to return to menu
                        setIsGameInProgress(false);
                        setGameState('menu');
                        setMenuIndex(0);
                    }}
                    style={{ zIndex: 10 }} // Ensure above canvas
                >
                    <h2>Game Over</h2>
                    <p>Score: {worldRef.current?.player?.score ?? 0}</p>
                    <p style={{ fontSize: '0.6em' }}>Tap/Click or press Enter/Space to Return to Menu</p>
                </div>
            )}

            {/* --- Joystick UI (Rendered on top) --- */}
            {/* Only show joystick when playing and it's active */}
            {gameState === 'playing' && joystickState.active && (
                <div className="joystick-ui" style={{ zIndex: 20 }}> {/* Ensure joystick UI is on top */}
                    <div className="joystick-base" style={{ left: `${joystickState.cx}px`, top: `${joystickState.cy}px` }}></div>
                    <div className="joystick-knob" style={{ left: `${joystickState.cx + joystickState.dx}px`, top: `${joystickState.cy + joystickState.dy}px` }}></div>
                </div>
            )}
        </div>
    );
}
