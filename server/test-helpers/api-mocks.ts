import { NEWS_SOURCES, type NewsSource } from "../news-sources";
import type { FetchResult, RawNewsItem } from "../news-fetcher";
import type { InvokeResult } from "../_core/llm";
import type { SPARQLResponse, SPARQLResult } from "../cellar-connector";
import type { EURLexArticle } from "../news/news-scraper-eurlex";

export type MockLLMResponse = InvokeResult;
export type MockNewsFetchResponse = FetchResult;
export type MockCellarResponse = SPARQLResponse;
export type MockEurLexResponse = EURLexArticle[];

const resolveNewsSource = (sourceId: string): NewsSource => {
  return (
    NEWS_SOURCES.find(source => source.id === sourceId) ??
    NEWS_SOURCES[0] ?? {
      id: sourceId,
      name: "Mock News Source",
      type: "MEDIA",
      rssUrl: "https://example.com/rss",
      apiUrl: "https://example.com/api",
      credibilityScore: 0.5,
      keywords: ["sustainability", "regulation"],
      enabled: true,
    }
  );
};

const createDefaultNewsItem = (
  sourceId: string,
  source: NewsSource
): RawNewsItem => ({
  title: "EU sustainability reporting update",
  link: `https://example.com/news/${sourceId}/update`,
  pubDate: new Date("2024-05-02T10:00:00Z").toISOString(),
  content: "The EU issued updated guidance on sustainability reporting.",
  contentSnippet: "Updated guidance on sustainability reporting.",
  creator: source.name,
  categories: ["CSRD", "ESRS"],
  guid: `mock-${sourceId}-guid-001`,
  source,
});

export const mockLLMResponse = (
  overrides: Partial<MockLLMResponse> = {}
): MockLLMResponse => {
  const base: MockLLMResponse = {
    id: "chatcmpl-mock-001",
    created: 1714560000,
    model: "gpt-4o-mini",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Here is a concise summary of the requested information.",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 128,
      completion_tokens: 42,
      total_tokens: 170,
    },
  };

  return {
    ...base,
    ...overrides,
    choices: overrides.choices ?? base.choices,
    usage: overrides.usage ?? base.usage,
  };
};

export const mockNewsFetchResponse = (
  sourceId: string,
  items: RawNewsItem[] = [],
  overrides: Partial<MockNewsFetchResponse> = {}
): MockNewsFetchResponse => {
  const source = resolveNewsSource(sourceId);
  const resolvedItems =
    items.length > 0 ? items : [createDefaultNewsItem(sourceId, source)];

  const base: MockNewsFetchResponse = {
    success: true,
    sourceId,
    sourceName: source.name,
    itemsFetched: resolvedItems.length,
    items: resolvedItems,
  };

  return {
    ...base,
    ...overrides,
    items: overrides.items ?? base.items,
    itemsFetched: overrides.itemsFetched ?? base.itemsFetched,
  };
};

export const mockCellarResponse = (
  documents: SPARQLResult[] = [],
  overrides: Partial<MockCellarResponse> = {}
): MockCellarResponse => {
  const defaultBinding: SPARQLResult = {
    act: {
      type: "uri",
      value: "http://publications.europa.eu/resource/celex/32024R1234",
    },
    actID: {
      type: "literal",
      value: "celex:32024R1234",
    },
    title: {
      type: "literal",
      value: "Regulation (EU) 2024/1234 on sustainability reporting",
      "xml:lang": "en",
    },
    dateEntryIntoForce: {
      type: "literal",
      value: "2024-07-01",
      datatype: "http://www.w3.org/2001/XMLSchema#date",
    },
    inForce: {
      type: "literal",
      value: "true",
      datatype: "http://www.w3.org/2001/XMLSchema#boolean",
    },
  };

  const resolvedDocuments = documents.length > 0 ? documents : [defaultBinding];

  const base: MockCellarResponse = {
    head: {
      vars: ["act", "actID", "title", "dateEntryIntoForce", "inForce"],
    },
    results: {
      bindings: resolvedDocuments,
    },
  };

  return {
    ...base,
    ...overrides,
    head: overrides.head ?? base.head,
    results: overrides.results ?? base.results,
  };
};

export const mockEurLexResponse = (
  items: EURLexArticle[] = [],
  overrides: Partial<EURLexArticle> = {}
): MockEurLexResponse => {
  const baseItem: EURLexArticle = {
    title: "Commission Regulation on sustainability disclosures",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0001",
    celexNumber: "32024R0001",
    publishedDate: new Date("2024-06-15"),
    category: "Regulations",
  };

  const resolvedItems = items.length > 0 ? items : [{ ...baseItem, ...overrides }];

  return resolvedItems.map(item => ({ ...baseItem, ...item }));
};
