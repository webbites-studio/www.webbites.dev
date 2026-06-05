# WebBites.dev Project Guidelines

## Project Overview
This is a **single-page website** serving as a web studio portfolio and marketing site.

## Project Structure
- **HTML/Assets**: All production files are in the `html/` directory
- **Documentation**: All project documentation is kept in the `docs/` folder
- **CSS**: All stylesheets must be in `html/css/` folder
- **Scripts**: All JavaScript files must be in `html/js/` folder

## UI Component Standards

### Interactive Panels
All interactive panels (cards, sections, features) follow these mandatory patterns:

1. **Data Attribute Tagging**: Every interactive panel MUST have a `data-interactive-panel` attribute
   - **Applies to**: Content cards, feature sections, service panels, pricing cards, testimonial cards
   - **Does NOT apply to**: Navigation (`nav`), sidebars (`aside`), footers (`footer`), or purely static text sections
   ```html
   <div data-interactive-panel class="hero-panel rounded-2xl">
   ```

2. **Hover Zoom Effect**: All panels zoom in by 2% on hover
   - Implemented via CSS transform: `scale(1.02)`
   - Defined in `[data-interactive-panel]:hover` selector
   - Transition duration: 0.3s ease

3. **Glow Border Effect**: All panels have animated glow around borders
   - Uses `glowFlicker` animation (8s ease-in-out infinite)
   - Creates dynamic shadow effects with purple/indigo glow
   - Always applied to `[data-interactive-panel]` elements

4. **Stagger Loading**: All panels MUST implement staggered reveal animations on scroll
   - Every group of panels requires a parent container with `.stagger` class
   - Children auto-tagged as `.stagger-item` with `--stagger-index` CSS variable
   - Intersection Observer triggers `.in-view` class
   - Each child delays based on its index for cascading effect

### Example Panel Structure
```html
<div class="stagger">
    <div data-interactive-panel class="hero-panel rounded-2xl p-8">
        <!-- Panel content -->
    </div>
    <div data-interactive-panel class="hero-panel rounded-2xl p-8">
        <!-- Panel content -->
    </div>
</div>
```

## Code Organization Rules

### CSS
- All styles go in `html/css/styles.css`
- Use CSS custom properties (variables) defined in `:root` for theming
- Dark/light theme switching via `html[data-theme="light"]` attribute
- Never inline critical styles—reference existing CSS patterns
- **Styling preference**: Use Tailwind utilities for layout and spacing, custom CSS for animations and theme variables

### JavaScript
- All scripts go in `html/js/` directory
- Main application logic in `main.js`
- Use vanilla JavaScript (no framework dependencies)
- Wrap functionality in IIFEs to avoid global scope pollution

### Theme System
- System respects user's OS preference by default
- Three modes: light, system, dark
- State stored in localStorage as 'studio-theme'
- Theme toggle updates `data-theme` attribute on `<html>`

## Development Workflow
When creating or modifying components:
1. Check if component should be a panel → add `data-interactive-panel`
2. Add to stagger container if it should animate on scroll
3. Ensure hover effects work with both zoom and stagger transforms
4. Test in both light and dark themes
5. Verify glow animation doesn't conflict with other effects

## Documentation
- Keep technical documentation in `docs/`
- Reference existing docs when relevant
- Update documentation when patterns change
