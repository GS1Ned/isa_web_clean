import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Search,
  Shield,
  Zap,
  Target,
  BookOpen,
  AlertTriangle,
  Clock,
  FileText,
  Database,
  XCircle,
  Info,
  Scale,
} from "lucide-react";
import { Link } from "wouter";

export default function DualCoreDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container py-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              Dual-Core Proof of Concept
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Intelligent Compliance Analysis
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Two complementary reasoning engines that distinguish 
              <span className="text-green-400 font-medium"> present-state certainty </span>
              from
              <span className="text-amber-400 font-medium"> future-state uncertainty</span>.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/tools/gap-analyzer">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-5 w-5 mr-2" />
                  Start with Core 1
                </Button>
              </Link>
              <Link href="/tools/impact-simulator">
                <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-500/20">
                  <Zap className="h-5 w-5 mr-2" />
                  Jump to Core 2
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SCOPE & BOUNDARIES - NEW SECTION */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/80 border-amber-500/30 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Scale className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    Scope & Boundaries
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                      Read Before Use
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    What this PoC covers and what it does not
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Coverage */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    What's Included
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">15 ESRS datapoints</strong> with GS1 mapping relevance (E2, E5 standards)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">12 GS1 attributes</strong> mapped to ESRS requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">4 regulatory scenarios</strong>: DPP 2027, CS3D, ESPR, EUDR</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">13 sectors</strong> with relevance scoring</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    What's NOT Included
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Full ESRS coverage (1,184 total datapoints exist)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Complete GS1 attribute catalog (hundreds exist)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Social (S) and Governance (G) ESRS standards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>Legal compliance advice or certification</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Epistemic Limitations */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Interpreting Results
                </h4>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 mb-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Fact
                    </Badge>
                    <p className="text-slate-400">
                      Grounded in database records. <strong className="text-slate-300">Limitation:</strong> Database may be incomplete.
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 mb-2">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Inference
                    </Badge>
                    <p className="text-slate-400">
                      Rule-based derivation. <strong className="text-slate-300">Limitation:</strong> Rules are explicit but may not cover all cases.
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 mb-2">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Uncertain
                    </Badge>
                    <p className="text-slate-400">
                      Involves assumptions. <strong className="text-slate-300">Limitation:</strong> Regulatory timelines may change.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Caveat */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-200">
                  <strong>Key Caveat:</strong> A gap not shown does not mean "compliant" — it may simply not be in the curated database. 
                  This PoC demonstrates the <em>reasoning architecture</em>, not comprehensive coverage.
                </p>
              </div>

              {/* Last Updated */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700 pt-4">
                <span>Data as of: December 2024</span>
                <span>Scenarios last updated: December 15, 2024</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Epistemic Framework */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Epistemic Framework
          </h2>
          <p className="text-slate-300 text-center mb-8 max-w-2xl mx-auto">
            Every output is tagged with its epistemic status, making it clear 
            what you can rely on versus what involves assumptions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Fact</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                      High Confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Grounded in database records or official documents. 
                  These are verifiable statements from authoritative sources.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Inference</h3>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                      Medium Confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Derived from rules applied to facts. 
                  Logical conclusions based on established patterns and mappings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Uncertain</h3>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                      Variable Confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Involves assumptions about future states. 
                  Projections that depend on regulatory developments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Two Cores */}
      <div className="container py-16">
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Core 1 */}
          <Card className="bg-gradient-to-br from-slate-800 to-blue-900/50 border-blue-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-1">
                    Core 1
                  </Badge>
                  <CardTitle className="text-white">Compliance Gap Analyzer</CardTitle>
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Present-State Certainty Analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                Analyzes your <strong className="text-green-400">current</strong> GS1 data coverage 
                against ESRS compliance requirements. All findings are grounded in database facts.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Gap identification based on ESRS-GS1 mappings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Priority scoring (critical/high/medium/low)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Remediation path recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Epistemic markers on every output</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/tools/gap-analyzer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Open Gap Analyzer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Core 2 */}
          <Card className="bg-gradient-to-br from-slate-800 to-purple-900/50 border-purple-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-1">
                    Core 2
                  </Badge>
                  <CardTitle className="text-white">Regulatory Impact Simulator</CardTitle>
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Future-State Reasoning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                Simulates the impact of <strong className="text-amber-400">upcoming</strong> regulatory 
                changes on your GS1 readiness. All projections marked as uncertain.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Curated regulatory scenarios (DPP, CS3D, ESPR, EUDR)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Future gap projections with explicit assumptions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>No-regret vs contingent action recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Uncertainty disclaimers on all outputs</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/tools/impact-simulator">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Open Impact Simulator
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Arrow */}
        <div className="flex justify-center my-8">
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700">
            <span className="text-blue-400 font-medium">Core 1 Output</span>
            <ArrowRight className="h-5 w-5 text-slate-500" />
            <span className="text-purple-400 font-medium">Core 2 Input</span>
          </div>
        </div>
      </div>

      {/* Demo Walkthrough */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Demo Walkthrough
          </h2>
          
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Assess Current State (Core 1)</h3>
                    <p className="text-slate-400 mb-3">
                      Start by running the Gap Analyzer to understand your current compliance posture.
                      Select your sector, company size, and current GS1 attribute coverage.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Facts
                      </Badge>
                      <span className="text-slate-500">→ All outputs grounded in database records</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Simulate Future Impact (Core 2)</h3>
                    <p className="text-slate-400 mb-3">
                      Use your Core 1 results as input to the Impact Simulator. Select a regulatory 
                      scenario (DPP 2027, CS3D 2026, etc.) to project future compliance gaps.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Uncertain
                      </Badge>
                      <span className="text-slate-500">→ All projections marked with assumptions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Plan Your Actions</h3>
                    <p className="text-slate-400 mb-3">
                      Review the recommended actions. No-regret actions are safe to implement now.
                      Contingent actions should wait for regulatory clarity.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">No-regret</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400">Contingent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Data Foundation */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Data Foundation
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">ESRS-GS1 Mappings</h3>
                <p className="text-slate-400 text-sm">
                  Curated mappings between ESRS datapoints and GS1 attributes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">GS1 Standards</h3>
                <p className="text-slate-400 text-sm">
                  GDSN attributes, EPCIS events, Digital Link specifications
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Regulatory Scenarios</h3>
                <p className="text-slate-400 text-sm">
                  DPP, CS3D, ESPR, EUDR with explicit assumptions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-slate-300 mb-8">
            Start with the Gap Analyzer to assess your current state, then use the 
            Impact Simulator to plan for the future.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/tools/gap-analyzer">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-5 w-5 mr-2" />
                Core 1: Gap Analyzer
              </Button>
            </Link>
            <Link href="/tools/impact-simulator">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Zap className="h-5 w-5 mr-2" />
                Core 2: Impact Simulator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
