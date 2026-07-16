/* ==========================================================
   Oregon Trail: Unbroken — ARCADE
   Four engines: shooter, dodger, survival, repair.
   Plus the scrolling trail scene on the travel screen.
   Everything is drawn with canvas primitives — no image assets.
   ========================================================== */

/* ---------------- Shared drawing kit ---------------- */
const Art = {
  // Palettes per skin
  sky(ctx, w, h, skin) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    const P = {
      river:    ['#2c4a63', '#4a7ba8', '#6f9dc4'],
      rapids:   ['#1c2f42', '#33566f', '#5b8aa6'],
      stampede: ['#5a4a2e', '#8a6f3e', '#c2a15c'],
      dust:     ['#6b3f1e', '#9c5f2c', '#c98a45'],
      forest:   ['#1c2b1c', '#2f4a2c', '#4d6b40'],
      bandit:   ['#3a2418', '#6b4326', '#a9713c'],
      hunt:     ['#3c5a7a', '#7aa3c4', '#c9d9e4'],
      grizzly:  ['#241a2e', '#43304a', '#6b4a63'],
      wolf:     ['#0d1420', '#1c2b3f', '#33455e'],
      blizzard: ['#26313d', '#465667', '#7d8d9c'],
      repair:   ['#1a1410', '#2b2118', '#4a3524'],
      prairie:  ['#4a7ba8', '#8fb4d0', '#d9c7a3'],
      plains:   ['#5a86ad', '#9dbdd6', '#dcc9a4'],
      rock:     ['#8a5a3c', '#b57c4e', '#dcb07a'],
      mountain: ['#4a6480', '#7d97ad', '#c4cdd6'],
      canyon:   ['#6b3524', '#a35a35', '#d99a5c']
    }[skin] || ['#2c4a63', '#4a7ba8', '#6f9dc4'];
    g.addColorStop(0, P[0]); g.addColorStop(.6, P[1]); g.addColorStop(1, P[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  },

  ground(ctx, w, h, y, skin) {
    const C = {
      prairie: '#6d8659', plains: '#8a9a5b', rock: '#8a5a3c', mountain: '#5a6b7a',
      canyon: '#7a4128', forest: '#2f4a2c', bandit: '#7a5a3c', hunt: '#8a9a5b',
      grizzly: '#3a2e3c', wolf: '#1c2b1f', dust: '#8a5a2c', stampede: '#7a6a3c',
      blizzard: '#c9d4dc', repair: '#3a2c20'
    }[skin] || '#6d8659';
    ctx.fillStyle = C; ctx.fillRect(0, y, w, h - y);
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.fillRect(0, y, w, 4);
  },

  wagon(ctx, x, y, s, tilt) {
    ctx.save();
    ctx.translate(x, y);
    if (tilt) ctx.rotate(tilt);
    ctx.scale(s, s);
    // wheels
    ctx.fillStyle = '#3a2c1e';
    [[-16, 12], [16, 12]].forEach(([wx, wy]) => {
      ctx.beginPath(); ctx.arc(wx, wy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wx, wy, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx - 6, wy); ctx.lineTo(wx + 6, wy);
      ctx.moveTo(wx, wy - 6); ctx.lineTo(wx, wy + 6); ctx.stroke();
    });
    // bed
    ctx.fillStyle = '#4a3524'; ctx.fillRect(-22, 0, 44, 12);
    // canvas cover
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(-20, -22, 0, -22);
    ctx.quadraticCurveTo(20, -22, 20, 0);
    ctx.closePath(); ctx.fill();
    // ribs
    ctx.strokeStyle = 'rgba(90,70,50,.5)'; ctx.lineWidth = 1.4;
    [-10, 0, 10].forEach(rx => {
      ctx.beginPath(); ctx.moveTo(rx, 0);
      ctx.quadraticCurveTo(rx * 1.05, -20, rx * .55, -21.5); ctx.stroke();
    });
    ctx.restore();
  },

  ox(ctx, x, y, s, phase) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const legSwing = Math.sin(phase) * 3;
    ctx.fillStyle = '#4a3a2c';
    ctx.fillRect(-4 + legSwing, 6, 3, 8);
    ctx.fillRect(4 - legSwing, 6, 3, 8);
    ctx.fillRect(-9, 0, 20, 8);            // body
    ctx.beginPath(); ctx.arc(13, 1, 5, 0, Math.PI * 2); ctx.fill();  // head
    ctx.strokeStyle = '#d9c7a3'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(12, -3); ctx.lineTo(16, -7); ctx.stroke(); // horn
    ctx.restore();
  },

  bandit(ctx, t) {
    const { x, y, hp, maxHp } = t;
    ctx.save(); ctx.translate(x, y);
    const bob = Math.sin(t.phase) * 2;
    // horse
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(-16, 4 + bob, 32, 12);
    ctx.fillRect(-14, 14 + bob, 3, 9); ctx.fillRect(11, 14 + bob, 3, 9);
    ctx.beginPath(); ctx.arc(t.dir > 0 ? 18 : -18, 2 + bob, 5, 0, Math.PI * 2); ctx.fill();
    // rider
    ctx.fillStyle = '#6b2c1e'; ctx.fillRect(-5, -12 + bob, 11, 16);
    ctx.fillStyle = '#d9b48a'; ctx.beginPath(); ctx.arc(0, -16 + bob, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2118'; // hat
    ctx.fillRect(-8, -20 + bob, 16, 3); ctx.fillRect(-4, -25 + bob, 8, 5);
    Art.hpbar(ctx, 0, -34 + bob, hp, maxHp, 30);
    ctx.restore();
  },

  wolf(ctx, t) {
    const { x, y, hp, maxHp } = t;
    ctx.save(); ctx.translate(x, y);
    const bob = Math.sin(t.phase * 2) * 1.6;
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(-14, -4 + bob, 26, 10);
    ctx.fillRect(-12, 6 + bob, 3, 7); ctx.fillRect(8, 6 + bob, 3, 7);
    ctx.beginPath(); ctx.arc(t.dir > 0 ? 14 : -14, -6 + bob, 6, 0, Math.PI * 2); ctx.fill();
    // ears
    ctx.beginPath();
    ctx.moveTo((t.dir > 0 ? 11 : -11), -11 + bob); ctx.lineTo((t.dir > 0 ? 14 : -14), -16 + bob);
    ctx.lineTo((t.dir > 0 ? 17 : -17), -11 + bob); ctx.fill();
    // eyes
    ctx.fillStyle = '#e0a72e';
    ctx.beginPath(); ctx.arc((t.dir > 0 ? 16 : -16), -7 + bob, 1.6, 0, Math.PI * 2); ctx.fill();
    Art.hpbar(ctx, 0, -24 + bob, hp, maxHp, 28);
    ctx.restore();
  },

  grizzly(ctx, t) {
    const { x, y, hp, maxHp } = t;
    const s = 2.7;
    const d = t.dir > 0 ? 1 : -1;          // facing
    const bob = Math.sin(t.phase * 3) * 2.2;
    const gait = Math.sin(t.phase * 6) * 4;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * d, s);                   // mirror by facing

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.32)';
    ctx.beginPath(); ctx.ellipse(0, 17, 24, 4.5, 0, 0, Math.PI * 2); ctx.fill();

    // hind + fore legs (back pair first, darker)
    ctx.fillStyle = '#33200f';
    ctx.fillRect(-16 - gait * .5, 4 + bob, 7, 14);
    ctx.fillRect(11 + gait * .5, 4 + bob, 7, 14);
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-13 + gait, 5 + bob, 8, 13);
    ctx.fillRect(9 - gait, 5 + bob, 8, 13);

    // body
    ctx.beginPath();
    ctx.ellipse(-1, -3 + bob, 20, 11.5, 0, 0, Math.PI * 2); ctx.fill();

    // the shoulder hump — the grizzly tell, sits ABOVE the head
    ctx.beginPath();
    ctx.ellipse(4, -13 + bob, 11, 8, -0.15, 0, Math.PI * 2); ctx.fill();

    // neck + head, carried low and forward
    ctx.beginPath(); ctx.ellipse(15, -6 + bob, 9, 7.5, 0, 0, Math.PI * 2); ctx.fill();

    // muzzle
    ctx.fillStyle = '#5e4028';
    ctx.beginPath(); ctx.ellipse(23, -3 + bob, 6.5, 4.5, .12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c1008';
    ctx.beginPath(); ctx.ellipse(28, -4 + bob, 2, 1.6, 0, 0, Math.PI * 2); ctx.fill();

    // open jaw + teeth
    ctx.fillStyle = '#2b1008';
    ctx.beginPath(); ctx.ellipse(24, 1 + bob, 4.5, 2.4, .1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2eadb';
    ctx.beginPath(); ctx.moveTo(21, 0 + bob); ctx.lineTo(22.5, 3 + bob); ctx.lineTo(24, 0 + bob); ctx.fill();
    ctx.beginPath(); ctx.moveTo(25, 0 + bob); ctx.lineTo(26.5, 2.6 + bob); ctx.lineTo(27.5, 0 + bob); ctx.fill();

    // ear
    ctx.fillStyle = '#4a3020';
    ctx.beginPath(); ctx.arc(10, -12 + bob, 3.2, 0, Math.PI * 2); ctx.fill();

    // eye — small, mean, lit
    ctx.fillStyle = '#0d0704';
    ctx.beginPath(); ctx.ellipse(19, -8 + bob, 2, 1.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8763a';
    ctx.beginPath(); ctx.arc(19.4, -8.3 + bob, .9, 0, Math.PI * 2); ctx.fill();

    // claws
    ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.1;
    [[-13 + gait, 18], [9 - gait, 18]].forEach(([lx, ly]) => {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(lx + 1 + i * 2.6, ly);
        ctx.lineTo(lx + 1.6 + i * 2.6, ly + 2.6);
        ctx.stroke();
      }
    });
    ctx.restore();

    Art.hpbar(ctx, x, y - 62, hp, maxHp, 110, true);
    Art.text(ctx, 'GRIZZLY', x, y - 68, 11, '#e8763a');
  },

  game(ctx, t) {
    const { x, y } = t;
    ctx.save(); ctx.translate(x, y);
    const bob = Math.sin(t.phase * 2) * 2;
    if (t.kind === 'buffalo') {
      ctx.fillStyle = '#4a3428';
      ctx.fillRect(-22, -6 + bob, 40, 18);
      ctx.beginPath(); ctx.arc(-14, -12 + bob, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a2a1e';
      ctx.beginPath(); ctx.arc(t.dir > 0 ? 20 : -24, -2 + bob, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-18, 12 + bob, 4, 8); ctx.fillRect(12, 12 + bob, 4, 8);
    } else if (t.kind === 'deer') {
      ctx.fillStyle = '#9a6f42';
      ctx.fillRect(-12, -4 + bob, 22, 9);
      ctx.fillRect(-10, 5 + bob, 2.5, 9); ctx.fillRect(7, 5 + bob, 2.5, 9);
      ctx.beginPath(); ctx.arc(t.dir > 0 ? 12 : -12, -9 + bob, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6b4c33'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(t.dir > 0 ? 12 : -12, -13 + bob); ctx.lineTo(t.dir > 0 ? 15 : -15, -21 + bob);
      ctx.moveTo(t.dir > 0 ? 12 : -12, -13 + bob); ctx.lineTo(t.dir > 0 ? 8 : -8, -20 + bob);
      ctx.stroke();
    } else if (t.kind === 'rabbit') {
      ctx.fillStyle = '#b3a184';
      ctx.beginPath(); ctx.ellipse(0, bob, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(t.dir > 0 ? 7 : -7, -4 + bob, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect((t.dir > 0 ? 5 : -8), -13 + bob, 2, 7);
    } else { // wolf — do not shoot
      Art.wolf(ctx, { ...t, hp: 1, maxHp: 1 });
      return;
    }
    ctx.restore();
  },

  hpbar(ctx, x, y, hp, max, w, big) {
    if (max <= 1) return;
    const h = big ? 8 : 4;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#3a2c20'; ctx.fillRect(x - w / 2, y, w, h);
    const p = Math.max(0, hp / max);
    ctx.fillStyle = p > .5 ? '#7fb069' : p > .25 ? '#e8b04b' : '#d94f3d';
    ctx.fillRect(x - w / 2, y, w * p, h);
  },

  crosshair(ctx, x, y, spread) {
    ctx.save();
    ctx.strokeStyle = 'rgba(224,167,46,.9)'; ctx.lineWidth = 2;
    const g = 5 + spread;
    ctx.beginPath();
    ctx.moveTo(x - g - 9, y); ctx.lineTo(x - g, y);
    ctx.moveTo(x + g, y); ctx.lineTo(x + g + 9, y);
    ctx.moveTo(x, y - g - 9); ctx.lineTo(x, y - g);
    ctx.moveTo(x, y + g); ctx.lineTo(x, y + g + 9);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(224,167,46,.35)';
    ctx.beginPath(); ctx.arc(x, y, g + 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(224,167,46,.9)';
    ctx.fillRect(x - 1, y - 1, 2, 2);
    ctx.restore();
  },

  text(ctx, str, x, y, size, color, align) {
    ctx.save();
    ctx.font = `bold ${size}px "Rockwell", "Courier New", monospace`;
    ctx.textAlign = align || 'center';
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillText(str, x + 2, y + 2);
    ctx.fillStyle = color; ctx.fillText(str, x, y);
    ctx.restore();
  }
};

/* ---------------- Particle system ---------------- */
class Particles {
  constructor() { this.list = []; }
  burst(x, y, n, color, spd = 3, life = 30) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * spd + 0.6;
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life, max: life, color, size: Math.random() * 3 + 1.5 });
    }
  }
  float(x, y, text, color) {
    this.list.push({ x, y, vx: 0, vy: -0.9, life: 55, max: 55, text, color });
  }
  update() {
    this.list = this.list.filter(p => {
      p.x += p.vx; p.y += p.vy;
      if (!p.text) p.vy += 0.12;
      p.life--;
      return p.life > 0;
    });
  }
  draw(ctx) {
    this.list.forEach(p => {
      const a = p.life / p.max;
      ctx.save(); ctx.globalAlpha = a;
      if (p.text) Art.text(ctx, p.text, p.x, p.y, 15, p.color);
      else { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); }
      ctx.restore();
    });
  }
}

/* ==========================================================
   MINIGAME CONTROLLER
   ========================================================== */
const Mini = {
  raf: null, canvas: null, ctx: null, cfg: null, done: null,
  keys: {}, mouse: { x: 480, y: 240, down: false },
  bound: false,

  start(cfg, onDone) {
    this.canvas = document.getElementById('mgCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cfg = cfg; this.done = onDone;
    this.keys = {}; this.mouse = { x: 480, y: 240, down: false };
    this.bindOnce();

    document.getElementById('mgTitle').textContent = cfg.title;
    document.getElementById('mgFooter').textContent = cfg.instructions;

    const ov = document.getElementById('mgOverlay');
    ov.classList.remove('hide');
    ov.innerHTML = `
      <div class="mg-ov-title">${cfg.title}</div>
      <p class="mg-ov-text">${cfg.intro}</p>
      <p class="mg-ov-text" style="color:var(--gold)">${cfg.instructions}</p>
      <button class="btn btn-primary btn-big" id="mgStartBtn">BEGIN</button>`;
    document.getElementById('mgStartBtn').onclick = () => {
      ov.classList.add('hide');
      this.run();
    };
    UI.show('screen-game');
  },

  bindOnce() {
    if (this.bound) return;
    this.bound = true;
    window.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;
      if ([' ', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
    const c = document.getElementById('mgCanvas');
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (c.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (c.height / r.height);
    });
    c.addEventListener('mousedown', () => { this.mouse.down = true; this.clickFlag = true; });
    c.addEventListener('mouseup', () => { this.mouse.down = false; });
  },

  run() {
    const engines = { shooter: Shooter, dodger: Dodger, survival: Survival, repair: Repair };
    this.engine = Object.create(engines[this.cfg.kind]);
    this.engine.init(this.cfg, this.canvas, this.ctx, this);
    this.last = performance.now();
    this.loop();
  },

  loop() {
    const now = performance.now();
    const dt = Math.min(50, now - this.last) / 16.67;
    this.last = now;
    const res = this.engine.update(dt);
    this.engine.draw();
    this.clickFlag = false;
    if (res) return this.finish(res);
    this.raf = requestAnimationFrame(() => this.loop());
  },

  finish(res) {
    cancelAnimationFrame(this.raf);
    const ov = document.getElementById('mgOverlay');
    ov.classList.remove('hide');
    ov.innerHTML = `
      <div class="mg-ov-title" style="color:${res.win ? 'var(--good)' : 'var(--danger)'}">${res.title}</div>
      <p class="mg-ov-text">${res.text}</p>
      <button class="btn btn-primary btn-big" id="mgDoneBtn">CONTINUE →</button>`;
    document.getElementById('mgDoneBtn').onclick = () => this.done(res);
  },

  stats(html) { document.getElementById('mgStats').innerHTML = html; },
  stat(label, val, cls) {
    return `<div class="mg-stat"><span class="mg-stat-label">${label}</span>
            <span class="mg-stat-value ${cls || ''}">${val}</span></div>`;
  }
};

/* ==========================================================
   ENGINE: SHOOTER  (bandits / hunt / grizzly / wolves)
   ========================================================== */
const Shooter = {
  init(cfg, canvas, ctx, host) {
    Object.assign(this, { cfg, canvas, ctx, host });
    this.W = canvas.width; this.H = canvas.height;
    this.horizon = this.H * 0.55;

    this.magSize = State.has('repeater') ? 8 : 6;
    this.mag = Math.min(this.magSize, State.s.ammo);
    this.reserve = State.s.ammo - this.mag;
    this.reloading = 0;
    this.cooldown = 0;
    this.fireRate = State.has('repeater') ? 7 : 16;
    if (State.s.classId === 'hunter') this.fireRate *= 0.65;
    this.dmg = 1 + (State.has('scope') ? 1 : 0) + (State.s.classId === 'hunter' ? 1 : 0);

    this.targets = [];
    this.spawned = 0;
    this.killed = 0;
    this.meat = 0;
    this.mistakes = 0;
    this.spawnTimer = 20;
    this.time = cfg.timeLimit * 60;
    this.wagonHP = State.s.wagonHP;
    this.particles = new Particles();
    this.shake = 0;
    this.recoil = 0;

    if (cfg.skin === 'grizzly') this.spawnGrizzly();
  },

  spawnGrizzly() {
    this.targets.push({
      x: -60, y: this.horizon + 60, hp: this.cfg.bossHp, maxHp: this.cfg.bossHp,
      dir: 1, phase: 0, kind: 'grizzly', size: 40,
      state: 'charge', vx: this.cfg.targetSpeed, restTimer: 0
    });
  },

  spawn() {
    const cfg = this.cfg;
    const fromLeft = Math.random() < 0.5;
    const y = this.horizon + 20 + Math.random() * (this.H - this.horizon - 60);
    const base = { x: fromLeft ? -40 : this.W + 40, y, dir: fromLeft ? 1 : -1, phase: Math.random() * 6 };

    if (cfg.huntMode) {
      const roll = Math.random();
      let kind, hp, meat, size, spd;
      if (roll < 0.12) { kind = 'wolf'; hp = 1; meat = 0; size = 22; spd = 2.6; }
      else if (roll < 0.35) { kind = 'buffalo'; hp = 3; meat = 220; size = 40; spd = 0.9; }
      else if (roll < 0.7) { kind = 'deer'; hp = 1; meat = 70; size = 24; spd = 2.2; }
      else { kind = 'rabbit'; hp = 1; meat = 18; size = 14; spd = 3.2; }
      this.targets.push({ ...base, kind, hp, maxHp: hp, meat, size, vx: spd * base.dir });
    } else {
      this.targets.push({
        ...base, kind: cfg.skin, hp: cfg.targetHp, maxHp: cfg.targetHp,
        size: cfg.skin === 'wolf' ? 24 : 30,
        vx: cfg.targetSpeed * base.dir * (0.7 + Math.random() * 0.6),
        attackTimer: 0
      });
    }
    this.spawned++;
  },

  update(dt) {
    const cfg = this.cfg;
    this.time -= dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.recoil > 0) this.recoil -= dt * 0.5;

    // --- spawning ---
    if (cfg.skin !== 'grizzly') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.spawned < cfg.targets) {
        this.spawn();
        this.spawnTimer = cfg.spawnEvery / 10 * 6;
      }
    }

    // --- reload ---
    if (this.reloading > 0) {
      this.reloading -= dt;
      if (this.reloading <= 0) {
        const need = this.magSize - this.mag;
        const got = Math.min(need, this.reserve);
        this.mag += got; this.reserve -= got;
      }
    } else if (this.host.keys['r'] && this.mag < this.magSize && this.reserve > 0) {
      this.reloading = State.has('repeater') ? 30 : 45;
    }

    // --- firing ---
    if (this.cooldown > 0) this.cooldown -= dt;
    const wantFire = this.host.clickFlag || this.host.keys[' '];
    if (wantFire && this.cooldown <= 0 && this.reloading <= 0) {
      if (this.mag > 0) {
        this.mag--; this.cooldown = this.fireRate; this.recoil = 8;
        this.shoot(this.host.mouse.x, this.host.mouse.y);
        this.host.keys[' '] = false;
      } else if (this.reserve > 0) {
        this.reloading = State.has('repeater') ? 30 : 45;
      } else {
        this.particles.float(this.W / 2, 60, 'OUT OF AMMO!', '#d94f3d');
      }
    }

    // --- targets ---
    this.targets.forEach(t => {
      t.phase += dt * 0.15;
      if (t.kind === 'grizzly') this.updateGrizzly(t, dt);
      else {
        t.x += t.vx * dt;
        // reached the wagon side? bandits/wolves attack
        if (!cfg.huntMode) {
          const wagonX = this.W / 2;
          if (Math.abs(t.x - wagonX) < 70) {
            t.attackTimer -= dt;
            t.vx *= 0.88;
            if (t.attackTimer <= 0) {
              t.attackTimer = 60;
              let dmg = 6;
              if (State.has('hide')) dmg *= 0.5;
              this.wagonHP -= dmg;
              this.shake = 12;
              this.particles.burst(wagonX, this.horizon + 40, 8, '#d94f3d');
              this.particles.float(wagonX, this.horizon + 10, '-' + Math.round(dmg), '#d94f3d');
            }
          }
        }
      }
    });

    // offscreen cleanup
    this.targets = this.targets.filter(t => {
      if (t.kind === 'grizzly') return true;
      const out = t.x < -80 || t.x > this.W + 80;
      if (out && this.cfg.huntMode && t.kind !== 'wolf') { /* escaped, no penalty */ }
      return !out;
    });

    this.particles.update();

    // --- HUD ---
    const ammoTotal = this.mag + this.reserve;
    this.host.stats(
      Mini.stat('AMMO', `${this.mag}/${this.magSize}`, this.mag === 0 ? 'low' : '') +
      Mini.stat('RESERVE', this.reserve) +
      (this.cfg.huntMode
        ? Mini.stat('MEAT', this.meat + ' lb')
        : Mini.stat('DOWN', `${this.killed}/${this.cfg.bossHp ? (this.cfg.skin === 'grizzly' ? 1 : this.cfg.targets) : this.cfg.targets}`)) +
      Mini.stat('WAGON', Math.max(0, Math.round(this.wagonHP)), this.wagonHP < 30 ? 'low' : '') +
      Mini.stat('TIME', Math.max(0, Math.ceil(this.time / 60)) + 's', this.time < 600 ? 'low' : '')
    );

    // --- win / lose ---
    if (this.wagonHP <= 0) return this.result(false, 'THE WAGON IS WRECKED', 'They tore it apart while you were reloading. You limp on with what you could carry.');

    if (this.cfg.huntMode) {
      if (this.time <= 0 || (ammoTotal === 0 && this.targets.length === 0)) {
        return this.result(true, 'THE HUNT IS DONE', `You haul ${this.meat} lbs of meat back to the wagon.`);
      }
    } else if (this.cfg.skin === 'grizzly') {
      if (this.targets[0] && this.targets[0].hp <= 0)
        return this.result(true, 'THE GRIZZLY FALLS', 'It drops ten feet from the wagon and does not get up. Nobody says anything for a long while.');
      if (this.time <= 0)
        return this.result(false, 'IT DRIVES YOU OFF', 'You scatter into the dark and come back at dawn to a ransacked camp.');
    } else {
      if (this.killed >= this.cfg.targets)
        return this.result(true, 'THEY BREAK AND RUN', 'The survivors ride off without looking back. The trail is yours again.');
      if (this.time <= 0)
        return this.result(false, 'THEY GET WHAT THEY CAME FOR', 'You hold them off long enough to live, but they leave with a good share of your wagon.');
    }
    return null;
  },

  updateGrizzly(t, dt) {
    const wagonX = this.W / 2;
    if (t.state === 'charge') {
      t.x += t.vx * 2.2 * dt * t.dir;
      if (Math.abs(t.x - wagonX) < 80) {
        let dmg = 14;
        if (State.has('hide')) dmg *= 0.5;
        this.wagonHP -= dmg;
        this.shake = 20;
        this.particles.burst(wagonX, this.horizon + 40, 16, '#d94f3d', 5);
        this.particles.float(wagonX, this.horizon, '-' + Math.round(dmg), '#d94f3d');
        t.state = 'retreat';
      }
    } else if (t.state === 'retreat') {
      t.x -= t.vx * 2.6 * dt * t.dir;
      if (t.x < -50 || t.x > this.W + 50) {
        t.state = 'rest'; t.restTimer = 40;
        t.dir = Math.random() < 0.5 ? 1 : -1;
        t.x = t.dir > 0 ? -50 : this.W + 50;
        t.y = this.horizon + 40 + Math.random() * 60;
      }
    } else {
      t.restTimer -= dt;
      if (t.restTimer <= 0) t.state = 'charge';
    }
  },

  shoot(mx, my) {
    // spread grows if you spam
    const spread = this.cooldown > 0 ? 8 : 0;
    const hitX = mx + (Math.random() - .5) * spread;
    const hitY = my + (Math.random() - .5) * spread;
    this.particles.burst(hitX, hitY, 4, '#e8dcc0', 2, 14);

    // find topmost target under the shot
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const r = t.size;
      if (Math.abs(hitX - t.x) < r && Math.abs(hitY - t.y) < r) {
        t.hp -= this.dmg;
        this.particles.burst(hitX, hitY, 10, '#a32b1e', 3.5);
        this.shake = 5;

        if (t.hp <= 0) {
          if (this.cfg.huntMode) {
            if (t.kind === 'wolf') {
              this.mistakes++;
              this.particles.float(t.x, t.y - 20, 'NOT GAME!', '#d94f3d');
            } else {
              let m = t.meat;
              if (State.s.classId === 'hunter') m = Math.round(m * 1.5);
              this.meat += m;
              this.particles.float(t.x, t.y - 20, '+' + m + ' lb', '#7fb069');
            }
          } else {
            this.particles.float(t.x, t.y - 20, 'DOWN!', '#e0a72e');
          }
          this.killed++;
          if (t.kind !== 'grizzly') this.targets.splice(i, 1);
        } else {
          this.particles.float(t.x, t.y - 24, '-' + this.dmg, '#e8b04b');
        }
        return;
      }
    }
  },

  result(win, title, text) {
    return {
      win, title, text,
      ammoUsed: State.s.ammo - (this.mag + this.reserve),
      meat: this.meat, wagonHP: Math.max(0, Math.round(this.wagonHP)),
      mistakes: this.mistakes
    };
  },

  draw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - .5) * this.shake, (Math.random() - .5) * this.shake);

    Art.sky(ctx, W, H, this.cfg.skin);
    Art.ground(ctx, W, H, this.horizon, this.cfg.skin);

    // scenery
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    for (let i = 0; i < 8; i++) {
      const x = (i * 137) % W;
      ctx.beginPath(); ctx.ellipse(x, this.horizon + 6, 40, 7, 0, 0, Math.PI * 2); ctx.fill();
    }

    // night skins get a vignette
    if (['wolf', 'grizzly'].includes(this.cfg.skin)) {
      const g = ctx.createRadialGradient(W / 2, this.horizon + 40, 60, W / 2, this.horizon + 40, W * .7);
      g.addColorStop(0, 'rgba(224,167,46,.10)'); g.addColorStop(1, 'rgba(0,0,0,.72)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // the wagon you are defending
    if (!this.cfg.huntMode) {
      Art.wagon(ctx, W / 2, this.horizon + 40, 1.5, 0);
      Art.hpbar(ctx, W / 2, this.horizon - 22, this.wagonHP, State.s.wagonMax, 80, true);
      Art.text(ctx, 'YOUR WAGON', W / 2, this.horizon - 30, 10, '#d9c7a3');
    }

    // targets
    this.targets.forEach(t => {
      if (this.cfg.huntMode) Art.game(ctx, t);
      else if (t.kind === 'grizzly') Art.grizzly(ctx, t);
      else if (t.kind === 'wolf') Art.wolf(ctx, t);
      else Art.bandit(ctx, t);
    });

    this.particles.draw(ctx);
    ctx.restore();

    // reload indicator
    if (this.reloading > 0) {
      const p = 1 - this.reloading / (State.has('repeater') ? 30 : 45);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(W / 2 - 80, H - 46, 160, 20);
      ctx.fillStyle = '#e0a72e'; ctx.fillRect(W / 2 - 78, H - 44, 156 * p, 16);
      Art.text(ctx, 'RELOADING', W / 2, H - 31, 12, '#14100d');
    } else if (this.mag === 0) {
      Art.text(ctx, this.reserve > 0 ? 'PRESS  R  TO RELOAD' : 'NO AMMO LEFT', W / 2, H - 30, 15,
        this.reserve > 0 ? '#e0a72e' : '#d94f3d');
    }

    // crosshair
    Art.crosshair(ctx, this.host.mouse.x, this.host.mouse.y + this.recoil, this.cooldown > 0 ? 5 : 0);
  }
};

/* ==========================================================
   ENGINE: DODGER  (rivers / stampede / dust / descent / rapids)
   ========================================================== */
const Dodger = {
  init(cfg, canvas, ctx, host) {
    Object.assign(this, { cfg, canvas, ctx, host });
    this.W = canvas.width; this.H = canvas.height;
    this.x = this.W / 2;
    this.vx = 0;
    this.drift = 0;
    this.hazards = [];
    this.scroll = 0;
    this.timer = cfg.duration * 60;
    this.total = this.timer;
    this.wagonHP = State.s.wagonHP;
    this.hits = 0;
    this.spawnTimer = 30;
    this.particles = new Particles();
    this.shake = 0;
    this.invuln = 0;
    this.lanes = [];
  },

  spawn() {
    const isWater = ['river', 'rapids'].includes(this.cfg.skin);
    const kinds = {
      river: ['rock', 'log', 'whirl'],
      rapids: ['rock', 'rock', 'log', 'whirl'],
      stampede: ['buffalo', 'buffalo', 'rock'],
      dust: ['boulder', 'tumble', 'tumble'],
      forest: ['tree', 'tree', 'stump']
    }[this.cfg.skin] || ['rock'];

    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const size = { rock: 26, log: 40, whirl: 30, buffalo: 34, boulder: 30, tumble: 18, tree: 30, stump: 20 }[kind];
    this.hazards.push({
      x: 40 + Math.random() * (this.W - 80),
      y: -50, kind, size,
      vy: this.cfg.speed * (0.85 + Math.random() * 0.4),
      vx: kind === 'buffalo' ? (Math.random() - .5) * 1.6 : 0,
      spin: Math.random() * 6
    });
  },

  update(dt) {
    const k = this.host.keys;
    const accel = 0.9, maxV = 7;

    if (k['arrowleft'] || k['a']) this.vx = Math.max(-maxV, this.vx - accel * dt);
    else if (k['arrowright'] || k['d']) this.vx = Math.min(maxV, this.vx + accel * dt);
    else this.vx *= Math.pow(0.86, dt);

    // river current shoves you around
    if (this.cfg.drift) {
      this.drift += (Math.random() - .5) * 0.09 * dt;
      this.drift = Math.max(-2.2, Math.min(2.2, this.drift));
      this.vx += this.drift * 0.08 * dt;
    }

    this.x += this.vx * dt;
    if (this.x < 30) { this.x = 30; this.vx = Math.abs(this.vx) * .4; }
    if (this.x > this.W - 30) { this.x = this.W - 30; this.vx = -Math.abs(this.vx) * .4; }

    this.scroll += this.cfg.speed * dt;
    this.timer -= dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.invuln > 0) this.invuln -= dt;

    // spawn
    this.spawnTimer -= dt * this.cfg.hazardRate;
    if (this.spawnTimer <= 0) { this.spawn(); this.spawnTimer = 22; }

    const wagonY = this.H - 80;

    this.hazards.forEach(h => {
      h.y += h.vy * dt; h.x += h.vx * dt; h.spin += dt * 0.08;
      if (h.x < 20 || h.x > this.W - 20) h.vx *= -1;

      if (this.invuln <= 0 &&
          Math.abs(h.x - this.x) < h.size * .6 + 18 &&
          Math.abs(h.y - wagonY) < h.size * .5 + 16) {
        let dmg = this.cfg.damage;
        if (State.has('ironwheels')) dmg *= 0.6;
        if (['river', 'rapids'].includes(this.cfg.skin) && State.has('raft')) dmg *= 0.6;
        this.wagonHP -= dmg;
        this.hits++;
        this.invuln = 30;
        this.shake = 16;
        this.vx = (this.x - h.x) * 0.35;
        this.particles.burst(this.x, wagonY, 14, '#d94f3d', 4);
        this.particles.float(this.x, wagonY - 30, '-' + Math.round(dmg), '#d94f3d');
        h.hit = true;
      }
    });

    this.hazards = this.hazards.filter(h => h.y < this.H + 60 && !h.hit);
    this.particles.update();

    const pct = Math.round((1 - this.timer / this.total) * 100);
    this.host.stats(
      Mini.stat('CROSSING', pct + '%') +
      Mini.stat('WAGON', Math.max(0, Math.round(this.wagonHP)), this.wagonHP < 30 ? 'low' : '') +
      Mini.stat('HITS', this.hits) +
      Mini.stat('TIME', Math.max(0, Math.ceil(this.timer / 60)) + 's')
    );

    if (this.wagonHP <= 0) {
      const T = {
        river: ['THE WAGON GOES UNDER', 'It rolls in the current and comes up on the far bank in pieces. You lose a great deal.'],
        rapids: ['THE RAFT BREAKS UP', 'The river takes the wagon and very nearly takes you with it.'],
        stampede: ['TRAMPLED', 'The herd goes over you like a brown flood. What is left barely rolls.'],
        dust: ['BURIED', 'The storm strips the canvas and cracks the frame.'],
        forest: ['WRAPPED AROUND A PINE', 'The wagon hits the tree at full speed and folds.']
      }[this.cfg.skin] || ['WRECKED', 'The wagon does not survive.'];
      return { win: false, title: T[0], text: T[1], wagonHP: 0, hits: this.hits };
    }
    if (this.timer <= 0) {
      const clean = this.hits === 0;
      const T = {
        river: ['THE FAR BANK', clean ? 'Not one scratch. The ferryman would be insulted.' : 'Wet, rattled, and across.'],
        rapids: ['YOU RIDE IT OUT', clean ? 'A flawless run through water that eats wagons. That was something to see.' : 'Battered and soaked — but through.'],
        stampede: ['THE HERD PASSES', clean ? 'You threaded ten thousand buffalo without a touch.' : 'The dust settles and you are still upright.'],
        dust: ['THE AIR CLEARS', clean ? 'You outran a dust storm clean.' : 'You come out gritty and dented.'],
        forest: ['THE GRADE LEVELS OUT', clean ? 'A perfect run down a mountain that kills wagons.' : 'Bark, splinters, and a heartbeat you can hear.']
      }[this.cfg.skin] || ['THROUGH', 'You make it.'];
      return { win: true, title: T[0], text: T[1], wagonHP: Math.max(0, Math.round(this.wagonHP)), hits: this.hits, clean };
    }
    return null;
  },

  draw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - .5) * this.shake, (Math.random() - .5) * this.shake);

    const water = ['river', 'rapids'].includes(this.cfg.skin);
    Art.sky(ctx, W, H, this.cfg.skin);

    // scrolling texture bands
    ctx.save();
    if (water) {
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2;
      for (let i = -1; i < 14; i++) {
        const y = ((i * 44 + this.scroll) % (H + 44)) - 44;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 24)
          ctx.lineTo(x, y + Math.sin((x + this.scroll) * 0.03) * 4);
        ctx.stroke();
      }
      // foam
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      for (let i = 0; i < 26; i++) {
        const x = (i * 79 + this.scroll * 0.6) % W;
        const y = (i * 53 + this.scroll * 1.4) % H;
        ctx.fillRect(x, y, 12, 3);
      }
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,.10)'; ctx.lineWidth = 3;
      for (let i = -1; i < 12; i++) {
        const y = ((i * 52 + this.scroll) % (H + 52)) - 52;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
    ctx.restore();

    // banks / edges
    ctx.fillStyle = water ? 'rgba(60,90,60,.5)' : 'rgba(0,0,0,.28)';
    ctx.fillRect(0, 0, 22, H); ctx.fillRect(W - 22, 0, 22, H);

    // hazards
    this.hazards.forEach(h => this.drawHazard(ctx, h));

    // player
    const wagonY = this.H - 80;
    ctx.save();
    if (this.invuln > 0 && Math.floor(this.invuln / 4) % 2) ctx.globalAlpha = 0.4;
    if (water) {
      // raft
      ctx.fillStyle = '#6b4c33';
      ctx.fillRect(this.x - 30, wagonY - 4, 60, 20);
      ctx.strokeStyle = '#3a2c1e'; ctx.lineWidth = 1.5;
      for (let i = -30; i < 30; i += 10) { ctx.beginPath(); ctx.moveTo(this.x + i, wagonY - 4); ctx.lineTo(this.x + i, wagonY + 16); ctx.stroke(); }
      Art.wagon(ctx, this.x, wagonY - 8, 0.85, this.vx * 0.02);
      // wake
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fillRect(this.x - 26, wagonY + 18, 52, 3);
    } else {
      Art.wagon(ctx, this.x, wagonY, 1.15, this.vx * 0.035);
      Art.ox(ctx, this.x - 6, wagonY - 26, 0.7, this.scroll * 0.2);
    }
    ctx.restore();

    // dust storm overlay
    if (this.cfg.skin === 'dust') {
      ctx.fillStyle = 'rgba(180,120,60,.22)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 131 + this.scroll * 3) % W, y = (i * 67 + this.scroll * 2) % H;
        ctx.fillRect(x, y, 30, 2);
      }
    }

    this.particles.draw(ctx);
    ctx.restore();

    // progress bar
    const p = 1 - this.timer / this.total;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(20, 14, W - 40, 12);
    ctx.fillStyle = '#e0a72e'; ctx.fillRect(21, 15, (W - 42) * p, 10);
    Art.text(ctx, 'FAR BANK', W - 46, 24, 9, '#e8dcc0');

    // wagon hp
    Art.hpbar(ctx, W / 2, H - 26, this.wagonHP, State.s.wagonMax, 200, true);
  },

  drawHazard(ctx, h) {
    ctx.save(); ctx.translate(h.x, h.y);
    switch (h.kind) {
      case 'rock': case 'boulder':
        ctx.fillStyle = '#5a5248';
        ctx.beginPath(); ctx.ellipse(0, 0, h.size * .6, h.size * .5, h.spin * .2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.14)';
        ctx.beginPath(); ctx.ellipse(-4, -4, h.size * .3, h.size * .2, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'log':
        ctx.rotate(h.spin * .1);
        ctx.fillStyle = '#6b4c33'; ctx.fillRect(-h.size * .7, -7, h.size * 1.4, 14);
        ctx.fillStyle = '#4a3524';
        ctx.beginPath(); ctx.ellipse(-h.size * .7, 0, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(h.size * .7, 0, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'whirl':
        ctx.rotate(h.spin);
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
        for (let r = 6; r < h.size; r += 7) {
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 1.5); ctx.stroke();
        }
        break;
      case 'buffalo':
        Art.game(ctx, { x: 0, y: 0, kind: 'buffalo', dir: h.vx > 0 ? 1 : -1, phase: h.spin * 4 });
        break;
      case 'tumble':
        ctx.rotate(h.spin);
        ctx.strokeStyle = '#8a7a4a'; ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * h.size * .6, Math.sin(a) * h.size * .6); ctx.stroke();
        }
        break;
      case 'tree':
        ctx.fillStyle = '#4a3524'; ctx.fillRect(-4, 0, 8, 18);
        ctx.fillStyle = '#2f4a2c';
        ctx.beginPath(); ctx.moveTo(0, -h.size); ctx.lineTo(-h.size * .6, 6); ctx.lineTo(h.size * .6, 6); ctx.fill();
        ctx.fillStyle = '#3d5c38';
        ctx.beginPath(); ctx.moveTo(0, -h.size * .7); ctx.lineTo(-h.size * .45, 0); ctx.lineTo(h.size * .45, 0); ctx.fill();
        break;
      case 'stump':
        ctx.fillStyle = '#5a4030';
        ctx.beginPath(); ctx.ellipse(0, 0, h.size * .5, h.size * .35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7a5a40';
        ctx.beginPath(); ctx.ellipse(0, -4, h.size * .45, h.size * .3, 0, 0, Math.PI * 2); ctx.fill();
        break;
    }
    ctx.restore();
  }
};

/* ==========================================================
   ENGINE: SURVIVAL  (the South Pass blizzard)
   ========================================================== */
const Survival = {
  init(cfg, canvas, ctx, host) {
    Object.assign(this, { cfg, canvas, ctx, host });
    this.W = canvas.width; this.H = canvas.height;
    this.fuel = 60;          // 0-100
    this.wood = 3;
    this.timer = cfg.duration * 60;
    this.total = this.timer;
    this.logs = [];          // falling wood to click
    this.flakes = [];
    this.spawnTimer = 40;
    this.gust = 0;
    this.gustTimer = 180;
    this.partyDmg = 0;
    this.particles = new Particles();
    this.fireX = this.W / 2; this.fireY = this.H - 110;

    for (let i = 0; i < 140; i++)
      this.flakes.push({ x: Math.random() * this.W, y: Math.random() * this.H, s: Math.random() * 2 + 1, v: Math.random() * 2 + 1 });
  },

  update(dt) {
    this.timer -= dt;

    // gusts
    this.gustTimer -= dt;
    if (this.gustTimer <= 0) {
      this.gust = 120 + Math.random() * 90;
      this.gustTimer = 240 + Math.random() * 220;
      this.particles.float(this.W / 2, 90, 'GUST!', '#7d8d9c');
    }
    if (this.gust > 0) this.gust -= dt;

    // fuel burn
    const burn = (0.16 + (this.gust > 0 ? 0.34 : 0)) * dt;
    this.fuel = Math.max(0, this.fuel - burn);

    // freezing
    if (this.fuel <= 0) {
      this.partyDmg += 0.035 * dt;
      if (Math.random() < 0.02) this.particles.float(this.W / 2, 140, 'FREEZING!', '#d94f3d');
    }

    // spawn wood
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.logs.length < 4) {
      this.logs.push({
        x: 60 + Math.random() * (this.W - 120), y: -30,
        vy: 1.4 + Math.random() * 1.1, spin: Math.random() * 6
      });
      this.spawnTimer = 70 + Math.random() * 60;
    }

    this.logs.forEach(l => { l.y += l.vy * dt; l.spin += dt * 0.05; });
    this.logs = this.logs.filter(l => l.y < this.H + 40 && !l.taken);

    // clicks
    if (this.host.clickFlag) {
      const mx = this.host.mouse.x, my = this.host.mouse.y;
      let grabbed = false;
      for (const l of this.logs) {
        if (Math.abs(mx - l.x) < 30 && Math.abs(my - l.y) < 22) {
          l.taken = true; this.wood++; grabbed = true;
          this.particles.float(l.x, l.y, '+1 WOOD', '#7fb069');
          break;
        }
      }
      if (!grabbed && Math.abs(mx - this.fireX) < 70 && Math.abs(my - this.fireY) < 70) {
        if (this.wood > 0) {
          this.wood--;
          this.fuel = Math.min(100, this.fuel + 22);
          this.particles.burst(this.fireX, this.fireY, 14, '#e8763a', 3);
          this.particles.float(this.fireX, this.fireY - 50, 'FIRE UP!', '#e0a72e');
        } else {
          this.particles.float(this.fireX, this.fireY - 50, 'NO WOOD!', '#d94f3d');
        }
      }
    }

    // snow
    this.flakes.forEach(f => {
      f.y += f.v * dt; f.x += (this.gust > 0 ? 3.2 : 0.7) * dt;
      if (f.y > this.H) { f.y = -5; f.x = Math.random() * this.W; }
      if (f.x > this.W) f.x = 0;
    });

    this.particles.update();

    this.host.stats(
      Mini.stat('FIRE', Math.round(this.fuel) + '%', this.fuel < 25 ? 'low' : this.fuel < 50 ? 'mid' : '') +
      Mini.stat('WOOD', this.wood, this.wood === 0 ? 'low' : '') +
      Mini.stat('DAWN IN', Math.max(0, Math.ceil(this.timer / 60)) + 's') +
      Mini.stat('FROSTBITE', Math.round(this.partyDmg), this.partyDmg > 20 ? 'low' : '')
    );

    if (this.partyDmg >= 45)
      return { win: false, title: 'THE COLD WINS', text: 'The fire dies at three in the morning and the pass does what the pass does. Everyone who lives will remember this night.', partyDmg: Math.round(this.partyDmg) };
    if (this.timer <= 0)
      return {
        win: true, title: 'DAWN AT SOUTH PASS',
        text: this.partyDmg < 6
          ? 'The fire never once went out. The sun comes up on five people who are cold, alive, and standing on the Continental Divide.'
          : 'The sun finally clears the ridge. You are through the worst of it — frostbitten, but through.',
        partyDmg: Math.round(this.partyDmg)
      };
    return null;
  },

  draw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    Art.sky(ctx, W, H, 'blizzard');
    Art.ground(ctx, W, H, H - 70, 'blizzard');

    // mountains
    ctx.fillStyle = 'rgba(70,86,103,.7)';
    ctx.beginPath(); ctx.moveTo(0, H - 70);
    for (let x = 0; x <= W; x += 60) ctx.lineTo(x, H - 130 - Math.sin(x * 0.01) * 60 - (x % 180 === 0 ? 40 : 0));
    ctx.lineTo(W, H - 70); ctx.fill();

    // wagon in the snow
    Art.wagon(ctx, W - 170, H - 80, 1.2, 0.05);

    // party huddled in an arc around the fire, wrapped in blankets
    const alive = State.living();
    alive.forEach((p, i) => {
      // spread them across the lower arc, skipping the front so the fire stays clear
      const t = alive.length === 1 ? 0.5 : i / (alive.length - 1);
      const ang = Math.PI * (0.72 + t * 1.56);          // 130° → 410°
      const px = this.fireX + Math.cos(ang) * 104;
      const py = this.fireY - 14 + Math.sin(ang) * 34;
      const warm = this.fuel > 10;
      ctx.save(); ctx.translate(px, py);
      // blanket / body
      ctx.fillStyle = warm ? '#5a4030' : '#3f4a56';
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(-9, 12); ctx.lineTo(9, 12); ctx.closePath(); ctx.fill();
      // head
      ctx.fillStyle = warm ? '#c99a6a' : '#8a97a4';
      ctx.beginPath(); ctx.arc(0, -15, 5, 0, Math.PI * 2); ctx.fill();
      // hood
      ctx.fillStyle = warm ? '#4a3524' : '#333d47';
      ctx.beginPath(); ctx.arc(0, -16, 5.6, Math.PI, 0); ctx.fill();
      // firelight on the side facing the flames
      if (warm) {
        ctx.fillStyle = 'rgba(232,167,58,.30)';
        ctx.beginPath(); ctx.arc(0, -15, 5, 0, Math.PI * 2); ctx.fill();
      } else if (Math.floor(performance.now() / 400) % 2) {
        Art.text(ctx, '🥶', 0, -26, 12, '#cfe0ee');
      }
      ctx.restore();
    });

    // the fire
    const size = this.fuel / 100;
    if (this.fuel > 0) {
      const t = performance.now() / 100;
      for (let i = 0; i < 5; i++) {
        const h = (28 + Math.sin(t + i) * 9) * (0.45 + size);
        const w = (18 - i * 2) * (0.5 + size);
        ctx.fillStyle = ['#e8763a', '#e0a72e', '#f2d06b', '#c0561f', '#e8b04b'][i];
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(this.fireX - w / 2 + Math.sin(t * 2 + i) * 3, this.fireY);
        ctx.quadraticCurveTo(this.fireX, this.fireY - h - i * 5, this.fireX + w / 2 + Math.sin(t * 2 + i) * 3, this.fireY);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const g = ctx.createRadialGradient(this.fireX, this.fireY - 20, 8, this.fireX, this.fireY - 20, 150 * (0.4 + size));
      g.addColorStop(0, 'rgba(232,167,58,.30)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else {
      Art.text(ctx, '💀 THE FIRE IS OUT', this.fireX, this.fireY - 40, 18, '#d94f3d');
    }
    // logs in the fire
    ctx.fillStyle = '#3a2c1e';
    ctx.fillRect(this.fireX - 26, this.fireY, 52, 8);
    ctx.fillRect(this.fireX - 18, this.fireY + 6, 36, 6);

    // fire click ring
    ctx.strokeStyle = 'rgba(224,167,46,.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(this.fireX, this.fireY - 10, 64, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    Art.text(ctx, 'CLICK TO FEED', this.fireX, this.fireY + 46, 11, '#e0a72e');

    // falling wood
    this.logs.forEach(l => {
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.spin);
      ctx.fillStyle = '#6b4c33'; ctx.fillRect(-20, -6, 40, 12);
      ctx.fillStyle = '#8a6a4a'; ctx.fillRect(-20, -6, 40, 3);
      ctx.restore();
      ctx.strokeStyle = 'rgba(127,176,105,.6)'; ctx.lineWidth = 2;
      ctx.strokeRect(l.x - 26, l.y - 14, 52, 28);
    });

    // snow
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    this.flakes.forEach(f => ctx.fillRect(f.x, f.y, f.s, f.s));

    // fuel meter
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(20, 14, W - 40, 16);
    const p = this.fuel / 100;
    ctx.fillStyle = p > .5 ? '#e8763a' : p > .25 ? '#e8b04b' : '#d94f3d';
    ctx.fillRect(21, 15, (W - 42) * p, 14);
    Art.text(ctx, 'FIRE', 44, 26, 10, '#14100d');

    if (this.gust > 0) {
      ctx.fillStyle = 'rgba(200,220,240,.14)'; ctx.fillRect(0, 0, W, H);
      Art.text(ctx, '❄ WIND GUST — THE FIRE IS BURNING FAST ❄', W / 2, 58, 15, '#e8f0f6');
    }
    this.particles.draw(ctx);
  }
};

/* ==========================================================
   ENGINE: REPAIR  (timing bar)
   ========================================================== */
const Repair = {
  init(cfg, canvas, ctx, host) {
    Object.assign(this, { cfg, canvas, ctx, host });
    this.W = canvas.width; this.H = canvas.height;
    this.round = 0; this.hits = 0; this.misses = 0;
    this.pos = 0; this.dir = 1;
    this.speed = 1.5;
    this.zoneW = State.s.classId === 'carpenter' ? 0.20 : 0.14;
    this.zoneAt = 0.5;
    this.locked = 0;
    this.particles = new Particles();
    this.shake = 0;
    this.newRound();
  },

  newRound() {
    this.zoneAt = 0.22 + Math.random() * 0.56;
    this.speed = 1.4 + this.round * 0.28;
    this.pos = 0; this.dir = 1;
  },

  update(dt) {
    if (this.shake > 0) this.shake -= dt;
    if (this.locked > 0) {
      this.locked -= dt;
      if (this.locked <= 0) {
        this.round++;
        if (this.round >= this.cfg.rounds || this.misses >= 3) return this.finish();
        this.newRound();
      }
      this.particles.update();
      return null;
    }

    this.pos += this.dir * this.speed * 0.011 * dt;
    if (this.pos > 1) { this.pos = 1; this.dir = -1; }
    if (this.pos < 0) { this.pos = 0; this.dir = 1; }

    if (this.host.clickFlag || this.host.keys[' ']) {
      this.host.keys[' '] = false;
      const inZone = Math.abs(this.pos - this.zoneAt) < this.zoneW / 2;
      const perfect = Math.abs(this.pos - this.zoneAt) < this.zoneW / 6;
      if (inZone) {
        this.hits++;
        this.shake = 8;
        this.particles.burst(this.W / 2, this.H / 2 + 40, 16, '#e0a72e', 4);
        this.particles.float(this.W / 2, this.H / 2 - 20, perfect ? 'PERFECT!' : 'SOLID HIT', perfect ? '#e0a72e' : '#7fb069');
        if (perfect) this.hits += 0.5;
      } else {
        this.misses++;
        this.shake = 14;
        this.particles.burst(this.W / 2, this.H / 2 + 40, 10, '#d94f3d', 3);
        this.particles.float(this.W / 2, this.H / 2 - 20, 'MISS!', '#d94f3d');
      }
      this.locked = 34;
    }

    this.particles.update();
    this.host.stats(
      Mini.stat('STRIKE', `${this.round + 1}/${this.cfg.rounds}`) +
      Mini.stat('GOOD', Math.floor(this.hits), '') +
      Mini.stat('MISSED', this.misses, this.misses >= 2 ? 'low' : '')
    );
    return null;
  },

  finish() {
    const good = Math.floor(this.hits);
    if (this.misses >= 3)
      return { win: false, title: 'YOU BUTCHER IT', text: 'Split wood, bent iron, and a wagon that will never sit right again. Parts wasted.', hits: good, misses: this.misses };
    if (good >= this.cfg.rounds - 1)
      return { win: true, title: 'GOOD AS NEW', text: 'Straight, true, and tight. You could sell this wagon in Oregon City.', hits: good, misses: this.misses, clean: true };
    return { win: true, title: 'IT WILL HOLD', text: 'Not pretty. Not straight. But it rolls, and rolling is the whole job.', hits: good, misses: this.misses };
  },

  draw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - .5) * this.shake, (Math.random() - .5) * this.shake);

    Art.sky(ctx, W, H, 'repair');
    Art.ground(ctx, W, H, H - 90, 'repair');

    // campfire glow
    const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 380);
    g.addColorStop(0, 'rgba(224,167,46,.18)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // broken wagon, tipped
    Art.wagon(ctx, W / 2, H / 2 + 30, 2.4, 0.22);
    ctx.strokeStyle = '#d94f3d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2 - 40, H / 2 + 62); ctx.lineTo(W / 2 + 30, H / 2 + 74); ctx.stroke();

    Art.text(ctx, 'STRIKE WHEN THE MARKER HITS THE GOLD', W / 2, 60, 16, '#e0a72e');

    // timing bar
    const bx = 120, bw = W - 240, by = H - 70, bh = 30;
    ctx.fillStyle = '#1a1410'; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#6b4c33'; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);

    // gold zone
    const zx = bx + (this.zoneAt - this.zoneW / 2) * bw;
    const zw = this.zoneW * bw;
    const zg = ctx.createLinearGradient(zx, 0, zx + zw, 0);
    zg.addColorStop(0, '#8a6a1e'); zg.addColorStop(.5, '#e0a72e'); zg.addColorStop(1, '#8a6a1e');
    ctx.fillStyle = zg; ctx.fillRect(zx, by, zw, bh);
    // perfect core
    ctx.fillStyle = '#f2eadb';
    ctx.fillRect(bx + (this.zoneAt - this.zoneW / 6) * bw, by, (this.zoneW / 3) * bw, bh);

    // marker
    const mx = bx + this.pos * bw;
    ctx.fillStyle = '#d94f3d';
    ctx.fillRect(mx - 3, by - 8, 6, bh + 16);
    ctx.beginPath(); ctx.moveTo(mx - 9, by - 8); ctx.lineTo(mx + 9, by - 8); ctx.lineTo(mx, by + 4); ctx.fill();

    // hammer
    if (this.locked > 20) {
      ctx.save();
      ctx.translate(W / 2 + 60, H / 2 - 20);
      ctx.rotate(-0.5);
      ctx.fillStyle = '#6b4c33'; ctx.fillRect(-4, 0, 8, 60);
      ctx.fillStyle = '#5a5248'; ctx.fillRect(-18, -14, 36, 20);
      ctx.restore();
    }

    this.particles.draw(ctx);
    ctx.restore();
  }
};

/* ==========================================================
   TRAIL SCENE  (the idle/travel canvas)
   ========================================================== */
const TrailScene = {
  raf: null, scroll: 0, running: false, moving: false,

  start() {
    this.canvas = document.getElementById('trailCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.running = true;
    this.loop();
  },
  stop() { this.running = false; cancelAnimationFrame(this.raf); },

  loop() {
    if (!this.running) return;
    if (this.moving) this.scroll += 2.2;
    this.draw();
    this.raf = requestAnimationFrame(() => this.loop());
  },

  draw() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    const terrain = State.s ? State.level().terrain : 'prairie';
    const horizon = H * 0.6;

    Art.sky(ctx, W, H, terrain);

    // sun
    const sg = ctx.createRadialGradient(W * 0.8, 50, 6, W * 0.8, 50, 80);
    sg.addColorStop(0, 'rgba(255,240,190,.85)');
    sg.addColorStop(.35, 'rgba(255,208,110,.35)');
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W * 0.8, 50, 80, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,244,206,.92)';
    ctx.beginPath(); ctx.arc(W * 0.8, 50, 24, 0, Math.PI * 2); ctx.fill();

    // far mountains
    ctx.fillStyle = 'rgba(60,70,88,.42)';
    ctx.beginPath(); ctx.moveTo(0, horizon);
    for (let x = 0; x <= W; x += 40) {
      const h = 40 + Math.sin((x + this.scroll * 0.06) * 0.008) * 28 + Math.sin(x * 0.021) * 16;
      ctx.lineTo(x, horizon - h);
    }
    ctx.lineTo(W, horizon); ctx.fill();

    // mid hills
    ctx.fillStyle = 'rgba(70,90,70,.5)';
    ctx.beginPath(); ctx.moveTo(0, horizon);
    for (let x = 0; x <= W; x += 30) {
      const h = 18 + Math.sin((x + this.scroll * 0.2) * 0.014) * 14;
      ctx.lineTo(x, horizon - h);
    }
    ctx.lineTo(W, horizon); ctx.fill();

    Art.ground(ctx, W, H, horizon, terrain);

    // trail ruts
    ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 5;
    [horizon + 42, horizon + 56].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); });

    // scenery scrolling by
    const props = { prairie: '🌾', plains: '🌾', rock: '🪨', mountain: '🗻', canyon: '🪨', forest: '🌲', river: '🌊' }[terrain] || '🌿';
    ctx.font = '22px serif'; ctx.textAlign = 'center';
    for (let i = 0; i < 14; i++) {
      const x = ((i * 90 - this.scroll) % (W + 90) + W + 90) % (W + 90) - 45;
      const y = horizon + 12 + ((i * 37) % 40);
      ctx.globalAlpha = 0.55;
      ctx.fillText(props, x, y);
    }
    ctx.globalAlpha = 1;

    // the wagon
    const bounce = this.moving ? Math.sin(this.scroll * 0.1) * 1.8 : 0;
    const wagonX = W * 0.32;
    const wagonY = horizon + 48 + bounce;
    // ox team: yoked in pairs ahead of the wagon, back row drawn first so it sits behind
    const oxen = State.s ? State.s.oxen : 4;
    const pairs = Math.min(3, Math.ceil(Math.min(oxen, 6) / 2));
    for (let row = pairs - 1; row >= 0; row--) {
      for (let col = 0; col < 2 && row * 2 + col < Math.min(oxen, 6); col++) {
        Art.ox(ctx,
          wagonX + 46 + row * 30,
          wagonY - 2 + col * 13,
          0.95,
          this.scroll * 0.12 + row + col * 2);
      }
    }
    // tongue from wagon to the team
    ctx.strokeStyle = '#4a3524'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wagonX + 20, wagonY + 6);
    ctx.lineTo(wagonX + 46 + (pairs - 1) * 30, wagonY + 6); ctx.stroke();
    Art.wagon(ctx, wagonX, wagonY, 1.5, this.moving ? Math.sin(this.scroll * 0.07) * 0.02 : 0);

    // dog
    if (State.s && State.has('dog')) {
      const dx = wagonX - 40 + Math.sin(this.scroll * 0.04) * 12;
      ctx.font = '18px serif';
      ctx.fillText('🐕', dx, wagonY + 12);
    }

    // dust behind wheels
    if (this.moving) {
      ctx.fillStyle = 'rgba(217,199,163,.28)';
      for (let i = 0; i < 5; i++) {
        const px = wagonX - 22 - i * 9 - (this.scroll % 12);
        ctx.beginPath(); ctx.arc(px, wagonY + 12, 5 - i * 0.7, 0, Math.PI * 2); ctx.fill();
      }
    }

    // vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, W * .7);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(10,8,5,.45)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
};
