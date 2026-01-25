/**
 * Pipeline Observability Tests
 * 
 * Tests for pipeline logging infrastructure, quality scoring, and database helpers.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PipelineExecutionContext, calculateQualityScore } from "./utils/pipeline-logger";

describe("Pipeline Observability", () => {
  describe("PipelineExecutionContext", () => {
    let ctx: PipelineExecutionContext;

    beforeEach(() => {
      ctx = new PipelineExecutionContext("news_ingestion", "manual");
    });

    it("should generate unique execution IDs", () => {
      const ctx1 = new PipelineExecutionContext("news_ingestion", "cron");
      const ctx2 = new PipelineExecutionContext("news_ingestion", "cron");
      expect(ctx1.executionId).not.toBe(ctx2.executionId);
    });

    it("should track source fetch attempts correctly", () => {
      ctx.recordSourceAttempt("source-1", true, 10);
      ctx.recordSourceAttempt("source-2", true, 5);
      ctx.recordSourceAttempt("source-3", false, 0);

      const summary = ctx.getSummary();
      expect(summary.sourcesAttempted).toBe(3);
      expect(summary.sourcesSucceeded).toBe(2);
      expect(summary.sourcesFailed).toBe(1);
      expect(summary.itemsFetched).toBe(15);
    });

    it("should track AI processing with quality scores", () => {
      ctx.recordAiProcessing(true, 0.85);
      ctx.recordAiProcessing(true, 0.75);
      ctx.recordAiProcessing(false, undefined, new Error("AI failed"));

      const summary = ctx.getSummary();
      expect(summary.aiCallsMade).toBe(3);
      expect(summary.aiCallsSucceeded).toBe(2);
      expect(summary.aiCallsFailed).toBe(1);
      expect(summary.aiAvgQualityScore).toBeCloseTo(0.8, 2);
    });

    it("should track item processing with quality flags", () => {
      ctx.recordItemProcessed(true, {
        hasSummary: true,
        hasRegulationTags: true,
        hasGs1ImpactTags: true,
        hasSectorTags: true,
        hasRecommendations: true,
      });

      ctx.recordItemProcessed(true, {
        hasSummary: true,
        hasRegulationTags: true,
        hasGs1ImpactTags: false,
        hasSectorTags: false,
        hasRecommendations: false,
      });

      ctx.recordItemProcessed(false, {
        hasSummary: false,
        hasRegulationTags: false,
        hasGs1ImpactTags: false,
        hasSectorTags: false,
        hasRecommendations: false,
      });

      const summary = ctx.getSummary();
      expect(summary.itemsProcessed).toBe(3);
      expect(summary.itemsSaved).toBe(2);
      expect(summary.itemsFailed).toBe(1);
      expect(summary.itemsWithSummary).toBe(2);
      expect(summary.itemsWithRegulationTags).toBe(2);
      expect(summary.itemsWithGs1ImpactTags).toBe(1);
      expect(summary.itemsWithSectorTags).toBe(1);
      expect(summary.itemsWithRecommendations).toBe(1);
    });

    it("should track deduplication correctly", () => {
      ctx.recordDeduplication(5);
      ctx.recordDeduplication(3);

      const summary = ctx.getSummary();
      expect(summary.itemsDeduplicated).toBe(8);
    });

    it("should complete with correct status and duration", async () => {
      // Add small delay to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));
      ctx.complete("success");

      const summary = ctx.getSummary();
      expect(summary.status).toBe("success");
      expect(summary.completedAt).toBeDefined();
      expect(summary.durationMs).toBeGreaterThan(0);
    });

    it("should track errors and warnings", () => {
      ctx.log({
        eventType: "error",
        level: "error",
        message: "Test error",
        error: {
          message: "Something went wrong",
          stack: "Error stack trace",
        },
      });

      ctx.log({
        eventType: "pipeline_complete",
        level: "warn",
        message: "Test warning",
      });

      ctx.complete("partial_success");

      const summary = ctx.getSummary();
      expect(summary.errorCount).toBe(1);
      expect(summary.errorMessages).toBeDefined();
      expect(summary.warnings).toBeDefined();

      const errors = JSON.parse(summary.errorMessages!);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Something went wrong");

      const warnings = JSON.parse(summary.warnings!);
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings).toContain("Test warning");
    });

    it("should store config snapshot", () => {
      const config = {
        filterByAge: 30,
        sources: ["source-1", "source-2"],
        enableAI: true,
      };

      ctx.setConfigSnapshot(config);

      const summary = ctx.getSummary();
      expect(summary.configSnapshot).toBeDefined();
      expect(JSON.parse(summary.configSnapshot!)).toEqual(config);
    });
  });

  describe("calculateQualityScore", () => {
    it("should return 1.0 for perfect quality item", () => {
      const score = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences. It provides detailed information about the regulatory change.",
        regulationTags: ["CSRD", "ESRS"],
        gs1ImpactTags: ["ESG_REPORTING", "TRACEABILITY"],
        sectorTags: ["FOOD_BEVERAGE", "RETAIL"],
        suggestedActions: [
          "Review GDSN attributes",
          "Update product master data",
          "Implement EPCIS events",
        ],
        relatedStandardIds: ["GS1-001", "GS1-002"],
      });

      expect(score).toBeGreaterThan(0.9);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it("should return low score for minimal quality item", () => {
      const score = calculateQualityScore({
        summary: "Short",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      expect(score).toBeLessThan(0.3);
    });

    it("should penalize truncated summaries", () => {
      const scoreWithTruncation = calculateQualityScore({
        summary: "This summary is truncated...",
        regulationTags: ["CSRD"],
        gs1ImpactTags: ["ESG_REPORTING"],
        sectorTags: ["FOOD_BEVERAGE"],
        suggestedActions: ["Action 1"],
        relatedStandardIds: [],
      });

      const scoreWithoutTruncation = calculateQualityScore({
        summary: "This summary is complete and provides full information.",
        regulationTags: ["CSRD"],
        gs1ImpactTags: ["ESG_REPORTING"],
        sectorTags: ["FOOD_BEVERAGE"],
        suggestedActions: ["Action 1"],
        relatedStandardIds: [],
      });

      expect(scoreWithoutTruncation).toBeGreaterThan(scoreWithTruncation);
    });

    it("should score summary length appropriately", () => {
      const tooShort = calculateQualityScore({
        summary: "Too short",
        regulationTags: ["CSRD"],
        gs1ImpactTags: ["ESG_REPORTING"],
        sectorTags: ["FOOD_BEVERAGE"],
        suggestedActions: ["Action 1"],
        relatedStandardIds: [],
      });

      const optimal = calculateQualityScore({
        summary: "This is an optimal length summary that provides comprehensive information about the regulatory change. It includes multiple sentences and detailed context about the impact on GS1 standards and supply chain operations.",
        regulationTags: ["CSRD"],
        gs1ImpactTags: ["ESG_REPORTING"],
        sectorTags: ["FOOD_BEVERAGE"],
        suggestedActions: ["Action 1"],
        relatedStandardIds: [],
      });

      const tooLong = calculateQualityScore({
        summary: "This is an excessively long summary that goes beyond the optimal length. ".repeat(20),
        regulationTags: ["CSRD"],
        gs1ImpactTags: ["ESG_REPORTING"],
        sectorTags: ["FOOD_BEVERAGE"],
        suggestedActions: ["Action 1"],
        relatedStandardIds: [],
      });

      expect(optimal).toBeGreaterThan(tooShort);
      expect(optimal).toBeGreaterThan(tooLong);
    });

    it("should weight regulation tags at 40% of tag accuracy", () => {
      const withRegulationTags = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: ["CSRD", "ESRS"],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      const withoutRegulationTags = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      // Regulation tags contribute 40% of tag accuracy (which is 40% of total)
      // So difference should be around 0.4 * 0.4 = 0.16
      const difference = withRegulationTags - withoutRegulationTags;
      expect(difference).toBeGreaterThan(0.1);
      expect(difference).toBeLessThan(0.2);
    });

    it("should weight GS1 impact tags at 30% of tag accuracy", () => {
      const withGs1Tags = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: ["ESG_REPORTING", "TRACEABILITY"],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      const withoutGs1Tags = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      // GS1 impact tags contribute 30% of tag accuracy (which is 40% of total)
      // So difference should be around 0.3 * 0.4 = 0.12
      const difference = withGs1Tags - withoutGs1Tags;
      expect(difference).toBeGreaterThan(0.08);
      expect(difference).toBeLessThan(0.15);
    });

    it("should weight sector tags at 30% of tag accuracy", () => {
      const withSectorTags = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: ["FOOD_BEVERAGE", "RETAIL"],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      const withoutSectorTags = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      // Sector tags contribute 30% of tag accuracy (which is 40% of total)
      // So difference should be around 0.3 * 0.4 = 0.12
      const difference = withSectorTags - withoutSectorTags;
      expect(difference).toBeGreaterThan(0.08);
      expect(difference).toBeLessThan(0.15);
    });

    it("should weight recommendations at 60% of citation completeness", () => {
      const withRecommendations = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: ["Action 1", "Action 2"],
        relatedStandardIds: [],
      });

      const withoutRecommendations = calculateQualityScore({
        summary: "This is a comprehensive summary with multiple sentences.",
        regulationTags: [],
        gs1ImpactTags: [],
        sectorTags: [],
        suggestedActions: [],
        relatedStandardIds: [],
      });

      // Recommendations contribute 60% of citation completeness (which is 20% of total)
      // So difference should be around 0.6 * 0.2 = 0.12
      const difference = withRecommendations - withoutRecommendations;
      expect(difference).toBeGreaterThan(0.08);
      expect(difference).toBeLessThan(0.15);
    });

    it("should handle undefined/null values gracefully", () => {
      const score = calculateQualityScore({
        summary: undefined,
        regulationTags: undefined,
        gs1ImpactTags: undefined,
        sectorTags: undefined,
        suggestedActions: undefined,
        relatedStandardIds: undefined,
      });

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should return consistent scores for identical inputs", () => {
      const input = {
        summary: "This is a test summary with multiple sentences.",
        regulationTags: ["CSRD"],
        gs1ImpactTags: ["ESG_REPORTING"],
        sectorTags: ["FOOD_BEVERAGE"],
        suggestedActions: ["Action 1"],
        relatedStandardIds: ["GS1-001"],
      };

      const score1 = calculateQualityScore(input);
      const score2 = calculateQualityScore(input);

      expect(score1).toBe(score2);
    });
  });
});
