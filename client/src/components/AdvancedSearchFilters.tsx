/**
 * Advanced Search Filters Component
 * 
 * Provides UI for filtering search results by:
 * - Source Type (regulation, standard, datapoint, etc.)
 * - Semantic Layer (juridisch, normatief, operationeel)
 * - Authority Level (official, verified, guidance, etc.)
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  FileText,
  BookOpen,
  Database,
  Newspaper,
  Building2,
  Scale,
  Briefcase,
  Wrench,
  Info,
  Shield,
  CheckCircle2,
  HelpCircle,
  Users,
  Globe,
} from "lucide-react";

// Type definitions
type SourceType = 
  | 'regulation'
  | 'gs1_standard'
  | 'esrs_datapoint'
  | 'cbv_vocabulary'
  | 'dpp_component'
  | 'hub_news'
  | 'dutch_initiative';

type SemanticLayer = 'juridisch' | 'normatief' | 'operationeel';
type AuthorityLevel = 'official' | 'verified' | 'guidance' | 'industry' | 'community';

export interface SearchFilters {
  sourceTypes: SourceType[];
  semanticLayers: SemanticLayer[];
  authorityLevels: AuthorityLevel[];
  minSimilarity: number;
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

// Source type configuration
const SOURCE_TYPE_CONFIG: Record<SourceType, { label: string; icon: React.ReactNode; description: string }> = {
  regulation: {
    label: 'EU Regulations',
    icon: <Scale className="h-4 w-4" />,
    description: 'Official EU regulatory documents (CSRD, EUDR, DPP, etc.)',
  },
  gs1_standard: {
    label: 'GS1 Standards',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'GS1 identification, data capture, and sharing standards',
  },
  esrs_datapoint: {
    label: 'ESRS Datapoints',
    icon: <Database className="h-4 w-4" />,
    description: 'European Sustainability Reporting Standards datapoints',
  },
  cbv_vocabulary: {
    label: 'CBV Vocabularies',
    icon: <FileText className="h-4 w-4" />,
    description: 'Core Business Vocabulary terms and definitions',
  },
  dpp_component: {
    label: 'DPP Components',
    icon: <Wrench className="h-4 w-4" />,
    description: 'Digital Product Passport identifier components',
  },
  hub_news: {
    label: 'News Articles',
    icon: <Newspaper className="h-4 w-4" />,
    description: 'Recent news and updates on sustainability regulations',
  },
  dutch_initiative: {
    label: 'Dutch Initiatives',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Netherlands-specific sustainability initiatives',
  },
};

// Semantic layer configuration
const SEMANTIC_LAYER_CONFIG: Record<SemanticLayer, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  juridisch: {
    label: 'Juridisch (Legal)',
    icon: <Scale className="h-4 w-4" />,
    description: 'Legally binding requirements and obligations',
    color: 'bg-red-100 text-red-800',
  },
  normatief: {
    label: 'Normatief (Normative)',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Industry standards and best practices',
    color: 'bg-blue-100 text-blue-800',
  },
  operationeel: {
    label: 'Operationeel (Operational)',
    icon: <Wrench className="h-4 w-4" />,
    description: 'Implementation guidance and how-to information',
    color: 'bg-green-100 text-green-800',
  },
};

// Authority level configuration
const AUTHORITY_LEVEL_CONFIG: Record<AuthorityLevel, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  official: {
    label: 'Official',
    icon: <Shield className="h-4 w-4" />,
    description: 'Government and regulatory body publications',
    color: 'bg-purple-100 text-purple-800',
  },
  verified: {
    label: 'Verified',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Verified by authoritative standards bodies',
    color: 'bg-blue-100 text-blue-800',
  },
  guidance: {
    label: 'Guidance',
    icon: <HelpCircle className="h-4 w-4" />,
    description: 'Official guidance and interpretation documents',
    color: 'bg-cyan-100 text-cyan-800',
  },
  industry: {
    label: 'Industry',
    icon: <Users className="h-4 w-4" />,
    description: 'Industry association publications',
    color: 'bg-orange-100 text-orange-800',
  },
  community: {
    label: 'Community',
    icon: <Globe className="h-4 w-4" />,
    description: 'Community-contributed content',
    color: 'bg-gray-100 text-gray-800',
  },
};

export function AdvancedSearchFilters({
  filters,
  onChange,
  onReset,
  isCollapsible = true,
  defaultExpanded = false,
}: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Count active filters
  const activeFilterCount = 
    filters.sourceTypes.length + 
    filters.semanticLayers.length + 
    filters.authorityLevels.length +
    (filters.minSimilarity > 0.3 ? 1 : 0);

  // Toggle handlers
  const toggleSourceType = (type: SourceType) => {
    const newTypes = filters.sourceTypes.includes(type)
      ? filters.sourceTypes.filter(t => t !== type)
      : [...filters.sourceTypes, type];
    onChange({ ...filters, sourceTypes: newTypes });
  };

  const toggleSemanticLayer = (layer: SemanticLayer) => {
    const newLayers = filters.semanticLayers.includes(layer)
      ? filters.semanticLayers.filter(l => l !== layer)
      : [...filters.semanticLayers, layer];
    onChange({ ...filters, semanticLayers: newLayers });
  };

  const toggleAuthorityLevel = (level: AuthorityLevel) => {
    const newLevels = filters.authorityLevels.includes(level)
      ? filters.authorityLevels.filter(l => l !== level)
      : [...filters.authorityLevels, level];
    onChange({ ...filters, authorityLevels: newLevels });
  };

  const handleSimilarityChange = (value: number[]) => {
    onChange({ ...filters, minSimilarity: value[0] });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Source Types */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Source Types
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(SOURCE_TYPE_CONFIG) as [SourceType, typeof SOURCE_TYPE_CONFIG[SourceType]][]).map(([type, config]) => (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      filters.sourceTypes.includes(type)
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => toggleSourceType(type)}
                  >
                    <Checkbox
                      checked={filters.sourceTypes.includes(type)}
                      onCheckedChange={() => toggleSourceType(type)}
                    />
                    {config.icon}
                    <span className="text-sm">{config.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Semantic Layers */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Semantic Layer
        </h4>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(SEMANTIC_LAYER_CONFIG) as [SemanticLayer, typeof SEMANTIC_LAYER_CONFIG[SemanticLayer]][]).map(([layer, config]) => (
            <TooltipProvider key={layer}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={filters.semanticLayers.includes(layer) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      filters.semanticLayers.includes(layer) ? config.color : ''
                    }`}
                    onClick={() => toggleSemanticLayer(layer)}
                  >
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Authority Levels */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Authority Level
        </h4>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(AUTHORITY_LEVEL_CONFIG) as [AuthorityLevel, typeof AUTHORITY_LEVEL_CONFIG[AuthorityLevel]][]).map(([level, config]) => (
            <TooltipProvider key={level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={filters.authorityLevels.includes(level) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      filters.authorityLevels.includes(level) ? config.color : ''
                    }`}
                    onClick={() => toggleAuthorityLevel(level)}
                  >
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Minimum Similarity */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Minimum Relevance: {Math.round(filters.minSimilarity * 100)}%
        </h4>
        <Slider
          value={[filters.minSimilarity]}
          onValueChange={handleSimilarityChange}
          min={0}
          max={1}
          step={0.05}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Broader results</span>
          <span>More precise</span>
        </div>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={onReset} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  if (!isCollapsible) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>{filterContent}</CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount} active</Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{filterContent}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default AdvancedSearchFilters;
