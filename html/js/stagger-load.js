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

