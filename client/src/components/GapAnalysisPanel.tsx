// @ts-nocheck
/**
 * Gap Analysis Panel Component
 * 
 * Visualizes compliance gap analysis results from the reasoning engine.
 * Shows coverage status, gaps by ESRS standard, and recommendations.
 */

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Lightbulb,
  FileText,
  Target,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";

interface GapAnalysisPanelProps {
  regulationId?: number;
  onRegulationSelect?: (id: number) => void;
}

type CoverageStatus = 'full' | 'partial' | 'none';
type Priority = 'high' | 'medium' | 'low';

const getCoverageIcon = (status: CoverageStatus) => {
  switch (status) {
    case 'full':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'partial':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'none':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const getCoverageBadgeVariant = (status: CoverageStatus) => {
  switch (status) {
    case 'full':
      return 'default';
    case 'partial':
      return 'secondary';
    case 'none':
      return 'destructive';
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
  }
};

export function GapAnalysisPanel({ regulationId, onRegulationSelect }: GapAnalysisPanelProps) {
  const [selectedRegulation, setSelectedRegulation] = useState<number | undefined>(regulationId);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch regulations for the dropdown
  const regulationsQuery = trpc.regulations.list.useQuery({ limit: 50 });

  // Fetch gap analysis when a regulation is selected
  const gapAnalysisQuery = trpc.askISAEnhanced?.analyzeGaps?.useQuery(
    { regulationId: selectedRegulation!, sector: selectedSector === 'all' ? undefined : selectedSector },
    { enabled: !!selectedRegulation }
  );

  // Fetch recommendations
  const recommendationsQuery = trpc.askISAEnhanced?.getRecommendations?.useQuery(
    { regulationId: selectedRegulation! },
    { enabled: !!selectedRegulation && activeTab === 'recommendations' }
  );

  const handleRegulationChange = (value: string) => {
    const id = parseInt(value, 10);
    setSelectedRegulation(id);
    onRegulationSelect?.(id);
  };

  const analysis = gapAnalysisQuery?.data;
  const recommendations = recommendationsQuery?.data?.recommendations || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Compliance Gap Analysis
            </CardTitle>
            <CardDescription>
              Analyze GS1 standard coverage for EU regulatory requirements
            </CardDescription>
          </div>
        </div>

        {/* Regulation Selector */}
        <div className="flex gap-4 mt-4">
          <Select value={selectedRegulation?.toString() || ''} onValueChange={handleRegulationChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a regulation..." />
            </SelectTrigger>
            <SelectContent>
              {regulationsQuery.data?.regulations?.map((reg: any) => (
                <SelectItem key={reg.id} value={reg.id.toString()}>
                  {reg.shortName || reg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select sector..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="fmcg">FMCG</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="diy">DIY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {!selectedRegulation ? (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a regulation to analyze compliance gaps</p>
          </div>
        ) : gapAnalysisQuery?.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Analyzing compliance gaps...</span>
          </div>
        ) : analysis ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gaps">Gap Details</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Coverage Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-center">
                      {analysis.summary.coveragePercentage}%
                    </div>
                    <p className="text-sm text-muted-foreground text-center">Overall Coverage</p>
                    <Progress value={analysis.summary.coveragePercentage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 flex flex-col items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                    <div className="text-2xl font-bold">{analysis.summary.fullyCovered}</div>
                    <p className="text-sm text-muted-foreground">Fully Covered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 flex flex-col items-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                    <div className="text-2xl font-bold">{analysis.summary.partiallyCovered}</div>
                    <p className="text-sm text-muted-foreground">Partially Covered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 flex flex-col items-center">
                    <XCircle className="h-8 w-8 text-red-500 mb-2" />
                    <div className="text-2xl font-bold">{analysis.summary.notCovered}</div>
                    <p className="text-sm text-muted-foreground">Not Covered</p>
                  </CardContent>
                </Card>
              </div>

              {/* Coverage by ESRS Standard */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coverage by ESRS Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.byEsrsStandard && Object.entries(analysis.byEsrsStandard).map(([standard, data]: [string, any]) => (
                      <div key={standard} className="flex items-center gap-4">
                        <div className="w-24 font-medium">{standard}</div>
                        <Progress value={data.coveragePercentage} className="flex-1" />
                        <div className="w-16 text-right text-sm text-muted-foreground">
                          {data.coveragePercentage}%
                        </div>
                        <div className="w-24 text-right text-xs text-muted-foreground">
                          {data.covered}/{data.total} items
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gap Details Tab */}
            <TabsContent value="gaps">
              <ScrollArea className="h-[500px]">
                <Accordion type="single" collapsible className="w-full">
                  {analysis.gaps.map((gap: any, index: number) => (
                    <AccordionItem key={gap.datapointId} value={`gap-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          {getCoverageIcon(gap.coverageStatus)}
                          <div className="flex-1 text-left">
                            <div className="font-medium">{gap.datapointName}</div>
                            <div className="text-sm text-muted-foreground">{gap.esrsStandard}</div>
                          </div>
                          <Badge variant={getCoverageBadgeVariant(gap.coverageStatus)}>
                            {gap.coverageStatus === 'full' ? 'Covered' : 
                             gap.coverageStatus === 'partial' ? 'Partial' : 'Gap'}
                          </Badge>
                          <Badge className={getPriorityColor(gap.priority)}>
                            {gap.priority} priority
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-7 space-y-3">
                          {gap.relatedStandards && gap.relatedStandards.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Related GS1 Standards:</h4>
                              <div className="flex flex-wrap gap-2">
                                {gap.relatedStandards.map((std: string, i: number) => (
                                  <Badge key={i} variant="outline">{std}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {gap.coverageStatus !== 'full' && (
                            <Button variant="outline" size="sm" className="mt-2">
                              <Lightbulb className="h-4 w-4 mr-2" />
                              View Recommendations
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations">
              {recommendationsQuery?.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Generating recommendations...</span>
                </div>
              ) : recommendations.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {recommendations.map((rec: any) => (
                      <Card key={rec.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-yellow-500" />
                              <CardTitle className="text-base">{rec.title}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {rec.timeframe}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                          
                          {rec.suggestedStandards && rec.suggestedStandards.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2">Suggested Standards:</h4>
                              <div className="flex flex-wrap gap-2">
                                {rec.suggestedStandards.map((std: string, i: number) => (
                                  <Badge key={i} variant="secondary">{std}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.implementationSteps && rec.implementationSteps.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Implementation Steps:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                {rec.implementationSteps.map((step: string, i: number) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No recommendations needed - all requirements are covered!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Unable to load gap analysis. Please try again.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GapAnalysisPanel;
