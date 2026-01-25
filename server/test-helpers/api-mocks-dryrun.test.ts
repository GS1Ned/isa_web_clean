/**
 * Dry-run tests for API mock implementations
 * Validates that mocks can be used in realistic test scenarios
 */
import { describe, expect, it, vi } from "vitest";
import {
  mockCellarResponse,
  mockEurLexResponse,
  mockLLMResponse,
  mockNewsFetchResponse,
} from "./api-mocks";

describe("api-mocks dry-run scenarios", () => {
  describe("LLM mock integration", () => {
    it("can simulate a successful AI classification response", () => {
      const response = mockLLMResponse({
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: JSON.stringify({
                classification: "CSRD",
                confidence: 0.95,
                reasoning: "Article mentions corporate sustainability reporting",
              }),
            },
            finish_reason: "stop",
          },
        ],
      });

      expect(response.choices[0].message.content).toContain("CSRD");
      const parsed = JSON.parse(response.choices[0].message.content as string);
      expect(parsed.confidence).toBe(0.95);
    });

    it("can simulate tool call responses", () => {
      const response = mockLLMResponse({
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                {
                  id: "call_123",
                  type: "function",
                  function: {
                    name: "classify_regulation",
                    arguments: '{"regulation":"CSRD","sector":"manufacturing"}',
                  },
                },
              ],
            },
            finish_reason: "tool_calls",
          },
        ],
      });

      expect(response.choices[0].message.tool_calls).toHaveLength(1);
      expect(response.choices[0].message.tool_calls![0].function.name).toBe(
        "classify_regulation"
      );
    });
  });

  describe("News fetch mock integration", () => {
    it("can simulate fetching from multiple sources", () => {
      const sources = ["eurlex-oj", "efrag-sustainability", "gs1-nl-news"];
      const results = sources.map((sourceId) => mockNewsFetchResponse(sourceId));

      expect(results).toHaveLength(3);
      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.sourceId).toBe(sources[i]);
        expect(result.items.length).toBeGreaterThan(0);
      });
    });

    it("can simulate a failed fetch", () => {
      const failedResponse = mockNewsFetchResponse("unknown-source", [], {
        success: false,
        error: "Network timeout",
        itemsFetched: 0,
      });

      expect(failedResponse.success).toBe(false);
      expect(failedResponse.error).toBe("Network timeout");
    });

    it("provides items with all required fields for news pipeline", () => {
      const response = mockNewsFetchResponse("eurlex-oj");
      const item = response.items[0];

      // Verify all fields required by news pipeline
      expect(item.title).toBeDefined();
      expect(item.link).toBeDefined();
      expect(item.pubDate).toBeDefined();
      expect(item.source).toBeDefined();
      expect(item.source.id).toBeDefined();
      expect(item.source.credibilityScore).toBeDefined();
    });
  });

  describe("CELLAR mock integration", () => {
    it("can simulate SPARQL query results", () => {
      const response = mockCellarResponse();

      // Verify structure matches what CellarConnector.parseActsFromSPARQL expects
      expect(response.head.vars).toContain("act");
      expect(response.results.bindings.length).toBeGreaterThan(0);

      const binding = response.results.bindings[0];
      expect(binding.act?.type).toBe("uri");
      expect(binding.actID?.value).toContain("celex");
    });

    it("can simulate multiple regulation results", () => {
      const customBindings = [
        {
          act: { type: "uri" as const, value: "http://example.com/act1" },
          actID: { type: "literal" as const, value: "celex:32024R0001" },
          title: { type: "literal" as const, value: "CSRD Regulation" },
          inForce: {
            type: "literal" as const,
            value: "true",
            datatype: "http://www.w3.org/2001/XMLSchema#boolean",
          },
        },
        {
          act: { type: "uri" as const, value: "http://example.com/act2" },
          actID: { type: "literal" as const, value: "celex:32024R0002" },
          title: { type: "literal" as const, value: "EUDR Regulation" },
          inForce: {
            type: "literal" as const,
            value: "true",
            datatype: "http://www.w3.org/2001/XMLSchema#boolean",
          },
        },
      ];

      const response = mockCellarResponse(customBindings);
      expect(response.results.bindings).toHaveLength(2);
    });
  });

  describe("EUR-Lex mock integration", () => {
    it("can simulate scraped legislation items", () => {
      const articles = mockEurLexResponse();

      expect(articles.length).toBeGreaterThan(0);
      const article = articles[0];
      expect(article.title).toBeDefined();
      expect(article.url).toContain("eur-lex.europa.eu");
      expect(article.celexNumber).toBeDefined();
      expect(article.publishedDate).toBeInstanceOf(Date);
    });

    it("can simulate multiple articles with custom data", () => {
      const customArticles = [
        {
          title: "CSRD Implementation Act",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0100",
          celexNumber: "32024R0100",
          publishedDate: new Date("2024-07-01"),
          category: "Regulations",
        },
        {
          title: "EUDR Amendment",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0200",
          celexNumber: "32024R0200",
          publishedDate: new Date("2024-08-15"),
          category: "Regulations",
        },
      ];

      const articles = mockEurLexResponse(customArticles);
      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("CSRD Implementation Act");
      expect(articles[1].celexNumber).toBe("32024R0200");
    });
  });

  describe("Mock compatibility with vi.fn()", () => {
    it("mocks can be used with vi.fn() for spying", () => {
      const mockFetch = vi.fn().mockResolvedValue(mockNewsFetchResponse("eurlex-oj"));

      // Simulate using the mock in a test
      return mockFetch("eurlex-oj").then((result) => {
        expect(mockFetch).toHaveBeenCalledWith("eurlex-oj");
        expect(result.success).toBe(true);
      });
    });

    it("LLM mock can be used with vi.fn() for AI processor tests", () => {
      const mockLLM = vi.fn().mockResolvedValue(
        mockLLMResponse({
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: "Classified as CSRD-related",
              },
              finish_reason: "stop",
            },
          ],
        })
      );

      return mockLLM({ messages: [] }).then((result) => {
        expect(result.choices[0].message.content).toContain("CSRD");
      });
    });
  });
});
