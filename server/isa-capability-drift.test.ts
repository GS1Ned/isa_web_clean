import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { detectCapabilityTransition } = require("../scripts/eval/drift-detect.cjs");

describe("ISA capability drift helpers", () => {
  it("flags a transition when the ESRS benchmark profile changed from baseline", () => {
    const result = detectCapabilityTransition({
      history: [],
      baseline: {
        capability_meta: {
          ESRS_MAPPING: {
            dataset_ids: ["esrs_mapping_gold_v1", "esrs_mapping_negative_v1"],
            sample_count: 24,
            minimum_samples: 20,
            confidence: "HIGH",
            diagnostics: {
              benchmark_mix: {
                positive_case_count: 20,
                negative_case_count: 4,
                direct_case_count: 12,
                partial_case_count: 8,
                no_mapping_case_count: 4,
                direct_case_share: 0.5,
                partial_case_share: 0.3333,
                no_mapping_case_share: 0.1667,
              },
            },
          },
        },
      },
      capability: "ESRS_MAPPING",
      stage: "stage_a",
      capabilityMeta: {
        dataset_ids: ["esrs_mapping_gold_v1", "esrs_mapping_negative_v1"],
        sample_count: 28,
        minimum_samples: 20,
        confidence: "HIGH",
        diagnostics: {
          benchmark_mix: {
            positive_case_count: 24,
            negative_case_count: 4,
            direct_case_count: 14,
            partial_case_count: 10,
            no_mapping_case_count: 4,
            direct_case_share: 0.5,
            partial_case_share: 0.3571,
            no_mapping_case_share: 0.1429,
          },
        },
      },
    });

    expect(result).toEqual({
      transition: true,
      reason: "benchmark_profile_changed_from_baseline",
    });
  });

  it("does not flag a transition when the benchmark profile matches", () => {
    const sharedProfile = {
      dataset_ids: ["esrs_mapping_gold_v1", "esrs_mapping_negative_v1"],
      sample_count: 24,
      minimum_samples: 20,
      confidence: "HIGH",
      diagnostics: {
        benchmark_mix: {
          positive_case_count: 20,
          negative_case_count: 4,
          direct_case_count: 12,
          partial_case_count: 8,
          no_mapping_case_count: 4,
          direct_case_share: 0.5,
          partial_case_share: 0.3333,
          no_mapping_case_share: 0.1667,
        },
      },
    };

    const result = detectCapabilityTransition({
      history: [
        {
          stage: "stage_a",
          capability_meta: {
            ESRS_MAPPING: sharedProfile,
          },
        },
      ],
      baseline: {
        capability_meta: {
          ESRS_MAPPING: sharedProfile,
        },
      },
      capability: "ESRS_MAPPING",
      stage: "stage_a",
      capabilityMeta: sharedProfile,
    });

    expect(result).toEqual({
      transition: false,
      reason: null,
    });
  });
});
