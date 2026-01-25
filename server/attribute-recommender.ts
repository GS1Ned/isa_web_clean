/**
 * GS1 Attribute Recommender Engine
 * Phase 1 Enhancement: Intelligent attribute recommendations with confidence scoring
 */

import { createFactMarker, createInferenceMarker, createUncertainMarker, type EpistemicMarker } from './gap-reasoning.js';

// =============================================================================
// TYPES
// =============================================================================

export interface AttributeRecommendationInput {
  sector: string;
  productCategory?: string;
  targetRegulations?: string[];
  currentAttributes?: string[];
  companySize?: 'small' | 'medium' | 'large';
}

export interface RegulatoryRelevance {
  regulation: string;
  requirement: string;
  mappingType: 'direct' | 'indirect' | 'supportive';
}

export interface AttributeRecommendation {
  attributeId: string;
  attributeName: string;
  attributeCode: string;
  dataType: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  priorityRank: number;
  regulatoryRelevance: RegulatoryRelevance[];
  esrsDatapoints: string[];
  implementationNotes: string;
  gdsnXmlSnippet: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  recommendationRationale: string;
  epistemic: EpistemicMarker;
}

export interface AttributeRecommendationResult {
  input: AttributeRecommendationInput;
  recommendations: AttributeRecommendation[];
  summary: {
    totalRecommendations: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
    regulationsCovered: string[];
    estimatedImplementationEffort: string;
  };
  epistemic: EpistemicMarker;
  generatedAt: string;
}

// =============================================================================
// SECTOR-ATTRIBUTE MAPPINGS
// =============================================================================

const SECTOR_ATTRIBUTES: Record<string, string[]> = {
  'Food & Beverage': [
    'productCarbonFootprint',
    'waterFootprint',
    'organicCertification',
    'nutritionalInformation',
    'allergenInformation',
    'countryOfOrigin',
    'packagingMaterial',
    'recycledContentPercentage',
    'shelfLife',
    'storageConditions',
  ],
  'Retail': [
    'productCarbonFootprint',
    'recycledContentPercentage',
    'packagingMaterial',
    'countryOfOrigin',
    'supplierInformation',
    'durabilityScore',
    'repairabilityScore',
    'energyEfficiencyClass',
  ],
  'Manufacturing': [
    'productCarbonFootprint',
    'energyConsumption',
    'waterUsage',
    'wasteGenerated',
    'recycledContentPercentage',
    'hazardousSubstances',
    'supplierInformation',
    'countryOfOrigin',
  ],
  'Electronics': [
    'productCarbonFootprint',
    'energyEfficiencyClass',
    'repairabilityScore',
    'recycledContentPercentage',
    'hazardousSubstances',
    'batteryInformation',
    'endOfLifeInstructions',
    'warrantyInformation',
  ],
  'Textiles & Apparel': [
    'productCarbonFootprint',
    'waterFootprint',
    'recycledContentPercentage',
    'organicCertification',
    'countryOfOrigin',
    'materialComposition',
    'careInstructions',
    'durabilityScore',
  ],
  'Healthcare': [
    'productCarbonFootprint',
    'sterilizationMethod',
    'expirationDate',
    'storageConditions',
    'hazardousSubstances',
    'countryOfOrigin',
    'supplierInformation',
  ],
  'Agriculture': [
    'productCarbonFootprint',
    'waterFootprint',
    'organicCertification',
    'pesticideUsage',
    'countryOfOrigin',
    'harvestDate',
    'soilHealthIndicators',
  ],
};

// =============================================================================
// ATTRIBUTE METADATA
// =============================================================================

const ATTRIBUTE_METADATA: Record<string, {
  name: string;
  code: string;
  dataType: string;
  esrsDatapoints: string[];
  regulations: string[];
  effort: 'low' | 'medium' | 'high';
  xmlSnippet: string;
}> = {
  productCarbonFootprint: {
    name: 'Product Carbon Footprint',
    code: 'PCF',
    dataType: 'Measurement',
    esrsDatapoints: ['E1-3', 'E1-4', 'E1-6'],
    regulations: ['CSRD', 'DPP', 'ESPR'],
    effort: 'high',
    xmlSnippet: '<productCarbonFootprint measurementUnitCode="KGM">2.5</productCarbonFootprint>',
  },
  waterFootprint: {
    name: 'Water Footprint',
    code: 'WF',
    dataType: 'Measurement',
    esrsDatapoints: ['E3-1', 'E3-4'],
    regulations: ['CSRD', 'ESPR'],
    effort: 'medium',
    xmlSnippet: '<waterFootprint measurementUnitCode="LTR">150</waterFootprint>',
  },
  recycledContentPercentage: {
    name: 'Recycled Content Percentage',
    code: 'RCP',
    dataType: 'Percentage',
    esrsDatapoints: ['E5-2', 'E5-5'],
    regulations: ['CSRD', 'DPP', 'ESPR'],
    effort: 'low',
    xmlSnippet: '<recycledContentPercentage>25</recycledContentPercentage>',
  },
  organicCertification: {
    name: 'Organic Certification',
    code: 'OC',
    dataType: 'Code',
    esrsDatapoints: ['E4-2'],
    regulations: ['EUDR', 'CSRD'],
    effort: 'medium',
    xmlSnippet: '<organicCertification>EU_ORGANIC</organicCertification>',
  },
  countryOfOrigin: {
    name: 'Country of Origin',
    code: 'COO',
    dataType: 'Code',
    esrsDatapoints: ['S2-1', 'S2-4'],
    regulations: ['CSRD', 'CS3D', 'EUDR'],
    effort: 'low',
    xmlSnippet: '<countryOfOrigin>NL</countryOfOrigin>',
  },
  packagingMaterial: {
    name: 'Packaging Material',
    code: 'PM',
    dataType: 'Code',
    esrsDatapoints: ['E5-3', 'E5-6'],
    regulations: ['CSRD', 'DPP', 'PPWR'],
    effort: 'low',
    xmlSnippet: '<packagingMaterial>RECYCLABLE_CARDBOARD</packagingMaterial>',
  },
  energyEfficiencyClass: {
    name: 'Energy Efficiency Class',
    code: 'EEC',
    dataType: 'Code',
    esrsDatapoints: ['E1-5'],
    regulations: ['ESPR', 'DPP'],
    effort: 'low',
    xmlSnippet: '<energyEfficiencyClass>A</energyEfficiencyClass>',
  },
  repairabilityScore: {
    name: 'Repairability Score',
    code: 'RS',
    dataType: 'Number',
    esrsDatapoints: ['E5-4'],
    regulations: ['DPP', 'ESPR'],
    effort: 'medium',
    xmlSnippet: '<repairabilityScore>7.5</repairabilityScore>',
  },
  durabilityScore: {
    name: 'Durability Score',
    code: 'DS',
    dataType: 'Number',
    esrsDatapoints: ['E5-4'],
    regulations: ['DPP', 'ESPR'],
    effort: 'medium',
    xmlSnippet: '<durabilityScore>8.0</durabilityScore>',
  },
  hazardousSubstances: {
    name: 'Hazardous Substances',
    code: 'HS',
    dataType: 'List',
    esrsDatapoints: ['E2-4', 'E2-5'],
    regulations: ['CSRD', 'REACH', 'DPP'],
    effort: 'high',
    xmlSnippet: '<hazardousSubstances><substance code="NONE"/></hazardousSubstances>',
  },
  supplierInformation: {
    name: 'Supplier Information',
    code: 'SI',
    dataType: 'Complex',
    esrsDatapoints: ['S2-1', 'S2-2', 'G1-4'],
    regulations: ['CSRD', 'CS3D', 'EUDR'],
    effort: 'high',
    xmlSnippet: '<supplierInformation><gln>1234567890123</gln></supplierInformation>',
  },
  nutritionalInformation: {
    name: 'Nutritional Information',
    code: 'NI',
    dataType: 'Complex',
    esrsDatapoints: ['S4-1'],
    regulations: ['FIC'],
    effort: 'low',
    xmlSnippet: '<nutritionalInformation><energyKJ>1200</energyKJ></nutritionalInformation>',
  },
  allergenInformation: {
    name: 'Allergen Information',
    code: 'AI',
    dataType: 'List',
    esrsDatapoints: ['S4-1'],
    regulations: ['FIC'],
    effort: 'low',
    xmlSnippet: '<allergenInformation><allergen code="GLUTEN" containmentLevel="CONTAINS"/></allergenInformation>',
  },
  shelfLife: {
    name: 'Shelf Life',
    code: 'SL',
    dataType: 'Duration',
    esrsDatapoints: ['E5-4'],
    regulations: ['FIC'],
    effort: 'low',
    xmlSnippet: '<shelfLife>P365D</shelfLife>',
  },
  storageConditions: {
    name: 'Storage Conditions',
    code: 'SC',
    dataType: 'Code',
    esrsDatapoints: ['S4-1'],
    regulations: ['FIC'],
    effort: 'low',
    xmlSnippet: '<storageConditions>REFRIGERATED</storageConditions>',
  },
  energyConsumption: {
    name: 'Energy Consumption',
    code: 'EC',
    dataType: 'Measurement',
    esrsDatapoints: ['E1-5'],
    regulations: ['CSRD', 'ESPR'],
    effort: 'medium',
    xmlSnippet: '<energyConsumption measurementUnitCode="KWH">150</energyConsumption>',
  },
  waterUsage: {
    name: 'Water Usage',
    code: 'WU',
    dataType: 'Measurement',
    esrsDatapoints: ['E3-4'],
    regulations: ['CSRD'],
    effort: 'medium',
    xmlSnippet: '<waterUsage measurementUnitCode="LTR">500</waterUsage>',
  },
  wasteGenerated: {
    name: 'Waste Generated',
    code: 'WG',
    dataType: 'Measurement',
    esrsDatapoints: ['E5-5'],
    regulations: ['CSRD'],
    effort: 'medium',
    xmlSnippet: '<wasteGenerated measurementUnitCode="KGM">0.5</wasteGenerated>',
  },
  batteryInformation: {
    name: 'Battery Information',
    code: 'BI',
    dataType: 'Complex',
    esrsDatapoints: ['E5-3'],
    regulations: ['DPP', 'BATTERY_REG'],
    effort: 'medium',
    xmlSnippet: '<batteryInformation><type>LITHIUM_ION</type><capacity>5000</capacity></batteryInformation>',
  },
  endOfLifeInstructions: {
    name: 'End of Life Instructions',
    code: 'EOL',
    dataType: 'Text',
    esrsDatapoints: ['E5-6'],
    regulations: ['DPP', 'WEEE'],
    effort: 'low',
    xmlSnippet: '<endOfLifeInstructions>Return to authorized recycling center</endOfLifeInstructions>',
  },
  warrantyInformation: {
    name: 'Warranty Information',
    code: 'WI',
    dataType: 'Complex',
    esrsDatapoints: ['S4-2'],
    regulations: ['CONSUMER_RIGHTS'],
    effort: 'low',
    xmlSnippet: '<warrantyInformation><duration>P2Y</duration></warrantyInformation>',
  },
  materialComposition: {
    name: 'Material Composition',
    code: 'MC',
    dataType: 'List',
    esrsDatapoints: ['E5-2'],
    regulations: ['DPP', 'TEXTILE_REG'],
    effort: 'medium',
    xmlSnippet: '<materialComposition><material percentage="60">COTTON</material></materialComposition>',
  },
  careInstructions: {
    name: 'Care Instructions',
    code: 'CI',
    dataType: 'List',
    esrsDatapoints: ['E5-4'],
    regulations: ['TEXTILE_REG'],
    effort: 'low',
    xmlSnippet: '<careInstructions><instruction code="WASH_40"/></careInstructions>',
  },
  sterilizationMethod: {
    name: 'Sterilization Method',
    code: 'SM',
    dataType: 'Code',
    esrsDatapoints: ['S4-1'],
    regulations: ['MDR'],
    effort: 'low',
    xmlSnippet: '<sterilizationMethod>GAMMA_IRRADIATION</sterilizationMethod>',
  },
  expirationDate: {
    name: 'Expiration Date',
    code: 'ED',
    dataType: 'Date',
    esrsDatapoints: ['S4-1'],
    regulations: ['MDR', 'FIC'],
    effort: 'low',
    xmlSnippet: '<expirationDate>2026-12-31</expirationDate>',
  },
  pesticideUsage: {
    name: 'Pesticide Usage',
    code: 'PU',
    dataType: 'List',
    esrsDatapoints: ['E2-4', 'E4-3'],
    regulations: ['EUDR', 'CSRD'],
    effort: 'high',
    xmlSnippet: '<pesticideUsage><pesticide code="NONE"/></pesticideUsage>',
  },
  harvestDate: {
    name: 'Harvest Date',
    code: 'HD',
    dataType: 'Date',
    esrsDatapoints: ['E4-2'],
    regulations: ['EUDR'],
    effort: 'low',
    xmlSnippet: '<harvestDate>2025-09-15</harvestDate>',
  },
  soilHealthIndicators: {
    name: 'Soil Health Indicators',
    code: 'SHI',
    dataType: 'Complex',
    esrsDatapoints: ['E4-4'],
    regulations: ['CSRD'],
    effort: 'high',
    xmlSnippet: '<soilHealthIndicators><organicMatter>3.5</organicMatter></soilHealthIndicators>',
  },
};

// =============================================================================
// CORE ALGORITHM
// =============================================================================

function calculateConfidenceScore(
  attributeId: string,
  sector: string,
  targetRegulations: string[]
): number {
  const metadata = ATTRIBUTE_METADATA[attributeId];
  if (!metadata) return 0.3;

  let score = 0.5; // Base score

  // Boost for sector relevance
  const sectorAttrs = SECTOR_ATTRIBUTES[sector] || [];
  if (sectorAttrs.includes(attributeId)) {
    score += 0.2;
  }

  // Boost for regulation match
  if (targetRegulations.length > 0) {
    const matchingRegs = metadata.regulations.filter(r => targetRegulations.includes(r));
    score += matchingRegs.length * 0.1;
  }

  // Boost for ESRS coverage
  if (metadata.esrsDatapoints.length > 2) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

function generateRationale(
  attributeId: string,
  sector: string,
  targetRegulations: string[]
): string {
  const metadata = ATTRIBUTE_METADATA[attributeId];
  if (!metadata) return 'Recommended based on general best practices.';

  const parts: string[] = [];

  const sectorAttrs = SECTOR_ATTRIBUTES[sector] || [];
  if (sectorAttrs.includes(attributeId)) {
    parts.push(`highly relevant for ${sector} sector`);
  }

  if (targetRegulations.length > 0) {
    const matchingRegs = metadata.regulations.filter(r => targetRegulations.includes(r));
    if (matchingRegs.length > 0) {
      parts.push(`supports ${matchingRegs.join(', ')} compliance`);
    }
  }

  if (metadata.esrsDatapoints.length > 0) {
    parts.push(`maps to ESRS datapoints ${metadata.esrsDatapoints.slice(0, 3).join(', ')}`);
  }

  return parts.length > 0
    ? `Recommended because it is ${parts.join('; ')}.`
    : 'Recommended based on general sustainability reporting best practices.';
}

export async function generateAttributeRecommendations(
  input: AttributeRecommendationInput
): Promise<AttributeRecommendationResult> {
  const { sector, targetRegulations = [], currentAttributes = [] } = input;

  // Get candidate attributes for sector
  const sectorAttrs = SECTOR_ATTRIBUTES[sector] || Object.keys(ATTRIBUTE_METADATA);
  
  // Filter out current attributes
  const candidateAttrs = sectorAttrs.filter(attr => !currentAttributes.includes(attr));

  // Score and rank attributes
  const scoredAttrs = candidateAttrs.map(attrId => {
    const metadata = ATTRIBUTE_METADATA[attrId];
    const confidenceScore = calculateConfidenceScore(attrId, sector, targetRegulations);
    const confidenceLevel = getConfidenceLevel(confidenceScore);

    const regulatoryRelevance: RegulatoryRelevance[] = [];
    if (metadata && targetRegulations.length > 0) {
      for (const reg of targetRegulations) {
        if (metadata.regulations.includes(reg)) {
          regulatoryRelevance.push({
            regulation: reg,
            requirement: `${reg} sustainability disclosure`,
            mappingType: 'direct',
          });
        }
      }
    }

    const epistemic: EpistemicMarker = confidenceLevel === 'high'
      ? createFactMarker(`Database mapping to ${metadata?.esrsDatapoints.join(', ') || 'ESRS'}`)
      : confidenceLevel === 'medium'
        ? createInferenceMarker(`Sector analysis for ${sector}`, 'medium')
        : createUncertainMarker(`General recommendation`, 'low');

    return {
      attributeId: attrId,
      attributeName: metadata?.name || attrId,
      attributeCode: metadata?.code || attrId.substring(0, 3).toUpperCase(),
      dataType: metadata?.dataType || 'String',
      confidenceScore,
      confidenceLevel,
      priorityRank: 0, // Will be set after sorting
      regulatoryRelevance,
      esrsDatapoints: metadata?.esrsDatapoints || [],
      implementationNotes: `Implement ${metadata?.name || attrId} data collection and reporting.`,
      gdsnXmlSnippet: metadata?.xmlSnippet || `<${attrId}>value</${attrId}>`,
      estimatedEffort: metadata?.effort || 'medium',
      recommendationRationale: generateRationale(attrId, sector, targetRegulations),
      epistemic,
    };
  });

  // Sort by confidence score descending
  scoredAttrs.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Limit to top 20 and assign priority ranks
  const recommendations = scoredAttrs.slice(0, 20).map((attr, index) => ({
    ...attr,
    priorityRank: index + 1,
  }));

  // Calculate summary
  const highCount = recommendations.filter(r => r.confidenceLevel === 'high').length;
  const mediumCount = recommendations.filter(r => r.confidenceLevel === 'medium').length;
  const lowCount = recommendations.filter(r => r.confidenceLevel === 'low').length;

  const regulationsCovered = Array.from(new Set(
    recommendations.flatMap(r => r.regulatoryRelevance.map(rr => rr.regulation))
  ));

  const avgEffort = recommendations.reduce((sum, r) => {
    return sum + (r.estimatedEffort === 'high' ? 3 : r.estimatedEffort === 'medium' ? 2 : 1);
  }, 0) / (recommendations.length || 1);

  const overallEpistemic: EpistemicMarker = highCount > recommendations.length / 2
    ? createFactMarker('Majority of recommendations based on database mappings')
    : mediumCount > recommendations.length / 2
      ? createInferenceMarker('Recommendations based on sector analysis', 'medium')
      : createUncertainMarker('Recommendations based on general best practices', 'low');

  return {
    input,
    recommendations,
    summary: {
      totalRecommendations: recommendations.length,
      highConfidenceCount: highCount,
      mediumConfidenceCount: mediumCount,
      lowConfidenceCount: lowCount,
      regulationsCovered,
      estimatedImplementationEffort: avgEffort >= 2.5 ? 'High' : avgEffort >= 1.5 ? 'Medium' : 'Low',
    },
    epistemic: overallEpistemic,
    generatedAt: new Date().toISOString(),
  };
}
