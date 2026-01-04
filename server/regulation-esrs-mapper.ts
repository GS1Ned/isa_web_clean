import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { serverLogger } from "./_core/logger-wiring";

import {
  upsertRegulationEsrsMapping,
  deleteRegulationEsrsMappings,
} from "./db";

/**
 * LLM-powered regulation-to-ESRS datapoint mapper
 * Analyzes regulation text and identifies relevant ESRS disclosure requirements
 */

interface DatapointMatch {
  code: string; // e.g., "BP-1_01"
  esrs_standard: string; // e.g., "ESRS E1"
  relevanceScore: number; // 1-10
  reasoning: string; // Why this datapoint is relevant
}

/**
 * Generate ESRS datapoint mappings for a regulation using LLM
 */
export async function generateRegulationEsrsMappings(
  regulationId: number
): Promise<{
  success: boolean;
  mappingsCount: number;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        mappingsCount: 0,
        error: "Database not available",
      };
    }

    // 1. Fetch regulation details
    const { regulations } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const regulationResults = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);

    if (regulationResults.length === 0) {
      return {
        success: false,
        mappingsCount: 0,
        error: "Regulation not found",
      };
    }

    const regulation = regulationResults[0];

    // 2. Fetch all ESRS datapoints for context
    const { esrsDatapoints } = await import("../drizzle/schema");
    const allDatapoints = await db.select().from(esrsDatapoints);

    if (allDatapoints.length === 0) {
      return {
        success: false,
        mappingsCount: 0,
        error: "No ESRS datapoints found",
      };
    }

    // 3. Build LLM prompt (filter datapoints with required fields)
    const validDatapoints = allDatapoints.filter(
      dp => dp.code && dp.esrsStandard && dp.name
    ).map(dp => ({
      code: dp.code,
      esrs_standard: dp.esrsStandard!,
      name: dp.name,
      data_type: dp.dataType,
    }));
    const prompt = buildMappingPrompt(regulation, validDatapoints);

    // 4. Call LLM with structured output
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an ESG compliance expert specializing in ESRS (European Sustainability Reporting Standards). Your task is to analyze EU regulations and identify which ESRS datapoints are relevant for compliance reporting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "esrs_datapoint_mappings",
          strict: true,
          schema: {
            type: "object",
            properties: {
              mappings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    code: {
                      type: "string",
                      description: "The ESRS datapoint code (e.g., 'BP-1_01')",
                    },
                    esrs_standard: {
                      type: "string",
                      description: "The ESRS standard (e.g., 'ESRS E1')",
                    },
                    relevanceScore: {
                      type: "integer",
                      description:
                        "Relevance score from 1-10 (10 = highly relevant)",
                    },
                    reasoning: {
                      type: "string",
                      description:
                        "Brief explanation of why this datapoint is relevant",
                    },
                  },
                  required: [
                    "code",
                    "esrs_standard",
                    "relevanceScore",
                    "reasoning",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["mappings"],
            additionalProperties: false,
          },
        },
      },
    });

    // 5. Parse LLM response
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return {
        success: false,
        mappingsCount: 0,
        error: "Invalid LLM response",
      };
    }

    const result = JSON.parse(content) as { mappings: DatapointMatch[] };

    // 6. Clear existing mappings
    await deleteRegulationEsrsMappings(regulationId);

    // 7. Insert new mappings
    let insertedCount = 0;
    for (const match of result.mappings) {
      // Find datapoint by code
      const datapoint = allDatapoints.find(
        dp => dp.code === match.code
      );
      if (!datapoint) {
        serverLogger.warn(`[Mapper] Datapoint ${match.code} not found, skipping`);
        continue;
      }

      const inserted = await upsertRegulationEsrsMapping({
        regulationId,
        datapointId: datapoint.id,
        relevanceScore: match.relevanceScore,
        reasoning: match.reasoning,
      });

      if (inserted) {
        insertedCount++;
      }
    }

    console.log(
      `[Mapper] Generated ${insertedCount} ESRS mappings for regulation ${regulationId}`
    );

    return {
      success: true,
      mappingsCount: insertedCount,
    };
  } catch (error) {
    serverLogger.error("[Mapper] Failed to generate ESRS mappings:", error);
    return {
      success: false,
      mappingsCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build LLM prompt for mapping regulation to ESRS datapoints
 */
function buildMappingPrompt(
  regulation: {
    title: string;
    description: string | null;
    regulationType: string;
  },
  datapoints: Array<{
    code: string;
    esrs_standard: string;
    name: string;
    data_type: string | null;
  }>
): string {
  // Group datapoints by standard for better context
  const datapointsByStandard: Record<string, typeof datapoints> = {};
  for (const dp of datapoints) {
    if (!datapointsByStandard[dp.esrs_standard]) {
      datapointsByStandard[dp.esrs_standard] = [];
    }
    datapointsByStandard[dp.esrs_standard].push(dp);
  }

  const datapointContext = Object.entries(datapointsByStandard)
    .map(([standard, dps]) => {
      const dpList = dps
        .slice(0, 20) // Limit to first 20 per standard to avoid token overflow
        .map(dp => `  - ${dp.code}: ${dp.name || "N/A"}`)
        .join("\n");
      return `${standard} (${dps.length} datapoints):\n${dpList}`;
    })
    .join("\n\n");

  return `# Task: Identify Relevant ESRS Datapoints

## Regulation
**Title:** ${regulation.title}
**Type:** ${regulation.regulationType}
**Description:** ${regulation.description || "N/A"}

## Available ESRS Datapoints (${datapoints.length} total)
${datapointContext}

## Instructions
1. Analyze the regulation's scope, requirements, and subject matter
2. Identify which ESRS datapoints are **directly relevant** for compliance reporting
3. Focus on datapoints that companies must disclose to comply with this regulation
4. Assign relevance scores (1-10):
   - 9-10: Mandatory disclosure, core to regulation
   - 7-8: Highly relevant, likely required
   - 5-6: Moderately relevant, may be required
   - 3-4: Tangentially related
   - 1-2: Minimal relevance
5. Provide brief reasoning for each mapping

## Output Format
Return a JSON object with an array of mappings. Each mapping must include:
- code: The exact datapoint code from the list above
- esrs_standard: The ESRS standard (e.g., "ESRS E1")
- relevanceScore: Integer from 1-10
- reasoning: Brief explanation (1-2 sentences)

## Example
{
  "mappings": [
    {
      "code": "E1-1_01",
      "esrsStandard": "ESRS E1",
      "relevanceScore": 10,
      "reasoning": "This regulation requires disclosure of climate transition plans, which directly maps to ESRS E1-1 climate change strategy."
    }
  ]
}

## Guidelines
- Only include datapoints with relevance score ≥ 5
- Aim for 5-20 mappings per regulation (quality over quantity)
- Prioritize mandatory disclosures over voluntary ones
- Consider both environmental (E1-E5), social (S1-S4), and governance (G1) aspects
`;
}
