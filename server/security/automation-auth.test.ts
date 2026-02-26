import { afterEach, describe, expect, it } from "vitest";
import {
  authorizeAutomationRequest,
  AutomationAuthError,
} from "./automation-auth";

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
  process.env.NODE_ENV = "test";
  process.env.OPENCLAW_AUTOMATION_STRICT_MODE = "0";
  process.env.OPENCLAW_AUTOMATION_KILL_SWITCH = "0";
}

afterEach(() => {
  resetEnv();
});

describe("automation-auth", () => {
  it("rejects when CRON_SECRET is missing", async () => {
    resetEnv();
    delete process.env.CRON_SECRET;

    await expect(
      authorizeAutomationRequest({
        source: "test.source",
        secret: "x",
      })
    ).rejects.toMatchObject({
      code: "CRON_SECRET_MISSING",
      category: "config",
    } satisfies Partial<AutomationAuthError>);
  });

  it("allows valid secret in non-strict mode", async () => {
    resetEnv();
    process.env.CRON_SECRET = "test-cron-secret-12345678901234567890123456789012";

    const result = await authorizeAutomationRequest({
      source: "test.source",
      secret: process.env.CRON_SECRET,
      traceId: "trace-1",
      actor: "tester",
    });

    expect(result.strictMode).toBe(false);
    expect(result.source).toBe("test.source");
  });

  it("rejects strict-mode request without idempotency key", async () => {
    resetEnv();
    process.env.CRON_SECRET = "test-cron-secret-12345678901234567890123456789012";
    process.env.OPENCLAW_AUTOMATION_STRICT_MODE = "1";

    await expect(
      authorizeAutomationRequest({
        source: "test.source",
        secret: process.env.CRON_SECRET,
        requestTimestamp: new Date().toISOString(),
        signature: "sha256=abc",
      })
    ).rejects.toMatchObject({
      code: "IDEMPOTENCY_REQUIRED",
      category: "logic",
    } satisfies Partial<AutomationAuthError>);
  });

  it("rejects invalid signature in strict mode", async () => {
    resetEnv();
    process.env.CRON_SECRET = "test-cron-secret-12345678901234567890123456789012";
    process.env.OPENCLAW_AUTOMATION_STRICT_MODE = "1";

    await expect(
      authorizeAutomationRequest({
        source: "test.source",
        secret: process.env.CRON_SECRET,
        idempotencyKey: "request-123456",
        requestTimestamp: new Date().toISOString(),
        signature: "sha256=deadbeef",
      })
    ).rejects.toMatchObject({
      code: "SIGNATURE_MISMATCH",
      category: "permission",
    } satisfies Partial<AutomationAuthError>);
  });
});
