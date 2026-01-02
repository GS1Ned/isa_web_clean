/**
 * News Admin Page
 * Admin panel for managing news ingestion and monitoring
 */

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  PlayCircle,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { toast as showToast } from "sonner";

export function NewsAdmin() {
  // Using sonner toast
  const [isIngesting, setIsIngesting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Queries
  const { data: stats, refetch: refetchStats } =
    trpc.newsAdmin.getStats.useQuery();
  const { data: history, refetch: refetchHistory } =
    trpc.newsAdmin.getExecutionHistory.useQuery();
  const { data: dashboard, refetch: refetchDashboard } =
    trpc.newsAdmin.getMonitoringDashboard.useQuery();

  // Mutations
  const triggerIngestion = trpc.newsAdmin.triggerIngestion.useMutation({
    onSuccess: data => {
      if (data.status === "running") {
        showToast.info("News Ingestion Started", {
          description: data.message,
        });
      } else {
        showToast.success("News Ingestion Complete", {
          description: data.message,
        });
      }
      setIsIngesting(false);
      refetchStats();
      refetchHistory();
      refetchDashboard();
    },
    onError: error => {
      showToast.error("Ingestion Failed", {
        description: error.message,
      });
      setIsIngesting(false);
    },
  });

  const triggerArchival = trpc.newsAdmin.triggerArchival.useMutation({
    onSuccess: data => {
      showToast.success("News Archival Complete", {
        description: `Archived: ${data.archived} items | Duration: ${data.duration}ms`,
      });
      setIsArchiving(false);
      refetchStats();
      refetchHistory();
      refetchDashboard();
    },
    onError: error => {
      showToast.error("Archival Failed", {
        description: error.message,
      });
      setIsArchiving(false);
    },
  });

  const handleTriggerIngestion = () => {
    setIsIngesting(true);
    triggerIngestion.mutate();
  };

  const handleTriggerArchival = () => {
    setIsArchiving(true);
    triggerArchival.mutate();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">News Administration</h1>
        <p className="text-muted-foreground">
          Manually trigger news collection, view execution history, and monitor
          pipeline health
        </p>
      </div>

      {/* Manual Triggers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              News Ingestion
            </CardTitle>
            <CardDescription>
              Fetch and process news from all configured sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTriggerIngestion}
              disabled={isIngesting}
              className="w-full"
              size="lg"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run News Ingestion
                </>
              )}
            </Button>

            {isIngesting && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Fetching news from 8 sources... This may take 30-60 seconds.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              News Archival
            </CardTitle>
            <CardDescription>
              Archive news items older than 200 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTriggerArchival}
              disabled={isArchiving}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isArchiving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Run Archival
                </>
              )}
            </Button>

            {stats?.archivalStats && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Active news: {stats.archivalStats.activeCount}</p>
                <p>Archived: {stats.archivalStats.archivedCount}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Dashboard */}
      {dashboard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monitoring Dashboard
            </CardTitle>
            <CardDescription>
              Execution statistics for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Manual Ingestion Stats */}
              {dashboard.manualIngestion.stats && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Manual Ingestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total runs:
                      </span>
                      <span className="font-semibold">
                        {dashboard.manualIngestion.stats.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Success rate:
                      </span>
                      <Badge
                        variant={
                          dashboard.manualIngestion.stats.successRate >= 80
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboard.manualIngestion.stats.successRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Avg duration:
                      </span>
                      <span className="font-semibold">
                        {formatDuration(
                          dashboard.manualIngestion.stats.avgDuration
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Daily Ingestion Stats */}
              {dashboard.jobs[0]?.stats && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Daily Ingestion (Cron)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total runs:
                      </span>
                      <span className="font-semibold">
                        {dashboard.jobs[0].stats.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Success rate:
                      </span>
                      <Badge
                        variant={
                          dashboard.jobs[0].stats.successRate >= 80
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboard.jobs[0].stats.successRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Avg duration:
                      </span>
                      <span className="font-semibold">
                        {formatDuration(dashboard.jobs[0].stats.avgDuration)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Archival Stats */}
              {dashboard.jobs[1]?.stats && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Weekly Archival (Cron)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total runs:
                      </span>
                      <span className="font-semibold">
                        {dashboard.jobs[1].stats.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Success rate:
                      </span>
                      <Badge
                        variant={
                          dashboard.jobs[1].stats.successRate >= 80
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboard.jobs[1].stats.successRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Avg duration:
                      </span>
                      <span className="font-semibold">
                        {formatDuration(dashboard.jobs[1].stats.avgDuration)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution History */}
      {history && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Execution History
            </CardTitle>
            <CardDescription>
              Last 10 executions across all jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ...history.manualIngestion,
                  ...history.dailyIngestion,
                  ...history.weeklyArchival,
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .slice(0, 10)
                  .map((execution, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {execution.jobName === "manual-news-ingestion" &&
                          "Manual Ingestion"}
                        {execution.jobName === "daily-news-ingestion" &&
                          "Daily Ingestion"}
                        {execution.jobName === "weekly-news-archival" &&
                          "Weekly Archival"}
                      </TableCell>
                      <TableCell>
                        {execution.status === "success" ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 w-fit"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 w-fit"
                          >
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestamp(execution.timestamp)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(execution.duration)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {execution.stats &&
                          typeof execution.stats === "string" &&
                          (() => {
                            try {
                              const parsed = JSON.parse(execution.stats);
                              return parsed.inserted !== undefined ? (
                                <span>Inserted: {parsed.inserted}</span>
                              ) : null;
                            } catch {
                              return null;
                            }
                          })()}
                        {execution.error && (
                          <span className="text-destructive">
                            Error: {execution.error.substring(0, 50)}...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent News Preview */}
      {stats?.recentNews && stats.recentNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent News Items</CardTitle>
            <CardDescription>Last 5 news items retrieved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentNews.map(news => (
                <div
                  key={news.id}
                  className="border-l-2 border-primary pl-4 py-2"
                >
                  <h4 className="font-semibold mb-1">{news.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {news.summary?.substring(0, 150)}...
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>
                      Sources:{" "}
                      {Array.isArray(news.sources)
                        ? news.sources.map((s: any) => typeof s === 'string' ? s : s.name).join(", ")
                        : (news.sources ? String(news.sources) : 'N/A')}
                    </span>
                    <span>•</span>
                    <span>
                      {news.retrievedAt ? new Date(news.retrievedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
