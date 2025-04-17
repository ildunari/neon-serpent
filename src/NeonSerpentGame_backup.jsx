/*  Neon Serpent — single‑file playable build
    React + HTML5 canvas
    2025‑04‑16   */

/*  ----------  React component  ----------  */
import React, { useRef, useEffect, useState, useCallback } from 'react';

/*  ----------  helpers  ----------  */
const rand   = (min, max) => Math.random() * (max - min) + min;
const randInt= (min, max) => Math.floor(rand(min, max + 1));
const clamp  = (v, a, b)  => Math.max(a, Math.min(b, v));
const dist   = (a, b)     => Math.hypot(a.x - b.x, a.y - b.y);
const lerp   = (a, b, t)  => a + (b - a) * t;
/*  ----------  visual‑accurate segment radius ----------  */
// Returns approx. half the drawn body width for a snake of given length.
const segRadius = len => 3 + len / 60;
/*  ----------  touch‑helpers  ----------  */
// Snap any vector to the nearest 4‑way cardinal direction
const snapToCardinal = (x, y) =>
  Math.abs(x) > Math.abs(y)
    ? { x: Math.sign(x), y: 0 }
    : { x: 0, y: Math.sign(y) };

// Dynamic dead‑zone scales with snake speed (fat‑finger friendly)
const dynamicDeadzone = speed => 0.12 * SAFE_PX * (1 + speed / 3);

/*  ----------  turn‑safety helper  ----------  */
// returns true if (hx,hy) would overlap the snake’s own tail (ignoring the first
// `skip` neck segments)
const willHitTail = (hx, hy, segs, skip) => {
  for (let i = skip; i < segs.length; i++) {
    const thresh = segRadius(segs.length) + 1;      // +1 for glow pad
    if (dist({ x: hx, y: hy }, segs[i]) < thresh) return true;
  }
  return false;
};

/*  ----------  background constants  ----------  */
// path is relative to the public/ folder
const BG_SRC = '/big-city.png';   // renamed file
const BG_SCALE = 0.25;             // 0.25 = show 25 % of the full‑res image

/*  ----------  world constants  ----------  */
const WORLD_SIZE   = 4000;               // square wrap‑around world
const INITIAL_AI   = 6;
const TICK_MS      = 1000 / 60;          // 60 fps logic
const CAM_SMOOTH   = 0.08;
const ORB_COUNT    = 350;
const TURN_COOLDOWN_MS = 100;   // minimum interval (ms) between allowed turns
const SELF_GAP         = 8;     // ignore first N segments for player self‑collision
const TOUCH_DEADZONE_PX = 16;   // min drag distance before a touch turn registers
const ENEMY_NECK_GAP   = 4;     // ignore first N segments for AI necks
/* ---------- safety constant ---------- */
// “safe” tail distance (in px) used to decide how many neck links to ignore
// when checking if the player bites its own tail. Bigger == more forgiving.
const SAFE_PX = 64;

/* ---------- joystick constants ---------- */
const JOY_MAX_R    = 48;   // px – ring radius
// tighter dead‑zone for finer control
const JOY_DEADZONE = 4;    // px – ignore micro wobbles only
// per‑joystick turn throttle (lower = snappier feel)
const JOY_TURN_COOLDOWN_MS = 20;

/*  ----------  player collision‑gap helper  ----------  */
const playerSkip = player => {
  // each body link is roughly the distance moved per tick == current speed px
  const links = Math.round(SAFE_PX / player.speed);
  return Math.min(links, 60);   // hard‑cap so giant snakes can still die
};
const POWERUPS     = ['turbo', 'phase', 'magnet', 'size'];
// HTML overlay now handles the menu, so skip the old canvas text
const DRAW_CANVAS_MENU = false;

/*  ----------  game classes  ----------  */
class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const roll = Math.random();
    if (roll < 0.02)       { this.type = 'rare';      this.r = 9; }
    else if (roll < 0.07)  { this.type = 'uncommon';  this.r = 7; }
    else                   { this.type = 'common';    this.r = 5; }
  }
  draw(ctx, cam) {
    const sx = this.x - cam.x, sy = this.y - cam.y;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r);
    const core = this.type === 'rare' ? '#ff4bff' :
                 this.type === 'uncommon' ? '#4bffec' : '#ffffff';
    g.addColorStop(0, core);
    g.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, this.r, 0, Math.PI * 2); ctx.fill();
  }
}

class Snake {
  constructor(x, y, isPlayer = false, brain = 'gather') {
    this.segs = [{ x, y }];          // head first
    this.goal = 6;                   // target length (# segments)
    this.isPlayer = isPlayer;
    // AI skill now spans 0.2 – 0.9 so some are clumsy, some are sharp
    this.skill = this.isPlayer ? 1 : rand(0.2, 0.9);
    this.baseSpeed = 1.2;
    this.speed = this.baseSpeed * (this.isPlayer ? 1 : (0.5 + this.skill * 0.5));
    this.dir = { x: 1, y: 0 };
    this.brain = brain;
    this.score = 0;
    this.dead = false;
    this.color = isPlayer ? '#00eaff' :
      (brain === 'hunt' ? '#ff4b4b' : brain === 'coward' ? '#ffcf1b' : '#6cff6c');
    this.glowFrames = 0;
    // queue of segment indices for eat animations
    this.eatQueue = [];
    // control the speed of the eat wave animation (smaller = slower)
    this.eatSpeed = 0.5;
  }

  /* AI steering */
  think(world, player) {
    if (this.isPlayer) return;
    // AI reaction based on skill: skip thinking occasionally for lower-skilled snakes
    if (Math.random() > this.skill) return;

    const head = this.segs[0];
    // avoid player's tail segments
    const avoidThresh = 10 + (1 - this.skill) * 20;   // 10–30 px depending on skill
    for (let i = 8; i < player.segs.length; i++) {
      const ts = player.segs[i];
      if (dist(head, ts) < avoidThresh) {
        // steer away from tail collision
        const fleeAngle = Math.atan2(head.y - ts.y, head.x - ts.x);
        this.dir.x = Math.cos(fleeAngle);
        this.dir.y = Math.sin(fleeAngle);
        return;
      }
    }
    let target = null;
    if (this.brain === 'gather') {
      target = world.orbs[randInt(0, world.orbs.length - 1)];
    } else if (this.brain === 'hunt') {
      // 50 % chase player, 50 % chase the nearest other snake’s head
      if (Math.random() < 0.5 || world.snakes.length <= 2) {
        target = player.segs[0];
      } else {
        const others = world.snakes.filter(s => s !== this && !s.dead);
        const closest = others.reduce((best, s) =>
          (dist(this.segs[0], s.segs[0]) < dist(this.segs[0], best.segs[0]) ? s : best),
          others[0]);
        target = closest ? closest.segs[0] : player.segs[0];
      }
    } else if (this.brain === 'coward') {
      const d = dist(head, player.segs[0]);
      if (player.length() > this.length() && d < 300) { // flee
        target = { x: head.x - (player.segs[0].x - head.x),
                   y: head.y - (player.segs[0].y - head.y) };
      } else {
        target = world.orbs[randInt(0, world.orbs.length - 1)];
      }
    }
    const angle = Math.atan2(target.y - head.y, target.x - head.x);
    this.dir.x = Math.cos(angle);
    this.dir.y = Math.sin(angle);
    // low‑skill snakes mis‑aim slightly
    if (!this.isPlayer) {
      const wobble = (1 - this.skill) * 0.5;         // up to ±0.5 rad
      const offset = rand(-wobble, wobble);
      const wobbleAngle = angle + offset;
      this.dir.x = Math.cos(wobbleAngle);
      this.dir.y = Math.sin(wobbleAngle);
    }
  }

  update(world) {
    if (this.dead) return;
    // compute new head with wrap-around world
    const head = {
      x: (this.segs[0].x + this.dir.x * this.speed + WORLD_SIZE) % WORLD_SIZE,
      y: (this.segs[0].y + this.dir.y * this.speed + WORLD_SIZE) % WORLD_SIZE
    };
    this.segs.unshift(head);
    if (this.segs.length > this.goal) this.segs.pop();
    // advance eat animation positions at reduced speed and remove finished
    this.eatQueue = this.eatQueue
      .map(p => p + this.eatSpeed)
      .filter(p => p < this.segs.length);
  }

  length() { return this.segs.length; }

  /* collision with orbs / other snakes handled externally */

  draw(ctx, cam) {
    if (this.dead) return;
    const baseColor = this.glowFrames > 0 ? '#ffffff' : this.color;
    if (this.glowFrames > 0) this.glowFrames--;
    ctx.lineCap = 'round';
    for (let i = 0; i < this.segs.length - 1; i++) {
      const p1 = this.segs[i], p2 = this.segs[i + 1];
      const sx1 = p1.x - cam.x, sy1 = p1.y - cam.y;
      const sx2 = p2.x - cam.x, sy2 = p2.y - cam.y;

      // smooth eat-wave gradient: swell peaks at wave center, falls off over swellDist
      const baseW = 6 + (this.length() / 30);
      const swellDist = 5;
      const swellFactor = this.eatQueue.reduce((max, pos) => {
        const d = Math.abs(i - pos);
        const f = Math.max(0, 1 - d / swellDist);
        return f > max ? f : max;
      }, 0);
      // width pulse: up to 50% larger at wave center
      const w = baseW * (1 + swellFactor * 0.5);

      // stronger pulse effect travelling along the body
      const pulse = swellFactor > 0.01;
      const strokeColor  = pulse ? '#ffffff' : baseColor;
      const shadowColor  = pulse ? '#ffffff' : baseColor;
      const shadowBlur   = pulse ? 25 : 10;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = baseW * (1 + swellFactor * 0.7);   // bigger swell
      ctx.shadowBlur  = shadowBlur;
      ctx.shadowColor = shadowColor;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.quadraticCurveTo((sx1 + sx2) / 2, (sy1 + sy2) / 2, sx2, sy2);
      ctx.stroke();
    }
    // draw a visible head if the snake is only 1 segment long
    if (this.segs.length === 1) {
      const p = this.segs[0];
      const sx = p.x - cam.x, sy = p.y - cam.y;
      const r  = 4 + this.length() / 30;
      ctx.fillStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur  = 10;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.shadowBlur = 0;
  }
}

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = rand(-2, 2);
    this.vy = rand(-2, 2);
    this.life = 30;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  draw(ctx, cam) {
    if (this.life <= 0) return;
    const alpha = this.life / 30;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(this.x - cam.x, this.y - cam.y, 2, 2);
  }
}

/*  ----------  world factory  ----------  */
function createWorld() {
  const orbs = Array.from({ length: ORB_COUNT }, () =>
    new Orb(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE)));
  const player = new Snake(WORLD_SIZE / 2, WORLD_SIZE / 2, true);
  const snakes = [player];
  const brains = ['gather', 'hunt', 'coward'];
  for (let i = 0; i < INITIAL_AI; i++) {
    snakes.push(
      new Snake(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE), false,
                brains[i % brains.length])
    );
  }

  return {
    orbs,
    snakes,
    player,
    cam: { x: player.segs[0].x, y: player.segs[0].y },
    particles: [],
    deathInfo: null
  };
}

/*  ----------  collision helpers  ----------  */
function handleCollisions(w) {
  const head = w.player.segs[0];

  /* eat orbs */
  w.orbs = w.orbs.filter(o => {
    if (dist(head, o) < 10) {
      const grow  = o.type === 'rare' ? 10 : o.type === 'uncommon' ? 6 : 4;
      const score = o.type === 'rare' ? 50 : o.type === 'uncommon' ? 25 : 10;
      w.player.goal  += grow;
      w.player.score += score;
      w.player.speed  = 1.2 + w.player.length() / 60;
          w.player.glowFrames = 30;
      // start a new eat animation wave
      w.player.eatQueue.push(0);
      const sparks = 6 + (o.type === 'rare' ? 12 : o.type === 'uncommon' ? 6 : 0);
      for (let i = 0; i < sparks; i++) w.particles.push(new Particle(head.x, head.y));
      return false;
    }
    return true;
  });
  while (w.orbs.length < ORB_COUNT)
    w.orbs.push(new Orb(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE)));

  // enemy head colliding with player tail
  w.snakes.forEach(s => {
    if (s.isPlayer || s.dead) return;
    const eh = s.segs[0];
    for (let i = 8; i < w.player.segs.length; i++) {
      if (dist(eh, w.player.segs[i]) < 8) {
        // kill enemy on touching tail
        s.dead = true;
        w.player.goal += Math.floor(s.length() / 2);
        w.player.score += s.score;
        break;
      }
    }
  });

  /* tail hits */
  const SELF_IGNORE  = playerSkip(w.player);   // speed‑aware for player
  const ENEMY_IGNORE = ENEMY_NECK_GAP;

  w.snakes.forEach(s => {
    if (s.dead) return;
    const skip = s.isPlayer ? SELF_IGNORE : ENEMY_IGNORE;

    for (let i = skip; i < s.segs.length; i++) {
      const hitR = segRadius(w.player.length()) + segRadius(s.length()) + 1;
      if (dist(head, s.segs[i]) < hitR) {
        // record death reason
        if (s.isPlayer) {
          w.deathInfo = { reason: 'self_tail_collision', segment: i };
        } else {
          w.deathInfo = { reason: 'player_hit_enemy_tail', enemyColor: s.color };
        }
        // kill the snake that was hit
        s.dead = true;
        w.player.goal  += Math.floor(s.length() / 2);
        w.player.score += s.score;
        break;
      }
    }
  });

  /* clean dead snakes + respawn */
  w.snakes = w.snakes.filter(s => !s.dead || s.isPlayer);
  while (w.snakes.length < INITIAL_AI + 1) { // +1 for player
    const brains = ['gather', 'hunt', 'coward'];
    w.snakes.push(
      new Snake(rand(0, WORLD_SIZE), rand(0, WORLD_SIZE), false,
                brains[randInt(0, 2)])
    );
  }
}

/*  ----------  render helpers  ----------  */
function drawWorld(w, ctx, view, bgImg, bgReady) {
  /* clear / parallax */
  ctx.clearRect(0, 0, view.w, view.h);
  if (bgReady) {
    ctx.save();
    ctx.filter = 'blur(4px) brightness(0.6) saturate(0.8)';   // heavier blur & dim
    const p = 0.25;                                   // parallax factor
    const scaledW = bgImg.width  * BG_SCALE;
    const scaledH = bgImg.height * BG_SCALE;
    const ox = (-w.cam.x * p) % scaledW;
    const oy = (-w.cam.y * p) % scaledH;
    for (let x = -scaledW; x < view.w + scaledW; x += scaledW) {
      for (let y = -scaledH; y < view.h + scaledH; y += scaledH) {
        ctx.drawImage(bgImg, ox + x, oy + y, scaledW, scaledH);
      }
    }
    // draw world boundary so player knows where death occurs
    ctx.strokeStyle = 'rgba(255,0,0,0.35)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(-w.cam.x, -w.cam.y, WORLD_SIZE, WORLD_SIZE);
    ctx.setLineDash([]);
    ctx.restore();  // reset filter
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, view.w, view.h);
  }

  /* orbs & snakes */
  w.orbs.forEach(o => o.draw(ctx, w.cam));
  w.particles.forEach(p => p.draw(ctx, w.cam));
  w.snakes.forEach(s => s.draw(ctx, w.cam));

  /* HUD */
  ctx.fillStyle = '#fff'; ctx.font = '16px monospace';
  ctx.fillText(`Score: ${w.player.score}`, 12, 20);
}

/*  ----------  debug helpers  ----------  */
// store the 15 most recent accepted turns (so we know what you did right before death)
const lastMoves = [];

/*  ----------  React component  ----------  */
export default function NeonSerpentGame() {
  const canvasRef = useRef(null);
  const [joystick, setJoystick] = useState({
    active: false,         // finger presently down?
    cx: 0, cy: 0,          // joystick centre
    dx: 0, dy: 0           // knob offset (clamped)
  });
  const joystickRef = useRef(joystick);
  useEffect(() => { joystickRef.current = joystick; }, [joystick]);

  const [bgReady, setBgReady] = useState(false);
  const [gameState, setGameState] = useState('menu');   // menu | playing | gameover
  const menuOptions = ['Start Game', 'Controls', 'Restart Game'];
  // tap / click on menu buttons
  const handleMenuClick = useCallback(idx => {
    if (idx === 0) {                 // Start
      worldRef.current = createWorld(); // fresh world each time
      setGameState('playing');
    } else if (idx === 1) {          // Controls
      setShowControls(true);
    } else if (idx === 2) {          // Restart
      worldRef.current = createWorld();
      setGameState('playing');
    }
  }, []);
  const [menuIndex, setMenuIndex] = useState(0);
  const menuIndexRef = useRef(menuIndex);
  useEffect(() => { menuIndexRef.current = menuIndex; }, [menuIndex]);
  const [showControls, setShowControls] = useState(false);
  // blur canvas when secondary menu
  useEffect(() => {
    if (!showControls) return;
    const onKeyControls = e => {
      if (e.type === 'keydown' && (e.code === 'Escape' || e.code === 'Enter')) {
        setShowControls(false);
      }
    };
    window.addEventListener('keydown', onKeyControls);
    return () => window.removeEventListener('keydown', onKeyControls);
  }, [showControls]);
  // controls data for overlay with image icons
  const controlsInfo = [
    { label: 'Move', icons: ['/w.png', '/a.png', '/s.png', '/d.png', '/up.png', '/left.png', '/down.png', '/right.png'] },
    { label: 'Start / Restart', icons: ['/space.png'] },
    { label: 'Back to Menu', icons: [], fallback: 'Escape (⎋)' }
  ];
  const worldRef = useRef(null);
  const bgImg = useRef(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    /* load background once */
    const img = new Image();
    img.src = BG_SRC;
    img.onload = () => setBgReady(true);
    img.onerror = err => console.error('BG image failed to load:', BG_SRC, err);
    bgImg.current = img;
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    worldRef.current = createWorld();
    const canvas = canvasRef.current;
    const ctx     = canvas.getContext('2d');
    const view = { w: window.innerWidth, h: window.innerHeight };
    // device‑pixel‑ratio for crisp rendering on Retina / 4K screens
    let dpr = window.devicePixelRatio || 1;
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = 'high';

    function resize() {
      dpr = window.devicePixelRatio || 1;
      // keep CSS size unchanged
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
 
      // set actual bitmap resolution for the canvas
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
 
      // reset any existing transforms then scale so 1 canvas unit = 1 CSS px
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
 
      view.w = window.innerWidth;
      view.h = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /*   --- input ---   */
    const keys = {};
    // ----- touch steering -----
    let lastTouchVec   = null; // { x, y, len } – live vector
    let lastTouchTime  = 0;    // for quick‑tap bookkeeping only

    const onTouchStart = e => {
      if (gameStateRef.current === 'gameover') {
        worldRef.current = createWorld();
        setGameState('playing');
        return;
      }
      const t = e.touches[0];
      setJoystick({ active: true, cx: t.clientX, cy: t.clientY, dx: 0, dy: 0 });
      lastTouchTime = performance.now();
      e.preventDefault();
    };
    const onTouchMove = e => {
      if (!joystickRef.current.active) return;
      const t   = e.touches[0];
      const dx0 = t.clientX - joystickRef.current.cx;
      const dy0 = t.clientY - joystickRef.current.cy;
      const len = Math.hypot(dx0, dy0);

      if (len < JOY_DEADZONE) {
        setJoystick(j => ({ ...j, dx: 0, dy: 0 }));
        return e.preventDefault();
      }

      const clampedLen = Math.min(len, JOY_MAX_R);
      const nx = dx0 / len, ny = dy0 / len;
      const dx = nx * clampedLen, dy = ny * clampedLen;

      setJoystick(j => ({ ...j, dx, dy }));
      lastTouchVec   = { x: nx, y: ny, len: clampedLen };
      lastTouchTime  = performance.now();
      e.preventDefault();
    };
    const onTouchEnd = () => {
      setJoystick(j => ({ ...j, active: false }));
      lastTouchVec = null;           // keep heading, stop steering
    };
  
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);
    canvas.addEventListener('touchcancel',onTouchEnd);
    const onKey = e => {
      keys[e.key.toLowerCase()] = e.type === 'keydown';
      if (e.type === 'keydown') {
        // menu navigation
        if (gameStateRef.current === 'menu' && !showControls) {
          if (e.code === 'ArrowUp') {
            setMenuIndex((menuIndexRef.current + menuOptions.length - 1) % menuOptions.length);
            return;
          }
          if (e.code === 'ArrowDown') {
            setMenuIndex((menuIndexRef.current + 1) % menuOptions.length);
            return;
          }
          if (e.code === 'Enter') {
            const idx = menuIndexRef.current;
            if (idx === 0) setGameState('playing');
            else if (idx === 1) setShowControls(true);
            else if (idx === 2) { worldRef.current = createWorld(); setGameState('playing'); }
            return;
          }
        }
        if (e.code === 'Space') {
          if (gameStateRef.current === 'menu') {
            setGameState('playing');
          } else if (gameStateRef.current === 'gameover') {
            worldRef.current = createWorld();
            setGameState('playing');
          }
        } else if (e.code === 'Escape') {
          if (showControls) setShowControls(false);
          if (gameStateRef.current === 'playing') {
            setGameState('menu');
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    let lastTurn = 0;            // last time a direction change was accepted
    /*   --- main loop ---   */
    let last = 0;
    function loop(ts) {
      if (ts - last >= TICK_MS) {
        last = ts;
        const world = worldRef.current; // always get latest world state

        if (gameStateRef.current === 'playing') {
          /* ---- touch steering (virtual joystick) ---- */
          const p = world.player;
          if (lastTouchVec) {
            const nx = lastTouchVec.x, ny = lastTouchVec.y;
          const isOpp   = (nx * p.dir.x + ny * p.dir.y) < -0.95;  // almost exact reverse
          const canTurn = (ts - lastTurn) > JOY_TURN_COOLDOWN_MS;

            const nextX = (p.segs[0].x + nx * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const nextY = (p.segs[0].y + ny * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const wouldBite = willHitTail(nextX, nextY, p.segs, playerSkip(p));

            if (!isOpp && canTurn && !wouldBite) {
              p.dir.x = nx; p.dir.y = ny;
              lastTurn = ts;
              lastMoves.push({ ts, method: 'touch', dir: { x: nx, y: ny } });
              if (lastMoves.length > 15) lastMoves.shift();
            }
          }

          /* player dir from keys */
          let dx = 0, dy = 0;
          if (keys['arrowup'] || keys['w']) dy -= 1;
          if (keys['arrowdown'] || keys['s']) dy += 1;
          if (keys['arrowleft'] || keys['a']) dx -= 1;
          if (keys['arrowright'] || keys['d']) dx += 1;
          if (dx || dy) {
            const len = Math.hypot(dx, dy);
            const nx  = dx / len, ny = dy / len;

            const isOpposite = (nx === -p.dir.x && ny === -p.dir.y);
            const canTurn    = (ts - lastTurn) > TURN_COOLDOWN_MS;

            // simulate next‑tick head position and see if we’d chomp our own neck
            const nextX = (p.segs[0].x + nx * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const nextY = (p.segs[0].y + ny * p.speed + WORLD_SIZE) % WORLD_SIZE;
            const wouldNeckBite = willHitTail(nextX, nextY, p.segs, playerSkip(p));

            if (!isOpposite && canTurn && !wouldNeckBite) {
              p.dir.x = nx;
              p.dir.y = ny;
              lastTurn = ts;
              lastMoves.push({ ts, method: 'key', dir: { x: p.dir.x, y: p.dir.y } });
              if (lastMoves.length > 15) lastMoves.shift();
            }
          }

          /* AI think and update */
          world.snakes.forEach(s => s.think && s.think(world, p));
          world.snakes.forEach(s => s.update(world));
          world.particles.forEach(p => p.update());
          world.particles = world.particles.filter(p => p.life > 0);

          handleCollisions(world);
          /* camera follows head */
          world.cam.x = lerp(world.cam.x, p.segs[0].x - view.w / 2, CAM_SMOOTH);
          world.cam.y = lerp(world.cam.y, p.segs[0].y - view.h / 2, CAM_SMOOTH);
          if (world.player.dead) {
            if (!world.hasLoggedDeath) {               // prevent spam
              console.log('Player died:', world.deathInfo ?? 'unknown cause');
              console.table(lastMoves);
              world.hasLoggedDeath = true;
            }
            setGameState('gameover');
          }
        }

        drawWorld(world, ctx, view, bgImg.current, bgReady);

        if (gameStateRef.current !== 'playing') {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(0, 0, view.w, view.h);
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';

          if (gameStateRef.current === 'menu' && !showControls && DRAW_CANVAS_MENU) {
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText('Neon Serpent', view.w / 2, view.h / 2 - 40);
            ctx.font = '28px monospace'; // slightly larger
            // menu items with more spacing and glow on selection
            ['Press SPACE to start', 'Controls', 'Restart Game'].forEach((text, i) => {
              const y = view.h / 2 + 30 + i * 50; // more space
              if (menuIndexRef.current === i) {
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
              } else {
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 0;
              }
              ctx.fillText(text, view.w / 2, y);
            });
            ctx.shadowBlur = 0; // reset glow
          } else if (gameStateRef.current === 'gameover') {
            ctx.font = 'bold 48px sans-serif';
            ctx.fillText('Game Over', view.w / 2, view.h / 2 - 40);
            ctx.font = '24px monospace';
            ctx.fillText(`Score: ${world.player.score}`, view.w / 2, view.h / 2 + 10);
            ctx.fillText('Press SPACE to restart', view.w / 2, view.h / 2 + 40);
          }

          ctx.textAlign = 'left';
        }
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    /* cleanup */
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
      canvas.removeEventListener('touchcancel',onTouchEnd);
    };
  }, [bgReady, showControls]);

  return (
    <div style={{ position: 'relative' }}>
      {joystick.active && (
        <div
          style={{
            position: 'fixed',
            left: joystick.cx - JOY_MAX_R,
            top:  joystick.cy - JOY_MAX_R,
            width: JOY_MAX_R * 2,
            height: JOY_MAX_R * 2,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
            zIndex: 50
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: JOY_MAX_R + joystick.dx,
              top:  JOY_MAX_R + joystick.dy,
              width: 40,
              height: 40,
              marginLeft: -20,
              marginTop:  -20,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              border: '2px solid rgba(255,255,255,0.9)',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          touchAction: 'none',
          filter: showControls ? 'blur(4px)' : ''
        }}
      />

      {gameState === 'menu' && !showControls && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            pointerEvents: 'auto'
          }}
        >
          {menuOptions.map((opt, idx) => (
            <button
              key={opt}
              onClick={() => handleMenuClick(idx)}
              style={{
                width: 220,
                padding: '14px 24px',
                fontSize: 22,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid #fff',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* main menu now rendered directly on canvas via draw loop */}

      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h2 style={{ marginBottom: 20, fontSize: '32px', fontWeight: 'bold' }}>Game Controls</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: 30, alignItems: 'center' }}>
          {controlsInfo.map((c, idx) => (
            c.label === 'Move' ? (
              <div key={idx} style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  {/* WASD cluster */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img src='/w.png' alt='W key' style={{ width: 56, height: 56 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <img src='/a.png' alt='A key' style={{ width: 56, height: 56 }} />
                      <img src='/s.png' alt='S key' style={{ width: 56, height: 56 }} />
                      <img src='/d.png' alt='D key' style={{ width: 56, height: 56 }} />
                    </div>
                  </div>

                  {/* separator */}
                  <span style={{ fontSize: 40, color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>|</span>

                  {/* Arrow‑key cluster */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img src='/up.png' alt='Up arrow' style={{ width: 56, height: 56 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <img src='/left.png'  alt='Left arrow'  style={{ width: 56, height: 56 }} />
                      <img src='/down.png'  alt='Down arrow'  style={{ width: 56, height: 56 }} />
                      <img src='/right.png' alt='Right arrow' style={{ width: 56, height: 56 }} />
                    </div>
                  </div>

                  {/* label */}
                  <span style={{ marginLeft: 24, fontSize: 28, fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
                    Move
                  </span>
                </div>
              </div>
            ) : (
              <div key={idx} style={{ fontFamily: 'sans-serif', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.icons && c.icons.length > 0 ? (
                    c.icons.map(icon => (
                      <img
                        key={icon}
                        src={icon}
                        alt={`${c.label} icon`}
                        style={{ width: c.label === 'Start / Restart' ? 48 : 32, height: c.label === 'Start / Restart' ? 48 : 32 }}
                      />
                    ))
                  ) : (
                    <span style={{ fontSize: '24px', color: '#fff' }}>{c.fallback}</span>
                  )}
                  <span style={{ marginLeft: '8px', fontSize: '24px', fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
                    {c.label}
                  </span>
                </div>
              </div>
            )
          ))}
          </div>
          <button
            onClick={() => setShowControls(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 12px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '18px', fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}


/*  ----------  tiny sanity tests (run on import) ----------  */
console.assert(dist({ x: 0, y: 0 }, { x: 3, y: 4 }) === 5, 'dist fail');
