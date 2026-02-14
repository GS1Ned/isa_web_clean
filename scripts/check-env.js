#!/usr/bin/env node
/**
 * Environment Variable Presence Check
 * 
 * Validates that all required environment variables are present.
 * Reports missing KEY NAMES only (never values).
 * 
 * Usage: node scripts/check-env.js
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file
config({ path: join(rootDir, '.env') });

// Parse .env.example to get all possible keys
const envExamplePath = join(rootDir, '.env.example');
const envExampleContent = readFileSync(envExamplePath, 'utf-8');

// Extract all keys from .env.example (lines with KEY=)
const allKeys = envExampleContent
  .split('\n')
  .filter(line => line.trim() && !line.trim().startsWith('#') && line.includes('='))
  .map(line => line.split('=')[0].trim())
  .filter(key => key.length > 0);

// Required keys that must be present.
// Source of truth: `server/_core/env.ts` (fail-fast server validation).
const REQUIRED_KEYS = [
  'VITE_APP_ID',
  'JWT_SECRET',
  'DATABASE_URL',
];

// Check for missing required keys
const missingRequired = REQUIRED_KEYS.filter(key => !process.env[key]);

// Check for missing optional keys
const missingOptional = allKeys
  .filter(key => !REQUIRED_KEYS.includes(key))
  .filter(key => !process.env[key]);

// Report results
console.log('=== Environment Variable Presence Check ===\n');

if (missingRequired.length === 0) {
  console.log('✓ All required environment variables are present\n');
} else {
  console.error('✗ Missing required environment variables:');
  missingRequired.forEach(key => console.error(`  - ${key}`));
  console.error('');
}

if (missingOptional.length > 0) {
  console.log('⚠️  Missing optional environment variables:');
  missingOptional.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

console.log(`Total keys in .env.example: ${allKeys.length}`);
console.log(`Required keys present: ${REQUIRED_KEYS.length - missingRequired.length}/${REQUIRED_KEYS.length}`);
console.log(`Optional keys present: ${allKeys.length - REQUIRED_KEYS.length - missingOptional.length}/${allKeys.length - REQUIRED_KEYS.length}`);

// Exit with error if required keys are missing
if (missingRequired.length > 0) {
  console.error('\n❌ Cannot start server without required environment variables');
  process.exit(1);
}

console.log('\n✓ Environment check passed');
process.exit(0);
