import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar, Dot } from "lucide-react";

export interface TimelineMilestone {
  /**
   * ISO date string for the milestone.
   */
  date: string;

  /**
   * Short event title.
   */
  event: string;

  /**
   * Optional summary for the event.
   */
  description?: string;

  /**
   * Current status of the milestone.
   */
  status?: "completed" | "upcoming" | "future";
}

export interface RegulationTimelineProps {
  /**
   * Regulation identifier to scope the timeline.
   */
  regulationCode: string;

  /**
   * Timeline milestones to render.
   */
  milestones?: TimelineMilestone[];

  /**
   * Whether the timeline is loading.
   */
  isLoading?: boolean;

  /**
   * Optional empty state message.
   */
  emptyStateMessage?: string;

  /**
   * Optional className for the container.
   */
  className?: string;
}

const STATUS_LABELS: Record<
  NonNullable<TimelineMilestone["status"]>,
  string
> = {
  completed: "Completed",
  upcoming: "Upcoming",
  future: "Planned",
};

const STATUS_STYLES: Record<
  NonNullable<TimelineMilestone["status"]>,
  string
> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  upcoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  future: "bg-muted text-muted-foreground border-border",
};

export function RegulationTimeline({
  regulationCode,
  milestones = [],
  isLoading = false,
  emptyStateMessage = "No timeline updates have been added yet.",
  className,
}: RegulationTimelineProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </CardContent>
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>Regulation timeline</EmptyTitle>
              <EmptyDescription>{emptyStateMessage}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Badge variant="outline">{regulationCode}</Badge>
              {/* TODO: surface relevant milestones and news events here. */}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">Regulation timeline</CardTitle>
            <CardDescription>
              {milestones.length} milestone{milestones.length === 1 ? "" : "s"} for {regulationCode}
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            View full timeline
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4 border-l border-border pl-4">
          {milestones.map((milestone, index) => {
            const status = milestone.status ?? "future";

            return (
              <li key={`${milestone.event}-${index}`} className="relative">
                <span className="absolute -left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-background">
                  <Dot className="h-6 w-6 text-primary" />
                </span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{milestone.event}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", STATUS_STYLES[status])}
                    >
                      {STATUS_LABELS[status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description ?? "TODO: add milestone description."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {milestone.date}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        {/* TODO: enrich timeline with linked news and filters. */}
      </CardContent>
    </Card>
  );
}
