/**
 * Impact Simulator Router (Core 2)
 * 
 * Regulatory Change Impact Simulator - Future-State Reasoning
 * 
 * This router provides impact simulation based on:
 * - Curated regulatory scenarios (DPP, CS3D, ESPR)
 * - Current state from Core 1 or manual input
 * - Future gap projections
 * 
 * Key principle: All future projections are marked as 'uncertain' with
 * explicit assumptions and disclaimers.
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db.js';
import { sql } from 'drizzle-orm';
import {
  type RegulatoryScenario,
  type ScenarioRequirement,
  type ScenarioAssumption,
  type ImpactSimulationInput,
  type ImpactSimulationResult,
  type ProjectedGap,
  type ActionRecommendation,
  type GapAnalysisResult,
  createUncertainMarker,
  createInferenceMarker,
  calculateOverallConfidence,
} from '../gap-reasoning.js';

// =============================================================================
// CURATED REGULATORY SCENARIOS
// =============================================================================

/**
 * Pre-defined regulatory scenarios for impact simulation.
 * These represent upcoming or evolving regulations with GS1 implications.
 */
const REGULATORY_SCENARIOS: RegulatoryScenario[] = [
  {
    id: 'dpp-2027',
    name: 'Digital Product Passport (DPP) - 2027 Phase',
    description: 'The EU Digital Product Passport regulation requiring product-level sustainability data accessible via QR codes and digital links.',
    regulation: 'ESPR/DPP',
    expectedDate: '2027-01-01',
    dateConfidence: 'medium',
    newRequirements: [
      {
        id: 'dpp-1',
        description: 'Unique product identifier accessible via QR code or digital link',
        gs1Impact: 'Requires GTIN + GS1 Digital Link implementation',
        affectedSectors: ['electronics', 'textiles', 'batteries', 'furniture'],
        mandatory: true,
        effectiveDate: '2027-01-01',
      },
      {
        id: 'dpp-2',
        description: 'Product carbon footprint data at item level',
        gs1Impact: 'Requires GDSN Carbon Footprint attributes',
        affectedSectors: ['electronics', 'textiles', 'batteries'],
        mandatory: true,
        effectiveDate: '2027-01-01',
      },
      {
        id: 'dpp-3',
        description: 'Material composition and recyclability information',
        gs1Impact: 'Requires packaging material and recycling attributes in GDSN',
        affectedSectors: ['electronics', 'textiles', 'batteries', 'furniture'],
        mandatory: true,
        effectiveDate: '2027-01-01',
      },
      {
        id: 'dpp-4',
        description: 'Supply chain traceability data',
        gs1Impact: 'Requires EPCIS event data for key supply chain events',
        affectedSectors: ['electronics', 'textiles', 'batteries'],
        mandatory: true,
        effectiveDate: '2027-01-01',
      },
      {
        id: 'dpp-5',
        description: 'Repair and durability information',
        gs1Impact: 'New GDSN attributes for repairability scores',
        affectedSectors: ['electronics', 'furniture'],
        mandatory: true,
        effectiveDate: '2027-01-01',
      },
    ],
    modifiedRequirements: [],
    assumptions: [
      {
        id: 'dpp-a1',
        assumption: 'GS1 Digital Link will be the primary carrier for DPP access',
        rationale: 'EU Commission has indicated preference for existing standards',
        confidence: 'high',
        alternatives: ['QR codes with proprietary URLs', 'NFC tags'],
      },
      {
        id: 'dpp-a2',
        assumption: 'Delegated acts will specify GDSN-compatible data models',
        rationale: 'GS1 Europe actively participating in standardization',
        confidence: 'medium',
        alternatives: ['Custom EU data model', 'Hybrid approach'],
      },
      {
        id: 'dpp-a3',
        assumption: 'Phase-in will start with batteries, then textiles, then electronics',
        rationale: 'Based on current regulatory timeline discussions',
        confidence: 'medium',
        alternatives: ['Simultaneous rollout', 'Different sector order'],
      },
    ],
    source: 'EU ESPR Regulation (EU) 2024/1781',
    lastUpdated: '2024-12-15',
  },
  {
    id: 'cs3d-2026',
    name: 'Corporate Sustainability Due Diligence (CS3D/CSDDD)',
    description: 'Supply chain due diligence requirements for human rights and environmental impacts.',
    regulation: 'CS3D/CSDDD',
    expectedDate: '2026-07-01',
    dateConfidence: 'high',
    newRequirements: [
      {
        id: 'cs3d-1',
        description: 'Supplier identification and risk assessment',
        gs1Impact: 'Requires GLN for all tier-1 suppliers',
        affectedSectors: ['all'],
        mandatory: true,
        effectiveDate: '2026-07-01',
      },
      {
        id: 'cs3d-2',
        description: 'Traceability to raw material origins',
        gs1Impact: 'Requires EPCIS events with origin location data',
        affectedSectors: ['food_beverage', 'textiles', 'electronics'],
        mandatory: true,
        effectiveDate: '2026-07-01',
      },
      {
        id: 'cs3d-3',
        description: 'Grievance mechanism documentation',
        gs1Impact: 'May require linking to supplier GLNs',
        affectedSectors: ['all'],
        mandatory: true,
        effectiveDate: '2026-07-01',
      },
    ],
    modifiedRequirements: [],
    assumptions: [
      {
        id: 'cs3d-a1',
        assumption: 'Large companies (>1000 employees, >450M turnover) first',
        rationale: 'Phased approach confirmed in directive',
        confidence: 'high',
        alternatives: ['Earlier SME inclusion'],
      },
      {
        id: 'cs3d-a2',
        assumption: 'GLN will be accepted as supplier identifier',
        rationale: 'GS1 standards widely recognized in B2B',
        confidence: 'high',
        alternatives: ['LEI requirement', 'National identifiers'],
      },
    ],
    source: 'EU Corporate Sustainability Due Diligence Directive',
    lastUpdated: '2024-11-20',
  },
  {
    id: 'espr-2025',
    name: 'Ecodesign for Sustainable Products (ESPR) - Framework',
    description: 'Framework regulation establishing ecodesign requirements for sustainable products.',
    regulation: 'ESPR',
    expectedDate: '2025-07-01',
    dateConfidence: 'high',
    newRequirements: [
      {
        id: 'espr-1',
        description: 'Product environmental footprint declaration',
        gs1Impact: 'Requires environmental impact attributes in GDSN',
        affectedSectors: ['all'],
        mandatory: true,
        effectiveDate: '2025-07-01',
      },
      {
        id: 'espr-2',
        description: 'Substance of concern disclosure',
        gs1Impact: 'Requires hazardous substance attributes',
        affectedSectors: ['electronics', 'textiles', 'chemicals'],
        mandatory: true,
        effectiveDate: '2025-07-01',
      },
    ],
    modifiedRequirements: [],
    assumptions: [
      {
        id: 'espr-a1',
        assumption: 'Delegated acts will define product-specific requirements',
        rationale: 'Framework regulation approach',
        confidence: 'high',
        alternatives: ['Horizontal requirements only'],
      },
    ],
    source: 'EU Ecodesign for Sustainable Products Regulation',
    lastUpdated: '2024-10-01',
  },
  {
    id: 'eudr-2025',
    name: 'EU Deforestation Regulation (EUDR) - Full Implementation',
    description: 'Requirements for deforestation-free supply chains for specific commodities.',
    regulation: 'EUDR',
    expectedDate: '2025-12-30',
    dateConfidence: 'high',
    newRequirements: [
      {
        id: 'eudr-1',
        description: 'Geolocation of production plots',
        gs1Impact: 'Requires EPCIS with geolocation extensions',
        affectedSectors: ['food_beverage', 'agriculture', 'furniture'],
        mandatory: true,
        effectiveDate: '2025-12-30',
      },
      {
        id: 'eudr-2',
        description: 'Due diligence statements per shipment',
        gs1Impact: 'Requires linking GTIN/batch to due diligence records',
        affectedSectors: ['food_beverage', 'agriculture', 'furniture'],
        mandatory: true,
        effectiveDate: '2025-12-30',
      },
      {
        id: 'eudr-3',
        description: 'Traceability to plot of land',
        gs1Impact: 'Requires EPCIS transformation events with origin data',
        affectedSectors: ['food_beverage', 'agriculture'],
        mandatory: true,
        effectiveDate: '2025-12-30',
      },
    ],
    modifiedRequirements: [],
    assumptions: [
      {
        id: 'eudr-a1',
        assumption: 'Implementation deadline will not be further postponed',
        rationale: 'Already postponed once; political pressure to proceed',
        confidence: 'medium',
        alternatives: ['Further 6-12 month delay'],
      },
      {
        id: 'eudr-a2',
        assumption: 'EPCIS will be accepted for traceability evidence',
        rationale: 'GS1 standards mentioned in guidance documents',
        confidence: 'high',
        alternatives: ['Proprietary systems required'],
      },
    ],
    source: 'EU Deforestation Regulation (EU) 2023/1115',
    lastUpdated: '2024-12-01',
  },
];

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const impactSimulationInputSchema = z.object({
  scenarioId: z.string(),
  currentState: z.object({
    sector: z.string(),
    companySize: z.enum(['large', 'sme', 'micro']),
    currentGs1Coverage: z.array(z.string()),
  }).optional(),
});

// =============================================================================
// SIMULATION LOGIC
// =============================================================================

/**
 * Simulate the impact of a regulatory scenario on current state.
 */
async function simulateImpact(input: ImpactSimulationInput): Promise<ImpactSimulationResult> {
  const timestamp = new Date().toISOString();
  
  // Find the scenario
  const scenario = REGULATORY_SCENARIOS.find(s => s.id === input.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: ${input.scenarioId}`);
  }
  
  // Get current state
  const currentState = input.manualCurrentState || {
    sector: 'general',
    companySize: 'large' as const,
    currentGs1Coverage: [],
  };
  
  // Get current GS1-ESRS mappings to understand coverage
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const mappingsResult = await db.execute(sql`
    SELECT DISTINCT gs1_attribute_id, gs1_attribute_name
    FROM gs1_attribute_esrs_mapping
  `);
  const availableMappings = (mappingsResult[0] as unknown) as Array<{
    gs1_attribute_id: string;
    gs1_attribute_name: string;
  }>;
  
  // Project gaps for each new requirement
  const projectedGaps: ProjectedGap[] = [];
  const noRegretActions: ActionRecommendation[] = [];
  const contingentActions: ActionRecommendation[] = [];
  
  for (const req of scenario.newRequirements) {
    // Check if this requirement affects the company's sector
    const affectsSector = req.affectedSectors.includes('all') || 
                          req.affectedSectors.includes(currentState.sector);
    
    if (!affectsSector) continue;
    
    // Determine current status based on GS1 coverage
    const relatedAttributes = getRelatedAttributes(req, availableMappings);
    const coveredAttributes = relatedAttributes.filter(
      a => currentState.currentGs1Coverage.includes(a.gs1_attribute_id)
    );
    
    let currentStatus: 'covered' | 'partial' | 'not_covered';
    if (coveredAttributes.length === 0) {
      currentStatus = 'not_covered';
    } else if (coveredAttributes.length < relatedAttributes.length) {
      currentStatus = 'partial';
    } else {
      currentStatus = 'covered';
    }
    
    // Project future status
    let futureStatus: 'will_be_covered' | 'at_risk' | 'gap';
    if (currentStatus === 'covered') {
      futureStatus = 'will_be_covered';
    } else if (currentStatus === 'partial') {
      futureStatus = 'at_risk';
    } else {
      futureStatus = 'gap';
    }
    
    // Create projected gap
    projectedGaps.push({
      id: `proj-${req.id}`,
      requirement: req,
      currentStatus,
      futureStatus,
      changeDescription: generateChangeDescription(req, currentStatus, futureStatus),
      epistemic: createUncertainMarker(
        `Projection based on ${scenario.name} scenario assumptions`,
        scenario.dateConfidence
      ),
    });
    
    // Generate action recommendations
    if (futureStatus === 'gap' || futureStatus === 'at_risk') {
      // No-regret actions: beneficial regardless of scenario changes
      const noRegretAction = generateNoRegretAction(req, relatedAttributes);
      if (noRegretAction) {
        noRegretActions.push(noRegretAction);
      }
      
      // Contingent actions: depend on scenario materializing
      const contingentAction = generateContingentAction(req, scenario);
      if (contingentAction) {
        contingentActions.push(contingentAction);
      }
    }
  }
  
  // Calculate comparison metrics
  const totalRequirements = scenario.newRequirements.filter(
    r => r.affectedSectors.includes('all') || r.affectedSectors.includes(currentState.sector)
  ).length;
  
  const currentCovered = projectedGaps.filter(g => g.currentStatus === 'covered').length;
  const futureCovered = projectedGaps.filter(g => g.futureStatus === 'will_be_covered').length;
  const newGaps = projectedGaps.filter(g => g.futureStatus === 'gap').length;
  
  // Collect epistemic markers
  const allMarkers = [
    ...projectedGaps.map(g => g.epistemic),
    ...noRegretActions.map(a => a.epistemic),
    ...contingentActions.map(a => a.epistemic),
  ];
  
  return {
    input,
    scenario,
    timestamp,
    comparison: {
      currentCoverage: totalRequirements > 0 ? Math.round((currentCovered / totalRequirements) * 100) : 0,
      projectedCoverage: totalRequirements > 0 ? Math.round((futureCovered / totalRequirements) * 100) : 0,
      newGapsCount: newGaps,
      resolvedGapsCount: 0, // Future: track gaps that get resolved
    },
    projectedGaps,
    noRegretActions: deduplicateActions(noRegretActions),
    contingentActions: deduplicateActions(contingentActions),
    activeAssumptions: scenario.assumptions,
    uncertaintyDisclaimer: generateDisclaimer(scenario),
    overallEpistemic: {
      factCount: 0, // All projections are uncertain
      inferenceCount: allMarkers.filter(m => m.status === 'inference').length,
      uncertainCount: allMarkers.filter(m => m.status === 'uncertain').length,
      overallConfidence: calculateOverallConfidence(allMarkers),
    },
  };
}

/**
 * Get GS1 attributes related to a requirement based on keywords.
 */
function getRelatedAttributes(
  req: ScenarioRequirement,
  availableMappings: Array<{ gs1_attribute_id: string; gs1_attribute_name: string }>
): Array<{ gs1_attribute_id: string; gs1_attribute_name: string }> {
  const keywords = extractKeywords(req.gs1Impact);
  return availableMappings.filter(m => 
    keywords.some(k => 
      m.gs1_attribute_name.toLowerCase().includes(k.toLowerCase()) ||
      m.gs1_attribute_id.toLowerCase().includes(k.toLowerCase())
    )
  );
}

/**
 * Extract keywords from GS1 impact description.
 */
function extractKeywords(gs1Impact: string): string[] {
  const keywords: string[] = [];
  
  if (gs1Impact.includes('GTIN')) keywords.push('gtin', 'identifier');
  if (gs1Impact.includes('GLN')) keywords.push('gln', 'location');
  if (gs1Impact.includes('GDSN')) keywords.push('gdsn', 'product');
  if (gs1Impact.includes('EPCIS')) keywords.push('epcis', 'event', 'traceability');
  if (gs1Impact.includes('Digital Link')) keywords.push('digital', 'link', 'qr');
  if (gs1Impact.includes('carbon')) keywords.push('carbon', 'footprint', 'emission');
  if (gs1Impact.includes('material')) keywords.push('material', 'composition', 'packaging');
  if (gs1Impact.includes('recycl')) keywords.push('recycl', 'circular');
  if (gs1Impact.includes('origin')) keywords.push('origin', 'source', 'country');
  if (gs1Impact.includes('hazard')) keywords.push('hazard', 'substance', 'chemical');
  
  return keywords.length > 0 ? keywords : ['product', 'attribute'];
}

/**
 * Generate change description for a projected gap.
 */
function generateChangeDescription(
  req: ScenarioRequirement,
  currentStatus: string,
  futureStatus: string
): string {
  if (futureStatus === 'will_be_covered') {
    return `Your current GS1 coverage already addresses this requirement. Continue maintaining your data quality.`;
  }
  
  if (futureStatus === 'at_risk') {
    return `Partial coverage exists but additional GS1 attributes are needed. ${req.gs1Impact}`;
  }
  
  return `New requirement with no current coverage. ${req.gs1Impact}`;
}

/**
 * Generate a no-regret action recommendation.
 */
function generateNoRegretAction(
  req: ScenarioRequirement,
  relatedAttributes: Array<{ gs1_attribute_id: string; gs1_attribute_name: string }>
): ActionRecommendation | null {
  // No-regret actions are beneficial regardless of regulatory outcome
  const gs1Standards: string[] = [];
  
  if (req.gs1Impact.includes('GTIN')) gs1Standards.push('GTIN');
  if (req.gs1Impact.includes('GDSN')) gs1Standards.push('GDSN');
  if (req.gs1Impact.includes('EPCIS')) gs1Standards.push('EPCIS');
  if (req.gs1Impact.includes('GLN')) gs1Standards.push('GLN');
  if (req.gs1Impact.includes('Digital Link')) gs1Standards.push('GS1 Digital Link');
  
  if (gs1Standards.length === 0) return null;
  
  return {
    id: `nr-${req.id}`,
    type: 'no_regret',
    action: `Implement ${gs1Standards.join(' + ')} foundation`,
    description: `Establish ${gs1Standards.join(', ')} capabilities to address "${req.description}". This investment provides value regardless of final regulatory requirements.`,
    benefitsEvenIfScenarioChanges: 'Improves supply chain visibility, enables B2B data exchange, and prepares for multiple regulatory requirements.',
    gs1Standards,
    estimatedEffort: gs1Standards.length > 2 ? 'high' : gs1Standards.length > 1 ? 'medium' : 'low',
    epistemic: createInferenceMarker(
      'No-regret action based on GS1 standard applicability analysis',
      'high'
    ),
  };
}

/**
 * Generate a contingent action recommendation.
 */
function generateContingentAction(
  req: ScenarioRequirement,
  scenario: RegulatoryScenario
): ActionRecommendation | null {
  return {
    id: `cont-${req.id}`,
    type: 'contingent',
    action: `Prepare for ${req.description}`,
    description: `Monitor ${scenario.regulation} developments and prepare implementation plan for "${req.description}".`,
    triggerCondition: `When ${scenario.regulation} delegated acts are published`,
    waitUntil: scenario.expectedDate,
    gs1Standards: [],
    estimatedEffort: 'medium',
    epistemic: createUncertainMarker(
      `Contingent on ${scenario.name} materializing as expected`,
      scenario.dateConfidence
    ),
  };
}

/**
 * Deduplicate actions by combining similar ones.
 */
function deduplicateActions(actions: ActionRecommendation[]): ActionRecommendation[] {
  const seen = new Map<string, ActionRecommendation>();
  
  for (const action of actions) {
    const key = action.gs1Standards.sort().join(',') || action.action;
    if (!seen.has(key)) {
      seen.set(key, action);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Generate uncertainty disclaimer for the simulation.
 */
function generateDisclaimer(scenario: RegulatoryScenario): string {
  return `This simulation is based on ${scenario.name} as of ${scenario.lastUpdated}. ` +
    `Regulatory requirements may change. The expected date (${scenario.expectedDate}) has ` +
    `${scenario.dateConfidence} confidence. All projections involve assumptions about future ` +
    `regulatory developments. Please monitor official sources for updates.`;
}

// =============================================================================
// ROUTER DEFINITION
// =============================================================================

export const impactSimulatorRouter = router({
  /**
   * Get all available regulatory scenarios.
   */
  getScenarios: publicProcedure.query(() => {
    return REGULATORY_SCENARIOS.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      regulation: s.regulation,
      expectedDate: s.expectedDate,
      dateConfidence: s.dateConfidence,
      requirementCount: s.newRequirements.length,
      assumptionCount: s.assumptions.length,
      source: s.source,
      lastUpdated: s.lastUpdated,
    }));
  }),
  
  /**
   * Get detailed scenario information.
   */
  getScenarioDetail: publicProcedure
    .input(z.object({ scenarioId: z.string() }))
    .query(({ input }) => {
      const scenario = REGULATORY_SCENARIOS.find(s => s.id === input.scenarioId);
      if (!scenario) {
        throw new Error(`Scenario not found: ${input.scenarioId}`);
      }
      return scenario;
    }),
  
  /**
   * Run impact simulation.
   * This is the main entry point for Core 2.
   */
  simulate: publicProcedure
    .input(impactSimulationInputSchema)
    .mutation(async ({ input }) => {
      return await simulateImpact({
        scenarioId: input.scenarioId,
        manualCurrentState: input.currentState,
      });
    }),
  
  /**
   * Get available sectors for simulation.
   */
  getAvailableSectors: publicProcedure.query(() => {
    const sectors = new Set<string>();
    for (const scenario of REGULATORY_SCENARIOS) {
      for (const req of scenario.newRequirements) {
        for (const sector of req.affectedSectors) {
          if (sector !== 'all') sectors.add(sector);
        }
      }
    }
    return Array.from(sectors).sort();
  }),
  
  /**
   * Get scenarios relevant to a specific sector.
   */
  getScenariosForSector: publicProcedure
    .input(z.object({ sector: z.string() }))
    .query(({ input }) => {
      return REGULATORY_SCENARIOS.filter(scenario =>
        scenario.newRequirements.some(req =>
          req.affectedSectors.includes('all') || req.affectedSectors.includes(input.sector)
        )
      ).map(s => ({
        id: s.id,
        name: s.name,
        regulation: s.regulation,
        expectedDate: s.expectedDate,
        relevantRequirements: s.newRequirements.filter(req =>
          req.affectedSectors.includes('all') || req.affectedSectors.includes(input.sector)
        ).length,
      }));
    }),
});
