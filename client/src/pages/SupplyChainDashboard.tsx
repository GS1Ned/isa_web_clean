// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Upload,
  TrendingUp,
  AlertCircle,
  Network,
  Shield,
  Zap,
  FileUp,
} from "lucide-react";

/**
 * Supply Chain Dashboard
 * Real-time visualization of EPCIS events and compliance risks
 */

export default function SupplyChainDashboard() {
  const { user, loading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch batch jobs
  const batchesQuery = trpc.batchEpcis.listBatches.useQuery(
    { limit: 10, offset: 0 },
    { enabled: !!user }
  );

  // Fetch analytics
  const analyticsQuery = trpc.batchEpcis.getAnalytics.useQuery(undefined, {
    enabled: !!user,
  });

  // Submit batch mutation
  const submitBatchMutation = trpc.batchEpcis.submitBatch.useMutation({
    onSuccess: () => {
      batchesQuery.refetch();
      analyticsQuery.refetch();
      setSelectedFile(null);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground">
            Please log in to access the supply chain dashboard.
          </p>
        </div>
      </div>
    );
  }

  const analytics = analyticsQuery.data;
  const batches = batchesQuery.data || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setSelectedFile(file);
  };

  const handleSubmitBatch = async () => {
    if (!selectedFile) return;

    const content = await selectedFile.text();
    submitBatchMutation.mutate({
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileContent: content,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Supply Chain Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor EPCIS events, track compliance risks, and visualize supply
            chain networks
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics?.totalEvents || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                EPCIS events tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Supply Chain Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics?.totalNodes || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Organizations tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(analytics?.complianceScore || 0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supply chain health
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High-Risk Nodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${(analytics?.highRiskNodes || 0) > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {analytics?.highRiskNodes || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">
              <FileUp className="w-4 h-4 mr-2" />
              Upload EPCIS
            </TabsTrigger>
            <TabsTrigger value="batches">
              <Loader2 className="w-4 h-4 mr-2" />
              Batch Jobs
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload EPCIS File</CardTitle>
                <CardDescription>
                  Submit JSON or XML EPCIS documents for batch processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".json,.xml"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to select file"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                            : "JSON or XML format"}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      File selected: {selectedFile.name}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSubmitBatch}
                  disabled={!selectedFile || submitBatchMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {submitBatchMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit for Processing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Jobs Tab */}
          <TabsContent value="batches" className="space-y-4">
            {batches.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <FileUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No batch jobs yet. Upload an EPCIS file to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {batches.map(batch => (
                  <Card key={batch.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {batch.fileName}
                          </CardTitle>
                          <CardDescription>
                            {new Date(batch.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            batch.status === "completed"
                              ? "default"
                              : batch.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {batch.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">{batch.progress}%</span>
                        </div>
                        <Progress value={batch.progress} />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Events</p>
                          <p className="font-semibold">{batch.totalEvents}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Processed</p>
                          <p className="font-semibold text-green-600">
                            {batch.processedEvents}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="text-xs text-muted-foreground">
                            {batch.completedAt
                              ? new Date(batch.completedAt).toLocaleTimeString()
                              : "In progress"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supply Chain Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Traceability Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Traceability Score
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round(analytics?.averageTraceabilityScore || 0)}%
                    </span>
                  </div>
                  <Progress value={analytics?.averageTraceabilityScore || 0} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Percentage of events with complete product identification
                  </p>
                </div>

                {/* Compliance Recommendations */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Compliance Recommendations
                  </h3>

                  {(analytics?.highRiskNodes || 0) > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>
                          {analytics?.highRiskNodes} high-risk nodes
                        </strong>{" "}
                        detected in your supply chain. Review and remediate
                        immediately.
                      </AlertDescription>
                    </Alert>
                  )}

                  {(analytics?.complianceScore || 0) < 70 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Compliance score below 70%. Prioritize addressing
                        identified risks to improve supply chain resilience.
                      </AlertDescription>
                    </Alert>
                  )}

                  {(analytics?.averageTraceabilityScore || 0) < 80 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Traceability gaps detected. Ensure all events include
                        EPC identifiers for full EUDR compliance.
                      </AlertDescription>
                    </Alert>
                  )}

                  {(analytics?.complianceScore || 0) >= 80 &&
                    (analytics?.highRiskNodes || 0) === 0 && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">
                          Your supply chain is in good compliance standing.
                          Continue monitoring for new risks.
                        </AlertDescription>
                      </Alert>
                    )}
                </div>

                {/* Network Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Network Edges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.totalEdges || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
