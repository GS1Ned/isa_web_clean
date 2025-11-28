import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Calendar, BookOpen, HelpCircle, Save, Bell } from "lucide-react";
import { Link } from "wouter";

// Sample regulation data
const REGULATION_DATA = {
  id: 1,
  code: "CSRD",
  title: "Corporate Sustainability Reporting Directive",
  description: "The CSRD requires large EU companies to disclose their sustainability performance and impacts.",
  status: "ACTIVE",
  effectiveDate: "2024-01-01",
  implementationDate: "2025-01-01",
  enforcementDate: "2026-01-01",
  scope: "Large companies (250+ employees, €50M+ revenue, €25M+ assets)",
  
  timeline: [
    {
      date: "2024-01-01",
      event: "CSRD Effective",
      description: "Directive enters into force",
      status: "completed",
    },
    {
      date: "2025-01-01",
      event: "First Reporting Period",
      description: "Large companies begin reporting under CSRD",
      status: "upcoming",
    },
    {
      date: "2026-01-01",
      event: "Enforcement Begins",
      description: "Regulatory enforcement of CSRD requirements",
      status: "future",
    },
    {
      date: "2028-01-01",
      event: "SME Scope Expansion",
      description: "Extended to small and medium-sized enterprises",
      status: "future",
    },
  ],

  relatedStandards: [
    {
      code: "GTIN",
      name: "Global Trade Item Number",
      relevance: "Required for product identification and traceability",
      impact: "HIGH",
    },
    {
      code: "EPCIS",
      name: "Electronic Product Code Information Services",
      relevance: "Enables supply chain visibility and sustainability tracking",
      impact: "HIGH",
    },
    {
      code: "Digital Link",
      name: "GS1 Digital Link",
      relevance: "Connects physical products to digital sustainability data",
      impact: "MEDIUM",
    },
    {
      code: "DPP",
      name: "Digital Product Passport",
      relevance: "Provides product-level sustainability information",
      impact: "MEDIUM",
    },
  ],

  implementationChecklist: [
    {
      phase: "Assessment (Q1 2024)",
      tasks: [
        "Identify scope: Does your company fall under CSRD?",
        "Review current sustainability data collection processes",
        "Assess gaps in ESG reporting capabilities",
        "Evaluate GS1 standards adoption",
      ],
    },
    {
      phase: "Planning (Q2-Q3 2024)",
      tasks: [
        "Define sustainability KPIs and metrics",
        "Map GS1 standards to reporting requirements",
        "Establish data governance processes",
        "Plan system integrations",
      ],
    },
    {
      phase: "Implementation (Q4 2024 - Q2 2025)",
      tasks: [
        "Deploy GS1 standards (GTIN, EPCIS, Digital Link)",
        "Implement data collection systems",
        "Train teams on new processes",
        "Conduct pilot reporting",
      ],
    },
    {
      phase: "Reporting (Q3-Q4 2025)",
      tasks: [
        "Compile sustainability data",
        "Prepare CSRD-compliant report",
        "Third-party assurance review",
        "Submit report to authorities",
      ],
    },
  ],

  faq: [
    {
      question: "Who must comply with CSRD?",
      answer: "Large EU companies with 250+ employees, €50M+ revenue, or €25M+ assets. The scope will expand to SMEs by 2028.",
    },
    {
      question: "How do GS1 standards help with CSRD compliance?",
      answer: "GS1 standards enable standardized data collection and reporting on supply chain sustainability, product traceability, and environmental impact.",
    },
    {
      question: "What is the implementation timeline?",
      answer: "CSRD is effective from January 1, 2024. First reporting period begins January 1, 2025. Enforcement starts January 1, 2026.",
    },
    {
      question: "Can we use existing sustainability data?",
      answer: "Partially. You'll need to map existing data to CSRD requirements and may need to enhance collection using GS1 standards for supply chain visibility.",
    },
    {
      question: "What are the penalties for non-compliance?",
      answer: "Penalties vary by member state but can include fines up to 5% of net turnover and reputational damage.",
    },
  ],
};

export default function HubRegulationDetailEnhanced() {
  const [isSaved, setIsSaved] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const reg = REGULATION_DATA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/hub/regulations" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Regulations
          </Link>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-sm font-semibold text-blue-600 mb-2">{reg.code}</div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{reg.title}</h1>
              <p className="text-lg text-slate-600">{reg.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant={hasAlert ? "default" : "outline"}
                size="sm"
                onClick={() => setHasAlert(!hasAlert)}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                {hasAlert ? "Alert On" : "Alert"}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="text-sm text-slate-600 mb-1">Status</div>
            <div className="text-2xl font-bold text-slate-900">{reg.status}</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm text-slate-600 mb-1">Effective Date</div>
            <div className="text-2xl font-bold text-slate-900">{new Date(reg.effectiveDate).toLocaleDateString()}</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="text-sm text-slate-600 mb-1">Implementation</div>
            <div className="text-2xl font-bold text-slate-900">{new Date(reg.implementationDate).toLocaleDateString()}</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Implementation Timeline</h3>
              <div className="space-y-6">
                {reg.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'upcoming' ? 'bg-blue-500' :
                        'bg-slate-300'
                      }`} />
                      {idx < reg.timeline.length - 1 && (
                        <div className="w-1 h-20 bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-slate-600" />
                        <div className="font-semibold text-slate-900">{item.date}</div>
                      </div>
                      <div className="text-lg font-bold text-slate-900 mb-1">{item.event}</div>
                      <div className="text-slate-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Standards Tab */}
          <TabsContent value="standards" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Related GS1 Standards</h3>
              <div className="space-y-4">
                {reg.relatedStandards.map((std, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-slate-900">{std.code}: {std.name}</div>
                        <div className="text-slate-600 mt-1">{std.relevance}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        std.impact === 'HIGH' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {std.impact} Impact
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Implementation Checklist</h3>
              <div className="space-y-6">
                {reg.implementationChecklist.map((phase, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                      <h4 className="font-bold text-slate-900">{phase.phase}</h4>
                    </div>
                    <div className="ml-9 space-y-2">
                      {phase.tasks.map((task, tidx) => (
                        <label key={tidx} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-slate-700">{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {reg.faq.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
                    <div className="flex items-start gap-3 mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="font-bold text-slate-900">{item.question}</div>
                    </div>
                    <div className="ml-8 text-slate-600">{item.answer}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Resources */}
        <Card className="p-8 mt-8 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Related Resources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a href="#" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">CSRD Implementation Guide</div>
                <div className="text-sm text-slate-600">Download PDF</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">GS1 Standards Mapping</div>
                <div className="text-sm text-slate-600">Download Excel</div>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
