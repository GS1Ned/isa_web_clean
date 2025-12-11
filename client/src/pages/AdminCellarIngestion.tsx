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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminCellarIngestion() {
  const [yearsBack, setYearsBack] = useState(5);
  const [dryRun, setDryRun] = useState(true);
  const [ingestionResult, setIngestionResult] = useState<any>(null);

  // Test connection
  const connectionTest = trpc.cellarIngestion.testConnection.useQuery();

  // Preview regulations
  const [previewYears, setPreviewYears] = useState(3);
  const previewQuery = trpc.cellarIngestion.previewRegulations.useQuery(
    { yearsBack: previewYears, limit: 50 },
    { enabled: false }
  );

  // Run ingestion mutation
  const runIngestion = trpc.cellarIngestion.runIngestion.useMutation({
    onSuccess: data => {
      setIngestionResult(data);
    },
    onError: error => {
      setIngestionResult({ error: error.message });
    },
  });

  const handlePreview = () => {
    previewQuery.refetch();
  };

  const handleRunIngestion = () => {
    setIngestionResult(null);
    runIngestion.mutate({ yearsBack, dryRun });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CELLAR Ingestion Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage automated ingestion of EU regulations from the CELLAR SPARQL
          endpoint
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>CELLAR SPARQL endpoint connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionTest.isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Testing connection...</span>
            </div>
          )}
          {connectionTest.data && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {connectionTest.data.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Connection Failed</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Endpoint: {connectionTest.data.endpoint}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => connectionTest.refetch()}
                disabled={connectionTest.isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Regulations */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Regulations</CardTitle>
          <CardDescription>
            Preview ESG regulations from CELLAR without writing to database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Years back:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={previewYears}
                onChange={e => setPreviewYears(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
            <Button onClick={handlePreview} disabled={previewQuery.isFetching}>
              {previewQuery.isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>

          {previewQuery.data && (
            <div className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {previewQuery.data.stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Regulations
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {previewQuery.data.stats.withCelex}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    With CELEX ID
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Object.keys(previewQuery.data.stats.byType).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Regulation Types
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {previewQuery.data.preview.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Preview Items
                  </div>
                </div>
              </div>

              {/* Regulation Types Breakdown */}
              <div>
                <h3 className="font-semibold mb-2">Regulation Types:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(previewQuery.data.stats.byType).map(
                    ([type, count]) => (
                      <Badge key={type} variant="secondary">
                        {type}: {count as number}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="font-semibold mb-2">Preview (first 50):</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          CELEX ID
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Title
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Effective Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewQuery.data.preview.map(
                        (reg: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2 text-sm font-mono">
                              {reg.celexId}
                            </td>
                            <td className="px-4 py-2 text-sm">{reg.title}</td>
                            <td className="px-4 py-2 text-sm">
                              <Badge variant="outline">
                                {reg.regulationType}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {reg.effectiveDate
                                ? new Date(
                                    reg.effectiveDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Ingestion */}
      <Card>
        <CardHeader>
          <CardTitle>Run Ingestion</CardTitle>
          <CardDescription>
            Fetch regulations from CELLAR and store in database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Dry run mode previews changes without writing to database. Disable
              dry run to actually insert/update regulations.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Years back:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={yearsBack}
                onChange={e => setYearsBack(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dryRun"
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="dryRun" className="text-sm font-medium">
                Dry run (preview only)
              </label>
            </div>
          </div>

          <Button
            onClick={handleRunIngestion}
            disabled={runIngestion.isPending}
            variant={dryRun ? "outline" : "default"}
          >
            {runIngestion.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {dryRun ? "Preview Ingestion" : "Run Ingestion"}
              </>
            )}
          </Button>

          {/* Ingestion Results */}
          {ingestionResult && (
            <div className="mt-4">
              {ingestionResult.error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{ingestionResult.error}</AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>
                    {ingestionResult.dryRun
                      ? "Dry Run Complete"
                      : "Ingestion Complete"}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Total:</span>{" "}
                          {ingestionResult.total}
                        </div>
                        <div>
                          <span className="font-medium">Inserted:</span>{" "}
                          {ingestionResult.inserted}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span>{" "}
                          {ingestionResult.updated}
                        </div>
                        <div>
                          <span className="font-medium">Errors:</span>{" "}
                          {ingestionResult.errors}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Duration:</span>{" "}
                        {ingestionResult.duration}ms
                      </div>
                      {ingestionResult.stats && (
                        <div className="text-sm">
                          <span className="font-medium">Types:</span>{" "}
                          {Object.entries(ingestionResult.stats.byType)
                            .map(([type, count]) => `${type} (${count})`)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>
            Deployment and scheduling information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For automated daily ingestion, deploy the cron scheduler following
            the guide in{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              docs/CELLAR_INGESTION_DEPLOYMENT.md
            </code>
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div>Cron schedule (daily at 3 AM):</div>
            <div className="mt-2">
              0 3 * * * cd /path/to/isa_web && node
              server/cellar-ingestion-scheduler.mjs
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
