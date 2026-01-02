import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Info, ExternalLink, TrendingUp, Target, Lightbulb } from "lucide-react";
import { ComplianceCoverageChart } from "@/components/ComplianceCoverageChart";

export default function HubEsrsGs1Mappings() {
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch advisory summary for coverage stats
  const { data: summary, isLoading: summaryLoading } = trpc.advisory.getSummary.useQuery();
  
  // Fetch full advisory for detailed mappings
  const { data: advisory, isLoading: advisoryLoading } = trpc.advisory.getFull.useQuery();

  const isLoading = summaryLoading || advisoryLoading;

  // Filter mappings by selected ESRS standard
  const filteredMappings = selectedStandard === "all" 
    ? advisory?.mappingResults || []
    : advisory?.mappingResults?.filter((m: any) => m.regulationStandard === selectedStandard) || [];

  // Get ESRS standards list
  const esrs_standards = summary?.coverageByESRS 
    ? Object.keys(summary.coverageByESRS).sort()
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8" />
            <h1 className="text-4xl font-bold">ESRS-GS1 Mapping Explorer</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-3xl">
            Explore how GS1 standards map to ESRS disclosure requirements. Discover compliance coverage, 
            identify gaps, and get actionable recommendations for your sustainability reporting.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {/* Coverage Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Mappings</CardDescription>
                  <CardTitle className="text-3xl">{summary?.stats?.totalMappings || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{summary?.stats?.directMappings || 0} direct</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Coverage</CardDescription>
                  <CardTitle className="text-3xl">{summary?.stats?.overallCoveragePercentage || 0}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Environmental (E1-E5)</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Identified Gaps</CardDescription>
                  <CardTitle className="text-3xl">{summary?.stats?.totalGaps || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>{summary?.stats?.moderateGaps || 0} moderate priority</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Advisory Version</CardDescription>
                  <CardTitle className="text-3xl">{summary?.version || "1.1"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 text-indigo-600" />
                    <span>Updated {new Date(summary?.generatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Coverage Overview</TabsTrigger>
                <TabsTrigger value="mappings">Detailed Mappings</TabsTrigger>
                <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
              </TabsList>

              {/* Coverage Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Visual Coverage Chart */}
                {summary?.coverageByESRS && (
                  <ComplianceCoverageChart coverageData={summary.coverageByESRS} />
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>ESRS Coverage by Standard</CardTitle>
                    <CardDescription>
                      How well GS1 standards cover each ESRS disclosure requirement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {esrs_standards.map((standard) => {
                        const coverage = summary?.coverageByESRS?.[standard];
                        const mappingCount = coverage?.mappings || 0;
                        const coverageStatus = coverage?.coverage || "gap";
                        
                        return (
                          <div key={standard} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">ESRS {standard}</h3>
                                  <Badge variant={coverageStatus === "comprehensive" ? "default" : "secondary"}>
                                    {coverageStatus}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{coverage?.name}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{mappingCount}</div>
                                <div className="text-xs text-muted-foreground">mappings</div>
                              </div>
                            </div>
                            
                            {coverage?.keyAttributes && coverage.keyAttributes.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Key GS1 Attributes:</div>
                                <div className="flex flex-wrap gap-1">
                                  {coverage.keyAttributes.slice(0, 4).map((attr: string) => (
                                    <Badge key={attr} variant="outline" className="text-xs">
                                      {attr}
                                    </Badge>
                                  ))}
                                  {coverage.keyAttributes.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{coverage.keyAttributes.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Top Recommendations
                    </CardTitle>
                    <CardDescription>
                      Priority actions to improve ESRS-GS1 compliance mapping
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summary?.topRecommendations?.map((rec: any) => (
                        <div key={rec.id} className="border-l-4 border-blue-600 pl-4 py-2">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge variant={rec.priority === "critical" ? "destructive" : "default"}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Estimated ROI: <span className="font-medium text-foreground">{rec.estimatedROI}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Detailed Mappings Tab */}
              <TabsContent value="mappings" className="space-y-6 mt-6">
                {/* Filter */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Filter by ESRS Standard:</label>
                  <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Standards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Standards</SelectItem>
                      {esrs_standards.map((std) => (
                        <SelectItem key={std} value={`ESRS ${std}`}>
                          ESRS {std}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredMappings.length} mapping{filteredMappings.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Mappings List */}
                <div className="space-y-4">
                  {filteredMappings.map((mapping: any) => (
                    <Card key={mapping.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{mapping.regulationStandard}</Badge>
                              <Badge variant="outline">{mapping.gs1Standard}</Badge>
                              <Badge variant={mapping.confidence === "direct" ? "default" : "secondary"}>
                                {mapping.confidence}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{mapping.topic}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">GS1 Attribute</h4>
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                            {mapping.gs1Attribute}
                          </code>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm mb-2">Rationale</h4>
                          <p className="text-sm text-muted-foreground">{mapping.rationale}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm mb-2">Implementation Guidance</h4>
                          <p className="text-sm text-muted-foreground">{mapping.implementationGuidance}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            Source: {mapping.sourceAuthority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Coverage: {mapping.coverageLevel}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredMappings.length === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>No mappings found</AlertTitle>
                      <AlertDescription>
                        Try selecting a different ESRS standard or view all mappings.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              {/* Gap Analysis Tab */}
              <TabsContent value="gaps" className="space-y-6 mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Gap Analysis</AlertTitle>
                  <AlertDescription>
                    These ESRS requirements currently lack comprehensive GS1 standard coverage. 
                    Recommendations are provided for addressing each gap.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {advisory?.gapAnalysis?.map((gap: any) => (
                    <Card key={gap.id} className="border-l-4 border-orange-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{gap.regulationStandard}</Badge>
                              <Badge variant={
                                gap.severity === "critical" ? "destructive" : 
                                gap.severity === "moderate" ? "default" : 
                                "secondary"
                              }>
                                {gap.severity}
                              </Badge>
                              <Badge variant="outline">Priority: {gap.priority}</Badge>
                            </div>
                            <CardTitle className="text-xl">{gap.topic}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{gap.description}</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            Recommended Action
                          </h4>
                          <p className="text-sm text-muted-foreground">{gap.recommendedAction}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <div>Estimated Effort: <span className="font-medium text-foreground">{gap.estimatedEffort}</span></div>
                          <div>Sectors: <span className="font-medium text-foreground">{gap.sectors?.join(", ")}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!advisory?.gapAnalysis || advisory.gapAnalysis.length === 0) && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle>No gaps identified</AlertTitle>
                      <AlertDescription>
                        All ESRS requirements have comprehensive GS1 standard coverage.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
