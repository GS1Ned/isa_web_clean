import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { StandardsDirectory } from "./StandardsDirectory";

const mockList = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    standardsDirectory: {
      list: {
        useQuery: (...args: unknown[]) => mockList(...args),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/standards-directory", mockNavigate],
}));

const mockStandards = [
  {
    id: "gs1_web_vocabulary",
    name: "GS1 Web Vocabulary",
    owningOrganization: "GS1_Global",
    jurisdiction: "Global",
    sector: null,
    lifecycleStatus: "current",
    sourceType: "gs1_web_vocabulary",
    recordCount: 125,
    lastVerifiedDate: "2025-12-13",
    needsVerification: false,
    verificationReason: "ok" as const,
    verificationAgeDays: 7,
    verificationFreshnessBucket: "fresh" as const,
  },
  {
    id: "gs1_standard_1",
    name: "GS1 Core Business Vocabulary",
    owningOrganization: "GS1_Global",
    jurisdiction: "Global",
    sector: null,
    lifecycleStatus: "ratified",
    sourceType: "gs1_standard",
    lastVerifiedDate: null,
    needsVerification: true,
    verificationReason: "missing_last_verified_date" as const,
    verificationAgeDays: null,
    verificationFreshnessBucket: "unknown" as const,
  },
];

describe("StandardsDirectory", () => {
  beforeEach(() => {
    mockList.mockReset();
    mockNavigate.mockReset();

    mockList.mockReturnValue({
      data: {
        standards: mockStandards,
        total: mockStandards.length,
      },
      isLoading: false,
    });
  });

  it("renders compact verification posture on standards cards", () => {
    render(<StandardsDirectory />);

    expect(screen.getByText("GS1 Web Vocabulary")).not.toBeNull();
    expect(screen.getByText("GS1 Core Business Vocabulary")).not.toBeNull();

    expect(screen.getByText("Fresh")).not.toBeNull();
    expect(screen.getByText("verified 7 days ago")).not.toBeNull();

    expect(screen.getByText("Unknown")).not.toBeNull();
    expect(screen.getByText("Verification missing")).not.toBeNull();
  });

  it("navigates from a standards card to the detail view", async () => {
    const user = userEvent.setup();

    render(<StandardsDirectory />);

    await user.click(screen.getAllByText("GS1 Web Vocabulary")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/standards-directory/gs1_web_vocabulary");
  });
});
