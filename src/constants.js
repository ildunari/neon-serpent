// extracted from NeonSerpentGame_backup.jsx on 2025-04-17

/*  ----------  background constants  ----------  */
// path is relative to the public/ folder
export const BG_SRC = '/cave_city_h264.mp4'; // Use the H.264 encoded version
export const BG_SCALE = 0.25; // Reduced zoom from 1.5 to 1.2 -- Reverted to 0.25
export const BG_PARALLAX = 0.3; // Parallax factor for background scrolling

/*  ----------  world constants  ----------  */
export const WORLD_SIZE   = 4000;               // square wrap‑around world
export const INITIAL_AI   = 6;
export const TICK_MS      = 1000 / 60;          // 60 fps logic
export const CAM_SMOOTH   = 0.08;
export const ORB_COUNT    = 350;
export const TURN_COOLDOWN_MS = 60;   // minimum interval (ms) between allowed turns (keyboard)
export const SELF_GAP         = 8;     // ignore first N segments for player self‑collision (DEPRECATED? see playerSkip)
export const TOUCH_DEADZONE_PX = 16;   // min drag distance before a touch turn registers (DEPRECATED? see JOY_DEADZONE)
export const ENEMY_NECK_GAP   = 4;     // ignore first N segments for AI necks
/* ---------- safety constant ---------- */
// "safe" tail distance (in px) used to decide how many neck links to ignore
// when checking if the player bites its own tail. Bigger == more forgiving.
export const SAFE_PX = 64;

/* ---------- joystick constants ---------- */
export const JOY_MAX_R    = 48;   // px – ring radius
// tighter dead‑zone for finer control
export const JOY_DEADZONE = 4;    // px – ignore micro wobbles only
// per‑joystick turn throttle (lower = snappier feel)
export const JOY_TURN_COOLDOWN_MS = 20;

export const POWERUPS     = ['turbo', 'phase', 'magnet', 'size']; // Not currently used?
// HTML overlay now handles the menu, so skip the old canvas text
export const DRAW_CANVAS_MENU = false; // Likely deprecated by React UI
