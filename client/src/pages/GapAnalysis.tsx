// @ts-nocheck
/**
 * Gap Analysis Page
 * 
 * Dedicated page for compliance gap analysis using the reasoning engine.
 * Allows users to analyze GS1 standard coverage for EU regulatory requirements.
 */

import { useState } from "react";
import { GapAnalysisPanel } from "@/components/GapAnalysisPanel";
import { AdvancedSearchFilters, type SearchFilters } from "@/components/AdvancedSearchFilters";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  Search,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const DEFAULT_FILTERS: SearchFilters = {
  sourceTypes: [],
  semanticLayers: [],
  authorityLevels: [],
  minSimilarity: 0.3,
};

export default function GapAnalysis() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [selectedRegulationId, setSelectedRegulationId] = useState<number | undefined>();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch regulations for quick access
  const regulationsQuery = trpc.regulations.list.useQuery({ limit: 10 });

  // Quick stats
  const stats = [
    { label: "Regulations Tracked", value: "20", icon: <FileText className="h-5 w-5" /> },
    { label: "ESRS Datapoints", value: "914", icon: <Target className="h-5 w-5" /> },
    { label: "GS1 Standards", value: "39", icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: "Mappings Generated", value: "8,534", icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const handleResetFilters = () => {
    setSearchFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Compliance Gap Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze how GS1 standards cover EU regulatory requirements and identify gaps
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="regulations">Regulations Overview</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
        </TabsList>

        {/* Gap Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Quick Access Regulations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
                <CardDescription>Select a regulation to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {regulationsQuery.data?.regulations?.map((reg: any) => (
                      <Button
                        key={reg.id}
                        variant={selectedRegulationId === reg.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedRegulationId(reg.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {reg.shortName || reg.name}
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Gap Analysis Panel */}
            <div className="col-span-2">
              <GapAnalysisPanel
                regulationId={selectedRegulationId}
                onRegulationSelect={setSelectedRegulationId}
              />
            </div>
          </div>
        </TabsContent>

        {/* Regulations Overview Tab */}
        <TabsContent value="regulations">
          <Card>
            <CardHeader>
              <CardTitle>EU Regulations Tracked</CardTitle>
              <CardDescription>
                Overview of all EU sustainability regulations in the ISA knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {regulationsQuery.data?.regulations?.map((reg: any) => (
                  <Card key={reg.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{reg.shortName || reg.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {reg.description || reg.name}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {reg.status || 'Active'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRegulationId(reg.id);
                            setActiveTab("analysis");
                          }}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Analyze Gaps
                        </Button>
                        {reg.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={reg.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Source
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Filters */}
            <div>
              <AdvancedSearchFilters
                filters={searchFilters}
                onChange={setSearchFilters}
                onReset={handleResetFilters}
                isCollapsible={false}
              />
            </div>

            {/* Search Results */}
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Enhanced Search
                  </CardTitle>
                  <CardDescription>
                    Search across all knowledge sources with advanced filtering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Search regulations, standards, datapoints..."
                      className="flex-1 px-4 py-2 border rounded-md"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  {/* Active Filters Display */}
                  {(searchFilters.sourceTypes.length > 0 ||
                    searchFilters.semanticLayers.length > 0 ||
                    searchFilters.authorityLevels.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {searchFilters.sourceTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                      {searchFilters.semanticLayers.map((layer) => (
                        <Badge key={layer} variant="secondary">
                          {layer}
                        </Badge>
                      ))}
                      {searchFilters.authorityLevels.map((level) => (
                        <Badge key={level} variant="secondary">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Placeholder for search results */}
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a search query to find relevant information</p>
                    <p className="text-sm mt-2">
                      Use the filters on the left to narrow down your results
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
