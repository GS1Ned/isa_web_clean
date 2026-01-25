import { describe, expect, it } from "vitest";
import type { InvokeResult } from "../_core/llm";
import type { FetchResult, RawNewsItem } from "../news-fetcher";
import type { SPARQLResponse } from "../cellar-connector";
import type { EURLexArticle } from "../news/news-scraper-eurlex";
import {
  mockCellarResponse,
  mockEurLexResponse,
  mockLLMResponse,
  mockNewsFetchResponse,
} from "./api-mocks";

describe("api-mocks", () => {
  it("returns LLM mock responses that satisfy InvokeResult", () => {
    const response: InvokeResult = mockLLMResponse();

    expect(response.id).toContain("chatcmpl");
    expect(response.choices[0].message.role).toBe("assistant");
  });

  it("returns news fetch mocks that satisfy FetchResult", () => {
    const response: FetchResult = mockNewsFetchResponse("eurlex-oj");

    expect(response.success).toBe(true);
    expect(response.itemsFetched).toBe(response.items.length);
  });

  it("returns CELLAR mocks that satisfy SPARQLResponse", () => {
    const response: SPARQLResponse = mockCellarResponse();

    expect(response.head.vars.length).toBeGreaterThan(0);
    expect(response.results.bindings.length).toBeGreaterThan(0);
  });

  it("returns EUR-Lex mocks that satisfy EURLexArticle[]", () => {
    const response: EURLexArticle[] = mockEurLexResponse();

    expect(response[0].celexNumber).toMatch(/\d{4}R\d+/);
  });

  it("applies overrides correctly", () => {
    const llmOverride = mockLLMResponse({
      model: "gpt-4o",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    });

    expect(llmOverride.model).toBe("gpt-4o");
    expect(llmOverride.usage?.total_tokens).toBe(15);

    const customNewsItem: RawNewsItem = {
      title: "Custom update",
      link: "https://example.com/custom",
      pubDate: new Date("2024-08-01T12:00:00Z").toISOString(),
      content: "Custom content",
      contentSnippet: "Custom content",
      creator: "Custom Source",
      categories: ["CSRD"],
      guid: "custom-guid",
      source: {
        id: "custom-source",
        name: "Custom Source",
        type: "MEDIA",
        rssUrl: "https://example.com/rss",
        credibilityScore: 0.8,
        keywords: ["csrd"],
        enabled: true,
      },
    };

    const newsOverride = mockNewsFetchResponse(
      "custom-source",
      [customNewsItem],
      { success: false }
    );

    expect(newsOverride.success).toBe(false);
    expect(newsOverride.items[0].title).toBe("Custom update");

    const cellarOverride = mockCellarResponse([], {
      head: { vars: ["act", "title"] },
    });

    expect(cellarOverride.head.vars).toEqual(["act", "title"]);

    const eurLexOverride = mockEurLexResponse([], {
      category: "Decisions",
    });

    expect(eurLexOverride[0].category).toBe("Decisions");
  });

  it("provides sensible default values", () => {
    const newsResponse = mockNewsFetchResponse("eurlex-oj");
    const cellarResponse = mockCellarResponse();
    const eurLexResponse = mockEurLexResponse();

    expect(newsResponse.items[0].title.length).toBeGreaterThan(5);
    expect(cellarResponse.results.bindings[0].actID?.value).toContain("celex");
    expect(eurLexResponse[0].title.length).toBeGreaterThan(10);
  });
});
