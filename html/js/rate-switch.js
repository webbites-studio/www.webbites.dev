// Pricing "Choose ..." links preselect the matching plan in the order form.
(function () {
    'use strict';

    function init() {
        var select = document.getElementById('package');
        if (!select) return;

        document.querySelectorAll('a[data-package]').forEach(function (link) {
            link.addEventListener('click', function () {
                select.value = link.dataset.package;
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

