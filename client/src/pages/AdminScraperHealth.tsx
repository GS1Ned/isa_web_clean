import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, TrendingDown, TrendingUp, XCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuccessRateTrendChart from "@/components/charts/SuccessRateTrendChart";
import ItemsFetchedTrendChart from "@/components/charts/ItemsFetchedTrendChart";
import DurationTrendChart from "@/components/charts/DurationTrendChart";

export default function AdminScraperHealth() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(24);

  // Query all sources health
  const { data: allSources, isLoading: loadingSources, refetch: refetchSources } = trpc.scraperHealth.getAllSourcesHealth.useQuery();

  // Query execution stats
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = trpc.scraperHealth.getExecutionStats.useQuery({
    hoursBack: timeRange,
  });

  // Query recent failures
  const { data: recentFailures, isLoading: loadingFailures } = trpc.scraperHealth.getRecentFailures.useQuery({
    limit: 10,
  });

  // Query execution history for selected source
  const { data: executionHistory, isLoading: loadingHistory } = trpc.scraperHealth.getExecutionHistory.useQuery(
    {
      sourceId: selectedSource || "",
      limit: 20,
    },
    {
      enabled: !!selectedSource,
    }
  );

  // Query trend data for charts
  const { data: trendData, isLoading: loadingTrends } = trpc.scraperHealth.getTrendData.useQuery({
    hoursBack: timeRange,
  });

  // Clear alert mutation
  const clearAlertMutation = trpc.scraperHealth.clearAlert.useMutation({
    onSuccess: () => {
      refetchSources();
    },
  });

  const handleRefresh = () => {
    refetchSources();
    refetchStats();
  };

  const refetchTrends = () => {
    // Trend data will auto-refetch when timeRange changes
  };

  const handleClearAlert = (sourceId: string) => {
    clearAlertMutation.mutate({ sourceId });
  };

  const getStatusBadge = (successRate: number, consecutiveFailures: number) => {
    if (consecutiveFailures >= 3) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Critical</Badge>;
    }
    if (successRate < 80) {
      return <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600"><TrendingDown className="h-3 w-3" /> Degraded</Badge>;
    }
    if (successRate >= 95) {
      return <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600"><CheckCircle className="h-3 w-3" /> Healthy</Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-600"><TrendingUp className="h-3 w-3" /> Good</Badge>;
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  if (loadingSources || loadingStats) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading health metrics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">News Scraper Health Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of news scraper reliability and performance
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overall.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.overall.successfulExecutions || 0} / {stats?.overall.totalExecutions || 0} executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items Fetched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overall.totalItemsFetched || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {stats?.overall.avgItemsPerExecution || 0} per execution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats?.overall.avgDurationMs || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overall.failedExecutions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last {timeRange} hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={timeRange === 24 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(24)}
        >
          24h
        </Button>
        <Button
          variant={timeRange === 48 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(48)}
        >
          48h
        </Button>
        <Button
          variant={timeRange === 168 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(168)}
        >
          7d
        </Button>
        <Button
          variant={timeRange === 720 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(720)}
        >
          30d
        </Button>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">All Sources</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="failures">Recent Failures</TabsTrigger>
          {selectedSource && <TabsTrigger value="history">Execution History</TabsTrigger>}
        </TabsList>

        {/* All Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Source Health Summary</CardTitle>
              <CardDescription>
                Health metrics for all news scrapers (last {timeRange} hours)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allSources?.map((source) => (
                  <div
                    key={source.sourceId}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSource(source.sourceId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{source.sourceName}</h3>
                          {getStatusBadge(source.successRate24h, source.consecutiveFailures)}
                          {source.alertSent && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Alert Sent
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="ml-2 font-medium">{source.successRate24h}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Executions:</span>
                            <span className="ml-2 font-medium">{source.totalExecutions24h}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Items:</span>
                            <span className="ml-2 font-medium">{source.avgItemsFetched24h}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Duration:</span>
                            <span className="ml-2 font-medium">{formatDuration(source.avgDurationMs24h)}</span>
                          </div>
                        </div>

                        {source.consecutiveFailures > 0 && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                            <div className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                  {source.consecutiveFailures} consecutive failures
                                </p>
                                {source.lastErrorMessage && (
                                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                    Last error: {source.lastErrorMessage}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last success: {formatTimestamp(source.lastSuccessAt)}
                                </p>
                              </div>
                              {source.alertSent && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearAlert(source.sourceId);
                                  }}
                                >
                                  Clear Alert
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last execution: {formatTimestamp(source.lastExecutionAt)}
                          </span>
                          {source.lastExecutionSuccess ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Success
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!allSources || allSources.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No scraper health data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {loadingTrends ? (
            <div className="text-center py-8 text-muted-foreground">Loading trend data...</div>
          ) : trendData && trendData.trendData.length > 0 ? (
            <>
              <SuccessRateTrendChart 
                data={trendData.trendData}
                title="Success Rate Trend"
                description={`Success rate percentage over the last ${timeRange === 24 ? '24 hours' : timeRange === 48 ? '48 hours' : timeRange === 168 ? '7 days' : '30 days'}`}
              />
              
              <ItemsFetchedTrendChart 
                data={trendData.trendData}
                title="Items Fetched Trend"
                description={`Number of news items fetched over the last ${timeRange === 24 ? '24 hours' : timeRange === 48 ? '48 hours' : timeRange === 168 ? '7 days' : '30 days'}`}
              />
              
              <DurationTrendChart 
                data={trendData.trendData}
                title="Execution Duration Trend"
                description={`Average execution time per scraper over the last ${timeRange === 24 ? '24 hours' : timeRange === 48 ? '48 hours' : timeRange === 168 ? '7 days' : '30 days'}`}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No trend data available for the selected time range
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recent Failures Tab */}
        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle>Recent Failures</CardTitle>
              <CardDescription>Last 10 failed scraper executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFailures?.map((failure) => (
                  <div key={failure.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{failure.sourceName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(failure.startedAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        {failure.attempts} attempts
                      </Badge>
                    </div>
                    {failure.errorMessage && (
                      <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        {failure.errorMessage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Duration: {formatDuration(failure.durationMs)}
                    </p>
                  </div>
                ))}

                {(!recentFailures || recentFailures.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent failures 🎉
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution History Tab */}
        {selectedSource && (
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  Last 20 executions for {allSources?.find((s) => s.sourceId === selectedSource)?.sourceName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                ) : (
                  <div className="space-y-2">
                    {executionHistory?.map((exec) => (
                      <div
                        key={exec.id}
                        className={`border rounded p-3 ${
                          exec.success ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {exec.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {formatTimestamp(exec.startedAt)}
                              </p>
                              {exec.success ? (
                                <p className="text-xs text-muted-foreground">
                                  {exec.itemsFetched} items fetched
                                </p>
                              ) : (
                                <p className="text-xs text-red-600">{exec.errorMessage}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{formatDuration(exec.durationMs)}</p>
                            {exec.attempts > 1 && <p>{exec.attempts} attempts</p>}
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!executionHistory || executionHistory.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No execution history available
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
