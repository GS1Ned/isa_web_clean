/**
 * News Detail Page
 * Displays full news article with AI-powered recommendations
 */

import React from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendedResources } from "@/components/RecommendedResources";
import { EventContext } from "@/components/EventContext";
import { ArrowLeft, Calendar, ExternalLink, TrendingUp, ChevronRight, Sparkles, AlertTriangle, Shield, FileText, Scale, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";

// Type guard helpers for JSON fields
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isSourceArray(value: unknown): value is Array<{ type?: string; url?: string; name?: string }> {
  return Array.isArray(value);
}

function hasGS1ImpactContent(newsItem: {
  gs1ImpactAnalysis?: unknown;
  suggestedActions?: unknown;
  gs1ImpactTags?: unknown;
  sectorTags?: unknown;
}): boolean {
  return Boolean(
    (typeof newsItem.gs1ImpactAnalysis === 'string' && newsItem.gs1ImpactAnalysis) ||
    (isStringArray(newsItem.suggestedActions) && newsItem.suggestedActions.length > 0) ||
    (isStringArray(newsItem.gs1ImpactTags) && newsItem.gs1ImpactTags.length > 0) ||
    (isStringArray(newsItem.sectorTags) && newsItem.sectorTags.length > 0)
  );
}

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const newsId = params?.id ? parseInt(params.id) : 0;

  const { data: newsItems } = trpc.hub.getRecentNews.useQuery({ limit: 100 });
  const { data: recommendations, isLoading: recsLoading } =
    trpc.hub.getNewsRecommendations.useQuery(
      { newsId },
      { enabled: newsId > 0 }
    );

  // Get event context for this article (Phase 2: Check 5)
  const { data: eventForArticle } = trpc.hub.getEventForArticle.useQuery(
    { articleId: newsId },
    { enabled: newsId > 0 }
  );

  const newsItem = newsItems?.find(item => item.id === newsId);

  if (!newsItem) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">News Article Not Found</h1>
          <Link href="/news">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const impactColors = {
    HIGH: "bg-red-500/10 text-red-600 border-red-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    LOW: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  // Pre-compute type-safe values
  const regulationTags = isStringArray(newsItem.regulationTags) ? newsItem.regulationTags : [];
  const gs1ImpactTags = isStringArray(newsItem.gs1ImpactTags) ? newsItem.gs1ImpactTags : [];
  const sectorTags = isStringArray(newsItem.sectorTags) ? newsItem.sectorTags : [];
  const suggestedActions = isStringArray(newsItem.suggestedActions) ? newsItem.suggestedActions : [];
  const sources = isSourceArray(newsItem.sources) ? newsItem.sources : [];
  const gs1ImpactAnalysis = typeof newsItem.gs1ImpactAnalysis === 'string' ? newsItem.gs1ImpactAnalysis : null;
  const showGS1Impact = hasGS1ImpactContent(newsItem);
  
  // New regulatory intelligence fields
  const regulatoryState = typeof newsItem.regulatoryState === 'string' ? newsItem.regulatoryState : null;
  const confidenceLevel = typeof newsItem.confidenceLevel === 'string' ? newsItem.confidenceLevel : null;
  const isNegativeSignal = Boolean(newsItem.isNegativeSignal);
  const negativeSignalKeywords = isStringArray(newsItem.negativeSignalKeywords) ? newsItem.negativeSignalKeywords : [];
  
  // Check if this is a non-final regulation (needs stability warning)
  const isNonFinalRegulation = regulatoryState && ['PROPOSAL', 'POLITICAL_AGREEMENT', 'DELEGATED_ACT_DRAFT'].includes(regulatoryState);
  
  // Regulatory State configuration
  const regulatoryStateConfig: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
    PROPOSAL: { label: "Proposal", color: "text-gray-600 bg-gray-100 dark:bg-gray-800", icon: FileText, description: "This is a legislative proposal that has not yet been adopted" },
    POLITICAL_AGREEMENT: { label: "Political Agreement", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30", icon: Scale, description: "Political agreement reached, but formal adoption pending" },
    ADOPTED: { label: "Adopted", color: "text-green-600 bg-green-100 dark:bg-green-900/30", icon: Shield, description: "Formally adopted legislation" },
    DELEGATED_ACT_DRAFT: { label: "Delegated Act Draft", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", icon: FileText, description: "Draft delegated act - subject to change" },
    DELEGATED_ACT_ADOPTED: { label: "Delegated Act", color: "text-green-600 bg-green-100 dark:bg-green-900/30", icon: Shield, description: "Adopted delegated act" },
    GUIDANCE: { label: "Guidance", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: Info, description: "Official guidance or interpretation" },
    ENFORCEMENT_SIGNAL: { label: "Enforcement", color: "text-red-600 bg-red-100 dark:bg-red-900/30", icon: AlertCircle, description: "Enforcement action or signal" },
    POSTPONED_OR_SOFTENED: { label: "Postponed/Softened", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30", icon: AlertTriangle, description: "Requirements have been postponed or softened" },
  };

  // Confidence Level configuration
  const confidenceLevelConfig: Record<string, { label: string; color: string; description: string }> = {
    CONFIRMED_LAW: { label: "Confirmed Law", color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800", description: "This information is based on confirmed, adopted legislation" },
    DRAFT_PROPOSAL: { label: "Draft/Proposal", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800", description: "This information is based on draft or proposed legislation - subject to change" },
    GUIDANCE_INTERPRETATION: { label: "Guidance", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800", description: "This is official guidance or interpretation, not binding law" },
    MARKET_PRACTICE: { label: "Market Practice", color: "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700", description: "This reflects market practice or industry interpretation" },
  };

  const stateConfig = regulatoryState ? regulatoryStateConfig[regulatoryState] : null;
  const confConfig = confidenceLevel ? confidenceLevelConfig[confidenceLevel] : null;

  return (
    <div className="container py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/hub" className="hover:text-foreground transition-colors">
          ESG Hub
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/news" className="hover:text-foreground transition-colors">
          News
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate max-w-md">
          {newsItem.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {/* Negative Signal Warning - Most prominent */}
                  {isNegativeSignal && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Weakening Signal
                    </Badge>
                  )}
                  
                  {/* Regulatory State Badge */}
                  {stateConfig && (
                    <Badge className={`gap-1 ${stateConfig.color}`}>
                      <stateConfig.icon className="h-3 w-3" />
                      {stateConfig.label}
                    </Badge>
                  )}
                  
                  {/* Confidence Level Badge */}
                  {confConfig && (
                    <Badge variant="outline" className={`border ${confConfig.color}`}>
                      {confConfig.label}
                    </Badge>
                  )}
                  
                  {newsItem.impactLevel ? (
                    <Badge
                      className={
                        impactColors[
                          newsItem.impactLevel as keyof typeof impactColors
                        ]
                      }
                    >
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {newsItem.impactLevel} Impact
                    </Badge>
                  ) : null}
                  {regulationTags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {showGS1Impact && (
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI-Enriched
                    </Badge>
                  )}
                </div>
                
                {/* Stability Warning for Non-Final Regulations */}
                {isNonFinalRegulation && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Draft/Proposal Status</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          {stateConfig?.description || 'This regulatory information is based on draft or proposed legislation and is subject to change. Final requirements may differ significantly.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Negative Signal Details */}
                {isNegativeSignal && negativeSignalKeywords.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm">Weakening Signal Detected</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          This article indicates potential delays, exemptions, or softening of regulatory requirements.
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {negativeSignalKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h1 className="text-3xl font-bold">{newsItem.title}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(newsItem.publishedDate || newsItem.createdAt),
                      "MMMM d, yyyy"
                    )}
                  </div>
                  {newsItem.sourceTitle ? (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>{newsItem.sourceTitle}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {showGS1Impact ? (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI-Powered GS1 Impact Intelligence
                  </h3>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Analysis generated by ISA's AI to help you understand how this news affects GS1 standards and your operations.
                  </p>

                  {(gs1ImpactTags.length > 0 || sectorTags.length > 0) ? (
                    <div className="flex flex-wrap gap-2">
                      {gs1ImpactTags.map(tag => (
                        <Badge
                          key={tag}
                          className="bg-purple-500/10 text-purple-700 border-purple-500/20"
                        >
                          {tag.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {sectorTags.map(tag => (
                        <Badge
                          key={tag}
                          className="bg-blue-500/10 text-blue-700 border-blue-500/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {gs1ImpactAnalysis ? (
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">
                        Impact Analysis
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-wrap">
                        {gs1ImpactAnalysis}
                      </p>
                    </div>
                  ) : null}

                  {suggestedActions.length > 0 ? (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3">
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {suggestedActions.map((action, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
                          >
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                              •
                            </span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {sources.length > 1 ? (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">Multiple Sources</h3>
                    <Badge variant="secondary" className="text-xs">
                      {sources.length} sources
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {sources.map((source, index) => {
                      const sourceTypeLabels: Record<string, string> = {
                        EU_OFFICIAL: "EU Official",
                        GS1_OFFICIAL: "GS1 Official",
                        DUTCH_NATIONAL: "Dutch National",
                        INDUSTRY: "Industry",
                        MEDIA: "Media",
                      };
                      const sourceTypeColors: Record<string, string> = {
                        EU_OFFICIAL:
                          "bg-blue-500/10 text-blue-600 border-blue-500/20",
                        GS1_OFFICIAL:
                          "bg-purple-500/10 text-purple-600 border-purple-500/20",
                        DUTCH_NATIONAL:
                          "bg-orange-500/10 text-orange-600 border-orange-500/20",
                        INDUSTRY:
                          "bg-green-500/10 text-green-600 border-green-500/20",
                        MEDIA:
                          "bg-gray-500/10 text-gray-600 border-gray-500/20",
                      };
                      const sourceType = source.type || 'MEDIA';
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-accent/30"
                        >
                          <Badge
                            className={
                              sourceTypeColors[sourceType] ||
                              sourceTypeColors.MEDIA
                            }
                          >
                            {sourceTypeLabels[sourceType] || sourceType}
                          </Badge>
                          <a
                            href={source.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm hover:underline text-primary"
                          >
                            {source.name || 'Source'}
                          </a>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : newsItem.sourceUrl ? (
                <div className="mt-6 pt-6 border-t">
                  <a
                    href={newsItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    Read full article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Event Context Section (Phase 2: Check 5 & 6) */}
          {eventForArticle && (
            <EventContext event={eventForArticle} />
          )}

          {recsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ) : recommendations && recommendations.length > 0 ? (
            <RecommendedResources
              recommendations={recommendations as any}
              maxDisplay={8}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
