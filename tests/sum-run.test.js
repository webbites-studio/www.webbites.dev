const assert = require('node:assert/strict');
const test = require('node:test');
const logic = require('../html/js/sum-run-logic.js');

for (const advanced of [false, true]) {
    test(`every ${advanced ? 'advanced' : 'basic'} level is solvable with a 5% buffer over the goal`, () => {
        logic.LEVELS.forEach((cfg, i) => {
            const level = logic.getLevel(i, advanced);
            assert.equal(level.rows.length, cfg.rows);
            assert.ok(level.goal > level.start, `level ${i + 1} goal above start`);
            assert.ok(level.max >= level.goal * logic.GOAL_BUFFER, `level ${i + 1} buffer`);
            assert.equal(logic.solve(level.rows, cfg.lanes, level.start), level.max);
        });
    });
}

test('levels ramp up in lanes and speed', () => {
    for (let i = 1; i < logic.LEVELS.length; i++) {
        assert.ok(logic.LEVELS[i].lanes >= logic.LEVELS[i - 1].lanes);
        assert.ok(logic.LEVELS[i].gap < logic.LEVELS[i - 1].gap);
    }
    assert.equal(logic.LEVELS.at(-1).lanes, 7);
});

test('math ops are applied as integers and knights do not change the score', () => {
    assert.equal(logic.apply(10, { type: 'num', value: -4 }), 6);
    assert.equal(logic.apply(7, { type: 'op', op: 'div', n: 2 }), 3);
    assert.equal(logic.apply(-9, { type: 'op', op: 'sqrt' }), -3);
    assert.equal(logic.apply(-5, { type: 'op', op: 'pow' }), -25);
    assert.equal(logic.apply(23, { type: 'op', op: 'mod', n: 7 }), 2);
    assert.equal(logic.apply(12, { type: 'knight', kind: 'guard' }), 12);
});
