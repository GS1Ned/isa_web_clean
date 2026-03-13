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
import { publicProcedure, router } from '../_core/trpc';
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
import { buildGapAnalysisDecisionArtifact } from '../esrs-decision-artifacts.js';
import { buildGapAnalyzerSampleAttributes } from '../attribute-recommender-inventory.js';
import { mapESRSToGS1Attributes } from '../mappings/esrs-to-gs1-mapper.js';
import { ESRS_GS1_CALIBRATION_RULES } from '../mappings/esrs-gs1-calibration-data.js';
import { ESRS_GS1_MAPPING_RULES } from '../mappings/esrs-gs1-mapping-data.js';
import { collectEvidenceRefsForTerms } from '../source-provenance.js';

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

function isMissingRelationError(error: unknown, relationName: string) {
  const queue = [error];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;

    const code = 'code' in current ? String((current as { code?: unknown }).code ?? '') : '';
    const message =
      'message' in current ? String((current as { message?: unknown }).message ?? '') : '';

    if (code === '42P01' || message.includes(`relation "${relationName}" does not exist`)) {
      return true;
    }

    if ('cause' in current) {
      queue.push((current as { cause?: unknown }).cause);
    }
  }

  return false;
}

function extractRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) {
    const maybeRows = result[0];
    return Array.isArray(maybeRows) ? (maybeRows as T[]) : (result as T[]);
  }

  if (
    result &&
    typeof result === 'object' &&
    'rows' in result &&
    Array.isArray((result as { rows?: unknown }).rows)
  ) {
    return ((result as { rows: unknown[] }).rows ?? []) as T[];
  }

  return [];
}

type RequirementMappingRow = {
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
  mapping_source?: string | null;
};

type SampleAttributeRow = {
  gs1AttributeId: string | null;
  gs1AttributeName: string | null;
  confidence: string | null;
};

type StaticRequirementAttribute = {
  attributeId: string;
  attributeName: string;
  confidence: 'high' | 'medium' | 'low';
  mappingType: 'direct' | 'calculated' | 'aggregated';
  mappingNotes: string;
  mappingSource: 'ESRS_GS1_MAPPING_RULES' | 'ESRS_GS1_CALIBRATIONS';
};

function normalizeStaticDatapointId(shortName: string | null | undefined) {
  const normalized = String(shortName || '').trim().toUpperCase();
  if (!normalized) return null;
  if (/^[A-Z]\d-\d+_\d+$/.test(normalized)) return normalized;
  if (/^[A-Z]\d-\d+$/.test(normalized)) return `${normalized}_01`;
  return null;
}

function normalizeEsrsStandard(esrsStandard: string | null | undefined) {
  const normalized = String(esrsStandard || '').trim().toUpperCase();
  if (!normalized) return '';
  return normalized.replace(/^ESRS\s+/, '');
}

function normalizeMatchText(value: string | null | undefined) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const STATIC_RULE_STOPWORDS = new Set([
  'and',
  'for',
  'the',
  'with',
  'from',
  'into',
  'data',
  'supports',
  'support',
  'enables',
  'enable',
  'captures',
  'capture',
  'provides',
  'provide',
  'disclosure',
  'disclosures',
]);

function requirementTextTokens(value: string | null | undefined) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2 && !STATIC_RULE_STOPWORDS.has(part));
}

function humanizeAttributeName(attributeId: string) {
  return attributeId
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d+)/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/\bGtin\b/g, 'GTIN')
    .replace(/\bGln\b/g, 'GLN')
    .replace(/\bGdsn\b/g, 'GDSN')
    .replace(/\bGhg\b/g, 'GHG')
    .replace(/\bSscc\b/g, 'SSCC')
    .replace(/\bDpp\b/g, 'DPP')
    .trim();
}

function confidenceLevelFromScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.85) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

function mappingTypeFromStaticRule(
  score: number,
  dataType: 'narrative' | 'monetary' | 'percentage' | 'date' | 'boolean' | 'quantitative',
): 'direct' | 'calculated' | 'aggregated' {
  if (score >= 0.85) return 'direct';
  if (dataType === 'narrative') return 'aggregated';
  return 'calculated';
}

function getCalibratedAttributesForRequirement(row: RequirementMappingRow): StaticRequirementAttribute[] {
  const rowStandard = normalizeEsrsStandard(row.esrs_standard);
  if (!rowStandard) return [];

  const shortName = normalizeMatchText(row.short_name);
  const requirement = normalizeMatchText(row.data_point_name);
  const definition = normalizeMatchText(row.definition);

  for (const rule of ESRS_GS1_CALIBRATION_RULES) {
    if (normalizeEsrsStandard(rule.esrsStandard) !== rowStandard) continue;

    const shortNameMatch = !rule.shortNamePhrases?.length || rule.shortNamePhrases.some((phrase) => shortName.includes(normalizeMatchText(phrase)));
    const requirementMatch = !rule.requirementPhrases?.length || rule.requirementPhrases.some((phrase) => requirement.includes(normalizeMatchText(phrase)));
    const definitionMatch = !rule.definitionPhrases?.length || rule.definitionPhrases.some((phrase) => definition.includes(normalizeMatchText(phrase)));

    if (!shortNameMatch || !requirementMatch || !definitionMatch) continue;

    return rule.attributes.map((attribute) => ({
      attributeId: attribute.attributeId,
      attributeName: attribute.attributeName,
      confidence: attribute.mappingConfidence,
      mappingType: attribute.mappingType,
      mappingNotes: `${attribute.implementationNotes} ${rule.rationale}`,
      mappingSource: 'ESRS_GS1_CALIBRATIONS',
    }));
  }

  return [];
}

function getStaticRuleAttributesForRequirement(row: RequirementMappingRow): StaticRequirementAttribute[] {
  const rowStandard = normalizeEsrsStandard(row.esrs_standard);
  if (!rowStandard) return [];

  const rowText = [row.short_name, row.data_point_name, row.definition]
    .map((value) => String(value || '').toLowerCase())
    .join(' ');
  const rowTokens = new Set([
    ...requirementTextTokens(row.short_name),
    ...requirementTextTokens(row.data_point_name),
    ...requirementTextTokens(row.definition),
  ]);

  let bestRule:
    | (typeof ESRS_GS1_MAPPING_RULES)[number]
    | null = null;
  let bestScore = 0;

  for (const rule of ESRS_GS1_MAPPING_RULES) {
    if (normalizeEsrsStandard(rule.esrs_standard) !== rowStandard) continue;

    const candidatePhrases = [rule.topic, ...(rule.matchTerms ?? [])]
      .map((value) => String(value || '').trim())
      .filter((value) => value.length > 0);

    let ruleBestScore = 0;

    for (const candidatePhrase of candidatePhrases) {
      const candidateLower = candidatePhrase.toLowerCase();
      const candidateTokens = requirementTextTokens(candidatePhrase);
      if (candidateTokens.length === 0) continue;

      const overlapCount = candidateTokens.filter((token) => rowTokens.has(token)).length;
      const overlapRatio = overlapCount / candidateTokens.length;
      const exactPhraseMatch = rowText.includes(candidateLower);
      const score =
        overlapRatio +
        (exactPhraseMatch ? 0.5 : 0) +
        (overlapCount >= 3 ? 0.15 : 0);

      if (exactPhraseMatch || overlapCount >= 2 || overlapRatio >= 0.5) {
        ruleBestScore = Math.max(ruleBestScore, score);
      }
    }

    if (ruleBestScore > bestScore) {
      bestRule = rule;
      bestScore = ruleBestScore;
    }
  }

  return (
    bestRule?.gs1Attributes.map((attribute) => ({
      attributeId: attribute.attributeName,
      attributeName: humanizeAttributeName(attribute.attributeName),
      confidence: confidenceLevelFromScore(attribute.mappingConfidence),
      mappingType: mappingTypeFromStaticRule(attribute.mappingConfidence, attribute.data_type),
      mappingNotes: `Heuristic static fallback from ESRS_GS1_MAPPING_RULES (${attribute.gs1Standard}): ${attribute.mappingReason}`,
      mappingSource: 'ESRS_GS1_MAPPING_RULES',
    })) ?? []
  );
}

async function applyStaticAttributeFallback(rows: RequirementMappingRow[]) {
  const datapointIds = Array.from(
    new Set(
      rows
        .map((row) => normalizeStaticDatapointId(row.short_name))
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  );
  const staticMappings = datapointIds.length
    ? await mapESRSToGS1Attributes(datapointIds, {
        includeLowConfidence: true,
        maxAttributesPerDatapoint: 3,
      })
    : [];
  const mappingsByDatapointId = new Map(
    staticMappings.map((mapping) => [mapping.esrsDatapointId, mapping.gs1Attributes]),
  );

  return rows.flatMap((row) => {
    const calibratedAttributes = getCalibratedAttributesForRequirement(row);
    if (calibratedAttributes.length > 0) {
      return calibratedAttributes.map((attribute) => ({
        ...row,
        gs1_attribute_id: attribute.attributeId,
        gs1_attribute_name: attribute.attributeName,
        mapping_type: attribute.mappingType,
        mapping_notes: attribute.mappingNotes,
        confidence: attribute.confidence,
        mapping_source: attribute.mappingSource,
      }));
    }

    const datapointId = normalizeStaticDatapointId(row.short_name);
    const attributes = datapointId
      ? mappingsByDatapointId.get(datapointId) ?? getStaticRuleAttributesForRequirement(row)
      : getStaticRuleAttributesForRequirement(row);
    if (attributes.length === 0) {
      return [row];
    }

    return attributes.map((attribute) => ({
      ...row,
      gs1_attribute_id: attribute.attributeId,
      gs1_attribute_name: attribute.attributeName,
      mapping_type: attribute.mappingType,
      mapping_notes: attribute.mappingNotes,
      confidence: attribute.confidence,
      mapping_source: attribute.mappingSource,
    }));
  });
}

function buildStaticSampleAttributeRows(): SampleAttributeRow[] {
  const byAttributeId = new Map<string, SampleAttributeRow & { confidenceRank: number }>();

  for (const rule of ESRS_GS1_CALIBRATION_RULES) {
    for (const attribute of rule.attributes) {
      const confidenceRank = attribute.mappingConfidence === 'high' ? 3 : attribute.mappingConfidence === 'medium' ? 2 : 1;
      const existing = byAttributeId.get(attribute.attributeId);
      if (!existing || confidenceRank > existing.confidenceRank) {
        byAttributeId.set(attribute.attributeId, {
          gs1AttributeId: attribute.attributeId,
          gs1AttributeName: attribute.attributeName,
          confidence: attribute.mappingConfidence,
          confidenceRank,
        });
      }
    }
  }

  for (const rule of ESRS_GS1_MAPPING_RULES) {
    for (const attribute of rule.gs1Attributes) {
      const confidence = confidenceLevelFromScore(attribute.mappingConfidence);
      const confidenceRank = confidence === 'high' ? 3 : confidence === 'medium' ? 2 : 1;
      const existing = byAttributeId.get(attribute.attributeName);
      if (!existing || confidenceRank > existing.confidenceRank) {
        byAttributeId.set(attribute.attributeName, {
          gs1AttributeId: attribute.attributeName,
          gs1AttributeName: humanizeAttributeName(attribute.attributeName),
          confidence,
          confidenceRank,
        });
      }
    }
  }

  return Array.from(byAttributeId.values())
    .sort((left, right) => right.confidenceRank - left.confidenceRank || String(left.gs1AttributeName).localeCompare(String(right.gs1AttributeName)))
    .map(({ confidenceRank: _confidenceRank, ...row }) => row);
}

/**
 * Get all ESRS requirements with their GS1 attribute mappings.
 */
async function getEsrsRequirementsWithMappings() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const selectWithJoin = sql`
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
  `;

  const selectWithoutJoin = sql`
    SELECT
      m.mapping_id,
      m.level,
      m.esrs_standard,
      m.esrs_topic,
      m.data_point_name,
      m.short_name,
      m.definition,
      m.gs1_relevance,
      null as gs1_attribute_id,
      null as gs1_attribute_name,
      null as mapping_type,
      null as mapping_notes,
      null as confidence
    FROM gs1_esrs_mappings m
    ORDER BY m.esrs_standard, m.mapping_id
  `;

  try {
    const result = await db.execute(selectWithJoin);
    return extractRows<RequirementMappingRow>(result);
  } catch (error) {
    if (!isMissingRelationError(error, 'gs1_attribute_esrs_mapping')) {
      throw error;
    }

    const fallback = await db.execute(selectWithoutJoin);
    return applyStaticAttributeFallback(extractRows<RequirementMappingRow>(fallback));
  }
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
  
  return extractRows<{ esrs_standard: string }>(result).map(r => r.esrs_standard);
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
  
  return extractRows<{ sector: string }>(result).map(r => r.sector);
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
  
  for (const [_mappingId, data] of Array.from(requirementMap.entries())) {
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

  const overallEpistemic = {
    factCount: epistemicMarkers.filter(m => m.status === 'fact').length,
    inferenceCount: epistemicMarkers.filter(m => m.status === 'inference').length,
    uncertainCount: epistemicMarkers.filter(m => m.status === 'uncertain').length,
    overallConfidence: calculateOverallConfidence(epistemicMarkers),
  };

  const evidenceTerms = Array.from(
    new Set([
      ...(input.targetRegulations ?? []),
      ...criticalGaps.flatMap((gap) => [gap.esrsStandard, gap.shortName, gap.requirement]),
      ...highGaps.flatMap((gap) => [gap.esrsStandard, gap.shortName, gap.requirement]),
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)),
  );

  const evidenceRefs = await collectEvidenceRefsForTerms({
    terms: evidenceTerms,
    preferredSourceTypes: ['regulation', 'esrs_datapoint', 'standard'],
    limit: 6,
  });

  const decisionArtifact = buildGapAnalysisDecisionArtifact({
    generatedAt: timestamp,
    sector: input.sector,
    companySize: input.companySize,
    targetRegulations: input.targetRegulations,
    totalRequirements,
    coveragePercentage,
    criticalGapCount: criticalGaps.length,
    highGapCount: highGaps.length,
    remediationPathCount: remediationPaths.length,
    criticalGapIds: criticalGaps.map((gap) => gap.id),
    factCount: overallEpistemic.factCount,
    inferenceCount: overallEpistemic.inferenceCount,
    uncertainCount: overallEpistemic.uncertainCount,
    overallConfidence: overallEpistemic.overallConfidence,
    dataSources: Array.from(
      new Set([
        'gs1_esrs_mappings',
        ...(requirementsWithMappings.some((row) => row.mapping_source === 'ESRS_GS1_MAPPING_RULES')
          ? ['ESRS_GS1_MAPPING_RULES']
          : []),
        ...(requirementsWithMappings.some((row) => row.mapping_source === 'ESRS_GS1_CALIBRATIONS')
          ? ['ESRS_GS1_CALIBRATIONS']
          : []),
        ...(!requirementsWithMappings.some(
          (row) =>
            row.mapping_source === 'ESRS_GS1_MAPPING_RULES' ||
            row.mapping_source === 'ESRS_GS1_CALIBRATIONS',
        )
          ? ['gs1_attribute_esrs_mapping']
          : []),
      ]),
    ),
    evidenceRefs,
  });
  
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
    overallEpistemic,
    decisionArtifact,
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

    try {
      const result = await db.execute(sql`
        SELECT DISTINCT
          gs1_attribute_id as gs1AttributeId,
          gs1_attribute_name as gs1AttributeName,
          confidence
        FROM gs1_attribute_esrs_mapping
        ORDER BY confidence DESC, gs1_attribute_name
        LIMIT 50
      `);

      return buildGapAnalyzerSampleAttributes(
        extractRows<{
          gs1AttributeId: string | null;
          gs1AttributeName: string | null;
          confidence: string | null;
        }>(result)
      );
    } catch (error) {
      if (!isMissingRelationError(error, 'gs1_attribute_esrs_mapping')) {
        throw error;
      }

      try {
        const fallback = await db.execute(sql`
          SELECT DISTINCT
            attribute_code as gs1AttributeId,
            attribute_name as gs1AttributeName,
            'low' as confidence
          FROM gs1_attributes
          ORDER BY attribute_name
          LIMIT 50
        `);
        const fallbackRows = extractRows<SampleAttributeRow>(fallback);
        if (fallbackRows.length > 0) {
          return buildGapAnalyzerSampleAttributes(fallbackRows);
        }
        return buildGapAnalyzerSampleAttributes(buildStaticSampleAttributeRows());
      } catch (fallbackError) {
        if (!isMissingRelationError(fallbackError, 'gs1_attributes')) {
          throw fallbackError;
        }
        return buildGapAnalyzerSampleAttributes(buildStaticSampleAttributeRows());
      }
    }
  }),
});
