import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StandardDetail } from "./StandardDetail";

const mockGetDetail = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    standardsDirectory: {
      getDetail: {
        useQuery: (...args: unknown[]) => mockGetDetail(...args),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  useRoute: () => [true, { id: "gs1_web_vocabulary" }],
  useLocation: () => ["/standards-directory/gs1_web_vocabulary", mockNavigate],
}));

const mockStandardDetail = {
  id: "gs1_web_vocabulary",
  name: "GS1 Web Vocabulary",
  owningOrganization: "GS1_Global",
  jurisdiction: "Global",
  sector: null,
  lifecycleStatus: "current",
  description: "GS1 semantic web vocabulary for interoperable product and business data.",
  authoritativeSourceUrl: "https://www.gs1.org/voc/",
  datasetIdentifier: "gs1.webvoc.v1.17.0",
  lastVerifiedDate: "2025-12-13",
  needsVerification: false,
  verificationReason: "ok" as const,
  verificationAgeDays: 7,
  verificationFreshnessBucket: "fresh" as const,
  recordCount: 125,
  category: "Semantic Vocabulary",
  scope: "Global GS1 semantic terms for product and business metadata.",
};

describe("StandardDetail", () => {
  beforeEach(() => {
    mockGetDetail.mockReset();
    mockNavigate.mockReset();

    mockGetDetail.mockReturnValue({
      data: mockStandardDetail,
      isLoading: false,
    });
  });

  it("renders a stable loading state while detail data is pending", () => {
    mockGetDetail.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    });

    render(<StandardDetail />);

    expect(screen.getAllByRole("button", { name: /Back to Directory/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Standard not found\./i)).toBeNull();
    expect(screen.queryByText(/Transparency Metadata/i)).toBeNull();
  });

  it("renders a not-found state when the requested standard is unavailable", () => {
    mockGetDetail.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
    });

    render(<StandardDetail />);

    expect(screen.getAllByRole("button", { name: /Back to Directory/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Standard not found\./i)).not.toBeNull();
    expect(screen.queryByText(/Transparency Metadata/i)).toBeNull();
  });

  it("renders the transparency metadata surface with verification posture", () => {
    render(<StandardDetail />);

    expect(screen.getAllByText("GS1 Web Vocabulary").length).toBeGreaterThan(0);
    expect(screen.getByText(/Transparency Metadata/i)).not.toBeNull();
    expect(screen.getByText(/Authoritative Source URL/i)).not.toBeNull();
    expect(screen.getByText("https://www.gs1.org/voc/")).not.toBeNull();
    expect(screen.getByText(/Dataset\/Version Identifier/i)).not.toBeNull();
    expect(screen.getByText("gs1.webvoc.v1.17.0")).not.toBeNull();
    expect(screen.getByText(/Last Verified Date/i)).not.toBeNull();
    expect(screen.getByText(/December 13, 2025/i)).not.toBeNull();
    expect(screen.getByText(/Verification Posture/i)).not.toBeNull();
    expect(screen.getByText("Fresh")).not.toBeNull();
    expect(screen.getByText(/Last verification was 7 days ago\./i)).not.toBeNull();
    expect(screen.getByText(/Record Count/i)).not.toBeNull();
    expect(screen.getByText(/125 records in dataset/i)).not.toBeNull();
  });
});
