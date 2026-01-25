/**
 * ESG Priority Recommendations View
 * 
 * Read-only UI for viewing top-scored GS1 leverage points.
 * 
 * GOVERNANCE:
 * - No narrative claims
 * - Score-backed recommendations only
 * - GS1 is never legally required
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp } from "lucide-react";

export default function EsgPriorities() {
  const { data: priorities, isLoading } = trpc.esgArtefacts.getPriorityRecommendations.useQuery({
    limit: 15,
  });

  const { data: version } = trpc.esgArtefacts.getArtefactVersion.useQuery();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GS1 Priority Recommendations</h1>
        <p className="text-muted-foreground">
          Top leverage points where GS1 standards may support EU ESG compliance activities.
        </p>
      </div>

      {/* Governance disclaimer */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>GS1 is never legally required.</strong> These recommendations are based on 
          scoring factors and are for guidance only. Prioritisation does not imply legal necessity.
        </AlertDescription>
      </Alert>

      {/* Artefact version badge */}
      {version && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{version.id}</Badge>
          <span>Status: {version.status}</span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">Loading recommendations...</div>
      )}

      {priorities && (
        <div className="space-y-4">
          {priorities.recommendations.map((item: any, index: number) => (
            <Card key={item.dataId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    {item.dataId}
                  </CardTitle>
                  <Badge variant={item.mappingStrength === "strong" ? "default" : "secondary"}>
                    {item.mappingStrength}
                  </Badge>
                </div>
                <CardDescription>{item.gs1Capability}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Score bar */}
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <Progress value={item.totalScore * 10} className="flex-1" />
                    <span className="text-sm font-medium">{item.totalScore}/10</span>
                  </div>

                  {/* GS1 Standards */}
                  <div className="flex flex-wrap gap-1">
                    {item.gs1Standards?.map((std: string) => (
                      <Badge key={std} variant="outline" className="text-xs">
                        {std}
                      </Badge>
                    ))}
                  </div>

                  {/* Justification */}
                  <p className="text-sm text-muted-foreground">{item.justification}</p>

                  {/* Exclusions warning */}
                  {item.exclusions && (
                    <div className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 p-2 rounded">
                      <strong>Limitation:</strong> {item.exclusions}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Disclaimer */}
          <div className="text-sm text-muted-foreground text-center pt-4">
            {priorities.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
