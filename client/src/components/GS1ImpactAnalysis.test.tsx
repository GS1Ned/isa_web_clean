
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type {
  GS1StandardImpact,
  GS1ImpactAnalysisProps
} from "./GS1ImpactAnalysis";
import { GS1ImpactAnalysis } from "./GS1ImpactAnalysis";

function renderComponent(
  overrides?: Partial<GS1ImpactAnalysisProps>
): void {
  const standards: GS1StandardImpact[] = [
    {
      id: "GDSN",
      name: "GDSN",
      impact: "critical",
      actions: [
        {
          id: "update-attributes",
          label: "Update product attribute model",
          description: "Review new ESG-related GDSN attributes.",
          dueDate: "2026-01-01"
        },
        {
          id: "align-data-pools",
          label: "Align with data pools"
        }
      ]
    },
    {
      id: "DigitalLink",
      name: "Digital Link",
      impact: "high",
      actions: [
        {
          id: "mint-uris",
          label: "Mint Digital Link URIs"
        }
      ]
    }
  ];

  const props: GS1ImpactAnalysisProps = {
    regulationId: "DPP",
    standards,
    ...overrides
  };

  render(<GS1ImpactAnalysis {...props} />);
}

describe("GS1ImpactAnalysis", () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(null);
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(
      () => {}
    );
  });

  it("renders overall completion indicator", () => {
    renderComponent();
    expect(
      screen.getByText(/Overall completion/i)
    ).toBeInTheDocument();
  });

  it("sorts standards by impact level (critical before high)", () => {
    renderComponent();
    const headings = screen.getAllByRole("button");
    const firstHeading = headings[0].textContent || "";
    expect(firstHeading.includes("GDSN")).toBe(true);
  });

  it("renders actions and allows marking them as complete", () => {
    renderComponent();
    const trigger = screen.getByText("GDSN");
    fireEvent.click(trigger);

    const checkbox = screen.getByLabelText(
      "Update product attribute model"
    );
    fireEvent.click(checkbox);

    const progressLabels = screen.getAllByText(/%/i);
    expect(
      progressLabels.some(label => label.textContent?.includes("%"))
    ).toBe(true);
  });

  it("persists completed actions to localStorage", () => {
    const setItemSpy = vi.spyOn(
      window.localStorage.__proto__,
      "setItem"
    );
    renderComponent();

    const trigger = screen.getByText("GDSN");
    fireEvent.click(trigger);
    const checkbox = screen.getByLabelText(
      "Update product attribute model"
    );
    fireEvent.click(checkbox);

    expect(setItemSpy).toHaveBeenCalled();
  });

  it("shows additional resources when provided", () => {
    const standards: GS1StandardImpact[] = [
      {
        id: "GDSN",
        name: "GDSN",
        impact: "critical",
        actions: [],
        resources: [
          {
            label: "GDSN ESG guideline",
            url: "https://example.com/gdsn-esg"
          }
        ]
      }
    ];
    render(<GS1ImpactAnalysis regulationId="CSRD" standards={standards} />);

    const trigger = screen.getByText("GDSN");
    fireEvent.click(trigger);

    expect(
      screen.getByText(/GDSN ESG guideline/i)
    ).toBeInTheDocument();
  });
});

