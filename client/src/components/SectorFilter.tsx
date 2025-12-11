
import React, { useEffect } from "react";
import type { SectorDefinition } from "../../../shared/sector-definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Shirt,
  Cpu,
  HeartPulse,
  Sparkles,
  Home,
  Hammer,
  Car,
  Truck,
  Pill,
  Gamepad2,
  ShoppingBag
} from "lucide-react";

export interface SectorFilterProps {
  sectors: SectorDefinition[];
  selectedSectors: string[];
  itemCounts?: Record<string, number>;
  onChange: (selected: string[]) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Shirt,
  Cpu,
  HeartPulse,
  Sparkles,
  Home,
  Hammer,
  Car,
  Truck,
  Pill,
  Gamepad2,
  ShoppingBag
};

function updateUrlParams(selected: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (selected.length > 0) {
    url.searchParams.set("sectors", selected.join(","));
  } else {
    url.searchParams.delete("sectors");
  }
  window.history.replaceState({}, "", url.toString());
}

export function SectorFilter(props: SectorFilterProps): React.JSX.Element {
  const { sectors, selectedSectors, itemCounts, onChange } = props;

  useEffect(() => {
    updateUrlParams(selectedSectors);
  }, [selectedSectors]);

  const handleToggleSector = (id: string): void => {
    const isSelected = selectedSectors.indexOf(id) !== -1;
    if (isSelected) {
      onChange(selectedSectors.filter(sectorId => sectorId !== id));
    } else {
      onChange(selectedSectors.concat(id));
    }
  };

  const handleSelectAll = (): void => {
    const allIds = sectors.map(sector => sector.id);
    onChange(allIds);
  };

  const handleClearAll = (): void => {
    onChange([]);
  };

  const totalSelected = selectedSectors.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sectors</span>
          <Badge variant="secondary" className="text-xs">
            {totalSelected} selected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
          >
            Clear all
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {sectors.map(sector => {
          const Icon =
            iconMap[sector.icon] || ShoppingBag;
          const selected =
            selectedSectors.indexOf(sector.id) !== -1;
          const count =
            itemCounts && itemCounts[sector.id]
              ? itemCounts[sector.id]
              : 0;
          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => handleToggleSector(sector.id)}
              className={
                "flex items-center justify-between rounded-lg border p-3 text-left transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary " +
                (selected ? "border-primary bg-primary/5" : "")
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {sector.name}
                    </span>
                    <Checkbox
                      checked={selected}
                      aria-label={sector.name}
                      className="h-3 w-3"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sector.description}
                  </p>
                </div>
              </div>
              <div className="ml-2 flex flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className="text-xs"
                  aria-label={
                    count + " items in " + sector.name
                  }
                >
                  {count}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

