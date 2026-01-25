/**
 * Advisory Report Export Tests
 * Phase 1: Test suite for Advisory Report Export
 */

import { describe, it, expect } from 'vitest';
import {
  generateGapAnalysisMarkdown,
  generateAttributeRecommendationMarkdown,
} from './advisory-report-export';

// Mock gap analysis result
const mockGapAnalysisResult = {
  input: {
    sector: 'Food & Beverage',
    currentAttributes: ['productCarbonFootprint'],
  },
  summary: {
    totalRequirements: 50,
    coveredRequirements: 35,
    coveragePercentage: 70,
    gaps: 15,
  },
  criticalGaps: [
    {
      shortName: 'GHG Emissions Reporting',
      esrsStandard: 'E1',
      esrsTopic: 'Climate Change',
      gapType: 'no_mapping',
      definition: 'Disclosure of greenhouse gas emissions',
      explanation: 'No GS1 attribute currently maps to this requirement',
      suggestedAttributes: [
        { attributeName: 'Product Carbon Footprint', mappingConfidence: 'high' },
      ],
      epistemic: { status: 'fact', confidence: 'high', basis: 'Database mapping' },
    },
  ],
  highGaps: [
    {
      shortName: 'Water Usage',
      esrsStandard: 'E3',
      esrsTopic: 'Water and Marine Resources',
      gapType: 'partial_mapping',
      definition: 'Water consumption disclosure',
      explanation: 'Partial mapping exists',
      suggestedAttributes: [],
      epistemic: { status: 'inference', confidence: 'medium', basis: 'Sector analysis' },
    },
  ],
  mediumGaps: [],
  lowGaps: [],
  remediationPaths: [
    {
      estimatedEffort: 'medium',
      epistemic: { status: 'inference', confidence: 'medium', basis: 'Best practices' },
      steps: [
        { order: 1, action: 'Assess', description: 'Assess current state', estimatedDuration: '2 weeks' },
        { order: 2, action: 'Plan', description: 'Create plan', estimatedDuration: '1 week' },
      ],
    },
  ],
  overallEpistemic: {
    factCount: 5,
    inferenceCount: 8,
    uncertainCount: 2,
    overallConfidence: 'medium',
  },
};

// Mock attribute recommendation result
const mockRecommendationResult = {
  input: {
    sector: 'Retail',
    productCategory: 'Consumer Goods',
    targetRegulations: ['CSRD', 'DPP'],
  },
  recommendations: [
    {
      attributeId: 'productCarbonFootprint',
      attributeName: 'Product Carbon Footprint',
      attributeCode: 'PCF',
      dataType: 'Measurement',
      confidenceScore: 0.85,
      confidenceLevel: 'high',
      priorityRank: 1,
      regulatoryRelevance: [
        { regulation: 'CSRD', requirement: 'Climate disclosure', mappingType: 'direct' },
      ],
      esrsDatapoints: ['E1-3', 'E1-4'],
      implementationNotes: 'Requires LCA data',
      gdsnXmlSnippet: '<productCarbonFootprint>2.5</productCarbonFootprint>',
      estimatedEffort: 'high',
      recommendationRationale: 'Recommended for CSRD compliance',
      epistemic: { status: 'fact', confidence: 'high', basis: 'Database mapping' },
    },
    {
      attributeId: 'recycledContentPercentage',
      attributeName: 'Recycled Content Percentage',
      attributeCode: 'RCP',
      dataType: 'Percentage',
      confidenceScore: 0.65,
      confidenceLevel: 'medium',
      priorityRank: 2,
      regulatoryRelevance: [
        { regulation: 'DPP', requirement: 'Circularity', mappingType: 'direct' },
      ],
      esrsDatapoints: ['E5-2'],
      implementationNotes: 'Track recycled inputs',
      estimatedEffort: 'low',
      recommendationRationale: 'Recommended for DPP compliance',
      epistemic: { status: 'inference', confidence: 'medium', basis: 'Regulation analysis' },
    },
  ],
  summary: {
    totalRecommendations: 2,
    highConfidenceCount: 1,
    mediumConfidenceCount: 1,
    lowConfidenceCount: 0,
    regulationsCovered: ['CSRD', 'DPP'],
    estimatedImplementationEffort: 'Medium',
  },
  epistemic: { status: 'fact', confidence: 'high', basis: 'Database mappings' },
};

describe('Gap Analysis Markdown Generation', () => {
  it('should generate markdown with title', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      title: 'Test Gap Analysis Report',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('# Test Gap Analysis Report');
  });

  it('should include report type in metadata', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('**Report Type:** Gap Analysis');
  });

  it('should include company name when provided', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      companyName: 'Test Company',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('**Company:** Test Company');
  });

  it('should include executive summary section', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      includeExecutiveSummary: true,
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('## Executive Summary');
    expect(markdown).toContain('Key Findings');
  });

  it('should include key findings table', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('| Metric | Value |');
    expect(markdown).toContain('Total ESRS Requirements Analyzed');
    expect(markdown).toContain('Coverage Percentage');
  });

  it('should include confidence assessment', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('### Confidence Assessment');
    expect(markdown).toContain('Fact-based findings');
    expect(markdown).toContain('Inferred findings');
  });

  it('should include critical gaps section', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      includeDetailedFindings: true,
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('### Critical Priority Gaps');
    expect(markdown).toContain('GHG Emissions Reporting');
  });

  it('should include remediation paths section', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      includeRemediation: true,
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('## Recommended Remediation Paths');
  });

  it('should include disclaimer section', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('## Disclaimer');
    expect(markdown).toContain('not an official compliance assessment');
  });

  it('should include ISA branding', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('ISA - Intelligent Standards Architect');
  });
});

describe('Attribute Recommendation Markdown Generation', () => {
  it('should generate markdown with title', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      title: 'Test Attribute Report',
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('# Test Attribute Report');
  });

  it('should include sector in metadata', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('**Sector:** Retail');
  });

  it('should include summary statistics table', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('| Metric | Value |');
    expect(markdown).toContain('Total Recommendations');
    expect(markdown).toContain('High Confidence');
  });

  it('should include high confidence recommendations section', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      includeDetailedFindings: true,
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('### High Confidence Recommendations');
    expect(markdown).toContain('Product Carbon Footprint');
  });

  it('should include GDSN XML snippets', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('```xml');
    expect(markdown).toContain('productCarbonFootprint');
  });

  it('should include implementation guidance section', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      includeImplementationGuidance: true,
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('## Implementation Guidance');
    expect(markdown).toContain('Getting Started');
  });

  it('should include regulatory relevance', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('**Regulatory Relevance:**');
    expect(markdown).toContain('CSRD');
  });

  it('should include disclaimer section', () => {
    const markdown = generateAttributeRecommendationMarkdown({
      reportType: 'attribute_recommendation',
      recommendationResult: mockRecommendationResult,
    });

    expect(markdown).toContain('## Disclaimer');
  });
});

describe('Report Formatting', () => {
  it('should use proper markdown heading hierarchy', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toMatch(/^# /m);
    expect(markdown).toMatch(/^## /m);
    expect(markdown).toMatch(/^### /m);
  });

  it('should use proper markdown table syntax', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toMatch(/\|[-]+\|/);
  });

  it('should include blockquotes for definitions', () => {
    const markdown = generateGapAnalysisMarkdown({
      reportType: 'gap_analysis',
      gapAnalysisResult: mockGapAnalysisResult,
    });

    expect(markdown).toContain('> ');
  });
});
