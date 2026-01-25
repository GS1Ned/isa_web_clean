import { useState } from "react";
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
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {

  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Layers,

  GitCompare,
} from "lucide-react";

/**
 * Enhanced Regulation Comparison Tool
 * Shows overlapping ESRS requirements and compliance dependencies
 */

export default function HubCompareEnhanced() {
  const [selectedReg1Id, setSelectedReg1Id] = useState<number | null>(null);
  const [selectedReg2Id, setSelectedReg2Id] = useState<number | null>(null);

  // Fetch all regulations
  const regulationsQuery = trpc.regulations.list.useQuery(undefined);

  // Fetch ESRS mappings for selected regulations
  const mappings1Query = trpc.regulations.getEsrsMappings.useQuery(
    { regulationId: selectedReg1Id || 0 },
    { enabled: !!selectedReg1Id }
  );

  const mappings2Query = trpc.regulations.getEsrsMappings.useQuery(
    { regulationId: selectedReg2Id || 0 },
    { enabled: !!selectedReg2Id }
  );

  const regulations = regulationsQuery.data || [];
  const mappings1 = mappings1Query.data || [];
  const mappings2 = mappings2Query.data || [];

  // Get selected regulation objects
  const reg1 = regulations.find(r => r.id === selectedReg1Id);
  const reg2 = regulations.find(r => r.id === selectedReg2Id);

  // Calculate overlap analysis
  const getOverlapAnalysis = () => {
    if (!mappings1.length || !mappings2.length) return null;

    const standards1 = new Set(
      mappings1.map(m => m.datapoint?.esrs_standard || "").filter(Boolean)
    );
    const standards2 = new Set(
      mappings2.map(m => m.datapoint?.esrs_standard || "").filter(Boolean)
    );

    const overlappingStandards = Array.from(standards1).filter(s =>
      standards2.has(s)
    );
    const uniqueToReg1 = Array.from(standards1).filter(s => !standards2.has(s));
    const uniqueToReg2 = Array.from(standards2).filter(s => !standards1.has(s));

    // Get mappings for overlapping standards
    const overlappingMappings = {
      reg1: mappings1.filter(m =>
        overlappingStandards.includes(m.datapoint?.esrs_standard || "")
      ),
      reg2: mappings2.filter(m =>
        overlappingStandards.includes(m.datapoint?.esrs_standard || "")
      ),
    };

    return {
      overlappingStandards,
      uniqueToReg1,
      uniqueToReg2,
      overlappingMappings,
      totalOverlap: overlappingStandards.length,
      overlapPercentage: Math.round(
        (overlappingStandards.length /
          Math.max(standards1.size, standards2.size)) *
          100
      ),
    };
  };

  const analysis = getOverlapAnalysis();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/hub"
            className="text-sm text-accent hover:underline mb-4 inline-block"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Regulation Comparison Tool
          </h1>
          <p className="text-muted-foreground">
            Compare two regulations to understand overlapping ESRS requirements
            and compliance dependencies
          </p>
        </div>

        {/* Regulation Selectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Regulation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">First Regulation</CardTitle>
              <CardDescription>Select a regulation to compare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {regulationsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                regulations.map(reg => (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedReg1Id(reg.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedReg1Id === reg.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="font-semibold text-foreground">
                      {reg.regulationType}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {reg.title}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Right Regulation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Second Regulation</CardTitle>
              <CardDescription>Select a regulation to compare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {regulationsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                regulations.map(reg => (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedReg2Id(reg.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedReg2Id === reg.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="font-semibold text-foreground">
                      {reg.regulationType}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {reg.title}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {selectedReg1Id && selectedReg2Id && reg1 && reg2 ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overlapping Standards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analysis?.totalOverlap || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analysis?.overlapPercentage || 0}% overlap
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Unique to {reg1.regulationType}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analysis?.uniqueToReg1.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional requirements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Unique to {reg2.regulationType}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analysis?.uniqueToReg2.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional requirements
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Tabs */}
            <Tabs defaultValue="overlap" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overlap">
                  <Layers className="w-4 h-4 mr-2" />
                  Overlapping Standards
                </TabsTrigger>
                <TabsTrigger value="unique">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Unique Requirements
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Compliance Analysis
                </TabsTrigger>
              </TabsList>

              {/* Overlapping Standards Tab */}
              <TabsContent value="overlap" className="space-y-4">
                {!analysis?.overlappingStandards.length ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No overlapping ESRS standards found between these
                      regulations.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {analysis.overlappingStandards.map(standard => {
                      const mappingsReg1 =
                        analysis.overlappingMappings.reg1.filter(
                          m => m.datapoint?.esrs_standard === standard
                        );
                      const mappingsReg2 =
                        analysis.overlappingMappings.reg2.filter(
                          m => m.datapoint?.esrs_standard === standard
                        );

                      return (
                        <Card key={standard}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {standard}
                              </CardTitle>
                              <Badge variant="secondary">Overlapping</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="font-semibold text-sm mb-2">
                                  {reg1.regulationType} Datapoints
                                </p>
                                <ul className="space-y-1">
                                  {mappingsReg1.map(m => (
                                    <li
                                      key={m.id}
                                      className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                      <span>{m.datapointId}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-semibold text-sm mb-2">
                                  {reg2.regulationType} Datapoints
                                </p>
                                <ul className="space-y-1">
                                  {mappingsReg2.map(m => (
                                    <li
                                      key={m.id}
                                      className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                      <span>{m.datapointId}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Unique Requirements Tab */}
              <TabsContent value="unique" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Unique to Reg1 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Unique to {reg1.regulationType}
                      </CardTitle>
                      <CardDescription>
                        {analysis?.uniqueToReg1.length || 0} standards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!analysis?.uniqueToReg1.length ? (
                        <p className="text-sm text-muted-foreground">
                          All standards overlap with {reg2.regulationType}
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {analysis.uniqueToReg1.map(standard => (
                            <li
                              key={standard}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                            >
                              <Badge variant="outline">{standard}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  {/* Unique to Reg2 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Unique to {reg2.regulationType}
                      </CardTitle>
                      <CardDescription>
                        {analysis?.uniqueToReg2.length || 0} standards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!analysis?.uniqueToReg2.length ? (
                        <p className="text-sm text-muted-foreground">
                          All standards overlap with {reg1.regulationType}
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {analysis.uniqueToReg2.map(standard => (
                            <li
                              key={standard}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                            >
                              <Badge variant="outline">{standard}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Compliance Analysis Tab */}
              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <strong>Unified Compliance Strategy:</strong>{" "}
                        {analysis?.totalOverlap || 0} overlapping ESRS standards
                        can be addressed with a single compliance program
                        covering both regulations.
                      </AlertDescription>
                    </Alert>

                    {analysis?.uniqueToReg1.length ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                          <strong>{reg1.regulationType} Specific:</strong>{" "}
                          {analysis.uniqueToReg1.length} standards are unique to{" "}
                          {reg1.regulationType}. These require additional
                          compliance efforts beyond {reg2.regulationType}{" "}
                          requirements.
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    {analysis?.uniqueToReg2.length ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                          <strong>{reg2.regulationType} Specific:</strong>{" "}
                          {analysis.uniqueToReg2.length} standards are unique to{" "}
                          {reg2.regulationType}. These require additional
                          compliance efforts beyond {reg1.regulationType}{" "}
                          requirements.
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Implementation Priority
                      </h4>
                      <ol className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <span className="font-bold text-accent">1.</span>
                          <span>
                            Address all {analysis?.totalOverlap || 0}{" "}
                            overlapping standards first
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-accent">2.</span>
                          <span>
                            Implement {analysis?.uniqueToReg1.length || 0}{" "}
                            unique {reg1.regulationType} requirements
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-accent">3.</span>
                          <span>
                            Implement {analysis?.uniqueToReg2.length || 0}{" "}
                            unique {reg2.regulationType} requirements
                          </span>
                        </li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select two regulations to compare</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
