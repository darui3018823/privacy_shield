#!/usr/bin/env node

/* eslint-env node */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');

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

console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`);
console.log(`📝 Updated package.json`);
