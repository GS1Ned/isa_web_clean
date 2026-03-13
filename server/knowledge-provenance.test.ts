import { describe, expect, it } from "vitest";

import {
  KNOWLEDGE_VERIFICATION_MAX_AGE_DAYS,
  buildKnowledgeCitationLabel,
  buildKnowledgeEvidenceKey,
  buildSourceChunkLocator,
  getKnowledgeVerificationAgeDays,
  doesKnowledgeChunkNeedVerification,
  getKnowledgeVerificationReason,
  getKnowledgeVerificationFreshnessBucket,
  getKnowledgeVerificationStatus,
  summarizeKnowledgeVerificationPosture,
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

  describe("getKnowledgeVerificationReason", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");

    it("returns a stable reason for missing verification dates", () => {
      expect(getKnowledgeVerificationReason(undefined, now)).toBe("missing_last_verified_date");
      expect(getKnowledgeVerificationReason(null, now)).toBe("missing_last_verified_date");
    });

    it("returns ok for recent verification dates", () => {
      expect(getKnowledgeVerificationReason("2026-02-20T00:00:00.000Z", now)).toBe("ok");
    });

    it("returns stale reason for old verification dates", () => {
      expect(getKnowledgeVerificationReason("2025-10-31T00:00:00.000Z", now)).toBe(
        "stale_last_verified_date"
      );
    });

    it("returns invalid reason for malformed verification dates", () => {
      expect(getKnowledgeVerificationReason("not-a-date", now)).toBe("invalid_last_verified_date");
    });
  });

  describe("getKnowledgeVerificationAgeDays", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");

    it("returns age in whole days for valid verification dates", () => {
      expect(getKnowledgeVerificationAgeDays("2026-02-20T00:00:00.000Z", now)).toBe(11);
    });

    it("returns null for missing or invalid verification dates", () => {
      expect(getKnowledgeVerificationAgeDays(undefined, now)).toBeNull();
      expect(getKnowledgeVerificationAgeDays("not-a-date", now)).toBeNull();
    });
  });

  describe("getKnowledgeVerificationStatus", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");

    it("returns an aligned status object for stale verification dates", () => {
      expect(
        getKnowledgeVerificationStatus("2025-10-31T00:00:00.000Z", now)
      ).toEqual({
        needsVerification: true,
        reason: "stale_last_verified_date",
        verificationAgeDays: 123,
      });
    });

    it("returns an aligned status object for healthy verification dates", () => {
      expect(
        getKnowledgeVerificationStatus("2026-02-20T00:00:00.000Z", now)
      ).toEqual({
        needsVerification: false,
        reason: "ok",
        verificationAgeDays: 11,
      });
    });
  });

  describe("getKnowledgeVerificationFreshnessBucket", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");

    it("classifies recent verification as fresh", () => {
      expect(getKnowledgeVerificationFreshnessBucket("2026-02-20T00:00:00.000Z", now)).toBe(
        "fresh"
      );
    });

    it("classifies healthy but older verification as aging", () => {
      expect(getKnowledgeVerificationFreshnessBucket("2025-12-15T00:00:00.000Z", now)).toBe(
        "aging"
      );
    });

    it("classifies stale verification as stale", () => {
      expect(getKnowledgeVerificationFreshnessBucket("2025-10-31T00:00:00.000Z", now)).toBe(
        "stale"
      );
    });

    it("classifies missing or invalid verification as unknown", () => {
      expect(getKnowledgeVerificationFreshnessBucket(undefined, now)).toBe("unknown");
      expect(getKnowledgeVerificationFreshnessBucket("not-a-date", now)).toBe("unknown");
    });
  });

  describe("summarizeKnowledgeVerificationPosture", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");

    it("summarizes reasons, buckets, and age stats consistently", () => {
      expect(
        summarizeKnowledgeVerificationPosture(
          [
            "2026-02-20T00:00:00.000Z",
            "2025-12-15T00:00:00.000Z",
            "2025-10-31T00:00:00.000Z",
            undefined,
            "not-a-date",
          ],
          now
        )
      ).toEqual({
        totalChecked: 5,
        needsVerificationCount: 3,
        countsByReason: {
          ok: 2,
          missing_last_verified_date: 1,
          invalid_last_verified_date: 1,
          stale_last_verified_date: 1,
        },
        freshnessBuckets: {
          fresh: 1,
          aging: 1,
          stale: 1,
          unknown: 2,
        },
        oldestVerificationAgeDays: 123,
        medianVerificationAgeDays: 78,
      });
    });
  });

  describe("buildKnowledgeEvidenceKey", () => {
    it("builds canonical evidence keys for chunk citations", () => {
      expect(buildKnowledgeEvidenceKey(42, "abc123")).toEqual({
        evidenceKey: "ke:42:abc123",
        evidenceKeyReason: "ok",
      });
    });

    it("requires an authoritative chunk identifier", () => {
      expect(buildKnowledgeEvidenceKey(null, "abc123")).toEqual({
        evidenceKey: null,
        evidenceKeyReason: "missing_authoritative_chunk",
      });
    });

    it("returns a null key when the content hash is absent", () => {
      expect(buildKnowledgeEvidenceKey(42, null)).toEqual({
        evidenceKey: null,
        evidenceKeyReason: "missing_content_hash",
      });
    });
  });

  describe("buildSourceChunkLocator", () => {
    it("prefers structural section paths when available", () => {
      expect(
        buildSourceChunkLocator({
          sectionPath: "Article 3 > Paragraph 2",
          heading: "Article 3",
          charStart: 12,
          charEnd: 42,
        }),
      ).toBe("Article 3 > Paragraph 2");
    });

    it("falls back to heading and character spans", () => {
      expect(
        buildSourceChunkLocator({
          heading: "Scope",
        }),
      ).toBe("Scope");
      expect(
        buildSourceChunkLocator({
          charStart: 10,
          charEnd: 42,
        }),
      ).toBe("chars 10-42");
    });
  });

  describe("buildKnowledgeCitationLabel", () => {
    it("builds human-usable citation labels from title, locator, and version", () => {
      expect(
        buildKnowledgeCitationLabel({
          title: "Corporate Sustainability Reporting Directive",
          locator: "Article 3",
          version: "2023-07-31",
        }),
      ).toBe("Corporate Sustainability Reporting Directive — Article 3 — v2023-07-31");
    });

    it("returns null when no title is available", () => {
      expect(
        buildKnowledgeCitationLabel({
          locator: "Article 3",
        }),
      ).toBeNull();
    });
  });
});
