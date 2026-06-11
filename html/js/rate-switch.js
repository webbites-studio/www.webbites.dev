(function () {
    'use strict';

    var ACTIVE_RATE_KEY = 'rate-active';
    var DEFAULT_RATE = 'regular';

    function setRate(rate) {
        // Update all rate buttons across the page
        document.querySelectorAll('button[data-rate]').forEach(function (btn) {
            var isActive = btn.dataset.rate === rate;
            btn.classList.toggle('button-rate-active', isActive);
            btn.classList.toggle('button-rate-inactive', !isActive);
        });

        // Transition out non-matching panels, transition in matching panels
        document.querySelectorAll('[data-rate]:not(button)').forEach(function (el) {
            var isActive = el.dataset.rate === rate;
            el.classList.toggle('rate-panel-visible', isActive);
            el.classList.toggle('rate-panel-hidden', !isActive);
        });

        document.querySelector("select#package").value = rate;

        sessionStorage.setItem(ACTIVE_RATE_KEY, rate);
    }

    function init() {
        // Restore last selected rate (default to 'regular')
        var currentRate = sessionStorage.getItem(ACTIVE_RATE_KEY) || DEFAULT_RATE;

        // Set initial visibility without animation (suppress transition on load)
        document.querySelectorAll('[data-rate]:not(button)').forEach(function (el) {
            el.classList.add('rate-panel-no-transition');
            var isActive = el.dataset.rate === currentRate;
            el.classList.toggle('rate-panel-visible', isActive);
            el.classList.toggle('rate-panel-hidden', !isActive);
        });

        // Force reflow so the no-transition class takes effect before we remove it
        document.body.offsetHeight; // eslint-disable-line no-unused-expressions

        document.querySelectorAll('[data-rate]:not(button)').forEach(function (el) {
            el.classList.remove('rate-panel-no-transition');
        });

        // Sync button states
        document.querySelectorAll('button[data-rate]').forEach(function (btn) {
            var isActive = btn.dataset.rate === currentRate;
            btn.classList.toggle('button-rate-active', isActive);
            btn.classList.toggle('button-rate-inactive', !isActive);
        });

        document.querySelector("select#package").value = currentRate;

        // Attach click handlers
        document.querySelectorAll('button[data-rate]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setRate(btn.dataset.rate);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
