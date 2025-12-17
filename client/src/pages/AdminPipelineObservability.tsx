/**
 * Admin Pipeline Observability Dashboard
 * 
 * Monitors news pipeline execution health, AI processing quality, and source reliability.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, AlertTriangle, CheckCircle2, Clock, Database, TrendingUp } from "lucide-react";

export default function AdminPipelineObservability() {
  const [timeRange, setTimeRange] = useState(7);

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading } = trpc.pipelineObservability.getDashboardSummary.useQuery({
    days: timeRange,
  });

  // Fetch quality score trend
  const { data: qualityTrend, isLoading: trendLoading } = trpc.pipelineObservability.getQualityScoreTrend.useQuery({
    days: 30,
  });

  // Fetch recent executions
  const { data: recentExecutions, isLoading: executionsLoading } = trpc.pipelineObservability.getRecentExecutions.useQuery({
    limit: 20,
  });

  // Fetch failed executions
  const { data: failedExecutions, isLoading: failedLoading } = trpc.pipelineObservability.getFailedExecutions.useQuery({
    limit: 10,
  });

  if (summaryLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const {
    successRate,
    avgQualityScore,
    sourceReliability,
    performanceMetrics,
    qualityDistribution,
  } = summary || {};

  // Determine health status
  const getHealthStatus = () => {
    if (successRate === undefined || avgQualityScore === null || avgQualityScore === undefined) {
      return { status: "unknown", color: "gray" };
    }
    if (successRate >= 95 && avgQualityScore >= 0.7) return { status: "healthy", color: "green" };
    if (successRate >= 80 && avgQualityScore >= 0.5) return { status: "warning", color: "yellow" };
    return { status: "critical", color: "red" };
  };

  const health = getHealthStatus();

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline Observability</h1>
          <p className="text-muted-foreground mt-1">
            Monitor news ingestion pipeline health, AI quality, and source reliability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={health.status === "healthy" ? "default" : health.status === "warning" ? "secondary" : "destructive"}
            className="text-sm px-3 py-1"
          >
            <Activity className="w-4 h-4 mr-1" />
            {health.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === days
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Last {days} days
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate !== undefined ? successRate.toFixed(1) : "N/A"}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {successRate !== undefined && successRate >= 95 ? "Excellent" : successRate !== undefined && successRate >= 80 ? "Good" : "Needs attention"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Quality Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgQualityScore !== null && avgQualityScore !== undefined ? avgQualityScore.toFixed(2) : "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgQualityScore !== null && avgQualityScore !== undefined && avgQualityScore >= 0.7 ? "High quality" : avgQualityScore !== null && avgQualityScore !== undefined && avgQualityScore >= 0.5 ? "Acceptable" : "Low quality"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Reliability</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceReliability?.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sourceReliability?.totalSucceeded}/{sourceReliability?.totalAttempts} sources succeeded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.avgDurationMs
                ? `${(performanceMetrics.avgDurationMs / 1000).toFixed(1)}s`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {performanceMetrics?.avgItemsProcessed?.toFixed(0) || 0} items/run
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {health.status === "critical" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pipeline Health Critical</AlertTitle>
          <AlertDescription>
            Success rate or AI quality score below acceptable thresholds. Check failed executions and error logs.
          </AlertDescription>
        </Alert>
      )}

      {health.status === "warning" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pipeline Health Warning</AlertTitle>
          <AlertDescription>
            Pipeline performance degraded. Monitor quality metrics and source reliability.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">AI Quality</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Distribution</CardTitle>
              <CardDescription>Percentage of processed items with each quality attribute</CardDescription>
            </CardHeader>
            <CardContent>
              {qualityDistribution && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "Summary",
                        percentage: qualityDistribution.summaryRate,
                      },
                      {
                        name: "Regulation Tags",
                        percentage: qualityDistribution.regulationTagsRate,
                      },
                      {
                        name: "GS1 Impact Tags",
                        percentage: qualityDistribution.gs1ImpactTagsRate,
                      },
                      {
                        name: "Sector Tags",
                        percentage: qualityDistribution.sectorTagsRate,
                      },
                      {
                        name: "Recommendations",
                        percentage: qualityDistribution.recommendationsRate,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="percentage" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Quality Score Trend (30 days)</CardTitle>
              <CardDescription>Daily average quality scores for AI-processed news items</CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[300px]" />
              ) : qualityTrend && qualityTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip formatter={(value) => Number(value).toFixed(3)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgQualityScore"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Quality Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No quality trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest pipeline execution logs</CardDescription>
            </CardHeader>
            <CardContent>
              {executionsLoading ? (
                <Skeleton className="h-[400px]" />
              ) : recentExecutions && recentExecutions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Execution ID</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Quality</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentExecutions.map((exec) => (
                        <TableRow key={exec.id}>
                          <TableCell className="font-mono text-xs">
                            {exec.executionId.slice(0, 12)}...
                          </TableCell>
                          <TableCell>{new Date(exec.startedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                exec.status === "success"
                                  ? "default"
                                  : exec.status === "partial_success"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {exec.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {exec.durationMs ? `${(exec.durationMs / 1000).toFixed(1)}s` : "N/A"}
                          </TableCell>
                          <TableCell>
                            {exec.itemsSaved}/{exec.itemsProcessed}
                          </TableCell>
                          <TableCell>
                            {exec.aiAvgQualityScore ? exec.aiAvgQualityScore.toFixed(2) : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No execution logs available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failures Tab */}
        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Executions</CardTitle>
              <CardDescription>Pipeline executions that failed completely</CardDescription>
            </CardHeader>
            <CardContent>
              {failedLoading ? (
                <Skeleton className="h-[400px]" />
              ) : failedExecutions && failedExecutions.length > 0 ? (
                <div className="space-y-4">
                  {failedExecutions.map((exec) => (
                    <div key={exec.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm">{exec.executionId}</div>
                        <Badge variant="destructive">{exec.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(exec.startedAt).toLocaleString()}
                      </div>
                      {exec.errorMessages && (
                        <div className="bg-destructive/10 rounded p-3 text-sm">
                          <div className="font-medium mb-1">Errors:</div>
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(JSON.parse(exec.errorMessages), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No failed executions (excellent!)
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
