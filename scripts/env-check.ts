/**
 * Environment Variable Checker
 *
 * Validates that required and optional env vars are present.
 * NEVER prints values — only names and present/missing status.
 *
 * Usage: pnpm run env:check
 */

import { config } from "dotenv";
import { resolve } from "path";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


// Load .env from repo root
config({ path: resolve(import.meta.dirname, "..", ".env") });

interface VarGroup {
  name: string;
  vars: { name: string; required: boolean }[];
}

const groups: VarGroup[] = [
  {
    name: "Core (required)",
    vars: [
      { name: "VITE_APP_ID", required: true },
      { name: "JWT_SECRET", required: true },
      { name: "DATABASE_URL", required: true },
    ],
  },
  {
    name: "Auth",
    vars: [
      { name: "OAUTH_SERVER_URL", required: false },
      { name: "OWNER_OPEN_ID", required: false },
    ],
  },
  {
    name: "LLM",
    vars: [
      { name: "OPENAI_API_KEY", required: false },
      { name: "BUILT_IN_FORGE_API_URL", required: false },
      { name: "BUILT_IN_FORGE_API_KEY", required: false },
    ],
  },
  {
    name: "Cron",
    vars: [{ name: "CRON_SECRET", required: false }],
  },
  {
    name: "Email",
    vars: [
      { name: "SENDGRID_API_KEY", required: false },
      { name: "SENDER_EMAIL", required: false },
      { name: "SMTP_HOST", required: false },
    ],
  },
  {
    name: "GitHub",
    vars: [
      { name: "GITHUB_PAT", required: false },
      { name: "GH_TOKEN", required: false },
    ],
  },
  {
    name: "Manus",
    vars: [
      { name: "MANUS_API_KEY", required: false },
      { name: "VITE_FRONTEND_FORGE_API_URL", required: false },
    ],
  },
];

let missingRequired = 0;
let totalPresent = 0;
let totalChecked = 0;

cliOut("ISA Environment Check");
cliOut("=====================\n");

for (const group of groups) {
  cliOut(`[${group.name}]`);
  for (const v of group.vars) {
    totalChecked++;
    const present = !!process.env[v.name];
    if (present) {
      totalPresent++;
      cliOut(`  OK   ${v.name}`);
    } else if (v.required) {
      missingRequired++;
      cliOut(`  MISS ${v.name} (REQUIRED)`);
    } else {
      cliOut(`  --   ${v.name} (optional, not set)`);
    }
  }
  cliOut();
}

cliOut(`Summary: ${totalPresent}/${totalChecked} present`);

if (missingRequired > 0) {
  cliOut(`\nERROR: ${missingRequired} required variable(s) missing.`);
  process.exit(1);
} else {
  cliOut("\nAll required variables present.");
}
