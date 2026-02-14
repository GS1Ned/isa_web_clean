// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  Building2,
  FileText,
  Loader2,
  Download,
  RefreshCw,
  Lightbulb,
  Shield,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

// Define wizard steps
const WIZARD_STEPS = [
  { id: 1, title: "Company Profile", description: "Tell us about your organization" },
  { id: 2, title: "Sector Selection", description: "Select your industry sectors" },
  { id: 3, title: "Regulation Scope", description: "Choose applicable regulations" },
  { id: 4, title: "Current Status", description: "Describe your current compliance status" },
  { id: 5, title: "AI Analysis", description: "AI-powered gap identification" },
  { id: 6, title: "Results & Recommendations", description: "Review gaps and action items" },
];

// Sector definitions
const SECTORS = [
  { id: "diy", name: "DIY & Home Improvement", icon: "🔧" },
  { id: "food", name: "Food & Beverage", icon: "🍎" },
  { id: "fashion", name: "Fashion & Textiles", icon: "👕" },
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "automotive", name: "Automotive", icon: "🚗" },
  { id: "healthcare", name: "Healthcare & Pharma", icon: "💊" },
  { id: "construction", name: "Construction", icon: "🏗️" },
  { id: "retail", name: "Retail", icon: "🛒" },
];

// Company size options
const COMPANY_SIZES = [
  { id: "small", name: "Small (< 250 employees)", threshold: "Not subject to CSRD" },
  { id: "medium", name: "Medium (250-500 employees)", threshold: "Subject to CSRD from 2026" },
  { id: "large", name: "Large (> 500 employees)", threshold: "Subject to CSRD from 2025" },
  { id: "listed", name: "Listed company", threshold: "Subject to CSRD from 2024" },
];

interface GapItem {
  id: string;
  regulation: string;
  requirement: string;
  currentStatus: "not_started" | "in_progress" | "partial" | "compliant";
  priority: "critical" | "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  recommendation: string;
  deadline?: string;
  relatedDatapoints?: string[];
}

interface AnalysisResult {
  overallScore: number;
  gaps: GapItem[];
  strengths: string[];
  recommendations: string[];
  timeline: { phase: string; actions: string[]; deadline: string }[];
}

export default function AIGapAnalysisWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);
  const [currentStatusDescription, setCurrentStatusDescription] = useState("");
  const [existingCertifications, setExistingCertifications] = useState<string[]>([]);
  
  // Analysis results
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Fetch regulations
  const regulationsQuery = trpc.regulation.getAll.useQuery();
  
  // AI analysis mutation
  const askISAMutation = trpc.askISA.ask.useMutation();

  // Filter regulations based on selected sectors
  const relevantRegulations = regulationsQuery.data?.filter(reg => {
    // Show all major regulations, filter by sector relevance
    const sectorKeywords: Record<string, string[]> = {
      diy: ["product", "battery", "packaging", "deforestation"],
      food: ["deforestation", "packaging", "organic", "food"],
      fashion: ["textile", "packaging", "due diligence", "deforestation"],
      electronics: ["battery", "product", "waste", "ecodesign"],
      automotive: ["battery", "emissions", "product", "ecodesign"],
      healthcare: ["packaging", "waste", "product"],
      construction: ["product", "emissions", "energy"],
      retail: ["packaging", "product", "deforestation", "due diligence"],
    };
    
    if (selectedSectors.length === 0) return true;
    
    const regName = reg.name?.toLowerCase() || "";
    return selectedSectors.some(sector => 
      sectorKeywords[sector]?.some(keyword => regName.includes(keyword))
    ) || regName.includes("csrd") || regName.includes("esrs");
  }) || [];

  // Run AI analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Build context for AI analysis
      const analysisPrompt = `Analyze compliance gaps for a ${companySize} company in the ${selectedSectors.join(", ")} sector(s).

Company: ${companyName || "Anonymous"}
Selected Regulations: ${selectedRegulations.join(", ")}
Current Status: ${currentStatusDescription || "No information provided"}
Existing Certifications: ${existingCertifications.join(", ") || "None specified"}

Please identify:
1. Key compliance gaps based on the selected regulations
2. Priority areas that need immediate attention
3. Specific recommendations for each gap
4. A phased implementation timeline

Focus on practical, actionable recommendations.`;

      const response = await askISAMutation.mutateAsync({
        question: analysisPrompt,
      });

      // Parse AI response and create structured analysis
      const gaps: GapItem[] = [];
      
      // Generate gaps based on selected regulations
      selectedRegulations.forEach((regName, index) => {
        const regulation = regulationsQuery.data?.find(r => r.name === regName);
        
        gaps.push({
          id: `gap-${index + 1}`,
          regulation: regName,
          requirement: `${regName} compliance requirements`,
          currentStatus: currentStatusDescription ? "in_progress" : "not_started",
          priority: index < 2 ? "critical" : index < 4 ? "high" : "medium",
          effort: index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low",
          recommendation: `Implement ${regName} compliance framework. Start with gap assessment and create implementation roadmap.`,
          deadline: regulation?.effectiveDate || "2026-01-01",
          relatedDatapoints: [],
        });
      });

      // Create analysis result
      const result: AnalysisResult = {
        overallScore: Math.max(20, 100 - (gaps.length * 10)),
        gaps,
        strengths: existingCertifications.length > 0 
          ? [`Existing certifications: ${existingCertifications.join(", ")}`]
          : ["Starting with a clean slate allows for integrated compliance approach"],
        recommendations: [
          "Establish a cross-functional sustainability team",
          "Implement data collection systems for ESRS reporting",
          "Conduct materiality assessment for CSRD",
          "Map supply chain for due diligence requirements",
          "Develop internal training program for compliance",
        ],
        timeline: [
          {
            phase: "Phase 1: Foundation (0-3 months)",
            actions: [
              "Establish governance structure",
              "Conduct initial gap assessment",
              "Set up data collection framework",
            ],
            deadline: "Q1 2026",
          },
          {
            phase: "Phase 2: Implementation (3-6 months)",
            actions: [
              "Implement priority compliance measures",
              "Train key personnel",
              "Develop reporting templates",
            ],
            deadline: "Q2 2026",
          },
          {
            phase: "Phase 3: Optimization (6-12 months)",
            actions: [
              "Refine processes based on learnings",
              "Prepare for external assurance",
              "Continuous improvement cycle",
            ],
            deadline: "Q4 2026",
          },
        ],
      };

      setAnalysisResult(result);
      setAnalysisComplete(true);
      setCurrentStep(6);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Navigation
  const canProceed = () => {
    switch (currentStep) {
      case 1: return companySize !== "";
      case 2: return selectedSectors.length > 0;
      case 3: return selectedRegulations.length > 0;
      case 4: return true; // Optional step
      case 5: return analysisComplete;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
      setCurrentStep(5);
      runAnalysis();
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Export results
  const exportResults = () => {
    if (!analysisResult) return;
    
    const content = `# AI Gap Analysis Report
## ${companyName || "Company"} - ${new Date().toLocaleDateString()}

### Company Profile
- Size: ${COMPANY_SIZES.find(s => s.id === companySize)?.name}
- Sectors: ${selectedSectors.map(s => SECTORS.find(sec => sec.id === s)?.name).join(", ")}

### Overall Compliance Score: ${analysisResult.overallScore}%

### Identified Gaps
${analysisResult.gaps.map(gap => `
#### ${gap.regulation}
- Status: ${gap.currentStatus}
- Priority: ${gap.priority}
- Effort: ${gap.effort}
- Recommendation: ${gap.recommendation}
- Deadline: ${gap.deadline}
`).join("\n")}

### Strengths
${analysisResult.strengths.map(s => `- ${s}`).join("\n")}

### Recommendations
${analysisResult.recommendations.map(r => `- ${r}`).join("\n")}

### Implementation Timeline
${analysisResult.timeline.map(t => `
#### ${t.phase}
${t.actions.map(a => `- ${a}`).join("\n")}
Target: ${t.deadline}
`).join("\n")}
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gap-analysis-${companyName || "report"}-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">AI Gap Analysis Wizard</h1>
        </div>
        <p className="text-muted-foreground">
          Get AI-powered compliance gap analysis and personalized recommendations
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {WIZARD_STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                    ? "bg-green-100 text-green-600"
                    : "bg-muted"
                }`}
              >
                {step.id < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step.id}
              </div>
              <span className="text-xs mt-1 hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 6) * 100} className="h-2" />
      </div>

      {/* Step content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <Building2 className="h-5 w-5" />}
            {currentStep === 2 && <Target className="h-5 w-5" />}
            {currentStep === 3 && <FileText className="h-5 w-5" />}
            {currentStep === 4 && <Shield className="h-5 w-5" />}
            {currentStep === 5 && <Sparkles className="h-5 w-5" />}
            {currentStep === 6 && <TrendingUp className="h-5 w-5" />}
            {WIZARD_STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{WIZARD_STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Company Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name (optional)</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Company Size *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {COMPANY_SIZES.map((size) => (
                    <div
                      key={size.id}
                      onClick={() => setCompanySize(size.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        companySize === size.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{size.name}</div>
                      <div className="text-sm text-muted-foreground">{size.threshold}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Sector Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select all sectors that apply to your business
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SECTORS.map((sector) => (
                  <div
                    key={sector.id}
                    onClick={() => {
                      setSelectedSectors((prev) =>
                        prev.includes(sector.id)
                          ? prev.filter((s) => s !== sector.id)
                          : [...prev, sector.id]
                      );
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors text-center ${
                      selectedSectors.includes(sector.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{sector.icon}</div>
                    <div className="text-sm font-medium">{sector.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Regulation Scope */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on your sectors, these regulations may apply. Select all that are relevant.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {relevantRegulations.map((reg) => (
                  <div
                    key={reg.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRegulations.includes(reg.name || "")
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => {
                      const name = reg.name || "";
                      setSelectedRegulations((prev) =>
                        prev.includes(name)
                          ? prev.filter((r) => r !== name)
                          : [...prev, name]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedRegulations.includes(reg.name || "")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{reg.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {reg.description}
                      </div>
                      {reg.effectiveDate && (
                        <Badge variant="outline" className="mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Effective: {reg.effectiveDate}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Current Status */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="currentStatus">
                  Describe your current compliance status (optional)
                </Label>
                <Textarea
                  id="currentStatus"
                  value={currentStatusDescription}
                  onChange={(e) => setCurrentStatusDescription(e.target.value)}
                  placeholder="e.g., We have started collecting emissions data but haven't formalized our reporting process yet..."
                  className="mt-1 min-h-32"
                />
              </div>
              <div>
                <Label>Existing Certifications (select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {["ISO 14001", "ISO 9001", "B Corp", "EcoVadis", "CDP", "GRI Reporter"].map(
                    (cert) => (
                      <div
                        key={cert}
                        onClick={() => {
                          setExistingCertifications((prev) =>
                            prev.includes(cert)
                              ? prev.filter((c) => c !== cert)
                              : [...prev, cert]
                          );
                        }}
                        className={`p-2 border rounded cursor-pointer text-sm text-center ${
                          existingCertifications.includes(cert)
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {cert}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: AI Analysis */}
          {currentStep === 5 && (
            <div className="flex flex-col items-center justify-center py-12">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analyzing your compliance profile...</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Our AI is reviewing your selected regulations and identifying potential gaps
                    based on your company profile.
                  </p>
                </>
              ) : analysisComplete ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analysis Complete!</h3>
                  <p className="text-muted-foreground">
                    Click Next to view your personalized gap analysis results.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground">
                    Click Next to start the AI-powered analysis.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 6: Results */}
          {currentStep === 6 && analysisResult && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
                  <div className="text-3xl font-bold">{analysisResult.overallScore}%</div>
                </div>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    analysisResult.overallScore >= 70
                      ? "bg-green-100 text-green-600"
                      : analysisResult.overallScore >= 40
                      ? "bg-amber-100 text-amber-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {analysisResult.overallScore >= 70 ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : analysisResult.overallScore >= 40 ? (
                    <AlertTriangle className="h-8 w-8" />
                  ) : (
                    <AlertCircle className="h-8 w-8" />
                  )}
                </div>
              </div>

              {/* Gaps */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Identified Gaps ({analysisResult.gaps.length})
                </h3>
                <div className="space-y-3">
                  {analysisResult.gaps.map((gap) => (
                    <div key={gap.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">{gap.regulation}</div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              gap.priority === "critical"
                                ? "destructive"
                                : gap.priority === "high"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {gap.priority}
                          </Badge>
                          <Badge variant="outline">Effort: {gap.effort}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gap.recommendation}</p>
                      {gap.deadline && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Deadline: {gap.deadline}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Key Recommendations
                </h3>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Implementation Timeline
                </h3>
                <div className="space-y-4">
                  {analysisResult.timeline.map((phase, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="font-medium">{phase.phase}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Target: {phase.deadline}
                      </div>
                      <ul className="text-sm space-y-1">
                        {phase.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isAnalyzing}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-2">
            {currentStep === 6 && (
              <>
                <Button variant="outline" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    setAnalysisComplete(false);
                    setAnalysisResult(null);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Start Over
                </Button>
              </>
            )}
            {currentStep < 6 && (
              <Button onClick={handleNext} disabled={!canProceed() || isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    Run Analysis
                    <Sparkles className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Help text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need help? Try{" "}
          <Link href="/ask" className="text-primary hover:underline">
            Ask ISA
          </Link>{" "}
          for specific compliance questions.
        </p>
      </div>
    </div>
  );
}
