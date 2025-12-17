/**
 * Admin News Pipeline Manager
 * Manually trigger news ingestion, archival, and view statistics
 * Uses async execution with status polling for long-running operations
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Newspaper,
  Download,
  Archive,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminNewsPipelineManager() {
  const { user } = useAuth();
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [ingestionMode, setIngestionMode] = useState<'normal' | 'backfill'>('normal');

  const runPipeline = trpc.newsAdmin.triggerIngestion.useMutation();
  const runArchival = trpc.newsAdmin.triggerArchival.useMutation();
  const resetStatus = trpc.newsAdmin.resetPipelineStatus.useMutation();
  const { data: stats } = trpc.newsAdmin.getStats.useQuery();
  
  // Poll for pipeline status when running
  const { data: pipelineStatus, refetch: refetchStatus } = trpc.newsAdmin.getPipelineStatus.useQuery(
    undefined,
    {
      refetchInterval: pollingEnabled ? 2000 : false, // Poll every 2 seconds when enabled
    }
  );

  // Start/stop polling based on pipeline status
  useEffect(() => {
    if (pipelineStatus?.status === "running") {
      setPollingEnabled(true);
    } else if (pipelineStatus?.status === "completed" || pipelineStatus?.status === "failed") {
      setPollingEnabled(false);
    }
  }, [pipelineStatus?.status]);

  // Redirect non-admin users
  if (user?.role !== "admin") {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Access denied. Admin privileges required.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRunPipeline = async () => {
    try {
      await runPipeline.mutateAsync({ mode: ingestionMode });
      setPollingEnabled(true);
      refetchStatus();
    } catch (error) {
      console.error("Failed to start pipeline:", error);
    }
  };

  const handleRunArchival = async () => {
    try {
      const result = await runArchival.mutateAsync();
      alert(`Archival complete: ${result.archived} items archived`);
    } catch (error) {
      console.error("Archival failed:", error);
      alert("Archival failed: " + String(error));
    }
  };

  const handleResetStatus = async () => {
    try {
      await resetStatus.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error("Failed to reset status:", error);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const isRunning = pipelineStatus?.status === "running";
  const isCompleted = pipelineStatus?.status === "completed";
  const isFailed = pipelineStatus?.status === "failed";

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News Pipeline Manager</h1>
        <p className="text-muted-foreground">
          Manually trigger news ingestion from configured sources and manage
          archival
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pipeline Statistics
            </CardTitle>
            <CardDescription>Current database status</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active News Items
                  </span>
                  <Badge variant="secondary">
                    {stats.archivalStats?.activeCount || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Archived Items
                  </span>
                  <Badge variant="secondary">
                    {stats.archivalStats?.archivedCount || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Recent Articles
                  </span>
                  <Badge variant="secondary">
                    {stats.recentNews?.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Oldest Active
                  </span>
                  <span className="text-sm">
                    {stats.archivalStats?.oldestActiveDate
                      ? new Date(
                          stats.archivalStats.oldestActiveDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Loading statistics...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage news pipeline operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/news">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Newspaper className="h-4 w-4" />
                View News Hub
              </Button>
            </Link>
            <Link href="/admin/news">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Manage News Articles
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pipeline Controls</CardTitle>
          <CardDescription>
            Manually trigger news ingestion from 8 configured sources (EUR-Lex,
            EFRAG, EU Commission, GS1 NL/Global/EU, Green Deal Zorg, ZES)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ingestion Mode</label>
            <div className="flex gap-2">
              <Button
                variant={ingestionMode === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIngestionMode('normal')}
                disabled={isRunning}
                className="flex-1"
              >
                Normal (30 days)
              </Button>
              <Button
                variant={ingestionMode === 'backfill' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIngestionMode('backfill')}
                disabled={isRunning}
                className="flex-1"
              >
                Backfill (200 days)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {ingestionMode === 'normal' 
                ? 'Fetches news from the last 30 days (recommended for daily runs)'
                : 'Fetches news from the last 200 days (use for initial setup or data recovery)'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRunPipeline}
              disabled={isRunning || runPipeline.isPending}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Run News Ingestion ({ingestionMode === 'normal' ? '30' : '200'} days)
                </>
              )}
            </Button>
            <Button
              onClick={handleRunArchival}
              variant="outline"
              disabled={isRunning || runArchival.isPending}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Run Archival (200+ days)
            </Button>
          </div>

          {/* Pipeline Status */}
          {pipelineStatus && pipelineStatus.status !== "idle" && (
            <Card
              className={
                isCompleted && pipelineStatus.result?.success
                  ? "border-green-500"
                  : isFailed || (isCompleted && !pipelineStatus.result?.success)
                  ? "border-red-500"
                  : "border-blue-500"
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    {isRunning && (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                        Pipeline Running...
                      </>
                    )}
                    {isCompleted && pipelineStatus.result?.success && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Pipeline Completed
                      </>
                    )}
                    {(isFailed || (isCompleted && !pipelineStatus.result?.success)) && (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        Pipeline Failed
                      </>
                    )}
                  </h4>
                  {!isRunning && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetStatus}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>

                {/* Running status */}
                {isRunning && pipelineStatus.elapsedMs && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Elapsed: {formatDuration(pipelineStatus.elapsedMs)}
                    <span className="text-xs">(typically takes 30-60 seconds)</span>
                  </div>
                )}

                {/* Completed results */}
                {isCompleted && pipelineStatus.result && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fetched:</span>{" "}
                      <span className="font-medium">
                        {pipelineStatus.result.fetched || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processed:</span>{" "}
                      <span className="font-medium">
                        {pipelineStatus.result.processed || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inserted:</span>{" "}
                      <span className="font-medium text-green-600">
                        {pipelineStatus.result.inserted || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Skipped:</span>{" "}
                      <span className="font-medium">
                        {pipelineStatus.result.skipped || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mode:</span>{" "}
                      <Badge variant="secondary">
                        {pipelineStatus.result.mode || 'normal'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Window:</span>{" "}
                      <span className="font-medium">
                        {pipelineStatus.result.maxAgeDays || 30} days
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Duration:</span>{" "}
                      <span className="font-medium">
                        {formatDuration(pipelineStatus.result.duration || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error display */}
                {isFailed && pipelineStatus.error && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded text-sm">
                    <p className="font-semibold text-destructive mb-1">
                      Error:
                    </p>
                    <p className="text-destructive/80">{pipelineStatus.error}</p>
                  </div>
                )}

                {/* Errors from completed run */}
                {isCompleted && pipelineStatus.result?.errors && pipelineStatus.result.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded text-sm">
                    <p className="font-semibold text-destructive mb-1">
                      Errors ({pipelineStatus.result.errors.length}):
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {pipelineStatus.result.errors
                        .slice(0, 5)
                        .map((err: string, i: number) => (
                          <li key={i} className="text-destructive/80">
                            {err}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configured News Sources</CardTitle>
          <CardDescription>
            8 sources monitored for ESG regulatory updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">EUR-Lex Press Releases</p>
                <p className="text-sm text-muted-foreground">
                  EU Official • Credibility: 1.0
                </p>
              </div>
              <Badge>EU Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">EFRAG Sustainability Reporting</p>
                <p className="text-sm text-muted-foreground">
                  EU Official • Credibility: 1.0
                </p>
              </div>
              <Badge>EU Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">EU Commission - Environment</p>
                <p className="text-sm text-muted-foreground">
                  EU Official • Credibility: 1.0
                </p>
              </div>
              <Badge>EU Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GS1 Netherlands News</p>
                <p className="text-sm text-muted-foreground">
                  GS1 Official • Credibility: 0.9
                </p>
              </div>
              <Badge variant="secondary">GS1 Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GS1 Global News</p>
                <p className="text-sm text-muted-foreground">
                  GS1 Official • Credibility: 0.9
                </p>
              </div>
              <Badge variant="secondary">GS1 Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GS1 in Europe Updates</p>
                <p className="text-sm text-muted-foreground">
                  GS1 Official • Credibility: 0.9
                </p>
              </div>
              <Badge variant="secondary">GS1 Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Green Deal Duurzame Zorg</p>
                <p className="text-sm text-muted-foreground">
                  Dutch Initiative • Credibility: 0.85
                </p>
              </div>
              <Badge variant="outline">Dutch Initiative</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Zero Emission Stadslogistiek (ZES)</p>
                <p className="text-sm text-muted-foreground">
                  Dutch Initiative • Credibility: 0.85
                </p>
              </div>
              <Badge variant="outline">Dutch Initiative</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
