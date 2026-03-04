import { describe, expect, it } from "vitest";

import {
  hasLegacyDiffComputationScript,
  listCompatibilityAdvisoryVersions,
  loadOrComputeLegacyAdvisoryDiff,
} from "./advisory-diff-compat";

describe("advisory-diff-compat", () => {
  it("loads legacy diff payloads through the shared compatibility helper", () => {
    const diff = loadOrComputeLegacyAdvisoryDiff("v1.0", "v1.1");

    expect(diff.metadata).toBeDefined();
    expect(diff.coverageDeltas).toBeDefined();
  });

  it("exposes a merged advisory version inventory", async () => {
    const versions = await listCompatibilityAdvisoryVersions();

    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThan(0);
  });

  it("keeps the legacy diff computation script discoverable for compatibility runs", () => {
    expect(hasLegacyDiffComputationScript()).toBe(true);
  });
});
