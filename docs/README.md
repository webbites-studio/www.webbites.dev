# WebBites.dev - Project Documentation

## Overview

WebBites.dev is a modern, professional website offering premium web design and hosting services for US small businesses. The site features a sleek, contemporary design with smooth animations, theme switching capabilities, and responsive layouts.

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A web server for hosting (Apache, Nginx, or any static file server)
- Basic knowledge of HTML, CSS, and JavaScript

### File Structure
```
www.webbites.dev/
├── LICENSE
├── docs/               # Project documentation
├── html/              # Main website files
│   ├── index.html     # Main HTML file
│   ├── css/
│   │   └── styles.css # Custom styles and theme definitions
│   ├── images/        # Image assets
│   └── scripts/
│       └── main.js    # JavaScript functionality
```

### Running Locally

1. Open the project directory in your file explorer
2. Navigate to the `html` folder
3. Open `index.html` in your web browser
4. Alternatively, use a local development server:
   ```bash
   # Using Python 3
   cd html
   python -m http.server 8000
   
   # Using Node.js (http-server)
   cd html
   npx http-server -p 8000
   ```
5. Visit `http://localhost:8000` in your browser

## Features

### Core Features
- **Responsive Design**: Fully responsive layout that works on all devices
- **Theme Switching**: Light/Dark/System theme modes with persistent storage
- **Smooth Animations**: Staggered reveal animations on scroll
- **Modern UI**: Built with Tailwind CSS and custom CSS variables
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Performance**: Optimized assets and efficient loading

### Technical Stack
- **HTML5**: Semantic markup with accessibility considerations
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Custom CSS**: Theme system with CSS custom properties
- **Vanilla JavaScript**: No dependencies, pure JS for functionality

## Key Sections

The website includes the following sections:
1. **Hero**: Eye-catching headline and call-to-action
2. **Vision**: Visual concepts showcase
3. **Services**: Detailed service offerings
4. **Process**: Step-by-step workflow explanation
5. **Pricing**: Transparent pricing information
6. **Testimonials**: Client feedback and reviews
7. **Contact**: Contact form and information

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation

For more detailed information, refer to:
- [Architecture Guide](ARCHITECTURE.md) - Technical architecture and code structure
- [Styling Guide](STYLING.md) - Theme system and CSS customization
- [Deployment Guide](DEPLOYMENT.md) - Hosting and deployment instructions
- [Maintenance Guide](MAINTENANCE.md) - Updates and maintenance procedures

## License

See the LICENSE file in the root directory for licensing information.

## Contact

For questions or support regarding this project, please contact the development team or visit www.webbites.dev.
