import { describe, expect, it } from "vitest";
import { recordIngestProvenance, sha256Hex } from "./provenance";

describe("server/ingest/_core/provenance", () => {
  it("sha256Hex is deterministic and matches a known test vector", () => {
    expect(sha256Hex("test")).toBe(
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    );
    expect(sha256Hex("test")).toBe(sha256Hex("test"));
    expect(sha256Hex("test")).not.toBe(sha256Hex("Test"));
  });

  it("recordIngestProvenance is best-effort and never throws", async () => {
    const db = {
      execute: async () => {
        throw new Error("boom");
      },
    };

    const res = await recordIngestProvenance(db as any, {
      pipelineType: "test",
      itemKey: "k1",
      contentHash: sha256Hex("payload"),
    });

    expect(res.ok).toBe(false);
  });
});

