/**
 * build-electron.js
 * 
 * This script:
 * 1. Copies the React production build into electron-app/build/
 * 2. Copies the electron/ source files into electron-app/
 * 3. Copies the preload.js into electron-app/
 * 4. Runs electron-builder against the electron-app/ directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const APP_DIR = path.join(ROOT, 'electron-app');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🔨 Step 1: Building React production bundle...');
execSync('npx react-scripts build', { cwd: ROOT, stdio: 'inherit' });

console.log('📁 Step 2: Assembling electron-app directory...');

// Clear and recreate electron-app (keep package.json)
const pkg = fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8');
try { fs.rmSync(APP_DIR, { recursive: true, force: true }); } catch (e) { }
fs.mkdirSync(APP_DIR, { recursive: true });
fs.writeFileSync(path.join(APP_DIR, 'package.json'), pkg);

// Copy the compiled React app into electron-app/build
copyDir(path.join(ROOT, 'build'), path.join(APP_DIR, 'build'));

// Copy electron main process file and preload
fs.copyFileSync(path.join(ROOT, 'electron', 'electron.js'), path.join(APP_DIR, 'electron.js'));
fs.copyFileSync(path.join(ROOT, 'electron', 'preload.js'), path.join(APP_DIR, 'preload.js'));

// Copy public favicon.ico for tray icon
const iconSrc = path.join(ROOT, 'public', 'favicon.ico');
const iconDest = path.join(APP_DIR, 'favicon.ico');
if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDest);
}

// Update the electron.js path references for production layout
let electronJs = fs.readFileSync(path.join(APP_DIR, 'electron.js'), 'utf8');
// In production, build/ is at __dirname/build and favicon.ico is at __dirname/favicon.ico
electronJs = electronJs.replace(
    "path.join(__dirname, '../build/index.html')",
    "path.join(__dirname, 'build/index.html')"
);
electronJs = electronJs.replace(
    "path.join(__dirname, '../public/favicon.ico')",
    "path.join(__dirname, 'favicon.ico')"
);
// Preload is now in same dir
electronJs = electronJs.replace(
    "path.join(__dirname, 'preload.js')",
    "path.join(__dirname, 'preload.js')"
);
fs.writeFileSync(path.join(APP_DIR, 'electron.js'), electronJs);

console.log('📦 Step 3: Packaging with electron-builder...');
execSync('npx electron-builder', { cwd: ROOT, stdio: 'inherit' });

console.log('✅ Done! Your installer is in the dist/ folder.');
