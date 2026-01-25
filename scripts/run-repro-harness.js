#!/usr/bin/env node
/**
 * scripts/run-repro-harness.js
 * Usage: node scripts/run-repro-harness.js --traceId=<traceId>
 * Runs Vitest on tests/repro/<traceId>.test.ts
 */

import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

function usage() {
  console.log("Usage: node scripts/run-repro-harness.js --traceId=<traceId>");
  process.exit(2);
}

const argv = process.argv.slice(2);
const argMap = {};
for (const a of argv) {
  const [k, v] = a.split("=");
  argMap[k.replace(/^--/, "")] = v;
}

const traceId = argMap.traceId;
if (!traceId) usage();

const testFile = path.resolve(process.cwd(), "tests", "repro", `${traceId}.test.ts`);
if (!fs.existsSync(testFile)) {
  console.error(`Repro test not found: ${testFile}`);
  process.exit(3);
}

const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["vitest", "run", testFile];

console.log(`Running repro test: ${testFile}`);
const result = spawnSync(cmd, args, { stdio: "inherit" });

process.exit(result.status ?? 1);
