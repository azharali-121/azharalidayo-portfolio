/**
 * Clean Build Script
 * Removes dist directory before building
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively delete directory
 */
function deleteFolderRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

/**
 * Clean dist directory
 */
function clean() {
    const distDir = path.join(process.cwd(), 'dist');
    
    if (fs.existsSync(distDir)) {
        console.log('🧹 Cleaning dist directory...');
        deleteFolderRecursive(distDir);
        console.log('✓ dist directory cleaned\n');
    } else {
        console.log('ℹ️  dist directory does not exist, skipping clean\n');
    }
}

clean();
