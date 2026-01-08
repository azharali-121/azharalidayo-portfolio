/**
 * CSS Build Script
 * Minifies and bundles CSS files for production
 */

const CleanCSS = require('clean-css');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    bundles: [
        {
            name: 'main',
            inputFiles: [
                'assets/styles/base/reset.css',
                'assets/styles/base/variables.css',
                'assets/styles/base/typography.css',
                'assets/styles/base/permanent-dark.css',
                'assets/styles/components/*.css',
                'assets/styles/layout/*.css'
            ],
            outfile: 'dist/css/main.min.css'
        }
    ],
    
    cleanCSSOptions: {
        level: 2,
        format: false,
        inline: ['all'],
        rebase: false
    }
};

/**
 * Get all CSS files matching pattern
 */
function getFilesRecursive(pattern) {
    const files = [];
    const dir = path.dirname(pattern);
    const filePattern = path.basename(pattern);
    
    if (!fs.existsSync(dir)) {
        return files;
    }
    
    if (filePattern.includes('*')) {
        // Wildcard pattern
        const dirFiles = fs.readdirSync(dir);
        const regex = new RegExp(filePattern.replace('*', '.*'));
        
        dirFiles.forEach(file => {
            if (regex.test(file)) {
                files.push(path.join(dir, file));
            }
        });
    } else {
        // Single file
        if (fs.existsSync(pattern)) {
            files.push(pattern);
        }
    }
    
    return files;
}

/**
 * Create dist directory if it doesn't exist
 */
function ensureDistDirectory() {
    const distDir = path.join(process.cwd(), 'dist');
    const distCssDir = path.join(distDir, 'css');
    
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
        console.log('✓ Created dist directory');
    }
    
    if (!fs.existsSync(distCssDir)) {
        fs.mkdirSync(distCssDir, { recursive: true });
        console.log('✓ Created dist/css directory');
    }
}

/**
 * Build a single CSS bundle
 */
function buildBundle(bundle) {
    try {
        // Collect all CSS files
        let allFiles = [];
        bundle.inputFiles.forEach(pattern => {
            const files = getFilesRecursive(pattern);
            allFiles = allFiles.concat(files);
        });
        
        if (allFiles.length === 0) {
            console.log(`⚠️  Warning: No CSS files found for ${bundle.name} bundle`);
            return;
        }
        
        console.log(`📝 Processing ${allFiles.length} CSS files for ${bundle.name} bundle...`);
        
        // Read and concatenate all CSS
        let combinedCSS = '';
        allFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            combinedCSS += `/* ${path.basename(file)} */\n${content}\n\n`;
        });
        
        // Minify with CleanCSS
        const minified = new CleanCSS(config.cleanCSSOptions).minify(combinedCSS);
        
        if (minified.errors.length > 0) {
            console.error(`❌ Errors in ${bundle.name}:`, minified.errors);
            return;
        }
        
        if (minified.warnings.length > 0) {
            console.warn(`⚠️  Warnings in ${bundle.name}:`, minified.warnings);
        }
        
        // Write minified CSS
        fs.writeFileSync(bundle.outfile, minified.styles, 'utf8');
        
        const originalSizeKB = (Buffer.byteLength(combinedCSS, 'utf8') / 1024).toFixed(2);
        const minifiedSizeKB = (Buffer.byteLength(minified.styles, 'utf8') / 1024).toFixed(2);
        const savings = ((1 - (minifiedSizeKB / originalSizeKB)) * 100).toFixed(1);
        
        console.log(`✓ Built ${bundle.name} bundle: ${originalSizeKB} KB → ${minifiedSizeKB} KB (${savings}% smaller)`);
        
    } catch (error) {
        console.error(`❌ Error building ${bundle.name} bundle:`, error);
        process.exit(1);
    }
}

/**
 * Build all CSS bundles
 */
function buildAll() {
    console.log('🎨 Building CSS bundles...\n');
    
    ensureDistDirectory();
    
    config.bundles.forEach(bundle => {
        buildBundle(bundle);
    });
    
    console.log('\n✅ CSS build complete!');
}

// Run build
buildAll();
