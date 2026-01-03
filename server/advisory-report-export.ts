/**
 * Advisory Report Export Service
 * Phase 1 Enhancement: Generate professional Markdown reports from analysis results
 */

// Database operations use in-memory storage for demo

// =============================================================================
// TYPES
// =============================================================================

export interface GapAnalysisReportInput {
  reportType: 'gap_analysis';
  title?: string;
  includeExecutiveSummary?: boolean;
  includeDetailedFindings?: boolean;
  includeRemediation?: boolean;
  companyName?: string;
  preparedFor?: string;
  preparedBy?: string;
  gapAnalysisResult: any;
}

export interface AttributeRecommendationReportInput {
  reportType: 'attribute_recommendation';
  title?: string;
  includeExecutiveSummary?: boolean;
  includeDetailedFindings?: boolean;
  includeImplementationGuidance?: boolean;
  companyName?: string;
  preparedFor?: string;
  preparedBy?: string;
  recommendationResult: any;
}

// =============================================================================
// GAP ANALYSIS REPORT GENERATION
// =============================================================================

export function generateGapAnalysisMarkdown(input: GapAnalysisReportInput): string {
  const {
    title = 'Compliance Gap Analysis Report',
    includeExecutiveSummary = true,
    includeDetailedFindings = true,
    includeRemediation = true,
    companyName,
    preparedFor,
    preparedBy,
    gapAnalysisResult,
  } = input;

  const lines: string[] = [];
  const now = new Date().toISOString().split('T')[0];

  // Title
  lines.push(`# ${title}`);
  lines.push('');

  // Metadata
  lines.push('## Report Information');
  lines.push('');
  lines.push(`**Report Type:** Gap Analysis`);
  lines.push(`**Generated:** ${now}`);
  if (companyName) lines.push(`**Company:** ${companyName}`);
  if (preparedFor) lines.push(`**Prepared For:** ${preparedFor}`);
  if (preparedBy) lines.push(`**Prepared By:** ${preparedBy}`);
  lines.push(`**Sector:** ${gapAnalysisResult?.input?.sector || 'Not specified'}`);
  lines.push('');

  // Executive Summary
  if (includeExecutiveSummary) {
    lines.push('## Executive Summary');
    lines.push('');
    lines.push('This report presents the findings of a compliance gap analysis comparing your current GS1 attribute coverage against ESRS (European Sustainability Reporting Standards) requirements.');
    lines.push('');

    // Key Findings Table
    lines.push('### Key Findings');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    lines.push(`| Total ESRS Requirements Analyzed | ${gapAnalysisResult?.summary?.totalRequirements || 0} |`);
    lines.push(`| Requirements Covered | ${gapAnalysisResult?.summary?.coveredRequirements || 0} |`);
    lines.push(`| Coverage Percentage | ${gapAnalysisResult?.summary?.coveragePercentage || 0}% |`);
    lines.push(`| Identified Gaps | ${gapAnalysisResult?.summary?.gaps || 0} |`);
    lines.push('');

    // Confidence Assessment
    lines.push('### Confidence Assessment');
    lines.push('');
    const epistemic = gapAnalysisResult?.overallEpistemic;
    if (epistemic) {
      lines.push(`- **Fact-based findings:** ${epistemic.factCount || 0}`);
      lines.push(`- **Inferred findings:** ${epistemic.inferenceCount || 0}`);
      lines.push(`- **Uncertain findings:** ${epistemic.uncertainCount || 0}`);
      lines.push(`- **Overall Confidence:** ${epistemic.overallConfidence || 'medium'}`);
    }
    lines.push('');
  }

  // Detailed Findings
  if (includeDetailedFindings) {
    lines.push('## Detailed Gap Analysis');
    lines.push('');

    // Critical Gaps
    const criticalGaps = gapAnalysisResult?.criticalGaps || [];
    if (criticalGaps.length > 0) {
      lines.push('### Critical Priority Gaps');
      lines.push('');
      lines.push('> These gaps require immediate attention due to their regulatory significance.');
      lines.push('');
      for (const gap of criticalGaps) {
        lines.push(`#### ${gap.shortName || 'Unnamed Gap'}`);
        lines.push('');
        lines.push(`- **ESRS Standard:** ${gap.esrsStandard || 'N/A'}`);
        lines.push(`- **Topic:** ${gap.esrsTopic || 'N/A'}`);
        lines.push(`- **Gap Type:** ${gap.gapType || 'N/A'}`);
        lines.push(`- **Definition:** ${gap.definition || 'N/A'}`);
        lines.push('');
        if (gap.explanation) {
          lines.push(`> ${gap.explanation}`);
          lines.push('');
        }
        if (gap.suggestedAttributes && gap.suggestedAttributes.length > 0) {
          lines.push('**Suggested Attributes:**');
          for (const attr of gap.suggestedAttributes) {
            lines.push(`- ${attr.attributeName} (Confidence: ${attr.mappingConfidence})`);
          }
          lines.push('');
        }
      }
    }

    // High Priority Gaps
    const highGaps = gapAnalysisResult?.highGaps || [];
    if (highGaps.length > 0) {
      lines.push('### High Priority Gaps');
      lines.push('');
      for (const gap of highGaps) {
        lines.push(`#### ${gap.shortName || 'Unnamed Gap'}`);
        lines.push('');
        lines.push(`- **ESRS Standard:** ${gap.esrsStandard || 'N/A'}`);
        lines.push(`- **Gap Type:** ${gap.gapType || 'N/A'}`);
        lines.push('');
      }
    }

    // Medium Priority Gaps
    const mediumGaps = gapAnalysisResult?.mediumGaps || [];
    if (mediumGaps.length > 0) {
      lines.push('### Medium Priority Gaps');
      lines.push('');
      lines.push(`${mediumGaps.length} medium priority gaps identified. See appendix for details.`);
      lines.push('');
    }

    // Low Priority Gaps
    const lowGaps = gapAnalysisResult?.lowGaps || [];
    if (lowGaps.length > 0) {
      lines.push('### Low Priority Gaps');
      lines.push('');
      lines.push(`${lowGaps.length} low priority gaps identified. See appendix for details.`);
      lines.push('');
    }
  }

  // Remediation Paths
  if (includeRemediation && gapAnalysisResult?.remediationPaths?.length > 0) {
    lines.push('## Recommended Remediation Paths');
    lines.push('');
    for (let i = 0; i < gapAnalysisResult.remediationPaths.length; i++) {
      const path = gapAnalysisResult.remediationPaths[i];
      lines.push(`### Remediation Path ${i + 1}`);
      lines.push('');
      lines.push(`**Estimated Effort:** ${path.estimatedEffort || 'Medium'}`);
      lines.push('');
      if (path.steps && path.steps.length > 0) {
        lines.push('**Steps:**');
        lines.push('');
        for (const step of path.steps) {
          lines.push(`${step.order}. **${step.action}:** ${step.description} (${step.estimatedDuration || 'TBD'})`);
        }
        lines.push('');
      }
    }
  }

  // Disclaimer
  lines.push('## Disclaimer');
  lines.push('');
  lines.push('> This report is generated by ISA - Intelligent Standards Architect and is **not an official compliance assessment**. The analysis is based on available data mappings and should be validated by qualified compliance professionals before making business decisions.');
  lines.push('');
  lines.push('The findings in this report are provided for informational purposes only. GS1 Netherlands and the ISA development team make no warranties regarding the completeness or accuracy of this analysis.');
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('*Generated by ISA - Intelligent Standards Architect*');
  lines.push(`*Report Date: ${now}*`);
  lines.push('');

  return lines.join('\n');
}

// =============================================================================
// ATTRIBUTE RECOMMENDATION REPORT GENERATION
// =============================================================================

export function generateAttributeRecommendationMarkdown(input: AttributeRecommendationReportInput): string {
  const {
    title = 'GS1 Attribute Recommendation Report',
    includeExecutiveSummary = true,
    includeDetailedFindings = true,
    includeImplementationGuidance = true,
    companyName,
    preparedFor,
    preparedBy,
    recommendationResult,
  } = input;

  const lines: string[] = [];
  const now = new Date().toISOString().split('T')[0];

  // Title
  lines.push(`# ${title}`);
  lines.push('');

  // Metadata
  lines.push('## Report Information');
  lines.push('');
  lines.push(`**Report Type:** Attribute Recommendation`);
  lines.push(`**Generated:** ${now}`);
  if (companyName) lines.push(`**Company:** ${companyName}`);
  if (preparedFor) lines.push(`**Prepared For:** ${preparedFor}`);
  if (preparedBy) lines.push(`**Prepared By:** ${preparedBy}`);
  lines.push(`**Sector:** ${recommendationResult?.input?.sector || 'Not specified'}`);
  if (recommendationResult?.input?.productCategory) {
    lines.push(`**Product Category:** ${recommendationResult.input.productCategory}`);
  }
  if (recommendationResult?.input?.targetRegulations?.length > 0) {
    lines.push(`**Target Regulations:** ${recommendationResult.input.targetRegulations.join(', ')}`);
  }
  lines.push('');

  // Executive Summary
  if (includeExecutiveSummary) {
    lines.push('## Executive Summary');
    lines.push('');
    lines.push('This report provides GS1 attribute recommendations to enhance your product data for regulatory compliance and sustainability reporting.');
    lines.push('');

    // Summary Statistics
    lines.push('### Summary Statistics');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    lines.push(`| Total Recommendations | ${recommendationResult?.summary?.totalRecommendations || 0} |`);
    lines.push(`| High Confidence | ${recommendationResult?.summary?.highConfidenceCount || 0} |`);
    lines.push(`| Medium Confidence | ${recommendationResult?.summary?.mediumConfidenceCount || 0} |`);
    lines.push(`| Low Confidence | ${recommendationResult?.summary?.lowConfidenceCount || 0} |`);
    lines.push(`| Regulations Covered | ${recommendationResult?.summary?.regulationsCovered?.join(', ') || 'N/A'} |`);
    lines.push(`| Estimated Implementation Effort | ${recommendationResult?.summary?.estimatedImplementationEffort || 'Medium'} |`);
    lines.push('');
  }

  // Detailed Recommendations
  if (includeDetailedFindings) {
    lines.push('## Attribute Recommendations');
    lines.push('');

    const recommendations = recommendationResult?.recommendations || [];
    
    // High Confidence
    const highConf = recommendations.filter((r: any) => r.confidenceLevel === 'high');
    if (highConf.length > 0) {
      lines.push('### High Confidence Recommendations');
      lines.push('');
      for (const rec of highConf) {
        lines.push(`#### ${rec.priorityRank}. ${rec.attributeName}`);
        lines.push('');
        lines.push(`- **Attribute Code:** ${rec.attributeCode}`);
        lines.push(`- **Data Type:** ${rec.dataType}`);
        lines.push(`- **Confidence Score:** ${(rec.confidenceScore * 100).toFixed(0)}%`);
        lines.push(`- **Estimated Effort:** ${rec.estimatedEffort}`);
        lines.push('');
        if (rec.regulatoryRelevance && rec.regulatoryRelevance.length > 0) {
          lines.push(`**Regulatory Relevance:** ${rec.regulatoryRelevance.map((r: any) => r.regulation).join(', ')}`);
          lines.push('');
        }
        if (rec.esrsDatapoints && rec.esrsDatapoints.length > 0) {
          lines.push(`**ESRS Datapoints:** ${rec.esrsDatapoints.join(', ')}`);
          lines.push('');
        }
        lines.push(`> ${rec.recommendationRationale}`);
        lines.push('');
        if (rec.gdsnXmlSnippet) {
          lines.push('**GDSN XML Example:**');
          lines.push('');
          lines.push('```xml');
          lines.push(rec.gdsnXmlSnippet);
          lines.push('```');
          lines.push('');
        }
      }
    }

    // Medium Confidence
    const medConf = recommendations.filter((r: any) => r.confidenceLevel === 'medium');
    if (medConf.length > 0) {
      lines.push('### Medium Confidence Recommendations');
      lines.push('');
      for (const rec of medConf) {
        lines.push(`#### ${rec.priorityRank}. ${rec.attributeName}`);
        lines.push('');
        lines.push(`- **Confidence Score:** ${(rec.confidenceScore * 100).toFixed(0)}%`);
        lines.push(`- **Estimated Effort:** ${rec.estimatedEffort}`);
        lines.push('');
        lines.push(`> ${rec.recommendationRationale}`);
        lines.push('');
        if (rec.gdsnXmlSnippet) {
          lines.push('```xml');
          lines.push(rec.gdsnXmlSnippet);
          lines.push('```');
          lines.push('');
        }
      }
    }

    // Low Confidence
    const lowConf = recommendations.filter((r: any) => r.confidenceLevel === 'low');
    if (lowConf.length > 0) {
      lines.push('### Low Confidence Recommendations');
      lines.push('');
      lines.push(`${lowConf.length} additional recommendations with lower confidence. Consider these for future implementation phases.`);
      lines.push('');
    }
  }

  // Implementation Guidance
  if (includeImplementationGuidance) {
    lines.push('## Implementation Guidance');
    lines.push('');
    lines.push('### Getting Started');
    lines.push('');
    lines.push('1. **Prioritize High Confidence Attributes:** Start with attributes that have the highest confidence scores and regulatory relevance.');
    lines.push('2. **Assess Data Availability:** Review your current data sources to determine which attributes can be populated immediately.');
    lines.push('3. **Plan Data Collection:** For attributes requiring new data collection, develop a phased implementation plan.');
    lines.push('4. **Validate with GDSN:** Ensure your attribute implementations conform to GDSN standards and validation rules.');
    lines.push('');
    lines.push('### Best Practices');
    lines.push('');
    lines.push('- Use standardized code lists where available');
    lines.push('- Maintain data quality through regular validation');
    lines.push('- Document data sources and calculation methodologies');
    lines.push('- Consider third-party verification for sustainability claims');
    lines.push('');
  }

  // Disclaimer
  lines.push('## Disclaimer');
  lines.push('');
  lines.push('> This report is generated by ISA - Intelligent Standards Architect and is provided for informational purposes only. The recommendations are based on available data mappings and should be validated by qualified professionals before implementation.');
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('*Generated by ISA - Intelligent Standards Architect*');
  lines.push(`*Report Date: ${now}*`);
  lines.push('');

  return lines.join('\n');
}

// =============================================================================
// DATABASE OPERATIONS (Stub implementations - to be connected to actual DB)
// =============================================================================

// In-memory storage for demo purposes
const reportStore: Map<number, any> = new Map();
let nextReportId = 1;

export async function saveAdvisoryReport(
  userId: number,
  reportType: string,
  reportTitle: string,
  fullContent: string,
  sourceType?: string,
  sourceSessionId?: number,
  fileUrl?: string,
  fileFormat?: string,
  generationDurationMs?: number
): Promise<number> {
  const id = nextReportId++;
  reportStore.set(id, {
    id,
    userId,
    reportType,
    reportTitle,
    fullContent,
    sourceType,
    sourceSessionId,
    fileUrl,
    fileFormat: fileFormat || 'markdown',
    generationDurationMs,
    downloadCount: 0,
    createdAt: Date.now(),
  });
  return id;
}

export async function getAdvisoryReport(reportId: number): Promise<any> {
  return reportStore.get(reportId) || null;
}

export async function listAdvisoryReports(userId: number, limit: number = 20): Promise<any[]> {
  const reports = Array.from(reportStore.values())
    .filter(r => r.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
  return reports;
}

export async function incrementDownloadCount(reportId: number): Promise<void> {
  const report = reportStore.get(reportId);
  if (report) {
    report.downloadCount = (report.downloadCount || 0) + 1;
  }
}

export async function deleteAdvisoryReport(reportId: number): Promise<void> {
  reportStore.delete(reportId);
}
