/**
 * Data Quality Tests
 * Track B Priority 1: Data Quality Foundation
 * 
 * 5 tests validating data integrity and completeness
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  getOrphanedRegulations,
  getOrphanedStandards,
  getRegulationsWithMissingMetadata,
  getStandardsWithMissingMetadata,
  getDataQualitySummary,
  getDuplicateRegulations,
  getDuplicateStandards,
} from "./db-data-quality";

describe("Data Quality Tests - Priority 1", () => {
  /**
   * Test 1: Verify data quality summary returns valid structure
   */
  it("should return valid data quality summary structure", async () => {
    const summary = await getDataQualitySummary();

    // Verify structure
    expect(summary).toHaveProperty("totalRecords");
    expect(summary).toHaveProperty("orphanedRecords");
    expect(summary).toHaveProperty("missingMetadata");
    expect(summary).toHaveProperty("qualityScores");

    // Verify total records
    expect(summary.totalRecords).toHaveProperty("regulations");
    expect(summary.totalRecords).toHaveProperty("standards");
    expect(summary.totalRecords).toHaveProperty("mappings");
    expect(summary.totalRecords).toHaveProperty("esrsDatapoints");

    // Verify all counts are non-negative
    expect(summary.totalRecords.regulations).toBeGreaterThanOrEqual(0);
    expect(summary.totalRecords.standards).toBeGreaterThanOrEqual(0);
    expect(summary.totalRecords.mappings).toBeGreaterThanOrEqual(0);
    expect(summary.totalRecords.esrsDatapoints).toBeGreaterThanOrEqual(0);

    // Verify quality scores are in valid range (0-100)
    expect(summary.qualityScores.overall).toBeGreaterThanOrEqual(0);
    expect(summary.qualityScores.overall).toBeLessThanOrEqual(100);
    expect(summary.qualityScores.regulationQuality).toBeGreaterThanOrEqual(0);
    expect(summary.qualityScores.regulationQuality).toBeLessThanOrEqual(100);
    expect(summary.qualityScores.standardQuality).toBeGreaterThanOrEqual(0);
    expect(summary.qualityScores.standardQuality).toBeLessThanOrEqual(100);
    expect(summary.qualityScores.mappingCoverage).toBeGreaterThanOrEqual(0);
    expect(summary.qualityScores.mappingCoverage).toBeLessThanOrEqual(100);
  });

  /**
   * Test 2: Verify orphaned regulations detection
   */
  it("should detect orphaned regulations correctly", async () => {
    const orphanedRegs = await getOrphanedRegulations();

    // Should return an array
    expect(Array.isArray(orphanedRegs)).toBe(true);

    // Each orphaned regulation should have required fields
    orphanedRegs.forEach((reg) => {
      expect(reg).toHaveProperty("id");
      expect(reg).toHaveProperty("title");
      expect(reg).toHaveProperty("regulationType");
      expect(typeof reg.id).toBe("number");
      expect(typeof reg.title).toBe("string");
    });
  });

  /**
   * Test 3: Verify orphaned standards detection
   */
  it("should detect orphaned standards correctly", async () => {
    const orphanedStds = await getOrphanedStandards();

    // Should return an array
    expect(Array.isArray(orphanedStds)).toBe(true);

    // Each orphaned standard should have required fields
    orphanedStds.forEach((std) => {
      expect(std).toHaveProperty("id");
      expect(std).toHaveProperty("standardName");
      expect(std).toHaveProperty("standardCode");
      expect(typeof std.id).toBe("number");
      expect(typeof std.standardName).toBe("string");
      expect(typeof std.standardCode).toBe("string");
    });
  });

  /**
   * Test 4: Verify missing metadata detection for regulations
   */
  it("should detect regulations with missing metadata", async () => {
    const regsMissingMeta = await getRegulationsWithMissingMetadata();

    // Should return an array
    expect(Array.isArray(regsMissingMeta)).toBe(true);

    // Each record should have required fields and at least one missing field flag
    regsMissingMeta.forEach((reg) => {
      expect(reg).toHaveProperty("id");
      expect(reg).toHaveProperty("title");
      expect(reg).toHaveProperty("regulationType");
      expect(reg).toHaveProperty("missingDescription");
      expect(reg).toHaveProperty("missingSourceUrl");
      expect(reg).toHaveProperty("missingEffectiveDate");

      // At least one field should be missing (1 for true in SQL)
      const hasMissingField =
        reg.missingDescription || reg.missingSourceUrl || reg.missingEffectiveDate;
      expect(hasMissingField).toBeTruthy();
    });
  });

  /**
   * Test 5: Verify missing metadata detection for standards
   */
  it("should detect standards with missing metadata", async () => {
    const stdsMissingMeta = await getStandardsWithMissingMetadata();

    // Should return an array
    expect(Array.isArray(stdsMissingMeta)).toBe(true);

    // Each record should have required fields and at least one missing field flag
    stdsMissingMeta.forEach((std) => {
      expect(std).toHaveProperty("id");
      expect(std).toHaveProperty("standardName");
      expect(std).toHaveProperty("standardCode");
      expect(std).toHaveProperty("missingDescription");
      expect(std).toHaveProperty("missingCategory");
      expect(std).toHaveProperty("missingReferenceUrl");

      // At least one field should be missing (1 for true in SQL)
      const hasMissingField =
        std.missingDescription || std.missingCategory || std.missingReferenceUrl;
      expect(hasMissingField).toBeTruthy();
    });
  });

  /**
   * Bonus Test: Verify duplicate detection
   */
  it("should detect duplicate regulations and standards", async () => {
    const duplicateRegs = await getDuplicateRegulations();
    const duplicateStds = await getDuplicateStandards();

    // Should return arrays
    expect(Array.isArray(duplicateRegs)).toBe(true);
    expect(Array.isArray(duplicateStds)).toBe(true);

    // Each duplicate should have count > 1
    duplicateRegs.forEach((dup) => {
      expect(dup).toHaveProperty("celexId");
      expect(dup).toHaveProperty("count");
      expect(dup.count).toBeGreaterThan(1);
    });

    duplicateStds.forEach((dup) => {
      expect(dup).toHaveProperty("standardCode");
      expect(dup).toHaveProperty("count");
      expect(dup.count).toBeGreaterThan(1);
    });
  });
});
