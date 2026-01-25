import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Grid3x3, List, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const STANDARDS_MAPPING = [
  {
    standardCode: "GTIN",
    standardName: "Global Trade Item Number",
    description: "Unique identifier for products in supply chain",
    regulations: ["CSRD", "ESRS", "DPP", "EUDR", "ESPR"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Use GTIN-13 or GTIN-14 for product identification in all regulatory reports.",
  },
  {
    standardCode: "EPCIS",
    standardName: "Electronic Product Code Information Services",
    description: "Track and trace products through supply chain",
    regulations: ["EUDR", "ESRS", "DPP"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Implement EPCIS 2.0 for real-time supply chain visibility and deforestation tracking.",
  },
  {
    standardCode: "GLN",
    standardName: "Global Location Number",
    description: "Identify locations in supply chain",
    regulations: ["CSRD", "ESRS", "EUDR"],
    requiredLevel: "RECOMMENDED",
    implementationGuide:
      "Use GLN to identify all facilities involved in product manufacturing and distribution.",
  },
  {
    standardCode: "Digital Product Passport",
    standardName: "Digital Product Passport (DPP)",
    description: "Digital record of product sustainability and compliance data",
    regulations: ["DPP", "ESPR", "CSRD"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Implement DPP using QR codes, blockchain, or digital platforms for product-level data.",
  },
  {
    standardCode: "QR Code",
    standardName: "QR Code / 2D Barcode",
    description: "Link physical products to digital information",
    regulations: ["DPP", "ESPR"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Use GS1 QR Code format to link products to Digital Product Passports.",
  },
  {
    standardCode: "Traceability",
    standardName: "GS1 Traceability Standards",
    description: "Track product origin and supply chain journey",
    regulations: ["EUDR", "ESRS", "DPP"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Implement GS1 traceability to demonstrate deforestation-free sourcing.",
  },
  {
    standardCode: "Product Data",
    standardName: "GS1 Product Data Standards",
    description: "Standardized product information and attributes",
    regulations: ["CSRD", "ESRS", "ESPR", "DPP"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Use GS1 product data standards for sustainability claims and compliance reporting.",
  },
  {
    standardCode: "Sustainability Claims",
    standardName: "GS1 Sustainability Claims Standard",
    description: "Verified sustainability and environmental claims",
    regulations: ["ESRS", "ESPR", "EU_TAXONOMY"],
    requiredLevel: "REQUIRED",
    implementationGuide:
      "Ensure all sustainability claims are verifiable and backed by GS1 standards.",
  },
];

const LEVEL_COLORS = {
  REQUIRED: "bg-red-100 text-red-800",
  RECOMMENDED: "bg-yellow-100 text-yellow-800",
  OPTIONAL: "bg-green-100 text-green-800",
};

const _LEVEL_ICONS = {
  REQUIRED: <AlertCircle className="w-4 h-4" />,
  RECOMMENDED: <AlertCircle className="w-4 h-4" />,
  OPTIONAL: <CheckCircle className="w-4 h-4" />,
};

export default function HubStandardsMapping() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(
    null
  );

  const filteredStandards = useMemo(() => {
    return STANDARDS_MAPPING.filter(std => {
      const matchesSearch =
        std.standardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        std.standardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        std.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegulation =
        !selectedRegulation || std.regulations.includes(selectedRegulation);

      return matchesSearch && matchesRegulation;
    });
  }, [searchTerm, selectedRegulation]);

  const allRegulations = Array.from(
    new Set(STANDARDS_MAPPING.flatMap(s => s.regulations))
  ).sort();

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
          <h1 className="text-lg font-bold text-foreground">
            Standards Mapping
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              GS1 Standards Mapping
            </h2>
            <p className="text-muted-foreground">
              See which GS1 standards are required or recommended by each ESG
              regulation. Implementation guides included.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search standards, codes, descriptions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* Regulation Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground py-2">
                Filter by regulation:
              </span>
              {allRegulations.map(reg => (
                <button
                  key={reg}
                  onClick={() =>
                    setSelectedRegulation(
                      selectedRegulation === reg ? null : reg
                    )
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedRegulation === reg
                      ? "bg-accent text-accent-foreground"
                      : "bg-card border border-border text-foreground hover:border-accent"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card border border-border hover:border-accent"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card border border-border hover:border-accent"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Standards Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStandards.map(std => (
                <div
                  key={std.standardCode}
                  className="card-elevated p-6 hover:border-accent transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-accent mb-1">
                        {std.standardCode}
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {std.standardName}
                      </h3>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[std.requiredLevel as keyof typeof LEVEL_COLORS]}`}
                    >
                      {std.requiredLevel}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {std.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Regulations:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {std.regulations.map((reg, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 rounded bg-accent/10 text-accent text-xs font-medium"
                        >
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Implementation:
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {std.implementationGuide}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStandards.map(std => (
                <div
                  key={std.standardCode}
                  className="card-elevated p-6 hover:border-accent transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-accent">
                          {std.standardCode}
                        </span>
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[std.requiredLevel as keyof typeof LEVEL_COLORS]}`}
                        >
                          {std.requiredLevel}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {std.standardName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {std.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Regulations:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {std.regulations.map((reg, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 rounded bg-accent/10 text-accent text-xs font-medium"
                              >
                                {reg}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Implementation Guide:
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {std.implementationGuide}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-8 p-4 rounded-lg bg-card border border-border text-center text-sm text-muted-foreground">
            Showing {filteredStandards.length} of {STANDARDS_MAPPING.length} GS1
            standards
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect - ESG Regulations Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
