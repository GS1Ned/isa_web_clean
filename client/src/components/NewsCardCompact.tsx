/**
 * NewsCardCompact Component
 * Compact news card for sidebar/widget display
 */

import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface NewsCardCompactProps {
  news: {
    id: number;
    title: string;
    summary?: string;
    publishedDate: Date;
    regulationTags: string[];
    impactLevel: "LOW" | "MEDIUM" | "HIGH";
    newsType:
      | "NEW_LAW"
      | "AMENDMENT"
      | "ENFORCEMENT"
      | "COURT_DECISION"
      | "GUIDANCE"
      | "PROPOSAL";
    sources?: Array<{ name: string; type: string; url: string }> | null;
  };
}

export function NewsCardCompact({ news }: NewsCardCompactProps) {
  const { id, title, publishedDate, regulationTags, impactLevel } = news;

  const impactConfig = {
    HIGH: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    MEDIUM: {
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    LOW: {
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
  };

  const config = impactConfig[impactLevel];
  const ImpactIcon = config.icon;

  return (
    <Link href={`/news/${id}`}>
      <div className="group p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded ${config.bgColor} shrink-0`}>
            <ImpactIcon className={`h-3.5 w-3.5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {title}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(publishedDate), "d MMM yyyy")}
              </span>
              {Array.isArray(regulationTags) && regulationTags.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {regulationTags[0]}
                  </Badge>
                  {regulationTags.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      +{regulationTags.length - 1}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
