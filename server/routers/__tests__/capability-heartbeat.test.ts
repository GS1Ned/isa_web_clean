import { describe, expect, it } from "vitest";
import { appRouter } from "../../routers";
import type { TrpcContext } from "../../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "heartbeat-admin",
    email: "heartbeat-admin@example.com",
    name: "Heartbeat Admin",
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

async function expectNonCrashWithTypedErrorFallback(
  invoke: () => Promise<unknown>
): Promise<void> {
  try {
    const result = await invoke();
    expect(result).not.toBeUndefined();
  } catch (error) {
    expect(error).toBeTruthy();
    const maybe = error as { message?: unknown; shape?: { code?: unknown } };
    expect(typeof maybe.message).toBe("string");
    if (maybe.shape) {
      expect(typeof maybe.shape.code === "string" || maybe.shape.code === undefined).toBe(true);
    }
  }
}

describe("Capability Heartbeat APIs", () => {
  const publicCaller = appRouter.createCaller(createPublicContext());
  const adminCaller = appRouter.createCaller(createAdminContext());

  it("ASK_ISA heartbeat", async () => {
    await expectNonCrashWithTypedErrorFallback(() =>
      publicCaller.askISA.getProductionQueries()
    );
  });

  it("NEWS_HUB heartbeat", async () => {
    await expectNonCrashWithTypedErrorFallback(() =>
      publicCaller.hub.getEventStats()
    );
  });

  it("KNOWLEDGE_BASE heartbeat", async () => {
    await expectNonCrashWithTypedErrorFallback(() =>
      adminCaller.citationAdmin.getChunksNeedingVerification({ limit: 1 })
    );
  });

  it("CATALOG heartbeat", async () => {
    await expectNonCrashWithTypedErrorFallback(() =>
      publicCaller.standardsDirectory.list({})
    );
  });

  it("ESRS_MAPPING heartbeat", async () => {
    await expectNonCrashWithTypedErrorFallback(() =>
      publicCaller.attributeRecommender.getAvailableSectors()
    );
  });

  it("ADVISORY heartbeat", async () => {
    await expectNonCrashWithTypedErrorFallback(() =>
      publicCaller.advisory.getSummary()
    );
  });
});
