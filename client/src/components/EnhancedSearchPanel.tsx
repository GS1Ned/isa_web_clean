/**
 * Enhanced Search Panel - Integrates askISAV2 router
 * 
 * Provides advanced search capabilities with filtering by:
 * - Source Type (regulation, gs1_standard, esrs_datapoint, etc.)
 * - Semantic Layer (juridisch, normatief, operationeel)
 * - Authority Level (binding, authoritative, guidance, informational)
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Filter,
  Loader2,
  ExternalLink,
  ChevronDown,
  FileText,
  BookOpen,
  Database,
  Scale,
  Layers,
  Shield,
} from "lucide-react";

// Filter options
const SOURCE_TYPES = [
  { value: "regulation", label: "Regulations", icon: Scale },
  { value: "gs1_standard", label: "GS1 Standards", icon: BookOpen },
  { value: "esrs_datapoint", label: "ESRS Datapoints", icon: Database },
  { value: "cbv_vocabulary", label: "CBV Vocabulary", icon: FileText },
  { value: "dpp_component", label: "DPP Components", icon: Layers },
  { value: "news", label: "News", icon: FileText },
];

const SEMANTIC_LAYERS = [
  { value: "juridisch", label: "Juridisch", description: "Legally binding requirements" },
  { value: "normatief", label: "Normatief", description: "Industry standards and norms" },
  { value: "operationeel", label: "Operationeel", description: "Operational guidance" },
];

const AUTHORITY_LEVELS = [
  { value: "binding", label: "Binding", color: "bg-red-500" },
  { value: "authoritative", label: "Authoritative", color: "bg-orange-500" },
  { value: "guidance", label: "Guidance", color: "bg-yellow-500" },
  { value: "informational", label: "Informational", color: "bg-blue-500" },
];

interface SearchResult {
  id: number;
  sourceType: string;
  title: string;
  content: string;
  url: string | null;
  authorityLevel: string | null;
  semanticLayer: string | null;
  sourceAuthority: string | null;
  similarity: number;
}

interface EnhancedSearchPanelProps {
  onResultSelect?: (result: SearchResult) => void;
}

export function EnhancedSearchPanel({ onResultSelect }: EnhancedSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);
  const [selectedSemanticLayers, setSelectedSemanticLayers] = useState<string[]>([]);
  const [selectedAuthorityLevels, setSelectedAuthorityLevels] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Use the askISAV2 enhanced search
  const searchMutation = trpc.askISAV2.enhancedSearch.useQuery(
    {
      query,
      filters: {
        sourceTypes: selectedSourceTypes.length > 0 ? selectedSourceTypes : undefined,
        semanticLayers: selectedSemanticLayers.length > 0 
          ? selectedSemanticLayers as ("juridisch" | "normatief" | "operationeel")[]
          : undefined,
        authorityLevels: selectedAuthorityLevels.length > 0
          ? selectedAuthorityLevels as ("binding" | "authoritative" | "guidance" | "informational")[]
          : undefined,
      },
      limit: 20,
    },
    {
      enabled: query.length >= 3,
    }
  );

  // Update results when data changes (TanStack Query v5)
  useEffect(() => {
    if (searchMutation.data?.results) {
      setResults(searchMutation.data.results);
    }
  }, [searchMutation.data]);

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearFilters = () => {
    setSelectedSourceTypes([]);
    setSelectedSemanticLayers([]);
    setSelectedAuthorityLevels([]);
  };

  const activeFilterCount =
    selectedSourceTypes.length +
    selectedSemanticLayers.length +
    selectedAuthorityLevels.length;

  const getSourceTypeIcon = (sourceType: string) => {
    const type = SOURCE_TYPES.find((t) => t.value === sourceType);
    if (type) {
      const Icon = type.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getAuthorityBadgeColor = (level: string | null) => {
    const authority = AUTHORITY_LEVELS.find((a) => a.value === level);
    return authority?.color || "bg-gray-500";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Enhanced Knowledge Search
        </CardTitle>
        <CardDescription>
          Search across 1,000+ documents with advanced filtering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regulations, standards, datapoints..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilterCount > 0 ? "border-primary" : ""}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            {/* Source Types */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Source Type</Label>
              <div className="flex flex-wrap gap-2">
                {SOURCE_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedSourceTypes.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      toggleFilter(type.value, selectedSourceTypes, setSelectedSourceTypes)
                    }
                    className="h-8"
                  >
                    <type.icon className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Semantic Layers */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Semantic Layer</Label>
              <div className="flex flex-wrap gap-2">
                {SEMANTIC_LAYERS.map((layer) => (
                  <Button
                    key={layer.value}
                    variant={selectedSemanticLayers.includes(layer.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      toggleFilter(layer.value, selectedSemanticLayers, setSelectedSemanticLayers)
                    }
                    className="h-8"
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    {layer.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Authority Levels */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Authority Level</Label>
              <div className="flex flex-wrap gap-2">
                {AUTHORITY_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    variant={selectedAuthorityLevels.includes(level.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      toggleFilter(level.value, selectedAuthorityLevels, setSelectedAuthorityLevels)
                    }
                    className="h-8"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />
          </CollapsibleContent>
        </Collapsible>

        {/* Results */}
        {searchMutation.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!searchMutation.isLoading && results.length > 0 && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onResultSelect?.(result)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getSourceTypeIcon(result.sourceType)}
                        <CardTitle className="text-sm line-clamp-1">
                          {result.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {result.authorityLevel && (
                          <Badge
                            variant="secondary"
                            className={`text-xs text-white ${getAuthorityBadgeColor(
                              result.authorityLevel
                            )}`}
                          >
                            {result.authorityLevel}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {result.similarity}%
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {result.content}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.sourceType}
                      </Badge>
                      {result.semanticLayer && (
                        <Badge variant="outline" className="text-xs">
                          {result.semanticLayer}
                        </Badge>
                      )}
                      {result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Source
                        </a>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {!searchMutation.isLoading && query.length >= 3 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No results found. Try adjusting your search or filters.
            </p>
          </div>
        )}

        {query.length < 3 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Enter at least 3 characters to search
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EnhancedSearchPanel;
