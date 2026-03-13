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

const rawEngine = process.env.DB_ENGINE || process.env.ISA_DB_ENGINE || "mysql";
const resolvedEngine = rawEngine === "postgres" ? "postgres" : "mysql";
const requiredDatabaseVar =
  resolvedEngine === "postgres" ? "DATABASE_URL_POSTGRES" : "DATABASE_URL";

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
    ],
  },
  {
    name: "Database routing",
    vars: [
      { name: "DB_ENGINE", required: false },
      { name: "ISA_DB_ENGINE", required: false },
      { name: "DATABASE_URL", required: requiredDatabaseVar === "DATABASE_URL" },
      {
        name: "DATABASE_URL_POSTGRES",
        required: requiredDatabaseVar === "DATABASE_URL_POSTGRES",
      },
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
    name: "OpenClaw policy",
    vars: [
      { name: "OPENCLAW_AUTOMATION_STRICT_MODE", required: false },
      { name: "OPENCLAW_AUTOMATION_KILL_SWITCH", required: false },
      { name: "OPENCLAW_AUTOMATION_MAX_SKEW_SECONDS", required: false },
      { name: "OPENCLAW_RUNTIME_MODE", required: false },
      { name: "OPENCLAW_POLICY_ENVELOPE_PATH", required: false },
      { name: "OPENCLAW_BROWSER_POLICY_PATH", required: false },
      { name: "OPENCLAW_BROWSER_POLICY_MODE", required: false },
      { name: "OPENCLAW_BROWSER_FALLBACK_ALLOWED", required: false },
      { name: "OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS", required: false },
      { name: "OPENCLAW_REVERSE_PROXY_EXPOSURE", required: false },
      { name: "OPENCLAW_TRUSTED_PROXIES", required: false },
    ],
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
cliOut("INFO=db_engine=%s required_db_var=%s\n", resolvedEngine, requiredDatabaseVar);

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
