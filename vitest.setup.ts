import "@testing-library/jest-dom/vitest";
import { config } from "dotenv";
import crypto from "crypto";

// Load environment variables from .env file for tests (override shell env)
config({ override: true });

// Ensure JWT_SECRET is set for tests (generate random if missing)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('base64');
  console.log('[vitest.setup] Generated test JWT_SECRET');
}

// Set NODE_ENV to test to prevent process.exit in env validation
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}
