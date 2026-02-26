import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../db";
import {
  automationRequestLedger,
  policyActionAudit,
} from "../../drizzle/schema";
import { serverLogger } from "../_core/logger-wiring";

const INSECURE_SECRET_DEFAULTS = new Set([
  "",
  "change-me",
  "secret",
  "development",
  "change-me-in-production",
]);

const DEFAULT_MAX_CLOCK_SKEW_SECONDS = 300;

type BooleanLike = string | undefined;

interface OpenclawPolicyEnvelope {
  enforcement?: {
    mode?: string;
    allow_dev_bypass?: boolean;
  };
  automation?: {
    strict_mode_production?: boolean;
    strict_mode_env_var?: string;
    allow_insecure_dev_bypass_env_var?: string;
    kill_switch_env_var?: string;
    max_clock_skew_seconds?: number;
    require_idempotency_key_in_strict_mode?: boolean;
    require_timestamp_in_strict_mode?: boolean;
    require_signature_in_strict_mode?: boolean;
  };
}

export type AutomationFailureCategory =
  | "transient"
  | "config"
  | "permission"
  | "logic";

export class AutomationAuthError extends Error {
  status: number;
  code: string;
  category: AutomationFailureCategory;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      category: AutomationFailureCategory;
    }
  ) {
    super(message);
    this.name = "AutomationAuthError";
    this.status = options.status;
    this.code = options.code;
    this.category = options.category;
  }
}

export interface AutomationAuthRequest {
  source: string;
  traceId?: string;
  actor?: string;
  secret?: string;
  authorizationHeader?: string;
  idempotencyKey?: string;
  requestTimestamp?: string;
  signature?: string;
}

export interface AutomationAuthContext {
  source: string;
  strictMode: boolean;
  traceId?: string;
  actor?: string;
  idempotencyKey?: string;
  requestTimestampIso?: string;
}

function parseBoolean(value: BooleanLike): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function policyEnvelopePath(): string {
  const configured = process.env.OPENCLAW_POLICY_ENVELOPE_PATH;
  if (configured && configured.trim().length > 0) {
    return configured;
  }
  return path.join(process.cwd(), "config/governance/openclaw_policy_envelope.json");
}

let cachedEnvelope: OpenclawPolicyEnvelope | null = null;
let cachedEnvelopePath = "";
let cachedEnvelopeMtimeMs = -1;

function loadPolicyEnvelope(): OpenclawPolicyEnvelope {
  const targetPath = policyEnvelopePath();
  try {
    const stat = fs.statSync(targetPath);
    if (
      cachedEnvelope &&
      cachedEnvelopePath === targetPath &&
      cachedEnvelopeMtimeMs === stat.mtimeMs
    ) {
      return cachedEnvelope;
    }

    const parsed = JSON.parse(fs.readFileSync(targetPath, "utf8")) as OpenclawPolicyEnvelope;
    cachedEnvelope = parsed;
    cachedEnvelopePath = targetPath;
    cachedEnvelopeMtimeMs = stat.mtimeMs;
    return parsed;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw new AutomationAuthError("Automation policy envelope missing or invalid", {
        status: 500,
        code: "POLICY_ENVELOPE_INVALID",
        category: "config",
      });
    }

    return {
      enforcement: { mode: "fail_closed", allow_dev_bypass: true },
      automation: {
        strict_mode_production: true,
        strict_mode_env_var: "OPENCLAW_AUTOMATION_STRICT_MODE",
        allow_insecure_dev_bypass_env_var: "OPENCLAW_AUTOMATION_ALLOW_INSECURE_DEV_BYPASS",
        kill_switch_env_var: "OPENCLAW_AUTOMATION_KILL_SWITCH",
        max_clock_skew_seconds: DEFAULT_MAX_CLOCK_SKEW_SECONDS,
        require_idempotency_key_in_strict_mode: true,
        require_timestamp_in_strict_mode: true,
        require_signature_in_strict_mode: true,
      },
    };
  }
}

function resolveStrictMode(policy: OpenclawPolicyEnvelope): boolean {
  const strictEnvKey = policy.automation?.strict_mode_env_var || "OPENCLAW_AUTOMATION_STRICT_MODE";
  const strictOverride = parseBoolean(process.env[strictEnvKey]);
  if (strictOverride !== undefined) {
    return strictOverride;
  }

  if (process.env.NODE_ENV === "production") {
    return policy.automation?.strict_mode_production !== false;
  }

  return false;
}

function resolveKillSwitch(policy: OpenclawPolicyEnvelope): boolean {
  const envKey = policy.automation?.kill_switch_env_var || "OPENCLAW_AUTOMATION_KILL_SWITCH";
  return parseBoolean(process.env[envKey]) === true;
}

function resolveAllowInsecureDevBypass(policy: OpenclawPolicyEnvelope): boolean {
  const envKey =
    policy.automation?.allow_insecure_dev_bypass_env_var ||
    "OPENCLAW_AUTOMATION_ALLOW_INSECURE_DEV_BYPASS";
  const envValue = parseBoolean(process.env[envKey]);
  if (envValue !== undefined) {
    return envValue;
  }
  return policy.enforcement?.allow_dev_bypass !== false;
}

function resolveMaxClockSkewSeconds(policy: OpenclawPolicyEnvelope): number {
  const envOverride = process.env.OPENCLAW_AUTOMATION_MAX_SKEW_SECONDS;
  const envNumeric = envOverride ? Number.parseInt(envOverride, 10) : Number.NaN;
  if (Number.isFinite(envNumeric) && envNumeric > 0 && envNumeric <= 3600) {
    return envNumeric;
  }

  const policyValue = policy.automation?.max_clock_skew_seconds;
  if (typeof policyValue === "number" && policyValue > 0 && policyValue <= 3600) {
    return policyValue;
  }

  return DEFAULT_MAX_CLOCK_SKEW_SECONDS;
}

function parseAuthorizationHeader(header: string | undefined): string | undefined {
  if (!header || header.trim().length === 0) return undefined;
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return header.trim();
}

function timingSafeEqualString(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuf, rightBuf);
}

function normalizeSignature(signature: string | undefined): string | undefined {
  if (!signature) return undefined;
  const trimmed = signature.trim();
  if (trimmed.startsWith("sha256=")) {
    return trimmed.slice("sha256=".length);
  }
  return trimmed;
}

function normalizeTimestamp(requestTimestamp: string): string {
  const raw = requestTimestamp.trim();
  if (/^\d{10}$/.test(raw)) {
    return new Date(Number.parseInt(raw, 10) * 1000).toISOString();
  }
  if (/^\d{13}$/.test(raw)) {
    return new Date(Number.parseInt(raw, 10)).toISOString();
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new AutomationAuthError("Invalid request timestamp", {
      status: 400,
      code: "INVALID_TIMESTAMP",
      category: "logic",
    });
  }
  return parsed.toISOString();
}

function validateTimestampSkew(requestTimestampIso: string, maxSkewSeconds: number): void {
  const requestMillis = new Date(requestTimestampIso).getTime();
  const nowMillis = Date.now();
  const skewSeconds = Math.abs(nowMillis - requestMillis) / 1000;

  if (skewSeconds > maxSkewSeconds) {
    throw new AutomationAuthError("Request timestamp outside allowed clock skew", {
      status: 401,
      code: "TIMESTAMP_SKEW_EXCEEDED",
      category: "permission",
    });
  }
}

function buildSignaturePayload(source: string, idempotencyKey: string, requestTimestampIso: string): string {
  return `${source}|${idempotencyKey}|${requestTimestampIso}`;
}

function computeSignature(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function isDuplicateEntry(error: unknown): boolean {
  const candidate = error as { code?: unknown; errno?: unknown; message?: unknown };
  return (
    candidate?.code === "ER_DUP_ENTRY" ||
    candidate?.errno === 1062 ||
    (typeof candidate?.message === "string" && candidate.message.includes("Duplicate entry"))
  );
}

async function writePolicyDecisionAudit(
  decision: "allow" | "deny",
  reasonCode: string,
  request: AutomationAuthRequest,
  category: AutomationFailureCategory,
  strictMode: boolean
): Promise<void> {
  if (process.env.NODE_ENV === "test" || parseBoolean(process.env.OPENCLAW_AUTOMATION_DISABLE_DB_AUDIT) === true) {
    return;
  }

  const db = await getDb();
  if (!db) {
    serverLogger.warn("[automation-auth] Policy audit skipped: database unavailable");
    return;
  }

  try {
    await db.insert(policyActionAudit).values({
      source: request.source,
      actor: request.actor ?? null,
      traceId: request.traceId ?? null,
      decision,
      reasonCode,
      category,
      strictMode: strictMode ? 1 : 0,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    serverLogger.warn("[automation-auth] Policy audit insert failed", error);
  }
}

async function reserveIdempotencyKey(
  request: AutomationAuthRequest,
  requestTimestampIso: string | undefined,
  strictMode: boolean
): Promise<void> {
  const key = request.idempotencyKey;
  if (!key) return;

  if (process.env.NODE_ENV === "test" || parseBoolean(process.env.OPENCLAW_AUTOMATION_DISABLE_DB_AUDIT) === true) {
    return;
  }

  const db = await getDb();
  if (!db) {
    if (strictMode) {
      throw new AutomationAuthError("Database unavailable for strict replay protection", {
        status: 503,
        code: "REPLAY_LEDGER_UNAVAILABLE",
        category: "transient",
      });
    }
    serverLogger.warn("[automation-auth] Replay ledger skipped: database unavailable");
    return;
  }

  try {
    await db.insert(automationRequestLedger).values({
      source: request.source,
      idempotencyKey: key,
      requestTimestamp: requestTimestampIso ?? null,
      signature: normalizeSignature(request.signature) ?? null,
      actor: request.actor ?? null,
      traceId: request.traceId ?? null,
      decision: "allow",
      reasonCode: "AUTHORIZED",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (isDuplicateEntry(error)) {
      throw new AutomationAuthError("Replay detected: idempotency key already used", {
        status: 409,
        code: "REPLAY_DETECTED",
        category: "permission",
      });
    }

    throw new AutomationAuthError("Failed to persist idempotency ledger entry", {
      status: 503,
      code: "REPLAY_LEDGER_WRITE_FAILED",
      category: "transient",
    });
  }
}

function assertIdempotencyKeyFormat(idempotencyKey: string): void {
  if (!/^[A-Za-z0-9._:-]{8,191}$/.test(idempotencyKey)) {
    throw new AutomationAuthError("Invalid idempotency key format", {
      status: 400,
      code: "INVALID_IDEMPOTENCY_KEY",
      category: "logic",
    });
  }
}

export async function authorizeAutomationRequest(
  request: AutomationAuthRequest
): Promise<AutomationAuthContext> {
  const policy = loadPolicyEnvelope();
  const strictMode = resolveStrictMode(policy);
  const allowInsecureDevBypass = resolveAllowInsecureDevBypass(policy);

  if (resolveKillSwitch(policy)) {
    await writePolicyDecisionAudit("deny", "KILL_SWITCH_ENABLED", request, "permission", strictMode);
    throw new AutomationAuthError("Automation execution disabled by kill switch", {
      status: 403,
      code: "AUTOMATION_KILL_SWITCH",
      category: "permission",
    });
  }

  const providedSecret = request.secret || parseAuthorizationHeader(request.authorizationHeader);
  const cronSecret = process.env.CRON_SECRET ?? "";

  if (!cronSecret) {
    await writePolicyDecisionAudit("deny", "CRON_SECRET_MISSING", request, "config", strictMode);
    throw new AutomationAuthError("CRON_SECRET is not configured", {
      status: 500,
      code: "CRON_SECRET_MISSING",
      category: "config",
    });
  }

  const insecureSecret = INSECURE_SECRET_DEFAULTS.has(cronSecret);
  if (insecureSecret && (strictMode || (process.env.NODE_ENV === "production" && !allowInsecureDevBypass))) {
    await writePolicyDecisionAudit("deny", "CRON_SECRET_INSECURE", request, "config", strictMode);
    throw new AutomationAuthError("CRON_SECRET uses an insecure default", {
      status: 500,
      code: "CRON_SECRET_INSECURE",
      category: "config",
    });
  }

  if (!providedSecret || !timingSafeEqualString(providedSecret, cronSecret)) {
    await writePolicyDecisionAudit("deny", "SECRET_MISMATCH", request, "permission", strictMode);
    throw new AutomationAuthError("Unauthorized: Invalid cron secret", {
      status: 401,
      code: "SECRET_MISMATCH",
      category: "permission",
    });
  }

  const requireIdempotency = policy.automation?.require_idempotency_key_in_strict_mode !== false;
  const requireTimestamp = policy.automation?.require_timestamp_in_strict_mode !== false;
  const requireSignature = policy.automation?.require_signature_in_strict_mode !== false;

  let requestTimestampIso: string | undefined;

  if (request.idempotencyKey) {
    assertIdempotencyKeyFormat(request.idempotencyKey);
  }

  if (strictMode && requireIdempotency && !request.idempotencyKey) {
    await writePolicyDecisionAudit("deny", "IDEMPOTENCY_REQUIRED", request, "permission", strictMode);
    throw new AutomationAuthError("idempotencyKey is required in strict mode", {
      status: 400,
      code: "IDEMPOTENCY_REQUIRED",
      category: "logic",
    });
  }

  if (strictMode && requireTimestamp && !request.requestTimestamp) {
    await writePolicyDecisionAudit("deny", "TIMESTAMP_REQUIRED", request, "permission", strictMode);
    throw new AutomationAuthError("requestTimestamp is required in strict mode", {
      status: 400,
      code: "TIMESTAMP_REQUIRED",
      category: "logic",
    });
  }

  if (request.requestTimestamp) {
    requestTimestampIso = normalizeTimestamp(request.requestTimestamp);
    validateTimestampSkew(requestTimestampIso, resolveMaxClockSkewSeconds(policy));
  }

  const normalizedSignature = normalizeSignature(request.signature);
  if (strictMode && requireSignature && !normalizedSignature) {
    await writePolicyDecisionAudit("deny", "SIGNATURE_REQUIRED", request, "permission", strictMode);
    throw new AutomationAuthError("signature is required in strict mode", {
      status: 400,
      code: "SIGNATURE_REQUIRED",
      category: "logic",
    });
  }

  if (normalizedSignature) {
    if (!request.idempotencyKey || !requestTimestampIso) {
      await writePolicyDecisionAudit("deny", "SIGNATURE_METADATA_MISSING", request, "logic", strictMode);
      throw new AutomationAuthError(
        "signature validation requires idempotencyKey and requestTimestamp",
        {
          status: 400,
          code: "SIGNATURE_METADATA_MISSING",
          category: "logic",
        }
      );
    }

    const payload = buildSignaturePayload(
      request.source,
      request.idempotencyKey,
      requestTimestampIso
    );
    const expectedSignature = computeSignature(cronSecret, payload);
    if (!timingSafeEqualString(normalizedSignature, expectedSignature)) {
      await writePolicyDecisionAudit("deny", "SIGNATURE_MISMATCH", request, "permission", strictMode);
      throw new AutomationAuthError("Unauthorized: Invalid request signature", {
        status: 401,
        code: "SIGNATURE_MISMATCH",
        category: "permission",
      });
    }
  }

  await reserveIdempotencyKey(request, requestTimestampIso, strictMode);
  await writePolicyDecisionAudit("allow", "AUTHORIZED", request, "logic", strictMode);

  return {
    source: request.source,
    strictMode,
    traceId: request.traceId,
    actor: request.actor,
    idempotencyKey: request.idempotencyKey,
    requestTimestampIso,
  };
}

export function isAutomationAuthError(error: unknown): error is AutomationAuthError {
  return error instanceof AutomationAuthError;
}
