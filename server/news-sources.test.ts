import { describe, it, expect } from "vitest";
import { NEWS_SOURCES, REGULATION_KEYWORDS } from "./news-sources";

describe("News Sources Configuration", () => {
  it("should have all 4 new sources configured", () => {
    const newSourceIds = [
      "ec-circular-economy",
      "rijksoverheid-ienw",
      "rijksoverheid-green-deals",
      "afm-csrd",
    ];

    const configuredSources = NEWS_SOURCES.filter((s) =>
      newSourceIds.includes(s.id)
    );

    expect(configuredSources).toHaveLength(4);
  });

  it("should have EC Circular Economy source with correct configuration", () => {
    const source = NEWS_SOURCES.find((s) => s.id === "ec-circular-economy");

    expect(source).toBeDefined();
    expect(source?.name).toBe("European Commission - Circular Economy");
    expect(source?.type).toBe("EU_OFFICIAL");
    expect(source?.credibilityScore).toBe(1.0);
    expect(source?.rssUrl).toContain("environment.ec.europa.eu");
    expect(source?.enabled).toBe(true);
    expect(source?.keywords).toContain("circular economy");
    expect(source?.keywords).toContain("ESPR");
    expect(source?.keywords).toContain("DPP");
  });

  it("should have Rijksoverheid IenW source with correct configuration", () => {
    const source = NEWS_SOURCES.find((s) => s.id === "rijksoverheid-ienw");

    expect(source).toBeDefined();
    expect(source?.name).toBe("Rijksoverheid - Infrastructuur en Waterstaat");
    expect(source?.type).toBe("DUTCH_NATIONAL");
    expect(source?.credibilityScore).toBe(1.0);
    expect(source?.rssUrl).toContain("feeds.rijksoverheid.nl");
    expect(source?.enabled).toBe(true);
    expect(source?.keywords).toContain("circulaire economie");
    expect(source?.keywords).toContain("kunststof");
    expect(source?.keywords).toContain("verpakkingen");
  });

  it("should have Rijksoverheid Green Deals source with correct configuration", () => {
    const source = NEWS_SOURCES.find(
      (s) => s.id === "rijksoverheid-green-deals"
    );

    expect(source).toBeDefined();
    expect(source?.name).toBe("Rijksoverheid - Green Deals");
    expect(source?.type).toBe("DUTCH_NATIONAL");
    expect(source?.credibilityScore).toBe(0.95);
    expect(source?.rssUrl).toContain("duurzame-economie");
    expect(source?.enabled).toBe(true);
    expect(source?.keywords).toContain("Green Deal");
    expect(source?.keywords).toContain("circulaire economie");
  });

  it("should have AFM CSRD source with correct configuration", () => {
    const source = NEWS_SOURCES.find((s) => s.id === "afm-csrd");

    expect(source).toBeDefined();
    expect(source?.name).toBe("AFM - CSRD Implementation");
    expect(source?.type).toBe("DUTCH_NATIONAL");
    expect(source?.credibilityScore).toBe(1.0);
    expect(source?.rssUrl).toContain("afm.nl");
    expect(source?.enabled).toBe(true);
    expect(source?.keywords).toContain("CSRD");
    expect(source?.keywords).toContain("ESRS");
  });

  it("should have expanded keywords for existing sources", () => {
    const euCommission = NEWS_SOURCES.find(
      (s) => s.id === "eu-commission-environment"
    );

    expect(euCommission?.keywords).toContain("CSDDD");
    expect(euCommission?.keywords).toContain("CS3D");
    expect(euCommission?.keywords).toContain("Green Claims");
    expect(euCommission?.keywords).toContain("greenwashing");
    expect(euCommission?.keywords).toContain("substantiation");
  });

  it("should have new regulation keywords defined", () => {
    expect(REGULATION_KEYWORDS.CSDDD).toBeDefined();
    expect(REGULATION_KEYWORDS.CSDDD).toContain("CSDDD");
    expect(REGULATION_KEYWORDS.CSDDD).toContain("CS3D");
    expect(REGULATION_KEYWORDS.CSDDD).toContain(
      "Corporate Sustainability Due Diligence Directive"
    );

    expect(REGULATION_KEYWORDS.GREEN_CLAIMS).toBeDefined();
    expect(REGULATION_KEYWORDS.GREEN_CLAIMS).toContain("Green Claims Directive");
    expect(REGULATION_KEYWORDS.GREEN_CLAIMS).toContain("greenwashing");

    expect(REGULATION_KEYWORDS.CIRCULAR_ECONOMY).toBeDefined();
    expect(REGULATION_KEYWORDS.CIRCULAR_ECONOMY).toContain(
      "Circular Economy Action Plan"
    );
  });

  it("should have at least 11 enabled sources", () => {
    const enabledSources = NEWS_SOURCES.filter((s) => s.enabled);
    expect(enabledSources.length).toBeGreaterThanOrEqual(11);
  });

  it("should have correct source type distribution", () => {
    const euOfficial = NEWS_SOURCES.filter(
      (s) => s.type === "EU_OFFICIAL" && s.enabled
    );
    const dutchNational = NEWS_SOURCES.filter(
      (s) => s.type === "DUTCH_NATIONAL" && s.enabled
    );
    const gs1Official = NEWS_SOURCES.filter(
      (s) => s.type === "GS1_OFFICIAL" && s.enabled
    );

    expect(euOfficial.length).toBeGreaterThanOrEqual(4); // Including new EC Circular Economy
    expect(dutchNational.length).toBeGreaterThanOrEqual(5); // Including 3 new Dutch sources
    expect(gs1Official.length).toBeGreaterThanOrEqual(2);
  });

  it("all enabled sources should have RSS URLs or be scraper-based", () => {
    const enabledSources = NEWS_SOURCES.filter((s) => s.enabled);

    enabledSources.forEach((source) => {
      const hasRss = !!source.rssUrl;
      const isScraperBased = source.id === "eurlex-oj" || 
                             source.id === "greendeal-healthcare" || 
                             source.id === "zes-logistics";
      
      expect(hasRss || isScraperBased).toBe(true);
    });
  });

  it("all sources should have credibility scores between 0.9 and 1.0", () => {
    NEWS_SOURCES.forEach((source) => {
      expect(source.credibilityScore).toBeGreaterThanOrEqual(0.9);
      expect(source.credibilityScore).toBeLessThanOrEqual(1.0);
    });
  });

  it("all sources should have at least 5 keywords", () => {
    NEWS_SOURCES.forEach((source) => {
      expect(source.keywords.length).toBeGreaterThanOrEqual(5);
    });
  });
});
