export type OnboardingProgress = {
  id: number;
  userId: number;
  completedSteps: number[];
  currentStep: number;
  completionPercentage: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
};

const TOTAL_STEPS = 4;
const progressStore = new Map<number, OnboardingProgress>();
let progressId = 1;

const calculateCompletion = (completedSteps: number[]) =>
  Math.round((completedSteps.length / TOTAL_STEPS) * 100);

export async function getUserOnboardingProgress(userId: number) {
  return progressStore.get(userId) ?? null;
}

export async function saveUserOnboardingProgress(
  userId: number,
  completedSteps: number[],
  currentStep: number
) {
  const completionPercentage = calculateCompletion(completedSteps);
  const isCompleted = completedSteps.length >= TOTAL_STEPS;
  const now = new Date().toISOString();

  const existing = progressStore.get(userId);
  if (existing) {
    const updated: OnboardingProgress = {
      ...existing,
      completedSteps,
      currentStep,
      completionPercentage,
      isCompleted,
      completedAt: isCompleted ? now : null,
      updatedAt: now,
    };
    progressStore.set(userId, updated);
    return updated;
  }

  const created: OnboardingProgress = {
    id: progressId++,
    userId,
    completedSteps,
    currentStep,
    completionPercentage,
    isCompleted,
    startedAt: now,
    completedAt: isCompleted ? now : null,
    updatedAt: now,
  };
  progressStore.set(userId, created);
  return created;
}

export async function resetUserOnboardingProgress(userId: number) {
  return progressStore.delete(userId);
}
