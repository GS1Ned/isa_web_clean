import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle2,
  HelpCircle,
  Info,
  Lightbulb,
  Search,
  Target,
  TrendingUp,
  XCircle,
  Building2,
  Factory,
  Leaf,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";

// Epistemic status badge component
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
          description: 'Involves assumptions'
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

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const getConfig = () => {
    switch (priority) {
      case 'critical':
        return { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle };
      case 'high':
        return { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: TrendingUp };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Target };
      case 'low':
        return { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Info };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

export default function GapAnalyzer() {
  const [, navigate] = useLocation();
  
  // Form state
  const [sector, setSector] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Query data
  const { data: sectors } = trpc.gapAnalyzer.getAvailableSectors.useQuery();
  const { data: companySizes } = trpc.gapAnalyzer.getCompanySizeOptions.useQuery();
  const { data: sampleAttributes } = trpc.gapAnalyzer.getSampleAttributes.useQuery();

  // Analysis mutation
  const analyzeMutation = trpc.gapAnalyzer.analyze.useMutation();

  // Filter attributes by search
  const filteredAttributes = useMemo(() => {
    if (!sampleAttributes) return [];
    if (!searchTerm) return sampleAttributes;
    const term = searchTerm.toLowerCase();
    return sampleAttributes.filter(
      a => a.gs1_attribute_name.toLowerCase().includes(term) ||
           a.gs1_attribute_id.toLowerCase().includes(term)
    );
  }, [sampleAttributes, searchTerm]);

  // Handle attribute toggle
  const toggleAttribute = (attrId: string) => {
    setSelectedAttributes(prev =>
      prev.includes(attrId)
        ? prev.filter(id => id !== attrId)
        : [...prev, attrId]
    );
  };

  // Run analysis
  const handleAnalyze = () => {
    if (!sector || !companySize) return;
    analyzeMutation.mutate({
      sector,
      companySize: companySize as 'large' | 'sme' | 'micro',
      currentGs1Coverage: selectedAttributes,
    });
  };

  const result = analyzeMutation.data;

  // Navigate to Impact Simulator with Core 1 data
  const handleContinueToImpactSimulator = () => {
    // Store Core 1 results in sessionStorage for Core 2 to consume
    const core1Data = {
      sector,
      companySize,
      currentGs1Coverage: selectedAttributes,
      gapSummary: result ? {
        totalGaps: result.summary.gaps,
        criticalGaps: result.criticalGaps.length,
        highGaps: result.highGaps.length,
        coveragePercentage: result.summary.coveragePercentage,
      } : null,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem('core1Data', JSON.stringify(core1Data));
    navigate('/tools/impact-simulator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="flex items-center gap-2 text-slate-300 text-sm mb-4">
            <Link href="/hub" className="hover:text-white">Hub</Link>
            <span>/</span>
            <Link href="/tools/compliance-roadmap" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-white">Gap Analyzer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Search className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Compliance Gap Analyzer</h1>
              <p className="text-slate-300 mt-1">
                Core 1: Present-State Certainty Analysis
              </p>
            </div>
          </div>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Identify gaps between your current GS1 data coverage and ESRS compliance requirements.
            All findings are grounded in database facts with clear epistemic markers.
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Company Profile
                </CardTitle>
                <CardDescription>
                  Configure your company context for gap analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sector Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sector</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors?.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Size</label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes?.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          <div className="flex flex-col">
                            <span>{size.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {size.csrdApplicable 
                                ? `CSRD applicable (${size.phaseInYear})` 
                                : 'Generally exempt'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* GS1 Coverage Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Current GS1 Coverage
                </CardTitle>
                <CardDescription>
                  Select the GS1 attributes you currently use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search attributes..."
                    className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  {selectedAttributes.length} attributes selected
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
                  {filteredAttributes?.map((attr) => (
                    <div
                      key={attr.gs1_attribute_id}
                      className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded"
                    >
                      <Checkbox
                        id={attr.gs1_attribute_id}
                        checked={selectedAttributes.includes(attr.gs1_attribute_id)}
                        onCheckedChange={() => toggleAttribute(attr.gs1_attribute_id)}
                      />
                      <label
                        htmlFor={attr.gs1_attribute_id}
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">{attr.gs1_attribute_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{attr.gs1_attribute_id}</span>
                          <Badge variant="outline" className="text-xs">
                            {attr.confidence}
                          </Badge>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={!sector || !companySize || analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Gaps
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !analyzeMutation.isPending && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Configure your company profile and select your current GS1 attribute coverage,
                    then click "Analyze Gaps" to identify compliance gaps.
                  </p>
                </CardContent>
              </Card>
            )}

            {analyzeMutation.isPending && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analyzing Compliance Gaps</h3>
                  <p className="text-muted-foreground">
                    Comparing your GS1 coverage against ESRS requirements...
                  </p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        Coverage Summary
                      </CardTitle>
                      <EpistemicBadge 
                        status="fact" 
                        confidence={result.overallEpistemic.overallConfidence} 
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-3xl font-bold text-slate-800">
                          {result.summary.totalRequirements}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Requirements</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {result.summary.coveredRequirements}
                        </div>
                        <div className="text-sm text-muted-foreground">Covered</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-3xl font-bold text-yellow-600">
                          {result.summary.partialCoverage}
                        </div>
                        <div className="text-sm text-muted-foreground">Partial</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {result.summary.gaps}
                        </div>
                        <div className="text-sm text-muted-foreground">Gaps</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Coverage Progress</span>
                        <span className="font-medium">{result.summary.coveragePercentage}%</span>
                      </div>
                      <Progress value={result.summary.coveragePercentage} className="h-3" />
                    </div>

                    {/* Epistemic Summary */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Analysis Basis
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 font-medium">{result.overallEpistemic.factCount}</span>
                          <span className="text-muted-foreground ml-1">Facts</span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">{result.overallEpistemic.inferenceCount}</span>
                          <span className="text-muted-foreground ml-1">Inferences</span>
                        </div>
                        <div>
                          <span className="text-amber-600 font-medium">{result.overallEpistemic.uncertainCount}</span>
                          <span className="text-muted-foreground ml-1">Uncertain</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gaps by Priority */}
                {result.criticalGaps.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        Critical Gaps ({result.criticalGaps.length})
                      </CardTitle>
                      <CardDescription>
                        Immediate attention required - core ESRS requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <GapList gaps={result.criticalGaps} />
                    </CardContent>
                  </Card>
                )}

                {result.highGaps.length > 0 && (
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <TrendingUp className="h-5 w-5" />
                        High Priority Gaps ({result.highGaps.length})
                      </CardTitle>
                      <CardDescription>
                        Should be addressed in the near term
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <GapList gaps={result.highGaps} />
                    </CardContent>
                  </Card>
                )}

                {result.mediumGaps.length > 0 && (
                  <Card className="border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <Target className="h-5 w-5" />
                        Medium Priority Gaps ({result.mediumGaps.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GapList gaps={result.mediumGaps} defaultCollapsed />
                    </CardContent>
                  </Card>
                )}

                {result.lowGaps.length > 0 && (
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-5 w-5" />
                        Low Priority Gaps ({result.lowGaps.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GapList gaps={result.lowGaps} defaultCollapsed />
                    </CardContent>
                  </Card>
                )}

                {/* Remediation Paths */}
                {result.remediationPaths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Recommended Remediation Paths
                      </CardTitle>
                      <CardDescription>
                        Step-by-step guidance for addressing critical and high priority gaps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {result.remediationPaths.slice(0, 5).map((path, idx) => (
                          <AccordionItem key={path.gapId} value={path.gapId} className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Path {idx + 1}</span>
                                <Badge variant="outline">
                                  {path.estimatedEffort} effort
                                </Badge>
                                <EpistemicBadge 
                                  status={path.epistemic.status} 
                                  confidence={path.epistemic.confidence} 
                                />
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pt-2">
                                {path.steps.map((step) => (
                                  <div key={step.order} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                      {step.order}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{step.action}</div>
                                      <div className="text-sm text-muted-foreground">{step.description}</div>
                                      {step.estimatedDuration && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Est. duration: {step.estimatedDuration}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* Link to Core 2 - Pass data directly */}
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-indigo-900">
                          Continue to Impact Simulator
                        </h3>
                        <p className="text-sm text-indigo-700 mt-1">
                          Use these results to simulate future regulatory impacts (Core 2)
                        </p>
                        <p className="text-xs text-indigo-600 mt-2">
                          Your sector ({sector}), company size ({companySize}), and {selectedAttributes.length} GS1 attributes will be pre-loaded
                        </p>
                      </div>
                      <Button 
                        onClick={handleContinueToImpactSimulator}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Continue with Data
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
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

// Gap list component
function GapList({ gaps, defaultCollapsed = false }: { gaps: any[]; defaultCollapsed?: boolean }) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultCollapsed ? undefined : gaps[0]?.id}>
      {gaps.map((gap) => (
        <AccordionItem key={gap.id} value={gap.id} className="border-b last:border-0">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-start gap-3 text-left">
              <div className="flex-1">
                <div className="font-medium">{gap.shortName}</div>
                <div className="text-sm text-muted-foreground">
                  {gap.esrsStandard} • {gap.esrsTopic}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={gap.priority} />
                <EpistemicBadge status={gap.epistemic.status} confidence={gap.epistemic.confidence} />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 pb-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Definition</h4>
                <p className="text-sm text-muted-foreground">{gap.definition}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Explanation</h4>
                <p className="text-sm text-muted-foreground">{gap.explanation}</p>
              </div>

              {gap.suggestedAttributes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Suggested GS1 Attributes</h4>
                  <div className="space-y-2">
                    {gap.suggestedAttributes.slice(0, 3).map((attr: any) => (
                      <div key={attr.attributeId} className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{attr.attributeName}</span>
                        <Badge variant="outline" className="text-xs">
                          {attr.mappingType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {attr.mappingConfidence} confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                <strong>Basis:</strong> {gap.epistemic.basis}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
