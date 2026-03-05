import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Database, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdvisoryDashboard() {
  const { data: overview, isLoading } = trpc.advisory.getOverview.useQuery();
  const { data: reportStats } = trpc.advisoryReports.stats.useQuery();
  const summary = overview?.summary;
  const latestReport = overview?.latestReport;
  const staleReportCount = reportStats?.stale?.count ?? 0;

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load advisory summary</p>
        </div>
      </div>
    );
  }

  const coverageRate = 
    ((summary.mappingResults.byConfidence.direct + summary.mappingResults.byConfidence.partial) / 
    summary.mappingResults.total * 100).toFixed(1);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">ISA Advisory Dashboard</h1>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Locked v{summary.version}
          </Badge>
          {staleReportCount > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {staleReportCount} stale report{staleReportCount === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {summary.advisoryId} • Published {summary.publicationDate}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Coverage Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Coverage Rate
            </CardTitle>
            <CardDescription>Direct + Partial mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{coverageRate}%</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direct</span>
                <Badge variant="default" className="bg-green-600">
                  {summary.mappingResults.byConfidence.direct}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partial</span>
                <Badge variant="default" className="bg-yellow-600">
                  {summary.mappingResults.byConfidence.partial}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Missing</span>
                <Badge variant="destructive">
                  {summary.mappingResults.byConfidence.missing}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gaps Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Gaps Identified
            </CardTitle>
            <CardDescription>By severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{summary.gaps.total}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Critical</span>
                <Badge variant="destructive">
                  {summary.gaps.bySeverity.critical}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moderate</span>
                <Badge variant="default" className="bg-orange-600">
                  {summary.gaps.bySeverity.moderate}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low Priority</span>
                <Badge variant="secondary">
                  {summary.gaps.bySeverity["low-priority"]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Recommendations
            </CardTitle>
            <CardDescription>By implementation timeframe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{summary.recommendations.total}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Short-term</span>
                <Badge variant="default" className="bg-green-600">
                  {summary.recommendations.byTimeframe["short-term"]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medium-term</span>
                <Badge variant="default" className="bg-blue-600">
                  {summary.recommendations.byTimeframe["medium-term"]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Long-term</span>
                <Badge variant="secondary">
                  {summary.recommendations.byTimeframe["long-term"]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEWS_HUB Staleness Signal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Staleness Signal
            </CardTitle>
            <CardDescription>NEWS_HUB → ADVISORY propagation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${staleReportCount > 0 ? "text-amber-600" : "text-green-600"}`}>
              {staleReportCount}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {staleReportCount > 0
                ? "Reports flagged for review due to recent regulatory change signals."
                : "No stale reports flagged by current change intelligence signals."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Advisory Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Advisory Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advisory ID</span>
              <span className="font-mono">{summary.advisoryId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono">{summary.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Publication Date</span>
              <span>{summary.publicationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Generated At</span>
              <span className="text-xs">{new Date(summary.generatedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dataset Registry</span>
              <Badge variant="outline">v{summary.datasetRegistryVersion}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Analysis Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Datapoints Analyzed</span>
              <span className="font-semibold">{summary.statistics.totalDatapoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Attributes Evaluated</span>
              <span className="font-semibold">{summary.statistics.totalAttributes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Records Used</span>
              <span className="font-semibold">{summary.statistics.totalRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regulations Covered</span>
              <span className="font-semibold">{summary.statistics.regulationsCovered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sector Models Covered</span>
              <span className="font-semibold">{summary.statistics.sectorsCovered}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/advisory/explorer">
          <Button size="lg">
            <FileText className="h-4 w-4 mr-2" />
            Explore Advisory Details
          </Button>
        </Link>
        <Link href="/advisory/traceability">
          <Button size="lg" variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            View Traceability
          </Button>
        </Link>
        {latestReport && (
          <Link href={`/advisory-reports/${latestReport.id}`}>
            <Button size="lg" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              View Latest Report
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
