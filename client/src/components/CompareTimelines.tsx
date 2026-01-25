/**
 * Multi-Regulation Timeline Comparison Component
 *
 * Displays side-by-side timelines for multiple regulations to help users:
 * - Identify overlapping deadlines
 * - Understand cross-regulation dependencies
 * - Plan compliance activities across multiple regulations
 *
 * Features:
 * - Side-by-side timeline columns
 * - Synchronized date axis
 * - Overlapping event highlighting
 * - Interactive regulation selector
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Milestone,
  Newspaper,
  TrendingUp,
  X,
  Plus,
} from "lucide-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { trpc } from "@/lib/trpc";

interface RegulationData {
  code: string;
  title: string;
  color: string; // For visual distinction
  timeline: Array<{
    date: string;
    event: string;
    description: string;
    status: "completed" | "upcoming" | "future";
  }>;
}

interface CompareTimelinesProps {
  regulations: RegulationData[];
  onRemoveRegulation?: (code: string) => void;
  onAddRegulation?: () => void;
}

type TimelineEvent = {
  id: string;
  date: Date;
  type: "milestone" | "news";
  regulationCode: string;
  regulationTitle: string;
  regulationColor: string;
  title: string;
  description?: string;
  status?: "completed" | "upcoming" | "future";
  impactLevel?: string;
  newsId?: number;
};

export function CompareTimelines({
  regulations,
  onRemoveRegulation,
  onAddRegulation,
}: CompareTimelinesProps) {
  const [showNews, setShowNews] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "past" | "future">("all");

  const { data: newsItems } = trpc.hub.getRecentNews.useQuery({ limit: 100 });

  // Combine all events from all regulations
  const allEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    regulations.forEach(reg => {
      // Add milestones
      reg.timeline.forEach((milestone, index) => {
        events.push({
          id: `${reg.code}-milestone-${index}`,
          date: parseISO(milestone.date),
          type: "milestone",
          regulationCode: reg.code,
          regulationTitle: reg.title,
          regulationColor: reg.color,
          title: milestone.event,
          description: milestone.description,
          status: milestone.status,
        });
      });

      // Add related news
      if (showNews && newsItems) {
        const relatedNews = newsItems.filter(
          item =>
            Array.isArray(item.regulationTags) &&
            item.regulationTags.includes(reg.code)
        );

        relatedNews.forEach(news => {
          events.push({
            id: `${reg.code}-news-${news.id}`,
            date: new Date(news.publishedDate || news.createdAt),
            type: "news",
            regulationCode: reg.code,
            regulationTitle: reg.title,
            regulationColor: reg.color,
            title: news.title,
            description: news.summary || undefined,
            impactLevel: news.impactLevel || undefined,
            newsId: news.id,
          });
        });
      }
    });

    // Sort by date (most recent first)
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply date range filter
    const now = new Date();
    if (dateRange === "past") {
      return events.filter(event => event.date < now);
    } else if (dateRange === "future") {
      return events.filter(event => event.date > now);
    }

    return events;
  }, [regulations, newsItems, showNews, dateRange]);

  // Detect overlapping events (events in the same month across different regulations)
  const overlappingPeriods = useMemo(() => {
    const periods = new Map<string, TimelineEvent[]>();

    allEvents.forEach(event => {
      const monthKey = `${event.date.getFullYear()}-${event.date.getMonth()}`;
      if (!periods.has(monthKey)) {
        periods.set(monthKey, []);
      }
      periods.get(monthKey)!.push(event);
    });

    // Filter to only periods with events from multiple regulations
    const overlapping: Array<{ monthKey: string; events: TimelineEvent[] }> =
      [];
    periods.forEach((events, monthKey) => {
      const uniqueRegulations = new Set(events.map(e => e.regulationCode));
      if (uniqueRegulations.size > 1) {
        overlapping.push({ monthKey, events });
      }
    });

    return overlapping;
  }, [allEvents]);

  // Group events by regulation for column display
  const eventsByRegulation = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>();

    regulations.forEach(reg => {
      grouped.set(reg.code, []);
    });

    allEvents.forEach(event => {
      grouped.get(event.regulationCode)?.push(event);
    });

    return grouped;
  }, [allEvents, regulations]);

  const impactColors = {
    HIGH: "bg-red-500/10 text-red-600 border-red-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    LOW: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  if (regulations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Regulations Selected
            </h3>
            <p className="text-muted-foreground mb-4">
              Select 2-4 regulations to compare their timelines and identify
              overlapping deadlines.
            </p>
            {onAddRegulation && (
              <Button onClick={onAddRegulation} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Regulations
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Comparison
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comparing {regulations.length}{" "}
                {regulations.length === 1 ? "regulation" : "regulations"} •{" "}
                {overlappingPeriods.length} overlapping{" "}
                {overlappingPeriods.length === 1 ? "period" : "periods"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={showNews ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNews(!showNews)}
                className="gap-2"
              >
                <Newspaper className="h-4 w-4" />
                News
              </Button>
              <Button
                variant={dateRange === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange("all")}
              >
                All
              </Button>
              <Button
                variant={dateRange === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange("past")}
              >
                Past
              </Button>
              <Button
                variant={dateRange === "future" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange("future")}
              >
                Future
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Selected Regulations */}
      <div className="flex flex-wrap gap-2">
        {regulations.map(reg => (
          <Badge
            key={reg.code}
            className="px-3 py-2 text-sm"
            style={{
              backgroundColor: `${reg.color}20`,
              color: reg.color,
              borderColor: `${reg.color}40`,
            }}
          >
            {reg.code}: {reg.title}
            {onRemoveRegulation && (
              <button
                onClick={() => onRemoveRegulation(reg.code)}
                className="ml-2 hover:opacity-70"
                aria-label={`Remove ${reg.code}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {onAddRegulation && regulations.length < 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddRegulation}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Regulation
          </Button>
        )}
      </div>

      {/* Overlapping Periods Alert */}
      {overlappingPeriods.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {overlappingPeriods.length} Overlapping{" "}
                  {overlappingPeriods.length === 1 ? "Period" : "Periods"}{" "}
                  Detected
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Multiple regulations have events in the same time period.
                  Review these carefully to coordinate compliance activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side-by-Side Timeline Columns */}
      <div
        className={`grid gap-6 ${regulations.length === 2 ? "md:grid-cols-2" : regulations.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}
      >
        {regulations.map(reg => {
          const events = eventsByRegulation.get(reg.code) || [];

          return (
            <Card
              key={reg.code}
              className="border-2"
              style={{ borderColor: `${reg.color}40` }}
            >
              <CardHeader
                className="pb-4"
                style={{ backgroundColor: `${reg.color}10` }}
              >
                <CardTitle className="text-lg flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: reg.color }}
                  />
                  {reg.code}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{reg.title}</p>
                <Badge variant="secondary" className="w-fit mt-2">
                  {events.length} {events.length === 1 ? "event" : "events"}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No events in selected range
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map(event => {
                      // Check if this event overlaps with other regulations
                      const isOverlapping = overlappingPeriods.some(period =>
                        period.events.some(e => e.id === event.id)
                      );

                      return (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border ${
                            isOverlapping
                              ? "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/10"
                              : "border-border bg-accent/30"
                          }`}
                        >
                          {/* Event Type Icon */}
                          <div className="flex items-center gap-2 mb-2">
                            {event.type === "milestone" ? (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    event.status === "completed"
                                      ? "#22c55e"
                                      : event.status === "upcoming"
                                        ? "#3b82f6"
                                        : "#cbd5e1",
                                }}
                              >
                                <Milestone className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                <Newspaper className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(event.date, "MMM d, yyyy")}
                            </span>
                            {isOverlapping && (
                              <Badge
                                variant="outline"
                                className="ml-auto text-xs border-orange-500/50 text-orange-700"
                              >
                                Overlap
                              </Badge>
                            )}
                          </div>

                          {/* Event Title */}
                          {event.type === "news" && event.newsId ? (
                            <Link href={`/news/${event.newsId}`}>
                              <h5 className="font-semibold text-sm mb-1 hover:text-primary cursor-pointer line-clamp-2">
                                {event.title}
                              </h5>
                            </Link>
                          ) : (
                            <h5 className="font-semibold text-sm mb-1 line-clamp-2">
                              {event.title}
                            </h5>
                          )}

                          {/* Event Description */}
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {event.description}
                            </p>
                          )}

                          {/* Event Metadata */}
                          {event.type === "milestone" && event.status && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                event.status === "completed"
                                  ? "bg-green-500/10 text-green-700"
                                  : event.status === "upcoming"
                                    ? "bg-blue-500/10 text-blue-700"
                                    : "bg-slate-500/10 text-slate-700"
                              }`}
                            >
                              {event.status}
                            </Badge>
                          )}
                          {event.type === "news" && event.impactLevel && (
                            <Badge
                              className={`text-xs ${impactColors[event.impactLevel as keyof typeof impactColors]}`}
                            >
                              {event.impactLevel}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
