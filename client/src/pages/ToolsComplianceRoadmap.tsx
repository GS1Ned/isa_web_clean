import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Rocket,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Sparkles,
} from "lucide-react";

export default function ToolsComplianceRoadmap() {
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState<"sme" | "large">("large");
  const [currentMaturity, setCurrentMaturity] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);

  const { data: sectors } = trpc.esrsRoadmap.getSectors.useQuery();
  const { data: esrsRequirements } = trpc.esrsRoadmap.getEsrsRequirements.useQuery();
  const generateRoadmap = trpc.esrsRoadmap.generate.useMutation();

  const handleRequirementToggle = (requirementId: string) => {
    setSelectedRequirements((prev) =>
      prev.includes(requirementId)
        ? prev.filter((id) => id !== requirementId)
        : [...prev, requirementId]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSector || selectedRequirements.length === 0) {
      return;
    }

    const result = await generateRoadmap.mutateAsync({
      sector: selectedSector,
      esrsRequirements: selectedRequirements,
      companySize,
      currentMaturity,
    });

    setGeneratedRoadmap(result);
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case "quick_win":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium_term":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "long_term":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Target className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  // Group phases by timeframe
  const groupedPhases = generatedRoadmap?.phases.reduce((acc: any, phase: any) => {
    if (!acc[phase.timeframe]) {
      acc[phase.timeframe] = [];
    }
    acc[phase.timeframe].push(phase);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-10 w-10" />
            <h1 className="text-4xl font-bold">ESRS-GS1 Compliance Roadmap Generator</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            Generate a personalized implementation timeline for ESRS compliance using GS1 standards.
            Get actionable steps tailored to your sector and maturity level.
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Configuration
              </h2>

              {/* Sector Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Industry Sector</label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        <span className="flex items-center gap-2">
                          <span>{sector.icon}</span>
                          <span>{sector.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <Select value={companySize} onValueChange={(v: any) => setCompanySize(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sme">SME (&lt;250 employees)</SelectItem>
                    <SelectItem value="large">Large (&gt;250 employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Maturity */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Current Maturity Level</label>
                <Select value={currentMaturity} onValueChange={(v: any) => setCurrentMaturity(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No GS1 standards yet)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Basic GTINs/GLNs)</SelectItem>
                    <SelectItem value="advanced">Advanced (EPCIS/GDSN in use)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ESRS Requirements */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  ESRS Requirements ({selectedRequirements.length} selected)
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto border rounded-md p-3">
                  {esrsRequirements?.map((req) => (
                    <div key={req.id} className="flex items-start gap-2">
                      <Checkbox
                        id={req.id}
                        checked={selectedRequirements.includes(req.id)}
                        onCheckedChange={() => handleRequirementToggle(req.id)}
                      />
                      <label htmlFor={req.id} className="text-sm cursor-pointer flex-1">
                        <div className="font-medium">{req.id}</div>
                        <div className="text-gray-600">{req.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {req.category}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!selectedSector || selectedRequirements.length === 0 || generateRoadmap.isPending}
                className="w-full"
                size="lg"
              >
                {generateRoadmap.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Generate Roadmap
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Roadmap Display */}
          <div className="lg:col-span-2">
            {!generatedRoadmap && (
              <Card className="p-12 text-center">
                <Rocket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Ready to Build Your Roadmap
                </h3>
                <p className="text-gray-600">
                  Select your sector and ESRS requirements, then click "Generate Roadmap" to get
                  started.
                </p>
              </Card>
            )}

            {generatedRoadmap && (
              <div className="space-y-6">
                {/* Roadmap Header */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {sectors?.find((s) => s.id === selectedSector)?.name} Compliance Roadmap
                      </h2>
                      <p className="text-gray-600">{generatedRoadmap.summary}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedRoadmap.phases.length}
                      </div>
                      <div className="text-sm text-gray-600">Phases</div>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">
                        {generatedRoadmap.totalDuration}
                      </div>
                      <div className="text-sm text-gray-600">Total Duration</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedRequirements.length}
                      </div>
                      <div className="text-sm text-gray-600">ESRS Requirements</div>
                    </div>
                  </div>
                </Card>

                {/* Quick Wins */}
                {groupedPhases?.quick_win && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Quick Wins (0-3 months)
                    </h3>
                    <div className="space-y-4">
                      {groupedPhases.quick_win.map((phase: any) => (
                        <PhaseCard key={phase.id} phase={phase} getTimeframeColor={getTimeframeColor} getPriorityIcon={getPriorityIcon} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Medium-Term */}
                {groupedPhases?.medium_term && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Medium-Term Initiatives (3-12 months)
                    </h3>
                    <div className="space-y-4">
                      {groupedPhases.medium_term.map((phase: any) => (
                        <PhaseCard key={phase.id} phase={phase} getTimeframeColor={getTimeframeColor} getPriorityIcon={getPriorityIcon} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Long-Term */}
                {groupedPhases?.long_term && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Long-Term Transformation (12+ months)
                    </h3>
                    <div className="space-y-4">
                      {groupedPhases.long_term.map((phase: any) => (
                        <PhaseCard key={phase.id} phase={phase} getTimeframeColor={getTimeframeColor} getPriorityIcon={getPriorityIcon} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ phase, getTimeframeColor, getPriorityIcon }: any) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getPriorityIcon(phase.priority)}
            <h4 className="text-lg font-semibold">{phase.title}</h4>
          </div>
          <p className="text-gray-600 mb-4">{phase.description}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge className={getTimeframeColor(phase.timeframe)}>
            {phase.duration}
          </Badge>
          <Badge variant="outline">{phase.priority} priority</Badge>
        </div>
      </div>

      {/* GS1 Attributes */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">GS1 Attributes to Implement:</div>
        <div className="flex flex-wrap gap-2">
          {phase.gs1Attributes.map((attr: string, idx: number) => (
            <Badge key={idx} variant="secondary">
              {attr}
            </Badge>
          ))}
        </div>
      </div>

      {/* Implementation Steps */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Implementation Steps:</div>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          {phase.implementationSteps.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Effort:</span> {phase.estimatedEffort}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Outcome:</span> {phase.expectedOutcome}
        </div>
      </div>

      {phase.dependencies.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Dependencies:</span> {phase.dependencies.join(", ")}
        </div>
      )}
    </Card>
  );
}
