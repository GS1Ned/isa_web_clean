import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AskISAEnhanced from "./AskISAEnhanced";

const mockGetKnowledgeStats = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    askISAV2: {
      getKnowledgeStats: {
        useQuery: (...args: unknown[]) => mockGetKnowledgeStats(...args),
      },
    },
  },
}));

vi.mock("@/components/AskISAExpertMode", () => ({
  AskISAExpertMode: () => <div>expert-mode-surface</div>,
}));

vi.mock("@/components/EnhancedSearchPanel", () => ({
  EnhancedSearchPanel: () => <div>enhanced-search-surface</div>,
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("AskISAEnhanced", () => {
  beforeEach(() => {
    mockGetKnowledgeStats.mockReset();
    mockGetKnowledgeStats.mockReturnValue({
      data: {
        total: 1280,
        bySourceType: [
          { source_type: "esrs_datapoint", count: 914 },
          { source_type: "gs1_standard", count: 39 },
          { source_type: "regulation", count: 20 },
          { source_type: "news", count: 18 },
        ],
      },
      isLoading: false,
    });
  });

  it("defaults to the expert reasoning route and shows live knowledge stats", async () => {
    const user = userEvent.setup();
    render(<AskISAEnhanced />);

    expect(screen.getByRole("heading", { name: /^Ask ISA$/i })).not.toBeNull();
    expect(screen.getByText(/Expert Mode/i)).not.toBeNull();
    expect(
      screen.getByRole("tab", { name: /Expert Reasoning/i })
    ).not.toBeNull();
    expect(
      screen.getByRole("tab", { name: /Advanced Search/i })
    ).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Classic Chat/i })).not.toBeNull();
    expect(screen.getByText(/expert-mode-surface/i)).not.toBeNull();

    await user.click(screen.getByRole("tab", { name: /Advanced Search/i }));

    expect(screen.getByText(/1280/i)).not.toBeNull();
    expect(screen.getByText(/Indexed knowledge items/i)).not.toBeNull();
    expect(screen.getByText(/Esrs Datapoint/i)).not.toBeNull();
    expect(screen.getByText(/914/i)).not.toBeNull();
  });
});
