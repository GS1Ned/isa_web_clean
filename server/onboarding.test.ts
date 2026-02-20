import { beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { resetUserOnboardingProgress } from "./onboarding-progress";
import type { TrpcContext } from "./_core/context";

/**
 * Onboarding Progress Persistence Tests
 *
 * Deterministic suite using in-memory onboarding storage.
 */

describe("Onboarding Progress", () => {
  const mockUser = {
    id: 999,
    openId: "test-onboarding-user",
    name: "Test Onboarding User",
    email: "onboarding@test.com",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "oauth",
  } as any;

  const buildContext = (): TrpcContext =>
    ({
      req: { headers: {} } as any,
      res: {} as any,
      user: mockUser,
      traceId: "test-onboarding-trace-id",
    }) as TrpcContext;

  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    await resetUserOnboardingProgress(mockUser.id);
    caller = appRouter.createCaller(buildContext());
  });

  it("returns null for a new user with no progress", async () => {
    const progress = await caller.onboarding.getProgress();
    expect(progress).toBeNull();
  });

  it("saves initial onboarding progress", async () => {
    const result = await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    expect(result?.completedSteps).toEqual([1]);
    expect(result?.currentStep).toBe(2);
    expect(result?.completionPercentage).toBe(25);
    expect(Boolean(result?.isCompleted)).toBe(false);
  });

  it("loads saved progress", async () => {
    await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    const progress = await caller.onboarding.getProgress();
    expect(progress?.userId).toBe(mockUser.id);
    expect(progress?.completedSteps).toEqual([1]);
    expect(progress?.currentStep).toBe(2);
    expect(progress?.completionPercentage).toBe(25);
  });

  it("updates progress with additional steps", async () => {
    await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    const updated = await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    expect(updated?.completedSteps).toEqual([1, 2]);
    expect(updated?.currentStep).toBe(3);
    expect(updated?.completionPercentage).toBe(50);
    expect(Boolean(updated?.isCompleted)).toBe(false);
  });

  it("marks onboarding completed when all steps are done", async () => {
    const completed = await caller.onboarding.saveProgress({
      completedSteps: [1, 2, 3, 4],
      currentStep: 5,
    });

    expect(completed?.completionPercentage).toBe(100);
    expect(Boolean(completed?.isCompleted)).toBe(true);
    expect(completed?.completedAt).toBeDefined();
  });

  it("resets progress", async () => {
    await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    const resetResult = await caller.onboarding.resetProgress();
    expect(resetResult).toBe(true);

    const progress = await caller.onboarding.getProgress();
    expect(progress).toBeNull();
  });

  it("calculates percentage for partial and empty progress", async () => {
    const partial = await caller.onboarding.saveProgress({
      completedSteps: [1, 2, 3],
      currentStep: 4,
    });
    expect(partial?.completionPercentage).toBe(75);

    const empty = await caller.onboarding.saveProgress({
      completedSteps: [],
      currentStep: 1,
    });
    expect(empty?.completionPercentage).toBe(0);
    expect(Boolean(empty?.isCompleted)).toBe(false);
  });

  it("persists latest values across multiple saves", async () => {
    await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });
    await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    const progress = await caller.onboarding.getProgress();
    expect(progress?.completedSteps).toEqual([1, 2]);
    expect(progress?.currentStep).toBe(3);
  });

  it("updates timestamp fields on progress save", async () => {
    const first = await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    await new Promise(resolve => setTimeout(resolve, 25));

    const second = await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    expect(first?.startedAt).toBeDefined();
    expect(second?.updatedAt).toBeDefined();
    expect(new Date(second!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(first!.updatedAt).getTime()
    );
  });
});
