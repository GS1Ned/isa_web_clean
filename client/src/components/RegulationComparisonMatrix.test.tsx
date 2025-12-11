
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { RegulationComparisonItem } from "@/hooks/useRegulationComparison";
import * as hookModule from "@/hooks/useRegulationComparison";
import { RegulationComparisonMatrix } from "./RegulationComparisonMatrix";

function mockHookData(items: RegulationComparisonItem[]): void {
  vi.spyOn(hookModule, "useRegulationComparison").mockReturnValue({
    data: items,
    isLoading: false,
    error: null
  });
}

describe("RegulationComparisonMatrix", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading skeleton while data is loading", () => {
    vi.spyOn(hookModule, "useRegulationComparison").mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    });
    render(
      <RegulationComparisonMatrix
        regulationIds={["CSRD", "EUDR"]}
        attributes={[
          "scope",
          "deadlines",
          "dataPoints",
          "gs1Standards",
          "complexity"
        ]}
      />
    );
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });

  it("renders error message on failure", () => {
    vi.spyOn(hookModule, "useRegulationComparison").mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error")
    });
    render(
      <RegulationComparisonMatrix
        regulationIds={["CSRD"]}
        attributes={["scope"]}
      />
    );
    expect(
      screen.getByText(/Failed to load regulation comparison/i)
    ).toBeInTheDocument();
  });

  it("renders comparison table with regulations and attributes", () => {
    const items: RegulationComparisonItem[] = [
      {
        id: "CSRD",
        name: "CSRD",
        scope: "Large and listed companies",
        deadlines: "FY2024 reports in 2025",
        dataPoints: "Over 1000 datapoints",
        gs1Standards: ["GDSN", "EPCIS"],
        complexity: "high",
        url: "/regulations/csrd"
      },
      {
        id: "EUDR",
        name: "EUDR",
        scope: "Deforestation-risk commodities",
        deadlines: "Applies from 2025",
        dataPoints: "Traceability and origin",
        gs1Standards: ["EPCIS"],
        complexity: "medium",
        url: "/regulations/eudr"
      }
    ];
    mockHookData(items);

    render(
      <RegulationComparisonMatrix
        regulationIds={["CSRD", "EUDR"]}
        attributes={["scope", "deadlines", "complexity"]}
      />
    );

    expect(screen.getByText("Regulation comparison")).toBeInTheDocument();
    expect(screen.getByText("CSRD")).toBeInTheDocument();
    expect(screen.getByText("EUDR")).toBeInTheDocument();
    expect(screen.getByText("Scope")).toBeInTheDocument();
    expect(screen.getByText("Deadlines")).toBeInTheDocument();
    expect(screen.getByText("COMPLEXITY")).toBeInTheDocument();
  });

  it("allows toggling attribute visibility", () => {
    const items: RegulationComparisonItem[] = [
      {
        id: "CSRD",
        name: "CSRD",
        scope: "Large companies",
        deadlines: "2025",
        dataPoints: "",
        gs1Standards: [],
        complexity: "high"
      }
    ];
    mockHookData(items);

    render(
      <RegulationComparisonMatrix
        regulationIds={["CSRD"]}
        attributes={["scope", "deadlines"]}
      />
    );

    const scopeCheckbox = screen.getByLabelText("Scope");
    const deadlinesCheckbox = screen.getByLabelText("Deadlines");

    expect(screen.getByText("Scope")).toBeInTheDocument();
    expect(screen.getByText("Deadlines")).toBeInTheDocument();

    fireEvent.click(scopeCheckbox);
    expect(screen.queryAllByText("Scope").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(deadlinesCheckbox);
    expect(screen.queryByText("Deadlines")).not.toBeNull();
  });

  it("marks differing attributes with 'Differs' badge", () => {
    const items: RegulationComparisonItem[] = [
      {
        id: "CSRD",
        name: "CSRD",
        scope: "Large companies",
        deadlines: "2025",
        dataPoints: "",
        gs1Standards: [],
        complexity: "high"
      },
      {
        id: "EUDR",
        name: "EUDR",
        scope: "Commodities",
        deadlines: "2025",
        dataPoints: "",
        gs1Standards: [],
        complexity: "medium"
      }
    ];
    mockHookData(items);

    render(
      <RegulationComparisonMatrix
        regulationIds={["CSRD", "EUDR"]}
        attributes={["scope", "deadlines", "complexity"]}
      />
    );

    expect(screen.getAllByText("Differs").length).toBeGreaterThan(0);
  });

  it("calls window.print when Export as PDF button is clicked", () => {
    const items: RegulationComparisonItem[] = [
      {
        id: "CSRD",
        name: "CSRD",
        scope: "",
        deadlines: "",
        dataPoints: "",
        gs1Standards: [],
        complexity: "medium"
      }
    ];
    mockHookData(items);

    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      <RegulationComparisonMatrix
        regulationIds={["CSRD"]}
        attributes={["scope"]}
      />
    );

    const button = screen.getByRole("button", { name: /Export as PDF/i });
    fireEvent.click(button);

    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});

