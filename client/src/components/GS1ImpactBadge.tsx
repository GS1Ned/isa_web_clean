import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type GS1ImpactLevel = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface GS1ImpactBadgeProps {
  /**
   * The GS1 impact level to display.
   */
  impactLevel?: GS1ImpactLevel;

  /**
   * Whether the badge is loading.
   */
  isLoading?: boolean;

  /**
   * Optional className for custom styling.
   */
  className?: string;
}

const IMPACT_STYLES: Record<GS1ImpactLevel, string> = {
  HIGH: "bg-red-500/10 text-red-600 border-red-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  LOW: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  NONE: "bg-muted text-muted-foreground border-border",
};

const IMPACT_LABELS: Record<GS1ImpactLevel, string> = {
  HIGH: "High GS1 Impact",
  MEDIUM: "Medium GS1 Impact",
  LOW: "Low GS1 Impact",
  NONE: "No GS1 Impact",
};

export function GS1ImpactBadge({
  impactLevel,
  isLoading = false,
  className,
}: GS1ImpactBadgeProps) {
  if (isLoading) {
    return <Skeleton className={cn("h-6 w-28", className)} />;
  }

  const resolvedLevel: GS1ImpactLevel = impactLevel ?? "NONE";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1 text-xs", IMPACT_STYLES[resolvedLevel], className)}
    >
      {IMPACT_LABELS[resolvedLevel]}
      {/* TODO: replace with dynamic GS1 impact label mapping once levels are finalized. */}
    </Badge>
  );
}
