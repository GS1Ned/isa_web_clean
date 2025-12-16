import React from "react";

import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Filter, RefreshCw, X } from "lucide-react";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  isThisMonth,
  isThisWeek,
  isToday,
  isYesterday,
} from "date-fns";
import {
  NewsTimelineItem,
  type NewsTimelineItemData,
} from "./NewsTimelineItem";

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
] as const;

const SOURCE_TYPE_FILTERS = ["All", "GS1 Official", "EU Official"] as const;

type DateRangeFilter = "all" | "7d" | "30d" | "12m";

type DateGroupKey = "today" | "yesterday" | "thisWeek" | "thisMonth" | "older";

const DATE_GROUP_LABELS: Record<DateGroupKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This Week",
  thisMonth: "This Month",
  older: "Older",
};

const DATE_GROUP_ORDER: DateGroupKey[] = [
  "today",
  "yesterday",
  "thisWeek",
  "thisMonth",
  "older",
];

function normalizeDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const asString = String(value);
  const parsed = new Date(asString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDateGroup(date: Date): DateGroupKey {
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  if (isThisWeek(date)) return "thisWeek";
  if (isThisMonth(date)) return "thisMonth";
  return "older";
}

function mapRawNewsToTimelineItem(raw: any): NewsTimelineItemData | null {
  const date =
    normalizeDate(raw.publishedDate) ||
    normalizeDate(raw.createdAt) ||
    normalizeDate(raw.retrievedAt);

  if (!date) {
    return null;
  }

  return {
    id: raw.id,
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    publishedDate: date,
    regulationTags: Array.isArray(raw.regulationTags) ? raw.regulationTags : [],
    impactLevel: raw.impactLevel ?? null,
    sourceType: raw.sourceType ?? null,
    newsType: raw.newsType ?? null,
    gs1ImpactTags: Array.isArray(raw.gs1ImpactTags) ? raw.gs1ImpactTags : [],
    sectorTags: Array.isArray(raw.sectorTags) ? raw.sectorTags : [],
  };
}

export function NewsTimeline() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [regulationFilter, setRegulationFilter] =
    useState<(typeof REGULATION_FILTERS)[number]>("All");
  const [sourceTypeFilter, setSourceTypeFilter] =
    useState<(typeof SOURCE_TYPE_FILTERS)[number]>("All");
  const [dateRangeFilter, setDateRangeFilter] =
    useState<DateRangeFilter>("all");

  const { data, isLoading, isError, refetch } =
    trpc.hub.getRecentNews.useQuery({
      limit: 100,
    });

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const newsItems = (data ?? []) as any[];

  const filteredNews = useMemo(() => {
    if (!newsItems.length) return [];

    const now = new Date();

    return newsItems
      .map(mapRawNewsToTimelineItem)
      .filter((item): item is NewsTimelineItemData => item !== null)
      .filter(item => {
        const matchesSearch = searchQuery
          ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.summary ?? "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;

        const matchesRegulation =
          regulationFilter === "All" ||
          (Array.isArray(item.regulationTags) &&
            item.regulationTags.includes(regulationFilter));

        const matchesSourceType =
          sourceTypeFilter === "All" ||
          (sourceTypeFilter === "GS1 Official" &&
            item.sourceType === "GS1_OFFICIAL") ||
          (sourceTypeFilter === "EU Official" &&
            item.sourceType === "EU_OFFICIAL");

        const matchesDateRange = (() => {
          if (dateRangeFilter === "all") return true;
          const baseDate = item.publishedDate ?? now;
          const daysDiff = differenceInCalendarDays(now, baseDate);
          if (dateRangeFilter === "7d") return daysDiff <= 7;
          if (dateRangeFilter === "30d") return daysDiff <= 30;
          if (dateRangeFilter === "12m") {
            return differenceInCalendarMonths(now, baseDate) <= 12;
          }
          return true;
        })();

        return (
          matchesSearch &&
          matchesRegulation &&
          matchesSourceType &&
          matchesDateRange
        );
      })
      .sort((a, b) => {
        const aTime = (a.publishedDate ?? new Date(0)).getTime();
        const bTime = (b.publishedDate ?? new Date(0)).getTime();
        return bTime - aTime;
      });
  }, [newsItems, searchQuery, regulationFilter, sourceTypeFilter, dateRangeFilter]);

  const groupedNews = useMemo(() => {
    const groups: Record<DateGroupKey, NewsTimelineItemData[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };

    filteredNews.forEach(item => {
      if (!item.publishedDate) return;
      const group = getDateGroup(item.publishedDate);
      groups[group].push(item);
    });

    return groups;
  }, [filteredNews]);

  const hasResults = filteredNews.length > 0;

  const resetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setRegulationFilter("All");
    setSourceTypeFilter("All");
    setDateRangeFilter("all");
  };

  const renderLoadingState = () => (
    <div className="space-y-4" aria-label="Loading news timeline">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-muted" />
          <div className="absolute left-1.5 top-4 h-3 w-3 rounded-full bg-muted-foreground/40" />
          <Card className="ml-4">
            <CardContent className="py-4 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <Calendar className="h-8 w-8 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium">No news items match your filters.</p>
        <p className="text-xs text-muted-foreground">
          Try adjusting the regulation, source, date range, or search query.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <p className="text-sm font-medium text-destructive">
        Failed to load the news timeline.
      </p>
      <p className="text-xs text-muted-foreground">
        Please check your connection and try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void refetch();
        }}
      >
        <RefreshCw className="mr-1 h-4 w-4" />
        Retry
      </Button>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base md:text-lg">
              News Timeline
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Chronological view of ESG and GS1-related news, grouped by
              recency.
            </CardDescription>
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <div className="flex min-w-[180px] flex-1 items-center gap-2">
            <Input
              placeholder="Search news (title or summary)…"
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              className="h-8 text-xs md:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={regulationFilter}
              onValueChange={value =>
                setRegulationFilter(
                  value as (typeof REGULATION_FILTERS)[number],
                )
              }
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
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

            <Select
              value={sourceTypeFilter}
              onValueChange={value =>
                setSourceTypeFilter(
                  value as (typeof SOURCE_TYPE_FILTERS)[number],
                )
              }
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPE_FILTERS.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={dateRangeFilter}
              onValueChange={value =>
                setDateRangeFilter(value as DateRangeFilter)
              }
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery ||
              regulationFilter !== "All" ||
              sourceTypeFilter !== "All" ||
              dateRangeFilter !== "all") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={resetFilters}
                aria-label="Clear filters"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-[0.65rem] text-muted-foreground">
            {regulationFilter !== "All" && (
              <Badge variant="secondary" className="gap-1">
                {regulationFilter}
                <button
                  type="button"
                  onClick={() => setRegulationFilter("All")}
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
                  type="button"
                  onClick={() => setSourceTypeFilter("All")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {dateRangeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {dateRangeFilter === "7d"
                  ? "Last 7 days"
                  : dateRangeFilter === "30d"
                    ? "Last 30 days"
                    : "Last 12 months"}
                <button
                  type="button"
                  onClick={() => setDateRangeFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                “{searchQuery}”
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && renderLoadingState()}
        {!isLoading && isError && renderErrorState()}
        {!isLoading && !isError && !hasResults && renderEmptyState()}
        {!isLoading && !isError && hasResults && (
          <div className="space-y-6">
            {DATE_GROUP_ORDER.map(group => {
              const items = groupedNews[group];
              if (!items || items.length === 0) return null;

              return (
                <section
                  key={group}
                  aria-label={DATE_GROUP_LABELS[group]}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      {DATE_GROUP_LABELS[group]}
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-4">
                    {items.map(item => (
                      <NewsTimelineItem key={item.id} news={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

