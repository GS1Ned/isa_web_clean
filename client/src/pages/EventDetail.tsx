/**
 * Event Detail Page
 * Displays full regulatory event with linked articles and delta analysis
 * Phase 2: Check 5 (Event-Based Aggregation) and Check 6 (Delta Analysis)
 */

import React from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  ExternalLink, 
  ChevronRight, 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layers,
  Newspaper,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

// Event type configuration
const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; description: string }> = {
  PROPOSAL: { label: "Proposal", icon: FileText, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", description: "Initial legislative proposal" },
  POLITICAL_AGREEMENT: { label: "Political Agreement", icon: Scale, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", description: "Political agreement reached between institutions" },
  ADOPTION: { label: "Adoption", icon: Shield, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", description: "Formal adoption of legislation" },
  DELEGATED_ACT_DRAFT: { label: "Delegated Act Draft", icon: FileText, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", description: "Draft delegated act published" },
  DELEGATED_ACT_ADOPTION: { label: "Delegated Act Adoption", icon: Shield, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", description: "Delegated act formally adopted" },
  IMPLEMENTING_ACT: { label: "Implementing Act", icon: Shield, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", description: "Implementing act published" },
  GUIDANCE_PUBLICATION: { label: "Guidance", icon: Info, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", description: "Official guidance or FAQ published" },
  ENFORCEMENT_START: { label: "Enforcement Start", icon: AlertCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", description: "Enforcement begins" },
  DEADLINE_MILESTONE: { label: "Deadline", icon: Calendar, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", description: "Important compliance deadline" },
  POSTPONEMENT: { label: "Postponement", icon: AlertTriangle, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", description: "Requirements postponed or delayed" },
  AMENDMENT: { label: "Amendment", icon: FileText, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", description: "Legislation amended" },
};

// Lifecycle state configuration
const LIFECYCLE_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  PROPOSAL: { label: "Proposal", color: "text-gray-600 bg-gray-100 dark:bg-gray-800", description: "Legislative proposal stage" },
  POLITICAL_AGREEMENT: { label: "Political Agreement", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30", description: "Political agreement reached" },
  ADOPTED: { label: "Adopted", color: "text-green-600 bg-green-100 dark:bg-green-900/30", description: "Formally adopted" },
  DELEGATED_ACT_DRAFT: { label: "Delegated Act Draft", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", description: "Draft delegated act" },
  DELEGATED_ACT_ADOPTED: { label: "Delegated Act", color: "text-green-600 bg-green-100 dark:bg-green-900/30", description: "Adopted delegated act" },
  GUIDANCE: { label: "Guidance", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", description: "Official guidance" },
  ENFORCEMENT_SIGNAL: { label: "Enforcement", color: "text-red-600 bg-red-100 dark:bg-red-900/30", description: "Enforcement action" },
  POSTPONED_OR_SOFTENED: { label: "Postponed/Softened", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30", description: "Postponed or softened" },
};

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  COMPLETE: { label: "Complete", icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  INCOMPLETE: { label: "Incomplete", icon: XCircle, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  DRAFT: { label: "Draft", icon: FileText, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
};

// Confidence level configuration
const CONFIDENCE_CONFIG: Record<string, { label: string; color: string }> = {
  CONFIRMED_LAW: { label: "Confirmed Law", color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" },
  DRAFT_PROPOSAL: { label: "Draft/Proposal", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" },
  GUIDANCE_INTERPRETATION: { label: "Guidance", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" },
  MARKET_PRACTICE: { label: "Market Practice", color: "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700" },
};

// Decision Value Type configuration (Check 1)
const DECISION_VALUE_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  OBLIGATION_CHANGE: { label: "Obligation Change", color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", description: "Changes to mandatory requirements" },
  SCOPE_CHANGE: { label: "Scope Change", color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800", description: "Changes to who/what is covered" },
  TIMING_CHANGE: { label: "Timing Change", color: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800", description: "Changes to deadlines or timelines" },
  INTERPRETATION_CLARIFICATION: { label: "Interpretation", color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800", description: "Clarification of existing requirements" },
  DATA_REQUIREMENT: { label: "Data Requirement", color: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800", description: "Changes to data or reporting requirements" },
  ASSUMPTION_INVALIDATED: { label: "Assumption Invalidated", color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800", description: "Previous assumptions no longer valid" },
};

// Stability Risk configuration (Check 7)
const STABILITY_RISK_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  HIGH: { label: "High Risk", color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", icon: AlertTriangle, description: "Regulatory position may still change significantly" },
  MEDIUM: { label: "Medium Risk", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800", icon: AlertCircle, description: "Some interpretation uncertainty remains" },
  LOW: { label: "Low Risk", color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800", icon: CheckCircle2, description: "Regulatory position is stable and adopted" },
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;

  const { data: eventData, isLoading } = trpc.hub.getEventById.useQuery(
    { eventId },
    { enabled: eventId > 0 }
  );

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
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

  const event = eventData;
  const linkedArticles = eventData.linkedArticles || [];
  const eventTypeConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.PROPOSAL;
  const lifecycleConfig = LIFECYCLE_CONFIG[event.lifecycleState] || LIFECYCLE_CONFIG.PROPOSAL;
  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
  const confidenceConfig = event.confidenceLevel ? CONFIDENCE_CONFIG[event.confidenceLevel] : null;
  const decisionValueConfig = event.decisionValueType ? DECISION_VALUE_CONFIG[event.decisionValueType] : null;
  const stabilityRiskConfig = event.stabilityRisk ? STABILITY_RISK_CONFIG[event.stabilityRisk] : null;
  const StabilityRiskIcon = stabilityRiskConfig?.icon;
  const affectedRegs = isStringArray(event.affectedRegulations) ? event.affectedRegulations : [];
  const EventIcon = eventTypeConfig.icon;
  const StatusIcon = statusConfig.icon;

  // Check if delta analysis is complete
  const hasDelta = Boolean(
    event.previousAssumption && 
    event.newInformation && 
    event.whatChanged && 
    event.whatDidNotChange && 
    event.decisionImpact
  );

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
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
          {event.eventTitle}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Status and Type Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  <Badge className={eventTypeConfig.color}>
                    <EventIcon className="h-3 w-3 mr-1" />
                    {eventTypeConfig.label}
                  </Badge>
                  <Badge className={lifecycleConfig.color}>
                    {lifecycleConfig.label}
                  </Badge>
                  {confidenceConfig && (
                    <Badge variant="outline" className={`border ${confidenceConfig.color}`}>
                      {confidenceConfig.label}
                    </Badge>
                  )}
                  {decisionValueConfig && (
                    <Badge variant="outline" className={`border ${decisionValueConfig.color}`} title={decisionValueConfig.description}>
                      {decisionValueConfig.label}
                    </Badge>
                  )}
                  {stabilityRiskConfig && StabilityRiskIcon && (
                    <Badge variant="outline" className={`border ${stabilityRiskConfig.color}`} title={stabilityRiskConfig.description}>
                      <StabilityRiskIcon className="h-3 w-3 mr-1" />
                      {stabilityRiskConfig.label}
                    </Badge>
                  )}
                </div>

                {/* Event Title */}
                <h1 className="text-3xl font-bold">{event.eventTitle}</h1>

                {/* Event Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {event.eventQuarter}
                  </div>
                  {event.eventDateLatest && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>{format(new Date(event.eventDateLatest), "MMMM d, yyyy")}</span>
                    </div>
                  )}
                  {event.confidenceSource && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>Source: {event.confidenceSource}</span>
                    </div>
                  )}
                </div>

                {/* Event Summary */}
                {event.eventSummary && (
                  <div className="bg-accent/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{event.eventSummary}</p>
                  </div>
                )}

                {/* Affected Regulations */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Affected Regulations</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-semibold text-sm">
                      {event.primaryRegulation}
                    </Badge>
                    {affectedRegs.filter(r => r !== event.primaryRegulation).map(reg => (
                      <Badge key={reg} variant="outline">
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Completeness Score */}
                {event.completenessScore !== null && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Event Completeness</span>
                      <span className={`text-sm font-bold ${
                        event.completenessScore >= 80 ? 'text-green-600' : 
                        event.completenessScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {event.completenessScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          event.completenessScore >= 80 ? 'bg-green-500' : 
                          event.completenessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${event.completenessScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.completenessScore >= 80 
                        ? "This event has sufficient information for decision-making."
                        : "This event may need additional information for complete analysis."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delta Analysis Card (Check 6) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasDelta ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600" />
                )}
                Delta Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding what changed and why it matters for your decisions.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasDelta ? (
                <>
                  {/* Previous Assumption */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-l-4 border-gray-400">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Previous Assumption
                    </h4>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {event.previousAssumption}
                    </p>
                  </div>

                  {/* New Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
                      New Information
                    </h4>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {event.newInformation}
                    </p>
                  </div>

                  {/* What Changed */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-500">
                    <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-300 mb-2">
                      What Changed
                    </h4>
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      {event.whatChanged}
                    </p>
                  </div>

                  {/* What Did Not Change */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                    <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 mb-2">
                      What Did Not Change
                    </h4>
                    <p className="text-sm text-green-900 dark:text-green-100">
                      {event.whatDidNotChange}
                    </p>
                  </div>

                  {/* Decision Impact */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500 border">
                    <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Decision Impact
                    </h4>
                    <p className="text-sm text-purple-900 dark:text-purple-100">
                      {event.decisionImpact}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Delta Analysis Incomplete</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This event does not yet have complete delta analysis. 
                    Additional source articles may be needed to provide full context.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Articles Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Newspaper className="h-5 w-5" />
                Source Articles
                <Badge variant="secondary" className="ml-auto">
                  {linkedArticles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedArticles.length > 0 ? (
                <div className="space-y-3">
                  {linkedArticles.map((article: any) => (
                    <Link key={article.id} href={`/news/${article.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                        <h4 className="font-medium text-sm line-clamp-2 mb-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {article.publishedDate 
                            ? format(new Date(article.publishedDate), "d MMM yyyy")
                            : format(new Date(article.createdAt), "d MMM yyyy")
                          }
                          {article.sourceTitle && (
                            <>
                              <span>•</span>
                              <span>{article.sourceTitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No linked articles yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Type</span>
                <span className="font-medium">{eventTypeConfig.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lifecycle State</span>
                <span className="font-medium">{lifecycleConfig.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quarter</span>
                <span className="font-medium">{event.eventQuarter}</span>
              </div>
              {event.confidenceLevel && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{CONFIDENCE_CONFIG[event.confidenceLevel]?.label || event.confidenceLevel}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{statusConfig.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delta Validated</span>
                <span className="font-medium">{event.deltaValidationPassed ? 'Yes' : 'No'}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(event.createdAt), "d MMM yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{format(new Date(event.updatedAt), "d MMM yyyy HH:mm")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to News */}
          <Link href="/news">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News Hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
