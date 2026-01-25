/**
 * GS1 Attributes Panel (Enhanced v0.1)
 *
 * Operationalized compliance tool with Excel export, coverage metrics,
 * enhanced filtering, and search functionality.
 */

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  Package,
  Leaf,
  CheckCircle2,
  Download,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";

interface GS1AttributesPanelEnhancedProps {
  regulationId: number;
  regulationName: string;
}

export function GS1AttributesPanelEnhanced({
  regulationId,
  regulationName,
}: GS1AttributesPanelEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [flagFilter, setFlagFilter] = useState<string>("all");

  const { data: attributes, isLoading: attributesLoading } =
    trpc.gs1Attributes.getAttributesByRegulation.useQuery({
      regulationId,
    });

  const { data: webVocab, isLoading: webVocabLoading } =
    trpc.gs1Attributes.getWebVocabularyByRegulation.useQuery({
      regulationId,
    });

  // Filter attributes based on search and filters
  const filteredAttributes = useMemo(() => {
    if (!attributes) return [];

    let filtered = attributes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        attr =>
          attr.attributeName.toLowerCase().includes(query) ||
          attr.attributeCode?.toLowerCase().includes(query) ||
          attr.description?.toLowerCase().includes(query)
      );
    }

    // Sector filter
    if (sectorFilter !== "all") {
      filtered = filtered.filter(attr => attr.sector === sectorFilter);
    }

    // Flag filter
    if (flagFilter === "packaging") {
      filtered = filtered.filter(attr => attr.packagingRelated);
    } else if (flagFilter === "sustainability") {
      filtered = filtered.filter(attr => attr.sustainabilityRelated);
    }

    return filtered;
  }, [attributes, searchQuery, sectorFilter, flagFilter]);

  // Filter web vocabulary
  const filteredWebVocab = useMemo(() => {
    if (!webVocab) return [];

    if (!searchQuery) return webVocab;

    const query = searchQuery.toLowerCase();
    return webVocab.filter(
      term =>
        term.termName.toLowerCase().includes(query) ||
        term.description?.toLowerCase().includes(query)
    );
  }, [webVocab, searchQuery]);

  // Calculate coverage metrics
  const coverageMetrics = useMemo(() => {
    if (!attributes) return null;

    const totalAttributes = attributes.length;
    const packagingCount = attributes.filter(a => a.packagingRelated).length;
    const sustainabilityCount = attributes.filter(
      a => a.sustainabilityRelated
    ).length;

    const sectors = {
      food_hb: attributes.filter(a => a.sector === "food_hb").length,
      diy_garden_pet: attributes.filter(a => a.sector === "diy_garden_pet")
        .length,
      healthcare: attributes.filter(a => a.sector === "healthcare").length,
    };

    return {
      total: totalAttributes,
      packaging: packagingCount,
      sustainability: sustainabilityCount,
      sectors,
    };
  }, [attributes]);

  // Export to Excel
  const handleExportToExcel = () => {
    if (!attributes || !webVocab) return;

    // Prepare Data Source Attributes sheet
    const attributesData = filteredAttributes.map(attr => ({
      "Attribute Code": attr.attributeCode || "",
      "Attribute Name": attr.attributeName,
      Sector: attr.sector,
      "Data Type": attr.datatype || "",
      Description: attr.description || "",
      "Packaging Related": attr.packagingRelated ? "Yes" : "No",
      "Sustainability Related": attr.sustainabilityRelated ? "Yes" : "No",
      "Relevance Score": attr.relevanceScore || "",
    }));

    // Prepare Web Vocabulary sheet
    const webVocabData = filteredWebVocab.map(term => ({
      "Term Name": term.termName,
      "Term URI": term.termUri,
      "Term Type": term.termType,
      Description: term.description || "",
      "DPP Relevant": term.dppRelevant ? "Yes" : "No",
      "ESRS Relevant": term.esrsRelevant ? "Yes" : "No",
      "EUDR Relevant": term.eudrRelevant ? "Yes" : "No",
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    const wsAttributes = XLSX.utils.json_to_sheet(attributesData);
    const wsWebVocab = XLSX.utils.json_to_sheet(webVocabData);

    XLSX.utils.book_append_sheet(wb, wsAttributes, "Data Source Attributes");
    XLSX.utils.book_append_sheet(wb, wsWebVocab, "Web Vocabulary");

    // Add metadata sheet
    const metadata = [
      { Field: "Regulation", Value: regulationName },
      { Field: "Export Date", Value: new Date().toLocaleDateString() },
      { Field: "Total Attributes", Value: coverageMetrics?.total || 0 },
      { Field: "Packaging Attributes", Value: coverageMetrics?.packaging || 0 },
      {
        Field: "Sustainability Attributes",
        Value: coverageMetrics?.sustainability || 0,
      },
      { Field: "Web Vocabulary Terms", Value: webVocab.length },
    ];
    const wsMetadata = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(wb, wsMetadata, "Metadata");

    // Download
    XLSX.writeFile(
      wb,
      `${regulationName.replace(/\s+/g, "_")}_GS1_Compliance_Checklist.xlsx`
    );
  };

  if (attributesLoading || webVocabLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GS1 Attributes You Need</CardTitle>
          <CardDescription>
            Loading GS1 data model requirements...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAttributes = attributes && attributes.length > 0;
  const hasWebVocab = webVocab && webVocab.length > 0;

  if (!hasAttributes && !hasWebVocab) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GS1 Attributes You Need</CardTitle>
          <CardDescription>
            GS1 data model requirements for {regulationName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No GS1 attributes or Web Vocabulary terms have been mapped to this
              regulation yet. This may indicate that the regulation is not
              directly related to product data, or that the mapping is still in
              progress.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>GS1 Attributes You Need</CardTitle>
            <CardDescription>
              GS1 data model requirements for {regulationName}
            </CardDescription>
          </div>
          <Button onClick={handleExportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        {/* Coverage Metrics */}
        {coverageMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-2xl font-bold">{coverageMetrics.total}</div>
              <div className="text-sm text-muted-foreground">
                Total Attributes
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-2xl font-bold">
                {coverageMetrics.packaging}
              </div>
              <div className="text-sm text-muted-foreground">Packaging</div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-2xl font-bold">
                {coverageMetrics.sustainability}
              </div>
              <div className="text-sm text-muted-foreground">
                Sustainability
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-2xl font-bold">{webVocab?.length || 0}</div>
              <div className="text-sm text-muted-foreground">
                Web Vocab Terms
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="food_hb">Food/Health & Beauty</SelectItem>
              <SelectItem value="diy_garden_pet">DIY/Garden/Pet</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
            </SelectContent>
          </Select>
          <Select value={flagFilter} onValueChange={setFlagFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Attributes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attributes</SelectItem>
              <SelectItem value="packaging">Packaging Only</SelectItem>
              <SelectItem value="sustainability">
                Sustainability Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attributes">
              Data Source Attributes ({filteredAttributes.length})
            </TabsTrigger>
            <TabsTrigger value="web-vocab">
              Web Vocabulary ({filteredWebVocab.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="space-y-4 mt-4">
            {filteredAttributes.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No attributes match your current filters. Try adjusting your
                  search or filters.
                </AlertDescription>
              </Alert>
            ) : (
              filteredAttributes.map(attr => (
                <Card key={attr.id} className="border-l-4 border-l-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {attr.attributeName}
                        </CardTitle>
                        {attr.attributeCode && (
                          <CardDescription className="font-mono text-xs">
                            {attr.attributeCode}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {attr.packagingRelated && (
                          <Badge variant="secondary" className="gap-1">
                            <Package className="h-3 w-3" />
                            Packaging
                          </Badge>
                        )}
                        {attr.sustainabilityRelated && (
                          <Badge variant="secondary" className="gap-1">
                            <Leaf className="h-3 w-3" />
                            Sustainability
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {attr.description && (
                      <p className="text-sm text-muted-foreground">
                        {attr.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">
                        {attr.sector.replace("_", " ").toUpperCase()}
                      </Badge>
                      {attr.datatype && (
                        <Badge variant="outline">{attr.datatype}</Badge>
                      )}
                      {attr.relevanceScore && (
                        <Badge variant="outline">
                          Relevance:{" "}
                          {(
                            parseFloat(String(attr.relevanceScore)) * 100
                          ).toFixed(0)}
                          %
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="web-vocab" className="space-y-4 mt-4">
            {filteredWebVocab.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No Web Vocabulary terms match your current search.
                </AlertDescription>
              </Alert>
            ) : (
              filteredWebVocab.map(term => (
                <Card key={term.id} className="border-l-4 border-l-blue-500/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {term.termName}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs break-all">
                          {term.termUri}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {term.dppRelevant && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            DPP
                          </Badge>
                        )}
                        {term.esrsRelevant && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            ESRS
                          </Badge>
                        )}
                        {term.eudrRelevant && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            EUDR
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {term.description && (
                      <p className="text-sm text-muted-foreground">
                        {term.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{term.termType}</Badge>
                      {term.domain && (
                        <Badge variant="outline">Domain: {term.domain}</Badge>
                      )}
                      {term.range && (
                        <Badge variant="outline">Range: {term.range}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
