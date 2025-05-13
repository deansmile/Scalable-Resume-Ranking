#!/usr/bin/env node

/**
 * Pre-deployment script to ensure no references to the old API Gateway ID exist
 * Run this script before deploying to S3 to prevent issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const OLD_API_ID = 'bf138rwrwj';
const NEW_API_ID = 'xosmeb3ly7';
const BUILD_DIR = path.join(__dirname, 'build');
const JS_DIR = path.join(BUILD_DIR, 'static', 'js');

console.log('Pre-deployment check for old API Gateway ID references');
console.log('-----------------------------------------------------');

// Check if build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  console.error('Error: Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Get all JavaScript files
let jsFiles = [];
try {
  jsFiles = fs.readdirSync(JS_DIR)
    .filter(file => file.endsWith('.js') && !file.endsWith('.map.js') && !file.includes('LICENSE'));
} catch (error) {
  console.error(`Error reading JS directory: ${error.message}`);
  process.exit(1);
}

console.log(`Found ${jsFiles.length} JavaScript files to check.`);

// Check each file for the old API Gateway ID
let hasOldReferences = false;
let fixedFiles = 0;

jsFiles.forEach(file => {
  const filePath = path.join(JS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(OLD_API_ID)) {
    console.log(`❌ Found old API Gateway ID in ${file}`);
    hasOldReferences = true;
    
    // Replace the old ID with the new one
    const updatedContent = content.replace(new RegExp(OLD_API_ID, 'g'), NEW_API_ID);
    fs.writeFileSync(filePath, updatedContent);
    console.log(`   ✅ Fixed ${file}`);
    fixedFiles++;
  } else {
    console.log(`✅ No old API Gateway ID found in ${file}`);
  }
});

if (hasOldReferences) {
  console.log(`\nFixed ${fixedFiles} files containing old API Gateway ID references.`);
  console.log('All references have been replaced with the new API Gateway ID.');
} else {
  console.log('\nAll files are clean. No old API Gateway ID references found!');
}

console.log('\nPre-deployment check completed successfully.');
console.log('You can now deploy the application to S3.');

// Exit with success code
process.exit(0); 