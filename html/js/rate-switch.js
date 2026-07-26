(function () {
    'use strict';

    var ACTIVE_RATE_KEY = 'rate-active';
    var DEFAULT_RATE = '888';

    /*
    function hidePanel(el) {
        el.classList.remove('rate-panel-visible');
        el.classList.add('rate-panel-hidden');
        el.addEventListener('transitionend', function onEnd() {
            el.removeEventListener('transitionend', onEnd);
            // Only collapse if still hidden (user didn't switch back mid-transition)
            if (el.classList.contains('rate-panel-hidden')) {
                el.classList.add('rate-panel-gone');
            }
        });
    }

    function showPanel(el) {
        el.classList.remove('rate-panel-gone');
        // Force reflow so display:none is cleared before the transition starts
        el.offsetHeight; // eslint-disable-line no-unused-expressions
        el.classList.remove('rate-panel-hidden');
        el.classList.add('rate-panel-visible');
    }
    */

    function hidePanel(el) {
        el.classList.add('rate-panel-hidden');
        el.addEventListener('transitionend', function onEnd() {
            el.removeEventListener('transitionend', onEnd);
            el.classList.remove('rate-panel-visible');
            // el.classList.add('rate-panel-gone');
        });
    }

    function showPanel(el) {
        // el.classList.remove('rate-panel-gone');
        el.classList.remove('rate-panel-hidden');
        el.addEventListener('transitionend', function onEnd() {
            el.removeEventListener('transitionend', onEnd);
            el.classList.add('rate-panel-visible');
        });
    }

    function setRate(rate) {
        // Update all rate buttons across the page
        document.querySelectorAll('button[data-rate]').forEach(function (btn) {
            var isActive = btn.dataset.rate === rate;
            btn.classList.toggle('button-rate-active', isActive);
            btn.classList.toggle('button-rate-inactive', !isActive);
        });

        // Transition panels in/out
        document.querySelectorAll('[data-rate]:not(button)').forEach(function (el) {
            if (el.dataset.rate === rate) {
                showPanel(el);
            } else {
                hidePanel(el);
            }
        });

        document.querySelector("select#package").value = rate;

        sessionStorage.setItem(ACTIVE_RATE_KEY, rate);
    }

    function init() {
        /*
        // Restore last selected rate (default to 'regular')
        var currentRate = sessionStorage.getItem(ACTIVE_RATE_KEY) || DEFAULT_RATE;

        // Set initial visibility without animation (suppress transition on load)
        document.querySelectorAll('[data-rate]:not(button)').forEach(function (el) {
            // el.classList.add('rate-panel-no-transition');
            var isActive = el.dataset.rate === currentRate;
            el.classList.toggle('rate-panel-visible', isActive);
            el.classList.toggle('rate-panel-hidden', !isActive);
            // el.classList.toggle('rate-panel-gone', !isActive);
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
        */

        let currentRate = sessionStorage.getItem(ACTIVE_RATE_KEY) || DEFAULT_RATE;
        setRate(currentRate);

        // Attach click handlers
        document.querySelectorAll('button[data-rate]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
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
