import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Calendar,
  Eye,
  FileSearch,
  GitCompare,
  Layers3,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DecisionArtifactCard } from "@/components/DecisionArtifactCard";
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
  formatAdvisoryEnumLabel,
  formatAdvisoryTimestamp,
  formatAdvisoryVersionLabel,
  formatDecisionArtifactConfidenceDelta,
  formatDecisionArtifactCount,
  getAdvisoryLaneStatusTone,
  getAdvisoryPublicationStatusTone,
  getAdvisoryReviewStatusTone,
  getDecisionArtifactDiffTone,
  normalizeDecisionArtifacts,
} from "@/lib/advisory-report-ui";
import { trpc } from "@/lib/trpc";

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

export default function AdvisoryDiff() {
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
  const currentArtifact = currentArtifacts[0] ?? null;
  const snapshotArtifact = snapshotArtifacts[0] ?? null;
  const diffSummary = selectedSnapshot?.decisionArtifactDiff ?? null;

  const reviewTone = selectedReport
    ? getAdvisoryReviewStatusTone(selectedReport.reviewStatus)
    : null;
  const publicationTone = selectedReport
    ? getAdvisoryPublicationStatusTone(selectedReport.publicationStatus)
    : null;
  const laneTone = selectedReport ? getAdvisoryLaneStatusTone(selectedReport.laneStatus) : null;
  const diffTone = getDecisionArtifactDiffTone(Boolean(diffSummary?.hasChanges));

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-600">
            <GitCompare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Advisory Diff Overview</h1>
            <p className="text-muted-foreground mt-1">
              Snapshot-backed drift overview for current advisory reports versus persisted
              advisory report versions.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a report and snapshot</CardTitle>
          <CardDescription>
            This overview replaces the legacy static diff JSON flow with persisted
            `advisory_reports` and `advisory_report_versions`.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.4fr_1.4fr_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report</label>
            <Select value={selectedReportId} onValueChange={setSelectedReportId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select advisory report" />
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
            No advisory reports are available yet. Persist reports before using the diff overview.
          </AlertDescription>
        </Alert>
      )}

      {selectedReport && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {formatAdvisoryEnumLabel(selectedReport.reportType)}
                    </Badge>
                    {reviewTone && (
                      <Badge variant={reviewTone.variant} className={reviewTone.className}>
                        {formatAdvisoryEnumLabel(selectedReport.reviewStatus)}
                      </Badge>
                    )}
                    {publicationTone && (
                      <Badge variant={publicationTone.variant} className={publicationTone.className}>
                        {formatAdvisoryEnumLabel(selectedReport.publicationStatus)}
                      </Badge>
                    )}
                    {laneTone && (
                      <Badge variant={laneTone.variant} className={laneTone.className}>
                        {formatAdvisoryEnumLabel(selectedReport.laneStatus)}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {formatDecisionArtifactCount(currentArtifacts.length)}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{selectedReport.title}</CardTitle>
                  <CardDescription>
                    Start with the latest snapshot-backed drift summary, then drill into the full
                    compare or report detail surfaces.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/advisory/compare">
                      <GitCompare className="h-4 w-4 mr-2" />
                      Full compare
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/advisory-reports/${selectedReport.id}`}>
                      <FileSearch className="h-4 w-4 mr-2" />
                      Report detail
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Current report
                </div>
                <div className="mt-2 font-medium">
                  {formatAdvisoryVersionLabel(selectedReport.version)}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Snapshot
                </div>
                <div className="mt-2 font-medium">
                  {selectedSnapshot
                    ? formatAdvisoryVersionLabel(selectedSnapshot.version)
                    : "No snapshot"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Generated
                </div>
                <div className="mt-2 flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatAdvisoryTimestamp(selectedReport.generatedDate)}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Snapshot created
                </div>
                <div className="mt-2 flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatAdvisoryTimestamp(selectedSnapshot?.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {!selectedSnapshot && (
            <Alert>
              <AlertDescription>
                This report does not have any persisted snapshots yet. Create a report version to
                enable snapshot-backed diffing.
              </AlertDescription>
            </Alert>
          )}

          {selectedSnapshot && diffSummary && (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        Decision Artifact Drift
                      </CardTitle>
                      <CardDescription>
                        Current report versus persisted snapshot, using the stored
                        `decisionArtifactDiff` summary.
                      </CardDescription>
                    </div>
                    <Badge variant={diffTone.variant} className={diffTone.className}>
                      {diffSummary.hasChanges ? "Changes detected" : "No changes detected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Changed types
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {diffSummary.changedArtifactTypes.length}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Added types
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {diffSummary.addedArtifactTypes.length}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Removed types
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {diffSummary.removedArtifactTypes.length}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Avg confidence delta
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {formatDecisionArtifactConfidenceDelta(
                          diffSummary.averageConfidenceDelta ?? null,
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="text-sm font-medium">Added artifact types</div>
                      <div className="flex flex-wrap gap-2">
                        {renderArtifactTypeBadges(diffSummary.addedArtifactTypes, "secondary")}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="text-sm font-medium">Removed artifact types</div>
                      <div className="flex flex-wrap gap-2">
                        {renderArtifactTypeBadges(diffSummary.removedArtifactTypes, "destructive")}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="text-sm font-medium">Changed artifact types</div>
                      <div className="flex flex-wrap gap-2">
                        {renderArtifactTypeBadges(diffSummary.changedArtifactTypes, "outline")}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="text-sm font-medium">Confidence drift</div>
                      <div className="flex flex-wrap gap-2">
                        {renderArtifactTypeBadges(
                          diffSummary.confidenceChangedArtifactTypes,
                          "outline",
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Snapshot provenance
                  </CardTitle>
                  <CardDescription>
                    Both sides of this overview come from persisted advisory report surfaces.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Current artifacts
                    </div>
                    <div className="mt-2 font-medium">
                      {formatDecisionArtifactCount(currentArtifacts.length)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Snapshot artifacts
                    </div>
                    <div className="mt-2 font-medium">
                      {formatDecisionArtifactCount(snapshotArtifacts.length)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Lane
                    </div>
                    <div className="mt-2 font-medium">
                      {formatAdvisoryEnumLabel(selectedReport.laneStatus)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Snapshot age
                    </div>
                    <div className="mt-2 font-medium">
                      {formatAdvisoryTimestamp(selectedSnapshot.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedSnapshot && (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-slate-700" />
                  <h2 className="text-xl font-semibold">Current report artifact preview</h2>
                </div>
                {currentArtifact ? (
                  <DecisionArtifactCard
                    artifact={currentArtifact}
                    title="Current report artifact"
                    description="Representative decision artifact from the current advisory report."
                  />
                ) : (
                  <Alert>
                    <AlertDescription>
                      No decision artifacts are stored on the current advisory report.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-slate-700" />
                  <h2 className="text-xl font-semibold">Snapshot artifact preview</h2>
                </div>
                {snapshotArtifact ? (
                  <DecisionArtifactCard
                    artifact={snapshotArtifact}
                    title="Persisted snapshot artifact"
                    description="Representative decision artifact captured in the selected report version."
                  />
                ) : (
                  <Alert>
                    <AlertDescription>
                      The selected snapshot does not carry persisted decision artifacts yet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
