import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileSearch, Info, Scale, Sparkles } from "lucide-react";

type DecisionArtifactSummaryValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null
  | undefined;

export interface DecisionArtifactCardData {
  artifactVersion: string;
  artifactType: string;
  capability: string;
  generatedAt?: string;
  confidence: {
    level: string;
    score: number;
    basis: string;
    reviewRecommended?: boolean;
    uncertaintyClass?: string;
    escalationAction?: string;
  };
  evidence?: {
    codePaths?: string[];
    dataSources?: string[];
  };
  summary?: Record<string, DecisionArtifactSummaryValue>;
}

interface DecisionArtifactCardProps {
  artifact?: DecisionArtifactCardData | null;
  title?: string;
  description?: string;
}

function formatLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatSummaryValue(value: DecisionArtifactSummaryValue) {
  if (Array.isArray(value)) {
    return value.length === 0 ? "None" : value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value == null || value === "") {
    return "N/A";
  }

  return String(value);
}

function getConfidenceTone(level: string) {
  switch (level) {
    case "high":
      return "bg-green-100 text-green-800 border-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
}

function formatConfidenceMeta(value?: string) {
  if (!value) return null;

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function DecisionArtifactCard({
  artifact,
  title = "Decision Artifact",
  description = "Stable ESRS_MAPPING decision-core summary for downstream consumers.",
}: DecisionArtifactCardProps) {
  if (!artifact) {
    return null;
  }

  const summaryEntries = Object.entries(artifact.summary ?? {}).slice(0, 6);
  const evidence = artifact.evidence ?? {};
  const codePaths = evidence.codePaths ?? [];
  const dataSources = evidence.dataSources ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="outline" className={getConfidenceTone(artifact.confidence.level)}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {artifact.confidence.level} {Math.round(artifact.confidence.score * 100)}%
            </Badge>
            {artifact.confidence.uncertaintyClass ? (
              <Badge variant="outline">
                {formatConfidenceMeta(artifact.confidence.uncertaintyClass)}
              </Badge>
            ) : null}
            <Badge variant={artifact.confidence.reviewRecommended ? "secondary" : "outline"}>
              {artifact.confidence.reviewRecommended ? "Review recommended" : "Ready for routine use"}
            </Badge>
            <Badge variant="secondary">{artifact.artifactType}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Capability</div>
            <div className="mt-1 font-medium">{artifact.capability}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Artifact Version</div>
            <div className="mt-1 font-medium">{artifact.artifactVersion}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Generated</div>
            <div className="mt-1 font-medium">
              {artifact.generatedAt ? new Date(artifact.generatedAt).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900">
            <Sparkles className="h-4 w-4" />
            Confidence Basis
          </div>
          <p className="text-sm text-blue-900">{artifact.confidence.basis}</p>
          <p className="mt-2 text-xs font-medium text-blue-900">
            Review: {artifact.confidence.reviewRecommended ? "recommended before downstream sign-off" : "routine downstream use acceptable"}
          </p>
          {artifact.confidence.escalationAction ? (
            <p className="mt-1 text-xs text-blue-900">
              Escalation: {formatConfidenceMeta(artifact.confidence.escalationAction)}
            </p>
          ) : null}
        </div>

        {summaryEntries.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summaryEntries.map(([key, value]) => (
              <div key={key} className="rounded-lg border bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {formatLabel(key)}
                </div>
                <div className="mt-1 text-sm font-medium">{formatSummaryValue(value)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileSearch className="h-4 w-4 text-slate-600" />
              Evidence Code Paths
            </div>
            <div className="text-sm text-muted-foreground">
              {codePaths.length > 0 ? codePaths.join(", ") : "No code paths recorded."}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-slate-600" />
              Evidence Data Sources
            </div>
            <div className="text-sm text-muted-foreground">
              {dataSources.length > 0 ? dataSources.join(", ") : "No data sources recorded."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
