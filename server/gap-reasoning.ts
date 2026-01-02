/**
 * Gap Reasoning Primitives
 * 
 * Shared types and functions for the Dual-Core PoC:
 * - Core 1: Compliance Gap Analyzer (present-state certainty)
 * - Core 2: Regulatory Change Impact Simulator (future-state reasoning)
 * 
 * Key Design Principle: Clear epistemic markers distinguish facts from inferences.
 */

// =============================================================================
// EPISTEMIC STATUS TYPES
// =============================================================================

/**
 * Epistemic status markers for all reasoning outputs.
 * These are critical for distinguishing present certainty from future uncertainty.
 */
export type EpistemicStatus = 
  | 'fact'        // Grounded in database records or official documents
  | 'inference'   // Derived from rules applied to facts
  | 'uncertain';  // Involves assumptions about future states

/**
 * Confidence level for inferences and recommendations.
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Base interface for all reasoning outputs with epistemic markers.
 */
export interface EpistemicMarker {
  status: EpistemicStatus;
  confidence: ConfidenceLevel;
  basis: string;  // What this conclusion is based on (e.g., "ESRS E1-3 mapping")
}

// =============================================================================
// CORE 1: COMPLIANCE GAP ANALYZER TYPES
// =============================================================================

/**
 * Input for gap analysis - what the user provides.
 */
export interface GapAnalysisInput {
  sector: string;
  companySize: 'large' | 'sme' | 'micro';
  currentGs1Coverage: string[];  // List of GS1 attribute IDs the company currently uses
  targetRegulations?: string[];  // Optional: specific regulations to analyze (default: all)
}

/**
 * A single compliance gap identified.
 */
export interface ComplianceGap {
  id: string;
  esrsStandard: string;
  esrsTopic: string;
  requirement: string;
  shortName: string;
  definition: string;
  
  // Gap details
  gapType: 'missing_attribute' | 'partial_coverage' | 'low_confidence_mapping';
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // What GS1 attributes could fill this gap
  suggestedAttributes: SuggestedAttribute[];
  
  // Epistemic markers
  epistemic: EpistemicMarker;
  
  // Explanation
  explanation: string;
}

/**
 * A GS1 attribute suggested to fill a gap.
 */
export interface SuggestedAttribute {
  attributeId: string;
  attributeName: string;
  mappingType: 'direct' | 'calculated' | 'aggregated';
  mappingConfidence: ConfidenceLevel;
  implementationNotes: string;
}

/**
 * Remediation path for a gap.
 */
export interface RemediationPath {
  gapId: string;
  steps: RemediationStep[];
  estimatedEffort: 'low' | 'medium' | 'high';
  dependencies: string[];
  epistemic: EpistemicMarker;
}

/**
 * A single step in a remediation path.
 */
export interface RemediationStep {
  order: number;
  action: string;
  description: string;
  gs1Standard?: string;
  estimatedDuration?: string;
}

/**
 * Complete output from Core 1 gap analysis.
 */
export interface GapAnalysisResult {
  input: GapAnalysisInput;
  timestamp: string;
  
  // Summary statistics
  summary: {
    totalRequirements: number;
    coveredRequirements: number;
    partialCoverage: number;
    gaps: number;
    coveragePercentage: number;
  };
  
  // Detailed gaps by priority
  criticalGaps: ComplianceGap[];
  highGaps: ComplianceGap[];
  mediumGaps: ComplianceGap[];
  lowGaps: ComplianceGap[];
  
  // Remediation recommendations
  remediationPaths: RemediationPath[];
  
  // Overall epistemic status
  overallEpistemic: {
    factCount: number;
    inferenceCount: number;
    uncertainCount: number;
    overallConfidence: ConfidenceLevel;
  };
}

// =============================================================================
// CORE 2: REGULATORY CHANGE IMPACT SIMULATOR TYPES
// =============================================================================

/**
 * A regulatory scenario for impact simulation.
 */
export interface RegulatoryScenario {
  id: string;
  name: string;
  description: string;
  regulation: string;  // e.g., "DPP", "CS3D", "ESPR"
  
  // Timeline
  expectedDate: string;
  dateConfidence: ConfidenceLevel;
  
  // Changes this scenario introduces
  newRequirements: ScenarioRequirement[];
  modifiedRequirements: ScenarioRequirement[];
  
  // Assumptions
  assumptions: ScenarioAssumption[];
  
  // Source/basis
  source: string;
  lastUpdated: string;
}

/**
 * A requirement within a scenario.
 */
export interface ScenarioRequirement {
  id: string;
  description: string;
  gs1Impact: string;
  affectedSectors: string[];
  mandatory: boolean;
  effectiveDate?: string;
}

/**
 * An explicit assumption in a scenario.
 */
export interface ScenarioAssumption {
  id: string;
  assumption: string;
  rationale: string;
  confidence: ConfidenceLevel;
  alternatives: string[];
}

/**
 * Input for impact simulation.
 */
export interface ImpactSimulationInput {
  scenarioId: string;
  currentState?: GapAnalysisResult;  // Optional: output from Core 1
  manualCurrentState?: {
    sector: string;
    companySize: 'large' | 'sme' | 'micro';
    currentGs1Coverage: string[];
  };
}

/**
 * A projected future gap.
 */
export interface ProjectedGap {
  id: string;
  requirement: ScenarioRequirement;
  currentStatus: 'covered' | 'partial' | 'not_covered';
  futureStatus: 'will_be_covered' | 'at_risk' | 'gap';
  
  // What changes
  changeDescription: string;
  
  // Epistemic markers - always 'uncertain' for future projections
  epistemic: EpistemicMarker;
}

/**
 * An action recommendation from impact simulation.
 */
export interface ActionRecommendation {
  id: string;
  type: 'no_regret' | 'contingent';
  action: string;
  description: string;
  
  // For no-regret actions
  benefitsEvenIfScenarioChanges?: string;
  
  // For contingent actions
  triggerCondition?: string;
  waitUntil?: string;
  
  // Implementation
  gs1Standards: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  
  // Epistemic markers
  epistemic: EpistemicMarker;
}

/**
 * Complete output from Core 2 impact simulation.
 */
export interface ImpactSimulationResult {
  input: ImpactSimulationInput;
  scenario: RegulatoryScenario;
  timestamp: string;
  
  // Current vs Future comparison
  comparison: {
    currentCoverage: number;
    projectedCoverage: number;
    newGapsCount: number;
    resolvedGapsCount: number;
  };
  
  // Projected gaps
  projectedGaps: ProjectedGap[];
  
  // Action recommendations
  noRegretActions: ActionRecommendation[];
  contingentActions: ActionRecommendation[];
  
  // Explicit assumptions and uncertainties
  activeAssumptions: ScenarioAssumption[];
  uncertaintyDisclaimer: string;
  
  // Overall epistemic status
  overallEpistemic: {
    factCount: number;
    inferenceCount: number;
    uncertainCount: number;
    overallConfidence: ConfidenceLevel;
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determine gap priority based on ESRS standard and mapping confidence.
 */
export function determineGapPriority(
  esrsStandard: string,
  hasAnyMapping: boolean,
  mappingConfidence?: ConfidenceLevel
): 'critical' | 'high' | 'medium' | 'low' {
  // E1 (Climate) and E5 (Resource use) are critical for most companies
  const criticalStandards = ['ESRS E1', 'ESRS E5', 'ESRS S1'];
  const highStandards = ['ESRS E2', 'ESRS E3', 'ESRS E4', 'ESRS G1'];
  
  if (!hasAnyMapping) {
    if (criticalStandards.some(s => esrsStandard.startsWith(s))) return 'critical';
    if (highStandards.some(s => esrsStandard.startsWith(s))) return 'high';
    return 'medium';
  }
  
  // Has mapping but low confidence
  if (mappingConfidence === 'low') {
    if (criticalStandards.some(s => esrsStandard.startsWith(s))) return 'high';
    return 'medium';
  }
  
  return 'low';
}

/**
 * Create an epistemic marker for a fact (database record).
 */
export function createFactMarker(basis: string): EpistemicMarker {
  return {
    status: 'fact',
    confidence: 'high',
    basis,
  };
}

/**
 * Create an epistemic marker for an inference.
 */
export function createInferenceMarker(
  basis: string,
  confidence: ConfidenceLevel
): EpistemicMarker {
  return {
    status: 'inference',
    confidence,
    basis,
  };
}

/**
 * Create an epistemic marker for uncertain future projections.
 */
export function createUncertainMarker(
  basis: string,
  confidence: ConfidenceLevel = 'low'
): EpistemicMarker {
  return {
    status: 'uncertain',
    confidence,
    basis,
  };
}

/**
 * Calculate overall confidence from a set of epistemic markers.
 */
export function calculateOverallConfidence(
  markers: EpistemicMarker[]
): ConfidenceLevel {
  if (markers.length === 0) return 'low';
  
  const uncertainCount = markers.filter(m => m.status === 'uncertain').length;
  const lowConfidenceCount = markers.filter(m => m.confidence === 'low').length;
  
  // If more than 30% uncertain or low confidence, overall is low
  if ((uncertainCount + lowConfidenceCount) / markers.length > 0.3) return 'low';
  
  // If more than 50% high confidence facts, overall is high
  const highFactCount = markers.filter(
    m => m.status === 'fact' && m.confidence === 'high'
  ).length;
  if (highFactCount / markers.length > 0.5) return 'high';
  
  return 'medium';
}

/**
 * Generate explanation for a gap based on its type and context.
 */
export function generateGapExplanation(
  gapType: ComplianceGap['gapType'],
  esrsStandard: string,
  requirement: string,
  suggestedAttributes: SuggestedAttribute[]
): string {
  switch (gapType) {
    case 'missing_attribute':
      return `No GS1 attributes in your current coverage map to ${esrsStandard} requirement "${requirement}". ` +
        (suggestedAttributes.length > 0
          ? `Consider implementing: ${suggestedAttributes.map(a => a.attributeName).join(', ')}.`
          : 'This requirement may need custom data collection outside standard GS1 attributes.');
    
    case 'partial_coverage':
      return `Your current GS1 coverage partially addresses ${esrsStandard} requirement "${requirement}", ` +
        `but additional attributes are needed for full compliance.`;
    
    case 'low_confidence_mapping':
      return `While there are GS1 attributes that may satisfy ${esrsStandard} requirement "${requirement}", ` +
        `the mapping confidence is low. Manual verification is recommended.`;
    
    default:
      return `Gap identified for ${esrsStandard} requirement "${requirement}".`;
  }
}

/**
 * Sector-specific relevance scoring for ESRS standards.
 */
export const SECTOR_ESRS_RELEVANCE: Record<string, string[]> = {
  'food_beverage': ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E4', 'ESRS E5', 'ESRS S1', 'ESRS S2'],
  'retail': ['ESRS E1', 'ESRS E5', 'ESRS S1', 'ESRS S2', 'ESRS S4'],
  'healthcare': ['ESRS E1', 'ESRS E2', 'ESRS E5', 'ESRS S1', 'ESRS S3'],
  'manufacturing': ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E5', 'ESRS S1'],
  'logistics': ['ESRS E1', 'ESRS E4', 'ESRS S1', 'ESRS S2'],
  'construction': ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E5', 'ESRS S1'],
  'agriculture': ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E4', 'ESRS E5', 'ESRS S1'],
  'textiles': ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E5', 'ESRS S1', 'ESRS S2'],
  'electronics': ['ESRS E1', 'ESRS E2', 'ESRS E5', 'ESRS S1', 'ESRS S2'],
  'chemicals': ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E4', 'ESRS S1'],
  'general': ['ESRS E1', 'ESRS E5', 'ESRS S1', 'ESRS G1'],
};

/**
 * Company size thresholds for CSRD applicability.
 */
export const COMPANY_SIZE_THRESHOLDS = {
  large: {
    employees: 250,
    turnover: 50_000_000,  // EUR
    assets: 25_000_000,    // EUR
    csrdApplicable: true,
    phaseInYear: 2024,
  },
  sme: {
    employees: 50,
    turnover: 10_000_000,
    assets: 5_000_000,
    csrdApplicable: true,  // Listed SMEs
    phaseInYear: 2026,
  },
  micro: {
    employees: 10,
    turnover: 700_000,
    assets: 350_000,
    csrdApplicable: false,  // Generally exempt
    phaseInYear: null,
  },
};
