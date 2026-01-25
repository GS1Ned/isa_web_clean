/**
 * Recommended Resources Component
 * Displays AI-generated recommendations for related internal pages
 */

import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Database,
  Package,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface Recommendation {
  resourceType: "REGULATION" | "ESRS_DATAPOINT" | "GS1_STANDARD";
  resourceId: number;
  resourceTitle: string;
  relevanceScore: number;
  reasoning: string;
  matchedKeywords: string[];
}

interface RecommendedResourcesProps {
  recommendations: Recommendation[];
  maxDisplay?: number;
}

export function RecommendedResources({
  recommendations,
  maxDisplay = 6,
}: RecommendedResourcesProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const displayedRecs = recommendations.slice(0, maxDisplay);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Related Resources</CardTitle>
        </div>
        <CardDescription>
          AI-powered recommendations based on article content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedRecs.map((rec, index) => (
          <ResourceCard
            key={`${rec.resourceType}-${rec.resourceId}-${index}`}
            recommendation={rec}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ResourceCard({ recommendation }: { recommendation: Recommendation }) {
  const { resourceType, resourceId, resourceTitle, relevanceScore, reasoning } =
    recommendation;

  const {
    icon: Icon,
    color,
    label,
    href,
  } = getResourceMeta(resourceType, resourceId);

  return (
    <Link href={href}>
      <div className="group flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3 transition-all hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
        <div className={`rounded-md p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {label}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{Math.round(relevanceScore * 100)}% match</span>
            </div>
          </div>

          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {resourceTitle}
          </h4>

          {reasoning && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {reasoning}
            </p>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

function getResourceMeta(type: string, id: number) {
  switch (type) {
    case "REGULATION":
      return {
        icon: FileText,
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        label: "Regulation",
        href: `/hub/regulations/${id}`,
      };
    case "ESRS_DATAPOINT":
      return {
        icon: Database,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        label: "ESRS Datapoint",
        href: `/hub/regulations/1`, // CSRD detail page (datapoints are shown there)
      };
    case "GS1_STANDARD":
      return {
        icon: Package,
        color: "bg-green-500/10 text-green-600 dark:text-green-400",
        label: "GS1 Standard",
        href: `/hub/standards-mapping`,
      };
    default:
      return {
        icon: FileText,
        color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
        label: "Resource",
        href: "#",
      };
  }
}
