import React from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Admin Monitoring Dashboard
 *
 * Displays:
 * - Cron job execution history and health
 * - Source health metrics (response times, failure rates)
 * - Data drift detection (new vs updated vs unchanged)
 * - Email alert configuration
 *
 * Adheres to GS1 Style Guide Release 5.6
 */

export default function AdminMonitoring() {
  const { data: cronStats, isLoading: cronLoading, refetch: refetchCron } = trpc.monitoring.getCronStats.useQuery();
  const { data: sourceHealth, isLoading: sourceLoading, refetch: refetchSources } = trpc.monitoring.getSourceHealth.useQuery();
  const { data: dataDrift, isLoading: driftLoading } = trpc.monitoring.getDataDrift.useQuery();

  const testAlertMutation = trpc.monitoring.testEmailAlert.useMutation({
    onSuccess: () => {
      toast.success("Test alert sent", {
        description: "Check your email for the test notification.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to send test alert", {
        description: error.message,
      });
    },
  });

  const handleRefreshAll = () => {
    refetchCron();
    refetchSources();
    toast.info("Refreshing monitoring data...");
  };

  const handleTestAlert = () => {
    testAlertMutation.mutate();
  };

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">System monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Track cron job health, source reliability and data quality
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestAlert} disabled={testAlertMutation.isPending}>
            <Bell className="w-4 h-4 mr-2" />
            Test alert
          </Button>
          <Button onClick={handleRefreshAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Cron Job Health */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cron job health</CardTitle>
          <CardDescription>Execution history and failure tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {cronLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading cron statistics...</div>
          ) : cronStats && cronStats.length > 0 ? (
            <div className="space-y-4">
              {cronStats.map((job: any) => (
                <div key={job.jobName} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{job.jobName}</h3>
                      {job.consecutiveFailures === 0 ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Healthy
                        </Badge>
                      ) : job.consecutiveFailures >= 3 ? (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Critical
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Warning
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last run: {job.lastRun ? new Date(job.lastRun).toLocaleString("en-GB") : "Never"}
                      </span>
                      <span>Success rate: {job.successRate.toFixed(1)}%</span>
                      <span>Total runs: {job.totalRuns}</span>
                      {job.consecutiveFailures > 0 && (
                        <span className="text-red-600 font-medium">
                          {job.consecutiveFailures} consecutive failures
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No cron job data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source Health */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Source health</CardTitle>
          <CardDescription>Response times and failure rates for news sources</CardDescription>
        </CardHeader>
        <CardContent>
          {sourceLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading source health...</div>
          ) : sourceHealth && sourceHealth.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sourceHealth.map((source: any) => (
                <div key={source.sourceName} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{source.sourceName}</h3>
                    {source.failureRate < 10 ? (
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    ) : source.failureRate < 30 ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Failing</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Avg response time:</span>
                      <span className="font-medium">{source.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failure rate:</span>
                      <span className={`font-medium ${source.failureRate > 30 ? "text-red-600" : ""}`}>
                        {source.failureRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last check:</span>
                      <span>{new Date(source.lastCheck).toLocaleString("en-GB")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No source health data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Drift */}
      <Card>
        <CardHeader>
          <CardTitle>Data drift detection</CardTitle>
          <CardDescription>Track new, updated and unchanged records over time</CardDescription>
        </CardHeader>
        <CardContent>
          {driftLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading data drift...</div>
          ) : dataDrift ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">New records</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold">{dataDrift.newRecords}</div>
                <p className="text-sm text-muted-foreground mt-1">Last 7 days</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Updated records</h3>
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold">{dataDrift.updatedRecords}</div>
                <p className="text-sm text-muted-foreground mt-1">Last 7 days</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Unchanged records</h3>
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-3xl font-bold">{dataDrift.unchangedRecords}</div>
                <p className="text-sm text-muted-foreground mt-1">Last 7 days</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data drift information available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Configuration Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email alert configuration</CardTitle>
          <CardDescription>Automatic notifications for system issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Consecutive failures</h4>
                <p className="text-sm text-muted-foreground">
                  Alert sent when a cron job fails 3 times in a row
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Source degradation</h4>
                <p className="text-sm text-muted-foreground">
                  Alert sent when source failure rate exceeds 30%
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Data drift anomalies</h4>
                <p className="text-sm text-muted-foreground">
                  Alert sent when no new records detected for 7 days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
