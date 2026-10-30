/* Sum Knight Run: rendering, input, audio, persistence. */
(function () {
    'use strict';

    const L = window.SumRunLogic;
    const dialog = document.querySelector('.sum-run-dialog');
    const trigger = document.querySelector('.sum-run-trigger');
    if (!L || !dialog || !trigger) return;

    const $ = (s) => dialog.querySelector(s);
    const ui = {
        level: $('[data-sr-level]'), score: $('[data-sr-score]'), goal: $('[data-sr-goal]'),
        lives: $('[data-sr-lives]'), progress: $('[data-sr-progress]'), stage: $('[data-sr-stage]'),
        road: $('[data-sr-road]'), stripes: $('[data-sr-stripes]'), laneHl: $('[data-sr-lane-hl]'),
        entities: $('[data-sr-entities]'), player: $('[data-sr-player]'), fx: $('[data-sr-fx]'),
        overlay: $('[data-sr-overlay]'), panel: $('[data-sr-panel]'), live: $('[data-sr-live]'),
        collected: $('[data-sr-collected]'), ops: $('[data-sr-ops]'), log: $('[data-sr-log]'),
        pause: $('[data-sr-pause]')
    };
    const SVG_NS = 'http://www.w3.org/2000/svg';

    /* ---------- Persistence ---------- */
    const SETTINGS_KEY = 'sum-run-settings';
    const PROGRESS_KEY = 'sum-run-progress';
    function load(key, fallback) {
        try { return Object.assign(fallback, JSON.parse(localStorage.getItem(key)) || {}); }
        catch (e) { return fallback; }
    }
    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
    const settings = load(SETTINGS_KEY, { sound: true, advanced: false });
    const progress = load(PROGRESS_KEY, { unlocked: 1, current: 0, best: {}, stars: {} });
    progress.unlocked = Math.max(1, Math.min(L.LEVELS.length, Number(progress.unlocked) || 1));
    const recordKey = (i) => i + ':' + (settings.advanced ? 'a' : 'b');

    /* ---------- Audio ---------- */
    let audio = null;
    function tone(freq, dur = .12, type = 'sine', slide = 0, vol = .08) {
        if (!settings.sound) return;
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            const t = audio.currentTime;
            const o = audio.createOscillator();
            const g = audio.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, t);
            if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(.0001, t + dur);
            o.connect(g).connect(audio.destination);
            o.start(t);
            o.stop(t + dur);
        } catch (e) { /* audio blocked */ }
    }
    const sfx = {
        gain: () => tone(660, .12, 'triangle', 220),
        loss: () => tone(300, .18, 'sawtooth', -120, .05),
        op: () => tone(520, .2, 'square', 500, .04),
        hit: () => tone(120, .35, 'sawtooth', -60, .1),
        warn: () => tone(380, .07, 'square', 0, .03),
        win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .18, 'triangle'), i * 110)),
        lose: () => [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, .22, 'sawtooth', 0, .05), i * 150))
    };

    /* ---------- Geometry ---------- */
    const Y0 = 60, YP = 384, YB = 440, VIEW = 2400, LEAD = 1600;
    const yAt = (z) => Y0 + (YP - Y0) * Math.pow(Math.max(z, 0), 1.7);
    const halfW = (y) => 34 + (170 - 34) * (y - Y0) / (YB - Y0);
    const laneX = (lane, y, n) => 180 + ((lane + .5) / n * 2 - 1) * halfW(y);
    const scaleAt = (y) => .22 + .78 * (y - Y0) / (YP - Y0);

    function svg(html) {
        const tmp = document.createElementNS(SVG_NS, 'g');
        tmp.innerHTML = html;
        return tmp.firstElementChild;
    }

    function drawRoad(n) {
        let html = `<path d="M146 ${Y0}h68L350 ${YB}H10z" fill="#0c142b" stroke="#6d5bd0" stroke-opacity=".6"/>`;
        for (let i = 1; i < n; i++) {
            const k = i / n * 2 - 1;
            html += `<path d="M${180 + k * 34} ${Y0}L${180 + k * 170} ${YB}" stroke="#8b7cf6" stroke-opacity=".28" stroke-dasharray="8 12"/>`;
        }
        ui.road.innerHTML = html;
        ui.stripes.innerHTML = Array.from({ length: 6 }, () => '<path stroke="#a78bfa" stroke-opacity=".12"/>').join('');
        const w = (2 * halfW(YP)) / n;
        ui.laneHl.innerHTML = Array.from({ length: n }, (_, i) =>
            `<rect class="sr-lane-hl" x="${180 - halfW(YP) + i * w + 2}" y="${YP - 8}" width="${w - 4}" height="18" rx="6"/>`).join('');
    }

    /* ---------- Sprites ---------- */
    function numHTML(v) {
        return `<g class="sr-item sr-num ${v >= 0 ? 'is-pos' : 'is-neg'}"><rect x="-20" y="-30" width="40" height="26" rx="9"/>` +
            `<text y="-11.5">${v >= 0 ? '+' : '−'}${Math.abs(v)}</text></g>`;
    }
    function opHTML(item) {
        return `<g class="sr-item sr-op${L.isAdvanced(item.op) ? ' is-adv' : ''}"><path d="M-17-34h34l8 13-8 13h-34l-8-13z"/>` +
            `<text y="-16.5">${L.label(item)}</text></g>`;
    }
    const KNIGHT_COLORS = {
        guard: ['#cbd5e1', '#475569', '#ef4444'],
        patrol: ['#fcd34d', '#92400e', '#22c55e'],
        charger: ['#64748b', '#0f172a', '#e11d48']
    };
    function knightHTML(kind) {
        const [metal, dark, accent] = KNIGHT_COLORS[kind];
        const weapon = kind === 'guard'
            ? '<path d="M16-46v28" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/><path d="M11-20h10" stroke="#a16207" stroke-width="3" stroke-linecap="round"/>'
            : kind === 'patrol'
                ? '<path d="M16-58v56" stroke="#78350f" stroke-width="2.5"/><path d="M16-60c7 2 9 7 7 12l-7-3z" fill="#e2e8f0"/>'
                : `<path d="M12-32 24-2" stroke="${accent}" stroke-width="4" stroke-linecap="round"/><path d="M22-6l5 9-8-4z" fill="#e2e8f0"/>`;
        return `<g class="sr-item sr-knight sr-knight-${kind}">
            <ellipse cy="1" rx="18" ry="4.5" fill="#000" opacity=".4"/>
            <g class="sr-knight-body">
                <rect x="-8" y="-12" width="6" height="12" rx="2" fill="${dark}"/>
                <rect x="2" y="-12" width="6" height="12" rx="2" fill="${dark}"/>
                <path d="M-11-30h22l-2 19h-18z" fill="${metal}" stroke="${dark}" stroke-width="1.5"/>
                <path d="M-11-24 11-28" stroke="${accent}" stroke-width="3"/>
                <path d="M-9-31v-12a9 9 0 0 1 18 0v12z" fill="${metal}" stroke="${dark}" stroke-width="1.5"/>
                <path d="M-6-38h12M0-38v5" stroke="#0f172a" stroke-width="2.2"/>
                <path d="M0-52c6-7 13-3 11 6-3-3-7-3-11-2z" fill="${accent}"/>
                ${weapon}
                <path d="M-23-31h14v10c0 6-4 9-7 11-3-2-7-5-7-11z" fill="${accent}" stroke="${metal}" stroke-width="1.5"/>
                <path d="M-16-29v15M-21-23h10" stroke="${metal}" stroke-width="1.6"/>
            </g></g>`;
    }
    function itemHTML(cell) {
        if (cell.type === 'num') return numHTML(cell.value);
        if (cell.type === 'op') return opHTML(cell);
        return knightHTML(cell.kind);
    }

    /* ---------- State ---------- */
    let game = null;
    let selected = Math.min(Number(progress.current) || 0, progress.unlocked - 1);
    let moodTimer = 0;

    function setMood(mood, ms = 500) {
        ui.player.dataset.mood = mood;
        clearTimeout(moodTimer);
        if (mood !== 'idle') moodTimer = setTimeout(() => { if (game && !game.over) ui.player.dataset.mood = 'idle'; }, ms);
    }

    function floatText(text, cls) {
        const t = svg(`<text class="sr-float ${cls}" x="${game.px.toFixed(1)}" y="${YP - 58}"></text>`);
        t.textContent = text;
        ui.fx.appendChild(t);
        setTimeout(() => t.remove(), 900);
    }

    function logLine(text, cls) {
        const li = document.createElement('li');
        li.textContent = text;
        li.className = cls;
        ui.log.prepend(li);
        while (ui.log.children.length > 4) ui.log.lastChild.remove();
    }

    function updateHud() {
        const lv = game.level;
        ui.level.textContent = lv.index + 1;
        ui.score.textContent = game.score;
        ui.goal.textContent = lv.goal;
        ui.score.classList.toggle('is-goal', game.score >= lv.goal);
        ui.lives.textContent = '♥'.repeat(Math.max(0, game.lives)) + '♡'.repeat(3 - Math.max(0, game.lives));
        ui.collected.textContent = game.collected;
        ui.ops.textContent = game.opsApplied;
        ui.progress.style.width = Math.min(100, (game.next / lv.rows.length) * 100) + '%';
    }

    function startLevel(index) {
        stopLoop();
        const level = L.getLevel(index, settings.advanced);
        selected = index;
        progress.current = index;
        save(PROGRESS_KEY, progress);
        drawRoad(level.cfg.lanes);
        ui.entities.innerHTML = '';
        ui.fx.innerHTML = '';
        ui.log.innerHTML = '';
        const lane = Math.floor(level.cfg.lanes / 2);
        const now = performance.now();
        game = {
            level, lane, px: laneX(lane, YP, level.cfg.lanes),
            score: level.start, lives: 3, collected: 0, opsApplied: 0,
            next: 0, first: 0, els: new Map(), warned: new Set(), taken: new Set(),
            t0: now, last: now, paused: false, over: false, raf: 0
        };
        ui.pause.textContent = 'Pause';
        updateHud();
        setMood('idle');
        hideOverlay();
        ui.live.textContent = `Level ${index + 1} started. Goal ${level.goal}.`;
        game.raf = requestAnimationFrame(frame);
    }

    const arrival = (r) => LEAD + r * game.level.cfg.gap;

    function resolveRow(r) {
        const cell = game.level.rows[r][game.lane];
        if (!cell) return;
        const key = r + ':' + game.lane;
        if (cell.type === 'knight') {
            game.lives--;
            sfx.hit();
            setMood('hurt', 700);
            ui.stage.classList.remove('is-shaking');
            void ui.stage.offsetWidth;
            ui.stage.classList.add('is-shaking');
            floatText('Ouch!', 'is-neg');
            logLine(`Knight hit! ${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left`, 'is-neg');
            ui.live.textContent = `Hit by a knight. ${game.lives} lives left.`;
            if (game.lives <= 0) { updateHud(); finish(); }
            return;
        }
        const before = game.score;
        game.score = L.apply(before, cell);
        if (cell.type === 'num') game.collected++; else game.opsApplied++;
        const diff = game.score - before;
        logLine(`${before} ${L.label(cell)} = ${game.score}`, diff >= 0 ? 'is-pos' : 'is-neg');
        floatText(L.label(cell), diff >= 0 ? 'is-pos' : 'is-neg');
        if (cell.type === 'op') sfx.op(); else if (diff >= 0) sfx.gain(); else sfx.loss();
        setMood(diff > 0 ? 'happy' : diff < 0 ? 'sad' : 'idle');
        game.taken.add(key);
        const el = game.els.get(key);
        if (el) el.firstElementChild.classList.add('is-taken');
    }

    function render(t, dt) {
        const lv = game.level;
        const n = lv.cfg.lanes;

        [...ui.stripes.children].forEach((p, i) => {
            const y = yAt(((i / 6) + t / VIEW) % 1);
            p.setAttribute('d', `M${180 - halfW(y)} ${y}H${180 + halfW(y)}`);
        });

        while (game.first < lv.rows.length && arrival(game.first) - t < -380) {
            for (let l = 0; l < n; l++) {
                const key = game.first + ':' + l;
                const el = game.els.get(key);
                if (el) { el.remove(); game.els.delete(key); }
            }
            game.first++;
        }

        for (let r = game.first; r < lv.rows.length; r++) {
            const remaining = arrival(r) - t;
            if (remaining > VIEW) break;
            for (let l = 0; l < n; l++) {
                const cell = lv.rows[r][l];
                if (!cell) continue;
                const key = r + ':' + l;
                const charger = cell.type === 'knight' && cell.kind === 'charger';
                const z = 1 - remaining / (charger ? VIEW * .5 : VIEW);
                let el = game.els.get(key);
                if (z < 0) { if (el) el.style.display = 'none'; continue; }
                if (!el) {
                    el = svg(`<g>${itemHTML(cell)}</g>`);
                    ui.entities.prepend(el);
                    game.els.set(key, el);
                }
                el.style.display = '';
                const y = yAt(z);
                let x = laneX(l, y, n);
                if (cell.type === 'knight' && cell.kind === 'patrol') {
                    // Patrols sway early, then settle into their lane well before the player line.
                    const settle = Math.max(0, Math.min(1, (z - .5) / .3));
                    x += Math.sin(t / 280 + r) * ((2 * halfW(y)) / n) * .9 * (1 - settle);
                }
                el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scaleAt(y).toFixed(3)})`);
                el.style.opacity = Math.min(1, z * 8);
                if (cell.type === 'knight' && z > .45 && z < 1 && !game.warned.has(key)) {
                    game.warned.add(key);
                    const hl = ui.laneHl.children[l];
                    if (hl) {
                        hl.classList.add('is-warn');
                        setTimeout(() => hl.classList.remove('is-warn'), 650);
                    }
                    if (l === game.lane) sfx.warn();
                }
            }
        }

        const target = laneX(game.lane, YP, n);
        game.px += (target - game.px) * Math.min(1, dt * .022);
        const tilt = Math.max(-12, Math.min(12, (target - game.px) * .4));
        ui.player.setAttribute('transform', `translate(${game.px.toFixed(1)} ${YP}) rotate(${tilt.toFixed(1)})`);
        [...ui.laneHl.children].forEach((h, i) => h.classList.toggle('is-active', i === game.lane));
    }

    function frame(now) {
        if (!game || game.paused || game.over) return;
        const t = now - game.t0;
        const dt = now - game.last;
        game.last = now;
        const rows = game.level.rows;
        while (game.next < rows.length && t >= arrival(game.next)) {
            resolveRow(game.next++);
            if (game.over) return;
            updateHud();
        }
        render(t, dt);
        if (t > arrival(rows.length - 1) + 700) { finish(); return; }
        game.raf = requestAnimationFrame(frame);
    }

    function stopLoop() {
        if (game) cancelAnimationFrame(game.raf);
    }

    function move(dir) {
        if (!game || game.paused || game.over) return;
        game.lane = Math.max(0, Math.min(game.level.cfg.lanes - 1, game.lane + dir));
    }

    function pause() {
        if (!game || game.over || game.paused) return;
        game.paused = true;
        game.pauseAt = performance.now();
        stopLoop();
        ui.pause.textContent = 'Resume';
        showPanel('Paused', `Score ${game.score} / goal ${game.level.goal}`,
            '<button type="button" class="sum-run-btn is-primary" data-sr-cmd="resume">Resume</button>' +
            '<button type="button" class="sum-run-btn" data-sr-cmd="restart">Restart level</button>' +
            '<button type="button" class="sum-run-btn" data-sr-cmd="menu">Levels</button>');
    }

    function resume() {
        if (!game || !game.paused) return;
        const now = performance.now();
        game.t0 += now - game.pauseAt;
        game.last = now;
        game.paused = false;
        ui.pause.textContent = 'Pause';
        hideOverlay();
        game.raf = requestAnimationFrame(frame);
    }

    function finish() {
        game.over = true;
        stopLoop();
        const lv = game.level;
        const win = game.lives > 0 && game.score >= lv.goal;
        const key = recordKey(lv.index);
        const half = lv.goal + (lv.max - lv.goal) / 2;
        const stars = !win ? 0 : game.score >= lv.max ? 3 : game.score >= half ? 2 : 1;
        if (game.lives > 0 && (progress.best[key] === undefined || game.score > progress.best[key])) progress.best[key] = game.score;
        if (stars > (progress.stars[key] || 0)) progress.stars[key] = stars;
        if (win) progress.unlocked = Math.max(progress.unlocked, Math.min(L.LEVELS.length, lv.index + 2));
        save(PROGRESS_KEY, progress);

        clearTimeout(moodTimer);
        ui.player.dataset.mood = win ? 'happy' : 'sad';
        (win ? sfx.win : sfx.lose)();
        const starHtml = '<p class="sum-run-stars" aria-label="' + stars + ' of 3 stars">' +
            '★'.repeat(stars) + '<span>' + '★'.repeat(3 - stars) + '</span></p>';
        const isLast = lv.index === L.LEVELS.length - 1;
        const actions = (win && !isLast ? '<button type="button" class="sum-run-btn is-primary" data-sr-cmd="next">Next level</button>' : '') +
            `<button type="button" class="sum-run-btn${win && !isLast ? '' : ' is-primary'}" data-sr-cmd="restart">Replay</button>` +
            '<button type="button" class="sum-run-btn" data-sr-cmd="menu">Levels</button>';
        const reason = game.lives <= 0 ? 'The knights got you.' :
            win ? (isLast ? 'You conquered every level!' : 'Level complete!') : `You needed ${lv.goal}.`;
        showPanel(win ? 'Victory!' : 'Try again',
            `${reason} Score <strong>${game.score}</strong> · Goal ${lv.goal} · Max possible ${lv.max}`,
            starHtml + actions);
        ui.live.textContent = `${win ? 'Level complete' : 'Level failed'}. Score ${game.score}.`;
    }

    /* ---------- Overlay / menu ---------- */
    function showPanel(title, message, inner) {
        ui.panel.innerHTML = `<p class="sum-run-overlay-label">${title}</p>` +
            `<p class="sum-run-overlay-message">${message}</p><div class="sum-run-actions">${inner}</div>`;
        ui.overlay.hidden = false;
        const first = ui.panel.querySelector('.is-primary') || ui.panel.querySelector('button');
        if (first) first.focus({ preventScroll: true });
    }
    function hideOverlay() { ui.overlay.hidden = true; }

    function showMenu() {
        stopLoop();
        if (game) game.over = true;
        clearTimeout(moodTimer);
        ui.player.dataset.mood = 'idle';
        ui.pause.textContent = 'Pause';
        const level = L.getLevel(selected, settings.advanced);
        drawRoad(level.cfg.lanes);
        ui.entities.innerHTML = '';
        ui.fx.innerHTML = '';
        ui.player.setAttribute('transform', `translate(${laneX(Math.floor(level.cfg.lanes / 2), YP, level.cfg.lanes)} ${YP})`);

        const grid = L.LEVELS.map((cfg, i) => {
            const locked = i >= progress.unlocked;
            const stars = progress.stars[recordKey(i)] || 0;
            return `<button type="button" class="sum-run-level${i === selected ? ' is-selected' : ''}" data-sr-pick="${i}"` +
                ` aria-label="Level ${i + 1}${locked ? ', locked' : ', ' + stars + ' stars'}"${locked ? ' disabled' : ''}>` +
                `<b>${locked ? '🔒' : i + 1}</b><small>${'★'.repeat(stars) || '&nbsp;'}</small></button>`;
        }).join('');
        const best = progress.best[recordKey(selected)];
        const kinds = level.cfg.knights.length ? level.cfg.knights.join(', ') : 'none';
        const info = `<div class="sum-run-info">
            <strong>${selected + 1}. ${level.cfg.name}</strong>
            <span>Goal <b>${level.goal}</b> · Start ${level.start} · ${level.cfg.lanes} lanes</span>
            <span>Ops: ${L.opList(level).join(' ')}</span>
            <span>Knights: ${kinds}${best !== undefined ? ' · Best ' + best : ''}</span></div>`;
        const opts = `<div class="sum-run-settings">
            <label><input type="checkbox" data-sr-setting="sound"${settings.sound ? ' checked' : ''}> Sound</label>
            <label><input type="checkbox" data-sr-setting="advanced"${settings.advanced ? ' checked' : ''}> Advanced ops (√ x² mod log)</label></div>`;
        showPanel('Sum Knight Run', 'Reach the goal score. Numbers add up, math gates transform your score, knights cost a life.',
            `<div class="sum-run-levels">${grid}</div>${info}${opts}` +
            '<button type="button" class="sum-run-btn is-primary" data-sr-cmd="start">Start level</button>' +
            '<p class="sum-run-hint">← → or A / D · Swipe · P to pause</p>');
    }

    ui.panel.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-sr-pick]');
        if (pick) { selected = Number(pick.dataset.srPick); showMenu(); return; }
        const cmd = e.target.closest('[data-sr-cmd]');
        if (!cmd) return;
        const c = cmd.dataset.srCmd;
        if (c === 'start') startLevel(selected);
        else if (c === 'resume') resume();
        else if (c === 'restart') startLevel(game ? game.level.index : selected);
        else if (c === 'next') startLevel(Math.min(L.LEVELS.length - 1, game.level.index + 1));
        else if (c === 'menu') { if (game) selected = game.level.index; showMenu(); }
    });

    ui.panel.addEventListener('change', (e) => {
        const input = e.target.closest('[data-sr-setting]');
        if (!input) return;
        settings[input.dataset.srSetting] = input.checked;
        save(SETTINGS_KEY, settings);
        showMenu();
    });

    /* ---------- Input ---------- */
    dialog.addEventListener('keydown', (e) => {
        if (e.target.matches('input')) return;
        const k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') { move(-1); e.preventDefault(); }
        else if (k === 'arrowright' || k === 'd') { move(1); e.preventDefault(); }
        else if (k === 'p') { if (game && game.paused) resume(); else pause(); }
    });
    dialog.querySelectorAll('[data-sr-move]').forEach((b) =>
        b.addEventListener('click', () => move(Number(b.dataset.srMove))));
    ui.pause.addEventListener('click', () => { if (game && game.paused) resume(); else pause(); });

    let swipeX = null;
    ui.stage.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
    ui.stage.addEventListener('pointerup', (e) => {
        if (swipeX === null) return;
        const dx = e.clientX - swipeX;
        swipeX = null;
        if (Math.abs(dx) > 24) move(dx > 0 ? 1 : -1);
    });

    /* ---------- Open / close ---------- */
    trigger.addEventListener('click', () => {
        if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
        showMenu();
    });
    $('.sum-run-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { stopLoop(); if (game) game.over = true; });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
})();
