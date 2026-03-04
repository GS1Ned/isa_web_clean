import { describe, expect, it } from "vitest";

import type { TrpcContext } from "../_core/context";
import { appRouter } from "../routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "citation-admin",
    email: "citation-admin@example.com",
    name: "Citation Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "citation-user",
    email: "citation-user@example.com",
    name: "Citation User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("citationAdmin router", () => {
  it("returns a stable verification summary for admins", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.citationAdmin.getVerificationSummary();

    expect(result).toHaveProperty("totalChecked");
    expect(result).toHaveProperty("needsVerificationCount");
    expect(result.countsByReason).toHaveProperty("ok");
    expect(result.countsByReason).toHaveProperty("missing_last_verified_date");
    expect(result.countsByReason).toHaveProperty("invalid_last_verified_date");
    expect(result.countsByReason).toHaveProperty("stale_last_verified_date");
  });

  it("returns verification reasons for chunks needing verification", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.citationAdmin.getChunksNeedingVerification({ limit: 5 });

    expect(Array.isArray(result)).toBe(true);
    if (result[0]) {
      expect(result[0]).toHaveProperty("needsVerification", true);
      expect(result[0]).toHaveProperty("verificationReason");
      expect(result[0]).toHaveProperty("verificationAgeDays");
    }
  });

  it("rejects non-admin access to verification summary", async () => {
    const caller = appRouter.createCaller(createUserContext());

    await expect(caller.citationAdmin.getVerificationSummary()).rejects.toThrow(
      "Only admins can view verification status"
    );
  });
});
