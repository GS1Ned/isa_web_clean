import { describe, expect, it } from "vitest";

import {
  KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS,
  buildKnowledgeEvidenceKey,
  doesKnowledgeChunkNeedVerification,
} from "./knowledge-provenance";

describe("knowledge provenance", () => {
  describe("doesKnowledgeChunkNeedVerification", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");

    it("returns true when no verification date exists", () => {
      expect(doesKnowledgeChunkNeedVerification(undefined, now)).toBe(true);
      expect(doesKnowledgeChunkNeedVerification(null, now)).toBe(true);
    });

    it("returns false for recently verified chunks", () => {
      expect(
        doesKnowledgeChunkNeedVerification("2026-02-20T00:00:00.000Z", now)
      ).toBe(false);
    });

    it("returns true for stale verification dates", () => {
      expect(
        doesKnowledgeChunkNeedVerification("2025-10-31T00:00:00.000Z", now)
      ).toBe(true);
    });

    it("treats invalid verification dates as needing review", () => {
      expect(doesKnowledgeChunkNeedVerification("not-a-date", now)).toBe(true);
    });

    it("keeps the verification window fixed at ninety days", () => {
      expect(KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS).toBe(90);
    });
  });

  describe("buildKnowledgeEvidenceKey", () => {
    it("builds canonical evidence keys for chunk citations", () => {
      expect(buildKnowledgeEvidenceKey(42, "abc123")).toEqual({
        evidenceKey: "ke:42:abc123",
        evidenceKeyReason: "ok",
      });
    });

    it("returns a null key when the content hash is absent", () => {
      expect(buildKnowledgeEvidenceKey(42, null)).toEqual({
        evidenceKey: null,
        evidenceKeyReason: "missing_content_hash",
      });
    });
  });
});
