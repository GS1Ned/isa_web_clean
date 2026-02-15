/**
 * Pipeline Observability Logger
 * 
 * Provides structured logging and metrics tracking for news pipeline executions.
 * Enables systematic monitoring of AI processing quality, source reliability, and pipeline health.
 */

import { randomBytes } from "crypto";
import { format as utilFormat } from "node:util";

const silent =
  process.env.ISA_TEST_SILENT === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true";

export type PipelineType = 'news_ingestion' | 'news_archival';
export type TriggerSource = 'cron' | 'manual' | 'api';
export type ExecutionStatus = 'running' | 'success' | 'partial_success' | 'failed';
export type LogLevel = 'info' | 'warn' | 'error';
export type EventType = 
  | 'pipeline_start' 
  | 'source_fetch' 
  | 'age_filter'
  | 'ai_process' 
  | 'item_save' 
  | 'pipeline_complete' 
  | 'error';

/**
 * Structured log event format
 */
export interface PipelineLogEvent {
  timestamp: string; // ISO 8601
  executionId: string;
  pipelineType: PipelineType;
  eventType: EventType;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  durationMs?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Pipeline execution context for tracking metrics
 */
export class PipelineExecutionContext {
  public readonly executionId: string;
  public readonly pipelineType: PipelineType;
  public readonly triggeredBy: TriggerSource;
  public readonly startedAt: Date;
  
  private completedAt?: Date;
  private status: ExecutionStatus = 'running';
  
  // Source metrics
  private sourcesAttempted = 0;
  private sourcesSucceeded = 0;
  private sourcesFailed = 0;
  
  // Item metrics
  private itemsFetched = 0;
  private itemsDeduplicated = 0;
  private itemsProcessed = 0;
  private itemsSaved = 0;
  private itemsFailed = 0;
  
  // AI processing metrics
  private aiCallsMade = 0;
  private aiCallsSucceeded = 0;
  private aiCallsFailed = 0;
  private aiQualityScores: number[] = [];
  
  // Quality metrics
  private itemsWithSummary = 0;
  private itemsWithRegulationTags = 0;
  private itemsWithGs1ImpactTags = 0;
  private itemsWithSectorTags = 0;
  private itemsWithRecommendations = 0;
  
  // Error tracking
  private errors: Array<{ message: string; stack?: string; timestamp: string }> = [];
  private warnings: string[] = [];
  
  // Configuration snapshot
  private configSnapshot?: Record<string, unknown>;
  
  constructor(pipelineType: PipelineType, triggeredBy: TriggerSource) {
    this.executionId = this.generateExecutionId();
    this.pipelineType = pipelineType;
    this.triggeredBy = triggeredBy;
    this.startedAt = new Date();
  }
  
  private generateExecutionId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
  }
  
  /**
   * Log a structured event
   */
  log(event: Omit<PipelineLogEvent, 'timestamp' | 'executionId' | 'pipelineType'>): void {
    const logEvent: PipelineLogEvent = {
      timestamp: new Date().toISOString(),
      executionId: this.executionId,
      pipelineType: this.pipelineType,
      ...event,
    };
    
    if (!silent) {
      // Output with structured format (avoid direct console usage for strict governance)
      const write = (stream: NodeJS.WriteStream, ...args: unknown[]) =>
        stream.write(`${utilFormat(...args)}\n`);
      const logMethod =
        event.level === "error" || event.level === "warn"
          ? (...args: unknown[]) => write(process.stderr, ...args)
          : (...args: unknown[]) => write(process.stdout, ...args);
      logMethod(
        `[Pipeline ${this.executionId}] ${event.eventType}: ${event.message}`,
        event.data || ""
      );
    }
    
    // Track errors and warnings
    if (event.level === 'error' && event.error) {
      this.errors.push({
        message: event.error.message,
        stack: event.error.stack,
        timestamp: logEvent.timestamp,
      });
    } else if (event.level === 'warn') {
      this.warnings.push(event.message);
    }
  }
  
  /**
   * Record source fetch attempt
   */
  recordSourceAttempt(sourceId: string, success: boolean, itemCount?: number): void {
    this.sourcesAttempted++;
    if (success) {
      this.sourcesSucceeded++;
      if (itemCount !== undefined) {
        this.itemsFetched += itemCount;
      }
      this.log({
        eventType: 'source_fetch',
        level: 'info',
        message: `Source ${sourceId} fetched successfully`,
        data: { sourceId, itemCount },
      });
    } else {
      this.sourcesFailed++;
      this.log({
        eventType: 'source_fetch',
        level: 'error',
        message: `Source ${sourceId} fetch failed`,
        data: { sourceId },
      });
    }
  }
  
  /**
   * Record AI processing attempt with quality metrics
   */
  recordAiProcessing(success: boolean, qualityScore?: number, error?: Error): void {
    this.aiCallsMade++;
    if (success) {
      this.aiCallsSucceeded++;
      if (qualityScore !== undefined) {
        this.aiQualityScores.push(qualityScore);
      }
      this.log({
        eventType: 'ai_process',
        level: 'info',
        message: 'AI processing succeeded',
        data: { qualityScore },
      });
    } else {
      this.aiCallsFailed++;
      this.log({
        eventType: 'ai_process',
        level: 'error',
        message: 'AI processing failed',
        error: error ? {
          message: error.message,
          stack: error.stack,
        } : undefined,
      });
    }
  }
  
  /**
   * Record item processing result with quality flags
   */
  recordItemProcessed(
    saved: boolean,
    qualityFlags: {
      hasSummary: boolean;
      hasRegulationTags: boolean;
      hasGs1ImpactTags: boolean;
      hasSectorTags: boolean;
      hasRecommendations: boolean;
    }
  ): void {
    this.itemsProcessed++;
    if (saved) {
      this.itemsSaved++;
      if (qualityFlags.hasSummary) this.itemsWithSummary++;
      if (qualityFlags.hasRegulationTags) this.itemsWithRegulationTags++;
      if (qualityFlags.hasGs1ImpactTags) this.itemsWithGs1ImpactTags++;
      if (qualityFlags.hasSectorTags) this.itemsWithSectorTags++;
      if (qualityFlags.hasRecommendations) this.itemsWithRecommendations++;
    } else {
      this.itemsFailed++;
    }
  }
  
  /**
   * Record deduplication result
   */
  recordDeduplication(duplicateCount: number): void {
    this.itemsDeduplicated += duplicateCount;
    this.log({
      eventType: 'pipeline_complete',
      level: 'info',
      message: `Deduplicated ${duplicateCount} items`,
      data: { duplicateCount },
    });
  }
  
  /**
   * Set configuration snapshot for debugging
   */
  setConfigSnapshot(config: Record<string, unknown>): void {
    this.configSnapshot = config;
  }
  
  /**
   * Mark pipeline as complete
   */
  complete(status: ExecutionStatus): void {
    this.completedAt = new Date();
    this.status = status;
    
    const durationMs = this.completedAt.getTime() - this.startedAt.getTime();
    
    this.log({
      eventType: 'pipeline_complete',
      level: status === 'success' ? 'info' : status === 'partial_success' ? 'warn' : 'error',
      message: `Pipeline completed with status: ${status}`,
      data: {
        durationMs,
        itemsProcessed: this.itemsProcessed,
        itemsSaved: this.itemsSaved,
      },
      durationMs,
    });
  }
  
  /**
   * Get execution summary for database storage
   */
  getSummary() {
    const durationMs = this.completedAt 
      ? this.completedAt.getTime() - this.startedAt.getTime()
      : null;
    
    const aiAvgQualityScore = this.aiQualityScores.length > 0
      ? this.aiQualityScores.reduce((sum, score) => sum + score, 0) / this.aiQualityScores.length
      : null;
    
    return {
      executionId: this.executionId,
      pipelineType: this.pipelineType,
      triggeredBy: this.triggeredBy,
      startedAt: this.startedAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      durationMs,
      status: this.status,
      
      sourcesAttempted: this.sourcesAttempted,
      sourcesSucceeded: this.sourcesSucceeded,
      sourcesFailed: this.sourcesFailed,
      
      itemsFetched: this.itemsFetched,
      itemsDeduplicated: this.itemsDeduplicated,
      itemsProcessed: this.itemsProcessed,
      itemsSaved: this.itemsSaved,
      itemsFailed: this.itemsFailed,
      
      aiCallsMade: this.aiCallsMade,
      aiCallsSucceeded: this.aiCallsSucceeded,
      aiCallsFailed: this.aiCallsFailed,
      aiAvgQualityScore,
      
      itemsWithSummary: this.itemsWithSummary,
      itemsWithRegulationTags: this.itemsWithRegulationTags,
      itemsWithGs1ImpactTags: this.itemsWithGs1ImpactTags,
      itemsWithSectorTags: this.itemsWithSectorTags,
      itemsWithRecommendations: this.itemsWithRecommendations,
      
      errorCount: this.errors.length,
      errorMessages: this.errors.length > 0 ? JSON.stringify(this.errors) : null,
      warnings: this.warnings.length > 0 ? JSON.stringify(this.warnings) : null,
      
      configSnapshot: this.configSnapshot ? JSON.stringify(this.configSnapshot) : null,
    };
  }
}

/**
 * Calculate AI processing quality score
 * 
 * Composite score (0.0-1.0) based on:
 * - Summary coherence (40%): Length 100-500 chars, no truncation, grammatical
 * - Tag accuracy (40%): Regulation tags, GS1 impact tags, sector tags present
 * - Citation completeness (20%): Recommendations and related standards linked
 */
export function calculateQualityScore(processedItem: {
  summary?: string;
  regulationTags?: string[];
  gs1ImpactTags?: string[];
  sectorTags?: string[];
  suggestedActions?: unknown[];
  relatedStandardIds?: string[];
}): number {
  // Summary coherence score (0.0-1.0)
  const summaryLength = processedItem.summary?.length || 0;
  const summaryCoherence = (
    (summaryLength >= 100 && summaryLength <= 500 ? 1.0 : 0.5) * 0.5 +
    (!processedItem.summary?.includes('...') ? 1.0 : 0.0) * 0.3 +
    ((processedItem.summary?.split('.').length || 0) >= 2 ? 1.0 : 0.5) * 0.2
  );
  
  // Tag accuracy score (0.0-1.0)
  const tagAccuracy = (
    ((processedItem.regulationTags?.length || 0) > 0 ? 1.0 : 0.0) * 0.4 +
    ((processedItem.gs1ImpactTags?.length || 0) > 0 ? 1.0 : 0.0) * 0.3 +
    ((processedItem.sectorTags?.length || 0) > 0 ? 1.0 : 0.0) * 0.3
  );
  
  // Citation completeness score (0.0-1.0)
  const citationCompleteness = (
    ((processedItem.suggestedActions?.length || 0) > 0 ? 1.0 : 0.0) * 0.6 +
    ((processedItem.relatedStandardIds?.length || 0) > 0 ? 1.0 : 0.0) * 0.4
  );
  
  // Composite quality score
  return (
    summaryCoherence * 0.4 +
    tagAccuracy * 0.4 +
    citationCompleteness * 0.2
  );
}
