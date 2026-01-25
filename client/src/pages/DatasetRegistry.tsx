import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database, Download, ExternalLink, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Dataset Registry Page
 * 
 * Displays catalog of GS1 and ESG-related datasets with verification tracking.
 * Implements Decision 3: last_verified_date tracking with staleness warnings.
 */
export default function DatasetRegistry() {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [formatFilter, setFormatFilter] = useState<string | undefined>();
  const [showNeedsVerification, setShowNeedsVerification] = useState(false);

  const { data: datasets, isLoading } = trpc.datasetRegistry.list.useQuery({
    category: categoryFilter,
    format: formatFilter,
    needsVerification: showNeedsVerification,
  });

  const { data: stats } = trpc.datasetRegistry.stats.useQuery();

  const getVerificationStatus = (lastVerifiedDate: string | null) => {
    if (!lastVerifiedDate) {
      return { status: "never", color: "destructive", text: "Never verified" };
    }

    const daysSinceVerification = Math.floor(
      (Date.now() - new Date(lastVerifiedDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVerification > 90) {
      return {
        status: "stale",
        color: "destructive",
        text: `Verified ${formatDistanceToNow(new Date(lastVerifiedDate))} ago`,
      };
    } else if (daysSinceVerification > 60) {
      return {
        status: "warning",
        color: "warning",
        text: `Verified ${formatDistanceToNow(new Date(lastVerifiedDate))} ago`,
      };
    } else {
      return {
        status: "current",
        color: "success",
        text: `Verified ${formatDistanceToNow(new Date(lastVerifiedDate))} ago`,
      };
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Lane C Governance Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Lane C Governance:</strong> Dataset information is for reference only. Always verify
          dataset currency and availability with official sources. Last updated:{" "}
          {new Date().toLocaleDateString()}.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Dataset Registry</h1>
        <p className="text-muted-foreground">
          Catalog of GS1 and ESG-related datasets with verification tracking
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Needs Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.needsVerification}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="GS1_STANDARDS">GS1 Standards</SelectItem>
              <SelectItem value="GDSN_DATA">GDSN Data</SelectItem>
              <SelectItem value="ESRS_DATAPOINTS">ESRS Datapoints</SelectItem>
              <SelectItem value="CBV_VOCABULARIES">CBV Vocabularies</SelectItem>
              <SelectItem value="DPP_RULES">DPP Rules</SelectItem>
              <SelectItem value="EU_REGULATIONS">EU Regulations</SelectItem>
              <SelectItem value="INDUSTRY_DATASETS">Industry Datasets</SelectItem>
            </SelectContent>
          </Select>

          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="XML">XML</SelectItem>
              <SelectItem value="XLSX">XLSX</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="API">API</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showNeedsVerification ? "default" : "outline"}
            onClick={() => setShowNeedsVerification(!showNeedsVerification)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Needs Verification Only
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setCategoryFilter(undefined);
              setFormatFilter(undefined);
              setShowNeedsVerification(false);
            }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Dataset List */}
      <div className="space-y-4">
        {isLoading && <div>Loading datasets...</div>}
        
        {datasets && datasets.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No datasets found matching your filters.
            </CardContent>
          </Card>
        )}

        {datasets?.map((dataset) => {
          const verificationStatus = getVerificationStatus(dataset.lastVerifiedDate);

          return (
            <Card key={dataset.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {dataset.name}
                    </CardTitle>
                    <CardDescription className="mt-2">{dataset.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline">{dataset.category}</Badge>
                    <Badge variant="outline">{dataset.format}</Badge>
                    {!dataset.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {dataset.version && (
                    <div>
                      <div className="text-muted-foreground">Version</div>
                      <div className="font-medium">{dataset.version}</div>
                    </div>
                  )}
                  {dataset.recordCount && (
                    <div>
                      <div className="text-muted-foreground">Records</div>
                      <div className="font-medium">{dataset.recordCount.toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Source</div>
                    <div className="font-medium truncate">{dataset.source}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Lane Status</div>
                    <Badge variant="outline">{dataset.laneStatus}</Badge>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  {verificationStatus.status === "current" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">Verification Status</div>
                    <div className="text-sm text-muted-foreground">{verificationStatus.text}</div>
                    {dataset.verifiedBy && (
                      <div className="text-xs text-muted-foreground">by {dataset.verifiedBy}</div>
                    )}
                  </div>
                  {verificationStatus.status !== "current" && (
                    <Badge variant="destructive">Action Required</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {dataset.downloadUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={dataset.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                  {dataset.apiEndpoint && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={dataset.apiEndpoint} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        API
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <a href={dataset.source} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Source
                    </a>
                  </Button>
                </div>

                {/* Governance Notes */}
                {dataset.governanceNotes && (
                  <Alert>
                    <AlertDescription className="text-sm">{dataset.governanceNotes}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
