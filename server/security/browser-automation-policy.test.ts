import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  browserLaunchArgs,
  isBrowserAutomationAllowed,
} from "./browser-automation-policy";

const ORIGINAL_ENV = { ...process.env };
const TEMP_DIRS: string[] = [];

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
  process.env.OPENCLAW_BROWSER_POLICY_MODE = "";
  process.env.OPENCLAW_BROWSER_FALLBACK_ALLOWED = "0";
  process.env.OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS = "0";
}

function writePolicy(data: object): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "browser-policy-test-"));
  const file = path.join(dir, "browser.policy.json");
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
  TEMP_DIRS.push(dir);
  return file;
}

afterEach(() => {
  resetEnv();
  for (const dir of TEMP_DIRS.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("browser-automation-policy", () => {
  it("denies fallback mode without explicit opt-in", () => {
    resetEnv();
    process.env.OPENCLAW_BROWSER_POLICY_PATH = writePolicy({
      mode: "fallback_only",
      require_explicit_opt_in_env: "OPENCLAW_BROWSER_FALLBACK_ALLOWED",
      allow_unsafe_launch_flags: false,
      unsafe_launch_flags_env: "OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS",
      prohibited_actions: ["autonomous_login_submission"],
    });
    process.env.OPENCLAW_BROWSER_FALLBACK_ALLOWED = "0";

    expect(isBrowserAutomationAllowed("test-actor")).toBe(false);
  });

  it("allows fallback mode when explicit opt-in is set", () => {
    resetEnv();
    process.env.OPENCLAW_BROWSER_POLICY_PATH = writePolicy({
      mode: "fallback_only",
      require_explicit_opt_in_env: "OPENCLAW_BROWSER_FALLBACK_ALLOWED",
      allow_unsafe_launch_flags: false,
      unsafe_launch_flags_env: "OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS",
      prohibited_actions: ["autonomous_login_submission"],
    });
    process.env.OPENCLAW_BROWSER_FALLBACK_ALLOWED = "1";

    expect(isBrowserAutomationAllowed("test-actor")).toBe(true);
  });

  it("returns no unsafe launch args unless policy and env both allow", () => {
    resetEnv();
    process.env.OPENCLAW_BROWSER_POLICY_PATH = writePolicy({
      mode: "fallback_only",
      require_explicit_opt_in_env: "OPENCLAW_BROWSER_FALLBACK_ALLOWED",
      allow_unsafe_launch_flags: true,
      unsafe_launch_flags_env: "OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS",
      prohibited_actions: ["autonomous_login_submission"],
    });

    process.env.OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS = "0";
    expect(browserLaunchArgs()).toEqual([]);

    process.env.OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS = "1";
    expect(browserLaunchArgs()).toEqual(["--no-sandbox", "--disable-setuid-sandbox"]);
  });

  it("fails closed when policy file is missing", () => {
    resetEnv();
    process.env.OPENCLAW_BROWSER_POLICY_PATH = "/tmp/non-existent-browser-policy.json";
    process.env.OPENCLAW_BROWSER_FALLBACK_ALLOWED = "1";
    process.env.OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS = "1";

    expect(isBrowserAutomationAllowed("test-actor")).toBe(false);
    expect(browserLaunchArgs()).toEqual([]);
  });
});
