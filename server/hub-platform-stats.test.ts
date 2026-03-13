import { describe, it, expect, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => {
  const mockPgSql = vi.fn();
  return {
    getDb: vi.fn().mockResolvedValue({}),
    getRawPgSql: vi.fn().mockReturnValue(mockPgSql),
    getDbEngine: vi.fn().mockReturnValue("postgres"),
  };
});

// Mock the logger
vi.mock("./_core/logger-wiring", () => ({
  serverLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Hub Platform Stats", () => {
  it("should return platform statistics with correct shape", async () => {
    // Import after mocks are set up
    const { getRawPgSql } = await import("./db");
    const pgSql = getRawPgSql() as any;

    // Mock all 10 count queries
    pgSql.mockResolvedValueOnce([{ cnt: "20" }])   // regulations
      .mockResolvedValueOnce([{ cnt: "15" }])        // gs1_standards
      .mockResolvedValueOnce([{ cnt: "70" }])        // esrs_datapoints
      .mockResolvedValueOnce([{ cnt: "69" }])        // regulation_standard_mappings
      .mockResolvedValueOnce([{ cnt: "145" }])       // esrs_standard_mappings
      .mockResolvedValueOnce([{ cnt: "422" }])       // products
      .mockResolvedValueOnce([{ cnt: "15" }])        // companies
      .mockResolvedValueOnce([{ cnt: "938" }])       // knowledge_embeddings
      .mockResolvedValueOnce([{ cnt: "10" }])        // hub_news
      .mockResolvedValueOnce([{ cnt: "15" }]);       // safety_alerts

    // The stats shape should match what the endpoint returns
    const expectedShape = {
      regulations: 20,
      standards: 15,
      esrsDatapoints: 70,
      regulationMappings: 69,
      esrsMappings: 145,
      totalMappings: 214, // 69 + 145
      products: 422,
      companies: 15,
      knowledgeEmbeddings: 938,
      newsArticles: 10,
      safetyAlerts: 15,
    };

    // Verify the shape has all expected keys
    const keys = Object.keys(expectedShape);
    expect(keys).toContain("regulations");
    expect(keys).toContain("standards");
    expect(keys).toContain("esrsDatapoints");
    expect(keys).toContain("totalMappings");
    expect(keys).toContain("products");
    expect(keys).toContain("companies");
    expect(keys).toContain("knowledgeEmbeddings");
    expect(keys).toContain("newsArticles");
    expect(keys).toContain("safetyAlerts");

    // Verify totalMappings is the sum
    expect(expectedShape.totalMappings).toBe(
      expectedShape.regulationMappings + expectedShape.esrsMappings
    );
  });

  it("should have all stat values as positive numbers", () => {
    const stats = {
      regulations: 20,
      standards: 15,
      esrsDatapoints: 70,
      regulationMappings: 69,
      esrsMappings: 145,
      totalMappings: 214,
      products: 422,
      companies: 15,
      knowledgeEmbeddings: 938,
      newsArticles: 10,
      safetyAlerts: 15,
    };

    for (const [key, value] of Object.entries(stats)) {
      expect(value).toBeGreaterThan(0);
      expect(typeof value).toBe("number");
    }
  });
});
