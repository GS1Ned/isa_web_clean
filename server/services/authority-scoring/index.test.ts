import { describe, expect, it } from "vitest";
import { detectQueryType } from "./index";

describe("detectQueryType", () => {
  it("detects compliance intent from obligation language", () => {
    expect(detectQueryType("What must we do for CSRD reporting?")).toBe("compliance");
    expect(detectQueryType("Which fields are required for EUDR?")).toBe("compliance");
    expect(detectQueryType("What shall be provided in the passport?")).toBe("compliance");
  });

  it("keeps implementation and definition routes intact", () => {
    expect(detectQueryType("How do we implement GS1 Digital Link?")).toBe("implementation");
    expect(detectQueryType("What is EPCIS 2.0?")).toBe("definition");
  });
});
