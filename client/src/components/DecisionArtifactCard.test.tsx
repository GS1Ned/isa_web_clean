import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DecisionArtifactCard } from "./DecisionArtifactCard";

describe("DecisionArtifactCard", () => {
  it("renders stable artifact metadata, summary, and evidence", () => {
    render(
      <DecisionArtifactCard
        artifact={{
          artifactVersion: "1.0",
          artifactType: "roadmap",
          capability: "ESRS_MAPPING",
          generatedAt: "2026-03-04T10:00:00.000Z",
          confidence: {
            level: "high",
            score: 0.82,
            basis: "Roadmap grounded in mapped ESRS requirements.",
          },
          evidence: {
            codePaths: ["server/routers/esrs-roadmap.ts"],
            dataSources: ["gs1_esrs_mappings"],
          },
          summary: {
            phaseCount: 4,
            quickWinCount: 2,
            topPhaseIds: ["phase-1", "phase-2"],
          },
        }}
      />,
    );

    expect(screen.queryByText("Decision Artifact")).not.toBeNull();
    expect(screen.queryByText("ESRS_MAPPING")).not.toBeNull();
    expect(screen.queryByText(/high 82%/i)).not.toBeNull();
    expect(screen.queryByText("Roadmap grounded in mapped ESRS requirements.")).not.toBeNull();
    expect(screen.queryByText("4")).not.toBeNull();
    expect(screen.queryByText("phase-1, phase-2")).not.toBeNull();
    expect(screen.queryByText("server/routers/esrs-roadmap.ts")).not.toBeNull();
    expect(screen.queryByText("gs1_esrs_mappings")).not.toBeNull();
  });
});
