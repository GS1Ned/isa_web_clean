
import React, { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type ImpactLevel = "critical" | "high" | "medium" | "low";

export interface GS1ImpactAction {
  id: string;
  label: string;
  description?: string;
  dueDate?: string;
  resourceUrl?: string;
}

export interface GS1ImpactResource {
  label: string;
  url: string;
}

export interface GS1StandardImpact {
  id: string;
  name?: string;
  impact: ImpactLevel;
  actions: GS1ImpactAction[];
  resources?: GS1ImpactResource[];
}

export interface GS1ImpactAnalysisProps {
  regulationId: string;
  standards: GS1StandardImpact[];
}

function impactSortOrder(level: ImpactLevel): number {
  if (level === "critical") {
    return 0;
  }
  if (level === "high") {
    return 1;
  }
  if (level === "medium") {
    return 2;
  }
  return 3;
}

function impactBadgeClass(level: ImpactLevel): string {
  if (level === "critical") {
    return "bg-red-600 text-white";
  }
  if (level === "high") {
    return "bg-orange-500 text-white";
  }
  if (level === "medium") {
    return "bg-yellow-400 text-black";
  }
  return "bg-green-500 text-white";
}

function getStorageKey(regulationId: string): string {
  return "isa_gs1_impact_" + regulationId;
}

export function GS1ImpactAnalysis(
  props: GS1ImpactAnalysisProps
): React.JSX.Element {
  const { regulationId } = props;

  const sortedStandards = useMemo(() => {
    const copy = props.standards.slice();
    copy.sort((a, b) => {
      const orderA = impactSortOrder(a.impact);
      const orderB = impactSortOrder(b.impact);
      if (orderA < orderB) {
        return -1;
      }
      if (orderA > orderB) {
        return 1;
      }
      return 0;
    });
    return copy;
  }, [props.standards]);

  const allActionIds = useMemo(() => {
    const ids: string[] = [];
    sortedStandards.forEach(standard => {
      standard.actions.forEach(action => {
        ids.push(standard.id + ":" + action.id);
      });
    });
    return ids;
  }, [sortedStandards]);

  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const key = getStorageKey(regulationId);
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompletedIds(parsed);
        }
      } catch {
        setCompletedIds([]);
      }
    }
  }, [regulationId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const key = getStorageKey(regulationId);
    window.localStorage.setItem(key, JSON.stringify(completedIds));
  }, [completedIds, regulationId]);

  const toggleAction = (standardId: string, actionId: string): void => {
    const key = standardId + ":" + actionId;
    setCompletedIds(previous => {
      if (previous.indexOf(key) !== -1) {
        return previous.filter(id => id !== key);
      }
      return previous.concat(key);
    });
  };

  const progressByStandard: Record<string, number> = useMemo(() => {
    const result: Record<string, number> = {};
    sortedStandards.forEach(standard => {
      if (standard.actions.length === 0) {
        result[standard.id] = 0;
        return;
      }
      let completed = 0;
      standard.actions.forEach(action => {
        const key = standard.id + ":" + action.id;
        if (completedIds.indexOf(key) !== -1) {
          completed += 1;
        }
      });
      result[standard.id] =
        (completed / standard.actions.length) * 100;
    });
    return result;
  }, [sortedStandards, completedIds]);

  const totalProgress = useMemo(() => {
    if (allActionIds.length === 0) {
      return 0;
    }
    let completed = 0;
    allActionIds.forEach(id => {
      if (completedIds.indexOf(id) !== -1) {
        completed += 1;
      }
    });
    return Math.round((completed / allActionIds.length) * 100);
  }, [allActionIds, completedIds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>GS1 impact analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle>Actionable GS1 impacts</AlertTitle>
          <AlertDescription>
            Review affected GS1 standards for this regulation and keep track of
            implementation progress locally in your browser.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Overall completion
            </span>
            <span className="text-sm font-medium">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        <Accordion type="multiple" className="w-full">
          {sortedStandards.map(standard => {
            const progress = progressByStandard[standard.id] || 0;
            const impactLabel =
              standard.impact.charAt(0).toUpperCase() +
              standard.impact.slice(1);
            return (
              <AccordionItem key={standard.id} value={standard.id}>
                <AccordionTrigger className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {standard.name || standard.id}
                    </span>
                    <Badge
                      className={
                        "text-xs font-medium " +
                        impactBadgeClass(standard.impact)
                      }
                    >
                      {impactLabel}
                    </Badge>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
                    <span className="text-xs text-muted-foreground">
                      {standard.actions.length} actions
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                      <Progress value={progress} className="h-1.5 w-24" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {standard.actions.map(action => {
                        const compositeId =
                          standard.id + ":" + action.id;
                        const checked =
                          completedIds.indexOf(compositeId) !== -1;
                        return (
                          <div
                            key={compositeId}
                            className="flex items-start gap-3 rounded-md border p-3"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() =>
                                toggleAction(standard.id, action.id)
                              }
                              aria-label={action.label}
                            />
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">
                                  {action.label}
                                </span>
                                {action.dueDate && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    Due {action.dueDate}
                                  </Badge>
                                )}
                              </div>
                              {action.description && (
                                <p className="text-xs text-muted-foreground">
                                  {action.description}
                                </p>
                              )}
                              {action.resourceUrl && (
                                <a
                                  href={action.resourceUrl}
                                  className="text-xs text-primary underline"
                                >
                                  View related GS1 resource
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {standard.resources && standard.resources.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">
                          Additional resources
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-xs text-primary">
                          {standard.resources.map(resource => (
                            <li key={standard.id + ":" + resource.url}>
                              <a
                                href={resource.url}
                                className="underline"
                              >
                                {resource.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

