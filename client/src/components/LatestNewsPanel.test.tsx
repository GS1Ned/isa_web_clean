import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LatestNewsPanel } from "./LatestNewsPanel";

const mockUseQuery = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    hub: {
      getRecentNews: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}));

vi.mock("./NewsCardCompact", () => ({
  NewsCardCompact: ({ news }: { news: unknown }) => (
    <div data-testid="news-card" data-news={JSON.stringify(news)} />
  ),
}));

describe("LatestNewsPanel", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("maps news items with fallbacks and limits rendering to top five", () => {
    const createdAt = "2026-02-19T10:00:00.000Z";

    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 1,
          title: "First",
          summary: "",
          createdAt,
          regulationTags: "NOT_ARRAY",
          impactLevel: undefined,
          newsType: "GUIDANCE",
        },
        { id: 2, title: "Second", summary: "Two", createdAt, regulationTags: ["CSRD"], impactLevel: "HIGH", newsType: "NEW_LAW" },
        { id: 3, title: "Third", summary: "Three", createdAt, regulationTags: ["ESRS"], impactLevel: "LOW", newsType: "AMENDMENT" },
        { id: 4, title: "Fourth", summary: "Four", createdAt, regulationTags: ["EUDR"], impactLevel: "MEDIUM", newsType: "PROPOSAL" },
        { id: 5, title: "Fifth", summary: "Five", createdAt, regulationTags: ["PPWR"], impactLevel: "MEDIUM", newsType: "GUIDANCE" },
        { id: 6, title: "Sixth", summary: "Six", createdAt, regulationTags: ["ESPR"], impactLevel: "LOW", newsType: "ENFORCEMENT" },
      ],
      isLoading: false,
    });

    render(<LatestNewsPanel />);

    const cards = screen.getAllByTestId("news-card");
    expect(cards).toHaveLength(5);

    const firstCardRaw = cards[0]?.getAttribute("data-news");
    expect(firstCardRaw).not.toBeNull();

    const firstCard = JSON.parse(firstCardRaw ?? "{}") as {
      summary: string;
      regulationTags: string[];
      impactLevel: string;
      publishedDate: string;
    };

    expect(firstCard.summary).toBe("");
    expect(firstCard.regulationTags).toEqual([]);
    expect(firstCard.impactLevel).toBe("MEDIUM");
    expect(firstCard.publishedDate).toBe(new Date(createdAt).toISOString());
  });

  it("shows the empty-state message when there are no items", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<LatestNewsPanel />);

    expect(screen.queryByText(/no news articles available yet/i)).not.toBeNull();
  });
});
