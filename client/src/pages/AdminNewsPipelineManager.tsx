/**
 * Admin News Pipeline Manager
 * Manually trigger news ingestion, archival, and view statistics
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Newspaper, Download, Archive, BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function AdminNewsPipelineManager() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const runPipeline = trpc.newsAdmin.triggerIngestion.useMutation();
  const runArchival = trpc.newsAdmin.triggerArchival.useMutation();
  const { data: stats } = trpc.newsAdmin.getStats.useQuery();

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
    setIsRunning(true);
    setLastResult(null);
    try {
      const result = await runPipeline.mutateAsync();
      setLastResult(result);
    } catch (error) {
      console.error("Pipeline failed:", error);
      setLastResult({ success: false, error: String(error) });
    } finally {
      setIsRunning(false);
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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News Pipeline Manager</h1>
        <p className="text-muted-foreground">
          Manually trigger news ingestion from configured sources and manage archival
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
                  <span className="text-sm text-muted-foreground">Active News Items</span>
                  <Badge variant="secondary">{stats.archivalStats?.activeCount || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Archived Items</span>
                  <Badge variant="secondary">{stats.archivalStats?.archivedCount || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recent Articles</span>
                  <Badge variant="secondary">{stats.recentNews?.length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Oldest Active</span>
                  <span className="text-sm">
                    {stats.archivalStats?.oldestActiveDate 
                      ? new Date(stats.archivalStats.oldestActiveDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading statistics...</p>
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
            Manually trigger news ingestion from 6 configured sources (EUR-Lex, EFRAG, EU Commission, GS1 NL/Global/EU)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleRunPipeline}
              disabled={isRunning}
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
                  Run News Ingestion
                </>
              )}
            </Button>
            <Button
              onClick={handleRunArchival}
              variant="outline"
              disabled={isRunning}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Run Archival (200+ days)
            </Button>
          </div>

          {/* Pipeline Result */}
          {lastResult && (
            <Card className={lastResult.success ? "border-green-500" : "border-red-500"}>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">
                  {lastResult.success ? "✅ Pipeline Completed" : "❌ Pipeline Failed"}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fetched:</span>{" "}
                    <span className="font-medium">{lastResult.fetched || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processed:</span>{" "}
                    <span className="font-medium">{lastResult.processed || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inserted:</span>{" "}
                    <span className="font-medium text-green-600">{lastResult.inserted || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Skipped:</span>{" "}
                    <span className="font-medium">{lastResult.skipped || 0}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    <span className="font-medium">{lastResult.duration || 0}ms</span>
                  </div>
                </div>
                {lastResult.errors && lastResult.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded text-sm">
                    <p className="font-semibold text-destructive mb-1">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {lastResult.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i} className="text-destructive/80">{err}</li>
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
          <CardDescription>6 sources monitored for ESG regulatory updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">EUR-Lex Press Releases</p>
                <p className="text-sm text-muted-foreground">EU Official • Credibility: 1.0</p>
              </div>
              <Badge>EU Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">EFRAG Sustainability Reporting</p>
                <p className="text-sm text-muted-foreground">EU Official • Credibility: 1.0</p>
              </div>
              <Badge>EU Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">EU Commission - Environment</p>
                <p className="text-sm text-muted-foreground">EU Official • Credibility: 1.0</p>
              </div>
              <Badge>EU Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GS1 Netherlands News</p>
                <p className="text-sm text-muted-foreground">GS1 Official • Credibility: 0.9</p>
              </div>
              <Badge variant="secondary">GS1 Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GS1 Global News</p>
                <p className="text-sm text-muted-foreground">GS1 Official • Credibility: 0.9</p>
              </div>
              <Badge variant="secondary">GS1 Official</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">GS1 in Europe Updates</p>
                <p className="text-sm text-muted-foreground">GS1 Official • Credibility: 0.9</p>
              </div>
              <Badge variant="secondary">GS1 Official</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
