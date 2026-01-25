import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, CheckCircle2, XCircle, Clock, TrendingUp, Database, Zap } from 'lucide-react';

export default function ObservabilityDashboard() {
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  // Fetch metrics
  const { data: recentExecutions, isLoading: loadingExecutions } = trpc.observability.getRecentExecutions.useQuery({ limit: 20 });
  const { data: successRate, isLoading: loadingSuccessRate } = trpc.observability.getSuccessRate.useQuery({ days: timeRange });
  const { data: avgQualityScore, isLoading: loadingQualityScore } = trpc.observability.getAverageQualityScore.useQuery({ days: timeRange });
  const { data: sourceReliability, isLoading: loadingSourceReliability } = trpc.observability.getSourceReliability.useQuery({ days: timeRange });
  const { data: performance, isLoading: loadingPerformance } = trpc.observability.getPerformanceMetrics.useQuery({ days: timeRange });
  const { data: qualityDistribution, isLoading: loadingQualityDistribution } = trpc.observability.getQualityDistribution.useQuery({ days: timeRange });

  const isLoading = loadingExecutions || loadingSuccessRate || loadingQualityScore || loadingSourceReliability || loadingPerformance || loadingQualityDistribution;

  // Format duration
  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format timestamp
  const formatTimestamp = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case 'partial_success':
        return <Badge className="bg-yellow-500"><Activity className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline Observability</h1>
          <p className="text-muted-foreground mt-2">
            Monitor news ingestion pipeline health, performance, and quality metrics
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-md ${timeRange === 7 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-md ${timeRange === 30 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
          >
            Last 30 days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${successRate?.toFixed(1) || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Pipeline executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : avgQualityScore ? `${(avgQualityScore * 100).toFixed(0)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              AI processing quality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Reliability</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${sourceReliability?.successRate.toFixed(1) || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {sourceReliability?.totalSucceeded || 0}/{sourceReliability?.totalAttempts || 0} sources
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
              {isLoading ? '...' : formatDuration(performance?.avgDurationMs || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per execution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics Distribution */}
      {qualityDistribution && qualityDistribution.totalProcessed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics Distribution</CardTitle>
            <CardDescription>Percentage of items with each quality attribute</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Summary</div>
                <div className="text-2xl font-bold">{qualityDistribution.summaryRate.toFixed(0)}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Regulation Tags</div>
                <div className="text-2xl font-bold">{qualityDistribution.regulationTagsRate.toFixed(0)}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">GS1 Impact Tags</div>
                <div className="text-2xl font-bold">{qualityDistribution.gs1ImpactTagsRate.toFixed(0)}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Sector Tags</div>
                <div className="text-2xl font-bold">{qualityDistribution.sectorTagsRate.toFixed(0)}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommendations</div>
                <div className="text-2xl font-bold">{qualityDistribution.recommendationsRate.toFixed(0)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Executions</CardTitle>
          <CardDescription>Last 20 pipeline runs with detailed metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading executions...</div>
          ) : !recentExecutions || recentExecutions.length === 0 ? (
            <Alert>
              <AlertDescription>
                No pipeline executions found. The pipeline has not run yet or data is not available.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {execution.executionId}
                        </span>
                        {getStatusBadge(execution.status)}
                        <Badge variant="outline">{execution.triggeredBy}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimestamp(execution.startedAt)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">
                        {formatDuration(execution.durationMs)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {execution.itemsSaved} items saved
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Sources</div>
                      <div className="font-medium">
                        {execution.sourcesSucceeded}/{execution.sourcesAttempted}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fetched</div>
                      <div className="font-medium">{execution.itemsFetched}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Processed</div>
                      <div className="font-medium">{execution.itemsProcessed}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">AI Calls</div>
                      <div className="font-medium">
                        {execution.aiCallsSucceeded}/{execution.aiCallsMade}
                      </div>
                    </div>
                  </div>

                  {execution.aiAvgQualityScore !== null && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">Quality Score:</div>
                      <div className="text-sm font-medium">
                        {(execution.aiAvgQualityScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}

                  {execution.errorCount > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {execution.errorCount} error{execution.errorCount > 1 ? 's' : ''} occurred
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
