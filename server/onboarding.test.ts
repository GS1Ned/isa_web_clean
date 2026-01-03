import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Onboarding Progress Persistence Tests
 *
 * Tests user onboarding progress tracking:
 * - Progress loading for new users
 * - Progress saving and persistence
 * - Progress updates and completion tracking
 * - Progress reset functionality
 */

describe("Onboarding Progress", () => {
  let mockUser: any;
  let mockContext: any;

  beforeAll(async () => {
    // Create mock user for testing
    mockUser = {
      id: 999,
      openId: "test-onboarding-user",
      name: "Test Onboarding User",
      email: "onboarding@test.com",
      role: "user" as const,
    };

    // Create mock context
    mockContext = await createContext({
      req: {} as IncomingMessage,
      res: {} as ServerResponse,
    });
    mockContext.user = mockUser;
  });

  it("should return null for new user with no progress", async () => {
    const caller = appRouter.createCaller(mockContext);
    const progress = await caller.onboarding.getProgress();

    expect(progress).toBeNull();
  });

  it("should save initial onboarding progress", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    expect(result).toBeDefined();
    expect(result?.completedSteps).toEqual([1]);
    expect(result?.currentStep).toBe(2);
    expect(result?.completionPercentage).toBe(25); // 1/4 steps = 25%
    expect(Boolean(result?.isCompleted)).toBe(false);
  });

  it("should load saved progress", async () => {
    const caller = appRouter.createCaller(mockContext);

    const progress = await caller.onboarding.getProgress();

    expect(progress).toBeDefined();
    expect(progress?.userId).toBe(mockUser.id);
    expect(progress?.completedSteps).toEqual([1]);
    expect(progress?.currentStep).toBe(2);
    expect(progress?.completionPercentage).toBe(25);
  });

  it("should update progress with additional steps", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    expect(result?.completedSteps).toEqual([1, 2]);
    expect(result?.currentStep).toBe(3);
    expect(result?.completionPercentage).toBe(50); // 2/4 steps = 50%
    expect(Boolean(result?.isCompleted)).toBe(false);
  });

  it("should mark as completed when all steps done", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.onboarding.saveProgress({
      completedSteps: [1, 2, 3, 4],
      currentStep: 5,
    });

    expect(result?.completedSteps).toEqual([1, 2, 3, 4]);
    expect(result?.completionPercentage).toBe(100); // 4/4 steps = 100%
    expect(Boolean(result?.isCompleted)).toBe(true);
    expect(result?.completedAt).toBeDefined();
  });

  it("should reset progress", async () => {
    const caller = appRouter.createCaller(mockContext);

    const resetResult = await caller.onboarding.resetProgress();
    expect(resetResult).toBe(true);

    const progress = await caller.onboarding.getProgress();
    expect(progress).toBeNull();
  });

  it("should calculate correct completion percentage for partial progress", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.onboarding.saveProgress({
      completedSteps: [1, 2, 3],
      currentStep: 4,
    });

    expect(result?.completionPercentage).toBe(75); // 3/4 steps = 75%
  });

  it("should handle empty completed steps", async () => {
    const caller = appRouter.createCaller(mockContext);

    const result = await caller.onboarding.saveProgress({
      completedSteps: [],
      currentStep: 1,
    });

    expect(result?.completedSteps).toEqual([]);
    expect(result?.completionPercentage).toBe(0);
    expect(Boolean(result?.isCompleted)).toBe(false);
  });

  it("should persist progress across multiple saves", async () => {
    const caller = appRouter.createCaller(mockContext);

    // First save
    await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    // Second save
    await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    // Verify final state
    const progress = await caller.onboarding.getProgress();
    expect(progress?.completedSteps).toEqual([1, 2]);
    expect(progress?.currentStep).toBe(3);
  });

  it("should update timestamps on progress save", async () => {
    const caller = appRouter.createCaller(mockContext);

    const firstSave = await caller.onboarding.saveProgress({
      completedSteps: [1],
      currentStep: 2,
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    const secondSave = await caller.onboarding.saveProgress({
      completedSteps: [1, 2],
      currentStep: 3,
    });

    expect(firstSave?.startedAt).toBeDefined();
    expect(secondSave?.updatedAt).toBeDefined();
  });
});
