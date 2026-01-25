import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const SAMPLE_REGULATIONS = [
  {
    id: 1,
    name: "CSRD (Corporate Sustainability Reporting Directive)",
    code: "CSRD",
  },
  {
    id: 2,
    name: "ESRS (European Sustainability Reporting Standards)",
    code: "ESRS",
  },
  { id: 3, name: "DPP (Digital Product Passport)", code: "DPP" },
  { id: 4, name: "EUDR (EU Deforestation Regulation)", code: "EUDR" },
  {
    id: 5,
    name: "PPWR (Packaging and Packaging Waste Regulation)",
    code: "PPWR",
  },
  {
    id: 6,
    name: "ESPR (Ecodesign for Sustainable Products Regulation)",
    code: "ESPR",
  },
];

const COMPARISON_DATA: Record<string, Record<string, any>> = {
  "1-2": {
    overlappingStandards: ["GTIN", "EPCIS", "Digital Link"],
    sharedDeadlines: ["Jan 1, 2025", "Jan 1, 2026"],
    complementary: "ESRS provides detailed metrics that CSRD requires",
    dependencies: "CSRD mandates ESRS compliance for large companies",
  },
  "1-3": {
    overlappingStandards: ["GTIN", "Digital Link", "Barcode"],
    sharedDeadlines: ["Jan 1, 2026"],
    complementary: "DPP provides product-level data that CSRD aggregates",
    dependencies: "CSRD scope includes DPP requirements for certain products",
  },
  "2-4": {
    overlappingStandards: ["EPCIS", "Digital Link"],
    sharedDeadlines: ["Dec 30, 2024"],
    complementary: "EUDR focuses on deforestation; ESRS covers broader ESG",
    dependencies: "EUDR data feeds into ESRS supply chain reporting",
  },
  "3-5": {
    overlappingStandards: ["GTIN", "Digital Link", "Barcode"],
    sharedDeadlines: ["Jan 1, 2026"],
    complementary: "PPWR covers packaging; DPP covers product information",
    dependencies: "DPP may include packaging information per PPWR",
  },
};

export default function HubCompare() {
  const [selectedReg1, setSelectedReg1] = useState<number | null>(null);
  const [selectedReg2, setSelectedReg2] = useState<number | null>(null);

  const getComparisonKey = () => {
    if (!selectedReg1 || !selectedReg2) return null;
    const [min, max] = [selectedReg1, selectedReg2].sort();
    return `${min}-${max}`;
  };

  const comparisonKey = getComparisonKey();
  const comparison = comparisonKey ? COMPARISON_DATA[comparisonKey] : null;

  const reg1 = SAMPLE_REGULATIONS.find(r => r.id === selectedReg1);
  const reg2 = SAMPLE_REGULATIONS.find(r => r.id === selectedReg2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/hub"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Regulation Comparison Tool
          </h1>
          <p className="text-lg text-slate-600">
            Compare two EU ESG regulations to understand overlapping
            requirements, shared deadlines, and complementary obligations.
          </p>
        </div>

        {/* Selector Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left Regulation */}
          <Card className="p-6 border-2 border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Select First Regulation
            </h3>
            <div className="space-y-2">
              {SAMPLE_REGULATIONS.map(reg => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedReg1(reg.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedReg1 === reg.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  <div className="font-medium text-slate-900">{reg.code}</div>
                  <div className="text-sm text-slate-600">{reg.name}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Right Regulation */}
          <Card className="p-6 border-2 border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Select Second Regulation
            </h3>
            <div className="space-y-2">
              {SAMPLE_REGULATIONS.map(reg => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedReg2(reg.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedReg2 === reg.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  <div className="font-medium text-slate-900">{reg.code}</div>
                  <div className="text-sm text-slate-600">{reg.name}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Comparison Results */}
        {comparison && reg1 && reg2 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg p-8 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">
                    Regulation 1
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {reg1.code}
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 text-blue-500" />
                <div className="text-right">
                  <div className="text-sm text-slate-600 mb-1">
                    Regulation 2
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {reg2.code}
                  </div>
                </div>
              </div>
              <p className="text-slate-600">
                Comparing <strong>{reg1.name}</strong> with{" "}
                <strong>{reg2.name}</strong>
              </p>
            </div>

            {/* Overlapping Standards */}
            <Card className="p-8 border-2 border-green-200 bg-green-50">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    Overlapping GS1 Standards
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {comparison.overlappingStandards.map((standard: string) => (
                      <div
                        key={standard}
                        className="bg-white rounded-lg p-3 border border-green-300 text-center font-medium text-slate-900"
                      >
                        {standard}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Shared Deadlines */}
            <Card className="p-8 border-2 border-orange-200 bg-orange-50">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    Shared Implementation Deadlines
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {comparison.sharedDeadlines.map((deadline: string) => (
                      <div
                        key={deadline}
                        className="bg-white rounded-lg p-3 border border-orange-300 text-center font-medium text-slate-900"
                      >
                        {deadline}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Complementary Requirements */}
            <Card className="p-8 border-2 border-blue-200 bg-blue-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Complementary Requirements
              </h3>
              <p className="text-lg text-slate-700 leading-relaxed">
                {comparison.complementary}
              </p>
            </Card>

            {/* Dependencies */}
            <Card className="p-8 border-2 border-purple-200 bg-purple-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Regulatory Dependencies
              </h3>
              <p className="text-lg text-slate-700 leading-relaxed">
                {comparison.dependencies}
              </p>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="default" size="lg">
                View Detailed Analysis
              </Button>
              <Button variant="outline" size="lg">
                Export Comparison
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparison && (
          <Card className="p-12 text-center border-2 border-dashed border-slate-300">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg text-slate-600">
              Select two regulations to compare their requirements and
              dependencies.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
