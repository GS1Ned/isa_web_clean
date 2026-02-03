/**
 * GS1 NL Attribute Browser
 * 
 * A dedicated page for browsing and searching GS1 Nederland datamodel attributes.
 * Provides filtering by sector (FMCG, DIY, Healthcare), search functionality,
 * and detailed attribute information for data architects and compliance teams.
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Database, 
  Filter, 
  ChevronRight, 
  ExternalLink,
  Download,
  Info,
  Package,
  Leaf,
  Heart,
  ShoppingBag,
  Building2,
  Shirt
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { NavigationMenu } from "@/components/NavigationMenu";
import Footer from "@/components/Footer";

// Sector configuration aligned with GS1 Nederland
const SECTORS = [
  { id: "all", name: "All Sectors", nameNl: "Alle Sectoren", icon: Database, color: "bg-gray-500" },
  { id: "fmcg", name: "FMCG (Food & Drugstore)", nameNl: "Levensmiddelen & drogisterij", icon: Package, color: "bg-orange-500" },
  { id: "diy", name: "DIY, Garden & Pet", nameNl: "Doe-het-zelf, tuin & dier", icon: Building2, color: "bg-green-500" },
  { id: "healthcare", name: "Healthcare", nameNl: "Gezondheidszorg", icon: Heart, color: "bg-red-500" },
  { id: "fashion", name: "Fashion & Textiles", nameNl: "Mode & textiel", icon: Shirt, color: "bg-purple-500" },
  { id: "sustainability", name: "Sustainability", nameNl: "Duurzaamheid", icon: Leaf, color: "bg-emerald-500" },
];

// Attribute type for the browser
interface GS1Attribute {
  id: number;
  title: string;
  content: string;
  sector: string;
  fieldName?: string;
  dataType?: string;
  mandatory?: boolean;
  url?: string;
}

// Mock data for development - will be replaced with API call
const mockAttributes: GS1Attribute[] = [
  {
    id: 1,
    title: "GTIN (Global Trade Item Number)",
    content: "De unieke identificatie van een handelsartikel. Verplicht voor alle producten in GS1 Data Source.",
    sector: "fmcg",
    fieldName: "gtin",
    dataType: "string",
    mandatory: true,
  },
  {
    id: 2,
    title: "Productnaam (Trade Item Description)",
    content: "De officiële naam van het product zoals deze op de verpakking staat vermeld.",
    sector: "fmcg",
    fieldName: "tradeItemDescription",
    dataType: "string",
    mandatory: true,
  },
  {
    id: 3,
    title: "Eco-score",
    content: "De milieu-impact score van een product op een schaal van A tot E, gebaseerd op levenscyclusanalyse.",
    sector: "sustainability",
    fieldName: "ecoScore",
    dataType: "string",
    mandatory: false,
  },
];

export default function GS1NLAttributeBrowser() {
  const { t, language } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedAttribute, setSelectedAttribute] = useState<GS1Attribute | null>(null);

  // Fetch GS1 NL attributes from API
  const { data: attributes, isLoading, error } = useQuery({
    queryKey: ["/api/gs1nl/attributes", selectedSector],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSector !== "all") {
        params.set("sector", selectedSector);
      }
      const response = await fetch(`/api/gs1nl/attributes?${params.toString()}`);
      if (!response.ok) {
        // Return mock data if API not available
        return mockAttributes;
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter attributes based on search query
  const filteredAttributes = useMemo(() => {
    if (!attributes) return [];
    
    const query = searchQuery.toLowerCase();
    return attributes.filter((attr: GS1Attribute) => {
      const matchesSearch = !query || 
        attr.title.toLowerCase().includes(query) ||
        attr.content.toLowerCase().includes(query) ||
        (attr.fieldName && attr.fieldName.toLowerCase().includes(query));
      
      const matchesSector = selectedSector === "all" || attr.sector === selectedSector;
      
      return matchesSearch && matchesSector;
    });
  }, [attributes, searchQuery, selectedSector]);

  // Get sector stats
  const sectorStats = useMemo(() => {
    if (!attributes) return {};
    
    const stats: Record<string, number> = { all: attributes.length };
    attributes.forEach((attr: GS1Attribute) => {
      stats[attr.sector] = (stats[attr.sector] || 0) + 1;
    });
    return stats;
  }, [attributes]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationMenu />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{language === "nl" ? "Tools" : "Tools"}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{language === "nl" ? "GS1 NL Datamodel" : "GS1 NL Datamodel"}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === "nl" ? "GS1 Nederland Attribute Browser" : "GS1 Netherlands Attribute Browser"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === "nl" 
              ? "Doorzoek en verken alle GS1 Benelux datamodel attributen voor FMCG, DIY, Healthcare en meer."
              : "Browse and explore all GS1 Benelux datamodel attributes for FMCG, DIY, Healthcare and more."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const count = sectorStats[sector.id] || 0;
            const isSelected = selectedSector === sector.id;
            
            return (
              <Card 
                key={sector.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
                }`}
                onClick={() => setSelectedSector(sector.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${sector.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {language === "nl" ? sector.nameNl : sector.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === "nl" 
                ? "Zoek op attribuutnaam, veldnaam of beschrijving..." 
                : "Search by attribute name, field name or description..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder={language === "nl" ? "Selecteer sector" : "Select sector"} />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {language === "nl" ? sector.nameNl : sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {language === "nl" ? "Exporteren" : "Export"}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attribute List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{language === "nl" ? "Attributen" : "Attributes"}</span>
                  <Badge variant="secondary">
                    {filteredAttributes.length} {language === "nl" ? "resultaten" : "results"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredAttributes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{language === "nl" ? "Geen attributen gevonden" : "No attributes found"}</p>
                    <p className="text-sm mt-2">
                      {language === "nl" 
                        ? "Probeer een andere zoekterm of selecteer een andere sector"
                        : "Try a different search term or select another sector"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredAttributes.map((attr: GS1Attribute) => {
                        const sector = SECTORS.find(s => s.id === attr.sector);
                        const Icon = sector?.icon || Database;
                        
                        return (
                          <div
                            key={attr.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                              selectedAttribute?.id === attr.id 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedAttribute(attr)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${sector?.color || "bg-gray-500"} text-white shrink-0`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {attr.title}
                                  </h3>
                                  {attr.mandatory && (
                                    <Badge variant="destructive" className="text-xs">
                                      {language === "nl" ? "Verplicht" : "Required"}
                                    </Badge>
                                  )}
                                </div>
                                {attr.fieldName && (
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                    {attr.fieldName}
                                  </code>
                                )}
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {attr.content}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attribute Detail Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  {language === "nl" ? "Attribuut Details" : "Attribute Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAttribute ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{selectedAttribute.title}</h3>
                      {selectedAttribute.fieldName && (
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground">
                            {language === "nl" ? "Veldnaam: " : "Field name: "}
                          </span>
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {selectedAttribute.fieldName}
                          </code>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "nl" ? "Beschrijving" : "Description"}
                      </h4>
                      <p className="text-sm">{selectedAttribute.content}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {language === "nl" ? "Sector" : "Sector"}
                        </h4>
                        <Badge variant="outline">
                          {SECTORS.find(s => s.id === selectedAttribute.sector)?.[language === "nl" ? "nameNl" : "name"] || selectedAttribute.sector}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {language === "nl" ? "Datatype" : "Data type"}
                        </h4>
                        <Badge variant="secondary">
                          {selectedAttribute.dataType || "string"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {language === "nl" ? "Verplicht" : "Required"}
                      </h4>
                      <Badge variant={selectedAttribute.mandatory ? "destructive" : "secondary"}>
                        {selectedAttribute.mandatory 
                          ? (language === "nl" ? "Ja" : "Yes")
                          : (language === "nl" ? "Nee" : "No")}
                      </Badge>
                    </div>

                    {selectedAttribute.url && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={selectedAttribute.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          {language === "nl" ? "Bekijk documentatie" : "View documentation"}
                        </a>
                      </Button>
                    )}

                    <div className="pt-4 border-t">
                      <Button className="w-full gap-2">
                        <Search className="h-4 w-4" />
                        {language === "nl" ? "Vraag ISA over dit attribuut" : "Ask ISA about this attribute"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {language === "nl" 
                        ? "Selecteer een attribuut om details te bekijken"
                        : "Select an attribute to view details"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {language === "nl" ? "Over het GS1 Benelux Datamodel" : "About the GS1 Benelux Datamodel"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "nl" 
                    ? "Het GS1 Benelux Datamodel definieert alle attributen die nodig zijn voor het uitwisselen van productinformatie via GS1 Data Source. Dit datamodel is specifiek ontwikkeld voor de Benelux-markt en bevat sector-specifieke uitbreidingen voor FMCG, DIY, Healthcare en andere sectoren."
                    : "The GS1 Benelux Datamodel defines all attributes required for exchanging product information via GS1 Data Source. This datamodel is specifically developed for the Benelux market and includes sector-specific extensions for FMCG, DIY, Healthcare and other sectors."}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.gs1.nl/kennisbank/gs1-data-source/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GS1 Data Source
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.gs1belu.org/en/documentation" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {language === "nl" ? "Documentatie" : "Documentation"}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
