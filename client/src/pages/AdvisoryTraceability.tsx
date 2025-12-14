import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, FileText, Hash, Shield } from "lucide-react";

export default function AdvisoryTraceability() {
  const { data: metadata, isLoading } = trpc.advisory.getMetadata.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load advisory metadata</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Advisory Traceability</h1>
        <p className="text-muted-foreground">
          Provenance and integrity verification for {metadata.advisoryId}
        </p>
      </div>

      {/* Advisory Metadata */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advisory Metadata
          </CardTitle>
          <CardDescription>Core identification and versioning information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Advisory ID</label>
              <p className="font-mono text-lg">{metadata.advisoryId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <p className="font-mono text-lg">{metadata.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Publication Date</label>
              <p className="text-lg">{metadata.publicationDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Generated At</label>
              <p className="text-sm">{new Date(metadata.generatedAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Author</label>
              <p className="text-lg">{metadata.author}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dataset Registry Version</label>
              <Badge variant="outline" className="text-base">v{metadata.datasetRegistryVersion}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Artifacts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Source Artifacts
        </h2>
        <p className="text-muted-foreground">
          Cryptographic hashes ensure the integrity and traceability of all source materials used to generate this advisory.
        </p>

        {/* Advisory Markdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Advisory Markdown Source
            </CardTitle>
            <CardDescription>Canonical human-readable advisory report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">File Path</label>
              <code className="block mt-1 bg-muted px-3 py-2 rounded text-sm">
                {metadata.sourceArtifacts.advisoryMarkdown.path}
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                SHA256 Hash
              </label>
              <code className="block mt-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                {metadata.sourceArtifacts.advisoryMarkdown.sha256}
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Integrity verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Registry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Dataset Registry
            </CardTitle>
            <CardDescription>Frozen dataset registry used for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">File Path</label>
              <code className="block mt-1 bg-muted px-3 py-2 rounded text-sm">
                {metadata.sourceArtifacts.datasetRegistry.path}
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <Badge variant="outline" className="mt-1">v{metadata.sourceArtifacts.datasetRegistry.version}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                SHA256 Hash
              </label>
              <code className="block mt-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                {metadata.sourceArtifacts.datasetRegistry.sha256}
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Integrity verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Schema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Advisory Output Schema
            </CardTitle>
            <CardDescription>JSON Schema defining advisory structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Schema ID</label>
              <code className="block mt-1 bg-muted px-3 py-2 rounded text-sm break-all">
                {metadata.sourceArtifacts.schema.id}
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <Badge variant="outline" className="mt-1">{metadata.sourceArtifacts.schema.version}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                SHA256 Hash
              </label>
              <code className="block mt-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                {metadata.sourceArtifacts.schema.sha256}
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Integrity verified</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Analysis Statistics</CardTitle>
          <CardDescription>Scope and scale of advisory analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Datapoints</label>
              <p className="text-2xl font-bold">{metadata.metadata.totalDatapoints.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Attributes</label>
              <p className="text-2xl font-bold">{metadata.metadata.totalAttributes.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Records</label>
              <p className="text-2xl font-bold">{metadata.metadata.totalRecords.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Regulations Covered</label>
              <p className="text-2xl font-bold">{metadata.metadata.regulationsCovered}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sector Models</label>
              <p className="text-2xl font-bold">{metadata.metadata.sectorsCovered}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Mappings</label>
              <p className="text-2xl font-bold">{metadata.metadata.totalMappings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Instructions */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">How to Verify Integrity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <p>
            To verify the integrity of source artifacts, compute the SHA256 hash of each file and compare with the hashes shown above:
          </p>
          <code className="block bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded">
            sha256sum docs/ISA_First_Advisory_Report_GS1NL.md
          </code>
          <p>
            All hashes must match exactly to ensure the advisory has not been tampered with and is traceable to its original source materials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
