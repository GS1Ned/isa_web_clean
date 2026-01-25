import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Advisory Diff Comparison Page
 *
 * Visualizes differences between ISA advisory versions using canonical diff metrics.
 * Implements metrics from docs/ADVISORY_DIFF_METRICS.md
 */

export default function AdvisoryDiffComparison() {
  const [version1, setVersion1] = useState("v1.0");
  const [version2, setVersion2] = useState("v1.1");

  // Fetch available versions
  const versionsQuery = trpc.advisoryDiff.listVersions.useQuery();

  // Fetch diff data
  const diffQuery = trpc.advisoryDiff.computeDiff.useQuery(
    { version1, version2 },
    { enabled: !!version1 && !!version2 && version1 !== version2 }
  );

  const handleCompare = () => {
    diffQuery.refetch();
  };

  const renderConfidenceTransitions = () => {
    if (!diffQuery.data?.coverageDeltas?.confidenceTransitions) return null;

    const transitions = diffQuery.data.coverageDeltas.confidenceTransitions;
    const improvements = [
      { key: "missing_to_partial", label: "Missing → Partial", color: "text-blue-600" },
      { key: "missing_to_direct", label: "Missing → Direct", color: "text-green-600" },
      { key: "partial_to_direct", label: "Partial → Direct", color: "text-green-600" },
    ];

    const regressions = [
      { key: "direct_to_partial", label: "Direct → Partial", color: "text-orange-600" },
      { key: "partial_to_missing", label: "Partial → Missing", color: "text-red-600" },
      { key: "direct_to_missing", label: "Direct → Missing", color: "text-red-600" },
    ];

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {/* Improvements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {improvements.map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Badge className={color}>{transitions[key as keyof typeof transitions]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regressions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Regressions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {regressions.map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Badge className={color}>{transitions[key as keyof typeof transitions]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCoverageMetrics = () => {
    if (!diffQuery.data?.coverageDeltas) return null;

    const { totalMappings, coverageRate, coverageImprovement } = diffQuery.data.coverageDeltas;

    return (
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalMappings?.[version1]}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalMappings?.[version2]}</span>
              {totalMappings?.delta !== 0 && (
                <Badge variant={totalMappings?.delta > 0 ? "default" : "destructive"}>
                  {totalMappings?.delta > 0 ? "+" : ""}{totalMappings?.delta}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Coverage Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {((coverageRate?.[version1] || 0) * 100).toFixed(1)}%
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {((coverageRate?.[version2] || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {coverageImprovement > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : coverageImprovement < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <Minus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-2xl font-bold">
                {((coverageImprovement || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGapLifecycle = () => {
    if (!diffQuery.data?.gapLifecycle) return null;

    const { newGaps, closedGaps, severityChanges, gapClosureRate, criticalGapReduction } =
      diffQuery.data.gapLifecycle;

    return (
      <div className="space-y-4">
        {/* Gap Closure Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Gap Closure Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">
                  {((gapClosureRate || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {closedGaps?.length || 0} gaps closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Critical Gap Reduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold">
                  {((criticalGapReduction || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reduction in critical gaps
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closed Gaps */}
        {closedGaps && closedGaps.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Closed Gaps ({closedGaps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {closedGaps.map((gap: any) => (
                  <div
                    key={gap.gapId}
                    className="flex items-start justify-between gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{gap.title}</p>
                      <p className="text-xs text-muted-foreground">{gap.gapId}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {gap.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Gaps */}
        {newGaps && newGaps.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-600" />
                New Gaps ({newGaps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {newGaps.map((gap: any) => (
                  <div
                    key={gap.gapId}
                    className="flex items-start justify-between gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-950"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{gap.title}</p>
                      <p className="text-xs text-muted-foreground">{gap.gapId}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {gap.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Severity Changes */}
        {severityChanges && severityChanges.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Severity Changes ({severityChanges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {severityChanges.map((change: any) => (
                  <div
                    key={change.gapId}
                    className="flex items-start justify-between gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{change.gapId}</p>
                      <p className="text-xs text-muted-foreground">{change.reason}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {change[version1]}
                      </Badge>
                      <ArrowRight className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs">
                        {change[version2]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <GitCompare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Advisory Version Comparison</h1>
            <p className="text-muted-foreground mt-1">
              Compare ISA advisory versions to track coverage improvements and gap closure
            </p>
          </div>
        </div>

        {/* Version Selectors */}
        <Card>
          <CardHeader>
            <CardTitle>Select Versions to Compare</CardTitle>
            <CardDescription>
              Choose two advisory versions to compute diff metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Base Version</label>
                <Select value={version1} onValueChange={setVersion1}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versionsQuery.data?.map((v: any) => (
                      <SelectItem key={v.version} value={v.version}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground mt-6" />

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Compare Version</label>
                <Select value={version2} onValueChange={setVersion2}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versionsQuery.data?.map((v: any) => (
                      <SelectItem key={v.version} value={v.version}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCompare}
                disabled={!version1 || !version2 || version1 === version2 || diffQuery.isFetching}
                className="mt-6"
              >
                {diffQuery.isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Computing...
                  </>
                ) : (
                  <>
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diff Results */}
      {diffQuery.data && (
        <Tabs defaultValue="coverage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coverage">Coverage Deltas</TabsTrigger>
            <TabsTrigger value="gaps">Gap Lifecycle</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="coverage" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Coverage Deltas</h2>
              <p className="text-muted-foreground mb-6">
                Track mapping confidence transitions and coverage rate improvements
              </p>

              {renderCoverageMetrics()}
              <Separator className="my-6" />
              {renderConfidenceTransitions()}
            </div>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Gap Lifecycle</h2>
              <p className="text-muted-foreground mb-6">
                Track gap creation, closure, and severity changes
              </p>

              {renderGapLifecycle()}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Recommendation Lifecycle</h2>
              <p className="text-muted-foreground mb-6">
                Track recommendation implementation progress
              </p>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Recommendation lifecycle metrics coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!diffQuery.data && !diffQuery.isFetching && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <GitCompare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Comparison Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Select two different advisory versions and click "Compare" to view diff metrics
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {diffQuery.isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Failed to compute diff: {diffQuery.error?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
