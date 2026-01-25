import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Sparkles } from "lucide-react";
import {
  GS1_IMPACT_TAG_LABELS,
  SECTOR_TAG_LABELS,
  type GS1ImpactTag,
  type SectorTag,
} from "@shared/news-tags";

export interface NewsRecommendationCardProps {
  /**
   * Recommendation title shown in the card header.
   */
  title?: string;

  /**
   * Short summary of the recommendation.
   */
  summary?: string;

  /**
   * Reasoning or explanation from the AI model.
   */
  rationale?: string;

  /**
   * Optional GS1 impact tags associated with the recommendation.
   */
  gs1ImpactTags?: GS1ImpactTag[];

  /**
   * Optional sector tags associated with the recommendation.
   */
  sectorTags?: SectorTag[];

  /**
   * Whether the recommendation is loading.
   */
  isLoading?: boolean;

  /**
   * Whether the card should display an empty state.
   */
  isEmpty?: boolean;

  /**
   * Callback when the user wants to review the recommendation.
   */
  onViewDetails?: () => void;

  /**
   * Optional className for the container.
   */
  className?: string;
}

export function NewsRecommendationCard({
  title,
  summary,
  rationale,
  gs1ImpactTags = [],
  sectorTags = [],
  isLoading = false,
  isEmpty,
  onViewDetails,
  className,
}: NewsRecommendationCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-28" />
        </CardFooter>
      </Card>
    );
  }

  const shouldShowEmptyState =
    isEmpty ?? (!title && !summary && !rationale);

  if (shouldShowEmptyState) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>AI recommendations</EmptyTitle>
              <EmptyDescription>
                No recommendations available yet. Check back after the next AI
                refresh.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Badge variant="outline">Pending insights</Badge>
              {/* TODO: connect to recommendation service and populate card content. */}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title ?? "AI Recommendation"}</CardTitle>
        <CardDescription>
          {summary ?? "TODO: provide AI-generated summary of the recommendation."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{rationale ?? "TODO: include rationale for why this matters."}</p>
        </div>

        {(gs1ImpactTags.length > 0 || sectorTags.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {gs1ImpactTags.map(tag => (
              <Badge key={tag} variant="secondary">
                {GS1_IMPACT_TAG_LABELS[tag] ?? tag}
              </Badge>
            ))}
            {sectorTags.map(tag => (
              <Badge key={tag} variant="outline">
                {SECTOR_TAG_LABELS[tag] ?? tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          TODO: show model confidence and freshness.
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={onViewDetails}
          disabled={!onViewDetails}
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}
