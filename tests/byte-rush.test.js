const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const logic = require('../html/js/byte-rush-logic.js');

const gameSource = fs.readFileSync(
    path.join(__dirname, '../html/js/byte-rush.js'),
    'utf8'
);

test('player depth matches the track projection and only forward crossings count', () => {
    const playerDepth = logic.depthAtY(372, 72, 340);
    const projectedY = 72 + Math.pow(playerDepth, 1.5) * 340;

    assert.ok(Math.abs(projectedY - 372) < 1e-9);
    assert.equal(logic.crossesDepth(playerDepth - 0.01, playerDepth, playerDepth), true);
    assert.equal(logic.crossesDepth(playerDepth, playerDepth + 0.01, playerDepth), false);
    assert.equal(logic.crossesDepth(playerDepth + 0.01, playerDepth + 0.02, playerDepth), false);
});

test('the game opens on one click and supports keyboard lane controls', () => {
    const game = createGame();

    game.trigger.click();
    assert.equal(game.dialog.open, true);

    game.startButton.click();
    assert.equal(game.overlay.hidden, true);
    game.document.emit('keydown', { key: 'ArrowLeft' });
    assert.equal(game.player.getAttribute('transform'), 'translate(88 372)');

    game.document.emit('keydown', { key: 'Escape' });
    assert.equal(game.dialog.open, false);
    assert.equal(game.document.activeElement, game.trigger);
});

test('a bug that passes the player keeps moving and cannot cause a late collision', () => {
    const game = startWithEntity('bug');
    const bug = game.entities.firstElementChild;
    game.moveLeft.click();

    advanceUntil(game, () => entityY(bug) > 372);
    const passedY = entityY(bug);
    assert.equal(game.overlay.hidden, true);

    game.moveRight.click();
    game.tick();
    assert.equal(game.overlay.hidden, true);
    assert.ok(entityY(bug) > passedY);

    advanceUntil(game, () => !bug.isConnected);
    assert.equal(game.overlay.hidden, true);
});

test('a byte that passes the player keeps moving and cannot be collected late', () => {
    const game = startWithEntity('byte');
    const byte = game.entities.firstElementChild;
    game.moveLeft.click();

    advanceUntil(game, () => entityY(byte) > 372);
    const passedY = entityY(byte);
    assert.equal(game.combo.textContent, '×1');

    game.moveRight.click();
    game.tick();
    assert.equal(game.combo.textContent, '×1');
    assert.ok(entityY(byte) > passedY);

    advanceUntil(game, () => !byte.isConnected);
    assert.equal(game.combo.textContent, '×1');
    assert.equal(game.overlay.hidden, true);
});

test('bugs and bytes still interact when they reach the player', () => {
    const bugGame = startWithEntity('bug');
    advanceUntil(bugGame, () => bugGame.overlayLabel.textContent === 'Bug hit!');
    assert.equal(bugGame.pauseButton.disabled, true);

    const byteGame = startWithEntity('byte');
    const byte = byteGame.entities.firstElementChild;
    advanceUntil(byteGame, () => byteGame.combo.textContent === '×2');
    assert.equal(byte.isConnected, false);
});

function createGame(randomValues) {
    const document = new FakeElement('#document');
    document.hidden = false;
    document.activeElement = null;
    document.createElementNS = function (namespace, name) {
        return new FakeElement(name, {}, document);
    };

    const trigger = append(document, element('button', { class: 'byte-rush-trigger' }, document));
    const dialog = append(document, element('dialog', { class: 'byte-rush-dialog' }, document));
    const header = append(dialog, element('header', {}, document));
    append(header, element('button', { class: 'byte-rush-close' }, document));
    const scoreboard = append(dialog, element('section', {}, document));
    const score = append(scoreboard, element('strong', { 'data-byte-score': '' }, document));
    const best = append(scoreboard, element('strong', { 'data-byte-best': '' }, document));
    const combo = append(scoreboard, element('strong', { 'data-byte-combo': '' }, document));
    const stage = append(dialog, element('div', {}, document));
    const track = append(stage, element('svg', { class: 'byte-rush-track' }, document));
    const markers = append(track, element('g', { 'data-byte-lane-markers': '' }, document));
    const entities = append(track, element('g', { 'data-byte-entities': '' }, document));
    const player = append(track, element('g', { 'data-byte-player': '' }, document));
    const overlay = append(stage, element('div', { 'data-byte-overlay': '' }, document));
    const overlayLabel = append(overlay, element('p', { 'data-byte-overlay-label': '' }, document));
    append(overlay, element('p', { 'data-byte-overlay-message': '' }, document));
    const startButton = append(overlay, element('button', { 'data-byte-action': '' }, document));
    const live = append(stage, element('p', { 'data-byte-live': '' }, document));
    const controls = append(dialog, element('div', {}, document));
    const moveLeft = append(controls, element('button', { 'data-byte-move': '-1' }, document));
    const pauseButton = append(controls, element('button', { 'data-byte-pause': '' }, document));
    const moveRight = append(controls, element('button', { 'data-byte-move': '1' }, document));
    const localStorage = new Map();
    const window = {
        ByteRushLogic: logic,
        localStorage: {
            getItem: key => localStorage.has(key) ? localStorage.get(key) : null,
            setItem: (key, value) => localStorage.set(key, String(value))
        }
    };
    const pendingFrames = new Map();
    let nextFrameId = 0;
    let timestamp = 0;
    let randomIndex = 0;
    const math = Object.create(Math);
    math.random = function () {
        if (randomIndex < randomValues.length) return randomValues[randomIndex++];
        return 0.5;
    };
    const context = {
        document: document,
        window: window,
        Math: math,
        console: { warn: function () {}, error: function () {} },
        requestAnimationFrame: function (callback) {
            const id = ++nextFrameId;
            pendingFrames.set(id, callback);
            return id;
        },
        cancelAnimationFrame: function (id) { pendingFrames.delete(id); }
    };

    document.querySelector = function (selector) {
        return FakeElement.prototype.querySelector.call(document, selector);
    };
    vm.runInNewContext(gameSource, context, { filename: 'byte-rush.js' });

    function tick() {
        timestamp += 50;
        const callbacks = Array.from(pendingFrames.values());
        pendingFrames.clear();
        callbacks.forEach(callback => callback(timestamp));
    }

    return {
        document: document,
        trigger: trigger,
        dialog: dialog,
        startButton: startButton,
        pauseButton: pauseButton,
        overlay: overlay,
        overlayLabel: overlayLabel,
        score: score,
        combo: combo,
        entities: entities,
        player: player,
        moveLeft: moveLeft,
        moveRight: moveRight,
        tick: tick
    };
}

function startWithEntity(type) {
    const game = createGame(type === 'byte' ? [0.1, 0.5, 0.5] : [0.5, 0.5, 0.5]);
    game.trigger.click();
    game.startButton.click();
    advanceUntil(game, () => game.entities.firstElementChild !== null);
    game.tick();
    return game;
}

function advanceUntil(game, predicate, limit) {
    const maxFrames = limit || 200;
    for (let frame = 0; frame < maxFrames; frame += 1) {
        if (predicate()) return;
        game.tick();
    }
    assert.fail('Condition was not reached within ' + maxFrames + ' frames.');
}

function entityY(entity) {
    const transform = entity.getAttribute('transform');
    const match = /translate\([^ ]+ ([^)]+)\)/.exec(transform || '');
    assert.ok(match, 'Entity has a projected position');
    return Number(match[1]);
}

function element(tagName, attributes, document) {
    return new FakeElement(tagName, attributes, document);
}

function append(parent, child) {
    parent.appendChild(child);
    return child;
}

function matches(element, selector) {
    if (selector[0] === '.') {
        return (element.getAttribute('class') || '').split(/\s+/).includes(selector.slice(1));
    }
    const attribute = /^\[([^\]]+)\]$/.exec(selector);
    if (!attribute) return false;
    const parts = attribute[1].split('=');
    const name = parts[0];
    if (!element.hasAttribute(name)) return false;
    return parts.length === 1 || element.getAttribute(name) === parts[1].replace(/^["']|["']$/g, '');
}

class FakeElement {
    constructor(tagName, attributes, ownerDocument) {
        this.tagName = tagName;
        this.attributes = Object.assign({}, attributes);
        this.ownerDocument = ownerDocument || this;
        this.children = [];
        this.parentNode = null;
        this.listeners = Object.create(null);
        this.textContent = '';
        this.hidden = false;
        this.disabled = false;
        this.open = false;
        this.value = '';
    }

    get firstElementChild() {
        return this.children[0] || null;
    }

    get isConnected() {
        let current = this;
        while (current) {
            if (current.tagName === '#document') return true;
            current = current.parentNode;
        }
        return false;
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    remove() {
        if (!this.parentNode) return;
        const siblings = this.parentNode.children;
        siblings.splice(siblings.indexOf(this), 1);
        this.parentNode = null;
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);
    }

    getAttribute(name) {
        return this.hasAttribute(name) ? this.attributes[name] : null;
    }

    hasAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this.attributes, name);
    }

    addEventListener(type, callback) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(callback);
    }

    emit(type, properties) {
        const event = Object.assign({
            type: type,
            target: this,
            preventDefault: function () { this.defaultPrevented = true; }
        }, properties);
        (this.listeners[type] || []).slice().forEach(callback => callback(event));
        return event;
    }

    click() {
        if (!this.disabled) this.emit('click');
    }

    focus() {
        if (this.ownerDocument) this.ownerDocument.activeElement = this;
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }

    querySelectorAll(selector) {
        const results = [];
        function visit(parent) {
            parent.children.forEach(child => {
                if (matches(child, selector)) results.push(child);
                visit(child);
            });
        }
        visit(this);
        return results;
    }

    showModal() {
        this.open = true;
    }

    close() {
        if (!this.open) return;
        this.open = false;
        this.emit('close');
    }
}
