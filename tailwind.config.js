/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./html/**/*.html', './html/js/**/*.js'],
    theme: {
        extend: {
            // Semantic colors resolve to CSS variables in html/css/styles.css, so light/dark switch without overrides.
            colors: {
                fg: {
                    DEFAULT: 'var(--text-base)',
                    subtle: 'var(--text-subtle)',
                    soft: 'var(--text-soft)',
                    muted: 'var(--text-muted)'
                },
                accent: 'var(--accent)',
                section: 'var(--bg-section)',
                card: 'var(--bg-card)',
                form: 'var(--bg-form)',
                field: 'var(--bg-field)',
                chip: 'var(--bg-chip)',
                nav: 'var(--bg-nav)',
                line: 'var(--border-card)'
            },
            fontFamily: {
                sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
            },
            boxShadow: {
                glow: '9px 10px 50px 0px #7c3aeda3'
            }
        }
    }
};
