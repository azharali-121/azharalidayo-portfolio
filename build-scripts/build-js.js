/**
 * JavaScript Build Script
 * Bundles and minifies all JavaScript files for production
 * Uses esbuild for fast compilation
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Configuration
const config = {
    // Production scripts to bundle
    bundles: [
        {
            name: 'main',
            entryPoints: [
                'js/production-config.js',
                'js/error-tracking.js',
                'js/form-validation.js',
                'js/particle-bg.js',
                'js/hacker-terminal.js',
                'js/easter-egg.js',
                'assets/scripts/performance.js',
                'assets/scripts/accessibility.js'
            ],
            outfile: 'dist/js/main.bundle.min.js'
        },
        {
            name: 'security-lab',
            entryPoints: [
                'js/security-simulator.js',
                'js/skill-demos.js'
            ],
            outfile: 'dist/js/security-lab.min.js'
        },
        {
            name: 'contact',
            entryPoints: [
                'js/form-validation.js',
                'js/input-sanitizer.js',
                'js/message-encryption.js'
            ],
            outfile: 'dist/js/contact.min.js'
        }
    ],

    // esbuild common options
    buildOptions: {
        bundle: true,
        minify: true,
        sourcemap: true,
        target: ['es2020'],
        format: 'iife',
        platform: 'browser',
        treeShaking: true,
        legalComments: 'none',
        logLevel: 'info',
        define: {
            'process.env.NODE_ENV': '"production"'
        }
    }
};

/**
 * Create dist directory if it doesn't exist
 */
function ensureDistDirectory() {
    const distDir = path.join(process.cwd(), 'dist');
    const distJsDir = path.join(distDir, 'js');
    
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
        console.log('✓ Created dist directory');
    }
    
    if (!fs.existsSync(distJsDir)) {
        fs.mkdirSync(distJsDir, { recursive: true });
        console.log('✓ Created dist/js directory');
    }
}

/**
 * Build a single bundle
 */
async function buildBundle(bundle) {
    try {
        // Filter out non-existent files
        const existingEntryPoints = bundle.entryPoints.filter(file => {
            const exists = fs.existsSync(file);
            if (!exists) {
                console.log(`⚠️  Warning: ${file} not found, skipping...`);
            }
            return exists;
        });

        if (existingEntryPoints.length === 0) {
            console.log(`⚠️  No entry points found for ${bundle.name} bundle`);
            return;
        }

        const buildOptions = {
            ...config.buildOptions,
            entryPoints: existingEntryPoints,
            outfile: bundle.outfile
        };

        if (isWatch) {
            // Watch mode
            const ctx = await esbuild.context(buildOptions);
            await ctx.watch();
            console.log(`👀 Watching ${bundle.name} bundle...`);
        } else {
            // Build once
            await esbuild.build(buildOptions);
            const stats = fs.statSync(bundle.outfile);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`✓ Built ${bundle.name} bundle (${sizeKB} KB)`);
        }

    } catch (error) {
        console.error(`❌ Error building ${bundle.name} bundle:`, error);
        process.exit(1);
    }
}

/**
 * Build all bundles
 */
async function buildAll() {
    console.log('🔨 Building JavaScript bundles...\n');
    
    ensureDistDirectory();

    if (isWatch) {
        console.log('👀 Watch mode enabled\n');
        for (const bundle of config.bundles) {
            await buildBundle(bundle);
        }
        console.log('\n✅ Watching for changes...');
    } else {
        for (const bundle of config.bundles) {
            await buildBundle(bundle);
        }
        console.log('\n✅ JavaScript build complete!');
        printBuildSummary();
    }
}

/**
 * Print build summary
 */
function printBuildSummary() {
    console.log('\n📦 Build Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalSize = 0;
    
    config.bundles.forEach(bundle => {
        if (fs.existsSync(bundle.outfile)) {
            const stats = fs.statSync(bundle.outfile);
            const sizeKB = stats.size / 1024;
            totalSize += sizeKB;
            
            console.log(`  ${bundle.name.padEnd(20)} ${sizeKB.toFixed(2)} KB`);
        }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Total JS Size:       ${totalSize.toFixed(2)} KB`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Update HTML to reference dist/js/main.bundle.min.js');
    console.log('   2. Test all functionality works with bundled files');
    console.log('   3. Run "npm run build:css" to minify CSS');
    console.log('   4. Deploy dist/ folder to production\n');
}

// Run build
buildAll().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
