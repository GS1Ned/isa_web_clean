import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, RotateCw } from "lucide-react";

export default function AdminCellarSyncMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sync history
  const syncHistoryQuery = trpc.cellarIngestion.getSyncHistory.useQuery(
    undefined,
    {
      refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
    }
  );

  // Fetch latest sync status
  const latestSyncQuery = trpc.cellarIngestion.getLatestSyncStatus.useQuery(
    undefined,
    {
      refetchInterval: autoRefresh ? 30000 : false,
    }
  );

  // Manual sync trigger
  const runIngestionMutation = trpc.cellarIngestion.runIngestion.useMutation({
    onSuccess: () => {
      syncHistoryQuery.refetch();
      latestSyncQuery.refetch();
    },
  });

  const syncHistory = syncHistoryQuery.data;
  const latestSync = latestSyncQuery.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            CELLAR Sync Monitor
          </h1>
          <p className="text-slate-600">
            Monitor automated EU regulation ingestion from CELLAR
          </p>
        </div>

        {/* Latest Sync Status Card */}
        {latestSync && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(latestSync.status)}
                Latest Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className={getStatusColor(latestSync.status)}>
                    {latestSync.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Inserted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {latestSync.regulationsInserted}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Updated</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {latestSync.regulationsUpdated}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Duration</p>
                  <p className="text-2xl font-bold text-slate-600">
                    {latestSync.durationSeconds
                      ? `${latestSync.durationSeconds}s`
                      : "N/A"}
                  </p>
                </div>
              </div>
              {latestSync.syncStartTime && (
                <p className="text-xs text-slate-500 mt-4">
                  Last sync:{" "}
                  {new Date(latestSync.syncStartTime).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {syncHistory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Syncs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {syncHistory.totalSyncs}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600">
                  Successful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {syncHistory.successCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {syncHistory.failureCount}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
            >
              {autoRefresh ? "⏸ Auto-Refresh On" : "▶ Auto-Refresh Off"}
            </Button>
            <Button
              onClick={() => runIngestionMutation.mutate({ dryRun: false })}
              disabled={runIngestionMutation.isPending}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              {runIngestionMutation.isPending ? "Running..." : "Run Sync Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Sync History Table */}
        {syncHistory && syncHistory.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Last 50 sync operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Inserted
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Updated
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Errors
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncHistory.logs.map(log => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(log.syncStartTime).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {log.regulationsInserted}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600 font-medium">
                          {log.regulationsUpdated}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">
                          {log.errors}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {log.durationSeconds
                            ? `${log.durationSeconds}s`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Messages */}
        {syncHistoryQuery.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {syncHistoryQuery.error.message}
            </AlertDescription>
          </Alert>
        )}

        {runIngestionMutation.error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {runIngestionMutation.error.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
