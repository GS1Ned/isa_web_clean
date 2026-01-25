/**
 * EventContext Component
 * Displays regulatory event information for articles that are part of an event
 * Phase 2: Check 5 (Event-Based Aggregation) and Check 6 (Delta Analysis)
 */

import React from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Layers
} from "lucide-react";
import { format } from "date-fns";

// Event type configuration
const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PROPOSAL: { label: "Proposal", icon: FileText, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  POLITICAL_AGREEMENT: { label: "Political Agreement", icon: Scale, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  ADOPTION: { label: "Adoption", icon: Shield, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  DELEGATED_ACT_DRAFT: { label: "Delegated Act Draft", icon: FileText, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  DELEGATED_ACT_ADOPTION: { label: "Delegated Act Adoption", icon: Shield, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  IMPLEMENTING_ACT: { label: "Implementing Act", icon: Shield, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  GUIDANCE_PUBLICATION: { label: "Guidance", icon: Info, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  ENFORCEMENT_START: { label: "Enforcement Start", icon: AlertCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  DEADLINE_MILESTONE: { label: "Deadline", icon: Calendar, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  POSTPONEMENT: { label: "Postponement", icon: AlertTriangle, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  AMENDMENT: { label: "Amendment", icon: FileText, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
};

// Lifecycle state configuration
const LIFECYCLE_CONFIG: Record<string, { label: string; color: string }> = {
  PROPOSAL: { label: "Proposal", color: "text-gray-600 bg-gray-100 dark:bg-gray-800" },
  POLITICAL_AGREEMENT: { label: "Political Agreement", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" },
  ADOPTED: { label: "Adopted", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  DELEGATED_ACT_DRAFT: { label: "Delegated Act Draft", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
  DELEGATED_ACT_ADOPTED: { label: "Delegated Act", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  GUIDANCE: { label: "Guidance", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  ENFORCEMENT_SIGNAL: { label: "Enforcement", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  POSTPONED_OR_SOFTENED: { label: "Postponed/Softened", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
};

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  COMPLETE: { label: "Complete", icon: CheckCircle2, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  INCOMPLETE: { label: "Incomplete", icon: XCircle, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  DRAFT: { label: "Draft", icon: FileText, color: "text-gray-600 bg-gray-100 dark:bg-gray-800" },
};

// Stability Risk configuration (Check 7)
const STABILITY_RISK_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  HIGH: { label: "High Risk", color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", icon: AlertTriangle, description: "Regulatory position may still change" },
  MEDIUM: { label: "Medium Risk", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800", icon: AlertCircle, description: "Some uncertainty remains" },
  LOW: { label: "Low Risk", color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800", icon: CheckCircle2, description: "Regulatory position is stable" },
};

interface RegulatoryEvent {
  id: number;
  dedupKey: string;
  eventType: string;
  primaryRegulation: string;
  affectedRegulations: unknown;
  lifecycleState: string;
  eventDateEarliest: string | null;
  eventDateLatest: string | null;
  eventQuarter: string;
  previousAssumption: string | null;
  newInformation: string | null;
  whatChanged: string | null;
  whatDidNotChange: string | null;
  decisionImpact: string | null;
  eventTitle: string;
  eventSummary: string | null;
  sourceArticleIds: unknown;
  confidenceLevel: string | null;
  confidenceSource: string | null;
  status: string;
  decisionValueType: string | null;
  stabilityRisk: string | null;
  completenessScore: number | null;
  deltaValidationPassed: number | null;
  missingDeltaFields: unknown;
  createdAt: string;
  updatedAt: string;
}

interface EventContextProps {
  event: RegulatoryEvent;
  compact?: boolean;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export function EventContext({ event, compact = false }: EventContextProps) {
  const eventTypeConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.PROPOSAL;
  const lifecycleConfig = LIFECYCLE_CONFIG[event.lifecycleState] || LIFECYCLE_CONFIG.PROPOSAL;
  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
  const stabilityRiskConfig = event.stabilityRisk ? STABILITY_RISK_CONFIG[event.stabilityRisk] : null;
  const affectedRegs = isStringArray(event.affectedRegulations) ? event.affectedRegulations : [];
  const EventIcon = eventTypeConfig.icon;
  const StatusIcon = statusConfig.icon;
  const StabilityRiskIcon = stabilityRiskConfig?.icon;

  // Check if delta analysis is complete
  const hasDelta = Boolean(
    event.previousAssumption && 
    event.newInformation && 
    event.whatChanged && 
    event.whatDidNotChange && 
    event.decisionImpact
  );

  if (compact) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${eventTypeConfig.color}`}>
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">Part of Regulatory Event</span>
                <Badge className={`text-xs ${statusConfig.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              <Link href={`/events/${event.id}`}>
                <h4 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
                  {event.eventTitle}
                </h4>
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {event.primaryRegulation}
                </Badge>
                <Badge className={`text-xs ${eventTypeConfig.color}`}>
                  <EventIcon className="h-3 w-3 mr-1" />
                  {eventTypeConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{event.eventQuarter}</span>
              </div>
            </div>
            <Link href={`/events/${event.id}`}>
              <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Regulatory Event Context
          </CardTitle>
          <Badge className={statusConfig.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Header */}
        <div>
          <Link href={`/events/${event.id}`}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
              {event.eventTitle}
            </h3>
          </Link>
          {event.eventSummary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
              {event.eventSummary}
            </p>
          )}
        </div>

        {/* Event Metadata */}
        <div className="flex flex-wrap gap-2">
          <Badge className={eventTypeConfig.color}>
            <EventIcon className="h-3 w-3 mr-1" />
            {eventTypeConfig.label}
          </Badge>
          <Badge className={lifecycleConfig.color}>
            {lifecycleConfig.label}
          </Badge>
          {stabilityRiskConfig && StabilityRiskIcon && (
            <Badge variant="outline" className={`border ${stabilityRiskConfig.color}`} title={stabilityRiskConfig.description}>
              <StabilityRiskIcon className="h-3 w-3 mr-1" />
              {stabilityRiskConfig.label}
            </Badge>
          )}
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            {event.eventQuarter}
          </Badge>
        </div>

        {/* Affected Regulations */}
        <div>
          <h4 className="text-sm font-medium mb-2">Affected Regulations</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="font-semibold">
              {event.primaryRegulation}
            </Badge>
            {affectedRegs.filter(r => r !== event.primaryRegulation).map(reg => (
              <Badge key={reg} variant="outline" className="text-xs">
                {reg}
              </Badge>
            ))}
          </div>
        </div>

        {/* Delta Analysis Section */}
        {hasDelta && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Delta Analysis
            </h4>
            
            <div className="grid gap-3 text-sm">
              {event.previousAssumption && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <span className="font-medium text-muted-foreground block mb-1">Previous Assumption</span>
                  <p className="text-foreground">{event.previousAssumption}</p>
                </div>
              )}
              
              {event.newInformation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <span className="font-medium text-blue-700 dark:text-blue-300 block mb-1">New Information</span>
                  <p className="text-blue-900 dark:text-blue-100">{event.newInformation}</p>
                </div>
              )}
              
              {event.whatChanged && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <span className="font-medium text-amber-700 dark:text-amber-300 block mb-1">What Changed</span>
                  <p className="text-amber-900 dark:text-amber-100">{event.whatChanged}</p>
                </div>
              )}
              
              {event.whatDidNotChange && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <span className="font-medium text-green-700 dark:text-green-300 block mb-1">What Did Not Change</span>
                  <p className="text-green-900 dark:text-green-100">{event.whatDidNotChange}</p>
                </div>
              )}
              
              {event.decisionImpact && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <span className="font-medium text-purple-700 dark:text-purple-300 block mb-1">Decision Impact</span>
                  <p className="text-purple-900 dark:text-purple-100">{event.decisionImpact}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completeness Score */}
        {event.completenessScore !== null && (
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <span className="text-muted-foreground">Completeness Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    event.completenessScore >= 80 ? 'bg-green-500' : 
                    event.completenessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${event.completenessScore}%` }}
                />
              </div>
              <span className="font-medium">{event.completenessScore}%</span>
            </div>
          </div>
        )}

        {/* View Full Event Link */}
        <Link href={`/events/${event.id}`}>
          <div className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-2 border-t">
            View Full Event Details
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export default EventContext;
