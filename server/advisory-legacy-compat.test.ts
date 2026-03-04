import { describe, expect, it } from "vitest";

import {
  buildAdvisoryVersionInventory,
  normalizeAdvisoryVersionTag,
} from "./advisory-legacy-compat";

describe("advisory-legacy-compat", () => {
  it("normalizes report and legacy version tags to a shared display form", () => {
    expect(normalizeAdvisoryVersionTag("v1.0")).toBe("v1.0");
    expect(normalizeAdvisoryVersionTag("1.0.0")).toBe("v1.0");
    expect(normalizeAdvisoryVersionTag("1.1.0")).toBe("v1.1");
    expect(normalizeAdvisoryVersionTag("2.0.1")).toBe("v2.0.1");
  });

  it("deduplicates and sorts merged advisory version candidates", () => {
    expect(
      buildAdvisoryVersionInventory(["v1.1", "1.0.0", "1.1.0", "v1.0", "2.0.1"]),
    ).toEqual([
      { version: "v1.0", label: "ISA Advisory v1.0" },
      { version: "v1.1", label: "ISA Advisory v1.1" },
      { version: "v2.0.1", label: "ISA Advisory v2.0.1" },
    ]);
  });
});

