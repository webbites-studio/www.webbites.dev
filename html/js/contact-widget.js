/**
 * Contact Widget - CAPTCHA-Protected Contact Information
 * Completely separate from order form (form-submit.js)
 * Handles invisible Turnstile verification and SVG insertion
 */

(function () {
    'use strict';

    const CONTACT_WIDGET_CONFIG = {
        turnstiledivId: 'contact-turnstile',
        placementId: 'contact-placement',
        loadingId: 'contact-loading',
        errorId: 'contact-error',
        endpointUrl: 'https://contact-info.ivan-kuchin-13d.workers.dev',
        maxRetries: 5,
        sitekey: '0x4AAAAAAD99Y4dozzYRDimq'
    };

    let retryCount = 0;
    let contactSVG = ""; // Placeholder for the SVG content

    /**
     * Initialize the contact widget on DOM ready
     */
    function initContactWidget() {
        const turnstileDiv = document.getElementById(CONTACT_WIDGET_CONFIG.turnstiledivId);

        if (!turnstileDiv) {
            console.warn('[Contact Widget] Turnstile container not found');
            return;
        }

        // Wait for Turnstile API to be available
        if (typeof window.turnstile === 'undefined') {
            console.warn('[Contact Widget] Turnstile API not loaded yet');
            // Retry after a short delay
            setTimeout(initContactWidget, 100);
            return;
        }

        // Render Turnstile widget explicitly (not auto-render to avoid conflicts with order form)
        window.turnstile.render(`#${CONTACT_WIDGET_CONFIG.turnstiledivId}`, {
            sitekey: CONTACT_WIDGET_CONFIG.sitekey,
            theme: getTheme(),
            callback: onTurnstileSuccess,
            'error-callback': onTurnstileError,
            'expired-callback': onTurnstileExpired
        });
    }

    /**
     * Called when Turnstile verification succeeds
     */
    async function onTurnstileSuccess(token) {
        console.log('[Contact Widget] Turnstile verified, fetching contact info...');

        showLoading(true);
        hideError();

        try {
            await fetchContactInfo(token);
            // Success! Reset retry counter for future use
            retryCount = 0;
        } catch (error) {
            handleVerificationError(error);
        }
    }

    /**
     * Called when Turnstile verification fails
     */
    function onTurnstileError(error) {
        console.error('[Contact Widget] Turnstile error:', error);
        showError(`Verification error: ${error}`);
        showLoading(false);
    }

    /**
     * Called when Turnstile token expires
     */
    function onTurnstileExpired() {
        console.log('[Contact Widget] Turnstile token expired, resetting...');
        // Reset is not required due to contact info has already been pulled.
        // window.turnstile.reset(`#${CONTACT_WIDGET_CONFIG.turnstiledivId}`);
    }

    /**
     * Fetch contact information from backend
     */
    async function fetchContactInfo(token) {
        const response = await fetch(CONTACT_WIDGET_CONFIG.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                turnstileToken: token
            })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        if (!result.svg) {
            throw new Error('No SVG content in response');
        }

        contactSVG = result.svg; // Store the SVG content for potential future use

        // Insert SVG into placement div
        renderContactSVG(contactSVG);

        showLoading(false);

    }

    function renderContactSVG(svgContent) {
        const placementDiv = document.getElementById(CONTACT_WIDGET_CONFIG.placementId);
        if (placementDiv) {
            // Get the theme-appropriate text color and replace SVG fill
            const fontColor = getComputedStyle(document.documentElement).getPropertyValue('--text-soft').trim();
            let themeSvg = svgContent.replace(/fill="#000000"/g, `fill="${fontColor}"`);

            placementDiv.innerHTML = themeSvg;
            placementDiv.classList.add('contact-revealed');
            console.log('[Contact Widget] Contact info rendered');
        }
    }

    /**
     * Handle verification errors with retry logic
     */
    function handleVerificationError(error) {
        console.error('[Contact Widget] Verification error:', error);

        retryCount++;

        if (retryCount < CONTACT_WIDGET_CONFIG.maxRetries) {
            console.log(`[Contact Widget] Retrying... (${retryCount}/${CONTACT_WIDGET_CONFIG.maxRetries})`);
            showError(`Attempting to retrieve contact info (${retryCount}/${CONTACT_WIDGET_CONFIG.maxRetries})...`);

            // Reset Turnstile for retry
            window.turnstile.reset(`#${CONTACT_WIDGET_CONFIG.turnstiledivId}`);

            showLoading(false);
        } else {
            // Max retries exceeded
            console.error('[Contact Widget] Max retries exceeded');
            showError('Failed to fetch contact info. Email us through the order form instead.');
            showLoading(false);
        }
    }

    /**
     * Show/hide loading indicator
     */
    function showLoading(show) {
        const loadingDiv = document.getElementById(CONTACT_WIDGET_CONFIG.loadingId);
        if (loadingDiv) {
            loadingDiv.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorDiv = document.getElementById(CONTACT_WIDGET_CONFIG.errorId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    /**
     * Hide error message
     */
    function hideError() {
        const errorDiv = document.getElementById(CONTACT_WIDGET_CONFIG.errorId);
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    /**
     * Handle theme changes (if theme switcher exists)
     */
    function setupThemeListener() {
        // Listen for theme changes and update Turnstile theme accordingly
        const observer = new MutationObserver(() => {
            renderContactSVG(contactSVG); // Re-render SVG with new theme colors
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    /**
     * Initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initContactWidget();
            setupThemeListener();
        });
    } else {
        // DOM already loaded
        initContactWidget();
        setupThemeListener();
    }

})();
