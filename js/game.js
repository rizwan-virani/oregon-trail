/* ==========================================================
   Oregon Trail: Unbroken — GAME CONTROLLER
   Boots the app and drives the loop: trail → event → challenge → fort.
   ========================================================== */

const Game = {
  traveling: false,
  tick: null,
  pendingNames: null,
  pendingClass: null,

  /* ---------------- Boot ---------------- */
  boot() {
    // Global click routing for [data-action]
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const a = el.dataset.action;
      const fn = {
        'new-game': () => this.newGame(),
        'continue-game': () => this.continueGame(),
        'show-help': () => UI.show('screen-help'),
        'show-hall': () => { UI.renderHall(); UI.show('screen-hall'); },
        'clear-hall': () => { State.clearHall(); UI.renderHall(); UI.toast('Records cleared'); },
        'back-title': () => this.toTitle(),
        'reroll-names': () => UI.renderPartyInputs(State.randomNames()),
        'party-done': () => this.partyDone(),
        'leave-shop': () => this.leaveShop(),
        'toggle-travel': () => this.toggleTravel(),
        'rest': () => this.rest(),
        'open-party': () => { UI.renderParty(); document.getElementById('partyModal').classList.add('show'); },
        'close-party': () => document.getElementById('partyModal').classList.remove('show')
      }[a];
      if (fn) fn();
    });

    // Shop tabs
    document.querySelectorAll('.tab').forEach(t => {
      t.onclick = () => {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        UI.shopTab = t.dataset.tab;
        UI.renderShop();
      };
    });

    document.getElementById('btnContinue').style.display = State.hasSave() ? '' : 'none';
    UI.show('screen-title');
  },

  toTitle() {
    this.stopTravel();
    document.getElementById('btnContinue').style.display = State.hasSave() ? '' : 'none';
    UI.show('screen-title');
  },

  /* ---------------- Setup ---------------- */
  newGame() {
    UI.renderClasses();
    UI.show('screen-class');
  },

  pickClass(id) {
    this.pendingClass = id;
    UI.renderPartyInputs(State.randomNames());
    UI.show('screen-party');
  },

  partyDone() {
    State.create(this.pendingClass, UI.readPartyInputs());
    State.log(`${State.leader().name} sets out from Independence, Missouri.`, 'epic');
    UI.openShop(null);
  },

  continueGame() {
    if (!State.load()) { UI.toast('No save found'); return; }
    if (State.s.phase === 'shop') UI.openShop(State.s.shopFort || null);
    else this.toTrail();
  },

  /* ---------------- Shop ---------------- */
  buy(id) {
    const s = State.s;
    if (id.startsWith('up:')) {
      const up = DATA.UPGRADES.find(u => u.id === id.slice(3));
      const p = UI.price(up.price);
      if (s.money < p || s.upgrades.includes(up.id)) return;
      s.money -= p;
      s.upgrades.push(up.id);
      if (up.id === 'ironwheels') { s.wagonMax += 15; s.wagonHP += 15; }
      UI.toast(`${up.emoji} ${up.name} — bought`);
    } else {
      const it = DATA.SUPPLIES.find(x => x.id === id);
      const p = UI.price(it.price);
      if (s.money < p) return;
      s.money -= p;
      State.add(it.stat, it.unit);
      UI.toast(`${it.emoji} +${it.unit} ${it.name}`);
    }
    State.save();
    UI.renderShop();
  },

  leaveShop() {
    const s = State.s;
    if (s.food < 40 && !s._warnedFood) {
      s._warnedFood = true;
      UI.toast('⚠ Almost no food. Buy more, or click again to go anyway.');
      return;
    }
    s._warnedFood = false;
    this.toTrail();
  },

  /* ---------------- Trail ---------------- */
  toTrail() {
    State.s.phase = 'trail';
    State.save();
    UI.show('screen-trail');
    UI.renderHUD(); UI.renderLeg(); UI.renderSegs(); UI.renderLog();
    TrailScene.start();
    UI.banner(State.level().to + ' — ' + Math.round(State.level().miles - State.s.legMiles) + ' miles ahead');
    if (!State.s._blurbed) {
      State.log(State.level().blurb, 'warn');
      State.s._blurbed = true;
    }
  },

  toggleTravel() {
    this.traveling ? this.stopTravel() : this.startTravel();
  },

  startTravel() {
    this.traveling = true;
    TrailScene.moving = true;
    const b = document.getElementById('btnTravel');
    b.textContent = '⏸ MAKE CAMP';
    b.classList.add('traveling');
    this.tick = setInterval(() => this.day(), 620);
  },

  stopTravel() {
    this.traveling = false;
    TrailScene.moving = false;
    clearInterval(this.tick);
    const b = document.getElementById('btnTravel');
    if (b) { b.textContent = '▶ TRAVEL'; b.classList.remove('traveling'); }
  },

  day() {
    const res = State.advanceDay();
    UI.renderHUD(); UI.renderLeg();
    State.save();

    if (res.dead) {
      this.stopTravel();
      return this.lose(res.reason);
    }

    // Winter warning
    if (State.s.day === 170) State.log('Snow on the peaks. Winter is coming down the mountains at you.', 'warn');
    if (State.s.day === 220) State.log('You are dangerously late. The passes are closing.', 'bad');

    // Leg complete?
    if (State.s.legMiles >= State.level().miles) {
      this.stopTravel();
      return this.reachLandmark();
    }

    if (res.event) {
      this.stopTravel();
      UI.showEvent(State.drawEvent());
    }
  },

  rest() {
    if (this.traveling) this.stopTravel();
    const heal = State.has('kettle') ? 26 : 13;
    State.s.day++;
    State.heal(5, heal);
    const eat = Math.round(State.living().length * 2.5);
    State.add('food', -eat);
    if (State.s.parts > 0 && State.s.wagonHP < State.s.wagonMax - 15) {
      const cost = State.s.classId === 'carpenter' ? 0 : 1;
      if (State.s.parts >= cost) {
        State.add('parts', -cost);
        State.add('wagonHP', 25);
        State.log(`Camp day: the wagon gets patched up (+25).`, 'good');
      }
    }
    State.log(`The party rests a day. Everyone recovers a little.`, 'good');
    UI.renderHUD(); UI.renderLeg();
    State.save();
    if (!State.living().length) this.lose('party');
  },

  treat(name) {
    const p = State.s.party.find(x => x.name === name);
    if (!p || State.s.meds < 1) return;
    State.add('meds', -1);
    const amt = State.s.classId === 'doc' ? 70 : 40;
    p.hp = Math.min(100, p.hp + amt);
    State.updateCond(p);
    State.log(`💊 ${p.name} is treated with medicine.`, 'good');
    UI.renderParty(); UI.renderHUD();
    State.save();
  },

  /* ---------------- Events ---------------- */
  resolveEvent(ev, idx) {
    const c = ev.choices[idx];
    const lines = State.applyOutcome(c.outcome);
    State.log(`${ev.icon} ${ev.title}: ${c.outcome.text}`, lines.some(l => !l.good) ? 'warn' : 'good');
    UI.showEventResult(c.outcome.text, lines);
    UI.renderHUD(); UI.renderLeg();
    State.save();
  },

  closeEvent() {
    UI.hideEvent();
    if (!State.living().length) return this.lose('party');
    if (State.s.wagonHP <= 0) return this.lose('wagon');
    if (State.s.legMiles >= State.level().miles) return this.reachLandmark();
    this.startTravel();
  },

  /* ---------------- Landmark + challenge ---------------- */
  reachLandmark() {
    const lv = State.level();
    State.log(`📍 You reach ${lv.to}.`, 'epic');
    State.s.phase = 'challenge';
    State.save();
    const c = lv.challenge;
    Mini.start({ ...c, kind: c.kind }, res => this.challengeDone(res));
  },

  challengeDone(res) {
    const s = State.s, lv = State.level(), c = lv.challenge;

    // --- Apply results ---
    if (c.kind === 'shooter') {
      s.ammo = Math.max(0, s.ammo - (res.ammoUsed || 0));
      s.wagonHP = Math.max(0, res.wagonHP ?? s.wagonHP);
      if (res.meat) {
        State.add('food', res.meat);
        s.stats.hunted += res.meat;
        State.log(`🎯 The hunt brings in ${res.meat} lbs of meat.`, 'good');
      }
      if (res.mistakes) State.log(`You shot ${res.mistakes} wolf${res.mistakes > 1 ? 'ves' : ''} you couldn't eat. Wasted powder.`, 'warn');
      if (!res.win && !c.huntMode) {
        State.add('food', -Math.round(s.food * 0.3));
        State.add('money', -Math.round(s.money * 0.25));
        State.hurt(2, 18, 'the fight');
      }
    }

    if (c.kind === 'dodger') {
      s.wagonHP = Math.max(0, res.wagonHP ?? s.wagonHP);
      if (!res.win) {
        State.add('food', -Math.round(s.food * 0.35));
        State.add('parts', -1);
        State.hurt(2, 22, 'the crossing');
        s.wagonHP = Math.max(15, s.wagonHP);   // never a hard wall — you limp on
      }
      if (res.clean) { State.add('money', 40); State.log('A clean crossing. Other travelers pay you to guide them through.', 'good'); }
    }

    if (c.kind === 'survival') {
      if (res.partyDmg > 0) State.hurt(State.living().length, Math.min(40, res.partyDmg), 'the cold');
      if (!res.win) State.hurt(1, 40, 'the blizzard');
    }

    if (c.kind === 'repair') {
      if (res.win) {
        State.add('wagonHP', res.clean ? 45 : 25);
        State.add('parts', -1);
      } else {
        State.add('parts', -2);
        State.add('wagonHP', -10);
        s.day += 2;
      }
    }

    // --- Boss rewards ---
    if (c.boss && res.win) {
      s.stats.bossesBeaten++;
      const r = c.reward || {};
      Object.keys(r).forEach(k => State.add(k, r[k]));
      const bits = Object.entries(r).map(([k, v]) => `+${v} ${k}`).join(', ');
      State.log(`⭐ BOSS DEFEATED: ${c.title.replace(/^BOSS · |^FINAL BOSS · /, '')}! ${bits}`, 'epic');
      UI.toast('⭐ BOSS DEFEATED!');
    }

    if (!State.living().length) return this.lose('party');

    // --- Next leg ---
    s.legMiles = 0;
    s.level++;
    s._blurbed = false;
    State.save();

    if (s.level >= DATA.LEVELS.length) return this.win();

    // Fort?
    const fort = DATA.FORTS[lv.to];
    if (fort) {
      s.phase = 'shop';
      s.shopFort = lv.to;
      State.save();
      UI.openShop(lv.to);
    } else {
      s.shopFort = null;
      this.toTrail();
    }
  },

  /* ---------------- End ---------------- */
  win() {
    this.stopTravel();
    const survivors = State.living().length;
    const names = State.living().map(p => p.name);
    let text;
    if (survivors === 5)
      text = `Every single one of you made it. ${names.slice(0, -1).join(', ')} and ${names.slice(-1)} walk down into the Willamette Valley on day ${State.s.day}, and the grass is greener than anything you have seen since Missouri. Almost nobody does this. You did this.`;
    else if (survivors >= 3)
      text = `${names.join(', ')} come down out of the Blues and see the valley open up below them. You paid for this in people you will not forget. But you made it, and Oregon is real, and it is right there.`;
    else
      text = `${names.join(' and ')} reach the valley alone. Two thousand miles, and this is what is left. It is enough to start with. It has to be.`;
    UI.showEnd(true, '🏔️ YOU REACHED OREGON', text);
  },

  lose(reason) {
    this.stopTravel();
    const T = {
      party: ['💀 THE TRAIL TAKES EVERYONE', `The last of your party dies on day ${State.s.day}, ${Math.round(State.s.totalMiles)} miles from Independence and a long way from Oregon. Somebody else will find the wagon.`],
      wagon: ['🛞 STRANDED', `The wagon finally gives out ${Math.round(State.s.totalMiles)} miles in. Without it there is no food, no shelter, and no way forward. The trail does not forgive this.`]
    }[reason] || ['💀 THE TRAIL WINS', 'Your journey ends here.'];
    UI.showEnd(false, T[0], T[1]);
  }
};

document.addEventListener('DOMContentLoaded', () => Game.boot());
