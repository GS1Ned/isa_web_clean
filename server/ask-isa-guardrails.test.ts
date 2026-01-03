import { describe, it, expect } from "vitest";
import {
  classifyQuery,
  generateRefusalMessage,
  validateCitations,
  calculateConfidence,
} from "./ask-isa-guardrails";

/**
 * Ask ISA Guardrails Tests
 *
 * Tests for query classification, refusal patterns, citation validation,
 * and confidence scoring based on ASK_ISA_GUARDRAILS.md requirements.
 */

describe("Ask ISA Guardrails", () => {
  describe("Query Classification - Allowed Types", () => {
    it("should classify gap queries correctly", () => {
      const queries = [
        "Which gaps exist for CSRD in DIY?",
        "What is the status of Gap #1?",
        "Which critical gaps remain MISSING?",
        "Gap analysis for EUDR in FMCG",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("gap");
        expect(Boolean(result.allowed)).toBe(true);
      });
    });

    it("should classify mapping queries correctly", () => {
      const queries = [
        "Which GS1 attributes cover ESRS E1 datapoints?",
        "Which mappings exist for supplier due diligence?",
        "Mapping coverage for DPP in healthcare",
        "Which attributes map to deforestation requirements?",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("mapping");
        expect(Boolean(result.allowed)).toBe(true);
      });
    });

    it("should classify version comparison queries correctly", () => {
      const queries = [
        "What changed between v1.0 and v1.1?",
        "Which gaps were upgraded from MISSING to PARTIAL in v1.1?",
        "What new dataset entries were introduced?",
        "Difference between versions for Gap #1",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("version_comparison");
        expect(Boolean(result.allowed)).toBe(true);
      });
    });

    it("should classify dataset provenance queries correctly", () => {
      const queries = [
        "Which datasets underpin the Product Carbon Footprint recommendations?",
        "What is the authoritative source of ESRS E1 datapoint definitions?",
        "Which sector model version is used for healthcare analysis?",
        "Dataset provenance for Gap #5",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("dataset_provenance");
        expect(Boolean(result.allowed)).toBe(true);
      });
    });

    it("should classify recommendation queries correctly", () => {
      const queries = [
        "What are the short-term recommendations for DIY?",
        "Medium-term recommendations for healthcare",
        "Which recommendations require GS1 Europe alignment?",
        "Long-term recommendations to close circularity gaps",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("recommendation");
        expect(Boolean(result.allowed)).toBe(true);
      });
    });

    it("should classify coverage queries correctly", () => {
      const queries = [
        "What is the coverage percentage for ESRS E1 in DIY?",
        "Which ESRS topic has the highest coverage?",
        "Coverage percentage for EUDR requirements in FMCG",
        "What percentage of DPP requirements are covered?",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("coverage");
        expect(Boolean(result.allowed)).toBe(true);
      });
    });
  });

  describe("Query Classification - Forbidden Types", () => {
    it("should reject general ESG explanation queries", () => {
      const queries = [
        "What is CSRD?",
        "Explain ESRS to me",
        "Tell me about sustainability",
        "Define carbon footprint",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("forbidden");
        expect(Boolean(result.allowed)).toBe(false);
        expect(result.reason).toContain("General ESG explanations");
      });
    });

    it("should reject hypothetical queries", () => {
      const queries = [
        "What should GS1 do about DPP?",
        "Should GS1 NL adopt PCF in 2026?",
        "What would happen if GS1 implements this?",
        "What if GS1 changes the standard?",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("forbidden");
        expect(Boolean(result.allowed)).toBe(false);
        expect(result.reason).toContain("Hypothetical");
      });
    });

    it("should reject speculative queries", () => {
      const queries = [
        "Will GS1 NL adopt this in 2026?",
        "What will happen next year?",
        "Future of ESG regulations",
        "Predict the regulatory changes",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("forbidden");
        expect(Boolean(result.allowed)).toBe(false);
        expect(result.reason).toContain("Speculative");
      });
    });

    it("should reject calculation queries", () => {
      const queries = [
        "How do I calculate Scope 3 emissions?",
        "Calculate carbon footprint for this product",
        "Estimate emissions for my company",
        "Compute the environmental impact",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("forbidden");
        expect(Boolean(result.allowed)).toBe(false);
        expect(result.reason).toContain("Calculation");
      });
    });

    it("should reject conversational prompts", () => {
      const queries = [
        "Hi, can you help me?",
        "Hello ISA",
        "Thanks for the information",
        "Tell me more about this",
      ];

      queries.forEach((query) => {
        const result = classifyQuery(query);
        expect(result.type).toBe("forbidden");
        expect(Boolean(result.allowed)).toBe(false);
        expect(result.reason).toContain("conversational");
      });
    });
  });

  describe("Refusal Message Generation", () => {
    it("should generate refusal message for forbidden queries", () => {
      const classification = classifyQuery("What is CSRD?");

      const message = generateRefusalMessage(classification);

      expect(message).toContain("ISA cannot answer this question");
      expect(message).toContain("General ESG explanations");
      expect(message.length).toBeGreaterThan(0);
    });

    it("should include suggested alternative in refusal message", () => {
      const classification = classifyQuery("What should GS1 do?");

      const message = generateRefusalMessage(classification);

      expect(message).toContain("ISA cannot answer this question");
      expect(message).toContain("existing recommendations");
    });

    it("should return empty string for allowed queries", () => {
      const classification = classifyQuery("Which gaps exist for CSRD in DIY?");

      const message = generateRefusalMessage(classification);

      expect(message).toBe("");
    });
  });

  describe("Citation Validation", () => {
    it("should validate complete citations", () => {
      const answer = `Based on ISA_ADVISORY_v1.1, there are 3 critical gaps for CSRD in DIY.
      
      Dataset references: esrs.datapoints.ig3, gs1nl.benelux.diy_garden_pet.v3.1.33
      Dataset registry: v1.3.0`;

      const result = validateCitations(answer);

      expect(Boolean(result.valid)).toBe(true);
      expect(result.missingElements).toHaveLength(0);
    });

    it("should detect missing advisory ID", () => {
      const answer = `There are 3 critical gaps for CSRD in DIY.
      
      Dataset references: esrs.datapoints.ig3, gs1nl.benelux.diy_garden_pet.v3.1.33`;

      const result = validateCitations(answer);

      expect(Boolean(result.valid)).toBe(false);
      expect(result.missingElements).toContain(
        "Advisory ID (e.g., ISA_ADVISORY_v1.1)"
      );
    });

    it("should detect missing dataset references", () => {
      const answer = `Based on ISA_ADVISORY_v1.1, there are 3 critical gaps for CSRD in DIY.`;

      const result = validateCitations(answer);

      expect(Boolean(result.valid)).toBe(false);
      expect(result.missingElements).toContain(
        "Dataset IDs or registry reference"
      );
    });

    it("should accept dataset registry reference as valid citation", () => {
      const answer = `Based on ISA_ADVISORY_v1.1, there are 3 critical gaps.
      
      Dataset registry v1.3.0 contains all referenced datasets.`;

      const result = validateCitations(answer);

      expect(Boolean(result.valid)).toBe(true);
    });

    it("should detect multiple missing elements", () => {
      const answer = `There are 3 critical gaps for CSRD in DIY.`;

      const result = validateCitations(answer);

      expect(Boolean(result.valid)).toBe(false);
      expect(result.missingElements.length).toBeGreaterThan(0);
    });
  });

  describe("Confidence Scoring", () => {
    it("should return high confidence for 3+ sources", () => {
      const result = calculateConfidence(3);

      expect(result.level).toBe("high");
      expect(result.score).toBe(3);
    });

    it("should return high confidence for 5 sources", () => {
      const result = calculateConfidence(5);

      expect(result.level).toBe("high");
      expect(result.score).toBe(5);
    });

    it("should return medium confidence for 2 sources", () => {
      const result = calculateConfidence(2);

      expect(result.level).toBe("medium");
      expect(result.score).toBe(2);
    });

    it("should return low confidence for 1 source", () => {
      const result = calculateConfidence(1);

      expect(result.level).toBe("low");
      expect(result.score).toBe(1);
    });

    it("should return low confidence for 0 sources", () => {
      const result = calculateConfidence(0);

      expect(result.level).toBe("low");
      expect(result.score).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle mixed case queries", () => {
      const result = classifyQuery("WHICH GAPS EXIST FOR CSRD IN DIY?");

      expect(result.type).toBe("gap");
      expect(Boolean(result.allowed)).toBe(true);
    });

    it("should handle queries with extra whitespace", () => {
      const result = classifyQuery("  Which gaps exist for CSRD?  ");

      expect(result.type).toBe("gap");
      expect(Boolean(result.allowed)).toBe(true);
    });

    it("should default to allowed for unclassified queries", () => {
      const result = classifyQuery(
        "This is a very unusual query that doesn't match any pattern"
      );

      expect(Boolean(result.allowed)).toBe(true);
    });

    it("should handle empty citations", () => {
      const result = validateCitations("");

      expect(Boolean(result.valid)).toBe(false);
      expect(result.missingElements.length).toBeGreaterThan(0);
    });
  });
});
