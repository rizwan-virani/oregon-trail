/* ==========================================================
   Oregon Trail: Unbroken — STATE
   The save file, the party, the resources, the rules of survival.
   ========================================================== */

const SAVE_KEY = 'otu.save.v1';
const HALL_KEY = 'otu.hall.v1';

const State = {
  s: null,

  /* ---------- Lifecycle ---------- */
  create(classId, names) {
    const cls = DATA.CLASSES.find(c => c.id === classId);
    this.s = {
      classId,
      scoreMult: cls.scoreMult,
      money: cls.money,
      spent: 0,

      food: 0, ammo: 0, parts: 0, meds: 0, oxen: 4, clothes: 0,
      upgrades: [],

      wagonHP: 100,
      wagonMax: classId === 'carpenter' ? 125 : 100,

      party: names.map((n, i) => ({
        name: n.trim() || 'Traveler ' + (i + 1),
        hp: 100, alive: true, cond: 'Healthy', leader: i === 0
      })),

      level: 0,          // index into DATA.LEVELS
      legMiles: 0,       // miles into current leg
      totalMiles: 0,
      day: 1,
      month: 4,          // April departure
      pace: 1,           // 0 steady, 1 strenuous, 2 grueling
      rations: 1,        // 0 filling, 1 meager, 2 bare bones
      luck: 0,

      phase: 'shop',     // shop | trail | challenge | done
      seenEvents: [],
      log: [],
      stats: { hunted: 0, bossesBeaten: 0, eventsFaced: 0, milesRun: 0 }
    };
    this.save();
    return this.s;
  },

  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.s)); } catch (e) {} },
  load() { try { const r = localStorage.getItem(SAVE_KEY); if (!r) return false; this.s = JSON.parse(r); return true; } catch (e) { return false; } },
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } },
  clear() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} this.s = null; },

  /* ---------- Helpers ---------- */
  has(u) { return this.s.upgrades.includes(u); },
  level() { return DATA.LEVELS[this.s.level]; },
  living() { return this.s.party.filter(p => p.alive); },
  leader() { return this.s.party.find(p => p.leader) || this.s.party[0]; },

  add(stat, n) {
    const s = this.s;
    if (stat === 'wagonHP') s.wagonHP = Math.max(0, Math.min(s.wagonMax, s.wagonHP + n));
    else if (stat === 'money') s.money = Math.max(0, s.money + n);
    else s[stat] = Math.max(0, (s[stat] || 0) + n);
  },

  log(text, kind) {
    this.s.log.unshift({ text, kind: kind || '', day: this.s.day });
    if (this.s.log.length > 60) this.s.log.pop();
    UI.renderLog();
  },

  /* ---------- Date ---------- */
  dateString() {
    const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const dayOfMonth = ((this.s.day - 1) % 30) + 1;
    const m = 4 + Math.floor((this.s.day - 1) / 30);
    return `${MONTHS[Math.min(m, 12)]} ${dayOfMonth}`;
  },

  // Winter closes in. After ~day 210 the mountains are shut.
  winterPressure() { return Math.max(0, (this.s.day - 150) / 60); },

  /* ---------- Party ---------- */
  hurt(n, amount, reason) {
    const alive = this.living();
    if (!alive.length) return;
    const picks = this.shuffle(alive).slice(0, n);
    picks.forEach(p => {
      p.hp = Math.max(0, p.hp - amount);
      this.updateCond(p);
      if (p.hp <= 0 && p.alive) this.kill(p, reason);
    });
  },

  heal(n, amount) {
    const alive = this.living();
    const mult = this.s.classId === 'doc' ? 2 : 1;
    this.shuffle(alive).slice(0, n).forEach(p => {
      p.hp = Math.min(100, p.hp + amount * (amount > 0 ? mult : 1));
      this.updateCond(p);
    });
  },

  kill(p, reason) {
    p.alive = false; p.hp = 0; p.cond = 'Dead';
    this.log(`💀 ${p.name} has died${reason ? ' — ' + reason : ''}.`, 'bad');
    UI.toast(`💀 ${p.name} has died`);
  },

  updateCond(p) {
    if (!p.alive) { p.cond = 'Dead'; return; }
    if (p.hp > 80) p.cond = 'Healthy';
    else if (p.hp > 60) p.cond = 'Tired';
    else if (p.hp > 40) p.cond = 'Poorly';
    else if (p.hp > 20) p.cond = 'Bad off';
    else p.cond = 'Near death';
  },

  /* ---------- Daily tick ---------- */
  // Returns { event: bool } — whether an event should fire.
  advanceDay() {
    const s = this.s;
    s.day++;

    // --- Food consumption ---
    const rationRate = [3.5, 2.2, 1.2][s.rations];
    const eat = Math.round(this.living().length * rationRate);
    if (s.food >= eat) {
      this.add('food', -eat);
    } else {
      s.food = 0;
      this.hurt(this.living().length, 9, 'starvation');
      this.log('The food is gone. Everyone is starving.', 'bad');
    }

    // --- Rations health effect ---
    if (s.rations === 0 && s.food > 0) this.heal(2, 4);
    if (s.rations === 2) this.hurt(1, 3);

    // --- Pace health effect ---
    if (s.pace === 2) this.hurt(1, 4);
    if (s.pace === 0) this.heal(1, 3);

    // --- Medicine chest passive ---
    if (this.has('chest')) this.heal(2, 3);

    // --- Cold ---
    const cold = this.level().terrain === 'mountain' || this.winterPressure() > 0.5;
    if (cold && s.clothes < this.living().length) {
      this.hurt(1, 5, 'exposure');
      if (Math.random() < 0.3) this.log('Not enough warm clothes. The cold is taking a toll.', 'warn');
    }

    // --- Sickness ---
    let sickChance = 0.05 + this.winterPressure() * 0.04;
    if (s.classId === 'doc') sickChance *= 0.5;
    if (this.has('chest')) sickChance *= 0.5;
    if (s.rations === 2) sickChance *= 1.6;
    if (Math.random() < sickChance) {
      const victim = this.shuffle(this.living())[0];
      if (victim) {
        const ill = ['dysentery', 'a fever', 'cholera', 'measles', 'a broken arm', 'exhaustion'][Math.floor(Math.random() * 6)];
        const dmg = ill === 'cholera' ? 30 : 18;
        victim.hp = Math.max(0, victim.hp - dmg);
        this.updateCond(victim);
        this.log(`${victim.name} has come down with ${ill}.`, 'bad');
        UI.toast(`🤒 ${victim.name}: ${ill}`);
        if (victim.hp <= 0) this.kill(victim, ill);
      }
    }

    // --- Wagon wear ---
    let breakChance = 0.04;
    if (this.has('axle')) breakChance *= 0.4;
    if (['mountain', 'canyon', 'rock'].includes(this.level().terrain)) breakChance *= 1.6;
    if (s.pace === 2) breakChance *= 1.5;
    if (Math.random() < breakChance) {
      const dmg = this.wagonDamage(10 + Math.random() * 10);
      s.wagonHP = Math.max(0, s.wagonHP - dmg);
      this.log('Something on the wagon gives out. Damage taken.', 'warn');
    }

    // --- Dog finds food ---
    if (this.has('dog') && Math.random() < 0.12) {
      const meat = 12 + Math.floor(Math.random() * 18);
      this.add('food', meat);
      this.log(`🐕 Bandit drags a rabbit into camp. +${meat} lbs food.`, 'good');
    }

    // --- Miles ---
    const miles = this.milesPerDay();
    s.legMiles += miles;
    s.totalMiles += miles;
    s.stats.milesRun += miles;

    // --- Wagon destroyed ---
    if (s.wagonHP <= 0) {
      this.log('The wagon has broken beyond repair.', 'bad');
      return { dead: true, reason: 'wagon' };
    }
    if (!this.living().length) return { dead: true, reason: 'party' };

    // --- Event roll ---
    let evChance = 0.16;
    if (this.has('compass')) evChance *= 0.9;
    if (this.has('dog')) evChance *= 0.92;
    return { event: Math.random() < evChance, miles };
  },

  milesPerDay() {
    const s = this.s;
    let base = [14, 18, 23][s.pace];
    base *= Math.min(1, s.oxen / 4) * 0.5 + 0.5;      // oxen matter, but never fully stop you
    base *= 0.6 + 0.4 * (s.wagonHP / s.wagonMax);      // a beat-up wagon is slow
    if (this.has('yoke')) base *= 1.25;
    if (this.has('lantern')) base *= 1.10;
    const terrainMult = { prairie: 1.1, plains: 1.0, rock: .9, mountain: .72, canyon: .82, forest: .78, river: 1.0 };
    base *= terrainMult[this.level().terrain] || 1;
    // sick party slows you
    const avgHp = this.living().reduce((a, p) => a + p.hp, 0) / Math.max(1, this.living().length);
    base *= 0.65 + 0.35 * (avgHp / 100);
    return Math.max(3, Math.round(base + (Math.random() * 4 - 2)));
  },

  wagonDamage(raw) {
    let d = raw;
    if (this.has('ironwheels')) d *= 0.6;
    return Math.round(d);
  },

  /* ---------- Events ---------- */
  drawEvent() {
    const s = this.s;
    let pool = DATA.EVENTS.filter(e => !s.seenEvents.includes(e.id));
    if (pool.length < 4) { s.seenEvents = []; pool = DATA.EVENTS; }
    // Luck nudges you toward or away from good events
    const ev = pool[Math.floor(Math.random() * pool.length)];
    s.seenEvents.push(ev.id);
    s.stats.eventsFaced++;
    return ev;
  },

  applyOutcome(o) {
    const lines = [];
    const e = o.effects || {};

    for (const k in e) {
      const v = e[k];
      if (!v) continue;
      if (k === 'days') { this.s.day += v; lines.push({ t: `${v} day${v > 1 ? 's' : ''} lost`, good: false }); continue; }
      if (k === 'miles') {
        this.s.legMiles += v; this.s.totalMiles += v;
        lines.push({ t: `${v > 0 ? '+' : ''}${v} miles`, good: v > 0 });
        continue;
      }
      if (k === 'wagonHP') {
        this.add('wagonHP', v);
        lines.push({ t: `Wagon ${v > 0 ? '+' : ''}${v}`, good: v > 0 });
        continue;
      }
      this.add(k, v);
      const LABEL = { food: 'lbs food', ammo: 'ammo', parts: 'parts', meds: 'medicine', money: '$', oxen: 'oxen', clothes: 'clothes' };
      lines.push({ t: `${v > 0 ? '+' : ''}${v} ${LABEL[k] || k}`, good: v > 0 });
    }

    if (o.hurt && Math.random() < (o.hurt.chance ?? 1)) {
      this.hurt(o.hurt.n, o.hurt.amount, 'an accident');
      lines.push({ t: `${o.hurt.n} hurt`, good: false });
    }
    if (o.heal) {
      this.heal(o.heal.n, o.heal.amount);
      if (o.heal.amount > 0) lines.push({ t: 'The party recovers', good: true });
    }
    if (o.luck) { this.s.luck += o.luck; }

    return lines;
  },

  canAfford(req) {
    if (!req) return true;
    for (const k in req) if ((this.s[k] || 0) < req[k]) return false;
    return true;
  },

  /* ---------- Score ---------- */
  score() {
    const s = this.s;
    const survivors = this.living().length;
    const rows = [];
    let total = 0;

    const perPerson = 300;
    rows.push({ label: `${survivors} survivor${survivors === 1 ? '' : 's'} × ${perPerson}`, val: survivors * perPerson });
    total += survivors * perPerson;

    const healthBonus = this.living().reduce((a, p) => a + Math.round(p.hp / 2), 0);
    rows.push({ label: 'Health of survivors', val: healthBonus }); total += healthBonus;

    rows.push({ label: `Wagon condition (${s.wagonHP}/${s.wagonMax})`, val: s.wagonHP * 2 }); total += s.wagonHP * 2;
    rows.push({ label: `${s.oxen} oxen × 25`, val: s.oxen * 25 }); total += s.oxen * 25;
    rows.push({ label: `Supplies hauled in`, val: Math.round(s.food / 5 + s.ammo * 2 + s.parts * 12 + s.meds * 12) });
    total += Math.round(s.food / 5 + s.ammo * 2 + s.parts * 12 + s.meds * 12);
    rows.push({ label: 'Cash on hand', val: Math.round(s.money / 2) }); total += Math.round(s.money / 2);
    rows.push({ label: `${s.stats.bossesBeaten} bosses beaten × 150`, val: s.stats.bossesBeaten * 150 });
    total += s.stats.bossesBeaten * 150;

    const dayBonus = Math.max(0, 250 - s.day) * 3;
    if (dayBonus) { rows.push({ label: `Arrived day ${s.day} — speed bonus`, val: dayBonus }); total += dayBonus; }

    const cls = DATA.CLASSES.find(c => c.id === s.classId);
    rows.push({ label: `${cls.name} multiplier`, val: `×${cls.scoreMult}`, mult: true });
    total *= cls.scoreMult;

    return { rows, total: Math.round(total) };
  },

  /* ---------- Hall of Legends ---------- */
  hall() { try { return JSON.parse(localStorage.getItem(HALL_KEY)) || []; } catch (e) { return []; } },
  recordScore(total, won) {
    const list = this.hall();
    const cls = DATA.CLASSES.find(c => c.id === this.s.classId);
    list.push({
      name: this.leader().name, cls: cls.name, emoji: cls.emoji,
      score: total, won, survivors: this.living().length,
      miles: Math.round(this.s.totalMiles), day: this.s.day
    });
    list.sort((a, b) => b.score - a.score);
    try { localStorage.setItem(HALL_KEY, JSON.stringify(list.slice(0, 12))); } catch (e) {}
  },
  clearHall() { try { localStorage.removeItem(HALL_KEY); } catch (e) {} },

  /* ---------- Util ---------- */
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  randomNames() {
    return State.shuffle(DATA.FIRST_NAMES).slice(0, 5);
  }
};
