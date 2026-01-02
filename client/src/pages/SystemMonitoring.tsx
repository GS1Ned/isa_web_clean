import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Activity,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

export default function SystemMonitoring() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedError, setSelectedError] = useState<any>(null);

  // Fetch error tracking data
  const { data: errorStats } = trpc.errorTracking.getErrorStats.useQuery(
    { hours: 24 },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: recentErrors } = trpc.errorTracking.getRecentErrors.useQuery(
    { limit: 50 },
    { refetchInterval: 30000 }
  );

  const { data: errorTrends } = trpc.errorTracking.getErrorTrends.useQuery(
    { hours: 24, interval: "hour" },
    { refetchInterval: 60000 }
  );

  // Fetch performance monitoring data
  const { data: perfStats } = trpc.performanceTracking.getPerformanceStats.useQuery(
    { hours: 24 },
    { refetchInterval: 30000 }
  );

  const { data: slowOps } = trpc.performanceTracking.getSlowOperations.useQuery(
    { threshold: 1000, limit: 20 },
    { refetchInterval: 30000 }
  );

  const { data: perfTrends } = trpc.performanceTracking.getPerformanceTrends.useQuery(
    { hours: 24, interval: "hour" },
    { refetchInterval: 60000 }
  );

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "error":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error tracking & performance</h1>
          <p className="text-muted-foreground mt-2">
            Real-time error tracking and performance monitoring
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Error tracking</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Error Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total errors (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{errorStats?.totalErrors || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {errorStats?.errorRate?.toFixed(2) || 0} errors/hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {errorStats?.criticalCount || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{errorStats?.uniqueErrors || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Distinct error types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg response time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {perfStats?.avgDuration?.toFixed(0) || 0}
                  <span className="text-lg text-muted-foreground ml-1">ms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  P95: {perfStats?.p95Duration?.toFixed(0) || 0}ms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Error trends (24 hours)</CardTitle>
              <CardDescription>Hourly error count by severity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={errorTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "2-digit" })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="error" stroke="#f97316" strokeWidth={2} />
                  <Line type="monotone" dataKey="warning" stroke="#eab308" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance trends (24 hours)</CardTitle>
              <CardDescription>Average response time by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={perfTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "2-digit" })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value.toFixed(0)}ms`, "Avg duration"]}
                  />
                  <Legend />
                  <Bar dataKey="avgDuration" fill="#3b82f6" name="Avg duration (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent errors</CardTitle>
              <CardDescription>Last 50 errors across all severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentErrors?.map((error: any) => (
                    <TableRow
                      key={error.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedError(error)}
                    >
                      <TableCell>
                        <Badge variant={getSeverityColor(error.severity) as any}>
                          <span className="flex items-center gap-1">
                            {getSeverityIcon(error.severity)}
                            {error.severity}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{error.message}</TableCell>
                      <TableCell className="font-mono text-sm">{error.operation}</TableCell>
                      <TableCell>{error.userId || "Anonymous"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!recentErrors || recentErrors.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No errors recorded in the last 24 hours</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Detail Modal */}
          {selectedError && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Error details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedError(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Message</div>
                  <div className="text-sm">{selectedError.message}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Operation</div>
                  <div className="text-sm font-mono">{selectedError.operation}</div>
                </div>
                {selectedError.stackTrace && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Stack trace</div>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-64">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                )}
                {selectedError.context && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Context</div>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedError.context, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Severity</div>
                    <Badge variant={getSeverityColor(selectedError.severity) as any}>
                      {selectedError.severity}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">User ID</div>
                    <div>{selectedError.userId || "Anonymous"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Timestamp</div>
                    <div>{new Date(selectedError.timestamp).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Request ID</div>
                    <div className="font-mono text-xs">{selectedError.requestId || "N/A"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Slow operations</CardTitle>
              <CardDescription>Operations taking longer than 1 second</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slowOps?.map((op: any) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-mono text-sm">{op.operation}</TableCell>
                      <TableCell>
                        <Badge variant={op.duration > 3000 ? "destructive" : "default"}>
                          <Clock className="h-3 w-3 mr-1" />
                          {op.duration.toFixed(0)}ms
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={op.success ? "secondary" : "destructive"}>
                          {op.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{op.userId || "Anonymous"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(op.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!slowOps || slowOps.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>All operations are performing well</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{perfStats?.totalOperations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Success rate: {perfStats?.successRate?.toFixed(1) || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  P50 duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {perfStats?.p50Duration?.toFixed(0) || 0}
                  <span className="text-lg text-muted-foreground ml-1">ms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Median response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  P99 duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {perfStats?.p99Duration?.toFixed(0) || 0}
                  <span className="text-lg text-muted-foreground ml-1">ms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">99th percentile</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
