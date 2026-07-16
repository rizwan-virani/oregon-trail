/* ==========================================================
   Oregon Trail: Unbroken — UI
   Screen switching and every bit of rendering that isn't canvas.
   ========================================================== */

const UI = {
  shopTab: 'supplies',
  shopMarkup: 1,

  /* ---------- Screens ---------- */
  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    if (id !== 'screen-trail') TrailScene.stop();
    window.scrollTo(0, 0);
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), 2600);
  },

  banner(msg) {
    const b = document.getElementById('trailBanner');
    b.textContent = msg;
    b.classList.add('show');
    clearTimeout(this._bannerT);
    this._bannerT = setTimeout(() => b.classList.remove('show'), 3200);
  },

  /* ---------- Class picker ---------- */
  renderClasses() {
    document.getElementById('classGrid').innerHTML = DATA.CLASSES.map(c => `
      <div class="class-card" data-class="${c.id}">
        <span class="class-emoji">${c.emoji}</span>
        <div class="class-name">${c.name}</div>
        <div class="class-money">$${c.money}</div>
        <div class="class-perk">${c.perk}</div>
        <p class="class-desc">${c.desc}</p>
        <div class="class-perk" style="margin-top:8px;color:var(--gold)">Score ×${c.scoreMult}</div>
      </div>`).join('');
    document.querySelectorAll('.class-card').forEach(el => {
      el.onclick = () => Game.pickClass(el.dataset.class);
    });
  },

  /* ---------- Party naming ---------- */
  renderPartyInputs(names) {
    document.getElementById('partyInputs').innerHTML = names.map((n, i) => `
      <div class="party-row">
        <label>${i === 0 ? 'YOU' : 'MEMBER ' + (i + 1)}</label>
        <input type="text" maxlength="16" value="${n}" data-idx="${i}">
      </div>`).join('');
  },
  readPartyInputs() {
    return [...document.querySelectorAll('#partyInputs input')].map(i => i.value);
  },

  /* ---------- Shop ---------- */
  openShop(fort) {
    const f = fort ? DATA.FORTS[fort] : { name: "MATT'S GENERAL STORE, INDEPENDENCE", sub: 'April 1848. Everything you take west, you buy here. Everything you forget, you do without.', markup: 1 };
    this.shopMarkup = f.markup;
    document.getElementById('shopTitle').textContent = f.name;
    document.getElementById('shopSub').textContent = f.sub;
    document.getElementById('btnLeaveShop').textContent = fort ? 'BACK TO THE TRAIL →' : 'HIT THE TRAIL →';
    this.shopTab = 'supplies';
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'supplies'));
    this.renderShop();
    this.show('screen-shop');
  },

  price(base) { return Math.round(base * this.shopMarkup); },

  renderShop() {
    const s = State.s;
    document.getElementById('shopMoney').textContent = '$' + s.money;

    const wrap = document.getElementById('shopItems');
    if (this.shopTab === 'supplies') {
      wrap.innerHTML = DATA.SUPPLIES.map(it => {
        const p = this.price(it.price);
        const can = s.money >= p;
        return `<div class="shop-item ${can ? '' : 'cant'}">
          <span class="si-emoji">${it.emoji}</span>
          <div class="si-body">
            <div class="si-name">${it.name} <span style="color:#8a7a5e">×${it.unit}</span></div>
            <div class="si-desc">${it.desc}</div>
            <div class="si-price">$${p}</div>
          </div>
          <button class="btn btn-primary si-buy" data-buy="${it.id}" ${can ? '' : 'disabled'}>BUY</button>
        </div>`;
      }).join('');
    } else {
      wrap.innerHTML = DATA.UPGRADES.map(it => {
        const owned = s.upgrades.includes(it.id);
        const p = this.price(it.price);
        const can = s.money >= p && !owned;
        return `<div class="shop-item ${owned ? 'owned' : can ? '' : 'cant'}">
          <span class="si-emoji">${it.emoji}</span>
          <div class="si-body">
            <div class="si-name">${it.name}</div>
            <div class="si-desc">${it.desc}</div>
            ${owned ? '<div class="si-owned-tag">✓ OWNED</div>' : `<div class="si-price">$${p}</div>`}
          </div>
          ${owned ? '' : `<button class="btn btn-primary si-buy" data-buy="up:${it.id}" ${can ? '' : 'disabled'}>BUY</button>`}
        </div>`;
      }).join('');
    }

    wrap.querySelectorAll('[data-buy]').forEach(b => {
      b.onclick = () => Game.buy(b.dataset.buy);
    });

    document.getElementById('shopCart').innerHTML = `
      <div class="cart-line"><span>🥓 Food</span><b>${s.food} lb</b></div>
      <div class="cart-line"><span>📦 Ammo</span><b>${s.ammo}</b></div>
      <div class="cart-line"><span>🔩 Parts</span><b>${s.parts}</b></div>
      <div class="cart-line"><span>💊 Medicine</span><b>${s.meds}</b></div>
      <div class="cart-line"><span>🐂 Oxen</span><b>${s.oxen}</b></div>
      <div class="cart-line"><span>🧥 Clothes</span><b>${s.clothes}</b></div>
      <div class="cart-line"><span>⭐ Gear</span><b>${s.upgrades.length}</b></div>`;
  },

  /* ---------- HUD ---------- */
  renderHUD() {
    const s = State.s;
    const cell = (label, val, cls) =>
      `<div class="hud-cell"><span class="hud-label">${label}</span><span class="hud-value ${cls || ''}">${val}</span></div>`;
    const lowFood = s.food < 60 ? 'low' : s.food < 150 ? 'mid' : '';
    const lowWagon = s.wagonHP < 30 ? 'low' : s.wagonHP < 60 ? 'mid' : '';

    document.getElementById('hud').innerHTML =
      cell('DATE', State.dateString()) +
      cell('DAY', s.day) +
      cell('MILES', Math.round(s.totalMiles)) +
      cell('🥓 FOOD', s.food + '', lowFood) +
      cell('📦 AMMO', s.ammo) +
      cell('🔩 PARTS', s.parts, s.parts === 0 ? 'mid' : '') +
      cell('💊 MEDS', s.meds) +
      cell('🐂 OXEN', s.oxen, s.oxen < 2 ? 'low' : '') +
      cell('🛞 WAGON', s.wagonHP + '', lowWagon) +
      cell('💰 CASH', '$' + s.money) +
      cell('👥 ALIVE', State.living().length + '/5', State.living().length < 3 ? 'low' : '');
  },

  renderLeg() {
    const s = State.s, lv = State.level();
    document.getElementById('legName').textContent = `LEG ${lv.id} of 13 · ${lv.from} → ${lv.to}`;
    const pct = Math.min(100, (s.legMiles / lv.miles) * 100);
    document.getElementById('legProgress').style.width = pct + '%';
    document.getElementById('legFlag').style.left = pct + '%';
    document.getElementById('legMiles').textContent =
      `${Math.round(s.legMiles)} / ${lv.miles} miles this leg · ${Math.round(s.totalMiles)} total`;
  },

  renderSegs() {
    const s = State.s;
    document.getElementById('paceSeg').innerHTML = ['Steady', 'Strenuous', 'Grueling']
      .map((p, i) => `<button class="${s.pace === i ? 'active' : ''}" data-pace="${i}">${p}</button>`).join('');
    document.getElementById('rationSeg').innerHTML = ['Filling', 'Meager', 'Bare']
      .map((r, i) => `<button class="${s.rations === i ? 'active' : ''}" data-ration="${i}">${r}</button>`).join('');

    document.querySelectorAll('[data-pace]').forEach(b => b.onclick = () => { State.s.pace = +b.dataset.pace; UI.renderSegs(); });
    document.querySelectorAll('[data-ration]').forEach(b => b.onclick = () => { State.s.rations = +b.dataset.ration; UI.renderSegs(); });
  },

  renderLog() {
    const el = document.getElementById('trailLog');
    if (!el) return;
    el.innerHTML = State.s.log.slice(0, 30).map(l =>
      `<div class="log-line ${l.kind}"><b>Day ${l.day}:</b> ${l.text}</div>`).join('');
    el.scrollTop = 0;
  },

  /* ---------- Party modal ---------- */
  renderParty() {
    document.getElementById('partyStatus').innerHTML = State.s.party.map(p => {
      const color = !p.alive ? '#5a2018' : p.hp > 60 ? 'var(--good)' : p.hp > 30 ? 'var(--warn)' : 'var(--danger)';
      const emoji = !p.alive ? '💀' : p.hp > 80 ? '😀' : p.hp > 60 ? '🙂' : p.hp > 40 ? '😕' : p.hp > 20 ? '🤒' : '😵';
      return `<div class="member ${p.alive ? '' : 'dead'}">
        <span class="mem-emoji">${emoji}</span>
        <div class="mem-body">
          <div class="mem-name">${p.name}${p.leader ? ' <span style="color:var(--gold);font-size:11px">(YOU)</span>' : ''}</div>
          <div class="mem-cond">${p.cond}</div>
          <div class="hp-track"><div class="hp-fill" style="width:${p.hp}%;background:${color}"></div></div>
        </div>
        ${p.alive && p.hp < 90 && State.s.meds > 0
          ? `<button class="btn btn-sm" data-heal="${p.name}">💊 TREAT</button>` : ''}
      </div>`;
    }).join('');

    document.querySelectorAll('[data-heal]').forEach(b => {
      b.onclick = () => Game.treat(b.dataset.heal);
    });
  },

  /* ---------- Event modal ---------- */
  showEvent(ev) {
    document.getElementById('eventIcon').textContent = ev.icon;
    document.getElementById('eventTitle').textContent = ev.title;
    document.getElementById('eventText').textContent = ev.text;
    document.getElementById('eventResult').classList.remove('show');
    document.getElementById('eventResult').innerHTML = '';

    const box = document.getElementById('eventChoices');
    box.innerHTML = ev.choices.map((c, i) => {
      const locked = c.outcome.require && !State.canAfford(c.outcome.require);
      return `<button class="btn ${locked ? '' : 'btn-primary'}" data-choice="${i}" ${locked ? 'disabled' : ''}>
        ${c.label}${locked ? ' <span style="font-size:11px">(you don\'t have it)</span>' : ''}
      </button>`;
    }).join('');

    box.querySelectorAll('[data-choice]').forEach(b => {
      b.onclick = () => Game.resolveEvent(ev, +b.dataset.choice);
    });
    document.getElementById('eventModal').classList.add('show');
  },

  showEventResult(text, lines) {
    document.getElementById('eventChoices').innerHTML = '';
    const el = document.getElementById('eventResult');
    el.innerHTML = `<p style="margin-bottom:12px;color:var(--parchment)">${text}</p>` +
      lines.map(l => `<div class="result-line ${l.good ? 'good' : 'bad'}">${l.good ? '▲' : '▼'} ${l.t}</div>`).join('') +
      `<button class="btn btn-primary" style="margin-top:16px" data-action="close-event">CARRY ON</button>`;
    el.classList.add('show');
    el.querySelector('[data-action="close-event"]').onclick = () => Game.closeEvent();
  },

  hideEvent() { document.getElementById('eventModal').classList.remove('show'); },

  /* ---------- Hall ---------- */
  renderHall() {
    const list = State.hall();
    const el = document.getElementById('hallList');
    if (!list.length) {
      el.innerHTML = '<div class="hall-empty">No legends yet. The trail is waiting.</div>';
      return;
    }
    el.innerHTML = list.map((h, i) => `
      <div class="hall-row">
        <div class="hall-rank">${['🥇', '🥈', '🥉'][i] || '#' + (i + 1)}</div>
        <div class="hall-body">
          <div class="hall-name">${h.emoji} ${h.name} — ${h.cls}</div>
          <div class="hall-meta">${h.won ? '✅ Reached Oregon' : '💀 Died on the trail'} ·
            ${h.survivors} survived · ${h.miles} miles · day ${h.day}</div>
        </div>
        <div class="hall-score">${h.score.toLocaleString()}</div>
      </div>`).join('');
  },

  /* ---------- End ---------- */
  showEnd(won, title, text) {
    const sc = State.score();
    document.getElementById('endArt').textContent = won ? '🏔️' : '🪦';
    document.getElementById('endTitle').textContent = title;
    document.getElementById('endTitle').style.color = won ? 'var(--good)' : 'var(--danger)';
    document.getElementById('endText').textContent = text;
    document.getElementById('endScore').innerHTML =
      sc.rows.map(r => `<div class="score-line"><span>${r.label}</span><b>${r.mult ? r.val : '+' + r.val}</b></div>`).join('') +
      `<div class="score-line total"><span>FINAL SCORE</span><b>${sc.total.toLocaleString()}</b></div>`;
    State.recordScore(sc.total, won);
    State.clear();
    this.show('screen-end');
  }
};
