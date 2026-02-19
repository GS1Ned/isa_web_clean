import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewsTimeline } from "./NewsTimeline";

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

describe("NewsTimeline", () => {
  const now = new Date("2026-02-19T12:00:00.000Z");

  beforeEach(() => {
    mockUseQuery.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses createdAt/retrievedAt fallback dates and filters invalid-date items", async () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 1,
          title: "CreatedAt item",
          createdAt: now.toISOString(),
          regulationTags: ["CSRD"],
          sourceType: "EU_OFFICIAL",
        },
        {
          id: 2,
          title: "RetrievedAt item",
          retrievedAt: now.toISOString(),
          regulationTags: ["ESRS"],
          sourceType: "GS1_OFFICIAL",
        },
        {
          id: 3,
          title: "Invalid date item",
          publishedDate: "not-a-date",
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NewsTimeline />);

    // Let the search debounce effect settle to keep the test deterministic.
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryByText("CreatedAt item")).not.toBeNull();
    expect(screen.queryByText("RetrievedAt item")).not.toBeNull();
    expect(screen.queryByText("Invalid date item")).toBeNull();
  });
});
