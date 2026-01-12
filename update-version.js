#!/usr/bin/env node

/* eslint-env node */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');
const manifestPath = path.join(__dirname, 'manifest.json');

const htmlVersionTargets = [
  path.join(__dirname, 'popup.html'),
  path.join(__dirname, 'src', 'popup', 'popup.html'),
];

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
let [major, minor, patch] = versionParts.map(Number);

const arg = process.argv[2];

switch (arg) {
  case 'major':
    major++;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor++;
    patch = 0;
    break;
  case 'patch':
  default:
    patch++;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;

packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`📝 Updated ${path.relative(__dirname, packagePath)}`);

try {
  const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifestJson.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + '\n');
  console.log(`📝 Updated ${path.relative(__dirname, manifestPath)}`);
} catch (error) {
  console.error('⚠️  Failed to update manifest.json:', error);
}

htmlVersionTargets.forEach((targetPath) => {
  try {
    const html = fs.readFileSync(targetPath, 'utf8');
    const updatedHtml = html.replace(/(<span class="version">)v?\d+\.\d+\.\d+(<\/span>)/, `$1v${newVersion}$2`);

    if (updatedHtml === html) {
      console.warn(`ℹ️  No version string found in ${path.relative(__dirname, targetPath)}`);
      return;
    }

    fs.writeFileSync(targetPath, updatedHtml);
    console.log(`📝 Updated ${path.relative(__dirname, targetPath)}`);
  } catch (error) {
    console.error(`⚠️  Failed to update ${path.relative(__dirname, targetPath)}:`, error);
  }
});

console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`);
