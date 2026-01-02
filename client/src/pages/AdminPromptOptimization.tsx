import { useState } from "react";
import { Link } from "wouter";
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
import {
  AlertCircle,

  CheckCircle2,
  Edit2,
  Loader2,
  RefreshCw,
  Save,
  ThumbsDown,
  TrendingUp,
  Zap,
} from "lucide-react";

/**
 * Admin LLM Prompt Optimization Page
 * Allows admins to review low-scored mappings, edit reasoning, and regenerate
 */

export default function AdminPromptOptimization() {
  const { user, loading } = useAuth();
  const [selectedMapping, setSelectedMapping] = useState<any>(null);
  const [editedReasoning, setEditedReasoning] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch low-scored mappings
  const lowScoredQuery = trpc.regulations.getLowScoredMappings.useQuery(
    { minVotes: 3 },
    { enabled: !!user && user.role === "admin" }
  );

  // Fetch vote distribution by standard
  const voteDistributionQuery =
    trpc.regulations.getVoteDistributionByStandard.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });

  // Mutation to regenerate mappings for a regulation
  const regenerateMutation = trpc.regulations.generateEsrsMappings.useMutation({
    onSuccess: () => {
      lowScoredQuery.refetch();
      voteDistributionQuery.refetch();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⛔</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            Only administrators can access this page.
          </p>
          <Link href="/hub">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Return to Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const lowScored = lowScoredQuery.data || [];
  const voteDistribution = voteDistributionQuery.data || [];

  // Calculate statistics
  const totalMappings = lowScored.length;
  const avgApprovalRate =
    lowScored.length > 0
      ? Math.round(
          lowScored.reduce((sum, m) => sum + (m.approvalPercentage || 0), 0) /
            lowScored.length
        )
      : 0;
  const criticalMappings = lowScored.filter(
    m => (m.approvalPercentage || 0) < 30
  ).length;

  const handleSelectMapping = (mapping: any) => {
    setSelectedMapping(mapping);
    setEditedReasoning(mapping.reasoning || "");
    setIsEditing(false);
  };

  const handleSaveReasoning = () => {
    if (selectedMapping) {
      setSelectedMapping({
        ...selectedMapping,
        reasoning: editedReasoning,
      });
      setIsEditing(false);
      // TODO: Save to database via tRPC mutation
    }
  };

  const handleRegenerateMappings = (regulationId: number) => {
    regenerateMutation.mutate({ regulationId });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/admin"
            className="text-accent hover:text-accent/80 transition font-medium"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-lg font-bold text-foreground">
            LLM Prompt Optimization
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Optimize ESRS Mapping Quality
            </h2>
            <p className="text-muted-foreground">
              Review low-scored mappings, improve LLM reasoning, and regenerate
              for better accuracy
            </p>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low-Scored Mappings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalMappings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Below 50% approval rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgApprovalRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Community validation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {criticalMappings}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Below 30% approval
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="low-scored" className="space-y-4">
            <TabsList>
              <TabsTrigger value="low-scored">
                <ThumbsDown className="w-4 h-4 mr-2" />
                Low-Scored Mappings
              </TabsTrigger>
              <TabsTrigger value="by-standard">
                <TrendingUp className="w-4 h-4 mr-2" />
                By Standard
              </TabsTrigger>
              <TabsTrigger value="optimization-guide">
                <Zap className="w-4 h-4 mr-2" />
                Optimization Guide
              </TabsTrigger>
            </TabsList>

            {/* Low-Scored Mappings Tab */}
            <TabsContent value="low-scored" className="space-y-4">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Mapping List */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mappings</CardTitle>
                      <CardDescription>
                        {lowScored.length} mappings need review
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                      {lowScored.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>All mappings have good scores!</p>
                        </div>
                      ) : (
                        lowScored.map(mapping => (
                          <button
                            key={mapping.mappingId}
                            onClick={() => handleSelectMapping(mapping)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedMapping?.mappingId === mapping.mappingId
                                ? "bg-accent/10 border-accent"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {mapping.datapointId}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {mapping.esrs_standard}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  (mapping.approvalPercentage || 0) < 30
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {Math.round(mapping.approvalPercentage || 0)}%
                              </Badge>
                            </div>
                          </button>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Mapping Details */}
                <div className="lg:col-span-2">
                  {selectedMapping ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Mapping Details</CardTitle>
                        <CardDescription>
                          Review and optimize the LLM reasoning
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Metadata */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">
                              Datapoint ID
                            </label>
                            <p className="text-foreground">
                              {selectedMapping.datapointId}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              ESRS Standard
                            </label>
                            <p className="text-foreground">
                              {selectedMapping.esrs_standard}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Relevance Score
                            </label>
                            <p className="text-foreground">
                              {selectedMapping.relevanceScore}/10
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Approval Rate
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    (selectedMapping.approvalRate || 0) < 30
                                      ? "bg-red-500"
                                      : (selectedMapping.approvalRate || 0) < 50
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${selectedMapping.approvalRate || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round(selectedMapping.approvalRate || 0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Reasoning Editor */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">
                              LLM Reasoning
                            </label>
                            {!isEditing && (
                              <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-accent hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedReasoning}
                                onChange={e =>
                                  setEditedReasoning(e.target.value)
                                }
                                className="w-full h-24 p-3 border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveReasoning}
                                  className="flex-1"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsEditing(false)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              {selectedMapping.reasoning ||
                                "No reasoning provided"}
                            </p>
                          )}
                        </div>

                        {/* Action */}
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            After editing the reasoning, regenerate all mappings
                            for this regulation to apply improvements.
                          </AlertDescription>
                        </Alert>

                        <Button
                          onClick={() =>
                            handleRegenerateMappings(
                              selectedMapping.regulationId
                            )
                          }
                          disabled={regenerateMutation.isPending}
                          className="w-full"
                        >
                          {regenerateMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Regenerate Mappings
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center text-muted-foreground">
                          <p>Select a mapping to view details</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* By Standard Tab */}
            <TabsContent value="by-standard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approval Rate by ESRS Standard</CardTitle>
                  <CardDescription>
                    Identify which standards have the most quality issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {voteDistribution.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No data available
                      </p>
                    ) : (
                      voteDistribution.map(item => (
                        <div key={item.esrs_standard} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {item.esrs_standard}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(item.approvalPercentage)}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                item.approvalPercentage < 30
                                  ? "bg-red-500"
                                  : item.approvalPercentage < 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(item.approvalPercentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Optimization Guide Tab */}
            <TabsContent value="optimization-guide" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>LLM Prompt Optimization Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          1
                        </span>
                        Identify Low-Scored Mappings
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Focus on mappings with &lt;30% approval rate. These
                        indicate the LLM is making incorrect relevance
                        judgments.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          2
                        </span>
                        Analyze User Feedback
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Users voting thumbs-down are telling us the mapping is
                        wrong. Look for patterns in which standards/regulations
                        get low scores.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          3
                        </span>
                        Improve the Reasoning
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Edit the reasoning to be more specific about why this
                        datapoint is or isn't relevant. Include keywords,
                        context, and exclusion criteria.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          4
                        </span>
                        Regenerate Mappings
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Click "Regenerate Mappings" to re-run the LLM with the
                        improved reasoning. The LLM will use this as a reference
                        for better accuracy.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          5
                        </span>
                        Monitor Results
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Track approval rates over time. As you improve the
                        reasoning, user feedback should become more positive.
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Pro Tip:</strong> Focus on standards with the
                      lowest approval rates first. Small improvements in
                      reasoning can significantly improve mapping quality across
                      many regulations.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
