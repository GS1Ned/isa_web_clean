import { describe, expect, it } from "vitest";

import {
  getAskIsaSourceDisplayLabel,
  getAskIsaSourceHref,
  getAskIsaSourceLocatorLabel,
  hasReviewerUsableAskIsaCitation,
} from "./ask-isa-citation";

describe("ask-isa-citation", () => {
  it("prefers authoritative citation labels and locators over raw titles", () => {
    const source = {
      title: "Corporate Sustainability Reporting Directive",
      citationLabel: "Corporate Sustainability Reporting Directive — Article 19a",
      sourceLocator: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
      sourceChunkLocator: "Article 19a",
    };

    expect(getAskIsaSourceDisplayLabel(source)).toBe(
      "Corporate Sustainability Reporting Directive — Article 19a",
    );
    expect(getAskIsaSourceHref(source)).toBe(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
    );
    expect(getAskIsaSourceLocatorLabel(source)).toBe("Article 19a");
    expect(hasReviewerUsableAskIsaCitation(source)).toBe(true);
  });

  it("falls back safely when only legacy source fields exist", () => {
    const source = {
      title: "Legacy GS1 source",
      url: "https://www.gs1.org/standards",
    };

    expect(getAskIsaSourceDisplayLabel(source)).toBe("Legacy GS1 source");
    expect(getAskIsaSourceHref(source)).toBe("https://www.gs1.org/standards");
    expect(getAskIsaSourceLocatorLabel(source)).toBeNull();
    expect(hasReviewerUsableAskIsaCitation(source)).toBe(true);
  });

  it("flags citations without a usable locator path", () => {
    const source = {
      title: "Unlocated citation",
      citationLabel: "Unlocated citation",
    };

    expect(getAskIsaSourceHref(source)).toBeUndefined();
    expect(getAskIsaSourceLocatorLabel(source)).toBeNull();
    expect(hasReviewerUsableAskIsaCitation(source)).toBe(false);
  });
});
