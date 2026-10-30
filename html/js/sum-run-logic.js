/* Sum Knight Run: pure, deterministic game logic (no DOM). */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.SumRunLogic = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const CAP = 999999;
    const GOAL_BUFFER = 1.05;
    const MAX_SHIFT = 2; // lanes the player can move between two consecutive rows
    const KEEP_TOP = 16, KEEP_BOTTOM = 4;

    const clamp = (v) => Math.max(-CAP, Math.min(CAP, Math.trunc(v) || 0));

    function rng(seed) {
        let s = (seed >>> 0) || 1;
        return () => {
            s ^= s << 13; s >>>= 0;
            s ^= s >>> 17;
            s ^= s << 5; s >>>= 0;
            return s / 4294967296;
        };
    }

    const OPS = {
        add: { label: (n) => '+' + n, fn: (x, n) => x + n },
        sub: { label: (n) => '−' + n, fn: (x, n) => x - n },
        mul: { label: (n) => '×' + n, fn: (x, n) => x * n },
        div: { label: (n) => '÷' + n, fn: (x, n) => x / n },
        neg: { label: () => '×−1', fn: (x) => -x },
        sqrt: { label: () => '√x', fn: (x) => Math.sign(x) * Math.floor(Math.sqrt(Math.abs(x))), adv: true },
        pow: { label: () => 'x²', fn: (x) => x * Math.abs(x), adv: true },
        mod: { label: (n) => 'mod ' + n, fn: (x, n) => x % n, adv: true },
        log: { label: () => 'log₂', fn: (x) => Math.sign(x) * Math.floor(Math.log2(Math.abs(x) + 1)), adv: true }
    };

    const LEVELS = [
        { name: 'Training Yard', lanes: 3, gap: 900, rows: 24, start: 5, mag: 6, neg: .30, opRate: .25, ops: ['add', 'sub', 'mul2'], adv: ['sqrt'], knights: [], kRate: 0, goal: .75 },
        { name: 'Castle Gate', lanes: 3, gap: 860, rows: 28, start: 5, mag: 8, neg: .32, opRate: .28, ops: ['add', 'sub', 'mul2', 'div2'], adv: ['sqrt', 'mod7'], knights: ['guard'], kRate: .12, goal: .78 },
        { name: 'Outer Walls', lanes: 4, gap: 820, rows: 30, start: 8, mag: 10, neg: .34, opRate: .30, ops: ['add', 'sub', 'mul2', 'div2'], adv: ['sqrt', 'mod7', 'pow'], knights: ['guard'], kRate: .16, goal: .80 },
        { name: 'Patrol Route', lanes: 4, gap: 780, rows: 32, start: 8, mag: 12, neg: .35, opRate: .30, ops: ['add', 'sub', 'mul2', 'mul3', 'div2'], adv: ['sqrt', 'mod7', 'pow', 'log'], knights: ['guard', 'patrol'], kRate: .18, goal: .82 },
        { name: 'Courtyard', lanes: 5, gap: 740, rows: 34, start: 10, mag: 15, neg: .36, opRate: .32, ops: ['add', 'sub', 'mul2', 'mul3', 'div2'], adv: ['sqrt', 'mod7', 'pow', 'log'], knights: ['guard', 'patrol'], kRate: .20, goal: .84 },
        { name: 'Jousting Field', lanes: 5, gap: 700, rows: 36, start: 10, mag: 18, neg: .38, opRate: .32, ops: ['add', 'sub', 'mul2', 'mul3', 'div2', 'div3'], adv: ['sqrt', 'mod10', 'pow', 'log'], knights: ['guard', 'patrol', 'charger'], kRate: .22, goal: .86 },
        { name: 'Great Hall', lanes: 6, gap: 660, rows: 38, start: 12, mag: 20, neg: .40, opRate: .34, ops: ['add', 'sub', 'mul2', 'mul3', 'div2', 'div3', 'neg'], adv: ['sqrt', 'mod10', 'pow', 'log'], knights: ['guard', 'patrol', 'charger'], kRate: .24, goal: .88 },
        { name: 'Armory', lanes: 6, gap: 620, rows: 40, start: 12, mag: 24, neg: .40, opRate: .35, ops: ['add', 'sub', 'mul2', 'mul3', 'div2', 'div3', 'neg'], adv: ['sqrt', 'mod7', 'pow', 'log'], knights: ['guard', 'patrol', 'charger'], kRate: .26, goal: .90 },
        { name: 'Throne Stairs', lanes: 7, gap: 590, rows: 42, start: 15, mag: 28, neg: .42, opRate: .36, ops: ['add', 'sub', 'mul2', 'mul3', 'div2', 'div3', 'neg'], adv: ['sqrt', 'mod10', 'pow', 'log'], knights: ['guard', 'patrol', 'charger'], kRate: .28, goal: .92 },
        { name: 'King of Numbers', lanes: 7, gap: 560, rows: 46, start: 15, mag: 32, neg: .44, opRate: .38, ops: ['add', 'sub', 'mul2', 'mul3', 'div2', 'div3', 'neg'], adv: ['sqrt', 'mod7', 'pow', 'log'], knights: ['guard', 'patrol', 'charger'], kRate: .30, goal: .95 }
    ];

    function parseOp(code) {
        const m = /^([a-z]+)(\d*)$/.exec(code);
        return { op: m[1], fixed: m[2] ? Number(m[2]) : null };
    }

    function label(item) {
        if (item.type === 'num') return (item.value >= 0 ? '+' : '−') + Math.abs(item.value);
        return OPS[item.op].label(item.n);
    }

    function apply(score, item) {
        if (!item || item.type === 'knight') return score;
        if (item.type === 'num') return clamp(score + item.value);
        return clamp(OPS[item.op].fn(score, item.n));
    }

    function makeOp(code, cfg, rand) {
        const { op, fixed } = parseOp(code);
        let n = fixed;
        if (n === null && (op === 'add' || op === 'sub')) {
            n = 5 * (1 + Math.floor(rand() * 4)) * Math.ceil(cfg.mag / 10);
        }
        return { type: 'op', op, n };
    }

    /** Best reachable final score along a real path, or null if every path is blocked. */
    function solve(rows, lanes, start) {
        let states = Array.from({ length: lanes }, () => null);
        states[Math.floor(lanes / 2)] = [start];
        for (const row of rows) {
            const next = Array.from({ length: lanes }, () => null);
            for (let l = 0; l < lanes; l++) {
                const cell = row[l];
                if (cell && cell.type === 'knight') continue;
                const set = new Set();
                for (let p = Math.max(0, l - MAX_SHIFT); p <= Math.min(lanes - 1, l + MAX_SHIFT); p++) {
                    if (!states[p]) continue;
                    for (const v of states[p]) set.add(apply(v, cell));
                }
                if (!set.size) continue;
                const sorted = [...set].sort((a, b) => b - a);
                // Keep a few lowest values too, so ×−1 and x² can still turn them into highs.
                next[l] = sorted.length > KEEP_TOP + KEEP_BOTTOM
                    ? sorted.slice(0, KEEP_TOP).concat(sorted.slice(-KEEP_BOTTOM))
                    : sorted;
            }
            states = next;
        }
        let best = null;
        for (const s of states) if (s && (best === null || s[0] > best)) best = s[0];
        return best;
    }

    function generate(index, advanced) {
        const cfg = LEVELS[index];
        const opCodes = advanced ? cfg.ops.concat(cfg.adv) : cfg.ops;
        for (let attempt = 0; attempt < 60; attempt++) {
            const rand = rng(7919 * (index + 1) + (advanced ? 100003 : 0) + attempt * 131);
            const rows = [];
            for (let r = 0; r < cfg.rows; r++) {
                const row = Array(cfg.lanes).fill(null);
                if (r >= 2) {
                    if (cfg.knights.length && r >= 3 && rand() < cfg.kRate) {
                        const count = Math.min(cfg.lanes - 2, 1 + (cfg.lanes >= 5 && rand() < .35 ? 1 : 0));
                        for (let k = 0; k < count; k++) {
                            const lane = Math.floor(rand() * cfg.lanes);
                            row[lane] = { type: 'knight', kind: cfg.knights[Math.floor(rand() * cfg.knights.length)] };
                        }
                    }
                    for (let l = 0; l < cfg.lanes; l++) {
                        if (row[l] || rand() > .55) continue;
                        if (rand() < cfg.opRate) {
                            row[l] = makeOp(opCodes[Math.floor(rand() * opCodes.length)], cfg, rand);
                        } else {
                            const v = 1 + Math.floor(rand() * cfg.mag);
                            row[l] = { type: 'num', value: rand() < cfg.neg ? -v : v };
                        }
                    }
                }
                rows.push(row);
            }
            const max = solve(rows, cfg.lanes, cfg.start);
            if (max === null || max <= cfg.start + 5) continue;
            const goal = Math.max(cfg.start + 1, Math.floor(max * Math.min(cfg.goal, 1 / GOAL_BUFFER)));
            if (max < goal * GOAL_BUFFER) continue;
            return { index, advanced, cfg, rows, start: cfg.start, goal, max, maxShift: MAX_SHIFT };
        }
        throw new Error('Sum Knight Run: could not build a solvable level ' + (index + 1));
    }

    const cache = new Map();
    function getLevel(index, advanced) {
        const key = index + ':' + (advanced ? 'a' : 'b');
        if (!cache.has(key)) cache.set(key, generate(index, advanced));
        return cache.get(key);
    }

    function opList(level) {
        const codes = level.advanced ? level.cfg.ops.concat(level.cfg.adv) : level.cfg.ops;
        return codes.map((c) => {
            const { op, fixed } = parseOp(c);
            return op === 'add' ? '+n' : op === 'sub' ? '−n' : OPS[op].label(fixed);
        });
    }

    return {
        LEVELS, OPS, GOAL_BUFFER, MAX_SHIFT, apply, label, solve, getLevel, opList,
        isAdvanced: (op) => !!(OPS[op] && OPS[op].adv)
    };
});
