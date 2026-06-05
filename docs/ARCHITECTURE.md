# Architecture Documentation

## Project Structure

### Directory Organization

```
html/
├── index.html              # Main HTML document
├── css/
│   └── styles.css         # Custom styles and theme system
├── images/                # Image assets and graphics
└── scripts/
    └── main.js           # Client-side JavaScript
```

### Technology Stack

#### Frontend Framework
- **Tailwind CSS v3.x**: Delivered via CDN for rapid development
  - Custom configuration embedded in HTML
  - Extended with custom colors and utilities
  - No build process required

#### Custom CSS Architecture
- **CSS Custom Properties**: Theme-aware design tokens
- **Theme System**: Light/Dark mode support
- **Animations**: Custom keyframe animations
- **Responsive Design**: Mobile-first approach

#### JavaScript
- **Vanilla JavaScript**: No framework dependencies
- **Module Pattern**: IIFE (Immediately Invoked Function Expressions)
- **Event-Driven**: Observer patterns for scroll animations
- **Local Storage**: Theme persistence

## HTML Structure

### Document Head

```html
<head>
    <!-- SEO Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="...">
    <meta name="keywords" content="...">
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="...">
    <meta property="og:description" content="...">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Tailwind Configuration -->
    <script>
        tailwind.config = { ... }
    </script>
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="css/styles.css">
</head>
```

### Navigation Structure

- **Sticky Navigation**: Fixed at top with backdrop blur
- **Theme Toggle**: Three-mode switcher (Light/System/Dark)
- **Responsive Menu**: Hidden on mobile, full navigation on desktop
- **Smooth Scrolling**: Anchor links to page sections

### Content Sections

1. **Hero Section**: Gradient backgrounds, centered content, CTAs
2. **Feature Sections**: Grid layouts with cards and panels
3. **Interactive Elements**: Hover effects and animations
4. **Form Section**: Contact forms with validation

## CSS Architecture

### Theme System

#### CSS Custom Properties (Variables)

```css
:root {
    /* Default (Dark) Theme */
    --bg-body: radial-gradient(...)
    --bg-nav: rgba(2, 6, 23, 0.90)
    --bg-panel: rgba(15, 23, 42, 0.88)
    --text-base: #f1f5f9
    /* ... more variables */
}

html[data-theme="light"] {
    /* Light Theme Overrides */
    --bg-body: radial-gradient(...)
    --text-base: #0f172a
    /* ... more variables */
}
```

#### Theme Token Categories

- **Backgrounds**: `--bg-body`, `--bg-nav`, `--bg-panel`, `--bg-card`, `--bg-form`
- **Borders**: `--border`, `--border-card`
- **Text**: `--text-base`, `--text-soft`, `--text-muted`
- **Effects**: `--hero-glow`

### Animation System

#### Glow Animation

```css
@keyframes glowFlicker {
    0%, 100% { box-shadow: ... }
    25% { box-shadow: ... }
    50% { box-shadow: ... }
    75% { box-shadow: ... }
}
```

#### Stagger Reveal Animation

- Applied via `.stagger` class on containers
- Individual children get `.stagger-item` class
- CSS `--stagger-index` custom property controls delay
- Triggered by IntersectionObserver

### Interactive Panels

```css
[data-interactive-panel] {
    /* Hover effects */
    transform: scale(1.02) on hover
    /* Glow animation */
    /* Border transitions */
}
```

## JavaScript Architecture

### Module 1: Theme Toggle

```javascript
(function () {
    // Theme management
    // Local storage persistence
    // System preference detection
    // Real-time updates
})();
```

**Key Functions:**
- `prefersDark()`: Detects OS dark mode preference
- `applyMode(mode)`: Applies theme to DOM
- Event listeners for theme buttons
- MediaQuery listener for system changes

### Module 2: Scroll Animations

```javascript
(function () {
    // Stagger reveal on scroll
    // IntersectionObserver implementation
    // Fallback for older browsers
})();
```

**Key Features:**
- Adds `.stagger-item` class to children
- Sets `--stagger-index` CSS variable
- Uses IntersectionObserver API
- Triggers `.in-view` class when visible

## Performance Considerations

### Loading Strategy

1. **HTML**: Inline critical styles in `<head>`
2. **CSS**: Custom stylesheet loads after Tailwind
3. **JavaScript**: Scripts execute after DOM parsing
4. **Images**: Lazy loading (can be implemented)

### Optimization Techniques

- **CDN Delivery**: Tailwind CSS via CDN for caching
- **CSS Variables**: Runtime theme switching without reloads
- **Minimal JavaScript**: No heavy frameworks
- **Observer Pattern**: Efficient scroll handling
- **Will-Change**: GPU acceleration hints for animations

### Browser Performance

- **Backdrop Blur**: CSS `backdrop-filter` for modern browsers
- **Intersection Observer**: Efficient viewport detection
- **Transform/Opacity**: GPU-accelerated animations
- **Debouncing**: Not needed due to IntersectionObserver

## Data Flow

### Theme Selection Flow

```
User clicks theme button
    ↓
Event listener captures click
    ↓
Save to localStorage
    ↓
Apply theme to DOM (data-theme attribute)
    ↓
CSS custom properties update
    ↓
Visual theme changes
```

### Scroll Animation Flow

```
Page loads
    ↓
IntersectionObserver initialized
    ↓
Observes .stagger elements
    ↓
Element enters viewport
    ↓
.in-view class added
    ↓
CSS transitions trigger
    ↓
Staggered animation plays
```

## Extensibility

### Adding New Sections

1. Add HTML markup in `index.html`
2. Apply `.stagger` class for animations
3. Use theme variables for colors
4. Test in both light and dark modes

### Custom Components

1. Define styles in `styles.css`
2. Use `[data-*]` attributes for JS hooks
3. Follow existing naming conventions
4. Ensure responsive behavior

### JavaScript Extensions

1. Use IIFE pattern for encapsulation
2. Store preferences in localStorage
3. Use IntersectionObserver for scroll events
4. Provide fallbacks for older browsers

## Security Considerations

- **No External Data**: Static site with no server-side processing
- **CSP Friendly**: Can add Content Security Policy
- **XSS Protection**: No user input processing
- **HTTPS Ready**: Can be deployed with SSL/TLS

## Browser Compatibility

### Modern Features Used

- CSS Custom Properties (IE 11+)
- IntersectionObserver (IE: needs polyfill)
- CSS Grid & Flexbox (IE 11+)
- Backdrop Filter (Safari 9+, Chrome 76+)

### Fallbacks Provided

- IntersectionObserver: Automatic `.in-view` for unsupported browsers
- Theme toggle: Defaults to system preference
- Smooth scroll: CSS `scroll-behavior` with fallback
