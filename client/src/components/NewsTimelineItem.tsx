import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export type ImpactLevel = "LOW" | "MEDIUM" | "HIGH";

export type SourceType = "EU_OFFICIAL" | "GS1_OFFICIAL" | "INDUSTRY" | "MEDIA";

export type NewsType =
  | "NEW_LAW"
  | "AMENDMENT"
  | "ENFORCEMENT"
  | "COURT_DECISION"
  | "GUIDANCE"
  | "PROPOSAL";

export interface NewsTimelineItemData {
  id: number;
  title: string;
  summary?: string | null;
  publishedDate?: Date | null;
  regulationTags?: string[];
  impactLevel?: ImpactLevel | null;
  sourceType?: SourceType | null;
  newsType?: NewsType | null;
  gs1ImpactTags?: string[];
  sectorTags?: string[];
}

export interface NewsTimelineItemProps {
  news: NewsTimelineItemData;
}

function getImpactConfig(impactLevel?: ImpactLevel | null) {
  if (impactLevel === "HIGH") {
    return {
      label: "High impact",
      className:
        "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    };
  }
  if (impactLevel === "MEDIUM") {
    return {
      label: "Medium impact",
      className:
        "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    };
  }
  if (impactLevel === "LOW") {
    return {
      label: "Low impact",
      className:
        "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    };
  }
  return null;
}

function getSourceLabel(sourceType?: SourceType | null): string | null {
  if (!sourceType) return null;
  const mapping: Record<SourceType, string> = {
    EU_OFFICIAL: "EU Official",
    GS1_OFFICIAL: "GS1 Official",
    INDUSTRY: "Industry",
    MEDIA: "Media",
  };
  return mapping[sourceType] ?? null;
}

function getNewsTypeLabel(newsType?: NewsType | null): string | null {
  if (!newsType) return null;
  const mapping: Record<NewsType, string> = {
    NEW_LAW: "New law",
    AMENDMENT: "Amendment",
    ENFORCEMENT: "Enforcement",
    COURT_DECISION: "Court decision",
    GUIDANCE: "Guidance",
    PROPOSAL: "Proposal",
  };
  return mapping[newsType] ?? null;
}

export function NewsTimelineItem({ news }: NewsTimelineItemProps) {
  const {
    id,
    title,
    summary,
    publishedDate,
    regulationTags = [],
    impactLevel,
    sourceType,
    newsType,
    gs1ImpactTags = [],
    sectorTags = [],
  } = news;

  const date = publishedDate ?? new Date();
  const dateLabel = format(date, "MMM d, yyyy");
  const relativeLabel = formatDistanceToNow(date, { addSuffix: true });

  const impactConfig = getImpactConfig(impactLevel ?? null);
  const sourceLabel = getSourceLabel(sourceType ?? null);
  const newsTypeLabel = getNewsTypeLabel(newsType ?? null);

  const showTags =
    regulationTags.length > 0 ||
    gs1ImpactTags.length > 0 ||
    sectorTags.length > 0;

  return (
    <div className="relative pl-6">
      {/* Vertical timeline line */}
      <div
        className="absolute left-2 top-0 bottom-0 w-px bg-border"
        aria-hidden="true"
      />
      {/* Timeline dot */}
      <div className="absolute left-1.5 top-4 h-3 w-3 rounded-full bg-primary border-2 border-background shadow-sm" />

      <Card className="ml-4 bg-background/80 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardContent className="space-y-2 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateLabel}</span>
              <span className="hidden text-[0.65rem] md:inline">
                ({relativeLabel})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {newsTypeLabel && (
                <Badge
                  variant="outline"
                  className="border-dashed text-[0.65rem] uppercase tracking-wide"
                >
                  {newsTypeLabel}
                </Badge>
              )}
              {sourceLabel && (
                <Badge variant="secondary" className="text-[0.65rem]">
                  {sourceLabel}
                </Badge>
              )}
              {impactConfig && (
                <Badge
                  variant="outline"
                  className={`border text-[0.65rem] ${impactConfig.className}`}
                >
                  {impactConfig.label}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <Link
              href={`/news/${id}`}
              className="group flex items-start gap-2 text-sm font-semibold leading-snug hover:text-primary"
            >
              <span className="flex-1 line-clamp-2">{title}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            {summary && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                {summary}
              </p>
            )}
          </div>

          {showTags && (
            <div className="flex flex-wrap gap-1 pt-1">
              {regulationTags.map(tag => (
                <Badge
                  key={`reg-${tag}`}
                  variant="outline"
                  className="border-dashed text-[0.65rem]"
                >
                  {tag}
                </Badge>
              ))}
              {gs1ImpactTags.map(tag => (
                <Badge
                  key={`impact-${tag}`}
                  variant="outline"
                  className="border-dashed text-[0.65rem]"
                >
                  {tag}
                </Badge>
              ))}
              {sectorTags.map(tag => (
                <Badge
                  key={`sector-${tag}`}
                  variant="outline"
                  className="border-dashed text-[0.65rem]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

