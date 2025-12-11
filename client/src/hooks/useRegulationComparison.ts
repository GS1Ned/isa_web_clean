
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

export type RegulationComparisonAttribute =
  | "scope"
  | "deadlines"
  | "dataPoints"
  | "gs1Standards"
  | "complexity";

export interface RegulationComparisonRequest {
  regulationIds: string[];
  attributes: RegulationComparisonAttribute[];
}

export interface RegulationComparisonItem {
  id: string;
  name: string;
  scope: string;
  deadlines: string;
  dataPoints: string;
  gs1Standards: string[];
  complexity: "low" | "medium" | "high";
  url?: string;
}

export interface UseRegulationComparisonResult {
  data: RegulationComparisonItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useRegulationComparison(
  regulationIds: string[],
  attributes: RegulationComparisonAttribute[]
): UseRegulationComparisonResult {
  const queryEnabled = regulationIds.length > 0;

  const { data, isLoading, error } = trpc.regulations.compare.useQuery(
    {
      regulationIds,
      attributes
    },
    {
      enabled: queryEnabled
    }
  );

  const typedData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data as RegulationComparisonItem[];
  }, [data]);

  return {
    data: typedData,
    isLoading,
    error: error ?? null
  };
}

