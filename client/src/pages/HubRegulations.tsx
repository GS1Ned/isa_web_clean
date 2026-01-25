import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Search,
  ChevronRight,
  Calendar,
  FileText,
  Star,
  TrendingUp,
  Sparkles,
  Shield,
  Leaf,
  Users,
  Building2,
  GitCompare,
  ShoppingCart,
  Truck,
  Wheat,
  Briefcase,
  Factory,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const FEATURED_REGULATION_CODES = ["CSRD", "EUDR", "ESRS", "DPP", "PPWR"];

// Industry filters with regulation mappings
const INDUSTRY_FILTERS = [
  {
    id: "retail",
    label: "Retail & Consumer Goods",
    icon: ShoppingCart,
    regulations: ["CSRD", "ESRS", "DPP", "PPWR", "ESPR", "CSDDD", "EUDR"],
    description: "Product labeling, packaging, sustainability reporting",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    icon: Factory,
    regulations: ["CSRD", "ESRS", "DPP", "ESPR", "BATTERIES", "CSDDD"],
    description: "Product design, supply chain, emissions reporting",
  },
  {
    id: "logistics",
    label: "Logistics & Transport",
    icon: Truck,
    regulations: ["CSRD", "ESRS", "EUDR", "CSDDD"],
    description: "Supply chain traceability, emissions, due diligence",
  },
  {
    id: "food",
    label: "Food & Agriculture",
    icon: Wheat,
    regulations: ["CSRD", "ESRS", "EUDR", "PPWR", "CSDDD"],
    description: "Deforestation-free, packaging, sustainability",
  },
  {
    id: "services",
    label: "Corporate Services",
    icon: Briefcase,
    regulations: ["CSRD", "ESRS", "CSDDD", "TAXONOMY"],
    description: "Sustainability reporting, due diligence",
  },
];

const QUICK_FILTERS = [
  {
    label: "Active Regulations",
    filter: (reg: any) =>
      reg.effectiveDate && new Date(reg.effectiveDate) <= new Date(),
  },
  {
    label: "Enforcement in 2025",
    filter: (reg: any) =>
      reg.title.includes("2025") ||
      (reg.effectiveDate && reg.effectiveDate.includes("2025")),
  },
  {
    label: "Supply Chain Impact",
    filter: (reg: any) =>
      reg.title.toLowerCase().includes("supply") ||
      reg.title.toLowerCase().includes("chain") ||
      reg.title.toLowerCase().includes("traceability"),
  },
];

const CATEGORY_FILTERS = [
  {
    label: "Environmental",
    icon: Leaf,
    filter: (reg: any) =>
      reg.title.toLowerCase().includes("environment") ||
      reg.title.toLowerCase().includes("climate") ||
      reg.title.toLowerCase().includes("deforestation") ||
      reg.title.toLowerCase().includes("ecodesign"),
  },
  {
    label: "Social",
    icon: Users,
    filter: (reg: any) =>
      reg.title.toLowerCase().includes("social") ||
      reg.title.toLowerCase().includes("human") ||
      reg.title.toLowerCase().includes("labor"),
  },
  {
    label: "Governance",
    icon: Building2,
    filter: (reg: any) =>
      reg.title.toLowerCase().includes("governance") ||
      reg.title.toLowerCase().includes("reporting") ||
      reg.title.toLowerCase().includes("disclosure"),
  },
  {
    label: "Product",
    icon: Shield,
    filter: (reg: any) =>
      reg.title.toLowerCase().includes("product") ||
      reg.title.toLowerCase().includes("passport") ||
      reg.title.toLowerCase().includes("packaging"),
  },
  {
    label: "Reporting",
    icon: FileText,
    filter: (reg: any) =>
      reg.title.toLowerCase().includes("reporting") ||
      reg.title.toLowerCase().includes("disclosure") ||
      reg.title.toLowerCase().includes("csrd") ||
      reg.title.toLowerCase().includes("esrs"),
  },
];

export default function HubRegulations() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<number | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // Parse URL parameters for industry filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const industryParam = params.get("industry");
    const searchParam = params.get("search");
    
    if (industryParam && INDUSTRY_FILTERS.some(i => i.id === industryParam)) {
      setSelectedIndustry(industryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);

  const { data: regulations, isLoading } = trpc.regulations.list.useQuery();

  const featuredRegulations = useMemo(() => {
    if (!regulations) return [];
    return regulations
      .filter(reg =>
        FEATURED_REGULATION_CODES.some(code =>
          reg.title.toUpperCase().includes(code)
        )
      )
      .slice(0, 5);
  }, [regulations]);

  const filteredRegulations = useMemo(() => {
    if (!regulations) return [];

    return regulations.filter(reg => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reg.description &&
          reg.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Quick filter
      const matchesQuickFilter =
        selectedQuickFilter === null ||
        QUICK_FILTERS[selectedQuickFilter].filter(reg);

      // Category filter
      const matchesCategory =
        selectedCategory === null ||
        CATEGORY_FILTERS[selectedCategory].filter(reg);

      // Industry filter
      const matchesIndustry = (() => {
        if (!selectedIndustry) return true;
        const industry = INDUSTRY_FILTERS.find(i => i.id === selectedIndustry);
        if (!industry) return true;
        return industry.regulations.some(code =>
          reg.title.toUpperCase().includes(code)
        );
      })();

      return matchesSearch && matchesQuickFilter && matchesCategory && matchesIndustry;
    });
  }, [regulations, searchTerm, selectedQuickFilter, selectedCategory, selectedIndustry]);

  // Calculate recently updated (last 30 days)
  const recentlyUpdatedIds = useMemo(() => {
    if (!regulations) return new Set();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return new Set(
      regulations
        .filter(
          reg => reg.lastUpdated && new Date(reg.lastUpdated) > thirtyDaysAgo
        )
        .map(reg => reg.id)
    );
  }, [regulations]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading regulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                ESG Regulations
              </h2>
              <p className="text-muted-foreground">
                Explore {regulations?.length || 0} EU sustainability regulations
                with AI-powered insights and GS1 standards mapping
              </p>
            </div>
            <Link href="/hub/regulations/compare">
              <Button className="gap-2">
                <GitCompare className="h-4 w-4" />
                Compare Timelines
              </Button>
            </Link>
          </div>

          {/* Featured Regulations */}
          {featuredRegulations.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h3 className="text-xl font-semibold text-foreground">
                  Featured Regulations
                </h3>
              </div>
              <div className="grid md:grid-cols-5 gap-4">
                {featuredRegulations.map(reg => {
                  const code =
                    FEATURED_REGULATION_CODES.find(c =>
                      reg.title.toUpperCase().includes(c)
                    ) || "";
                  return (
                    <Link key={reg.id} href={`/hub/regulations/${reg.id}`}>
                      <Card className="hover:border-blue-500 transition-all hover:shadow-md cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <Badge
                            variant="outline"
                            className="w-fit mb-2 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          >
                            {code}
                          </Badge>
                          <CardTitle className="text-sm leading-tight">
                            {reg.title}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search regulations by title, keyword, or content..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
          </div>

          {/* Industry Filter */}
          {selectedIndustry && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const industry = INDUSTRY_FILTERS.find(i => i.id === selectedIndustry);
                    if (!industry) return null;
                    const Icon = industry.icon;
                    return (
                      <>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Showing regulations for {industry.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {industry.description}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedIndustry(null);
                    // Clear URL param
                    const url = new URL(window.location.href);
                    url.searchParams.delete("industry");
                    window.history.replaceState({}, "", url.toString());
                  }}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Industry Filter Chips */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Filter by Industry:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_FILTERS.map(industry => {
                const Icon = industry.icon;
                return (
                  <Button
                    key={industry.id}
                    variant={selectedIndustry === industry.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newValue = selectedIndustry === industry.id ? null : industry.id;
                      setSelectedIndustry(newValue);
                      // Update URL param
                      const url = new URL(window.location.href);
                      if (newValue) {
                        url.searchParams.set("industry", newValue);
                      } else {
                        url.searchParams.delete("industry");
                      }
                      window.history.replaceState({}, "", url.toString());
                    }}
                    className={`gap-2 ${
                      selectedIndustry === industry.id
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {industry.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Quick Filters:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_FILTERS.map((qf, idx) => (
                <Button
                  key={idx}
                  variant={selectedQuickFilter === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedQuickFilter(
                      selectedQuickFilter === idx ? null : idx
                    )
                  }
                  className={
                    selectedQuickFilter === idx
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  {qf.label}
                </Button>
              ))}
              {(selectedQuickFilter !== null || selectedCategory !== null || selectedIndustry !== null) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedQuickFilter(null);
                    setSelectedCategory(null);
                    setSelectedIndustry(null);
                    // Clear URL params
                    const url = new URL(window.location.href);
                    url.searchParams.delete("industry");
                    window.history.replaceState({}, "", url.toString());
                  }}
                  className="text-muted-foreground"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Categories:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={idx}
                    variant={selectedCategory === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedCategory(selectedCategory === idx ? null : idx)
                    }
                    className={
                      selectedCategory === idx
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {filteredRegulations.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    No regulations found
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're
                    looking for
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedQuickFilter(null);
                      setSelectedCategory(null);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            ) : (
              filteredRegulations.map(reg => (
                <Link key={reg.id} href={`/hub/regulations/${reg.id}`}>
                  <Card className="hover:border-blue-500 transition-all hover:shadow-md cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {reg.regulationType && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                            >
                              {reg.regulationType}
                            </Badge>
                          )}
                          {recentlyUpdatedIds.has(reg.id) && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Recently Updated
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition flex-shrink-0" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition">
                        {reg.title}
                      </CardTitle>
                      {reg.description && (
                        <CardDescription className="line-clamp-2">
                          {reg.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {reg.effectiveDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Effective:{" "}
                              {new Date(reg.effectiveDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {reg.celexId && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-mono text-xs">
                              {reg.celexId}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredRegulations.length > 0 && (
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border text-center text-sm text-muted-foreground">
              Showing {filteredRegulations.length} of {regulations?.length || 0}{" "}
              regulations
              {(selectedQuickFilter !== null ||
                selectedCategory !== null ||
                searchTerm) && (
                <span className="ml-2">
                  •{" "}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedQuickFilter(null);
                      setSelectedCategory(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear filters
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect - ESG Regulations Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
