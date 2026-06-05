// ── Theme toggle ──
(function () {
    var STORAGE_KEY = 'studio-theme';
    var html = document.documentElement;

    function prefersDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function applyMode(mode) {
        if (mode === 'dark' || (mode === 'system' && prefersDark())) {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', 'light');
        }
        document.querySelectorAll('#theme-toggle button').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }

    var saved = localStorage.getItem(STORAGE_KEY) || 'system';
    applyMode(saved);

    document.querySelectorAll('#theme-toggle button').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var mode = btn.dataset.mode;
            localStorage.setItem(STORAGE_KEY, mode);
            applyMode(mode);
        });
    });

    // React to OS preference changes when in system mode
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
            if ((localStorage.getItem(STORAGE_KEY) || 'system') === 'system') applyMode('system');
        });
    }
})();

// ── Staggered reveal on scroll ──
(function () {
    var groups = document.querySelectorAll('.stagger');
    if (!groups.length) return;

    // Assign per-child stagger index for transition-delay calc().
    groups.forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
            child.classList.add('stagger-item');
            child.style.setProperty('--stagger-index', i);
        });
    });

    if (!('IntersectionObserver' in window)) {
        groups.forEach(function (g) { g.classList.add('in-view'); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    groups.forEach(function (g) { observer.observe(g); });
})();
