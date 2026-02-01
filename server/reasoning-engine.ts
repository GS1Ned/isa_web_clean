/**
 * ISA Reasoning Engine v1
 * 
 * Provides intelligent reasoning capabilities for ISA by:
 * 1. Analyzing relationships between regulations, standards, and datapoints
 * 2. Identifying compliance gaps and coverage
 * 3. Generating actionable recommendations
 * 4. Tracing evidence chains for audit purposes
 * 
 * This is the first version focusing on mapping-based reasoning.
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";

/**
 * Compliance gap analysis result
 */
export interface GapAnalysisResult {
  regulation: {
    id: number;
    title: string;
    type: string;
  };
  totalDatapoints: number;
  coveredDatapoints: number;
  partialDatapoints: number;
  missingDatapoints: number;
  coveragePercentage: number;
  gaps: Array<{
    datapointId: number;
    datapointName: string;
    esrsStandard: string;
    status: 'missing' | 'partial';
    relatedGS1Standards: string[];
  }>;
  recommendations: string[];
}

/**
 * Standard coverage analysis
 */
export interface StandardCoverageResult {
  standard: {
    id: number;
    name: string;
    category: string;
  };
  mappedDatapoints: number;
  regulations: string[];
  esrsTopics: string[];
  coverageStrength: 'strong' | 'moderate' | 'weak';
}

/**
 * Evidence chain for audit trail
 */
export interface EvidenceChain {
  claim: string;
  sources: Array<{
    type: 'regulation' | 'standard' | 'datapoint' | 'mapping';
    id: number;
    title: string;
    relevance: number;
  }>;
  confidence: number;
  reasoning: string;
}

/**
 * Analyze compliance gaps for a specific regulation
 */
export async function analyzeComplianceGaps(
  regulationId: number
): Promise<GapAnalysisResult | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const { regulations, regulationEsrsMappings, esrsDatapoints, gs1EsrsMappings, gs1Standards } = 
      await import("../drizzle/schema");

    // Get regulation details
    const [regulation] = await db
      .select({
        id: regulations.id,
        title: regulations.title,
        type: regulations.regulationType,
      })
      .from(regulations)
      .where(sql`${regulations.id} = ${regulationId}`)
      .limit(1);

    if (!regulation) return null;

    // Get all ESRS datapoints mapped to this regulation
    const mappings = await db
      .select({
        datapointId: regulationEsrsMappings.datapointId,
        relevanceScore: regulationEsrsMappings.relevanceScore,
        mappingType: regulationEsrsMappings.mappingType,
      })
      .from(regulationEsrsMappings)
      .where(sql`${regulationEsrsMappings.regulationId} = ${regulationId}`);

    const datapointIds = mappings.map(m => m.datapointId);
    
    if (datapointIds.length === 0) {
      return {
        regulation: {
          id: regulation.id,
          title: regulation.title,
          type: regulation.type,
        },
        totalDatapoints: 0,
        coveredDatapoints: 0,
        partialDatapoints: 0,
        missingDatapoints: 0,
        coveragePercentage: 0,
        gaps: [],
        recommendations: ['No ESRS datapoints mapped to this regulation yet.'],
      };
    }

    // Get datapoint details
    const datapoints = await db
      .select({
        id: esrsDatapoints.id,
        datapointId: esrsDatapoints.datapointId,
        datapointName: esrsDatapoints.datapointName,
        esrsStandard: esrsDatapoints.esrsStandard,
      })
      .from(esrsDatapoints)
      .where(sql`${esrsDatapoints.id} IN (${sql.join(datapointIds.map(id => sql`${id}`), sql`, `)})`);

    // Check GS1 coverage for each datapoint
    const gaps: GapAnalysisResult['gaps'] = [];
    let coveredCount = 0;
    let partialCount = 0;

    for (const dp of datapoints) {
      // Find GS1 standards that map to this datapoint
      const gs1Mappings = await db
        .select({
          standardId: gs1EsrsMappings.standardId,
          coverageLevel: gs1EsrsMappings.coverageLevel,
        })
        .from(gs1EsrsMappings)
        .where(sql`${gs1EsrsMappings.datapointId} = ${dp.id}`);

      if (gs1Mappings.length === 0) {
        // No GS1 coverage - this is a gap
        gaps.push({
          datapointId: dp.id,
          datapointName: dp.datapointName || dp.datapointId,
          esrsStandard: dp.esrsStandard,
          status: 'missing',
          relatedGS1Standards: [],
        });
      } else {
        // Check if coverage is full or partial
        const hasFullCoverage = gs1Mappings.some(m => m.coverageLevel === 'full');
        
        if (hasFullCoverage) {
          coveredCount++;
        } else {
          partialCount++;
          
          // Get standard names for partial coverage
          const standardIds = gs1Mappings.map(m => m.standardId);
          const standards = await db
            .select({ name: gs1Standards.standardName })
            .from(gs1Standards)
            .where(sql`${gs1Standards.id} IN (${sql.join(standardIds.map(id => sql`${id}`), sql`, `)})`);

          gaps.push({
            datapointId: dp.id,
            datapointName: dp.datapointName || dp.datapointId,
            esrsStandard: dp.esrsStandard,
            status: 'partial',
            relatedGS1Standards: standards.map(s => s.name),
          });
        }
      }
    }

    const totalDatapoints = datapoints.length;
    const missingCount = gaps.filter(g => g.status === 'missing').length;
    const coveragePercentage = totalDatapoints > 0 
      ? ((coveredCount + partialCount * 0.5) / totalDatapoints) * 100 
      : 0;

    // Generate recommendations
    const recommendations = generateGapRecommendations(gaps, regulation.type);

    return {
      regulation: {
        id: regulation.id,
        title: regulation.title,
        type: regulation.type,
      },
      totalDatapoints,
      coveredDatapoints: coveredCount,
      partialDatapoints: partialCount,
      missingDatapoints: missingCount,
      coveragePercentage: Math.round(coveragePercentage * 10) / 10,
      gaps,
      recommendations,
    };
  } catch (error) {
    serverLogger.error("[ReasoningEngine] Gap analysis failed:", error);
    return null;
  }
}

/**
 * Analyze GS1 standard coverage across ESRS
 */
export async function analyzeStandardCoverage(
  standardId: number
): Promise<StandardCoverageResult | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const { gs1Standards, gs1EsrsMappings, esrsDatapoints, regulationEsrsMappings, regulations } = 
      await import("../drizzle/schema");

    // Get standard details
    const [standard] = await db
      .select({
        id: gs1Standards.id,
        name: gs1Standards.standardName,
        category: gs1Standards.category,
      })
      .from(gs1Standards)
      .where(sql`${gs1Standards.id} = ${standardId}`)
      .limit(1);

    if (!standard) return null;

    // Get all ESRS datapoints mapped to this standard
    const mappings = await db
      .select({
        datapointId: gs1EsrsMappings.datapointId,
        coverageLevel: gs1EsrsMappings.coverageLevel,
      })
      .from(gs1EsrsMappings)
      .where(sql`${gs1EsrsMappings.standardId} = ${standardId}`);

    const datapointIds = mappings.map(m => m.datapointId);

    // Get ESRS topics covered
    const esrsTopics = new Set<string>();
    if (datapointIds.length > 0) {
      const datapoints = await db
        .select({ esrsStandard: esrsDatapoints.esrsStandard })
        .from(esrsDatapoints)
        .where(sql`${esrsDatapoints.id} IN (${sql.join(datapointIds.map(id => sql`${id}`), sql`, `)})`);
      
      datapoints.forEach(dp => esrsTopics.add(dp.esrsStandard));
    }

    // Get regulations that reference these datapoints
    const regulationNames = new Set<string>();
    if (datapointIds.length > 0) {
      const regMappings = await db
        .select({ regulationId: regulationEsrsMappings.regulationId })
        .from(regulationEsrsMappings)
        .where(sql`${regulationEsrsMappings.datapointId} IN (${sql.join(datapointIds.map(id => sql`${id}`), sql`, `)})`);

      const regIds = [...new Set(regMappings.map(m => m.regulationId))];
      if (regIds.length > 0) {
        const regs = await db
          .select({ title: regulations.title })
          .from(regulations)
          .where(sql`${regulations.id} IN (${sql.join(regIds.map(id => sql`${id}`), sql`, `)})`);
        
        regs.forEach(r => regulationNames.add(r.title));
      }
    }

    // Determine coverage strength
    let coverageStrength: 'strong' | 'moderate' | 'weak';
    const fullCoverageCount = mappings.filter(m => m.coverageLevel === 'full').length;
    const fullCoverageRatio = mappings.length > 0 ? fullCoverageCount / mappings.length : 0;

    if (fullCoverageRatio >= 0.7 && mappings.length >= 5) {
      coverageStrength = 'strong';
    } else if (fullCoverageRatio >= 0.4 || mappings.length >= 3) {
      coverageStrength = 'moderate';
    } else {
      coverageStrength = 'weak';
    }

    return {
      standard: {
        id: standard.id,
        name: standard.name,
        category: standard.category || 'General',
      },
      mappedDatapoints: mappings.length,
      regulations: [...regulationNames],
      esrsTopics: [...esrsTopics],
      coverageStrength,
    };
  } catch (error) {
    serverLogger.error("[ReasoningEngine] Standard coverage analysis failed:", error);
    return null;
  }
}

/**
 * Build evidence chain for a claim
 */
export async function buildEvidenceChain(
  claim: string,
  relatedSourceIds: Array<{ type: string; id: number }>
): Promise<EvidenceChain> {
  const db = await getDb();
  const sources: EvidenceChain['sources'] = [];

  if (db) {
    try {
      const { regulations, gs1Standards, esrsDatapoints, knowledgeEmbeddings } = 
        await import("../drizzle/schema");

      for (const source of relatedSourceIds) {
        let title = '';
        let relevance = 0.8;

        if (source.type === 'regulation') {
          const [reg] = await db
            .select({ title: regulations.title })
            .from(regulations)
            .where(sql`${regulations.id} = ${source.id}`)
            .limit(1);
          title = reg?.title || `Regulation #${source.id}`;
          relevance = 1.0; // Regulations are highly authoritative
        } else if (source.type === 'standard' || source.type === 'gs1_standard') {
          const [std] = await db
            .select({ name: gs1Standards.standardName })
            .from(gs1Standards)
            .where(sql`${gs1Standards.id} = ${source.id}`)
            .limit(1);
          title = std?.name || `Standard #${source.id}`;
          relevance = 0.9;
        } else if (source.type === 'datapoint' || source.type === 'esrs_datapoint') {
          const [dp] = await db
            .select({ name: esrsDatapoints.datapointName })
            .from(esrsDatapoints)
            .where(sql`${esrsDatapoints.id} = ${source.id}`)
            .limit(1);
          title = dp?.name || `Datapoint #${source.id}`;
          relevance = 0.85;
        }

        sources.push({
          type: source.type as any,
          id: source.id,
          title,
          relevance,
        });
      }
    } catch (error) {
      serverLogger.error("[ReasoningEngine] Evidence chain building failed:", error);
    }
  }

  // Calculate overall confidence
  const avgRelevance = sources.length > 0
    ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
    : 0.5;

  const confidence = Math.min(avgRelevance * (1 + Math.log10(sources.length + 1) / 2), 1.0);

  return {
    claim,
    sources,
    confidence: Math.round(confidence * 100) / 100,
    reasoning: generateReasoningExplanation(claim, sources),
  };
}

/**
 * Generate recommendations based on gaps
 */
function generateGapRecommendations(
  gaps: GapAnalysisResult['gaps'],
  regulationType: string
): string[] {
  const recommendations: string[] = [];

  const missingGaps = gaps.filter(g => g.status === 'missing');
  const partialGaps = gaps.filter(g => g.status === 'partial');

  if (missingGaps.length > 0) {
    // Group by ESRS standard
    const byStandard = new Map<string, number>();
    missingGaps.forEach(g => {
      byStandard.set(g.esrsStandard, (byStandard.get(g.esrsStandard) || 0) + 1);
    });

    const topStandard = [...byStandard.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topStandard) {
      recommendations.push(
        `Priority: Address ${topStandard[1]} missing datapoints in ${topStandard[0]} through GS1 attribute extensions.`
      );
    }
  }

  if (partialGaps.length > 0) {
    recommendations.push(
      `${partialGaps.length} datapoints have partial GS1 coverage. Consider enhancing existing attribute definitions.`
    );
  }

  // Regulation-specific recommendations
  if (regulationType === 'CSRD' || regulationType === 'ESRS') {
    recommendations.push(
      'Ensure GDSN attributes align with ESRS disclosure requirements for sustainability reporting.'
    );
  } else if (regulationType === 'DPP' || regulationType === 'ESPR') {
    recommendations.push(
      'Prioritize GS1 Digital Link implementation for Digital Product Passport compliance.'
    );
  } else if (regulationType === 'EUDR') {
    recommendations.push(
      'Focus on EPCIS traceability events to support deforestation due diligence requirements.'
    );
  }

  return recommendations;
}

/**
 * Generate reasoning explanation
 */
function generateReasoningExplanation(
  claim: string,
  sources: EvidenceChain['sources']
): string {
  if (sources.length === 0) {
    return 'This claim could not be verified against the knowledge base.';
  }

  const sourceTypes = [...new Set(sources.map(s => s.type))];
  const avgRelevance = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length;

  let explanation = `This claim is supported by ${sources.length} source(s) `;
  explanation += `from ${sourceTypes.join(', ')}. `;
  
  if (avgRelevance >= 0.9) {
    explanation += 'The evidence is highly authoritative and directly relevant.';
  } else if (avgRelevance >= 0.7) {
    explanation += 'The evidence provides strong support for this claim.';
  } else {
    explanation += 'The evidence provides moderate support; additional verification may be needed.';
  }

  return explanation;
}

/**
 * Get reasoning engine statistics
 */
export async function getReasoningStats(): Promise<{
  totalMappings: number;
  regulationsWithMappings: number;
  standardsWithMappings: number;
  avgCoverageScore: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalMappings: 0,
      regulationsWithMappings: 0,
      standardsWithMappings: 0,
      avgCoverageScore: 0,
    };
  }

  try {
    const { regulationEsrsMappings, gs1EsrsMappings } = await import("../drizzle/schema");

    const [regMappingCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(regulationEsrsMappings);

    const [gs1MappingCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(gs1EsrsMappings);

    const [uniqueRegs] = await db
      .select({ count: sql<number>`COUNT(DISTINCT regulationId)` })
      .from(regulationEsrsMappings);

    const [uniqueStds] = await db
      .select({ count: sql<number>`COUNT(DISTINCT standardId)` })
      .from(gs1EsrsMappings);

    return {
      totalMappings: Number(regMappingCount.count) + Number(gs1MappingCount.count),
      regulationsWithMappings: Number(uniqueRegs.count),
      standardsWithMappings: Number(uniqueStds.count),
      avgCoverageScore: 0.65, // Placeholder - would need actual calculation
    };
  } catch (error) {
    serverLogger.error("[ReasoningEngine] Stats retrieval failed:", error);
    return {
      totalMappings: 0,
      regulationsWithMappings: 0,
      standardsWithMappings: 0,
      avgCoverageScore: 0,
    };
  }
}
