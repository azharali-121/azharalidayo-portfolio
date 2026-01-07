# Azhar Ali Portfolio

This is the official portfolio website for Azhar Ali, showcasing skills, projects, and professional information.

## Features

- Responsive design that works on all devices
- Dark cyber theme with modern UI elements
- Optimized performance with minified assets
- Lazy loading for improved page load times
- PWA capabilities through web app manifest
- Organized file structure for easy maintenance
- SEO optimized with appropriate meta tags

## Folder Structure

The portfolio follows a modern, organized structure:

```
/
├── assets/
│   ├── favicon/        # Favicon files
│   ├── fonts/          # Custom font files
│   ├── icons/          # Icon assets
│   ├── images/         # All image assets
│   │   ├── profile/    # Profile photos and branding
│   │   ├── projects/   # Project-specific images
│   │   ├── testimonials/ # Client photos
│   │   ├── background/ # Background elements
│   │   ├── cursor/     # Custom cursor SVGs
│   │   └── ...         # Other image categories
│   ├── styles/         # CSS files
│   │   ├── main.css    # Main CSS file that imports all styles
│   │   └── min/        # Minified CSS files
│   │       └── main.min.css # Minified version of main.css
│   └── scripts/        # JavaScript files
│       ├── main.js     # Main JS file
│       ├── force-dark-theme.js # Theme implementation
│       ├── header-animations.js # Animation effects
│       └── min/        # Minified JS files
│           └── main.min.js # Minified version of main.js
├── index.html          # Main portfolio page
├── manifest.json       # Web app manifest for PWA support
├── sitemap.xml         # Site map for SEO
├── robots.txt          # Robots file for search engines
└── .well-known/        # Well-known directory for services
```

## Maintenance Instructions

### Adding New Projects

1. Add project images to `assets/images/projects/`
2. Copy an existing project card in `index.html` and update:
   ```html
   <div class="project-card">
     <div class="project-image">
       <img src="assets/images/projects/your-new-project.jpg" alt="Project Name" loading="lazy" width="400" height="220" class="lazy-image">
       <!-- Update links and overlay -->
     </div>
     <div class="project-content">
       <h3 class="project-title">Your Project Title</h3>
       <p class="project-description">
         Your project description goes here.
       </p>
       <div class="project-tech">
         <span class="tech-tag">Technology 1</span>
         <span class="tech-tag">Technology 2</span>
       </div>
     </div>
   </div>
   ```
3. Remember to use the `loading="lazy"` attribute for all non-critical images

### CSS Modifications

All CSS is organized through `assets/styles/main.css`, which imports all necessary styles:

1. Make changes to the CSS files in the `assets/styles/` directory
2. After making changes, minify the updated CSS:
   ```
   npx clean-css-cli assets/styles/main.css -o assets/styles/min/main.min.css
   ```
3. The site uses CSS variables for colors and spacing, defined in `main.css`

### JavaScript Modifications

1. Make changes to JS files in `assets/scripts/`
2. After making changes, minify the updated JS:
   ```
   npx terser assets/scripts/main.js -o assets/scripts/min/main.min.js -c -m
   ```
3. If adding new script files, update the loading logic in `main.js`

### Adding New Pages

1. Create new HTML files in the root directory
2. Link to the main CSS: `<link rel="stylesheet" href="assets/styles/main.css">`
3. Include necessary scripts: `<script src="assets/scripts/main.js"></script>`

## Testing

Two test files are included to verify the structure and responsiveness:

1. `structure-test.html` - Tests that all resources load correctly
2. `responsive-test.html` - Tests the portfolio at different screen sizes

## Reports

- `portfolio-cleanup-report.md` - Comprehensive report of the portfolio restructuring and optimization
- `restructuring-report.md` - Summary of changes made during reorganization

## Backup

Old files and unused assets are stored in timestamped backup folders:
- `backup_before_refactor_*` - Original files before restructuring
- `backup_unused_*` - Unused files identified during cleanup

---

© 2025 Azhar Ali. All rights reserved.
