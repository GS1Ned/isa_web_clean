import "@testing-library/jest-dom/vitest";
import { config } from "dotenv";
import crypto from "crypto";

// Load environment variables from .env file for tests (override shell env)
config({ override: true, quiet: true });

// Ensure JWT_SECRET is set for tests (generate random if missing)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('base64');
}

// Ensure CRON_SECRET is set for tests (cron router reads it at module load time)
if (
  !process.env.CRON_SECRET ||
  process.env.CRON_SECRET === "change-me-in-production" ||
  process.env.CRON_SECRET.length < 32
) {
  process.env.CRON_SECRET = crypto.randomBytes(32).toString("base64");
}

// Set NODE_ENV to test to prevent process.exit in env validation
process.env.NODE_ENV ||= "test";
