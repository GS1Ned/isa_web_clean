/**
 * Tests for the news-impact service (E-01, E-02)
 * and confidence decay helper (E-03).
 *
 * All DB interactions are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock DB
// ---------------------------------------------------------------------------

const mockExecute = vi.fn().mockResolvedValue([[{ affectedRows: 0 }]]);
const mockUpdate = vi.fn().mockReturnThis();
const mockSet = vi.fn().mockReturnThis();
const mockWhere = vi.fn().mockResolvedValue(undefined);

vi.mock("../../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    execute: mockExecute,
    update: () => ({ set: () => ({ where: mockWhere }) }),
  }),
}));

import {
  flagAdvisoryReportsStaleSince,
  flagRegulationsNeedVerification,
  isVerificationTriggerState,
} from "../../services/news-impact";

// ---------------------------------------------------------------------------
// E-01: Advisory staleness
// ---------------------------------------------------------------------------

describe("flagAdvisoryReportsStaleSince", () => {
  beforeEach(() => {
    mockExecute.mockClear();
  });

  it("does nothing when regulationIds is empty", async () => {
    await flagAdvisoryReportsStaleSince([]);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("executes UPDATE for each regulation ID", async () => {
    await flagAdvisoryReportsStaleSince([1, 2]);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("UPDATE statement targets only un-stale reports", async () => {
    await flagAdvisoryReportsStaleSince([42]);
    const call = mockExecute.mock.calls[0][0];
    const queryStr = typeof call === "object" ? JSON.stringify(call) : String(call);
    expect(queryStr).toContain("stale_since IS NULL");
    expect(queryStr).toContain("42");
  });
});

// ---------------------------------------------------------------------------
// E-02: Regulation verification flag
// ---------------------------------------------------------------------------

describe("flagRegulationsNeedVerification", () => {
  beforeEach(() => {
    mockWhere.mockClear();
  });

  it("does nothing when regulationIds is empty", async () => {
    await flagRegulationsNeedVerification([]);
    expect(mockWhere).not.toHaveBeenCalled();
  });

  it("calls update for non-empty regulationIds", async () => {
    await flagRegulationsNeedVerification([10, 20]);
    expect(mockWhere).toHaveBeenCalledTimes(1);
  });
});

describe("isVerificationTriggerState", () => {
  it("returns true for ENFORCEMENT_SIGNAL", () => {
    expect(isVerificationTriggerState("ENFORCEMENT_SIGNAL")).toBe(true);
  });

  it("returns true for DELEGATED_ACT_DRAFT", () => {
    expect(isVerificationTriggerState("DELEGATED_ACT_DRAFT")).toBe(true);
  });

  it("returns true for DELEGATED_ACT_ADOPTED", () => {
    expect(isVerificationTriggerState("DELEGATED_ACT_ADOPTED")).toBe(true);
  });

  it("returns false for ADOPTED (normal state)", () => {
    expect(isVerificationTriggerState("ADOPTED")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isVerificationTriggerState(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isVerificationTriggerState(undefined)).toBe(false);
  });
});
