// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  PlayCircle,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
  AlertCircle,
  Target,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";

// Epistemic status badge component (same as Core 1)
function EpistemicBadge({ status, confidence }: { status: string; confidence: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'fact':
        return { 
          icon: CheckCircle2, 
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'Fact',
          description: 'Grounded in database records'
        };
      case 'inference':
        return { 
          icon: Lightbulb, 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Inference',
          description: 'Derived from rules applied to facts'
        };
      case 'uncertain':
        return { 
          icon: HelpCircle, 
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Uncertain',
          description: 'Involves assumptions about future'
        };
      default:
        return { 
          icon: Info, 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          label: status,
          description: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`${config.color} text-xs gap-1`}>
          <Icon className="h-3 w-3" />
          {config.label}
          <span className="opacity-70">({confidence})</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
        <p className="text-xs mt-1">Confidence: {confidence}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Confidence badge
function ConfidenceBadge({ confidence }: { confidence: string }) {
  const getConfig = () => {
    switch (confidence) {
      case 'high':
        return { color: 'bg-green-100 text-green-800 border-green-300' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'low':
        return { color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const config = getConfig();
  return (
    <Badge variant="outline" className={config.color}>
      {confidence} confidence
    </Badge>
  );
}

// Future status badge
function FutureStatusBadge({ status }: { status: string }) {
  const getConfig = () => {
    switch (status) {
      case 'will_be_covered':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Covered' };
      case 'at_risk':
        return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'At Risk' };
      case 'gap':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Gap' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Info, label: status };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Type for Core 1 data passed via sessionStorage
interface Core1Data {
  sector: string;
  companySize: string;
  currentGs1Coverage: string[];
  gapSummary: {
    totalGaps: number;
    criticalGaps: number;
    highGaps: number;
    coveragePercentage: number;
  } | null;
  timestamp: string;
}

export default function ImpactSimulator() {
  // Form state
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("large");
  const [currentGs1Coverage, setCurrentGs1Coverage] = useState<string[]>([]);
  const [core1Data, setCore1Data] = useState<Core1Data | null>(null);

  // Load Core 1 data from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('core1Data');
    if (stored) {
      try {
        const data: Core1Data = JSON.parse(stored);
        setCore1Data(data);
        if (data.sector) setSector(data.sector);
        if (data.companySize) setCompanySize(data.companySize);
        if (data.currentGs1Coverage) setCurrentGs1Coverage(data.currentGs1Coverage);
        // Clear after loading to avoid stale data on refresh
        // sessionStorage.removeItem('core1Data');
      } catch (e) {
        console.error('Failed to parse Core 1 data:', e);
      }
    }
  }, []);

  // Query data
  const { data: scenarios } = trpc.impactSimulator.getScenarios.useQuery();
  const { data: sectors } = trpc.impactSimulator.getAvailableSectors.useQuery();
  const { data: scenarioDetail } = trpc.impactSimulator.getScenarioDetail.useQuery(
    { scenarioId: selectedScenario },
    { enabled: !!selectedScenario }
  );

  // Simulation mutation
  const simulateMutation = trpc.impactSimulator.simulate.useMutation();

  // Run simulation
  const handleSimulate = () => {
    if (!selectedScenario) return;
    simulateMutation.mutate({
      scenarioId: selectedScenario,
      currentState: sector ? {
        sector,
        companySize: companySize as 'large' | 'sme' | 'micro',
        currentGs1Coverage: currentGs1Coverage,
      } : undefined,
    });
  };

  const result = simulateMutation.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-2 text-indigo-200 text-sm mb-4">
            <Link href="/hub" className="hover:text-white">Hub</Link>
            <span>/</span>
            <Link href="/tools/gap-analyzer" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-white">Impact Simulator</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Zap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Regulatory Impact Simulator</h1>
              <p className="text-indigo-200 mt-1">
                Core 2: Future-State Reasoning
              </p>
            </div>
          </div>
          <p className="mt-4 text-indigo-200 max-w-2xl">
            Simulate the impact of upcoming regulatory changes on your GS1 data readiness.
            All projections are clearly marked as uncertain with explicit assumptions.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Uncertainty Banner */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Future-State Analysis</h3>
            <p className="text-sm text-amber-700">
              This tool projects future compliance gaps based on regulatory scenarios. 
              All outputs involve assumptions about future regulatory developments and should 
              be used for planning purposes only. Monitor official sources for authoritative updates.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Scenario Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Regulatory Scenario
                </CardTitle>
                <CardDescription>
                  Select an upcoming regulation to simulate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex flex-col">
                          <span>{s.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.regulation} • {s.requirementCount} requirements
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {scenarioDetail && (
                  <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{scenarioDetail.regulation}</span>
                      <ConfidenceBadge confidence={scenarioDetail.dateConfidence} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {scenarioDetail.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Expected: {new Date(scenarioDetail.expectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: {scenarioDetail.source}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Context Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Your Context
                </CardTitle>
                <CardDescription>
                  Optional: Configure your company context
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sector (optional)</label>
                  <Select value={sector || "_all"} onValueChange={(v) => setSector(v === "_all" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">All sectors</SelectItem>
                      {sectors?.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Size</label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">Large (&gt;250 employees)</SelectItem>
                      <SelectItem value="sme">SME (50-250 employees)</SelectItem>
                      <SelectItem value="micro">Micro (&lt;50 employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {core1Data ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-medium text-sm mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Core 1 Data Loaded
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>Sector: {core1Data.sector.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p>Company Size: {core1Data.companySize.toUpperCase()}</p>
                      <p>GS1 Attributes: {core1Data.currentGs1Coverage.length} selected</p>
                      {core1Data.gapSummary && (
                        <p>Gap Analysis: {core1Data.gapSummary.coveragePercentage}% coverage, {core1Data.gapSummary.totalGaps} gaps identified</p>
                      )}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Data from Gap Analyzer at {new Date(core1Data.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Tip:</strong> For more accurate simulation, first run the 
                      <Link href="/tools/gap-analyzer" className="underline ml-1">Gap Analyzer</Link> 
                      {" "}to assess your current GS1 coverage.
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleSimulate}
                  disabled={!selectedScenario || simulateMutation.isPending}
                >
                  {simulateMutation.isPending ? (
                    <>Simulating...</>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Link to Core 1 */}
            <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-slate-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">Need Current State?</h3>
                    <p className="text-xs text-slate-600">
                      Use Gap Analyzer for present-state analysis
                    </p>
                  </div>
                  <Link href="/tools/gap-analyzer">
                    <Button variant="outline" size="sm">
                      Core 1
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !simulateMutation.isPending && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Simulate</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Select a regulatory scenario and click "Run Simulation" to project 
                    future compliance gaps and recommended actions.
                  </p>
                </CardContent>
              </Card>
            )}

            {simulateMutation.isPending && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Running Simulation</h3>
                  <p className="text-muted-foreground">
                    Projecting future compliance gaps...
                  </p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Scenario Info */}
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-purple-900">
                        <FileText className="h-5 w-5" />
                        {result.scenario.name}
                      </CardTitle>
                      <EpistemicBadge status="uncertain" confidence={result.scenario.dateConfidence} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>Expected: {new Date(result.scenario.expectedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>Updated: {result.scenario.lastUpdated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coverage Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Coverage Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Coverage</span>
                          <span className="font-medium">{result.comparison.currentCoverage}%</span>
                        </div>
                        <Progress value={result.comparison.currentCoverage} className="h-3" />
                        <p className="text-xs text-muted-foreground">Based on your GS1 attributes</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Projected Coverage</span>
                          <span className="font-medium">{result.comparison.projectedCoverage}%</span>
                        </div>
                        <Progress 
                          value={result.comparison.projectedCoverage} 
                          className={`h-3 ${result.comparison.projectedCoverage < result.comparison.currentCoverage ? '[&>div]:bg-amber-500' : ''}`}
                        />
                        <p className="text-xs text-muted-foreground">After scenario requirements</p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{result.comparison.newGapsCount}</div>
                        <div className="text-sm text-red-700">New Gaps Projected</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{result.comparison.resolvedGapsCount}</div>
                        <div className="text-sm text-green-700">Gaps Resolved</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Projected Gaps */}
                {result.projectedGaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Projected Gaps ({result.projectedGaps.length})
                      </CardTitle>
                      <CardDescription>
                        Future compliance gaps based on scenario requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {result.projectedGaps.map((gap) => (
                          <AccordionItem key={gap.id} value={gap.id} className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline py-3">
                              <div className="flex items-start gap-3 text-left flex-1">
                                <div className="flex-1">
                                  <div className="font-medium">{gap.requirement.description}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {gap.requirement.gs1Impact}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FutureStatusBadge status={gap.futureStatus} />
                                  <EpistemicBadge 
                                    status={gap.epistemic.status} 
                                    confidence={gap.epistemic.confidence} 
                                  />
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pt-2 pb-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-slate-50 rounded">
                                    <div className="text-xs text-muted-foreground mb-1">Current Status</div>
                                    <Badge variant="outline">
                                      {gap.currentStatus.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                  <div className="p-3 bg-slate-50 rounded">
                                    <div className="text-xs text-muted-foreground mb-1">Effective Date</div>
                                    <span className="text-sm">
                                      {gap.requirement.effectiveDate 
                                        ? new Date(gap.requirement.effectiveDate).toLocaleDateString()
                                        : 'TBD'}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Change Description</h4>
                                  <p className="text-sm text-muted-foreground">{gap.changeDescription}</p>
                                </div>
                                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded flex items-start gap-2">
                                  <HelpCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span><strong>Basis:</strong> {gap.epistemic.basis}</span>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* No-Regret Actions */}
                {result.noRegretActions.length > 0 && (
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-5 w-5" />
                        No-Regret Actions ({result.noRegretActions.length})
                      </CardTitle>
                      <CardDescription>
                        Actions that provide value regardless of how the regulation evolves
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.noRegretActions.map((action) => (
                          <div key={action.id} className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-green-900">{action.action}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white">
                                  {action.estimatedEffort} effort
                                </Badge>
                                <EpistemicBadge 
                                  status={action.epistemic.status} 
                                  confidence={action.epistemic.confidence} 
                                />
                              </div>
                            </div>
                            <p className="text-sm text-green-800 mb-3">{action.description}</p>
                            {action.benefitsEvenIfScenarioChanges && (
                              <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                                <strong>Why no-regret:</strong> {action.benefitsEvenIfScenarioChanges}
                              </div>
                            )}
                            {action.gs1Standards.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {action.gs1Standards.map(std => (
                                  <Badge key={std} variant="secondary" className="text-xs">
                                    {std}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contingent Actions */}
                {result.contingentActions.length > 0 && (
                  <Card className="border-amber-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-800">
                        <Clock className="h-5 w-5" />
                        Contingent Actions ({result.contingentActions.length})
                      </CardTitle>
                      <CardDescription>
                        Actions to prepare for, but wait for trigger conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.contingentActions.map((action) => (
                          <div key={action.id} className="p-4 bg-amber-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-amber-900">{action.action}</h4>
                              <EpistemicBadge 
                                status={action.epistemic.status} 
                                confidence={action.epistemic.confidence} 
                              />
                            </div>
                            <p className="text-sm text-amber-800 mb-3">{action.description}</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {action.triggerCondition && (
                                <div className="p-2 bg-amber-100 rounded">
                                  <strong>Trigger:</strong> {action.triggerCondition}
                                </div>
                              )}
                              {action.waitUntil && (
                                <div className="p-2 bg-amber-100 rounded">
                                  <strong>Wait until:</strong> {new Date(action.waitUntil).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Assumptions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-slate-600" />
                      Active Assumptions ({result.activeAssumptions.length})
                    </CardTitle>
                    <CardDescription>
                      Explicit assumptions underlying this simulation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.activeAssumptions.map((assumption) => (
                        <div key={assumption.id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm">{assumption.assumption}</span>
                            <ConfidenceBadge confidence={assumption.confidence} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Rationale:</strong> {assumption.rationale}
                          </p>
                          {assumption.alternatives.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <strong>Alternatives:</strong> {assumption.alternatives.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">Uncertainty Disclaimer</h4>
                        <p className="text-sm text-amber-700">{result.uncertaintyDisclaimer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Epistemic Summary */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Analysis Basis</h4>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>
                            <span className="text-green-600 font-medium">{result.overallEpistemic.factCount}</span> Facts
                          </span>
                          <span>
                            <span className="text-blue-600 font-medium">{result.overallEpistemic.inferenceCount}</span> Inferences
                          </span>
                          <span>
                            <span className="text-amber-600 font-medium">{result.overallEpistemic.uncertainCount}</span> Uncertain
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                        Overall: {result.overallEpistemic.overallConfidence} confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
