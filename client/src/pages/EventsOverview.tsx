/**
 * Events Overview Page
 * Phase 3: Lijn 3 - Gebruikersoriëntatie
 * Displays all regulatory events with filtering and sorting
 */

import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Layers,
  TrendingUp,
  BarChart3
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
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  COMPLETE: { label: "Complete", icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  INCOMPLETE: { label: "Incomplete", icon: XCircle, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  DRAFT: { label: "Draft", icon: FileText, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
};

// Stability Risk configuration
const STABILITY_RISK_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; shortLabel: string }> = {
  HIGH: { label: "High Risk", shortLabel: "High", color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", icon: AlertTriangle },
  MEDIUM: { label: "Medium Risk", shortLabel: "Medium", color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800", icon: AlertCircle },
  LOW: { label: "Low Risk", shortLabel: "Low", color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800", icon: CheckCircle2 },
};

// Regulation display names
const REGULATION_NAMES: Record<string, string> = {
  CSRD: "CSRD",
  ESRS: "ESRS",
  PPWR: "PPWR",
  CSDDD: "CS3D/CSDDD",
  CS3D: "CS3D/CSDDD",
  EUDR: "EUDR",
  EU_Taxonomy: "EU Taxonomy",
  ESPR: "ESPR",
  DPP: "Digital Product Passport",
  GREEN_CLAIMS: "Green Claims",
  LOGISTICS_OPTIMIZATION: "Logistics Optimization",
};

type SortField = "date" | "completeness" | "stability_risk" | "regulation";
type SortDirection = "asc" | "desc";

export default function EventsOverview() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [regulationFilter, setRegulationFilter] = useState<string>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [stabilityRiskFilter, setStabilityRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Fetch events
  const { data: events, isLoading } = trpc.hub.getEvents.useQuery({
    limit: 100,
    status: "all",
  });

  // Fetch stats
  const { data: stats } = trpc.hub.getEventStats.useQuery();

  // Get unique regulations from events
  const availableRegulations = useMemo(() => {
    if (!events) return [];
    const regs = new Set<string>();
    events.forEach(event => {
      if (event.primaryRegulation) {
        regs.add(event.primaryRegulation);
      }
    });
    return Array.from(regs).sort();
  }, [events]);

  // Get unique lifecycle states from events
  const availableLifecycles = useMemo(() => {
    if (!events) return [];
    const states = new Set<string>();
    events.forEach(event => {
      if (event.lifecycleState) {
        states.add(event.lifecycleState);
      }
    });
    return Array.from(states).sort();
  }, [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let filtered = events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.eventTitle?.toLowerCase().includes(query);
        const matchesSummary = event.eventSummary?.toLowerCase().includes(query);
        const matchesRegulation = event.primaryRegulation?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesRegulation) {
          return false;
        }
      }

      // Regulation filter
      if (regulationFilter !== "all" && event.primaryRegulation !== regulationFilter) {
        return false;
      }

      // Lifecycle filter
      if (lifecycleFilter !== "all" && event.lifecycleState !== lifecycleFilter) {
        return false;
      }

      // Stability risk filter
      if (stabilityRiskFilter !== "all" && event.stabilityRisk !== stabilityRiskFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && event.status !== statusFilter) {
        return false;
      }

      return true;
    });

    // Sort events
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          const dateA = a.eventDateLatest ? new Date(a.eventDateLatest).getTime() : 0;
          const dateB = b.eventDateLatest ? new Date(b.eventDateLatest).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "completeness":
          comparison = (a.completenessScore || 0) - (b.completenessScore || 0);
          break;
        case "stability_risk":
          const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          const riskA = riskOrder[a.stabilityRisk as keyof typeof riskOrder] || 0;
          const riskB = riskOrder[b.stabilityRisk as keyof typeof riskOrder] || 0;
          comparison = riskA - riskB;
          break;
        case "regulation":
          comparison = (a.primaryRegulation || "").localeCompare(b.primaryRegulation || "");
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [events, searchQuery, regulationFilter, lifecycleFilter, stabilityRiskFilter, statusFilter, sortField, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs />
      <div className="container py-8">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Regulatory Events</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Aggregated regulatory events from multiple sources. Each event represents a significant 
          regulatory development with delta analysis showing what changed and its decision impact.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.complete}</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.incomplete}</p>
                  <p className="text-sm text-muted-foreground">Incomplete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(stats.byRegulation || {}).length}</p>
                  <p className="text-sm text-muted-foreground">Regulations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Regulation Filter */}
            <Select value={regulationFilter} onValueChange={setRegulationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Regulation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regulations</SelectItem>
                {availableRegulations.map(reg => (
                  <SelectItem key={reg} value={reg}>
                    {REGULATION_NAMES[reg] || reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lifecycle Filter */}
            <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lifecycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lifecycles</SelectItem>
                {availableLifecycles.map(state => (
                  <SelectItem key={state} value={state}>
                    {LIFECYCLE_CONFIG[state]?.label || state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stability Risk Filter */}
            <Select value={stabilityRiskFilter} onValueChange={setStabilityRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stability Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="completeness">Completeness</SelectItem>
                  <SelectItem value="stability_risk">Stability Risk</SelectItem>
                  <SelectItem value="regulation">Regulation</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleSortDirection}
                title={sortDirection === "asc" ? "Ascending" : "Descending"}
              >
                {sortDirection === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || regulationFilter !== "all" || lifecycleFilter !== "all" || stabilityRiskFilter !== "all" || statusFilter !== "all") && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                    Search: {searchQuery} ×
                  </Badge>
                )}
                {regulationFilter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setRegulationFilter("all")}>
                    {REGULATION_NAMES[regulationFilter] || regulationFilter} ×
                  </Badge>
                )}
                {lifecycleFilter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setLifecycleFilter("all")}>
                    {LIFECYCLE_CONFIG[lifecycleFilter]?.label || lifecycleFilter} ×
                  </Badge>
                )}
                {stabilityRiskFilter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setStabilityRiskFilter("all")}>
                    {STABILITY_RISK_CONFIG[stabilityRiskFilter]?.shortLabel || stabilityRiskFilter} Risk ×
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setRegulationFilter("all");
                  setLifecycleFilter("all");
                  setStabilityRiskFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events?.length || 0} events
        </p>
        <Link href="/news">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News Hub
          </Button>
        </Link>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || regulationFilter !== "all" || lifecycleFilter !== "all" || stabilityRiskFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No regulatory events have been created yet."}
            </p>
            {(searchQuery || regulationFilter !== "all" || lifecycleFilter !== "all" || stabilityRiskFilter !== "all") && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRegulationFilter("all");
                  setLifecycleFilter("all");
                  setStabilityRiskFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => {
            const eventTypeConfig = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.PROPOSAL;
            const lifecycleConfig = LIFECYCLE_CONFIG[event.lifecycleState] || LIFECYCLE_CONFIG.PROPOSAL;
            const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
            const stabilityRiskConfig = event.stabilityRisk ? STABILITY_RISK_CONFIG[event.stabilityRisk] : null;
            const EventIcon = eventTypeConfig.icon;
            const StatusIcon = statusConfig.icon;
            const StabilityIcon = stabilityRiskConfig?.icon;

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={eventTypeConfig.color} variant="secondary">
                          <EventIcon className="h-3 w-3 mr-1" />
                          {eventTypeConfig.label}
                        </Badge>
                        {event.primaryRegulation && (
                          <Badge variant="outline">
                            {REGULATION_NAMES[event.primaryRegulation] || event.primaryRegulation}
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {event.eventTitle}
                    </CardTitle>
                    {event.eventSummary && (
                      <CardDescription className="line-clamp-2">
                        {event.eventSummary}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {/* Date */}
                      {event.eventDateLatest && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(event.eventDateLatest), "MMM d, yyyy")}
                        </span>
                      )}
                      
                      {/* Lifecycle */}
                      <Badge variant="outline" className={lifecycleConfig.color}>
                        {lifecycleConfig.label}
                      </Badge>

                      {/* Stability Risk */}
                      {stabilityRiskConfig && StabilityIcon && (
                        <Badge variant="outline" className={stabilityRiskConfig.color}>
                          <StabilityIcon className="h-3 w-3 mr-1" />
                          {stabilityRiskConfig.shortLabel}
                        </Badge>
                      )}
                    </div>

                    {/* Completeness Score */}
                    {event.completenessScore !== null && event.completenessScore !== undefined && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Delta Completeness</span>
                          <span className="font-medium">{event.completenessScore}%</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              event.completenessScore >= 80 
                                ? "bg-green-500" 
                                : event.completenessScore >= 50 
                                  ? "bg-yellow-500" 
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${event.completenessScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
