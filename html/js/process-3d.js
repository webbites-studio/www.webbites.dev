// ── "How it works" 3D stage: mouse tilt + caption linking ──
(function () {
    var stage = document.querySelector('[data-process-stage]');
    if (!stage) return;

    var scene = stage.querySelector('.process-scene');
    var captions = document.querySelectorAll('[data-process-step]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var BASE_X = 6, MAX_X = 14, MAX_Y = 22;
    var target = { x: BASE_X, y: 0 };
    var current = { x: BASE_X, y: 0 };
    var raf = 0;

    if (reduceMotion.matches) {
        stage.querySelectorAll('svg').forEach(function (svg) {
            if (svg.pauseAnimations) svg.pauseAnimations();
        });
    }

    function tick() {
        current.x += (target.x - current.x) * 0.08;
        current.y += (target.y - current.y) * 0.08;
        scene.style.transform = 'rotateX(' + current.x.toFixed(2) + 'deg) rotateY(' + current.y.toFixed(2) + 'deg)';
        var settled = Math.abs(target.x - current.x) < 0.01 && Math.abs(target.y - current.y) < 0.01;
        raf = settled ? 0 : requestAnimationFrame(tick);
    }

    function animate() {
        if (!raf) raf = requestAnimationFrame(tick);
    }

    function highlightCaption(step) {
        captions.forEach(function (c) {
            c.classList.toggle('is-active', c.getAttribute('data-process-step') === step);
        });
    }

    stage.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
        var r = stage.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        target.x = BASE_X + (py - 0.5) * 2 * MAX_X;
        target.y = (0.5 - px) * 2 * MAX_Y;
        stage.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        stage.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        highlightCaption(String(Math.min(3, Math.floor(px * 3) + 1)));
        animate();
    });

    stage.addEventListener('pointerleave', function () {
        target.x = BASE_X;
        target.y = 0;
        highlightCaption(null);
        animate();
    });

    var landTimer = 0;

    captions.forEach(function (caption) {
        caption.addEventListener('mouseenter', function () {
            clearTimeout(landTimer);
            stage.classList.remove('is-landing');
            stage.setAttribute('data-active', caption.getAttribute('data-process-step'));
        });
        caption.addEventListener('mouseleave', function () {
            var wasLaunch = stage.getAttribute('data-active') === '3';
            stage.removeAttribute('data-active');
            if (wasLaunch) {
                stage.classList.add('is-landing');
                landTimer = setTimeout(function () {
                    stage.classList.remove('is-landing');
                }, 1200);
            }
        });
    });
})();
