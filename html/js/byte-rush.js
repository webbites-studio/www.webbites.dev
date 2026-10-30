(function () {
    var trigger = document.querySelector('.byte-rush-trigger');
    var dialog = document.querySelector('.byte-rush-dialog');
    if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;

    var closeButton = dialog.querySelector('.byte-rush-close');
    var startButton = dialog.querySelector('[data-byte-action]');
    var pauseButton = dialog.querySelector('[data-byte-pause]');
    var overlay = dialog.querySelector('[data-byte-overlay]');
    var overlayLabel = dialog.querySelector('[data-byte-overlay-label]');
    var overlayMessage = dialog.querySelector('[data-byte-overlay-message]');
    var live = dialog.querySelector('[data-byte-live]');
    var scoreOutput = dialog.querySelector('[data-byte-score]');
    var bestOutput = dialog.querySelector('[data-byte-best]');
    var comboOutput = dialog.querySelector('[data-byte-combo]');
    var track = dialog.querySelector('.byte-rush-track');
    var entitiesLayer = dialog.querySelector('[data-byte-entities]');
    var markersLayer = dialog.querySelector('[data-byte-lane-markers]');
    var player = dialog.querySelector('[data-byte-player]');
    var ns = 'http://www.w3.org/2000/svg';
    var clickCount = 0;
    var clickTimer = 0;
    var raf = 0;
    var lastFrame = 0;
    var elapsed = 0;
    var spawnTimer = 0;
    var markerOffset = 0;
    var score = 0;
    var best = loadBest();
    var combo = 1;
    var lane = 1;
    var entities = [];
    var state = 'ready';
    var touchStartX = null;

    bestOutput.textContent = String(best);

    function loadBest() {
        try {
            var stored = Number(window.localStorage.getItem('byte-rush-best'));
            return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
        } catch (error) {
            console.warn('Byte Rush could not read the saved best score.', error);
            return 0;
        }
    }

    function saveBest() {
        try {
            window.localStorage.setItem('byte-rush-best', String(best));
        } catch (error) {
            console.warn('Byte Rush could not save the best score.', error);
        }
    }

    function svgElement(name, attributes) {
        var element = document.createElementNS(ns, name);
        Object.keys(attributes).forEach(function (key) {
            element.setAttribute(key, attributes[key]);
        });
        return element;
    }

    function createMarkers() {
        for (var i = 0; i < 9; i += 1) {
            markersLayer.appendChild(svgElement('path', {
                'data-byte-marker': '',
                fill: 'none',
                stroke: '#a5b4fc',
                'stroke-opacity': '0.2',
                'stroke-width': '1'
            }));
        }
    }

    function createEntity(type, entityLane) {
        var group = svgElement('g', { class: 'byte-rush-entity' });

        if (type === 'byte') {
            group.appendChild(svgElement('rect', {
                x: '-13', y: '-13', width: '26', height: '26', rx: '5',
                fill: '#082f49', stroke: '#67e8f9', 'stroke-width': '2'
            }));
            var byteText = svgElement('text', {
                x: '0', y: '4', 'text-anchor': 'middle', fill: '#a5f3fc',
                'font-size': '10', 'font-family': 'monospace', 'font-weight': '700'
            });
            byteText.textContent = '01';
            group.appendChild(byteText);
        } else {
            group.appendChild(svgElement('rect', {
                x: '-15', y: '-13', width: '30', height: '26', rx: '7',
                fill: '#3b102a', stroke: '#fb7185', 'stroke-width': '2'
            }));
            group.appendChild(svgElement('circle', {
                cx: '-5', cy: '-1', r: '2', fill: '#fecdd3'
            }));
            group.appendChild(svgElement('circle', {
                cx: '5', cy: '-1', r: '2', fill: '#fecdd3'
            }));
            group.appendChild(svgElement('path', {
                d: 'M0 6Q7 1 14 6', transform: 'translate(-7 0)',
                fill: 'none', stroke: '#fb7185', 'stroke-width': '2'
            }));
        }

        entitiesLayer.appendChild(group);
        return { type: type, lane: entityLane, z: 0.02, element: group, nearMissed: false };
    }

    function setOverlay(title, message, action, label) {
        overlayLabel.textContent = title;
        overlayMessage.textContent = message;
        startButton.textContent = action;
        startButton.setAttribute('aria-label', label);
        overlay.hidden = false;
        startButton.focus();
    }

    function clearRun() {
        entities.forEach(function (entity) { entity.element.remove(); });
        entities = [];
        elapsed = 0;
        spawnTimer = 0.55;
        markerOffset = 0;
        score = 0;
        combo = 1;
        lane = 1;
        scoreOutput.textContent = '0';
        comboOutput.textContent = '×1';
        player.setAttribute('transform', 'translate(180 372)');
    }

    function stopLoop() {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
        lastFrame = 0;
    }

    function startRun() {
        stopLoop();
        clearRun();
        state = 'playing';
        overlay.hidden = true;
        pauseButton.disabled = false;
        pauseButton.textContent = 'Pause';
        pauseButton.setAttribute('aria-label', 'Pause game');
        live.textContent = 'Run started. Use left and right to switch lanes.';
        pauseButton.focus();
        raf = requestAnimationFrame(frame);
    }

    function endRun() {
        stopLoop();
        state = 'over';
        pauseButton.disabled = true;
        var finalScore = Math.floor(score);
        if (finalScore > best) {
            best = finalScore;
            bestOutput.textContent = String(best);
            saveBest();
        }
        live.textContent = 'Game over. Score ' + finalScore + '. Best ' + best + '.';
        setOverlay('Bug hit!', 'Score: ' + finalScore + ' · Best: ' + best, 'Run it back', 'Play Byte Rush again');
    }

    function setPaused(paused) {
        if (paused && state === 'playing') {
            stopLoop();
            state = 'paused';
            pauseButton.textContent = 'Resume';
            pauseButton.setAttribute('aria-label', 'Resume game');
            live.textContent = 'Game paused.';
            setOverlay('Paused', 'Your run is waiting right here.', 'Resume run', 'Resume Byte Rush');
        } else if (!paused && state === 'paused') {
            state = 'playing';
            overlay.hidden = true;
            pauseButton.textContent = 'Pause';
            pauseButton.setAttribute('aria-label', 'Pause game');
            live.textContent = 'Run resumed.';
            pauseButton.focus();
            raf = requestAnimationFrame(frame);
        }
    }

    function move(direction) {
        if (state !== 'playing') return;
        lane = Math.max(0, Math.min(2, lane + direction));
        player.setAttribute('transform', 'translate(' + (180 + (lane - 1) * 92) + ' 372)');
    }

    function addScore(points) {
        score = Math.floor(score + points);
        scoreOutput.textContent = String(score);
    }

    function spawn() {
        var type = Math.random() < 0.31 ? 'byte' : 'bug';
        var entityLane = Math.floor(Math.random() * 3);
        entities.push(createEntity(type, entityLane));
        spawnTimer = Math.max(0.52, 1.03 - elapsed * 0.004) * (0.82 + Math.random() * 0.36);
    }

    function positionEntity(entity) {
        var depth = Math.pow(Math.min(1, entity.z), 1.5);
        var x = 180 + (entity.lane - 1) * (16 + depth * 80);
        var y = 72 + depth * 340;
        var scale = 0.22 + depth * 0.82;
        entity.element.setAttribute('transform',
            'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + scale.toFixed(2) + ')');
    }

    function updateMarkers(delta, speed) {
        markerOffset = (markerOffset + delta * speed * 0.45) % 1;
        var markers = markersLayer.querySelectorAll('[data-byte-marker]');
        markers.forEach(function (marker, index) {
            var p = ((index / markers.length) + markerOffset) % 1;
            var depth = Math.pow(p, 1.5);
            var y = 72 + depth * 350;
            var halfWidth = 35 + depth * 115;
            marker.setAttribute('d',
                'M' + (180 - halfWidth).toFixed(1) + ' ' + y.toFixed(1) +
                'h' + (halfWidth * 2).toFixed(1));
            marker.setAttribute('stroke-width', (0.5 + depth * 2).toFixed(1));
        });
    }

    function update(delta) {
        elapsed += delta;
        var speed = Math.min(0.76, 0.32 + elapsed * 0.009);
        score += delta * (8 + elapsed * 0.14);
        scoreOutput.textContent = String(Math.floor(score));
        spawnTimer -= delta;
        if (spawnTimer <= 0) spawn();
        updateMarkers(delta, speed);

        var remaining = [];
        for (var i = 0; i < entities.length; i += 1) {
            var entity = entities[i];
            entity.z += delta * speed;
            positionEntity(entity);

            if (entity.lane === lane && entity.z >= 0.89) {
                if (entity.type === 'bug') {
                    endRun();
                    return;
                }
                if (entity.type === 'byte') {
                    addScore(10 * combo);
                    combo = Math.min(9, combo + 1);
                    comboOutput.textContent = '×' + combo;
                    live.textContent = 'Byte collected. Combo times ' + combo + '.';
                    entity.element.remove();
                    continue;
                }
            }

            if (entity.type === 'bug' && entity.lane !== lane && !entity.nearMissed && entity.z >= 0.78) {
                entity.nearMissed = true;
                addScore(5);
                live.textContent = 'Close call! Five bonus points.';
            }

            if (entity.z > 1.08) {
                entity.element.remove();
            } else {
                remaining.push(entity);
            }
        }
        entities = remaining;
    }

    function frame(timestamp) {
        if (state !== 'playing') return;
        if (!lastFrame) lastFrame = timestamp;
        var delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
        lastFrame = timestamp;
        update(delta);
        if (state === 'playing') raf = requestAnimationFrame(frame);
    }

    function openGame() {
        if (dialog.open) return;
        clearRun();
        state = 'ready';
        pauseButton.disabled = true;
        pauseButton.textContent = 'Pause';
        live.textContent = 'Byte Rush ready.';
        dialog.showModal();
        setOverlay('Byte Rush', 'Switch lanes. Dodge the bugs. Grab the bytes.', 'Start run', 'Start Byte Rush');
    }

    trigger.addEventListener('click', function () {
        clickCount += 1;
        window.clearTimeout(clickTimer);
        if (clickCount >= 5) {
            clickCount = 0;
            openGame();
        } else {
            clickTimer = window.setTimeout(function () { clickCount = 0; }, 1400);
        }
    });

    closeButton.addEventListener('click', function () { dialog.close(); });
    startButton.addEventListener('click', function () {
        if (state === 'paused') setPaused(false);
        else startRun();
    });
    pauseButton.addEventListener('click', function () {
        setPaused(state === 'playing');
    });
    dialog.addEventListener('close', function () {
        stopLoop();
        state = 'ready';
        trigger.focus();
    });
    dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('cancel', function () {
        stopLoop();
        state = 'ready';
    });

    dialog.querySelectorAll('[data-byte-move]').forEach(function (button) {
        button.addEventListener('click', function () {
            move(Number(button.getAttribute('data-byte-move')));
        });
    });

    track.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'touch') touchStartX = event.clientX;
    });
    track.addEventListener('pointerup', function (event) {
        if (touchStartX === null) return;
        var distance = event.clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(distance) > 24) move(distance < 0 ? -1 : 1);
    });
    track.addEventListener('pointercancel', function () { touchStartX = null; });

    document.addEventListener('keydown', function (event) {
        if (!dialog.open) return;
        var key = event.key.toLowerCase();
        if (key === 'escape') {
            event.preventDefault();
            dialog.close();
        } else if (key === 'arrowleft' || key === 'a') {
            event.preventDefault();
            move(-1);
        } else if (key === 'arrowright' || key === 'd') {
            event.preventDefault();
            move(1);
        } else if (key === 'p') {
            event.preventDefault();
            setPaused(state === 'playing');
        }
    });

    document.addEventListener('visibilitychange', function () {
        if (document.hidden && state === 'playing') setPaused(true);
    });

    createMarkers();
})();
