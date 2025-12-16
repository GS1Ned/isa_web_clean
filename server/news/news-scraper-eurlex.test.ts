/**
 * EUR-Lex Scraper Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  filterESGRelevant,
  convertToRawNewsItems,
  type EURLexArticle,
} from "./news-scraper-eurlex";

describe("EUR-Lex Scraper", () => {
  describe("filterESGRelevant", () => {
    it("should filter articles with ESG keywords in title", () => {
      const articles: EURLexArticle[] = [
        {
          title: "Commission Regulation on sustainability reporting standards",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0001",
          celexNumber: "32024R0001",
          publishedDate: new Date(),
          category: "Regulations",
        },
        {
          title: "Council Decision on trade agreements",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024D0002",
          celexNumber: "32024D0002",
          publishedDate: new Date(),
          category: "Decisions",
        },
        {
          title: "Directive on deforestation-free products",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0003",
          celexNumber: "32024L0003",
          publishedDate: new Date(),
          category: "Directives",
        },
      ];

      const filtered = filterESGRelevant(articles);
      
      expect(filtered.length).toBe(2);
      expect(filtered.map(a => a.celexNumber)).toContain("32024R0001");
      expect(filtered.map(a => a.celexNumber)).toContain("32024L0003");
    });

    it("should filter articles with ESG keywords in category", () => {
      const articles: EURLexArticle[] = [
        {
          title: "Commission Implementing Regulation",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0004",
          celexNumber: "32024R0004",
          publishedDate: new Date(),
          category: "Environmental protection",
        },
      ];

      const filtered = filterESGRelevant(articles);
      expect(filtered.length).toBe(1);
    });

    it("should return empty array when no ESG articles found", () => {
      const articles: EURLexArticle[] = [
        {
          title: "Council Decision on administrative matters",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024D0005",
          celexNumber: "32024D0005",
          publishedDate: new Date(),
          category: "Administrative",
        },
      ];

      const filtered = filterESGRelevant(articles);
      expect(filtered.length).toBe(0);
    });
  });

  describe("convertToRawNewsItems", () => {
    it("should convert EUR-Lex articles to RawNewsItem format", () => {
      const articles: EURLexArticle[] = [
        {
          title: "Commission Regulation on CSRD implementation",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0001",
          celexNumber: "32024R0001",
          publishedDate: new Date("2024-12-15"),
          category: "Implementing Regulations",
        },
      ];

      const items = convertToRawNewsItems(articles);
      
      expect(items.length).toBe(1);
      expect(items[0].title).toBe("Commission Regulation on CSRD implementation");
      expect(items[0].link).toBe("https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0001");
      expect(items[0].source.type).toBe("EU_OFFICIAL");
      expect(items[0].categories).toContain("CSRD");
    });

    it("should detect multiple regulation tags", () => {
      const articles: EURLexArticle[] = [
        {
          title: "Regulation on sustainability reporting and due diligence requirements",
          url: "https://eur-lex.europa.eu/test",
          celexNumber: "32024R0002",
          publishedDate: new Date(),
          category: "Regulations",
        },
      ];

      const items = convertToRawNewsItems(articles);
      
      expect(items[0].categories).toContain("CSDDD");
    });
  });
});
