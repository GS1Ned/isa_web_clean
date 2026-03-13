/**
 * Ask ISA Fixture Replay Test (BENCH-001)
 *
 * Loads deterministic fixtures from ask-isa-replay.json and replays them
 * against the Ask ISA guardrails module. Validates:
 *   - Query classification (type + allowed)
 *   - Refusal reason content
 *   - Citation validation
 *   - Confidence scoring
 *
 * Evidence: server/__fixtures__/ask-isa-replay.json
 * Backlog ref: BENCH-001
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  classifyQuery,
  validateCitations,
  calculateConfidence,
} from "../ask-isa-guardrails";

// ── Load fixtures ──────────────────────────────────────────────────────────

interface ClassificationFixture {
  id: string;
  input: string;
  expected: {
    type: string;
    allowed: boolean;
    reason_contains?: string;
  };
}

interface CitationFixture {
  id: string;
  input_answer: string;
  expected_citation: {
    valid: boolean;
    missing_count?: number;
    missing_min?: number;
  };
}

interface ConfidenceFixture {
  id: string;
  input_source_count: number;
  expected_confidence: {
    level: "high" | "medium" | "low";
  };
}

type Fixture = ClassificationFixture | CitationFixture | ConfidenceFixture;

const fixturePath = resolve(__dirname, "ask-isa-replay.json");
const fixtureData = JSON.parse(readFileSync(fixturePath, "utf-8"));
const fixtures: Fixture[] = fixtureData.fixtures;

// ── Helpers to discriminate fixture types ───────────────────────────────────

function isClassification(f: Fixture): f is ClassificationFixture {
  return "input" in f && "expected" in f && "type" in (f as any).expected;
}

function isCitation(f: Fixture): f is CitationFixture {
  return "input_answer" in f;
}

function isConfidence(f: Fixture): f is ConfidenceFixture {
  return "input_source_count" in f;
}

// ── Schema validation ──────────────────────────────────────────────────────

describe("Fixture schema validation", () => {
  it("fixture file parses and has fixtures array", () => {
    expect(fixtureData.$schema).toBe("ask-isa-replay-fixture-v1");
    expect(Array.isArray(fixtures)).toBe(true);
    expect(fixtures.length).toBeGreaterThan(0);
  });

  it("every fixture has a unique id", () => {
    const ids = fixtures.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── Classification replay ──────────────────────────────────────────────────

const classificationFixtures = fixtures.filter(isClassification);

describe("Ask ISA classification fixture replay", () => {
  it.each(classificationFixtures.map((f) => [f.id, f]))(
    "%s",
    (_id, fixture) => {
      const f = fixture as ClassificationFixture;
      const result = classifyQuery(f.input);

      expect(result.type).toBe(f.expected.type);
      expect(Boolean(result.allowed)).toBe(f.expected.allowed);

      if (f.expected.reason_contains) {
        expect(result.reason).toBeDefined();
        expect(result.reason).toContain(f.expected.reason_contains);
      }
    }
  );
});

// ── Citation validation replay ─────────────────────────────────────────────

const citationFixtures = fixtures.filter(isCitation);

describe("Ask ISA citation fixture replay", () => {
  it.each(citationFixtures.map((f) => [f.id, f]))("%s", (_id, fixture) => {
    const f = fixture as CitationFixture;
    const result = validateCitations(f.input_answer);

    expect(Boolean(result.valid)).toBe(f.expected_citation.valid);

    if (f.expected_citation.missing_count !== undefined) {
      expect(result.missingElements.length).toBe(
        f.expected_citation.missing_count
      );
    }
    if (f.expected_citation.missing_min !== undefined) {
      expect(result.missingElements.length).toBeGreaterThanOrEqual(
        f.expected_citation.missing_min
      );
    }
  });
});

// ── Confidence scoring replay ──────────────────────────────────────────────

const confidenceFixtures = fixtures.filter(isConfidence);

describe("Ask ISA confidence fixture replay", () => {
  it.each(confidenceFixtures.map((f) => [f.id, f]))("%s", (_id, fixture) => {
    const f = fixture as ConfidenceFixture;
    const result = calculateConfidence(f.input_source_count);

    expect(result.level).toBe(f.expected_confidence.level);
  });
});
