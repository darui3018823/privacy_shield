const fs = require('fs');
const path = require('path');

// Ensure the build directory exists
const buildDir = path.join(__dirname, '..');

// Files to copy from src/ to root


const esbuild = require('esbuild');

console.log('🔨 Building Privacy Shield extension...');

// JS files to bundle
const entryPoints = {
  background: 'src/background/background.js',
  content: 'src/content/content.js',
  popup: 'src/popup/popup.js',
  options: 'src/options/options.js'
};

try {
  esbuild.buildSync({
    entryPoints,
    bundle: true,
    outdir: buildDir,
    minify: false, // Keep readable for review, or set to true for production
    sourcemap: true,
    target: ['chrome96'], // Target modern Chrome
    format: 'iife' // Immediately Invoked Function Expression for direct browser execution
  });
  console.log(`✓ Bundled JS files: ${Object.keys(entryPoints).join(', ')}`);
} catch (error) {
  console.error('✗ JS Build failed:', error);
  process.exit(1);
}

// Asset files to copy
const filesToCopy = [
  { src: 'src/popup/popup.html', dest: 'popup.html' },
  { src: 'src/popup/popup.css', dest: 'popup.css' },
  { src: 'src/options/options.html', dest: 'options.html' },
  { src: 'src/options/options.css', dest: 'options.css' },
  { src: 'src/content/content.css', dest: 'content.css' }
];

// Copy assets
filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(buildDir, src);
  const destPath = path.join(buildDir, dest);

  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${src} to ${dest}`);
    } else {
      console.warn(`⚠ Source file not found: ${src}`);
    }
  } catch (error) {
    console.error(`✗ Error copying ${src}:`, error.message);
    process.exit(1);
  }
});

console.log('✓ Build complete!');
