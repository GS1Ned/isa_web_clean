import { useState } from "react";
import { Link } from "wouter";
import { Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const REGULATIONS = ["CSRD", "ESRS", "EUDR", "DPP", "ESPR", "EU_TAXONOMY"];

const GS1_STANDARDS = [
  "GTIN",
  "EPCIS",
  "GLN",
  "Digital Product Passport",
  "QR Code",
  "Traceability",
  "Product Data",
  "Sustainability Claims",
];

// Impact matrix: 1 = REQUIRED, 0.7 = RECOMMENDED, 0.4 = OPTIONAL, 0 = NOT APPLICABLE
const IMPACT_MATRIX: Record<string, Record<string, number>> = {
  CSRD: {
    GTIN: 1,
    EPCIS: 0.7,
    GLN: 1,
    "Digital Product Passport": 0.4,
    "QR Code": 0,
    Traceability: 0.4,
    "Product Data": 1,
    "Sustainability Claims": 1,
  },
  ESRS: {
    GTIN: 1,
    EPCIS: 0.7,
    GLN: 1,
    "Digital Product Passport": 0.4,
    "QR Code": 0,
    Traceability: 0.4,
    "Product Data": 1,
    "Sustainability Claims": 1,
  },
  EUDR: {
    GTIN: 0.7,
    EPCIS: 1,
    GLN: 0.7,
    "Digital Product Passport": 0,
    "QR Code": 0,
    Traceability: 1,
    "Product Data": 0.7,
    "Sustainability Claims": 0,
  },
  DPP: {
    GTIN: 1,
    EPCIS: 0.4,
    GLN: 0.4,
    "Digital Product Passport": 1,
    "QR Code": 1,
    Traceability: 0.4,
    "Product Data": 1,
    "Sustainability Claims": 0.7,
  },
  ESPR: {
    GTIN: 1,
    EPCIS: 0.4,
    GLN: 0.4,
    "Digital Product Passport": 1,
    "QR Code": 1,
    Traceability: 0,
    "Product Data": 1,
    "Sustainability Claims": 1,
  },
  EU_TAXONOMY: {
    GTIN: 0.7,
    EPCIS: 0,
    GLN: 0,
    "Digital Product Passport": 0,
    "QR Code": 0,
    Traceability: 0,
    "Product Data": 0.7,
    "Sustainability Claims": 1,
  },
};

const REGULATION_OVERLAPS: Record<string, string[]> = {
  CSRD: ["ESRS", "DPP", "ESPR"],
  ESRS: ["CSRD", "DPP", "ESPR"],
  EUDR: ["ESPR"],
  DPP: ["CSRD", "ESRS", "ESPR"],
  ESPR: ["CSRD", "ESRS", "EUDR", "DPP"],
  EU_TAXONOMY: ["CSRD", "ESRS"],
};

const getImpactColor = (value: number) => {
  if (value >= 0.9) return "bg-red-500 text-white"; // REQUIRED
  if (value >= 0.6) return "bg-orange-500 text-white"; // RECOMMENDED
  if (value >= 0.3) return "bg-yellow-500 text-white"; // OPTIONAL
  return "bg-gray-200 text-gray-600"; // NOT APPLICABLE
};

const getImpactLabel = (value: number) => {
  if (value >= 0.9) return "REQUIRED";
  if (value >= 0.6) return "RECOMMENDED";
  if (value >= 0.3) return "OPTIONAL";
  return "N/A";
};

export default function HubImpactMatrix() {
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(
    null
  );
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);

  const highlightedRegulations = selectedStandard
    ? GS1_STANDARDS.indexOf(selectedStandard) >= 0
      ? REGULATIONS.filter(reg => IMPACT_MATRIX[reg][selectedStandard] > 0)
      : []
    : selectedRegulation
      ? [selectedRegulation]
      : [];

  const highlightedStandards = selectedRegulation
    ? GS1_STANDARDS.filter(std => IMPACT_MATRIX[selectedRegulation][std] > 0)
    : selectedStandard
      ? [selectedStandard]
      : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/hub"
            className="text-accent hover:text-accent/80 transition font-medium"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-lg font-bold text-foreground">Impact Matrix</h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Regulation Impact Matrix
            </h2>
            <p className="text-muted-foreground">
              Interactive visualization showing which GS1 standards are
              required, recommended, or optional for each ESG regulation. Click
              on a regulation or standard to highlight its relationships.
            </p>
          </div>

          {/* Legend */}
          <div className="mb-8 p-4 rounded-lg bg-card border border-border">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500" />
                <span className="text-sm font-medium">Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500" />
                <span className="text-sm font-medium">Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-500" />
                <span className="text-sm font-medium">Optional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-200" />
                <span className="text-sm font-medium">Not Applicable</span>
              </div>
            </div>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-card border border-border p-3 text-left font-semibold text-foreground z-10">
                    GS1 Standard
                  </th>
                  {REGULATIONS.map(reg => (
                    <th
                      key={reg}
                      onClick={() =>
                        setSelectedRegulation(
                          selectedRegulation === reg ? null : reg
                        )
                      }
                      className={`border border-border p-3 text-center font-semibold cursor-pointer transition ${
                        highlightedRegulations.includes(reg)
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-foreground hover:bg-accent/10"
                      }`}
                    >
                      <div className="text-sm">{reg}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GS1_STANDARDS.map(standard => (
                  <tr key={standard}>
                    <td
                      onClick={() =>
                        setSelectedStandard(
                          selectedStandard === standard ? null : standard
                        )
                      }
                      className={`sticky left-0 border border-border p-3 font-medium cursor-pointer transition z-10 ${
                        highlightedStandards.includes(standard)
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-foreground hover:bg-accent/10"
                      }`}
                    >
                      {standard}
                    </td>
                    {REGULATIONS.map(reg => {
                      const impact = IMPACT_MATRIX[reg][standard];
                      const isHighlighted =
                        highlightedRegulations.includes(reg) ||
                        highlightedStandards.includes(standard);

                      return (
                        <td
                          key={`${reg}-${standard}`}
                          className={`border border-border p-3 text-center transition ${
                            isHighlighted ? "ring-2 ring-accent" : ""
                          }`}
                        >
                          <div
                            className={`inline-block px-3 py-2 rounded font-medium text-xs ${getImpactColor(impact)}`}
                          >
                            {getImpactLabel(impact)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Regulation Overlaps Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Regulation Overlaps & Dependencies
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {REGULATIONS.map(reg => (
                <div key={reg} className="card-elevated p-6">
                  <h4 className="font-semibold text-foreground mb-3">{reg}</h4>
                  <div className="flex flex-wrap gap-2">
                    {REGULATION_OVERLAPS[reg].length > 0 ? (
                      REGULATION_OVERLAPS[reg].map(overlap => (
                        <span
                          key={overlap}
                          className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium"
                        >
                          {overlap}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No overlaps
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {REGULATION_OVERLAPS[reg].length} overlapping regulation
                    {REGULATION_OVERLAPS[reg].length !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Key Insights
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    • <strong>GTIN</strong> is required by 5 out of 6
                    regulations - the most critical standard
                  </li>
                  <li>
                    • <strong>Digital Product Passport</strong> is required by
                    DPP and ESPR, recommended by CSRD/ESRS
                  </li>
                  <li>
                    • <strong>EPCIS</strong> is essential for EUDR compliance
                    and supply chain traceability
                  </li>
                  <li>
                    • <strong>Product Data</strong> standards satisfy
                    requirements across all major regulations
                  </li>
                  <li>
                    • Implementing standards for CSRD/ESRS and ESPR together
                    creates significant synergies
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex gap-3">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Download className="w-4 h-4 mr-2" />
              Download Matrix (PDF)
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Matrix (CSV)
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect - ESG Regulations Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
