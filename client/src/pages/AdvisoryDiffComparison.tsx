import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  ArrowRight,
  Calendar,
  Eye,
  FileText,
  GitCompare,
  Layers3,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  DecisionArtifactCard,
  type DecisionArtifactCardData,
} from "@/components/DecisionArtifactCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatAdvisoryVersionLabel,
  formatDecisionArtifactConfidenceDelta,
  formatDecisionArtifactCount,
  getDecisionArtifactDiffTone,
} from "@/lib/advisory-report-ui";
import { trpc } from "@/lib/trpc";

/**
 * Advisory Diff Comparison Page
 *
 * Compares persisted advisory report snapshots against the current report state.
 * Uses advisory_reports + advisory_report_versions instead of legacy file-based JSON diffs.
 */

function isDecisionArtifactCardData(value: unknown): value is DecisionArtifactCardData {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as DecisionArtifactCardData).artifactVersion === "string" &&
    typeof (value as DecisionArtifactCardData).artifactType === "string" &&
    typeof (value as DecisionArtifactCardData).capability === "string" &&
    typeof (value as DecisionArtifactCardData).confidence?.level === "string" &&
    typeof (value as DecisionArtifactCardData).confidence?.score === "number" &&
    typeof (value as DecisionArtifactCardData).confidence?.basis === "string"
  );
}

function normalizeDecisionArtifacts(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as DecisionArtifactCardData[];
  }

  return value.filter(isDecisionArtifactCardData);
}

function formatTimestamp(value?: string | Date | null) {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : format(date, "MMMM d, yyyy 'at' HH:mm");
}

function renderArtifactTypeBadges(
  values: string[],
  variant: "outline" | "secondary" | "destructive",
) {
  if (values.length === 0) {
    return <span className="text-muted-foreground">None</span>;
  }

  return values.map(value => (
    <Badge key={value} variant={variant}>
      {value}
    </Badge>
  ));
}

export default function AdvisoryDiffComparison() {
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedSnapshotId, setSelectedSnapshotId] = useState("");

  const reportsQuery = trpc.advisoryReports.list.useQuery();
  const reports = reportsQuery.data ?? [];

  const versionsQuery = trpc.advisoryReports.versions.useQuery(
    { reportId: Number(selectedReportId) },
    { enabled: Number(selectedReportId) > 0 },
  );
  const versions = versionsQuery.data ?? [];

  useEffect(() => {
    if (!selectedReportId && reports.length > 0) {
      setSelectedReportId(String(reports[0].id));
    }
  }, [reports, selectedReportId]);

  useEffect(() => {
    if (versions.length === 0) {
      if (selectedSnapshotId) {
        setSelectedSnapshotId("");
      }
      return;
    }

    if (!versions.some(version => String(version.id) === selectedSnapshotId)) {
      setSelectedSnapshotId(String(versions[0].id));
    }
  }, [selectedSnapshotId, versions]);

  const selectedReport = useMemo(
    () => reports.find(report => String(report.id) === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  const selectedSnapshot = useMemo(
    () => versions.find(version => String(version.id) === selectedSnapshotId) ?? null,
    [selectedSnapshotId, versions],
  );

  const currentArtifacts = normalizeDecisionArtifacts(selectedReport?.decisionArtifacts);
  const snapshotArtifacts = normalizeDecisionArtifacts(selectedSnapshot?.decisionArtifacts);
  const diffSummary = selectedSnapshot?.decisionArtifactDiff ?? null;
  const diffTone = getDecisionArtifactDiffTone(Boolean(diffSummary?.hasChanges));

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg">
            <GitCompare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Advisory Snapshot Comparison</h1>
            <p className="text-muted-foreground mt-1">
              Compare current advisory reports against persisted version snapshots backed by
              `advisory_reports` and `advisory_report_versions`.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a report and snapshot</CardTitle>
          <CardDescription>
            This compare surface now prefers persisted advisory snapshots over legacy static diff
            JSON files.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.4fr_1.4fr_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report</label>
            <Select value={selectedReportId} onValueChange={setSelectedReportId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {reports.map(report => (
                  <SelectItem key={report.id} value={String(report.id)}>
                    {report.title} ({formatAdvisoryVersionLabel(report.version)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Snapshot version</label>
            <Select
              value={selectedSnapshotId}
              onValueChange={setSelectedSnapshotId}
              disabled={!selectedReportId || versionsQuery.isLoading || versions.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={versionsQuery.isLoading ? "Loading snapshots..." : "Select snapshot"}
                />
              </SelectTrigger>
              <SelectContent>
                {versions.map(version => (
                  <SelectItem key={version.id} value={String(version.id)}>
                    {formatAdvisoryVersionLabel(version.version)} snapshot
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button asChild variant="outline" disabled={!selectedReport}>
              <Link href={selectedReport ? `/advisory-reports/${selectedReport.id}` : "/advisory-reports"}>
                <Eye className="h-4 w-4 mr-2" />
                View report
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportsQuery.isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading advisory reports...
            </div>
          </CardContent>
        </Card>
      )}

      {!reportsQuery.isLoading && reports.length === 0 && (
        <Alert>
          <AlertDescription>
            No advisory reports are available yet. Create or persist advisory reports before using
            the snapshot compare surface.
          </AlertDescription>
        </Alert>
      )}

      {selectedReport && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-700" />
                    {selectedReport.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Compare the current advisory report against one persisted snapshot.
                  </CardDescription>
                </div>
                {Array.isArray(selectedReport.decisionArtifacts) &&
                  selectedReport.decisionArtifacts.length > 0 && (
                    <Badge variant="secondary">
                      {formatDecisionArtifactCount(selectedReport.decisionArtifacts.length)}
                    </Badge>
                  )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Current Report
                </div>
                <div className="mt-2 font-medium">
                  {formatAdvisoryVersionLabel(selectedReport.version)}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Generated
                </div>
                <div className="mt-2 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatTimestamp(selectedReport.generatedDate)}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Review Status
                </div>
                <div className="mt-2 font-medium">{selectedReport.reviewStatus}</div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Views
                </div>
                <div className="mt-2 font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  {selectedReport.viewCount ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>

          {versionsQuery.isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading report snapshots...
                </div>
              </CardContent>
            </Card>
          )}

          {!versionsQuery.isLoading && versions.length === 0 && (
            <Alert>
              <AlertDescription>
                This report has no persisted version snapshots yet. Create a version snapshot to
                compare against the current report state.
              </AlertDescription>
            </Alert>
          )}

          {selectedSnapshot && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GitCompare className="h-5 w-5 text-slate-700" />
                        Snapshot Comparison Summary
                      </CardTitle>
                      <CardDescription>
                        Current report vs {formatAdvisoryVersionLabel(selectedSnapshot.version)} snapshot
                      </CardDescription>
                    </div>
                    {diffSummary && (
                      <Badge variant={diffTone.variant} className={diffTone.className}>
                        {diffSummary.hasChanges ? "Artifact drift detected" : "No artifact drift"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Snapshot Version
                      </div>
                      <div className="mt-2 font-medium">
                        {formatAdvisoryVersionLabel(selectedSnapshot.version)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Snapshot Created
                      </div>
                      <div className="mt-2 font-medium">
                        {formatTimestamp(selectedSnapshot.createdAt)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Snapshot Artifacts
                      </div>
                      <div className="mt-2 font-medium">
                        {formatDecisionArtifactCount(snapshotArtifacts.length)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Confidence Delta
                      </div>
                      <div className="mt-2 font-medium">
                        {formatDecisionArtifactConfidenceDelta(
                          diffSummary?.averageConfidenceDelta ?? null,
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSnapshot.changeLog && (
                    <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                      <div className="font-medium mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-slate-600" />
                        Snapshot Change Log
                      </div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {selectedSnapshot.changeLog}
                      </div>
                    </div>
                  )}

                  {diffSummary && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-lg border bg-muted/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Added In Current
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {renderArtifactTypeBadges(diffSummary.addedArtifactTypes, "secondary")}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Removed From Current
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {renderArtifactTypeBadges(diffSummary.removedArtifactTypes, "destructive")}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Changed
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {renderArtifactTypeBadges(diffSummary.changedArtifactTypes, "outline")}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Confidence Drift
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {renderArtifactTypeBadges(
                            diffSummary.confidenceChangedArtifactTypes,
                            "outline",
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-slate-700" />
                      Current Report Artifacts
                    </CardTitle>
                    <CardDescription>
                      Decision artifacts attached to the current advisory report.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentArtifacts.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No decision artifacts are attached to the current report.
                      </div>
                    )}
                    {currentArtifacts.map((artifact, index) => (
                      <DecisionArtifactCard
                        key={`current-${artifact.artifactType}-${index}`}
                        artifact={artifact}
                        title={`Current Artifact ${index + 1}`}
                        description="Persisted current-state decision artifact."
                      />
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers3 className="h-5 w-5 text-slate-700" />
                      Snapshot Artifacts
                    </CardTitle>
                    <CardDescription>
                      Persisted advisory version snapshot used for governed comparison.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {snapshotArtifacts.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No decision artifacts were captured on this snapshot.
                      </div>
                    )}
                    {snapshotArtifacts.map((artifact, index) => (
                      <DecisionArtifactCard
                        key={`snapshot-${artifact.artifactType}-${index}`}
                        artifact={artifact}
                        title={`Snapshot Artifact ${index + 1}`}
                        description="Persisted advisory version snapshot artifact."
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
