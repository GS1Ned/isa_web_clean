
import React, { useMemo, useState } from "react";
import type { RegulationComparisonAttribute } from "@/hooks/useRegulationComparison";
import { useRegulationComparison } from "@/hooks/useRegulationComparison";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface RegulationComparisonMatrixProps {
  regulationIds: string[];
  attributes: RegulationComparisonAttribute[];
}

const ATTRIBUTE_LABELS: Record<RegulationComparisonAttribute, string> = {
  scope: "Scope",
  deadlines: "Deadlines",
  dataPoints: "Required datapoints",
  gs1Standards: "GS1 standards",
  complexity: "Complexity"
};

function complexityBadgeVariant(
  complexity: "low" | "medium" | "high"
): string {
  if (complexity === "low") {
    return "bg-green-100 text-green-800";
  }
  if (complexity === "medium") {
    return "bg-yellow-100 text-yellow-800";
  }
  return "bg-red-100 text-red-800";
}

function getDistinctValuesForAttribute(
  attribute: RegulationComparisonAttribute,
  values: string[]
): number {
  const set = new Set<string>();
  values.forEach(value => {
    set.add(value);
  });
  return set.size;
}

export function RegulationComparisonMatrix(
  props: RegulationComparisonMatrixProps
): React.JSX.Element {
  const { regulationIds, attributes } = props;
  const { data, isLoading, error } = useRegulationComparison(
    regulationIds,
    attributes
  );
  const [visibleAttributes, setVisibleAttributes] =
    useState<RegulationComparisonAttribute[]>(attributes);

  const handleToggleAttribute = (attr: RegulationComparisonAttribute): void => {
    setVisibleAttributes(previous => {
      if (previous.indexOf(attr) !== -1) {
        return previous.filter(item => item !== attr);
      }
      return previous.concat(attr);
    });
  };

  const comparisonStats = useMemo(() => {
    if (!data) {
      return {};
    }
    const stats: Partial<Record<RegulationComparisonAttribute, boolean>> = {};
    attributes.forEach(attr => {
      const texts: string[] = [];
      data.forEach(item => {
        if (attr === "gs1Standards") {
          texts.push(item.gs1Standards.join(", "));
        } else {
          texts.push(String((item as Record<string, unknown>)[attr] ?? ""));
        }
      });
      const distinct = getDistinctValuesForAttribute(attr, texts);
      stats[attr] = distinct > 1;
    });
    return stats;
  }, [data, attributes]);

  const hasData = !!data && data.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Regulation comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare scope, timelines, datapoints and GS1 impacts for selected
            regulations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {attributes.map(attribute => (
            <label
              key={attribute}
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <Checkbox
                checked={visibleAttributes.indexOf(attribute) !== -1}
                onCheckedChange={() => handleToggleAttribute(attribute)}
              />
              <span>{ATTRIBUTE_LABELS[attribute]}</span>
            </label>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => {
              window.print();
            }}
          >
            Export as PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {!isLoading && error && (
          <div className="text-sm text-red-600">
            Failed to load regulation comparison: {error.message}
          </div>
        )}
        {!isLoading && !error && !hasData && (
          <div className="text-sm text-muted-foreground">
            No regulations selected or no comparison data available.
          </div>
        )}
        {!isLoading && !error && hasData && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Attribute</TableHead>
                  {data?.map(item => (
                    <TableHead key={item.id}>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{item.name}</span>
                        {item.url && (
                          <a
                            href={item.url}
                            className="text-xs text-primary underline"
                          >
                            View detail
                          </a>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleAttributes.map(attribute => {
                  const hasDifferences = comparisonStats[attribute] === true;
                  return (
                    <TableRow key={attribute}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{ATTRIBUTE_LABELS[attribute]}</span>
                          {hasDifferences ? (
                            <Badge variant="outline" className="text-xs">
                              Differs
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs text-muted-foreground"
                            >
                              Same
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {data?.map(item => {
                        const key = item.id + "-" + attribute;
                        if (attribute === "gs1Standards") {
                          return (
                            <TableCell key={key}>
                              <div className="flex flex-wrap gap-1">
                                {item.gs1Standards.map(standard => (
                                  <Badge
                                    key={standard}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {standard}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          );
                        }
                        if (attribute === "complexity") {
                          const complexity =
                            item.complexity || "medium";
                          const classes =
                            "inline-flex rounded-full px-2 py-0.5 text-xs " +
                            complexityBadgeVariant(complexity);
                          return (
                            <TableCell key={key}>
                              <span className={classes}>
                                {complexity.toUpperCase()}
                              </span>
                            </TableCell>
                          );
                        }
                        const value = (item as Record<string, unknown>)[
                          attribute
                        ] as string;
                        return (
                          <TableCell key={key}>
                            <span className="text-sm">{value}</span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

