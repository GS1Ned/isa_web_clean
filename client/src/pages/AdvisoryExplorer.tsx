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
import {
  buildAdvisoryExplorerInventory,
  buildAdvisoryExplorerModel,
  EXPLORER_ALL_FILTER_VALUE,
  formatExplorerFilterLabel,
  fromExplorerSelectValue,
  toExplorerSelectValue,
} from "@/lib/advisory-explorer";

type ExplorerFilterValue = string | undefined;

export default function AdvisoryExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<ExplorerFilterValue>(undefined);
  const [selectedRegulation, setSelectedRegulation] = useState<ExplorerFilterValue>(undefined);
  const [selectedConfidence, setSelectedConfidence] = useState<ExplorerFilterValue>(undefined);
  const [selectedSeverity, setSelectedSeverity] = useState<ExplorerFilterValue>(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<ExplorerFilterValue>(undefined);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: advisory, isLoading } = trpc.advisory.getFull.useQuery();
  const explorerModel = buildAdvisoryExplorerModel(advisory);
  const explorerInventory = buildAdvisoryExplorerInventory(explorerModel);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const handleOptionalFilterChange =
    (setter: (value: ExplorerFilterValue) => void) => (value: string) => {
      setter(fromExplorerSelectValue(value));
    };

  // Filter by search query (client-side)
  const filteredMappings = explorerModel.mappings.filter(m => {
    if (selectedSector && !m.sectors.includes(selectedSector) && !m.sectors.includes("All")) {
      return false;
    }

    if (selectedRegulation && m.regulationStandard !== selectedRegulation) {
      return false;
    }

    if (selectedConfidence && m.confidence !== selectedConfidence) {
      return false;
    }

    return (
      normalizedSearchQuery === "" ||
      m.regulationDatapoint.toLowerCase().includes(normalizedSearchQuery) ||
      m.gs1Attribute?.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  const filteredGaps = explorerModel.gaps.filter(g => {
    if (selectedSeverity && g.category !== selectedSeverity) {
      return false;
    }

    if (
      selectedSector &&
      !g.affectedSectors.includes(selectedSector) &&
      !g.affectedSectors.includes("All")
    ) {
      return false;
    }

    return (
      normalizedSearchQuery === "" ||
      g.title.toLowerCase().includes(normalizedSearchQuery) ||
      g.description.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  const filteredRecommendations = explorerModel.recommendations.filter(r => {
    if (selectedTimeframe && r.timeframe !== selectedTimeframe) {
      return false;
    }

    return (
      normalizedSearchQuery === "" ||
      r.title.toLowerCase().includes(normalizedSearchQuery) ||
      r.description.toLowerCase().includes(normalizedSearchQuery)
    );
  });

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
            ISA v{advisory?.version ?? "1.0"} Locked
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
              <Select
                value={toExplorerSelectValue(selectedSector)}
                onValueChange={handleOptionalFilterChange(setSelectedSector)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPLORER_ALL_FILTER_VALUE}>All sectors</SelectItem>
                  {explorerInventory.sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {formatExplorerFilterLabel(sector)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Regulation */}
            <div>
              <label className="text-sm font-medium mb-2 block">Regulation</label>
              <Select
                value={toExplorerSelectValue(selectedRegulation)}
                onValueChange={handleOptionalFilterChange(setSelectedRegulation)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All regulations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPLORER_ALL_FILTER_VALUE}>All regulations</SelectItem>
                  {explorerInventory.regulations.map((regulation) => (
                    <SelectItem key={regulation} value={regulation}>
                      {formatExplorerFilterLabel(regulation)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Confidence (Mappings tab) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Confidence</label>
              <Select
                value={toExplorerSelectValue(selectedConfidence)}
                onValueChange={handleOptionalFilterChange(setSelectedConfidence)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPLORER_ALL_FILTER_VALUE}>All levels</SelectItem>
                  {explorerInventory.confidenceLevels.map((confidenceLevel) => (
                    <SelectItem key={confidenceLevel} value={confidenceLevel}>
                      {formatExplorerFilterLabel(confidenceLevel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity (Gaps tab) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Gap Severity</label>
              <Select
                value={toExplorerSelectValue(selectedSeverity)}
                onValueChange={handleOptionalFilterChange(setSelectedSeverity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPLORER_ALL_FILTER_VALUE}>All severities</SelectItem>
                  {explorerInventory.gapSeverities.map((gapSeverity) => (
                    <SelectItem key={gapSeverity} value={gapSeverity}>
                      {formatExplorerFilterLabel(gapSeverity)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe (Recommendations tab) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select
                value={toExplorerSelectValue(selectedTimeframe)}
                onValueChange={handleOptionalFilterChange(setSelectedTimeframe)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All timeframes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPLORER_ALL_FILTER_VALUE}>All timeframes</SelectItem>
                  {explorerInventory.recommendationTimeframes.map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {formatExplorerFilterLabel(timeframe)}
                    </SelectItem>
                  ))}
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
          {isLoading ? (
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
                      {formatExplorerFilterLabel(mapping.confidence)}
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
          {isLoading ? (
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
                      {formatExplorerFilterLabel(gap.category)}
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
          {isLoading ? (
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
                      {formatExplorerFilterLabel(rec.timeframe)}
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
                        {formatExplorerFilterLabel(selectedItem.confidence)}
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
                        {formatExplorerFilterLabel(selectedItem.category)}
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
                      <Badge>{formatExplorerFilterLabel(selectedItem.timeframe)}</Badge>
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
