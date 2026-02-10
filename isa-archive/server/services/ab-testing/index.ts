/**
 * ISA A/B Testing Service
 * 
 * Manages A/B test configurations for Ask ISA prompt variants.
 * Supports:
 * - Multiple concurrent experiments
 * - User-based consistent assignment
 * - Traffic allocation control
 * - Automatic metrics collection
 */

import { randomUUID } from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  startDate?: Date;
  endDate?: Date;
  targetSampleSize?: number;
  currentSampleSize: number;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // 0-100 percentage
  config: VariantConfig;
}

export interface VariantConfig {
  promptVersion: string;
  parameters?: Record<string, unknown>;
}

export interface Assignment {
  experimentId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
}

// ============================================================================
// Experiment Definitions
// ============================================================================

/**
 * Active experiments configuration
 * 
 * CITE_THEN_WRITE_V1: Compare the new Cite-then-Write prompt against baseline
 */
export const EXPERIMENTS: Record<string, Experiment> = {
  CITE_THEN_WRITE_V1: {
    id: 'exp_cite_then_write_v1',
    name: 'Cite-then-Write Prompt Evaluation',
    description: 'Compare v3_cite_then_write prompt against v2_modular baseline for citation accuracy and answer quality',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Control (v2_modular)',
        description: 'Current production prompt with modular structure',
        trafficAllocation: 50,
        config: {
          promptVersion: 'v2_modular',
          parameters: {}
        }
      },
      {
        id: 'treatment',
        name: 'Treatment (v3_cite_then_write)',
        description: 'New Cite-then-Write prompt with evidence extraction phase',
        trafficAllocation: 50,
        config: {
          promptVersion: 'v3_cite_then_write',
          parameters: {
            requireDiverseSources: true,
            minCitations: 2,
            maxCitations: 5
          }
        }
      }
    ],
    startDate: new Date(),
    targetSampleSize: 500,
    currentSampleSize: 0
  }
};

// ============================================================================
// Assignment Logic
// ============================================================================

/**
 * Hash function for consistent user assignment
 * Uses a simple but effective hash to ensure same user always gets same variant
 */
function hashUserToVariant(userId: string, experimentId: string): number {
  const combined = `${userId}:${experimentId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Get variant assignment for a user in an experiment
 * 
 * @param userId - Unique user identifier (can be session ID for anonymous users)
 * @param experimentId - Experiment to get assignment for
 * @returns Assignment with variant details, or null if experiment not found/active
 */
export function getVariantAssignment(
  userId: string,
  experimentId: string
): Assignment | null {
  const experiment = EXPERIMENTS[experimentId];
  
  if (!experiment || experiment.status !== 'running') {
    return null;
  }
  
  // Get consistent hash for user
  const bucket = hashUserToVariant(userId, experimentId);
  
  // Find variant based on traffic allocation
  let cumulativeAllocation = 0;
  for (const variant of experiment.variants) {
    cumulativeAllocation += variant.trafficAllocation;
    if (bucket < cumulativeAllocation) {
      return {
        experimentId: experiment.id,
        variantId: variant.id,
        userId,
        assignedAt: new Date()
      };
    }
  }
  
  // Fallback to first variant (shouldn't happen if allocations sum to 100)
  return {
    experimentId: experiment.id,
    variantId: experiment.variants[0].id,
    userId,
    assignedAt: new Date()
  };
}

/**
 * Get the prompt version to use for a user
 * 
 * @param userId - Unique user identifier
 * @returns Prompt version string (e.g., 'v2_modular' or 'v3_cite_then_write')
 */
export function getPromptVersionForUser(userId: string): string {
  // Check if user is in Cite-then-Write experiment
  const assignment = getVariantAssignment(userId, 'CITE_THEN_WRITE_V1');
  
  if (assignment) {
    const experiment = EXPERIMENTS.CITE_THEN_WRITE_V1;
    const variant = experiment.variants.find(v => v.id === assignment.variantId);
    if (variant) {
      return variant.config.promptVersion;
    }
  }
  
  // Default to current production prompt
  return 'v2_modular';
}

/**
 * Get full variant config for a user
 * 
 * @param userId - Unique user identifier
 * @returns Variant config with prompt version and parameters
 */
export function getVariantConfigForUser(userId: string): VariantConfig {
  const assignment = getVariantAssignment(userId, 'CITE_THEN_WRITE_V1');
  
  if (assignment) {
    const experiment = EXPERIMENTS.CITE_THEN_WRITE_V1;
    const variant = experiment.variants.find(v => v.id === assignment.variantId);
    if (variant) {
      return variant.config;
    }
  }
  
  // Default config
  return {
    promptVersion: 'v2_modular',
    parameters: {}
  };
}

// ============================================================================
// Experiment Management
// ============================================================================

/**
 * Get experiment status and statistics
 */
export function getExperimentStatus(experimentId: string): {
  experiment: Experiment | null;
  isRunning: boolean;
  progress: number;
} {
  const experiment = EXPERIMENTS[experimentId];
  
  if (!experiment) {
    return { experiment: null, isRunning: false, progress: 0 };
  }
  
  const progress = experiment.targetSampleSize 
    ? (experiment.currentSampleSize / experiment.targetSampleSize) * 100
    : 0;
  
  return {
    experiment,
    isRunning: experiment.status === 'running',
    progress
  };
}

/**
 * List all experiments
 */
export function listExperiments(): Experiment[] {
  return Object.values(EXPERIMENTS);
}

/**
 * Increment sample size for an experiment
 * Call this when a user completes a query in the experiment
 */
export function incrementSampleSize(experimentId: string): void {
  const experiment = EXPERIMENTS[experimentId];
  if (experiment) {
    experiment.currentSampleSize++;
    
    // Auto-complete if target reached
    if (experiment.targetSampleSize && 
        experiment.currentSampleSize >= experiment.targetSampleSize) {
      experiment.status = 'completed';
      experiment.endDate = new Date();
    }
  }
}

// ============================================================================
// Metrics Collection
// ============================================================================

export interface ExperimentMetrics {
  experimentId: string;
  variantId: string;
  userId: string;
  queryId: string;
  metrics: {
    latencyMs: number;
    citationCount: number;
    citationPrecision?: number;
    traceabilityScore?: number;
    sourceDiversity?: number;
    userFeedback?: 'positive' | 'negative' | null;
  };
  timestamp: Date;
}

/**
 * Record metrics for an experiment query
 * In production, this would write to the database
 */
export function recordExperimentMetrics(metrics: ExperimentMetrics): void {
  // Log for now - in production, write to rag_traces with experiment metadata
  console.log('[A/B Test] Recording metrics:', {
    experiment: metrics.experimentId,
    variant: metrics.variantId,
    latency: metrics.metrics.latencyMs,
    citations: metrics.metrics.citationCount
  });
}

// ============================================================================
// Feature Flags Integration
// ============================================================================

/**
 * Feature flags that can be toggled independently of A/B tests
 */
export const FEATURE_FLAGS = {
  // Enable the new authority scoring system
  AUTHORITY_SCORING_V2: true,
  
  // Enable hard abstention policy
  HARD_ABSTENTION: true,
  
  // Enable RAG tracing
  RAG_TRACING: true,
  
  // Enable quality metrics calculation
  QUALITY_METRICS: true,
  
  // Enable Cite-then-Write for all users (overrides A/B test)
  CITE_THEN_WRITE_GLOBAL: false
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureName: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[featureName] ?? false;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getVariantAssignment,
  getPromptVersionForUser,
  getVariantConfigForUser,
  getExperimentStatus,
  listExperiments,
  incrementSampleSize,
  recordExperimentMetrics,
  isFeatureEnabled,
  EXPERIMENTS,
  FEATURE_FLAGS
};
