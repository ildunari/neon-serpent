// src/components/GameCanvas.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
// import { CanvasRenderer } from '@pixi/canvas-renderer'; // No longer needed explicitly with v8 init
import { useResizeCanvas } from '../hooks/useResizeCanvas';
import { WORLD_SIZE, CAM_SMOOTH } from '../constants';
import { playerSkip, lerp } from '../utils/math';
import Particle from '../entities/Particle';

const ORB_SPRITESHEET_PATH = '/orbs_spritesheet.json';
const MAX_PARTICLES = 1000;

console.log("PIXI.js version:", PIXI.VERSION || "unknown");
console.log("PIXI app available:", !!PIXI.Application);
// console.log("PIXI renderer types:", PIXI.RENDERER_TYPE && Object.keys(PIXI.RENDERER_TYPE)); // RENDERER_TYPE might be internal now

export default function GameCanvas({ gameState, worldRef, setGameState, onReady }) {
    const pixiContainerRef = useRef(null);
    const pixiAppRef = useRef(null);
    const texturesRef = useRef({});
    const gameContainerRef = useRef(null);
    const particleContainerRef = useRef(null);
    const fpsTextRef = useRef(null);
    const pixiSnakesMapRef = useRef(new Map());
    const pixiOrbsMapRef = useRef(new Map());
    const particlePoolRef = useRef([]);
    const activeParticlesRef = useRef(new Set());

    // --- Refs to manage initialization/cleanup in StrictMode ---
    const initStartedRef = useRef(false); // Has initialization *attempt* started?
    const initCompletedRef = useRef(false); // Has initialization *successfully* completed?
    const cleanupRunRef = useRef(false); // Track if cleanup for this instance ran

    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [particleManagerAttached, setParticleManagerAttached] = useState(false);
    const [initError, setInitError] = useState(null);
    const onReadyCalledRef = useRef(false);

    // --- Safe Destroy App Helper (Modified slightly) ---
    const safeDestroyApp = useCallback((appInstance, reason = "unknown") => {
        // Check if app instance exists and is not already destroyed internally
        if (!appInstance || appInstance.destroyed) {
            console.log(`safeDestroyApp (${reason}): Skipping destroy. No valid instance or already destroyed.`);
            return;
        }

        console.log(`Attempting safe destroy of PixiJS application (Reason: ${reason})...`);

        try {
            // 1. Stop Ticker & Remove Listeners
            if (appInstance.ticker && !appInstance.ticker.destroyed) {
                try {
                    appInstance.ticker.stop();
                    appInstance.ticker.remove(pixiRenderLoop); // Ensure loop listener is removed
                    appInstance.ticker.destroy();
                    console.log("Ticker stopped, listener removed, and destroyed.");
                } catch (e) {
                    console.warn("Error cleaning up ticker:", e);
                }
            } else {
                console.log("Ticker already destroyed or missing.");
            }

             // 2. Destroy Stage Children (Manually, before destroying stage itself)
             if (appInstance.stage && !appInstance.stage.destroyed) {
                 try {
                     // Destroy children without destroying the stage container itself yet
                     appInstance.stage.destroy({ children: true, texture: false, baseTexture: false });
                     console.log("Stage children destroyed.");
                 } catch (e) {
                     console.warn("Error destroying stage children:", e);
                 }
             } else {
                  console.log("Stage already destroyed or missing.");
             }

             // 3. Destroy Renderer
             if (appInstance.renderer && !appInstance.renderer.destroyed) {
                 try {
                     appInstance.renderer.destroy();
                     console.log("Renderer destroyed.");
                 } catch (e) {
                     console.warn("Error destroying renderer:", e);
                 }
             } else {
                  console.log("Renderer already destroyed or missing.");
             }

            // 4. Call app.destroy (remove view, but don't re-destroy children/textures)
            // This should handle the canvas removal and final cleanup
            try {
                appInstance.destroy(true, { children: false, texture: false, baseTexture: false });
                console.log("PixiJS app.destroy() called successfully.");
            } catch (e) {
                console.warn("Error in app.destroy() (might be harmless if components already destroyed):", e);
                if (e instanceof TypeError && e.message.includes('_head.next')) {
                    console.warn(">>> Caught Ticker internal list error during app.destroy - likely harmless after manual cleanup.");
                }
            }

        } catch (e) {
            console.error("Error during safe app destruction sequence:", e);
        } finally {
            console.log("Safe destroy sequence finished.");
            // Note: We don't set a global 'destroyed' flag here,
            // rely on appInstance.destroyed internal flag.
        }
    }, []); // Removed pixiRenderLoop from deps, it's defined later

    // --- Particle Pool Management (Unchanged) ---
    const getParticleFromPool = useCallback((x, y) => {
        let particleWrapper = particlePoolRef.current.pop();
        let particleEntity;
        let pixiObject;
        if (particleWrapper) {
            particleEntity = particleWrapper.entity;
            pixiObject = particleWrapper.pixiObject;
            particleEntity.reset(x, y);
            if (pixiObject && !pixiObject.destroyed) {
                 pixiObject.position.set(x, y);
                 pixiObject.alpha = 1.0;
                 pixiObject.visible = true;
                 if (particleContainerRef.current && !particleContainerRef.current.destroyed && !pixiObject.parent) {
                     particleContainerRef.current.addChild(pixiObject); // Use addChild for Graphics
                 }
            } else {
                 console.warn("Reused particle wrapper missing or has destroyed pixiObject, creating new.");
                 particleWrapper = null;
            }
        }
        if (!particleWrapper) {
            particleEntity = new Particle(x, y);
            pixiObject = new PIXI.Graphics();
            // Use fill method with object config
            pixiObject.fill({color: 0xffffff});
            pixiObject.rect(0, 0, 2, 2); // Define shape AFTER fill
            pixiObject.fill(); // Apply fill
            pixiObject.position.set(x, y);
            pixiObject.visible = true;
            pixiObject.eventMode = 'none';
            particleEntity.pixiObject = pixiObject;
            particleWrapper = { entity: particleEntity, pixiObject: pixiObject };
            if (particleContainerRef.current && !particleContainerRef.current.destroyed) {
                // ParticleContainer expects Sprites usually, but Graphics *can* work
                // though less performant. If using ParticleContainer, consider switching
                // particles to use Sprites with a shared white pixel texture.
                // For now, stick with addChild for Graphics.
                particleContainerRef.current.addChild(pixiObject);
            } else {
                console.error("Particle container not ready or destroyed when creating new particle PIXI object");
                 if (pixiObject && !pixiObject.destroyed) pixiObject.destroy();
                 particleEntity.pixiObject = null;
                 return null;
            }
        }
        activeParticlesRef.current.add(particleEntity);
        return particleEntity;
    }, []);

    const releaseParticleToPool = useCallback((particleEntity) => {
        if (!particleEntity || !activeParticlesRef.current.has(particleEntity)) {
            return;
        }
        activeParticlesRef.current.delete(particleEntity);
        const pixiObject = particleEntity.pixiObject;
        if (pixiObject && !pixiObject.destroyed) {
            pixiObject.visible = false;
            if (pixiObject.parent) {
                 pixiObject.parent.removeChild(pixiObject);
            }
            if (particlePoolRef.current.length < MAX_PARTICLES) {
                 particlePoolRef.current.push({ entity: particleEntity, pixiObject });
            } else {
                pixiObject.destroy({children: true});
                particleEntity.pixiObject = null;
            }
        } else if (pixiObject && pixiObject.destroyed) {
             particleEntity.pixiObject = null;
        }
    }, []);

    // --- Initialize PixiJS Application ---
    useEffect(() => {
        // StrictMode Guard: Only proceed if initialization hasn't started or completed
        if (initStartedRef.current || initCompletedRef.current) {
            console.log(`Pixi Init Effect: Skipping, initStarted=${initStartedRef.current}, initCompleted=${initCompletedRef.current}`);
            return;
        }
        initStartedRef.current = true; // Mark that this attempt has started
        cleanupRunRef.current = false; // Reset cleanup flag for this instance
        console.log("Pixi Init Effect: Starting initialization attempt...");

        let app = null; // Keep app instance local to this effect scope

        const initPixi = async () => {
            console.log('Attempting PixiJS Initialization...');
            if (!pixiContainerRef.current) {
                throw new Error("Pixi container ref is null before creating App instance.");
            }

            // --- Create App Instance ---
            app = new PIXI.Application(); // Create local instance

            // --- Init App ---
            try {
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent.toLowerCase());
                const resolution = isSafari ? Math.min(window.devicePixelRatio || 1, 1.2) : (window.devicePixelRatio || 1);

                const canvas = document.createElement('canvas');
                if (pixiContainerRef.current) {
                    pixiContainerRef.current.innerHTML = '';
                    pixiContainerRef.current.appendChild(canvas);
                    // canvas.style.border = '3px solid red'; // Keep for debugging if needed
                    // canvas.style.background = 'rgba(50, 50, 50, 0.3)';
                    console.log("Canvas element created and appended.");
                } else {
                    throw new Error("Pixi container ref missing when trying to append canvas.");
                }

                const appOptions = {
                    canvas: canvas, // Use the created canvas
                    width: window.innerWidth,
                    height: window.innerHeight,
                    resolution: resolution,
                    antialias: true,
                    backgroundColor: 0x1a1a1a, // Darker background
                    backgroundAlpha: 1, // Fully opaque background
                    hello: true, // Show Pixi message in console
                };

                console.log("Attempting app.init with options:", appOptions);
                await app.init(appOptions); // Await initialization
                console.log("app.init() completed. Renderer type:", app.renderer?.type);

                // --- Critical Checks Post-Init ---
                if (!app.canvas) throw new Error("Pixi App init failed - canvas property missing");
                if (!app.renderer) throw new Error("Pixi App init failed - renderer property missing");
                if (!app.stage) throw new Error("Pixi App init failed - stage property missing");

                // --- Assign to Ref *ONLY AFTER* successful init ---
                pixiAppRef.current = app; // Assign the successfully initialized app to the ref

                console.log(`Pixi App initialized successfully with ${app.renderer.type === PIXI.RendererType.WEBGL ? 'WebGL' : 'Canvas'} renderer.`);

            } catch (error) {
                 console.error("Pixi App Initialization failed:", error);
                 setInitError(error.message || "Unknown initialization error");
                 // Clean up the *local* app instance if init failed
                 if (app && typeof app.destroy === 'function' && !app.destroyed) {
                      try {
                          app.destroy(true, { children: true, texture: true, baseTexture: true });
                      } catch (destroyError) {
                          console.error("Error destroying app after init failure:", destroyError);
                      }
                 }
                 app = null; // Nullify local var
                 pixiAppRef.current = null; // Ensure ref is null
                 if (pixiContainerRef.current) pixiContainerRef.current.innerHTML = '';
                 throw error; // Propagate
            }

            // --- Setup Scene Graph ---
            if (!app || !app.stage || app.stage.destroyed) {
                 throw new Error("Pixi stage invalid or destroyed after init.");
            }
            try {
                gameContainerRef.current = new PIXI.Container();
                gameContainerRef.current.sortableChildren = true;
                gameContainerRef.current.zIndex = 10;
                app.stage.addChild(gameContainerRef.current);

                app.stage.sortableChildren = true;

                // Use regular Container instead of ParticleContainer for Graphics compatibility
                // particleContainerRef.current = new PIXI.ParticleContainer(MAX_PARTICLES, {
                //     position: true, tint: false, alpha: true, scale: false, uvs: false,
                // });
                particleContainerRef.current = new PIXI.Container(); // Use regular Container
                particleContainerRef.current.zIndex = 5; // Particles between snakes/orbs
                gameContainerRef.current.addChild(particleContainerRef.current);
                console.log("Pixi containers created successfully.");
            } catch (error) {
                console.error("Error creating/adding Pixi containers:", error);
                setInitError(error.message);
                throw error;
            }

            // --- Load Assets ---
            try {
                console.log(`Attempting to load PixiJS assets from: ${ORB_SPRITESHEET_PATH}`);
                // REMOVED: await PIXI.Assets.unload(ORB_SPRITESHEET_PATH);
                console.log("PIXI.Assets state before load:", PIXI.Assets.cache.has(ORB_SPRITESHEET_PATH));

                // --- Load ---
                const spriteSheet = await PIXI.Assets.load(ORB_SPRITESHEET_PATH);
                console.log("PIXI.Assets.load resolved with:", spriteSheet); // Log the loaded spritesheet object

                // --- Validation ---
                if (!spriteSheet?.textures || Object.keys(spriteSheet.textures).length === 0) {
                  console.error("Validation failed: Spritesheet object or its 'textures' property is invalid or empty.", { spriteSheet });
                  throw new Error(`Spritesheet '${ORB_SPRITESHEET_PATH}' has no textures or failed to load correctly.`);
                }

                // grab any real frame texture from within the .textures object
                const firstFrameKey = Object.keys(spriteSheet.textures)[0];
                const firstTex = spriteSheet.textures[firstFrameKey];

                // REMOVED: Premature baseTexture.valid check. Pixi handles this asynchronously.
                // if (!firstTex?.baseTexture?.valid) { ... }

                console.log("Loaded asset passed initial validation (texture object exists):", {
                    textureKeys: Object.keys(spriteSheet.textures),
                    firstFrameKey: firstFrameKey,
                    baseTextureValid: firstTex.source.valid, // Use .source instead of .baseTexture
                    baseTextureSize: `${firstTex.source.width}x${firstTex.source.height}` // Use .source here too
                });

                // looks good – stash the entire spritesheet object
                console.log("Assigning loaded spritesheet object to texturesRef.current.orbSheet...");
                texturesRef.current.orbSheet = spriteSheet;
                console.log("Assignment to texturesRef.current.orbSheet complete.");

                console.log(`Orb assets loaded successfully: ${Object.keys(texturesRef.current.orbSheet.textures).length} textures`);
                setAssetsLoaded(true);

            } catch (error) {
                // --- Modified Error Handling ---
                console.error("Fatal Error loading PixiJS assets:", error);
                // Log the error object directly instead of stringifying
                console.error("Caught error object:", error);

                let errorMessage = `Asset loading failed: ${error.message}`; // Default message

                // Set specific messages based on error type if possible
                if (error instanceof SyntaxError || (error.message && error.message.includes('SyntaxError'))) {
                     errorMessage = `Asset loading failed: Invalid JSON format in ${ORB_SPRITESHEET_PATH}. Check file content.`;
                } else if (error.message && (error.message.includes('Failed to load') || error.message.includes('404'))) {
                     errorMessage = `Asset loading failed: Could not load ${ORB_SPRITESHEET_PATH}. Check file exists in 'public' folder and server is running.`;
                } else if (error.message && error.message.includes('Cannot serialize cyclic structures')) {
                     // This shouldn't happen anymore, but catch it just in case
                     errorMessage = `Asset loading failed due to internal cyclic structure issue during error reporting. Check console for the original error.`;
                }
                // --- End Modified Error Handling ---

                setInitError(errorMessage); // Set the user-friendly error message
                setAssetsLoaded(false);
                throw error; // Propagate the original error for the outer catch
            }

            // --- Setup FPS Counter ---
            if (!app.stage || app.stage.destroyed) {
                 throw new Error("Pixi stage invalid before adding FPS counter.");
            }
            try {
                const fpsStyle = { fontFamily: 'monospace', fontSize: 16, fill: '#ffffff', align: 'left' };
                fpsTextRef.current = new PIXI.Text({ text: 'FPS: 0', style: fpsStyle });
                fpsTextRef.current.position.set(10, 10);
                fpsTextRef.current.zIndex = 100;
                app.stage.addChild(fpsTextRef.current);
                console.log("FPS counter added successfully.");
            } catch (error) {
                 console.error("Error adding FPS counter:", error);
                 setInitError(error.message);
                 throw error;
            }

            // --- Mark as Fully Initialized ---
            initCompletedRef.current = true; // Mark success
            console.log("PixiJS Initialization Successfully Completed.");
        };

        initPixi().catch(err => {
            console.error("Error during Pixi Initialization (Outer Catch):", err);
            initStartedRef.current = false; // Reset start flag on failure
            initCompletedRef.current = false; // Ensure completed is false

            // Cleanup potentially partially initialized app *without* using the ref if it wasn't set
            const appToDestroy = pixiAppRef.current || app; // Use local 'app' if ref wasn't set
            pixiAppRef.current = null; // Clear ref

            if (appToDestroy) {
                 console.log("Running cleanup via safeDestroyApp due to initialization failure.");
                 safeDestroyApp(appToDestroy, "init failure");
            } else {
                 console.log("No app instance available to clean up after init failure.");
            }

            // Display error message (initError should be set by the inner catch)
            if (pixiContainerRef.current && initError) { // Check if initError is set
                pixiContainerRef.current.innerHTML = `
                    <div style="color: red; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 5px; max-width: 600px; margin: 50px auto; position: absolute; top: 10%; left: 50%; transform: translateX(-50%); z-index: 999;">
                        <h2>PixiJS Initialization Error</h2>
                        <p><strong>Error:</strong> ${initError}</p> {/* Display the message set earlier */}
                        <p>Check console (F12). Ensure assets like <code>${ORB_SPRITESHEET_PATH}</code> are in <code>public/</code> and valid.</p>
                    </div>`;
            } else if (pixiContainerRef.current) {
                 // Fallback if initError wasn't set for some reason
                 pixiContainerRef.current.innerHTML = `<div style="color: red; padding: 20px;">Pixi Init Failed. Check Console. Error: ${err.message}</div>`;
            }

            // Reset state
            setAssetsLoaded(false);
            setParticleManagerAttached(false);
            gameContainerRef.current = null;
            particleContainerRef.current = null;
            fpsTextRef.current = null;
            texturesRef.current = {};
            onReadyCalledRef.current = false;
        });

        // --- Cleanup Effect ---
        return () => {
            // StrictMode Guard: Prevent cleanup if it already ran for this effect instance
            if (cleanupRunRef.current) {
                 console.log("Pixi Cleanup: Already run for this instance, skipping.");
                 return;
            }
            cleanupRunRef.current = true; // Mark cleanup as run for this instance
            console.log(`Pixi Cleanup Effect Triggered. InitCompleted: ${initCompletedRef.current}`);

            // Get the app instance from the ref *at the time of cleanup*
            const currentApp = pixiAppRef.current;

            // Reset refs and state related to initialization
            initStartedRef.current = false;
            initCompletedRef.current = false;
            pixiAppRef.current = null; // Clear the main ref
            setAssetsLoaded(false);
            setParticleManagerAttached(false);
            onReadyCalledRef.current = false;

            if (currentApp) {
                // Destroy pooled particles
                let destroyedPooledCount = 0;
                particlePoolRef.current.forEach(wrapper => {
                    if (wrapper?.pixiObject && !wrapper.pixiObject.destroyed) {
                        if (wrapper.pixiObject.parent) wrapper.pixiObject.parent.removeChild(wrapper.pixiObject);
                        wrapper.pixiObject.destroy({children: true});
                        destroyedPooledCount++;
                    }
                });
                particlePoolRef.current = [];
                console.log(`Pooled particles destroyed: ${destroyedPooledCount}`);

                // Destroy active particles
                let destroyedActiveCount = 0;
                activeParticlesRef.current.forEach(entity => {
                    if (entity?.pixiObject && !entity.pixiObject.destroyed) {
                        if (entity.pixiObject.parent) entity.pixiObject.parent.removeChild(entity.pixiObject);
                       entity.pixiObject.destroy({children: true});
                       destroyedActiveCount++;
                    }
                });
                activeParticlesRef.current.clear();
                console.log(`Active particles destroyed: ${destroyedActiveCount}`);

                // Clear entity maps
                pixiSnakesMapRef.current.clear();
                pixiOrbsMapRef.current.clear();

                // Call the refined safe destroy helper
                safeDestroyApp(currentApp, "effect cleanup");

            } else {
                 console.log("Cleanup: No Pixi App instance found in ref to destroy.");
            }

            // Clear remaining refs
            gameContainerRef.current = null;
            particleContainerRef.current = null;
            fpsTextRef.current = null;
            texturesRef.current = {};

            // Clean up DOM
            if (pixiContainerRef.current) {
                pixiContainerRef.current.innerHTML = '';
            }

            console.log('PixiJS Cleanup Logic Complete.');
        };
    }, []); // Empty deps array

     // --- Effect to attach particle manager AND call onReady ---
     useEffect(() => {
         const initialized = initCompletedRef.current; // Use the completion ref
         console.log(">>> Particle Manager Effect RUNNING. Checking conditions...", {
             assetsLoaded,
             isInitialized: initialized, // Check completion flag
             worldExists: !!worldRef.current,
             worldHasManager: !!worldRef.current?.particleManager,
             particleManagerAttachedState: particleManagerAttached,
             onReadyExists: typeof onReady === 'function',
             onReadyCalled: onReadyCalledRef.current,
         });

         if (assetsLoaded && initialized && worldRef.current && !worldRef.current.particleManager && !particleManagerAttached) {
             console.log(">>> Particle Manager Effect: Conditions MET. Attaching manager...");
             worldRef.current.particleManager = {
                 get: getParticleFromPool,
                 release: releaseParticleToPool,
             };
             setParticleManagerAttached(true);
             console.log("Attached particle manager to worldRef");

             // --- Start Render Loop NOW ---
             const app = pixiAppRef.current;
             // Ensure the render loop is attached, even if the ticker is already started
             if (app && app.ticker && !app.ticker.destroyed) {
                 console.log("Hooking pixiRenderLoop into ticker...");
                 // Ensure listener isn't added multiple times (idempotent)
                 app.ticker.remove(pixiRenderLoop);
                 app.ticker.add(pixiRenderLoop);
                 // Only start if it's not already running
                 if (!app.ticker.started) app.ticker.start();
                 console.log("Render loop hooked.");
             } else {
                  console.warn("Could not start ticker: App or ticker invalid.", { hasApp: !!app, hasTicker: !!app?.ticker, tickerStarted: app?.ticker?.started, tickerDestroyed: app?.ticker?.destroyed });
             }

             // Call onReady if it exists and hasn't been called yet
             if (typeof onReady === 'function' && !onReadyCalledRef.current) {
                 try {
                     console.log("GameCanvas is ready, calling onReady callback.");
                     onReady();
                     onReadyCalledRef.current = true;
                 } catch (err) {
                     console.error("Error calling onReady callback:", err);
                 }
             }
         }
         // Detach if conditions are no longer met (e.g., during cleanup or failed init)
         else if ((!assetsLoaded || !initialized || !worldRef.current) && particleManagerAttached) {
              if(worldRef.current && worldRef.current.particleManager) {
                  delete worldRef.current.particleManager;
              }
              setParticleManagerAttached(false);
              console.log("Detached particle manager from worldRef");
         }
     }, [assetsLoaded, initCompletedRef.current, worldRef, particleManagerAttached, getParticleFromPool, releaseParticleToPool, onReady, gameState]); // Add gameState, initCompletedRef


    // --- Resize Hook ---
    useResizeCanvas(pixiAppRef);

    // --- PixiJS Render Loop ---
    const pixiRenderLoop = useCallback((ticker) => {
        const app = pixiAppRef.current;
        const world = worldRef.current;
        const gameContainer = gameContainerRef.current;

        // Basic readiness check
        const isReadyToRender = app && !app.destroyed &&
                                app.renderer && !app.renderer.destroyed &&
                                app.stage && !app.stage.destroyed &&
                                world && world.player && // Ensure world and player exist
                                assetsLoaded && // Ensure assets are loaded
                                particleManagerAttached && // Ensure manager is attached
                                gameContainer && !gameContainer.destroyed &&
                                particleContainerRef.current && !particleContainerRef.current.destroyed &&
                                initCompletedRef.current && // Ensure init completed
                                gameState === 'playing'; // Only render when playing

        if (!isReadyToRender) {
            // Optional: Log why rendering is skipped if needed for debugging
            // console.log("Render loop skipped:", { gameState, assetsLoaded, particleManagerAttached, initCompleted: initCompletedRef.current });
            return;
        }

        // One-time log
        if (!window._debugRendered) {
            console.log("🎮 PIXI Render loop ACTIVE - Entities rendering should begin");
            window._debugRendered = true;
        }

        const dt = ticker.deltaMS; // Time since last frame in MS

        // --- Game Over Check ---
        if (world.player.dead && gameState !== 'gameover') {
            console.log("Player death detected in render loop, setting gameover state.");
            setGameState('gameover');
            // Stop the ticker? Maybe not, let it run until cleanup?
            // app.ticker.stop(); // Consider if needed
            return; // Skip rest of render if game just ended
        }

        // --- Update FPS Counter ---
        if (fpsTextRef.current && !fpsTextRef.current.destroyed) {
            fpsTextRef.current.text = `FPS: ${Math.round(ticker.FPS || 0)}`;
        }

        // --- Camera Update ---
        const lerpFactor = 1 - Math.exp(-CAM_SMOOTH * dt * 0.06);
        const targetX = world.cam.x; // Target pivot is the world camera position
        const targetY = world.cam.y;
        // Lerp the pivot point
        gameContainer.pivot.x = lerp(gameContainer.pivot.x, targetX, lerpFactor);
        gameContainer.pivot.y = lerp(gameContainer.pivot.y, targetY, lerpFactor);
        // Keep the container centered on screen
        if (app.renderer.width > 0 && app.renderer.height > 0) {
           gameContainer.position.set(app.renderer.width / 2, app.renderer.height / 2);
        }


        // --- State Synchronization ---
        const currentSnakeIds = new Set();
        const currentOrbIds = new Set();

        // 1. Sync Snakes
        if (world.snakes && Array.isArray(world.snakes)) {
            const playerSkipCount = playerSkip(world.player);
            world.snakes.forEach(snake => {
                if (snake.dead && snake !== world.player) return;
                currentSnakeIds.add(snake);
                let snakeGfx = pixiSnakesMapRef.current.get(snake);
                if (!snakeGfx || snakeGfx.destroyed) {
                    if (gameContainer && !gameContainer.destroyed) {
                        if (snakeGfx) pixiSnakesMapRef.current.delete(snake);
                        snake.initPixi(gameContainer);
                        snakeGfx = snake.pixiObject;
                        if (snakeGfx) {
                            pixiSnakesMapRef.current.set(snake, snakeGfx);
                        } else { console.error(`Snake ${snake.id} failed to create pixiObject.`); }
                    }
                }
                if (snakeGfx && !snakeGfx.destroyed && snake.syncPixi) {
                    snake.syncPixi(playerSkipCount);
                }
            });
        }

        // 2. Sync Orbs
        if (world.orbs && Array.isArray(world.orbs)) {
            world.orbs.forEach(orb => {
                currentOrbIds.add(orb);
                let orbSprite = pixiOrbsMapRef.current.get(orb);
                if (!orbSprite || orbSprite.destroyed) {
                    if (gameContainer && !gameContainer.destroyed && texturesRef.current?.orbSheet?.textures) {
                        if (orbSprite) pixiOrbsMapRef.current.delete(orb);
                        orb.initPixi(gameContainer, texturesRef);
                        orbSprite = orb.pixiObject;
                        if (orbSprite) {
                            pixiOrbsMapRef.current.set(orb, orbSprite);
                        } else { console.error(`Orb ${orb.id} failed to create pixiObject.`); }
                    }
                }
                if (orbSprite && !orbSprite.destroyed && orb.syncPixi) {
                    orb.syncPixi(ticker);
                }
            });
        }

        // 3. Sync Active Particles
        const activeParticlesArray = Array.from(activeParticlesRef.current);
        activeParticlesArray.forEach(particleEntity => {
             particleEntity.update(dt);
            const pixiObject = particleEntity.pixiObject;
            if (pixiObject && !pixiObject.destroyed) {
                pixiObject.position.set(particleEntity.x, particleEntity.y);
                pixiObject.alpha = Math.max(0, particleEntity.life / particleEntity.maxLife);
                pixiObject.visible = particleEntity.visible;
                if (!particleEntity.visible) {
                    releaseParticleToPool(particleEntity);
                }
            } else if (!pixiObject || pixiObject?.destroyed) {
                 releaseParticleToPool(particleEntity);
            }
        });

        // --- Cleanup Removed Objects ---
        pixiSnakesMapRef.current.forEach((gfx, snake) => {
            if (!currentSnakeIds.has(snake)) {
                if (gfx && !gfx.destroyed && snake.destroyPixi) {
                    snake.destroyPixi(gameContainer);
                }
                pixiSnakesMapRef.current.delete(snake);
            }
        });

        pixiOrbsMapRef.current.forEach((sprite, orb) => {
            if (!currentOrbIds.has(orb)) {
                 if (sprite && !sprite.destroyed && orb.destroyPixi) {
                    orb.destroyPixi(gameContainer);
                 }
                pixiOrbsMapRef.current.delete(orb);
            }
        });

    }, [assetsLoaded, gameState, worldRef, particleManagerAttached, getParticleFromPool, releaseParticleToPool, setGameState, CAM_SMOOTH]); // Keep dependencies


    // Render container div or error message
    return (
        <div
            ref={pixiContainerRef}
            className="pixi-canvas-container"
            style={{
                width: '100%', height: '100%', position: 'absolute',
                top: 0, left: 0, zIndex: 1, overflow: 'hidden',
                // background: 'rgba(0,0,0,0.2)', // Optional debug background
                // border: '1px solid cyan' // Optional debug border
            }}
        >
            {initError && (
                 <div style={{
                     color: 'red', background: 'rgba(0,0,0,0.85)', padding: '20px',
                     border: '1px solid #500', borderRadius: '5px', maxWidth: '80%',
                     width: '600px', margin: '50px auto', zIndex: 999,
                     position: 'absolute', top: '10%', left: '50%',
                     transform: 'translateX(-50%)', fontFamily: 'monospace',
                     fontSize: '14px', lineHeight: '1.6'
                 }}>
                     <h2 style={{color: '#ff8080', margin: '0 0 15px 0', borderBottom: '1px solid #500', paddingBottom: '10px'}}>PixiJS Initialization Error</h2>
                     <p style={{margin: '0 0 10px 0'}}><strong>Error:</strong> {initError}</p>
                     <p style={{margin: 0}}>Check console (F12). Ensure assets like <code>{ORB_SPRITESHEET_PATH}</code> are in <code>public/</code> and valid.</p>
                 </div>
            )}
            {/* Canvas is appended here by PixiJS */}
        </div>
    );
}
