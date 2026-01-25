export type PipelineMode = "normal" | "backfill" | "incremental" | "full-refresh";

export interface PipelineModeConfig {
  mode: PipelineMode;
  maxAgeDays: number;
  description: string;
}

export const DEFAULT_PIPELINE_MODE: PipelineMode = "normal";

export const PIPELINE_MODE_CONFIGS: Record<PipelineMode, PipelineModeConfig> = {
  /** Normal mode: 30-day window for standard ingestion. */
  normal: {
    mode: "normal",
    maxAgeDays: 30,
    description: "Standard ingestion window for the most recent 30 days.",
  },
  /** Backfill mode: 200-day window for historical ingestion. */
  backfill: {
    mode: "backfill",
    maxAgeDays: 200,
    description: "Historical backfill window covering the last 200 days.",
  },
  /** Incremental mode: 7-day window for frequent updates. */
  incremental: {
    mode: "incremental",
    maxAgeDays: 7,
    description: "Incremental updates window covering the last 7 days.",
  },
  /** Full-refresh mode: 365-day window for complete rebuilds. */
  "full-refresh": {
    mode: "full-refresh",
    maxAgeDays: 365,
    description: "Full refresh window covering the last 365 days.",
  },
};

export const PIPELINE_MODES = Object.keys(
  PIPELINE_MODE_CONFIGS
) as PipelineMode[];

export function isPipelineMode(mode: string): mode is PipelineMode {
  return PIPELINE_MODES.includes(mode as PipelineMode);
}

export function resolvePipelineModeConfig(
  mode?: PipelineMode | string
): PipelineModeConfig {
  if (!mode) {
    return PIPELINE_MODE_CONFIGS[DEFAULT_PIPELINE_MODE];
  }

  if (isPipelineMode(mode)) {
    return PIPELINE_MODE_CONFIGS[mode];
  }

  throw new Error(
    `Invalid pipeline mode "${mode}". Supported modes: ${PIPELINE_MODES.join(", ")}.`
  );
}
