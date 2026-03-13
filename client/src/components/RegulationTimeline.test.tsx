import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegulationTimeline } from "./RegulationTimeline";

describe("RegulationTimeline", () => {
  it("renders an annotated fallback description instead of placeholder TODO copy", () => {
    render(
      <RegulationTimeline
        regulationCode="EU 2024/1234"
        milestones={[
          {
            event: "Delegated act adopted",
            date: "2026-04-01",
            status: "upcoming",
          },
        ]}
      />,
    );

    expect(screen.getByText(/Regulation timeline/i)).not.toBeNull();
    expect(
      screen.getByText(
        /Additional milestone detail will appear when ISA adds annotated timeline context/i,
      ),
    ).not.toBeNull();
    expect(screen.queryByText(/TODO:/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /View full timeline/i })).toBeNull();
  });
});
