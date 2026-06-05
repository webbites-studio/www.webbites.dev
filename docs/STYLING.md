# Styling Guide

## Overview

The styling system combines Tailwind CSS utility classes with a custom theme system built on CSS custom properties. This approach provides flexibility, maintainability, and seamless theme switching.

## Tailwind CSS Configuration

### Custom Configuration

Located in `index.html`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                surface: '#0b1220',
                panel: '#111827',
                glow: '#7c3aed',
                glowSoft: '#60a5fa',
                textSoft: '#cbd5e1'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif']
            },
            boxShadow: {
                glow: '9px 10px 50px 0px #7c3aeda3'
            }
        }
    }
}
```

### Custom Colors

- `surface`: Dark background base (#0b1220)
- `panel`: Panel background (#111827)
- `glow`: Primary glow effect (Purple #7c3aed)
- `glowSoft`: Secondary glow (Blue #60a5fa)
- `textSoft`: Soft text color (#cbd5e1)

### Typography

**Font Stack**: Inter → System UI → Sans-serif fallback

## Theme System

### Theme Modes

The site supports three theme modes:
1. **Dark Mode** (default)
2. **Light Mode**
3. **System Mode** (follows OS preference)

### CSS Custom Properties

#### Dark Theme (Default)

```css
:root {
    --bg-body: radial-gradient(circle at top, rgba(96, 165, 250, .12), transparent 28%),
               radial-gradient(circle at 15% 20%, rgba(236, 72, 153, .12), transparent 18%),
               linear-gradient(180deg, #020617 0%, #090f1f 100%);
    --bg-nav: rgba(2, 6, 23, 0.90);
    --bg-panel: rgba(15, 23, 42, 0.88);
    --bg-card: rgba(15, 23, 42, 0.80);
    --bg-form: rgba(2, 6, 23, 0.90);
    --border: rgba(148, 163, 184, 0.16);
    --border-card: rgba(30, 41, 59, 1);
    --text-base: #f1f5f9;
    --text-soft: #94a3b8;
    --text-muted: #64748b;
    --hero-glow: rgba(99, 102, 241, 0.18);
}
```

#### Light Theme

```css
html[data-theme="light"] {
    --bg-body: radial-gradient(circle at top, rgba(99, 102, 241, .08), transparent 28%),
               radial-gradient(circle at 15% 20%, rgba(236, 72, 153, .07), transparent 18%),
               linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    --bg-nav: rgba(255, 255, 255, 0.92);
    --bg-panel: rgba(255, 255, 255, 0.90);
    --bg-card: rgba(248, 250, 252, 0.95);
    --bg-form: rgba(255, 255, 255, 0.95);
    --border: rgba(99, 102, 241, 0.18);
    --border-card: rgba(203, 213, 225, 1);
    --text-base: #0f172a;
    --text-soft: #475569;
    --text-muted: #64748b;
    --hero-glow: rgba(99, 102, 241, 0.10);
}
```

### Using Theme Variables

Apply theme variables in your CSS:

```css
.my-component {
    background: var(--bg-panel);
    color: var(--text-base);
    border: 1px solid var(--border-card);
}
```

Or in HTML with inline styles:

```html
<div style="background:var(--bg-card); color:var(--text-base)">
    Content
</div>
```

## Animation System

### Glow Flicker Animation

Creates a subtle, organic glow effect:

```css
@keyframes glowFlicker {
    0%, 100% {
        box-shadow: 9px 10px 50px 0px rgba(124, 58, 237, 0.64);
    }
    25% {
        box-shadow: 12px 8px 55px 2px rgba(124, 58, 237, 0.70);
    }
    50% {
        box-shadow: 6px 13px 48px 1px rgba(124, 58, 237, 0.68);
    }
    75% {
        box-shadow: 10px 7px 52px 0px rgba(124, 58, 237, 0.66);
    }
}
```

**Usage:**
```css
.glowing-element {
    animation: glowFlicker 8s ease-in-out infinite;
}
```

### Stagger Reveal Animation

Progressive reveal of child elements on scroll:

```css
.stagger-item {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    transition-delay: calc(var(--stagger-index) * 0.1s);
}

.stagger.in-view > .stagger-item {
    opacity: 1;
    transform: translateY(0);
}
```

**HTML Usage:**
```html
<div class="stagger">
    <div>Item 1</div>  <!-- Animates first -->
    <div>Item 2</div>  <!-- Animates 0.1s later -->
    <div>Item 3</div>  <!-- Animates 0.2s later -->
</div>
```

## Interactive Components

### Interactive Panels

Cards and panels with hover effects:

```css
[data-interactive-panel] {
    position: relative;
    isolation: isolate;
    border: 1px solid var(--border-card);
    transition: transform 0.3s ease, background-color 0.35s, 
                border-color 0.35s, box-shadow 0.35s;
    animation: glowFlicker 8s ease-in-out infinite;
    will-change: transform;
}

[data-interactive-panel]:hover {
    transform: scale(1.02);
}
```

**HTML Usage:**
```html
<div data-interactive-panel class="hero-panel">
    Panel content
</div>
```

### Navigation

Sticky navigation with backdrop blur:

```css
nav {
    position: sticky;
    top: 0;
    backdrop-filter: blur(18px);
    background: var(--bg-nav);
    border-bottom: 1px solid var(--border-card);
}
```

## Responsive Design

### Breakpoints (Tailwind)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

```html
<!-- Hidden on mobile, visible on md and up -->
<div class="hidden md:flex">Navigation</div>

<!-- Full width on mobile, max-width on larger screens -->
<div class="w-full md:max-w-5xl mx-auto">Content</div>

<!-- Stack on mobile, grid on desktop -->
<div class="flex flex-col md:grid md:grid-cols-3">...</div>
```

## Color Palette

### Primary Colors

- **Indigo**: `#6366f1` - Primary brand color
- **Sky Blue**: `#60a5fa` - Secondary accent
- **Purple**: `#7c3aed` - Glow effects

### Dark Theme Colors

- **Background**: `#020617` to `#090f1f`
- **Surface**: `#0f172a`
- **Text**: `#f1f5f9` (base), `#94a3b8` (soft), `#64748b` (muted)

### Light Theme Colors

- **Background**: `#f8fafc` to `#e2e8f0`
- **Surface**: `#ffffff`
- **Text**: `#0f172a` (base), `#475569` (soft), `#64748b` (muted)

## Utility Classes

### Custom Utility Classes

```css
/* Hero badge styling */
.hero-badge {
    background: rgba(15, 23, 42, 0.8);
    /* Tailwind classes handle the rest */
}

/* Hero panel with backdrop blur */
.hero-panel {
    background: var(--bg-panel);
    backdrop-filter: blur(18px);
}
```

### Common Patterns

**Gradient Buttons:**
```html
<a class="bg-gradient-to-r from-indigo-500 to-sky-500 
          px-8 py-4 rounded-full text-white shadow-glow 
          transition hover:brightness-110">
    Button Text
</a>
```

**Glass Panels:**
```html
<div class="bg-slate-900/90 backdrop-blur-xl border border-slate-700 
            rounded-2xl p-8">
    Content
</div>
```

**Text Styles:**
```html
<!-- Hero heading -->
<h1 class="text-4xl md:text-6xl font-semibold tracking-tight 
           text-white leading-tight">
    Heading
</h1>

<!-- Body text -->
<p class="text-slate-300 text-base md:text-lg leading-8">
    Body text
</p>
```

## Customization Guide

### Changing Colors

1. **Update Tailwind Config** (in `index.html`):
```javascript
colors: {
    glow: '#your-color',  // Change primary glow
    glowSoft: '#your-color'  // Change secondary
}
```

2. **Update Theme Variables** (in `styles.css`):
```css
:root {
    --bg-panel: rgba(your, values, here, 0.88);
    /* Update other variables */
}
```

### Adding New Animations

1. Define keyframes in `styles.css`:
```css
@keyframes myAnimation {
    from { /* start state */ }
    to { /* end state */ }
}
```

2. Apply to elements:
```css
.my-element {
    animation: myAnimation 2s ease-in-out infinite;
}
```

### Extending Tailwind

Add to the config in `index.html`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            // Add custom spacing
            spacing: {
                '128': '32rem',
            },
            // Add custom fonts
            fontFamily: {
                display: ['YourFont', 'sans-serif'],
            }
        }
    }
}
```

## Best Practices

1. **Use theme variables** for colors that should adapt to theme changes
2. **Apply Tailwind utilities** for one-off styling
3. **Create custom classes** for repeated patterns
4. **Test both themes** when making changes
5. **Use transform and opacity** for smooth animations
6. **Add will-change** for animated elements
7. **Maintain contrast ratios** for accessibility (WCAG AA minimum)
8. **Use rem units** for typography (relative sizing)
9. **Leverage backdrop-filter** for modern glass effects
10. **Keep animations subtle** for professional feel

## Troubleshooting

### Theme not switching
- Check if `data-theme` attribute is being set on `<html>`
- Verify localStorage is working
- Ensure theme variables are defined in both `:root` and `html[data-theme="light"]`

### Animations not working
- Check if `.in-view` class is being added (dev tools)
- Verify IntersectionObserver is supported
- Check CSS transition properties are valid

### Colors not matching design
- Verify alpha values in rgba colors
- Check if theme variables are overridden
- Ensure custom properties are inside `:root` or theme selector
