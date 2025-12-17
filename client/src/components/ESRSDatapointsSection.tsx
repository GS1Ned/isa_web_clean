import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";
import { FeedbackButtons } from "@/components/FeedbackButtons";

interface ESRSDatapointsSectionProps {
  regulationId: number;
}

export function ESRSDatapointsSection({
  regulationId,
}: ESRSDatapointsSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Fetch ESRS mappings
  const {
    data: mappings,
    isLoading,
    refetch,
  } = trpc.regulations.getEsrsMappings.useQuery({
    regulationId,
  });

  // Generate mappings mutation (admin only)
  const generateMappings = trpc.regulations.generateEsrsMappings.useMutation({
    onSuccess: result => {
      if (result.success) {
        toast.success(
          `Generated ${result.mappingsCount} ESRS datapoint mappings`
        );
        refetch();
      } else {
        toast.error(`Failed to generate mappings: ${result.error}`);
      }
    },
    onError: error => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleGenerateMappings = () => {
    if (!isAdmin) {
      toast.error("Only admins can generate mappings");
      return;
    }

    toast.info(
      "Generating ESRS datapoint mappings... This may take 10-20 seconds."
    );
    generateMappings.mutate({ regulationId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mappings || mappings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Required ESRS Disclosures
          </CardTitle>
          <CardDescription>
            AI-powered mapping of ESRS datapoints relevant to this regulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ESRS mappings yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate AI-powered mappings to see which ESRS datapoints are
              relevant for this regulation.
            </p>
            {isAdmin ? (
              <Button
                onClick={handleGenerateMappings}
                disabled={generateMappings.isPending}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generateMappings.isPending
                  ? "Generating..."
                  : "Generate ESRS Mappings"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact an admin to generate ESRS mappings for this regulation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by ESRS standard
  const mappingsByStandard = mappings.reduce(
    (acc, mapping) => {
      const standard = mapping.datapoint?.esrs_standard || "Unknown";
      if (!acc[standard]) {
        acc[standard] = [];
      }
      acc[standard].push(mapping);
      return acc;
    },
    {} as Record<string, typeof mappings>
  );

  const totalMappings = mappings.length;
  const mandatoryCount = mappings.filter(
    m => !m.datapoint?.mayVoluntary
  ).length;
  const voluntaryCount = totalMappings - mandatoryCount;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Required ESRS Disclosures
          </CardTitle>
          <CardDescription>
            AI-powered mapping of {totalMappings} ESRS datapoints relevant to
            this regulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-900">
                {totalMappings}
              </div>
              <div className="text-sm text-blue-700">Total Datapoints</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">
                {mandatoryCount}
              </div>
              <div className="text-sm text-green-700">Mandatory</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-900">
                {voluntaryCount}
              </div>
              <div className="text-sm text-amber-700">Voluntary</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/hub/esrs-datapoints">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Browse All ESRS Datapoints
              </Button>
            </Link>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateMappings}
                disabled={generateMappings.isPending}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generateMappings.isPending
                  ? "Regenerating..."
                  : "Regenerate Mappings"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mappings by Standard */}
      {Object.entries(mappingsByStandard)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([standard, standardMappings]) => (
          <Card key={standard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-base">
                  {standard}
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  ({standardMappings.length} datapoints)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {standardMappings
                  .sort(
                    (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
                  )
                  .map(mapping => (
                    <div
                      key={mapping.id}
                      className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {mapping.datapoint?.datapointId}
                            </code>
                            <Badge variant="secondary">
                              {mapping.datapoint?.data_type || "N/A"}
                            </Badge>
                            {mapping.datapoint?.mayVoluntary ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                Voluntary
                              </Badge>
                            ) : (
                              <Badge variant="default">Mandatory</Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground font-medium mb-2">
                            {mapping.datapoint?.datapointName || "N/A"}
                          </p>
                          {mapping.reasoning && (
                            <p className="text-sm text-muted-foreground italic">
                              💡 {mapping.reasoning}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < (mapping.relevanceScore || 0)
                                    ? "bg-green-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Relevance: {mapping.relevanceScore}/10
                          </span>
                        </div>
                      </div>
                      {/* User Feedback */}
                      <div className="mt-3 pt-3 border-t">
                        <FeedbackButtons mappingId={mapping.id} />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
