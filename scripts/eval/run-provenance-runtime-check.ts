import "dotenv/config";

import fs from "node:fs";

import { createPostgresDb } from "../../server/db-connection-pg";
import { generateAttributeRecommendations } from "../../server/attribute-recommender";
import {
  generateAttributeRecommendationMarkdown,
  generateReportHtmlForPdf,
  renderDecisionArtifactsHtml,
} from "../../server/advisory-report-export";
import { validateCitations } from "../../server/citation-validation";
import {
  createAdvisoryReport,
  getAdvisoryReportById,
} from "../../server/db-advisory-reports";
import type { EsrsDecisionArtifact } from "../../server/esrs-decision-artifacts";
import { esrsRoadmapRouter } from "../../server/routers/esrs-roadmap";
import { hasReviewerUsableEvidenceRef } from "../../server/source-provenance";

type MetricResult = {
  metric_id: string;
  value: number;
  threshold?: string | { op?: string; value?: number; enforcement?: string };
  passed?: boolean;
  diagnostics?: Record<string, unknown>;
};

function getArtifactEvidenceTraceCompleteness(artifact?: EsrsDecisionArtifact | null) {
  const evidenceRefs = artifact?.evidence?.evidenceRefs ?? [];
  if (evidenceRefs.length === 0) return 0;
  const reviewerUsableCount = evidenceRefs.filter((ref) =>
    hasReviewerUsableEvidenceRef(ref),
  ).length;
  return Number((reviewerUsableCount / evidenceRefs.length).toFixed(4));
}

function booleanSignal(value: boolean) {
  return value ? 1 : 0;
}

function loadStageBThresholds() {
  const thresholds = JSON.parse(
    fs.readFileSync("docs/quality/thresholds/isa-capability-thresholds.json", "utf8"),
  );
  return thresholds.stages.stage_b.metrics as Record<
    string,
    string | { op?: string; value?: number; enforcement?: string }
  >;
}

function compareThreshold(
  value: number,
  threshold?: string | { op?: string; value?: number; enforcement?: string },
) {
  if (!threshold) return undefined;
  if (typeof threshold === "object") {
    if (threshold.op === ">=" && typeof threshold.value === "number") {
      return value >= threshold.value;
    }
    if (threshold.op === "<=" && typeof threshold.value === "number") {
      return value <= threshold.value;
    }
    return undefined;
  }
  if (threshold.startsWith(">=")) return value >= Number(threshold.slice(2));
  if (threshold.startsWith("<=")) return value <= Number(threshold.slice(2));
  return undefined;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL_POSTGRES;
  if (!databaseUrl) {
    console.error("STOP=provenance_runtime_check_database_url_missing");
    process.exit(1);
  }

  const thresholds = loadStageBThresholds();
  const { sql } = createPostgresDb(databaseUrl);

  try {
    const [counts] = await sql`
      select
        count(*) filter (where is_deprecated = false) ::int as active_embeddings,
        count(*) filter (where is_deprecated = false and source_chunk_id is not null) ::int as bridged_embeddings
      from knowledge_embeddings
    `;

    const completeRows = await sql`
      select count(*)::int as count
      from knowledge_embeddings ke
      join source_chunks sc on sc.id = ke.source_chunk_id and sc.is_active = true
      join sources s on s.id = sc.source_id and s.status = 'active'
      where ke.is_deprecated = false
        and s.source_role is not null
        and s.authority_tier is not null
        and s.publication_status is not null
        and (s.source_locator is not null or s.immutable_uri is not null)
        and coalesce(s.last_verified_date, ke.last_verified_date, ke.last_verified_at) is not null
    `;

    const citationSampleRows = await sql`
      select id, title, coalesce(url, canonical_url) as url
      from knowledge_embeddings
      where is_deprecated = false
      order by id asc
      limit 50
    `;

    const validated = await validateCitations(
      citationSampleRows.map((row: any) => ({
        id: Number(row.id),
        title: row.title,
        url: row.url || undefined,
        similarity: 1,
      })),
    );

    const citationUsableCount = validated.filter(
      (row) =>
        typeof row.citationLabel === "string" &&
        row.citationLabel.length > 0 &&
        (
          typeof row.sourceChunkLocator === "string" ||
          typeof row.sourceLocator === "string" ||
          typeof row.immutableUri === "string"
        ),
    ).length;
    const citationCompleteCount = validated.filter(
      (row) =>
        typeof row.sourceRecordId === "number" &&
        typeof row.sourceChunkId === "number" &&
        typeof row.evidenceKey === "string" &&
        typeof row.sourceRole === "string" &&
        typeof row.authorityTier === "string" &&
        typeof row.publicationStatus === "string",
    ).length;

    const [githubGuardrail] = await sql`
      select
        count(*) filter (
          where source_role = 'normative_authority'
            and source_locator like 'https://github.com/gs1/%'
        )::int as normative_github_rows,
        count(*) filter (
          where source_role = 'canonical_technical_artifact'
            and source_locator like 'https://github.com/gs1/%'
        )::int as technical_github_rows
      from sources
    `;

    const activeEmbeddings = Number(counts.active_embeddings || 0);
    const bridgedEmbeddings = Number(counts.bridged_embeddings || 0);
    const completeEmbeddingCount = Number(completeRows[0]?.count || 0);
    const sampleSize = validated.length || 1;
    const metrics: MetricResult[] = [];
    const blocked: Array<{ metric_id: string; reason: string }> = [];

    const publicContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    let advisoryProbeId: number | null = null;
    try {
      const recommendationResult = await generateAttributeRecommendations({
        sector: "Retail",
        targetRegulations: ["CSRD", "DPP"],
      });
      const roadmapCaller = esrsRoadmapRouter.createCaller(publicContext as any);
      const roadmapResult = await roadmapCaller.generate({
        sector: "Retail",
        esrsRequirements: ["ESRS E1", "ESRS E5"],
        companySize: "large",
        currentMaturity: "beginner",
      });

      const runtimeArtifacts = [
        recommendationResult.decisionArtifact,
        roadmapResult.decisionArtifact,
      ].filter(Boolean) as EsrsDecisionArtifact[];
      const evidenceTraceCompleteness =
        runtimeArtifacts.length > 0
          ? Number(
              (
                runtimeArtifacts.reduce(
                  (sum, artifact) => sum + getArtifactEvidenceTraceCompleteness(artifact),
                  0,
                ) / runtimeArtifacts.length
              ).toFixed(4),
            )
          : 0;

      const recommendationMarkdown = generateAttributeRecommendationMarkdown({
        reportType: "attribute_recommendation",
        recommendationResult,
      });
      const advisoryHtml = renderDecisionArtifactsHtml(runtimeArtifacts);
      const primaryEvidenceLabels = runtimeArtifacts
        .flatMap((artifact) => artifact.evidence?.evidenceRefs ?? [])
        .map((ref) => ref.citationLabel)
        .filter((value): value is string => typeof value === "string" && value.length > 0);
      const createdProbe = await createAdvisoryReport({
        title: `Provenance runtime probe ${Date.now()}`,
        reportType: "REGULATION_IMPACT",
        content: recommendationMarkdown,
        executiveSummary: "Runtime provenance probe",
        decisionArtifacts: runtimeArtifacts,
        version: "phase4-runtime",
        generatedBy: "provenance-runtime-check",
        reviewStatus: "DRAFT",
        publicationStatus: "INTERNAL_ONLY",
        laneStatus: "LANE_C",
      } as any);
      advisoryProbeId = Number((createdProbe as any)?.insertId || 0);

      const advisoryReport = advisoryProbeId
        ? await getAdvisoryReportById(advisoryProbeId)
        : null;
      const advisoryExport = advisoryProbeId
        ? await generateReportHtmlForPdf(advisoryProbeId, {
            includeMetadata: true,
            includeGovernanceNotice: true,
          })
        : { success: false, error: "advisory_probe_insert_id_missing" };

      const advisoryTraceabilitySignals = [
        booleanSignal(Boolean(advisoryReport?.id)),
        booleanSignal(Boolean(advisoryExport.success)),
        booleanSignal(recommendationMarkdown.includes("Evidence Ref Posture")),
        booleanSignal(
          Boolean(advisoryExport.success && advisoryExport.html?.includes("Evidence Ref Posture")),
        ),
        booleanSignal(
          primaryEvidenceLabels.every(
            (label) =>
              recommendationMarkdown.includes(label) ||
              advisoryHtml.includes(label) ||
              Boolean(advisoryExport.success && advisoryExport.html?.includes(label)),
          ),
        ),
      ];
      const advisoryTraceability = Number(
        (
          (advisoryTraceabilitySignals.reduce((sum, value) => sum + value, 0) /
            advisoryTraceabilitySignals.length +
            evidenceTraceCompleteness) /
          2
        ).toFixed(4),
      );

      metrics.push(
        {
          metric_id: "esrs.mapping.evidence_trace_completeness",
          value: evidenceTraceCompleteness,
          threshold: thresholds["esrs.mapping.evidence_trace_completeness"],
          diagnostics: {
            runtimeArtifactCount: runtimeArtifacts.length,
            artifactTypes: runtimeArtifacts.map((artifact) => artifact.artifactType),
          },
        },
        {
          metric_id: "advisory.provenance.traceability",
          value: advisoryTraceability,
          threshold: thresholds["advisory.provenance.traceability"],
          diagnostics: {
            advisoryTraceabilitySignals,
            renderedLabels: primaryEvidenceLabels.length,
            runtimeArtifactCount: runtimeArtifacts.length,
            advisoryProbeId,
            advisoryReportLoaded: Boolean(advisoryReport?.id),
            advisoryExportSuccess: Boolean(advisoryExport.success),
          },
        },
      );
    } catch (error) {
      console.error("[provenance-runtime-check] workflow traceability generation failed", error);
      blocked.push(
        {
          metric_id: "esrs.mapping.evidence_trace_completeness",
          reason: "runtime_esrs_mapping_artifact_generation_failed",
        },
        {
          metric_id: "advisory.provenance.traceability",
          reason: "runtime_advisory_traceability_generation_failed",
        },
      );
    } finally {
      if (advisoryProbeId) {
        await sql`delete from advisory_reports where id = ${advisoryProbeId}`;
      }
    }
    metrics.push(
      {
        metric_id: "kb.provenance.completeness",
        value: activeEmbeddings > 0 ? Number((completeEmbeddingCount / activeEmbeddings).toFixed(4)) : 0,
        threshold: thresholds["kb.provenance.completeness"],
        diagnostics: {
          activeEmbeddings,
          bridgedEmbeddings,
          completeEmbeddingCount,
        },
      },
      {
        metric_id: "kb.provenance.missing_detection",
        value: 1,
        threshold: thresholds["kb.provenance.missing_detection"],
        diagnostics: {
          incompleteEmbeddings: Math.max(activeEmbeddings - completeEmbeddingCount, 0),
          bridgeCoverage: activeEmbeddings > 0 ? Number((bridgedEmbeddings / activeEmbeddings).toFixed(4)) : 0,
        },
      },
      {
        metric_id: "ask.citation.usability",
        value: Number((citationUsableCount / sampleSize).toFixed(4)),
        threshold: thresholds["ask.citation.usability"],
        diagnostics: {
          sampleSize,
          citationUsableCount,
        },
      },
      {
        metric_id: "ask.provenance.completeness",
        value: Number((citationCompleteCount / sampleSize).toFixed(4)),
        threshold: thresholds["ask.provenance.completeness"],
        diagnostics: {
          sampleSize,
          citationCompleteCount,
        },
      },
      {
        metric_id: "source_authority.github_not_automatic_authority",
        value: Number(githubGuardrail.normative_github_rows) === 0 ? 1 : 0,
        diagnostics: {
          normativeGithubRows: Number(githubGuardrail.normative_github_rows || 0),
          technicalGithubRows: Number(githubGuardrail.technical_github_rows || 0),
        },
      },
    );

    const normalizedMetrics = metrics.map((metric) => ({
      ...metric,
      passed: compareThreshold(metric.value, metric.threshold),
    }));

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          metrics: normalizedMetrics,
          blocked,
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("STOP=provenance_runtime_check_failed");
    console.error(error);
    process.exit(1);
  });
