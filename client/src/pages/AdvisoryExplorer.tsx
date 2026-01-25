import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Filter, Search, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConfidenceLevel = "direct" | "partial" | "missing" | undefined;
type SeverityLevel = "critical" | "moderate" | "low-priority" | undefined;
type TimeframeLevel = "short-term" | "medium-term" | "long-term" | undefined;
type SectorType = "DIY" | "FMCG" | "Healthcare" | "All" | undefined;

export default function AdvisoryExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<SectorType>(undefined);
  const [selectedRegulation, setSelectedRegulation] = useState<string | undefined>(undefined);
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel>(undefined);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeLevel>(undefined);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch data with filters
  const { data: mappingsData, isLoading: loadingMappings } = trpc.advisory.getMappings.useQuery({
    sector: selectedSector,
    regulation: selectedRegulation,
    confidence: selectedConfidence,
  });

  const { data: gapsData, isLoading: loadingGaps } = trpc.advisory.getGaps.useQuery({
    severity: selectedSeverity,
    sector: selectedSector,
  });

  const { data: recommendationsData, isLoading: loadingRecommendations } = trpc.advisory.getRecommendations.useQuery({
    timeframe: selectedTimeframe,
  });

  // Filter by search query (client-side)
  const filteredMappings = mappingsData?.mappings.filter((m: typeof mappingsData.mappings[number]) =>
    searchQuery === "" ||
    m.regulationDatapoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.gs1Attribute?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredGaps = gapsData?.gaps.filter((g: typeof gapsData.gaps[number]) =>
    searchQuery === "" ||
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredRecommendations = recommendationsData?.recommendations.filter((r: typeof recommendationsData.recommendations[number]) =>
    searchQuery === "" ||
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSector(undefined);
    setSelectedRegulation(undefined);
    setSelectedConfidence(undefined);
    setSelectedSeverity(undefined);
    setSelectedTimeframe(undefined);
  };

  const openDetails = (item: any) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Advisory Explorer</h1>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            ISA v1.0 Locked
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Browse and filter mappings, gaps, and recommendations from the locked advisory
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sector</label>
              <Select value={selectedSector} onValueChange={(v) => setSelectedSector(v as SectorType)}>
                <SelectTrigger>
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All sectors</SelectItem>
                  <SelectItem value="DIY">DIY</SelectItem>
                  <SelectItem value="FMCG">FMCG</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="All">All (cross-sector)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Regulation */}
            <div>
              <label className="text-sm font-medium mb-2 block">Regulation</label>
              <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                <SelectTrigger>
                  <SelectValue placeholder="All regulations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All regulations</SelectItem>
                  <SelectItem value="ESRS E1">ESRS E1</SelectItem>
                  <SelectItem value="ESRS E2">ESRS E2</SelectItem>
                  <SelectItem value="ESRS E3">ESRS E3</SelectItem>
                  <SelectItem value="ESRS E4">ESRS E4</SelectItem>
                  <SelectItem value="ESRS E5">ESRS E5</SelectItem>
                  <SelectItem value="EUDR">EUDR</SelectItem>
                  <SelectItem value="DPP">DPP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidence (Mappings tab) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Confidence</label>
              <Select value={selectedConfidence} onValueChange={(v) => setSelectedConfidence(v as ConfidenceLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All levels</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity (Gaps tab) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Gap Severity</label>
              <Select value={selectedSeverity} onValueChange={(v) => setSelectedSeverity(v as SeverityLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="low-priority">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe (Recommendations tab) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={(v) => setSelectedTimeframe(v as TimeframeLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="All timeframes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">All timeframes</SelectItem>
                  <SelectItem value="short-term">Short-term</SelectItem>
                  <SelectItem value="medium-term">Medium-term</SelectItem>
                  <SelectItem value="long-term">Long-term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="mappings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mappings">
            Mappings ({filteredMappings.length})
          </TabsTrigger>
          <TabsTrigger value="gaps">
            Gaps ({filteredGaps.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations ({filteredRecommendations.length})
          </TabsTrigger>
        </TabsList>

        {/* Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          {loadingMappings ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : filteredMappings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No mappings found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredMappings.map((mapping: typeof filteredMappings[number]) => (
              <Card key={mapping.mappingId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(mapping)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mapping.regulationDatapoint}</CardTitle>
                      <CardDescription className="mt-1">
                        {mapping.regulationStandard} • {mapping.sectors.join(", ")}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      mapping.confidence === "direct" ? "default" :
                      mapping.confidence === "partial" ? "secondary" :
                      "destructive"
                    } className={
                      mapping.confidence === "direct" ? "bg-green-600" :
                      mapping.confidence === "partial" ? "bg-yellow-600" :
                      ""
                    }>
                      {mapping.confidence}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {mapping.gs1Attribute && (
                      <div>
                        <span className="text-muted-foreground">GS1 Attribute: </span>
                        <span className="font-medium">{mapping.gs1Attribute}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Rationale: </span>
                      <span>{mapping.rationale}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          {loadingGaps ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : filteredGaps.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No gaps found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredGaps.map((gap: typeof filteredGaps[number]) => (
              <Card key={gap.gapId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(gap)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        {gap.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {gap.affectedSectors.join(", ")}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      gap.category === "critical" ? "destructive" :
                      gap.category === "moderate" ? "default" :
                      "secondary"
                    } className={
                      gap.category === "moderate" ? "bg-orange-600" : ""
                    }>
                      {gap.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{gap.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {loadingRecommendations ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No recommendations found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredRecommendations.map((rec: typeof filteredRecommendations[number]) => (
              <Card key={rec.recommendationId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(rec)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {rec.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {rec.category} • {rec.estimatedEffort}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      rec.timeframe === "short-term" ? "default" :
                      rec.timeframe === "medium-term" ? "secondary" :
                      "outline"
                    } className={
                      rec.timeframe === "short-term" ? "bg-green-600" :
                      rec.timeframe === "medium-term" ? "bg-blue-600" :
                      ""
                    }>
                      {rec.timeframe}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title || selectedItem?.regulationDatapoint}</DialogTitle>
            <DialogDescription>
              {selectedItem?.mappingId && `Mapping ID: ${selectedItem.mappingId}`}
              {selectedItem?.gapId && `Gap ID: ${selectedItem.gapId}`}
              {selectedItem?.recommendationId && `Recommendation ID: ${selectedItem.recommendationId}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <>
                {/* Common fields */}
                {selectedItem.description && (
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                )}

                {/* Mapping-specific */}
                {selectedItem.mappingId && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-1">Regulation Standard</h4>
                      <p className="text-sm">{selectedItem.regulationStandard}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Confidence</h4>
                      <Badge variant={
                        selectedItem.confidence === "direct" ? "default" :
                        selectedItem.confidence === "partial" ? "secondary" :
                        "destructive"
                      }>
                        {selectedItem.confidence}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Rationale</h4>
                      <p className="text-sm text-muted-foreground">{selectedItem.rationale}</p>
                    </div>
                    {selectedItem.gs1Attribute && (
                      <div>
                        <h4 className="font-semibold mb-1">GS1 Attribute</h4>
                        <p className="text-sm">{selectedItem.gs1Attribute}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Gap-specific */}
                {selectedItem.gapId && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-1">Category</h4>
                      <Badge variant={
                        selectedItem.category === "critical" ? "destructive" :
                        selectedItem.category === "moderate" ? "default" :
                        "secondary"
                      }>
                        {selectedItem.category}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Affected Sectors</h4>
                      <p className="text-sm">{selectedItem.affectedSectors.join(", ")}</p>
                    </div>
                  </>
                )}

                {/* Recommendation-specific */}
                {selectedItem.recommendationId && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-1">Timeframe</h4>
                      <Badge>{selectedItem.timeframe}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Category</h4>
                      <Badge variant="outline">{selectedItem.category}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Estimated Effort</h4>
                      <p className="text-sm">{selectedItem.estimatedEffort}</p>
                    </div>
                  </>
                )}

                {/* Dataset References */}
                {selectedItem.datasetReferences && selectedItem.datasetReferences.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Dataset References</h4>
                    <div className="space-y-1">
                      {selectedItem.datasetReferences.map((ref: string, i: number) => (
                        <code key={i} className="block text-xs bg-muted px-2 py-1 rounded">
                          {ref}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
