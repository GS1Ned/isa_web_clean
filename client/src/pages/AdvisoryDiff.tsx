import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  FileText
} from "lucide-react";

interface AdvisoryDiffData {
  metadata: {
    comparisonDate: string;
    version1: {
      advisoryId: string;
      version: string;
      publicationDate: string;
    };
    version2: {
      advisoryId: string;
      version: string;
      publicationDate: string;
    };
  };
  coverageDeltas: {
    totalMappings: {
      "v1.0": number;
      "v1.1"?: number;
      delta: number;
    };
    confidenceTransitions: {
      missing_to_partial: number;
      missing_to_direct: number;
      partial_to_direct: number;
      direct_to_partial: number;
      partial_to_missing: number;
      direct_to_missing: number;
    };
    confidenceDistribution: {
      "v1.0": {
        direct: number;
        partial: number;
        missing: number;
      };
      "v1.1"?: {
        direct: number;
        partial: number;
        missing: number;
      };
    };
    coverageRate: {
      "v1.0": number;
      "v1.1"?: number;
    };
    coverageImprovement: number;
    newMappings: number;
    removedMappings: number;
  };
  gapLifecycle: {
    totalGaps: {
      "v1.0": number;
      "v1.1"?: number;
      delta: number;
    };
    gapsClosed: number;
    newGaps: number;
    severityChanges: number;
    severityDistribution: {
      "v1.0": {
        critical: number;
        moderate: number;
        "low-priority": number;
      };
      "v1.1"?: {
        critical: number;
        moderate: number;
        "low-priority": number;
      };
    };
    closedGaps: any[];
    newGapsDetails: any[];
    severityChangeDetails: any[];
  };
  recommendationLifecycle: {
    totalRecommendations: {
      "v1.0": number;
      "v1.1"?: number;
      delta: number;
    };
    implemented: number;
    newRecommendations: number;
    timeframeChanges: number;
    timeframeDistribution: {
      "v1.0": {
        "short-term": number;
        "medium-term": number;
        "long-term": number;
      };
      "v1.1"?: {
        "short-term": number;
        "medium-term": number;
        "long-term": number;
      };
    };
    implementedDetails: any[];
    newRecommendationsDetails: any[];
    timeframeChangeDetails: any[];
  };
  compositeMetrics: {
    overallProgressScore: number;
    componentScores: {
      coverage: number;
      gapClosure: number;
      recommendationImplementation: number;
    };
    regressionDetected: boolean;
    regressions: any[];
  };
}

export default function AdvisoryDiff() {
  const [version1] = useState("v1.0");
  const [version2] = useState("v1.0");
  
  const { data: diffData, isLoading: loading, error } = trpc.advisory.getDiff.useQuery({
    version1,
    version2,
  });

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-7xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message || "Failed to load advisory diff data"}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!diffData) {
    return (
      <div className="container py-8 max-w-7xl">
        <Alert>
          <AlertDescription>No diff data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { metadata, coverageDeltas, gapLifecycle, recommendationLifecycle, compositeMetrics } = diffData;

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Advisory Diff Analysis</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {metadata.version1.version}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {metadata.version2.version}
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground">
          Governance-grade comparison of ISA advisory versions
        </p>
      </div>

      {/* Version Comparison Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            Version Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">From</div>
              <div className="text-2xl font-bold">{metadata.version1.version}</div>
              <div className="text-sm text-muted-foreground">{metadata.version1.publicationDate}</div>
            </div>
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">To</div>
              <div className="text-2xl font-bold">{metadata.version2.version}</div>
              <div className="text-sm text-muted-foreground">{metadata.version2.publicationDate}</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Comparison performed: {new Date(metadata.comparisonDate).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Progress Score</CardTitle>
          <CardDescription>
            Composite metric measuring advisory evolution quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">
              {compositeMetrics.overallProgressScore.toFixed(1)}%
            </div>
            {compositeMetrics.regressionDetected && (
              <Alert variant="destructive" className="flex-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Regression detected: {compositeMetrics.regressions.length} issue(s)
                </AlertDescription>
              </Alert>
            )}
            {!compositeMetrics.regressionDetected && compositeMetrics.overallProgressScore === 0 && (
              <Alert className="flex-1">
                <AlertDescription>
                  No changes detected between versions
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-sm text-muted-foreground">Coverage</div>
              <div className="text-2xl font-bold">{compositeMetrics.componentScores.coverage.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Gap Closure</div>
              <div className="text-2xl font-bold">{compositeMetrics.componentScores.gapClosure.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Recommendations</div>
              <div className="text-2xl font-bold">{compositeMetrics.componentScores.recommendationImplementation.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Deltas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Coverage Deltas
          </CardTitle>
          <CardDescription>
            Changes in regulation-to-standard mapping coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Mappings</div>
              <div className="text-2xl font-bold">
                {coverageDeltas.totalMappings["v1.0"]}
                {coverageDeltas.totalMappings.delta !== 0 && (
                  <span className={`text-base ml-2 ${coverageDeltas.totalMappings.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coverageDeltas.totalMappings.delta > 0 ? '+' : ''}{coverageDeltas.totalMappings.delta}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Coverage Rate</div>
              <div className="text-2xl font-bold">
                {(coverageDeltas.coverageRate["v1.0"] * 100).toFixed(1)}%
                {coverageDeltas.coverageImprovement !== 0 && (
                  <span className={`text-base ml-2 ${coverageDeltas.coverageImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coverageDeltas.coverageImprovement > 0 ? '+' : ''}{(coverageDeltas.coverageImprovement * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">New Mappings</div>
              <div className="text-2xl font-bold text-green-600">
                {coverageDeltas.newMappings}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Removed Mappings</div>
              <div className="text-2xl font-bold text-red-600">
                {coverageDeltas.removedMappings}
              </div>
            </div>
          </div>

          {/* Confidence Transitions */}
          <div>
            <h4 className="font-semibold mb-3">Confidence Transitions</h4>
            <div className="grid grid-cols-3 gap-3">
              {/* Improvements */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-600">Improvements</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Missing → Partial</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceTransitions.missing_to_partial}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Missing → Direct</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceTransitions.missing_to_direct}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partial → Direct</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceTransitions.partial_to_direct}</Badge>
                  </div>
                </div>
              </div>

              {/* Regressions */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-red-600">Regressions</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Direct → Partial</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceTransitions.direct_to_partial}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partial → Missing</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceTransitions.partial_to_missing}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Direct → Missing</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceTransitions.direct_to_missing}</Badge>
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Distribution</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Direct</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceDistribution["v1.0"].direct}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partial</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceDistribution["v1.0"].partial}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Missing</span>
                    <Badge variant="secondary">{coverageDeltas.confidenceDistribution["v1.0"].missing}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Lifecycle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Gap Lifecycle
          </CardTitle>
          <CardDescription>
            Evolution of identified gaps and their severity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Gaps</div>
              <div className="text-2xl font-bold">
                {gapLifecycle.totalGaps["v1.0"]}
                {gapLifecycle.totalGaps.delta !== 0 && (
                  <span className={`text-base ml-2 ${gapLifecycle.totalGaps.delta < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gapLifecycle.totalGaps.delta > 0 ? '+' : ''}{gapLifecycle.totalGaps.delta}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Gaps Closed</div>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {gapLifecycle.gapsClosed}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">New Gaps</div>
              <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {gapLifecycle.newGaps}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Severity Changes</div>
              <div className="text-2xl font-bold">
                {gapLifecycle.severityChanges}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Severity Distribution</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex justify-between text-sm">
                <span>Critical</span>
                <Badge variant="destructive">{gapLifecycle.severityDistribution["v1.0"].critical}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Moderate</span>
                <Badge variant="secondary">{gapLifecycle.severityDistribution["v1.0"].moderate}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Priority</span>
                <Badge variant="outline">{gapLifecycle.severityDistribution["v1.0"]["low-priority"]}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recommendation Lifecycle
          </CardTitle>
          <CardDescription>
            Evolution of strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Recommendations</div>
              <div className="text-2xl font-bold">
                {recommendationLifecycle.totalRecommendations["v1.0"]}
                {recommendationLifecycle.totalRecommendations.delta !== 0 && (
                  <span className={`text-base ml-2 ${recommendationLifecycle.totalRecommendations.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recommendationLifecycle.totalRecommendations.delta > 0 ? '+' : ''}{recommendationLifecycle.totalRecommendations.delta}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Implemented</div>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {recommendationLifecycle.implemented}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">New Recommendations</div>
              <div className="text-2xl font-bold text-blue-600">
                {recommendationLifecycle.newRecommendations}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Timeframe Changes</div>
              <div className="text-2xl font-bold">
                {recommendationLifecycle.timeframeChanges}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Timeframe Distribution</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex justify-between text-sm">
                <span>Short-term</span>
                <Badge variant="secondary">{recommendationLifecycle.timeframeDistribution["v1.0"]["short-term"]}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium-term</span>
                <Badge variant="secondary">{recommendationLifecycle.timeframeDistribution["v1.0"]["medium-term"]}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Long-term</span>
                <Badge variant="secondary">{recommendationLifecycle.timeframeDistribution["v1.0"]["long-term"]}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
