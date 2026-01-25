/**
 * Gap Analyzer Router (Core 1)
 * 
 * Compliance Gap Analyzer - Present-State Certainty
 * 
 * This router provides gap analysis based on:
 * - Current GS1 attribute coverage
 * - ESRS requirements from the database
 * - GS1-ESRS mappings
 * 
 * Key principle: All outputs are grounded in database facts with clear
 * epistemic markers distinguishing facts from inferences.
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db.js';
import { sql } from 'drizzle-orm';
import {
  type GapAnalysisInput,
  type GapAnalysisResult,
  type ComplianceGap,
  type SuggestedAttribute,
  type RemediationPath,
  type RemediationStep,
  type EpistemicMarker,
  determineGapPriority,
  createFactMarker,
  createInferenceMarker,
  generateGapExplanation,
  calculateOverallConfidence,
  SECTOR_ESRS_RELEVANCE,
  COMPANY_SIZE_THRESHOLDS,
} from '../gap-reasoning.js';

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const gapAnalysisInputSchema = z.object({
  sector: z.string(),
  companySize: z.enum(['large', 'sme', 'micro']),
  currentGs1Coverage: z.array(z.string()),
  targetRegulations: z.array(z.string()).optional(),
});

// =============================================================================
// DATABASE QUERIES
// =============================================================================

/**
 * Get all ESRS requirements with their GS1 attribute mappings.
 */
async function getEsrsRequirementsWithMappings() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    SELECT 
      m.mapping_id,
      m.level,
      m.esrs_standard,
      m.esrs_topic,
      m.data_point_name,
      m.short_name,
      m.definition,
      m.gs1_relevance,
      a.gs1_attribute_id,
      a.gs1_attribute_name,
      a.mapping_type,
      a.mapping_notes,
      a.confidence
    FROM gs1_esrs_mappings m
    LEFT JOIN gs1_attribute_esrs_mapping a ON m.mapping_id = a.esrs_mapping_id
    ORDER BY m.esrs_standard, m.mapping_id
  `);
  
  return (result[0] as unknown) as Array<{
    mapping_id: number;
    level: string;
    esrs_standard: string;
    esrs_topic: string;
    data_point_name: string;
    short_name: string;
    definition: string;
    gs1_relevance: string;
    gs1_attribute_id: string | null;
    gs1_attribute_name: string | null;
    mapping_type: string | null;
    mapping_notes: string | null;
    confidence: string | null;
  }>;
}

/**
 * Get unique ESRS standards in the database.
 */
async function getAvailableEsrsStandards() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    SELECT DISTINCT esrs_standard 
    FROM gs1_esrs_mappings 
    ORDER BY esrs_standard
  `);
  
  return ((result[0] as unknown) as Array<{ esrs_standard: string }>).map(r => r.esrs_standard);
}

/**
 * Get available sectors from GS1 attributes.
 */
async function getAvailableSectors() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    SELECT DISTINCT sector FROM gs1_attributes ORDER BY sector
  `);
  
  return ((result[0] as unknown) as Array<{ sector: string }>).map(r => r.sector);
}

// =============================================================================
// GAP ANALYSIS LOGIC
// =============================================================================

/**
 * Perform gap analysis based on input parameters.
 */
async function performGapAnalysis(input: GapAnalysisInput): Promise<GapAnalysisResult> {
  const timestamp = new Date().toISOString();
  
  // Get all ESRS requirements with mappings
  const requirementsWithMappings = await getEsrsRequirementsWithMappings();
  
  // Group by requirement (mapping_id)
  const requirementMap = new Map<number, {
    requirement: typeof requirementsWithMappings[0];
    attributes: Array<{
      gs1_attribute_id: string;
      gs1_attribute_name: string;
      mapping_type: string;
      mapping_notes: string | null;
      confidence: string;
    }>;
  }>();
  
  for (const row of requirementsWithMappings) {
    if (!requirementMap.has(row.mapping_id)) {
      requirementMap.set(row.mapping_id, {
        requirement: row,
        attributes: [],
      });
    }
    if (row.gs1_attribute_id) {
      requirementMap.get(row.mapping_id)!.attributes.push({
        gs1_attribute_id: row.gs1_attribute_id,
        gs1_attribute_name: row.gs1_attribute_name!,
        mapping_type: row.mapping_type!,
        mapping_notes: row.mapping_notes,
        confidence: row.confidence!,
      });
    }
  }
  
  // Filter by sector relevance if applicable
  const relevantStandards = SECTOR_ESRS_RELEVANCE[input.sector] || SECTOR_ESRS_RELEVANCE['general'];
  
  // Analyze gaps
  const gaps: ComplianceGap[] = [];
  const epistemicMarkers: EpistemicMarker[] = [];
  let coveredCount = 0;
  let partialCount = 0;
  
  for (const [mappingId, data] of Array.from(requirementMap.entries())) {
    const { requirement, attributes } = data;
    
    // Check if this standard is relevant for the sector
    const isRelevant = relevantStandards.some(s => requirement.esrs_standard.startsWith(s));
    if (!isRelevant && input.sector !== 'general') continue;
    
    // Check coverage
    const coveredAttributes = attributes.filter(a => 
      input.currentGs1Coverage.includes((a as { gs1_attribute_id: string }).gs1_attribute_id)
    );
    
    const totalMappedAttributes = attributes.length;
    const coveredMappedAttributes = coveredAttributes.length;
    
    if (totalMappedAttributes === 0) {
      // No GS1 mapping exists - this is a gap
      const gap = createGap(
        requirement,
        'missing_attribute',
        [],
        attributes
      );
      gaps.push(gap);
      epistemicMarkers.push(gap.epistemic);
    } else if (coveredMappedAttributes === 0) {
      // Has mappings but none covered - gap
      const gap = createGap(
        requirement,
        'missing_attribute',
        coveredAttributes,
        attributes
      );
      gaps.push(gap);
      epistemicMarkers.push(gap.epistemic);
    } else if (coveredMappedAttributes < totalMappedAttributes) {
      // Partial coverage
      partialCount++;
      const lowestConfidence = getLowestConfidence(coveredAttributes);
      if (lowestConfidence === 'low') {
        const gap = createGap(
          requirement,
          'low_confidence_mapping',
          coveredAttributes,
          attributes
        );
        gaps.push(gap);
        epistemicMarkers.push(gap.epistemic);
      }
    } else {
      // Fully covered
      coveredCount++;
      epistemicMarkers.push(createFactMarker(`Covered by ${coveredMappedAttributes} GS1 attributes`));
    }
  }
  
  // Sort gaps by priority
  const criticalGaps = gaps.filter(g => g.priority === 'critical');
  const highGaps = gaps.filter(g => g.priority === 'high');
  const mediumGaps = gaps.filter(g => g.priority === 'medium');
  const lowGaps = gaps.filter(g => g.priority === 'low');
  
  // Generate remediation paths for critical and high gaps
  const remediationPaths = generateRemediationPaths([...criticalGaps, ...highGaps]);
  
  // Calculate summary
  const totalRequirements = requirementMap.size;
  const coveragePercentage = totalRequirements > 0 
    ? Math.round((coveredCount / totalRequirements) * 100) 
    : 0;
  
  return {
    input,
    timestamp,
    summary: {
      totalRequirements,
      coveredRequirements: coveredCount,
      partialCoverage: partialCount,
      gaps: gaps.length,
      coveragePercentage,
    },
    criticalGaps,
    highGaps,
    mediumGaps,
    lowGaps,
    remediationPaths,
    overallEpistemic: {
      factCount: epistemicMarkers.filter(m => m.status === 'fact').length,
      inferenceCount: epistemicMarkers.filter(m => m.status === 'inference').length,
      uncertainCount: epistemicMarkers.filter(m => m.status === 'uncertain').length,
      overallConfidence: calculateOverallConfidence(epistemicMarkers),
    },
  };
}

/**
 * Create a ComplianceGap object.
 */
function createGap(
  requirement: {
    mapping_id: number;
    esrs_standard: string;
    esrs_topic: string;
    short_name: string;
    definition: string;
    data_point_name: string;
  },
  gapType: ComplianceGap['gapType'],
  coveredAttributes: Array<{ gs1_attribute_id: string; gs1_attribute_name: string; mapping_type: string; confidence: string }>,
  allAttributes: Array<{ gs1_attribute_id: string; gs1_attribute_name: string; mapping_type: string; mapping_notes: string | null; confidence: string }>
): ComplianceGap {
  const suggestedAttributes: SuggestedAttribute[] = allAttributes
    .filter(a => !coveredAttributes.some(c => c.gs1_attribute_id === a.gs1_attribute_id))
    .map(a => ({
      attributeId: a.gs1_attribute_id,
      attributeName: a.gs1_attribute_name,
      mappingType: a.mapping_type as 'direct' | 'calculated' | 'aggregated',
      mappingConfidence: a.confidence as 'high' | 'medium' | 'low',
      implementationNotes: a.mapping_notes || '',
    }));
  
  const hasAnyMapping = allAttributes.length > 0;
  const lowestConfidence = getLowestConfidence(allAttributes);
  const priority = determineGapPriority(
    requirement.esrs_standard,
    hasAnyMapping,
    lowestConfidence as 'high' | 'medium' | 'low' | undefined
  );
  
  const explanation = generateGapExplanation(
    gapType,
    requirement.esrs_standard,
    requirement.short_name,
    suggestedAttributes
  );
  
  // Epistemic marker based on gap type
  const epistemic = gapType === 'missing_attribute' && allAttributes.length === 0
    ? createFactMarker(`No GS1-ESRS mapping exists for ${requirement.esrs_standard} ${requirement.short_name}`)
    : createInferenceMarker(
        `Gap inferred from coverage analysis against ${allAttributes.length} mapped attributes`,
        lowestConfidence as 'high' | 'medium' | 'low' || 'medium'
      );
  
  return {
    id: `gap-${requirement.mapping_id}`,
    esrsStandard: requirement.esrs_standard,
    esrsTopic: requirement.esrs_topic,
    requirement: requirement.data_point_name,
    shortName: requirement.short_name,
    definition: requirement.definition,
    gapType,
    priority,
    suggestedAttributes,
    epistemic,
    explanation,
  };
}

/**
 * Get the lowest confidence level from a set of attributes.
 */
function getLowestConfidence(
  attributes: Array<{ confidence: string }>
): 'high' | 'medium' | 'low' | undefined {
  if (attributes.length === 0) return undefined;
  
  const confidenceLevels = ['low', 'medium', 'high'];
  let lowestIndex = 2; // Start with 'high'
  
  for (const attr of attributes) {
    const index = confidenceLevels.indexOf(attr.confidence);
    if (index !== -1 && index < lowestIndex) {
      lowestIndex = index;
    }
  }
  
  return confidenceLevels[lowestIndex] as 'high' | 'medium' | 'low';
}

/**
 * Generate remediation paths for gaps.
 */
function generateRemediationPaths(gaps: ComplianceGap[]): RemediationPath[] {
  return gaps.slice(0, 10).map(gap => {
    const steps: RemediationStep[] = [];
    let stepOrder = 1;
    
    // Step 1: Assess current data availability
    steps.push({
      order: stepOrder++,
      action: 'Assess Data Availability',
      description: `Review your current product data to identify if ${gap.esrsStandard} "${gap.shortName}" data exists in any form.`,
    });
    
    // Step 2: Implement suggested GS1 attributes
    if (gap.suggestedAttributes.length > 0) {
      const primaryAttr = gap.suggestedAttributes[0];
      steps.push({
        order: stepOrder++,
        action: 'Implement GS1 Attribute',
        description: `Add ${primaryAttr.attributeName} (${primaryAttr.attributeId}) to your product data model.`,
        gs1Standard: 'GDSN',
        estimatedDuration: '2-4 weeks',
      });
      
      if (primaryAttr.mappingType === 'calculated' || primaryAttr.mappingType === 'aggregated') {
        steps.push({
          order: stepOrder++,
          action: 'Configure Calculation Logic',
          description: `Set up ${primaryAttr.mappingType} logic to derive ${primaryAttr.attributeName} from source data.`,
          estimatedDuration: '1-2 weeks',
        });
      }
    }
    
    // Step 3: Validate and test
    steps.push({
      order: stepOrder++,
      action: 'Validate Compliance',
      description: `Verify that the implemented data satisfies ${gap.esrsStandard} requirement "${gap.shortName}".`,
      estimatedDuration: '1 week',
    });
    
    // Calculate effort based on number of attributes and gap type
    const estimatedEffort: 'low' | 'medium' | 'high' = 
      gap.suggestedAttributes.length === 0 ? 'high' :
      gap.suggestedAttributes.length <= 2 ? 'low' : 'medium';
    
    return {
      gapId: gap.id,
      steps,
      estimatedEffort,
      dependencies: gap.suggestedAttributes.map(a => a.attributeId),
      epistemic: createInferenceMarker(
        `Remediation path generated based on ${gap.suggestedAttributes.length} suggested attributes`,
        'medium'
      ),
    };
  });
}

// =============================================================================
// ROUTER DEFINITION
// =============================================================================

export const gapAnalyzerRouter = router({
  /**
   * Perform compliance gap analysis.
   * This is the main entry point for Core 1.
   */
  analyze: publicProcedure
    .input(gapAnalysisInputSchema)
    .mutation(async ({ input }) => {
      return await performGapAnalysis(input);
    }),
  
  /**
   * Get available sectors for gap analysis.
   */
  getAvailableSectors: publicProcedure.query(async () => {
    const dbSectors = await getAvailableSectors();
    // Combine with our predefined sectors
    const allSectors = new Set([
      ...dbSectors,
      ...Object.keys(SECTOR_ESRS_RELEVANCE),
    ]);
    return Array.from(allSectors).sort();
  }),
  
  /**
   * Get available ESRS standards.
   */
  getAvailableStandards: publicProcedure.query(async () => {
    return await getAvailableEsrsStandards();
  }),
  
  /**
   * Get company size options with CSRD applicability info.
   */
  getCompanySizeOptions: publicProcedure.query(() => {
    return Object.entries(COMPANY_SIZE_THRESHOLDS).map(([size, thresholds]) => ({
      value: size,
      label: size.charAt(0).toUpperCase() + size.slice(1),
      employees: thresholds.employees,
      turnover: thresholds.turnover,
      csrdApplicable: thresholds.csrdApplicable,
      phaseInYear: thresholds.phaseInYear,
    }));
  }),
  
  /**
   * Get a quick coverage summary without full analysis.
   */
  getQuickCoverage: publicProcedure
    .input(z.object({
      currentGs1Coverage: z.array(z.string()),
    }))
    .query(async ({ input }) => {
      const requirementsWithMappings = await getEsrsRequirementsWithMappings();
      
      // Count unique requirements
      const uniqueRequirements = new Set(requirementsWithMappings.map(r => r.mapping_id));
      
      // Count covered requirements
      const coveredRequirements = new Set<number>();
      for (const row of requirementsWithMappings) {
        if (row.gs1_attribute_id && input.currentGs1Coverage.includes(row.gs1_attribute_id)) {
          coveredRequirements.add(row.mapping_id);
        }
      }
      
      return {
        totalRequirements: uniqueRequirements.size,
        coveredRequirements: coveredRequirements.size,
        coveragePercentage: uniqueRequirements.size > 0
          ? Math.round((coveredRequirements.size / uniqueRequirements.size) * 100)
          : 0,
      };
    }),
  
  /**
   * Get sample GS1 attribute IDs for testing.
   */
  getSampleAttributes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const result = await db.execute(sql`
      SELECT DISTINCT gs1_attribute_id, gs1_attribute_name, confidence
      FROM gs1_attribute_esrs_mapping
      ORDER BY confidence DESC, gs1_attribute_name
      LIMIT 50
    `);
    
    return (result[0] as unknown) as Array<{
      gs1_attribute_id: string;
      gs1_attribute_name: string;
      confidence: string;
    }>;
  }),
});
