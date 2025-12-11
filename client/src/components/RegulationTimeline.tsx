/**
 * Regulation Timeline Component
 *
 * Displays a chronological timeline of regulation milestones and related news events.
 * Features:
 * - Vertical timeline with visual markers
 * - Color-coded events (milestones vs news)
 * - Interactive filtering by date range and event type
 * - Responsive design for mobile/tablet/desktop
 */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Newspaper,
  Milestone,
  Filter,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { trpc } from "@/lib/trpc";

interface TimelineMilestone {
  date: string;
  event: string;
  description: string;
  status: "completed" | "upcoming" | "future";
}

interface RegulationTimelineProps {
  regulationCode: string;
  milestones: TimelineMilestone[];
}

type TimelineEvent = {
  id: string;
  date: Date;
  type: "milestone" | "news";
  title: string;
  description?: string;
  status?: "completed" | "upcoming" | "future";
  impactLevel?: string;
  newsId?: number;
  sourceTitle?: string;
};

export function RegulationTimeline({
  regulationCode,
  milestones,
}: RegulationTimelineProps) {
  const [showMilestones, setShowMilestones] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "past" | "future">("all");

  const { data: newsItems, isLoading } = trpc.hub.getRecentNews.useQuery({
    limit: 100,
  });

  // Combine milestones and news into a unified timeline
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add milestones
    if (showMilestones) {
      milestones.forEach((milestone, index) => {
        events.push({
          id: `milestone-${index}`,
          date: parseISO(milestone.date),
          type: "milestone",
          title: milestone.event,
          description: milestone.description,
          status: milestone.status,
        });
      });
    }

    // Add related news
    if (showNews && newsItems) {
      const relatedNews = newsItems.filter(
        item =>
          Array.isArray(item.regulationTags) &&
          item.regulationTags.includes(regulationCode)
      );

      relatedNews.forEach(news => {
        events.push({
          id: `news-${news.id}`,
          date: new Date(news.publishedDate || news.createdAt),
          type: "news",
          title: news.title,
          description: news.summary || undefined,
          impactLevel: news.impactLevel || undefined,
          newsId: news.id,
          sourceTitle: news.sourceTitle || undefined,
        });
      });
    }

    // Sort by date (most recent first)
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply date range filter
    const now = new Date();
    if (dateRange === "past") {
      return events.filter(event => isBefore(event.date, now));
    } else if (dateRange === "future") {
      return events.filter(event => isAfter(event.date, now));
    }

    return events;
  }, [
    milestones,
    newsItems,
    showMilestones,
    showNews,
    dateRange,
    regulationCode,
  ]);

  const impactColors = {
    HIGH: "bg-red-500/10 text-red-600 border-red-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    LOW: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header with Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Timeline</h3>
              <Badge variant="secondary">
                {timelineEvents.length}{" "}
                {timelineEvents.length === 1 ? "event" : "events"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showMilestones ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
              className="gap-2"
            >
              <Milestone className="h-4 w-4" />
              Milestones
            </Button>
            <Button
              variant={showNews ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNews(!showNews)}
              className="gap-2"
            >
              <Newspaper className="h-4 w-4" />
              News
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              variant={dateRange === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("all")}
            >
              All Time
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

        {/* Timeline */}
        {timelineEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more timeline events.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

            {/* Timeline Events */}
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline Marker */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.type === "milestone"
                          ? event.status === "completed"
                            ? "bg-green-500"
                            : event.status === "upcoming"
                              ? "bg-blue-500"
                              : "bg-slate-300"
                          : "bg-purple-500"
                      }`}
                    >
                      {event.type === "milestone" ? (
                        <Milestone className="h-5 w-5 text-white" />
                      ) : (
                        <Newspaper className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-accent/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
                      {/* Date */}
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(event.date, "MMMM d, yyyy")}
                        {event.type === "milestone" && event.status && (
                          <Badge
                            variant="secondary"
                            className={
                              event.status === "completed"
                                ? "bg-green-500/10 text-green-700"
                                : event.status === "upcoming"
                                  ? "bg-blue-500/10 text-blue-700"
                                  : "bg-slate-500/10 text-slate-700"
                            }
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      {event.type === "news" && event.newsId ? (
                        <Link href={`/news/${event.newsId}`}>
                          <h4 className="font-bold text-lg mb-2 hover:text-primary cursor-pointer">
                            {event.title}
                          </h4>
                        </Link>
                      ) : (
                        <h4 className="font-bold text-lg mb-2">
                          {event.title}
                        </h4>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {event.type === "news" && (
                          <>
                            {event.impactLevel && (
                              <Badge
                                className={
                                  impactColors[
                                    event.impactLevel as keyof typeof impactColors
                                  ]
                                }
                              >
                                <TrendingUp className="mr-1 h-3 w-3" />
                                {event.impactLevel} Impact
                              </Badge>
                            )}
                            {event.sourceTitle && (
                              <Badge variant="outline" className="text-xs">
                                {event.sourceTitle}
                              </Badge>
                            )}
                            {event.newsId && (
                              <Link
                                href={`/news/${event.newsId}`}
                                className="ml-auto text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                              >
                                Read more
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Completed Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Upcoming Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-300" />
              <span className="text-muted-foreground">Future Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">News Event</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
