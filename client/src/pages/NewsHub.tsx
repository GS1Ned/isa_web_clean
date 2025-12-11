/**
 * News Hub Page
 * Full news feed with filtering, sorting, and pagination
 */

import { useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { NewsCardSkeleton } from "@/components/NewsCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Newspaper, Search, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";

const REGULATION_FILTERS = [
  "All",
  "CSRD",
  "ESRS",
  "EUDR",
  "DPP",
  "PPWR",
  "ESPR",
  "CSDDD",
  "TAXONOMY",
  "BATTERIES",
];
const IMPACT_FILTERS = ["All", "HIGH", "MEDIUM", "LOW"];
const SOURCE_TYPE_FILTERS = ["All", "GS1 Official", "EU Official"];

export default function NewsHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regulationFilter, setRegulationFilter] = useState("All");
  const [impactFilter, setImpactFilter] = useState("All");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "impact">("date");
  const [displayLimit, setDisplayLimit] = useState(20);

  // Reset pagination when filters change
  const resetPagination = () => setDisplayLimit(20);

  const { data: newsItems, isLoading } = trpc.hub.getRecentNews.useQuery({
    limit: 100,
  });

  // Filter and sort news items
  const filteredNews = newsItems
    ?.filter((item: any) => {
      const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesRegulation =
        regulationFilter === "All" ||
        (Array.isArray(item.regulationTags) &&
          item.regulationTags.includes(regulationFilter));

      const matchesImpact =
        impactFilter === "All" || item.impactLevel === impactFilter;

      const matchesSourceType =
        sourceTypeFilter === "All" ||
        (sourceTypeFilter === "GS1 Official" &&
          item.sourceType === "GS1_OFFICIAL") ||
        (sourceTypeFilter === "EU Official" &&
          item.sourceType === "EU_OFFICIAL");

      return (
        matchesSearch && matchesRegulation && matchesImpact && matchesSourceType
      );
    })
    .sort((a: any, b: any) => {
      if (sortBy === "date") {
        return (
          new Date(b.publishedDate || b.createdAt).getTime() -
          new Date(a.publishedDate || a.createdAt).getTime()
        );
      } else {
        const impactOrder: Record<string, number> = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        return (
          (impactOrder[b.impactLevel || "MEDIUM"] || 0) -
          (impactOrder[a.impactLevel || "MEDIUM"] || 0)
        );
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-10 w-10" />
            <h1 className="text-4xl font-bold">ESG Regulatory News</h1>
          </div>
          <p className="text-lg text-primary-foreground/90 max-w-3xl">
            Stay informed with the latest updates on EU sustainability
            regulations and GS1 responses. AI-curated news from authoritative
            sources, updated daily.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container max-w-6xl py-8">
        <div className="bg-card rounded-lg border p-6 mb-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <Filter className="h-4 w-4" />
            <span>Filter & Search</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Regulation Filter */}
            <Select
              value={regulationFilter}
              onValueChange={value => {
                setRegulationFilter(value);
                resetPagination();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Regulation" />
              </SelectTrigger>
              <SelectContent>
                {REGULATION_FILTERS.map(reg => (
                  <SelectItem key={reg} value={reg}>
                    {reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Type Filter */}
            <Select
              value={sourceTypeFilter}
              onValueChange={value => {
                setSourceTypeFilter(value);
                resetPagination();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Source Type" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPE_FILTERS.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Impact Filter */}
            <Select
              value={impactFilter}
              onValueChange={value => {
                setImpactFilter(value);
                resetPagination();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Impact Level" />
              </SelectTrigger>
              <SelectContent>
                {IMPACT_FILTERS.map(impact => (
                  <SelectItem key={impact} value={impact}>
                    {impact === "All"
                      ? "All Impact Levels"
                      : `${impact} Impact`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("date")}
              >
                Latest First
              </Button>
              <Button
                variant={sortBy === "impact" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("impact")}
              >
                Highest Impact
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(regulationFilter !== "All" ||
            impactFilter !== "All" ||
            sourceTypeFilter !== "All" ||
            searchQuery) && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {regulationFilter !== "All" && (
                <Badge variant="secondary" className="gap-1">
                  {regulationFilter}
                  <button
                    onClick={() => setRegulationFilter("All")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {impactFilter !== "All" && (
                <Badge variant="secondary" className="gap-1">
                  {impactFilter} Impact
                  <button
                    onClick={() => setImpactFilter("All")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {sourceTypeFilter !== "All" && (
                <Badge variant="secondary" className="gap-1">
                  {sourceTypeFilter}
                  <button
                    onClick={() => setSourceTypeFilter("All")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRegulationFilter("All");
                  setImpactFilter("All");
                  setSourceTypeFilter("All");
                  setSearchQuery("");
                }}
                className="ml-auto"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* News Feed */}
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredNews && filteredNews.length > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(displayLimit, filteredNews.length)} of{" "}
              {filteredNews.length}{" "}
              {filteredNews.length === 1 ? "article" : "articles"}
            </p>
            <div className="grid gap-4">
              {filteredNews.slice(0, displayLimit).map((item: any) => (
                <NewsCard
                  key={item.id}
                  news={{
                    id: item.id,
                    title: item.title,
                    summary: item.summary || "",
                    publishedDate: new Date(
                      item.publishedDate || item.createdAt
                    ),
                    regulationTags: Array.isArray(item.regulationTags)
                      ? item.regulationTags
                      : [],
                    impactLevel: item.impactLevel || "MEDIUM",
                    sourceUrl: item.sourceUrl || "#",
                    sourceTitle: item.sourceTitle || "Unknown Source",
                    sourceType: item.sourceType || "EU_OFFICIAL",
                    newsType: item.newsType,
                  }}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayLimit < filteredNews.length && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() =>
                    setDisplayLimit(prev =>
                      Math.min(prev + 20, filteredNews.length)
                    )
                  }
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  Load More Articles
                  <span className="text-xs text-muted-foreground">
                    ({filteredNews.length - displayLimit} remaining)
                  </span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No news found</h3>
            <p className="text-muted-foreground">
              {searchQuery ||
              regulationFilter !== "All" ||
              impactFilter !== "All"
                ? "Try adjusting your filters or search query"
                : "News articles will appear here once the automated pipeline runs"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
