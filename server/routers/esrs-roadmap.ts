import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getAllEsrsGs1Mappings } from "../db-esrs-gs1-mapping";
import { serverLogger } from "../_core/logger-wiring";


// ESRS-GS1 Roadmap phase types
const EsrsRoadmapPhaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timeframe: z.enum(["quick_win", "medium_term", "long_term"]),
  duration: z.string(), // e.g., "1-3 months", "6-12 months"
  priority: z.enum(["critical", "high", "medium", "low"]),
  gs1Attributes: z.array(z.string()),
  esrsRequirements: z.array(z.string()),
  implementationSteps: z.array(z.string()),
  dependencies: z.array(z.string()), // IDs of prerequisite phases
  estimatedEffort: z.string(),
  expectedOutcome: z.string(),
});

const EsrsRoadmapSchema = z.object({
  sector: z.string(),
  esrsRequirements: z.array(z.string()),
  phases: z.array(EsrsRoadmapPhaseSchema),
  summary: z.string(),
  totalDuration: z.string(),
  generatedAt: z.string(),
});

export const esrsRoadmapRouter = router({
  /**
   * Generate an ESRS-GS1 compliance roadmap based on sector and ESRS requirements
   */
  generate: publicProcedure
    .input(
      z.object({
        sector: z.string(),
        esrsRequirements: z.array(z.string()), // e.g., ["ESRS E1", "ESRS E5"]
        companySize: z.enum(["sme", "large"]).optional(),
        currentMaturity: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { sector, esrsRequirements, companySize = "large", currentMaturity = "beginner" } = input;

      // Fetch all ESRS-GS1 mappings
      const allMappingsRaw = await getAllEsrsGs1Mappings();
      const allMappings = Array.isArray(allMappingsRaw) ? allMappingsRaw : [];

      // Filter mappings relevant to selected ESRS requirements
      const relevantMappings = allMappings.filter((mapping: any) =>
        esrsRequirements.some((req) => mapping.esrsStandard?.includes(req))
      );

      // Build context for LLM
      const mappingsContext = relevantMappings
        .map(
          (m: any) =>
            `- ${m.esrsStandard} (${m.esrs_topic}): ${m.data_point_name}\n  Relevance: ${m.gs1_relevance}\n  Source: ${m.source_document}`
        )
        .join("\n\n");

      // Generate roadmap using LLM
      const prompt = `You are an expert in ESRS compliance and GS1 standards implementation. Generate a detailed compliance roadmap for a ${companySize} company in the ${sector} sector with ${currentMaturity} maturity level.

**ESRS Requirements:**
${esrsRequirements.join(", ")}

**Available GS1-ESRS Mappings:**
${mappingsContext}

**Task:**
Create a phased implementation roadmap with 4-6 phases. Each phase should:
1. Focus on specific GS1 attributes needed for ESRS compliance
2. Be categorized as quick_win (0-3 months), medium_term (3-12 months), or long_term (12+ months)
3. Include priority level (critical/high/medium/low)
4. List 3-5 concrete implementation steps
5. Identify dependencies on previous phases
6. Estimate effort and expected outcomes

**Roadmap Structure:**
- Phase 1: Quick wins (foundational GS1 attributes, low effort, high visibility)
- Phase 2-3: Medium-term initiatives (core compliance attributes, moderate effort)
- Phase 4-6: Long-term transformation (advanced integration, high effort)

Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 sentence overview of the roadmap",
  "totalDuration": "estimated total duration (e.g., '18-24 months')",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase title",
      "description": "What this phase achieves",
      "timeframe": "quick_win" | "medium_term" | "long_term",
      "duration": "1-3 months",
      "priority": "critical" | "high" | "medium" | "low",
      "gs1Attributes": ["carbonFootprintValue", "recycledContentPercentage"],
      "esrsRequirements": ["ESRS E1", "ESRS E5"],
      "implementationSteps": [
        "Step 1: Specific action",
        "Step 2: Specific action",
        "Step 3: Specific action"
      ],
      "dependencies": [], // IDs of prerequisite phases
      "estimatedEffort": "Low/Medium/High",
      "expectedOutcome": "Measurable outcome"
    }
  ]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert ESRS compliance consultant specializing in GS1 standards implementation. Always return valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "compliance_roadmap",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  totalDuration: { type: "string" },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        timeframe: { type: "string", enum: ["quick_win", "medium_term", "long_term"] },
                        duration: { type: "string" },
                        priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        gs1Attributes: { type: "array", items: { type: "string" } },
                        esrsRequirements: { type: "array", items: { type: "string" } },
                        implementationSteps: { type: "array", items: { type: "string" } },
                        dependencies: { type: "array", items: { type: "string" } },
                        estimatedEffort: { type: "string" },
                        expectedOutcome: { type: "string" },
                      },
                      required: [
                        "id",
                        "title",
                        "description",
                        "timeframe",
                        "duration",
                        "priority",
                        "gs1Attributes",
                        "esrsRequirements",
                        "implementationSteps",
                        "dependencies",
                        "estimatedEffort",
                        "expectedOutcome",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "totalDuration", "phases"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        if (!content || typeof content !== 'string') {
          throw new Error("No content in LLM response");
        }

        const roadmapData = JSON.parse(content);

        // Validate and return roadmap
        const roadmap = {
          sector,
          esrsRequirements,
          ...roadmapData,
          generatedAt: new Date().toISOString(),
        };

        return EsrsRoadmapSchema.parse(roadmap);
      } catch (error) {
        serverLogger.error("[ESRSRoadmap] Failed to generate roadmap:", error);

        // Fallback: Generate basic roadmap from mappings
        const fallbackPhases = [
          {
            id: "phase-1",
            title: "Foundation: Core GS1 Identifiers",
            description: "Establish basic product identification using GTINs and GLNs",
            timeframe: "quick_win" as const,
            duration: "1-2 months",
            priority: "critical" as const,
            gs1Attributes: ["gtin", "gln", "productName"],
            esrsRequirements,
            implementationSteps: [
              "Assign GTINs to all products in scope",
              "Register company GLN with GS1",
              "Set up master data management system",
            ],
            dependencies: [],
            estimatedEffort: "Low",
            expectedOutcome: "All products uniquely identified with GS1 standards",
          },
          {
            id: "phase-2",
            title: `${sector} Compliance Attributes`,
            description: `Implement GS1 attributes for ${esrsRequirements.join(", ")} compliance`,
            timeframe: "medium_term" as const,
            duration: "3-6 months",
            priority: "high" as const,
            gs1Attributes: relevantMappings.slice(0, 5).map((m: any) => m.data_point_name || m.short_name),
            esrsRequirements,
            implementationSteps: [
              "Map ESRS datapoints to GS1 attributes",
              "Collect sustainability data from suppliers",
              "Populate GS1 attributes in product master data",
            ],
            dependencies: ["phase-1"],
            estimatedEffort: "Medium",
            expectedOutcome: "Core ESRS requirements covered with GS1 data",
          },
        ];

        return {
          sector,
          esrsRequirements,
          summary: `Basic roadmap for ${sector} sector covering ${esrsRequirements.join(", ")}`,
          totalDuration: "6-12 months",
          phases: fallbackPhases,
          generatedAt: new Date().toISOString(),
        };
      }
    }),

  /**
   * Get available sectors for roadmap generation
   */
  getSectors: publicProcedure.query(() => {
    return [
      { id: "food_beverage", name: "Food & Beverage", icon: "🍎" },
      { id: "apparel_textiles", name: "Apparel & Textiles", icon: "👕" },
      { id: "electronics", name: "Electronics", icon: "📱" },
      { id: "healthcare", name: "Healthcare & Pharma", icon: "💊" },
      { id: "retail", name: "Retail & FMCG", icon: "🛒" },
      { id: "logistics", name: "Logistics & Transport", icon: "🚚" },
      { id: "construction", name: "Construction & Building", icon: "🏗️" },
      { id: "chemicals", name: "Chemicals & Materials", icon: "⚗️" },
      { id: "automotive", name: "Automotive", icon: "🚗" },
      { id: "packaging", name: "Packaging", icon: "📦" },
      { id: "agriculture", name: "Agriculture", icon: "🌾" },
      { id: "energy", name: "Energy & Utilities", icon: "⚡" },
    ];
  }),

  /**
   * Get available ESRS requirements
   */
  getEsrsRequirements: publicProcedure.query(() => {
    return [
      { id: "ESRS E1", name: "Climate Change", category: "Environmental" },
      { id: "ESRS E2", name: "Pollution", category: "Environmental" },
      { id: "ESRS E3", name: "Water and Marine Resources", category: "Environmental" },
      { id: "ESRS E4", name: "Biodiversity and Ecosystems", category: "Environmental" },
      { id: "ESRS E5", name: "Circular Economy", category: "Environmental" },
      { id: "ESRS S1", name: "Own Workforce", category: "Social" },
      { id: "ESRS S2", name: "Workers in Value Chain", category: "Social" },
      { id: "ESRS S3", name: "Affected Communities", category: "Social" },
      { id: "ESRS S4", name: "Consumers and End-users", category: "Social" },
      { id: "ESRS G1", name: "Business Conduct", category: "Governance" },
    ];
  }),
});
