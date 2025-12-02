#!/usr/bin/env node

/**
 * Post-build script for GitHub Pages deployment
 * 1. Cleans up old build artifacts from docs/
 * 2. Moves files from docs/browser/ to docs/ root for proper GitHub Pages serving
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'docs', 'browser');
const targetDir = path.join(__dirname, '..', 'docs');

// Check if the browser directory exists
if (!fs.existsSync(sourceDir)) {
  console.log('✅ No browser directory found - files already in correct location');
  process.exit(0);
}

console.log('🧹 Cleaning up old build artifacts...');

// Remove old build artifacts (hashed .js and .css files, licenses, etc.)
// This prevents accumulation of old files when hashes change
const filesToClean = fs.readdirSync(targetDir).filter(file => {
  const filePath = path.join(targetDir, file);
  // Only clean files, not directories (keep the browser directory)
  if (!fs.statSync(filePath).isFile()) return false;

  // Remove old build artifacts
  return file.endsWith('.js') ||
         file.endsWith('.css') ||
         file.endsWith('.txt') ||
         file.endsWith('.json') ||
         file.endsWith('.html') ||
         file.endsWith('.ico');
});

filesToClean.forEach(file => {
  fs.unlinkSync(path.join(targetDir, file));
  console.log(`  ✗ Removed old ${file}`);
});

console.log('📦 Moving new files from docs/browser/ to docs/...');

// Move all files from the browser to doc root
fs.readdirSync(sourceDir).forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);

  fs.renameSync(sourcePath, targetPath);
  console.log(`  ✓ Moved ${file}`);
});

// Remove an empty browser directory
fs.rmdirSync(sourceDir);
console.log('✅ GitHub Pages deployment files ready in docs/');
