// @ts-nocheck
import { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { jsPDF } from "jspdf";

interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate?: string;
  completed: boolean;
  regulationId?: number;
}

interface ChecklistPhase {
  id: string;
  title: string;
  description: string;
  tasks: ChecklistTask[];
  expanded: boolean;
}

// Predefined checklist templates based on regulation types
const CHECKLIST_TEMPLATES: Record<string, ChecklistPhase[]> = {
  CSRD: [
    {
      id: "csrd-1",
      title: "Phase 1: Scoping & Assessment",
      description: "Determine applicability and assess current state",
      expanded: true,
      tasks: [
        { id: "csrd-1-1", title: "Determine CSRD applicability", description: "Verify if your company meets the CSRD thresholds (employees, turnover, balance sheet)", priority: "HIGH", completed: false },
        { id: "csrd-1-2", title: "Identify reporting standards", description: "Determine which ESRS standards apply to your organization", priority: "HIGH", completed: false },
        { id: "csrd-1-3", title: "Conduct double materiality assessment", description: "Assess both impact and financial materiality of ESG topics", priority: "HIGH", completed: false },
        { id: "csrd-1-4", title: "Map current data sources", description: "Inventory existing sustainability data collection processes", priority: "MEDIUM", completed: false },
        { id: "csrd-1-5", title: "Identify data gaps", description: "Compare current data availability against ESRS requirements", priority: "MEDIUM", completed: false },
      ],
    },
    {
      id: "csrd-2",
      title: "Phase 2: Data Collection & Systems",
      description: "Establish data collection infrastructure",
      expanded: false,
      tasks: [
        { id: "csrd-2-1", title: "Define data governance framework", description: "Establish roles, responsibilities, and processes for ESG data", priority: "HIGH", completed: false },
        { id: "csrd-2-2", title: "Implement GS1 standards for traceability", description: "Deploy GTIN, EPCIS, and Digital Link for product-level data", priority: "MEDIUM", completed: false },
        { id: "csrd-2-3", title: "Set up data collection systems", description: "Implement or configure systems for ESG data capture", priority: "HIGH", completed: false },
        { id: "csrd-2-4", title: "Establish supplier data processes", description: "Create processes for collecting value chain data", priority: "MEDIUM", completed: false },
        { id: "csrd-2-5", title: "Validate data quality", description: "Implement data quality checks and validation rules", priority: "MEDIUM", completed: false },
      ],
    },
    {
      id: "csrd-3",
      title: "Phase 3: Reporting & Assurance",
      description: "Prepare and submit CSRD-compliant report",
      expanded: false,
      tasks: [
        { id: "csrd-3-1", title: "Prepare sustainability statement", description: "Draft CSRD-compliant sustainability report content", priority: "HIGH", completed: false },
        { id: "csrd-3-2", title: "Apply ESRS disclosure requirements", description: "Ensure all mandatory disclosures are addressed", priority: "HIGH", completed: false },
        { id: "csrd-3-3", title: "Integrate with annual report", description: "Include sustainability statement in management report", priority: "HIGH", completed: false },
        { id: "csrd-3-4", title: "Engage assurance provider", description: "Select and engage auditor for limited assurance", priority: "MEDIUM", completed: false },
        { id: "csrd-3-5", title: "Submit to authorities", description: "File report with relevant regulatory authorities", priority: "HIGH", completed: false },
      ],
    },
  ],
  EUDR: [
    {
      id: "eudr-1",
      title: "Phase 1: Product Assessment",
      description: "Identify products in scope of EUDR",
      expanded: true,
      tasks: [
        { id: "eudr-1-1", title: "Identify in-scope commodities", description: "Determine which products contain cattle, cocoa, coffee, palm oil, rubber, soya, or wood", priority: "HIGH", completed: false },
        { id: "eudr-1-2", title: "Map supply chains", description: "Trace supply chains to country of production", priority: "HIGH", completed: false },
        { id: "eudr-1-3", title: "Assess deforestation risk", description: "Evaluate risk levels for each supply chain", priority: "HIGH", completed: false },
        { id: "eudr-1-4", title: "Collect geolocation data", description: "Obtain GPS coordinates for production plots", priority: "MEDIUM", completed: false },
      ],
    },
    {
      id: "eudr-2",
      title: "Phase 2: Due Diligence System",
      description: "Establish EUDR due diligence processes",
      expanded: false,
      tasks: [
        { id: "eudr-2-1", title: "Implement due diligence system", description: "Establish processes for information collection and risk assessment", priority: "HIGH", completed: false },
        { id: "eudr-2-2", title: "Deploy GS1 traceability standards", description: "Use EPCIS and Digital Link for product traceability", priority: "MEDIUM", completed: false },
        { id: "eudr-2-3", title: "Establish risk mitigation measures", description: "Define actions for non-negligible risk situations", priority: "HIGH", completed: false },
        { id: "eudr-2-4", title: "Create documentation system", description: "Maintain records for 5 years as required", priority: "MEDIUM", completed: false },
      ],
    },
    {
      id: "eudr-3",
      title: "Phase 3: Compliance & Reporting",
      description: "Submit due diligence statements",
      expanded: false,
      tasks: [
        { id: "eudr-3-1", title: "Prepare due diligence statements", description: "Create statements for each product placement", priority: "HIGH", completed: false },
        { id: "eudr-3-2", title: "Submit to EU Information System", description: "File statements through the EU portal", priority: "HIGH", completed: false },
        { id: "eudr-3-3", title: "Maintain ongoing monitoring", description: "Continuously monitor supply chain compliance", priority: "MEDIUM", completed: false },
      ],
    },
  ],
  DPP: [
    {
      id: "dpp-1",
      title: "Phase 1: Product Data Assessment",
      description: "Assess product data readiness for Digital Product Passport",
      expanded: true,
      tasks: [
        { id: "dpp-1-1", title: "Identify DPP-applicable products", description: "Determine which products require Digital Product Passports", priority: "HIGH", completed: false },
        { id: "dpp-1-2", title: "Audit current product data", description: "Review existing product information and data quality", priority: "HIGH", completed: false },
        { id: "dpp-1-3", title: "Map data requirements", description: "Identify required data elements for each product category", priority: "MEDIUM", completed: false },
        { id: "dpp-1-4", title: "Assess GS1 standards adoption", description: "Evaluate current use of GTIN, GLN, and other identifiers", priority: "MEDIUM", completed: false },
      ],
    },
    {
      id: "dpp-2",
      title: "Phase 2: Infrastructure Setup",
      description: "Implement DPP technical infrastructure",
      expanded: false,
      tasks: [
        { id: "dpp-2-1", title: "Implement GS1 Digital Link", description: "Deploy Digital Link resolvers for product identification", priority: "HIGH", completed: false },
        { id: "dpp-2-2", title: "Set up data carrier strategy", description: "Choose and implement QR codes or other data carriers", priority: "HIGH", completed: false },
        { id: "dpp-2-3", title: "Establish data hosting", description: "Set up infrastructure for hosting DPP data", priority: "MEDIUM", completed: false },
        { id: "dpp-2-4", title: "Integrate with supply chain systems", description: "Connect DPP with existing ERP and PLM systems", priority: "MEDIUM", completed: false },
      ],
    },
    {
      id: "dpp-3",
      title: "Phase 3: Deployment & Compliance",
      description: "Roll out Digital Product Passports",
      expanded: false,
      tasks: [
        { id: "dpp-3-1", title: "Populate product passports", description: "Enter required data for all applicable products", priority: "HIGH", completed: false },
        { id: "dpp-3-2", title: "Test consumer access", description: "Verify passport accessibility via scanning", priority: "MEDIUM", completed: false },
        { id: "dpp-3-3", title: "Train stakeholders", description: "Educate internal teams and supply chain partners", priority: "MEDIUM", completed: false },
        { id: "dpp-3-4", title: "Monitor and update", description: "Establish processes for ongoing passport maintenance", priority: "LOW", completed: false },
      ],
    },
  ],
};

const INDUSTRY_SECTORS = [
  { value: "retail", label: "Retail & Consumer Goods" },
  { value: "food", label: "Food & Beverage" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "logistics", label: "Logistics & Transport" },
  { value: "healthcare", label: "Healthcare & Pharma" },
  { value: "textiles", label: "Textiles & Fashion" },
  { value: "electronics", label: "Electronics" },
  { value: "construction", label: "Construction & Building" },
];

export function ComplianceChecklistGenerator() {
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [checklist, setChecklist] = useState<ChecklistPhase[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  // Fetch available regulations
  const { data: regulations } = trpc.regulations.list.useQuery({ limit: 50 });

  // Generate checklist based on selected regulations
  const generateChecklist = () => {
    const phases: ChecklistPhase[] = [];
    
    selectedRegulations.forEach(regType => {
      const template = CHECKLIST_TEMPLATES[regType];
      if (template) {
        template.forEach(phase => {
          phases.push({
            ...phase,
            id: `${regType}-${phase.id}`,
            title: `[${regType}] ${phase.title}`,
            tasks: phase.tasks.map(task => ({
              ...task,
              id: `${regType}-${task.id}`,
            })),
          });
        });
      }
    });

    setChecklist(phases);
    setIsGenerated(true);
  };

  // Toggle task completion
  const toggleTask = (phaseId: string, taskId: string) => {
    setChecklist(prev =>
      prev.map(phase =>
        phase.id === phaseId
          ? {
              ...phase,
              tasks: phase.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : phase
      )
    );
  };

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setChecklist(prev =>
      prev.map(phase =>
        phase.id === phaseId ? { ...phase, expanded: !phase.expanded } : phase
      )
    );
  };

  // Calculate progress
  const calculateProgress = () => {
    const allTasks = checklist.flatMap(phase => phase.tasks);
    const completedTasks = allTasks.filter(task => task.completed);
    return allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Compliance Checklist", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 5;
    doc.text(`Regulations: ${selectedRegulations.join(", ")}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Progress
    const progress = calculateProgress();
    doc.setFontSize(14);
    doc.text(`Overall Progress: ${progress.toFixed(0)}%`, 15, yPosition);
    yPosition += 15;

    // Phases and tasks
    checklist.forEach(phase => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(phase.title, 15, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      phase.tasks.forEach(task => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }

        const checkbox = task.completed ? "[X]" : "[ ]";
        const priority = `(${task.priority})`;
        const text = `${checkbox} ${task.title} ${priority}`;
        
        const lines = doc.splitTextToSize(text, pageWidth - 30);
        lines.forEach((line: string) => {
          doc.text(line, 20, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      });

      yPosition += 5;
    });

    doc.save("compliance-checklist.pdf");
  };

  const progress = calculateProgress();
  const totalTasks = checklist.flatMap(p => p.tasks).length;
  const completedTasks = checklist.flatMap(p => p.tasks).filter(t => t.completed).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckSquare className="w-8 h-8 text-blue-600" />
          Compliance Checklist Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Generate a customized compliance checklist based on applicable regulations and your industry sector
        </p>
      </div>

      {/* Configuration Card */}
      {!isGenerated && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Your Checklist</CardTitle>
            <CardDescription>
              Select the regulations that apply to your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Industry Sector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Industry Sector</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select your industry sector" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_SECTORS.map(sector => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Regulation Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Applicable Regulations</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.keys(CHECKLIST_TEMPLATES).map(regType => (
                  <div
                    key={regType}
                    onClick={() => {
                      setSelectedRegulations(prev =>
                        prev.includes(regType)
                          ? prev.filter(r => r !== regType)
                          : [...prev, regType]
                      );
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRegulations.includes(regType)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedRegulations.includes(regType) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">{regType}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {regType === "CSRD" && "Corporate Sustainability Reporting Directive"}
                      {regType === "EUDR" && "EU Deforestation Regulation"}
                      {regType === "DPP" && "Digital Product Passport"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateChecklist}
              disabled={selectedRegulations.length === 0}
              className="w-full md:w-auto"
              size="lg"
            >
              <CheckSquare className="w-5 h-5 mr-2" />
              Generate Checklist
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Checklist */}
      {isGenerated && (
        <>
          {/* Progress Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Overall Progress</h3>
                  <p className="text-sm text-gray-600">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsGenerated(false)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconfigure
                  </Button>
                  <Button onClick={exportToPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>0%</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* Regulation Badges */}
          <div className="flex gap-2 flex-wrap">
            {selectedRegulations.map(reg => (
              <Badge key={reg} variant="secondary" className="text-sm">
                <FileText className="w-3 h-3 mr-1" />
                {reg}
              </Badge>
            ))}
            {selectedSector && (
              <Badge variant="outline" className="text-sm">
                <Building2 className="w-3 h-3 mr-1" />
                {INDUSTRY_SECTORS.find(s => s.value === selectedSector)?.label}
              </Badge>
            )}
          </div>

          {/* Checklist Phases */}
          <div className="space-y-4">
            {checklist.map(phase => {
              const phaseCompleted = phase.tasks.filter(t => t.completed).length;
              const phaseTotal = phase.tasks.length;
              const phaseProgress = phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0;

              return (
                <Card key={phase.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {phase.expanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{phase.title}</CardTitle>
                          <CardDescription>{phase.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {phaseCompleted}/{phaseTotal}
                        </span>
                        {phaseProgress === 100 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : phaseProgress > 0 ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <Progress value={phaseProgress} className="h-1 mt-2" />
                  </CardHeader>

                  {phase.expanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {phase.tasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(phase.id, task.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              task.completed
                                ? "bg-green-50 border-green-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {task.completed ? (
                                <CheckSquare className="w-5 h-5 text-green-600 mt-0.5" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-medium ${
                                      task.completed ? "line-through text-gray-500" : ""
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  <Badge
                                    variant={
                                      task.priority === "HIGH"
                                        ? "destructive"
                                        : task.priority === "MEDIUM"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
