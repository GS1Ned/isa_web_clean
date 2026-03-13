import React, { useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lightbulb,
  Loader2,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { AuthorityBadge, AuthorityScore } from "@/components/AuthorityBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  formatAskIsaConfidencePercent,
  formatAskIsaSourceCount,
} from "@shared/ask-isa-confidence";

const EXPERT_PROMPTS = [
  "Map ESRS E1-6 to relevant GS1 attributes and explain which parts are still only proxy coverage.",
  "What changed recently for CSRD and which GS1 implications should a retail company prioritize first?",
  "Where are the biggest coverage gaps between EUDR due diligence requirements and current GS1-supported data?",
];

type ExpertResult = {
  answer: string;
  abstained?: boolean;
  uncertainty?: string | null;
  queryIntent?: string;
  retrievalProfile?: {
    strategy?: string;
    guidance?: string;
  };
  confidence?: {
    level: "high" | "medium" | "low";
    score: number;
    sourceCount?: number;
  };
  authority?: {
    score: number;
    level: "official" | "verified" | "guidance" | "industry" | "community";
    breakdown?: Record<string, number>;
  };
  explainers?: {
    whatIsIt?: string | null;
    whenToUse?: string | null;
    howToValidate?: string | null;
    whatChanged?: string | null;
    relatedStandards?: string[];
  };
  gapAnalysis?: {
    regulation: string;
    coveragePercentage: number;
    gapCount: number;
    recommendations: string[];
  } | null;
  mappingContext?: {
    hasSignals: boolean;
    regulationMappings: Array<{
      regulationId: number;
      regulationName: string;
      esrsDatapointId: string;
      relevanceScore: number;
    }>;
    gs1Mappings: Array<{
      standardId: number;
      standardName: string;
      esrsStandard: string;
      coverageType: string;
    }>;
  };
  inlineRecommendations?: Array<{
    esrsStandard: string;
    mappings: Array<{
      shortName: string;
      gs1Relevance: string;
      effectiveConfidence: string;
      decayReason: string | null;
    }>;
  }>;
  facts?: Array<{
    id: number;
    subject: string;
    predicate: string;
    objectValue: string;
    evidenceKey: string;
  }>;
  sources?: Array<{
    id: number;
    title: string;
    sourceType: string;
    authorityLevel?: string | null;
    uiAuthorityLevel?:
      | "official"
      | "verified"
      | "guidance"
      | "industry"
      | "community";
    similarity: number;
    url?: string | null;
    evidenceKey?: string | null;
    citationLabel?: string | null;
    needsVerification?: boolean;
  }>;
};

function formatIntentLabel(intent?: string) {
  if (!intent) return "Expert reasoning";
  return intent
    .toLowerCase()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AskISAExpertMode() {
  const [question, setQuestion] = useState(EXPERT_PROMPTS[0]);

  const askEnhancedMutation = trpc.askISAV2.askEnhanced.useMutation();
  const result = askEnhancedMutation.data as ExpertResult | undefined;

  const sourceCountLabel = useMemo(
    () => formatAskIsaSourceCount(result?.confidence?.sourceCount),
    [result?.confidence?.sourceCount]
  );

  const handleAsk = () => {
    if (question.trim().length < 3) return;
    askEnhancedMutation.mutate({
      question: question.trim(),
      includeGapAnalysis: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <CardTitle>Expert Ask ISA</CardTitle>
          </div>
          <CardDescription>
            Uses intent-aware retrieval, structured mapping context, canonical
            facts, and gap-analysis enrichment to answer more like an expert
            assistant than a thin search wrapper.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={question}
            onChange={event => setQuestion(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleAsk();
              }
            }}
            className="min-h-28"
            placeholder="Ask a standards, mapping, change, or coverage question..."
          />

          <div className="flex flex-wrap gap-2">
            {EXPERT_PROMPTS.map(prompt => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuestion(prompt)}
                className="h-auto whitespace-normal text-left"
              >
                {prompt}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleAsk}
            disabled={
              askEnhancedMutation.isPending || question.trim().length < 3
            }
            className="gap-2"
          >
            {askEnhancedMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Run Expert Analysis
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white/95 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {formatIntentLabel(result.queryIntent)}
                  </Badge>
                  {result.retrievalProfile?.strategy ? (
                    <Badge variant="outline">
                      {result.retrievalProfile.strategy}
                    </Badge>
                  ) : null}
                  {result.abstained ? (
                    <Badge variant="destructive">Abstained</Badge>
                  ) : (
                    <Badge className="bg-emerald-600 text-white">
                      Answered
                    </Badge>
                  )}
                </div>
                {result.confidence ? (
                  <div className="text-sm text-muted-foreground">
                    Confidence {result.confidence.level.toUpperCase()} (
                    {formatAskIsaConfidencePercent(
                      result.confidence.score,
                      result.confidence.sourceCount
                    )}
                    {sourceCountLabel ? `, ${sourceCountLabel}` : ""})
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                {result.abstained ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Expert abstention</AlertTitle>
                    <AlertDescription>{result.answer}</AlertDescription>
                  </Alert>
                ) : null}

                {result.uncertainty ? (
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Grounding posture</AlertTitle>
                    <AlertDescription>{result.uncertainty}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="prose prose-slate max-w-none text-sm leading-7">
                  <Streamdown>{result.answer}</Streamdown>
                </div>
              </CardContent>
            </Card>

            {result.inlineRecommendations?.length ? (
              <Card className="border-slate-200 bg-white/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Inline GS1 Recommendations
                  </CardTitle>
                  <CardDescription>
                    Mapping suggestions extracted from the answer and aligned to
                    cited ESRS standards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.inlineRecommendations.map(recommendation => (
                    <div
                      key={recommendation.esrsStandard}
                      className="space-y-2"
                    >
                      <Badge variant="outline">
                        {recommendation.esrsStandard}
                      </Badge>
                      <div className="space-y-2">
                        {recommendation.mappings.map(mapping => (
                          <div
                            key={`${recommendation.esrsStandard}-${mapping.shortName}`}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="font-medium text-slate-900">
                              {mapping.shortName}
                            </div>
                            <div className="text-sm text-slate-600">
                              {mapping.gs1Relevance}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">
                                {mapping.effectiveConfidence}
                              </Badge>
                              {mapping.decayReason ? (
                                <Badge variant="outline">
                                  {mapping.decayReason}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-2">
              {result.explainers ? (
                <Card className="border-slate-200 bg-white/95 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Expert Explainers
                    </CardTitle>
                    <CardDescription>
                      Short guidance generated from canonical facts and
                      structured evidence.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {result.explainers.whatIsIt ? (
                      <div>
                        <div className="font-medium text-slate-900">
                          What it is
                        </div>
                        <div className="text-slate-600">
                          {result.explainers.whatIsIt}
                        </div>
                      </div>
                    ) : null}
                    {result.explainers.whenToUse ? (
                      <div>
                        <div className="font-medium text-slate-900">
                          When to use it
                        </div>
                        <div className="text-slate-600">
                          {result.explainers.whenToUse}
                        </div>
                      </div>
                    ) : null}
                    {result.explainers.whatChanged ? (
                      <div>
                        <div className="font-medium text-slate-900">
                          What changed
                        </div>
                        <div className="text-slate-600">
                          {result.explainers.whatChanged}
                        </div>
                      </div>
                    ) : null}
                    {result.explainers.howToValidate ? (
                      <div>
                        <div className="font-medium text-slate-900">
                          How to validate
                        </div>
                        <div className="text-slate-600">
                          {result.explainers.howToValidate}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              {result.gapAnalysis ? (
                <Card className="border-slate-200 bg-white/95 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Gap Snapshot</CardTitle>
                    <CardDescription>
                      Auto-linked when the question implies a coverage or
                      missing-data analysis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="font-medium text-slate-900">
                      {result.gapAnalysis.regulation}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {result.gapAnalysis.coveragePercentage}% coverage
                      </Badge>
                      <Badge variant="outline">
                        {result.gapAnalysis.gapCount} tracked gaps
                      </Badge>
                    </div>
                    {result.gapAnalysis.recommendations.length ? (
                      <div className="space-y-2">
                        {result.gapAnalysis.recommendations.map(
                          recommendation => (
                            <div
                              key={recommendation}
                              className="flex items-start gap-2 text-slate-600"
                            >
                              <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                              <span>{recommendation}</span>
                            </div>
                          )
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            {result.authority ? (
              <AuthorityScore
                score={result.authority.score}
                level={result.authority.level}
                breakdown={result.authority.breakdown}
              />
            ) : null}

            {result.mappingContext?.hasSignals ? (
              <Card className="border-slate-200 bg-white/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Network className="h-4 w-4 text-sky-600" />
                    Structured Context
                  </CardTitle>
                  <CardDescription>
                    Linked regulation, ESRS, and GS1 signals used to deepen the
                    answer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {result.mappingContext.regulationMappings.length ? (
                    <div className="space-y-2">
                      <div className="font-medium text-slate-900">
                        Regulation mappings
                      </div>
                      {result.mappingContext.regulationMappings.map(mapping => (
                        <div
                          key={`${mapping.regulationId}-${mapping.esrsDatapointId}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="font-medium text-slate-900">
                            {mapping.regulationName}
                          </div>
                          <div className="text-slate-600">
                            {mapping.esrsDatapointId}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Relevance{" "}
                            {Number(mapping.relevanceScore).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {result.mappingContext.gs1Mappings.length ? (
                    <div className="space-y-2">
                      <div className="font-medium text-slate-900">
                        GS1 coverage signals
                      </div>
                      {result.mappingContext.gs1Mappings.map(mapping => (
                        <div
                          key={`${mapping.standardId}-${mapping.esrsStandard}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="font-medium text-slate-900">
                            {mapping.standardName}
                          </div>
                          <div className="text-slate-600">
                            {mapping.esrsStandard}
                          </div>
                          <Badge variant="outline" className="mt-2">
                            {mapping.coverageType}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {result.facts?.length ? (
              <Card className="border-slate-200 bg-white/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Canonical Facts</CardTitle>
                  <CardDescription>
                    Evidence-linked factual primitives retrieved for this
                    question.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {result.facts.slice(0, 5).map(fact => (
                    <div
                      key={fact.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="font-medium text-slate-900">
                        {fact.subject} {fact.predicate} {fact.objectValue}
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-500">
                        {fact.evidenceKey}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {result.sources?.length ? (
              <Card className="border-slate-200 bg-white/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Evidence Sources</CardTitle>
                  <CardDescription>
                    The retrieved evidence that powered this answer and its
                    trust posture.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div
                      key={`${source.id}-${source.title}`}
                      className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">
                            [{index + 1}] {source.title}
                          </div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            {source.sourceType}
                          </div>
                        </div>
                        {source.uiAuthorityLevel ? (
                          <AuthorityBadge level={source.uiAuthorityLevel} />
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">
                          {source.similarity}% similarity
                        </Badge>
                        {source.evidenceKey ? (
                          <Badge variant="secondary">Evidence ready</Badge>
                        ) : null}
                        {source.needsVerification ? (
                          <Badge variant="destructive">
                            Needs verification
                          </Badge>
                        ) : null}
                      </div>

                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900"
                        >
                          Open source
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}

                      {index < result.sources!.length - 1 ? (
                        <Separator />
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AskISAExpertMode;
