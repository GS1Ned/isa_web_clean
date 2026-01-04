import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Filter } from "lucide-react";
import {
  SECTOR_TAG_LABELS,
  type SectorTag,
} from "@shared/news-tags";

export interface SectorFilterProps {
  /**
   * Selected sector values.
   */
  selectedSectors?: SectorTag[];

  /**
   * Optional list of sectors to display. Defaults to all known sectors.
   */
  sectors?: SectorTag[];

  /**
   * Callback when the selection changes.
   */
  onChange?: (nextSelection: SectorTag[]) => void;

  /**
   * Whether the filter is loading.
   */
  isLoading?: boolean;

  /**
   * Optional message when no sectors are available.
   */
  emptyStateMessage?: string;

  /**
   * Optional className for the container.
   */
  className?: string;
}

export function SectorFilter({
  selectedSectors = [],
  sectors,
  onChange,
  isLoading = false,
  emptyStateMessage = "No sectors available yet.",
  className,
}: SectorFilterProps) {
  const availableSectors =
    sectors ?? (Object.keys(SECTOR_TAG_LABELS) as SectorTag[]);

  const handleToggle = (sector: SectorTag, nextValue: boolean) => {
    if (!onChange) return;

    const nextSelection = nextValue
      ? Array.from(new Set([...selectedSectors, sector]))
      : selectedSectors.filter(item => item !== sector);

    onChange(nextSelection);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
    );
  }

  if (availableSectors.length === 0) {
    return (
      <Empty className={cn("border border-dashed", className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Filter className="h-5 w-5" />
          </EmptyMedia>
          <EmptyTitle>Sector filters</EmptyTitle>
          <EmptyDescription>{emptyStateMessage}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Badge variant="outline">Coming soon</Badge>
          {/* TODO: connect to sector taxonomy service. */}
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter by sector</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {availableSectors.map(sector => {
          const label = SECTOR_TAG_LABELS[sector] ?? sector;
          const checked = selectedSectors.includes(sector);

          return (
            <label
              key={sector}
              className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={value => handleToggle(sector, value === true)}
              />
              <span className="flex-1">{label}</span>
              {checked && <Badge variant="secondary">Selected</Badge>}
            </label>
          );
        })}
      </div>

      {/* TODO: convert to a multi-select dropdown once API integration is ready. */}
    </div>
  );
}
