/**
 * NewsCard Component
 * Displays a single news item with title, date, tags, summary, and impact indicator
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, AlertCircle, Info, TrendingUp, Sparkles, AlertTriangle, Shield, FileText, Scale } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface NewsCardProps {
  news: {
    id: number;
    title: string;
    summary: string;
    publishedDate: Date;
    regulationTags: string[];
    impactLevel: "LOW" | "MEDIUM" | "HIGH";
    sourceUrl: string;
    sourceTitle: string;
    sourceType: "EU_OFFICIAL" | "GS1_OFFICIAL" | "INDUSTRY" | "MEDIA";
    newsType:
      | "NEW_LAW"
      | "AMENDMENT"
      | "ENFORCEMENT"
      | "COURT_DECISION"
      | "GUIDANCE"
      | "PROPOSAL";
    sources?: Array<{ name: string; type: string; url: string }> | null;
    gs1ImpactAnalysis?: string | null;
    isAutomated?: boolean | number | null;
    regulatoryState?: string | null;
    confidenceLevel?: string | null;
    isNegativeSignal?: boolean | number | null;
    negativeSignalKeywords?: string[] | null;
  };
}

import { Link } from "wouter";

export function NewsCard({ news }: NewsCardProps) {
  const {
    id,
    title,
    summary,
    publishedDate,
    regulationTags,
    impactLevel,
    sourceUrl,
    sourceType,
    newsType,
    sources,
    gs1ImpactAnalysis,
    isAutomated,
    regulatoryState,
    confidenceLevel,
    isNegativeSignal,
  } = news;

  const isMultiSource = sources && sources.length > 1;
  const hasAIEnrichment = Boolean(isAutomated) || Boolean(gs1ImpactAnalysis);
  const impactConfig = {
    HIGH: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
      label: "High Impact",
    },
    MEDIUM: {
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      label: "Medium Impact",
    },
    LOW: {
      icon: Info,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      label: "Low Impact",
    },
  };

  const config = impactConfig[impactLevel];
  const ImpactIcon = config.icon;

  const newsTypeLabels: Record<typeof newsType, string> = {
    NEW_LAW: "New Law",
    AMENDMENT: "Amendment",
    ENFORCEMENT: "Enforcement",
    COURT_DECISION: "Court Decision",
    GUIDANCE: "Guidance",
    PROPOSAL: "Proposal",
  };

  const sourceTypeLabels: Record<typeof sourceType, string> = {
    EU_OFFICIAL: "EU Official",
    GS1_OFFICIAL: "GS1 Official",
    INDUSTRY: "Industry",
    MEDIA: "Media",
  };

  // Regulatory State configuration
  const regulatoryStateConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
    PROPOSAL: { label: "Proposal", color: "text-gray-600 bg-gray-100 dark:bg-gray-800", icon: FileText },
    POLITICAL_AGREEMENT: { label: "Political Agreement", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30", icon: Scale },
    ADOPTED: { label: "Adopted", color: "text-green-600 bg-green-100 dark:bg-green-900/30", icon: Shield },
    DELEGATED_ACT_DRAFT: { label: "Delegated Act Draft", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", icon: FileText },
    DELEGATED_ACT_ADOPTED: { label: "Delegated Act", color: "text-green-600 bg-green-100 dark:bg-green-900/30", icon: Shield },
    GUIDANCE: { label: "Guidance", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: Info },
    ENFORCEMENT_SIGNAL: { label: "Enforcement", color: "text-red-600 bg-red-100 dark:bg-red-900/30", icon: AlertCircle },
    POSTPONED_OR_SOFTENED: { label: "Postponed/Softened", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30", icon: AlertTriangle },
  };

  // Confidence Level configuration
  const confidenceLevelConfig: Record<string, { label: string; color: string }> = {
    CONFIRMED_LAW: { label: "Confirmed Law", color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" },
    DRAFT_PROPOSAL: { label: "Draft/Proposal", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" },
    GUIDANCE_INTERPRETATION: { label: "Guidance", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" },
    MARKET_PRACTICE: { label: "Market Practice", color: "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700" },
  };

  const stateConfig = regulatoryState ? regulatoryStateConfig[regulatoryState] : null;
  const confConfig = confidenceLevel ? confidenceLevelConfig[confidenceLevel] : null;
  const showNegativeSignal = Boolean(isNegativeSignal);

  return (
    <Link href={`/news/${id}`}>
      <Card
        className={`hover:shadow-lg transition-shadow border-l-4 ${config.borderColor} cursor-pointer`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                {title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {format(new Date(publishedDate), "d MMM yyyy")}
                </span>
                <span>•</span>
                {isMultiSource ? (
                  <span className="font-medium text-primary">
                    {sources.length} sources
                  </span>
                ) : (
                  <span>{sourceTypeLabels[sourceType]}</span>
                )}
                {hasAIEnrichment && (
                  <>
                    <span>•</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium cursor-help">
                            <Sparkles className="h-3 w-3" />
                            AI-Enriched
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-xs">This article includes AI-generated GS1 impact analysis and recommended actions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bgColor} shrink-0`}
            >
              <ImpactIcon className={`h-4 w-4 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {/* Negative Signal Warning */}
            {showNegativeSignal && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Weakening Signal
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">This article indicates potential delays, exemptions, or softening of regulatory requirements</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Regulatory State Badge */}
            {stateConfig && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`text-xs gap-1 ${stateConfig.color}`}>
                      <stateConfig.icon className="h-3 w-3" />
                      {stateConfig.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">Regulatory lifecycle state: {stateConfig.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Confidence Level Badge */}
            {confConfig && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`text-xs border ${confConfig.color}`}>
                      {confConfig.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">Confidence level: How certain is this regulatory information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Badge variant="secondary" className="text-xs">
              {newsTypeLabels[newsType]}
            </Badge>
            {Array.isArray(regulationTags) &&
              regulationTags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            {Array.isArray(regulationTags) && regulationTags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{regulationTags.length - 4} more
              </Badge>
            )}
          </div>

          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <span>Read full article</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>
    </Link>
  );
}
