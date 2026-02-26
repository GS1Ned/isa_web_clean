import fs from "node:fs";
import path from "node:path";
import { serverLogger } from "../_core/logger-wiring";

interface BrowserPolicy {
  mode?: string;
  require_explicit_opt_in_env?: string;
  allow_unsafe_launch_flags?: boolean;
  unsafe_launch_flags_env?: string;
  prohibited_actions?: string[];
}

const DEFAULT_POLICY: BrowserPolicy = {
  mode: "disabled",
  require_explicit_opt_in_env: "OPENCLAW_BROWSER_FALLBACK_ALLOWED",
  allow_unsafe_launch_flags: false,
  unsafe_launch_flags_env: "OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS",
  prohibited_actions: [],
};

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function loadBrowserPolicy(): BrowserPolicy {
  const policyPath =
    process.env.OPENCLAW_BROWSER_POLICY_PATH ||
    path.join(process.cwd(), "config/openclaw/browser.policy.json");

  try {
    const parsed = JSON.parse(fs.readFileSync(policyPath, "utf8")) as BrowserPolicy;
    return {
      ...DEFAULT_POLICY,
      ...parsed,
      prohibited_actions: Array.isArray(parsed.prohibited_actions)
        ? parsed.prohibited_actions
        : [],
    };
  } catch (_error) {
    serverLogger.warn(
      `[Browser Policy] Policy file unreadable at ${policyPath}; defaulting to deny`
    );
    return { ...DEFAULT_POLICY };
  }
}

export function isBrowserAutomationAllowed(actor: string): boolean {
  const policy = loadBrowserPolicy();
  const mode = process.env.OPENCLAW_BROWSER_POLICY_MODE || policy.mode || "disabled";

  if (mode !== "fallback_only") {
    serverLogger.info(`[Browser Policy] ${actor} denied: mode=${mode}`);
    return false;
  }

  const optInEnv = policy.require_explicit_opt_in_env || "OPENCLAW_BROWSER_FALLBACK_ALLOWED";
  if (!parseBoolean(process.env[optInEnv])) {
    serverLogger.info(`[Browser Policy] ${actor} denied: missing explicit opt-in (${optInEnv}=1)`);
    return false;
  }

  return true;
}

export function browserLaunchArgs(): string[] {
  const policy = loadBrowserPolicy();
  const unsafeEnv = policy.unsafe_launch_flags_env || "OPENCLAW_BROWSER_ALLOW_UNSAFE_FLAGS";
  const unsafeAllowed =
    policy.allow_unsafe_launch_flags === true && parseBoolean(process.env[unsafeEnv]);
  return unsafeAllowed ? ["--no-sandbox", "--disable-setuid-sandbox"] : [];
}
