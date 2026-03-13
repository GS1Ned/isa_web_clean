import React from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Eye,
  FileText,
  GitCompare,
  GitBranch,
  Layers3,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";

import { AdvisoryReportPdfExportButton } from "@/components/AdvisoryReportPdfExportButton";
import { DecisionArtifactCard } from "@/components/DecisionArtifactCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatAdvisoryEnumLabel,
  formatAdvisoryTimestamp,
  formatDecisionArtifactCount,
  formatDecisionArtifactConfidenceDelta,
  getAdvisoryLaneStatusTone,
  getDecisionArtifactDiffTone,
  getAdvisoryPublicationStatusTone,
  getAdvisoryReviewStatusTone,
  normalizeDecisionArtifacts,
} from "@/lib/advisory-report-ui";
import { trpc } from "@/lib/trpc";

type ReportFinding = {
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  recommendation: string;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

function isReportFinding(value: unknown): value is ReportFinding {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as ReportFinding).category === "string" &&
    typeof (value as ReportFinding).severity === "string" &&
    typeof (value as ReportFinding).description === "string" &&
    typeof (value as ReportFinding).recommendation === "string"
  );
}

function normalizeFindings(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as ReportFinding[];
  }

  return value.filter(isReportFinding);
}

function getSeverityTone(severity: ReportFinding["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "LOW":
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
}

export default function AdvisoryReportDetail() {
  const [, params] = useRoute("/advisory-reports/:id");
  const [, navigate] = useLocation();
  const reportId = params?.id ? Number(params.id) : 0;

  const {
    data: report,
    error,
    isLoading,
  } = trpc.advisoryReports.getById.useQuery(
    { id: reportId },
    { enabled: reportId > 0 },
  );

  const { data: versions, isLoading: versionsLoading } =
    trpc.advisoryReports.versions.useQuery(
      { reportId },
      { enabled: reportId > 0 },
    );

  const reportDecisionArtifacts = normalizeDecisionArtifacts(report?.decisionArtifacts);
  const findings = normalizeFindings(report?.findings);
  const recommendations = isStringArray(report?.recommendations)
    ? report.recommendations
    : [];
  const targetRegulationIds = Array.isArray(report?.targetRegulationIds)
    ? report.targetRegulationIds
    : [];
  const targetStandardIds = Array.isArray(report?.targetStandardIds)
    ? report.targetStandardIds
    : [];
  const sectorTags = isStringArray(report?.sectorTags) ? report.sectorTags : [];
  const gs1ImpactTags = isStringArray(report?.gs1ImpactTags) ? report.gs1ImpactTags : [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/advisory-reports")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Advisory Reports
        </Button>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto py-12 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/advisory-reports")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Advisory Reports
        </Button>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-semibold">Advisory report not found</h1>
              <p className="text-muted-foreground mt-2">
                The requested report does not exist or is no longer available.
              </p>
            </div>
            <Link href="/advisory-reports">
              <Button>Return to Advisory Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviewTone = getAdvisoryReviewStatusTone(report.reviewStatus);
  const publicationTone = getAdvisoryPublicationStatusTone(report.publicationStatus);
  const laneTone = getAdvisoryLaneStatusTone(report.laneStatus);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => navigate("/advisory-reports")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Advisory Reports
        </Button>
        <AdvisoryReportPdfExportButton
          reportId={report.id}
          reportTitle={report.title}
        />
      </div>

      {report.publicationStatus === "INTERNAL_ONLY" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Internal Use Only:</strong> This report remains governed under Lane C.
            Treat it as an internal decision-support artifact until publication approval is
            completed.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatAdvisoryEnumLabel(report.reportType)}</Badge>
            <Badge variant={reviewTone.variant} className={reviewTone.className}>
              {formatAdvisoryEnumLabel(report.reviewStatus)}
            </Badge>
            <Badge variant={publicationTone.variant} className={publicationTone.className}>
              {formatAdvisoryEnumLabel(report.publicationStatus)}
            </Badge>
            <Badge variant={laneTone.variant} className={laneTone.className}>
              {formatAdvisoryEnumLabel(report.laneStatus)}
            </Badge>
            <Badge variant="secondary">v{report.version}</Badge>
            {reportDecisionArtifacts.length > 0 && (
              <Badge variant="secondary">
                {formatDecisionArtifactCount(reportDecisionArtifacts.length)}
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">{report.title}</CardTitle>
            {report.executiveSummary && (
              <CardDescription className="text-base max-w-4xl">
                {report.executiveSummary}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Generated</div>
            <div className="mt-2 flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatAdvisoryTimestamp(report.generatedDate)}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Generated By</div>
            <div className="mt-2 font-medium">{report.generatedBy || "AI System"}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Views</div>
            <div className="mt-2 flex items-center gap-2 font-medium">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {report.viewCount ?? 0}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Quality Score</div>
            <div className="mt-2 font-medium">
              {typeof report.qualityScore === "number"
                ? `${Math.round(report.qualityScore * 100)}%`
                : report.qualityScore != null
                  ? `${Math.round(Number(report.qualityScore) * 100)}%`
                  : "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Advisory Content
            </CardTitle>
            <CardDescription>
              Full report content for governed review and downstream export.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
              {report.content}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-slate-600" />
                Scope Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Regulations
                  </div>
                  <div className="mt-1 font-medium">{targetRegulationIds.length}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Standards
                  </div>
                  <div className="mt-1 font-medium">{targetStandardIds.length}</div>
                </div>
              </div>

              {(sectorTags.length > 0 || gs1ImpactTags.length > 0) && (
                <div className="space-y-3">
                  {sectorTags.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        Sector Tags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sectorTags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {gs1ImpactTags.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        GS1 Impact Tags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gs1ImpactTags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {(report.reviewNotes || report.governanceNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                  Governance Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {report.reviewNotes && (
                  <div>
                    <div className="font-medium">Review Notes</div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{report.reviewNotes}</p>
                  </div>
                )}
                {report.governanceNotes && (
                  <div>
                    <div className="font-medium">Lane Notes</div>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {report.governanceNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {reportDecisionArtifacts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Decision Artifacts</h2>
            <p className="text-muted-foreground">
              Stable ESRS decision-core artifacts captured on the report for downstream advisory use.
            </p>
          </div>
          <div className="grid gap-4">
            {reportDecisionArtifacts.map((artifact, index) => (
              <DecisionArtifactCard
                key={`${artifact.artifactType}-${artifact.artifactVersion}-${index}`}
                artifact={artifact}
                title={`Decision Artifact ${index + 1}`}
                description="Persisted decision-core snapshot attached to this advisory report."
              />
            ))}
          </div>
        </div>
      )}

      {(findings.length > 0 || recommendations.length > 0) && (
        <div className="grid gap-6 xl:grid-cols-2">
          {findings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Findings</CardTitle>
                <CardDescription>
                  Reported issues, severity, and attached recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {findings.map((finding, index) => (
                  <div key={`${finding.category}-${index}`} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getSeverityTone(finding.severity)}>
                        {finding.severity}
                      </Badge>
                      <div className="font-medium">{finding.category}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm">
                      <span className="font-medium">Recommendation:</span> {finding.recommendation}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Recommendations</CardTitle>
                <CardDescription>
                  Action-oriented recommendations extracted from the advisory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {recommendations.map((recommendation, index) => (
                    <li key={`${recommendation}-${index}`} className="rounded-lg border p-3">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-slate-600" />
            Version History
          </CardTitle>
          <CardDescription>
            Decision-artifact-aware report versions for governed change tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {versionsLoading && <div className="text-sm text-muted-foreground">Loading versions...</div>}
          {!versionsLoading && (!versions || versions.length === 0) && (
            <div className="text-sm text-muted-foreground">
              No version snapshots available for this report yet.
            </div>
          )}

          {versions?.map(version => {
            const versionArtifacts = normalizeDecisionArtifacts(version.decisionArtifacts);
            const diffSummary = version.decisionArtifactDiff;

            return (
              <div key={version.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">v{version.version}</Badge>
                      {versionArtifacts.length > 0 && (
                        <Badge variant="secondary">
                          {formatDecisionArtifactCount(versionArtifacts.length)}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Created {formatAdvisoryTimestamp(version.createdAt)}
                      {version.createdBy ? ` by ${version.createdBy}` : ""}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <Layers3 className="h-3.5 w-3.5 inline mr-2" />
                    Snapshot for advisory diffing and auditability
                  </div>
                </div>

                {version.changeLog && (
                  <div className="text-sm">
                    <span className="font-medium">Change Log:</span>{" "}
                    <span className="text-muted-foreground whitespace-pre-wrap">
                      {version.changeLog}
                    </span>
                  </div>
                )}

                {diffSummary && (
                  <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <GitCompare className="h-4 w-4 text-slate-600" />
                        Diff vs current report
                      </div>
                      <Badge
                        variant={getDecisionArtifactDiffTone(diffSummary.hasChanges).variant}
                        className={getDecisionArtifactDiffTone(diffSummary.hasChanges).className}
                      >
                        {diffSummary.hasChanges ? "Artifact drift detected" : "No artifact drift"}
                      </Badge>
                      <Badge variant="outline">
                        Confidence delta{" "}
                        {formatDecisionArtifactConfidenceDelta(diffSummary.averageConfidenceDelta)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Added In Current
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diffSummary.addedArtifactTypes.length > 0 ? (
                            diffSummary.addedArtifactTypes.map((artifactType: string) => (
                              <Badge key={`${version.id}-added-${artifactType}`} variant="secondary">
                                {artifactType}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Removed From Current
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diffSummary.removedArtifactTypes.length > 0 ? (
                            diffSummary.removedArtifactTypes.map((artifactType: string) => (
                              <Badge key={`${version.id}-removed-${artifactType}`} variant="destructive">
                                {artifactType}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Changed
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diffSummary.changedArtifactTypes.length > 0 ? (
                            diffSummary.changedArtifactTypes.map((artifactType: string) => (
                              <Badge key={`${version.id}-changed-${artifactType}`} variant="outline">
                                {artifactType}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Confidence Drift
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diffSummary.confidenceChangedArtifactTypes.length > 0 ? (
                            diffSummary.confidenceChangedArtifactTypes.map((artifactType: string) => (
                              <Badge
                                key={`${version.id}-confidence-${artifactType}`}
                                variant="outline"
                              >
                                {artifactType}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Uncertainty Drift
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diffSummary.uncertaintyChangedArtifactTypes.length > 0 ? (
                            diffSummary.uncertaintyChangedArtifactTypes.map((artifactType: string) => (
                              <Badge key={`${version.id}-uncertainty-${artifactType}`} variant="outline">
                                {artifactType}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Escalation Drift
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {diffSummary.escalationChangedArtifactTypes.length > 0 ? (
                            diffSummary.escalationChangedArtifactTypes.map((artifactType: string) => (
                              <Badge key={`${version.id}-escalation-${artifactType}`} variant="outline">
                                {artifactType}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {versionArtifacts.length > 0 && (
                  <ul className="space-y-2 text-sm">
                    {versionArtifacts.map((artifact, index) => (
                      <li
                        key={`${version.id}-${artifact.artifactType}-${index}`}
                        className="rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{artifact.artifactType}</Badge>
                          <Badge variant="secondary">
                            {artifact.confidence.level} {Math.round(artifact.confidence.score * 100)}%
                          </Badge>
                        </div>
                        <div className="mt-2 text-muted-foreground">
                          {artifact.confidence.basis}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
