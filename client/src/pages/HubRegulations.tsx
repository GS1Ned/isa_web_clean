import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Filter, ChevronRight, Calendar, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SAMPLE_REGULATIONS = [
  {
    id: 1,
    title: "Corporate Sustainability Reporting Directive (CSRD)",
    type: "CSRD",
    status: "ACTIVE",
    effectiveDate: "Jan 1, 2024",
    description: "Requires large EU companies to disclose sustainability information aligned with ESRS standards.",
    affectedStandards: ["GTIN", "EPCIS", "Digital Product Passport"],
    impactLevel: "CRITICAL",
  },
  {
    id: 2,
    title: "European Sustainability Reporting Standards (ESRS)",
    type: "ESRS",
    status: "ACTIVE",
    effectiveDate: "Jan 1, 2024",
    description: "Standardized sustainability reporting framework for CSRD compliance.",
    affectedStandards: ["GTIN", "GLN", "EPCIS"],
    impactLevel: "CRITICAL",
  },
  {
    id: 3,
    title: "Digital Product Passport (DPP)",
    type: "DPP",
    status: "TRANSITIONAL",
    effectiveDate: "Jan 1, 2026",
    description: "Requires product-level sustainability and compliance information in digital format.",
    affectedStandards: ["Digital Product Passport", "GTIN", "QR Code"],
    impactLevel: "HIGH",
  },
  {
    id: 4,
    title: "EU Deforestation Regulation (EUDR)",
    type: "EUDR",
    status: "TRANSITIONAL",
    effectiveDate: "Dec 30, 2024",
    description: "Prohibits import of commodities linked to deforestation. Requires due diligence and traceability.",
    affectedStandards: ["EPCIS", "Traceability", "GS1 Barcode"],
    impactLevel: "HIGH",
  },
  {
    id: 5,
    title: "EU Taxonomy Regulation",
    type: "EU_TAXONOMY",
    status: "ACTIVE",
    effectiveDate: "Jan 1, 2022",
    description: "Classification system for sustainable economic activities. Impacts supply chain sustainability claims.",
    affectedStandards: ["GTIN", "Sustainability Claims"],
    impactLevel: "MEDIUM",
  },
  {
    id: 6,
    title: "Ecodesign for Sustainable Products Regulation (ESPR)",
    type: "ESPR",
    status: "TRANSITIONAL",
    effectiveDate: "Jan 1, 2025",
    description: "Sets ecodesign requirements for products. Requires digital product information.",
    affectedStandards: ["Digital Product Passport", "GTIN", "Product Data"],
    impactLevel: "HIGH",
  },
];

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800",
  TRANSITIONAL: "bg-yellow-100 text-yellow-800",
  PROPOSED: "bg-blue-100 text-blue-800",
  ENFORCEMENT: "bg-red-100 text-red-800",
};

const IMPACT_COLORS = {
  CRITICAL: "text-red-600",
  HIGH: "text-orange-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-green-600",
};

export default function HubRegulations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null);

  const filteredRegulations = useMemo(() => {
    return SAMPLE_REGULATIONS.filter((reg) => {
      const matchesSearch =
        reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.affectedStandards.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !selectedStatus || reg.status === selectedStatus;
      const matchesImpact = !selectedImpact || reg.impactLevel === selectedImpact;

      return matchesSearch && matchesStatus && matchesImpact;
    });
  }, [searchTerm, selectedStatus, selectedImpact]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link href="/hub" className="text-accent hover:text-accent/80 transition font-medium">
            ← Back to Hub
          </Link>
          <h1 className="text-lg font-bold text-foreground">Regulation Explorer</h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">ESG Regulations</h2>
            <p className="text-muted-foreground">
              Explore {SAMPLE_REGULATIONS.length}+ EU sustainability regulations and their impact on GS1 standards.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search regulations, standards, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground py-2">Status:</span>
                {["ACTIVE", "TRANSITIONAL", "PROPOSED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedStatus === status
                        ? "bg-accent text-accent-foreground"
                        : "bg-card border border-border text-foreground hover:border-accent"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground py-2">Impact:</span>
                {["CRITICAL", "HIGH", "MEDIUM"].map((impact) => (
                  <button
                    key={impact}
                    onClick={() => setSelectedImpact(selectedImpact === impact ? null : impact)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedImpact === impact
                        ? "bg-accent text-accent-foreground"
                        : "bg-card border border-border text-foreground hover:border-accent"
                    }`}
                  >
                    {impact}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {filteredRegulations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No regulations match your search criteria.</p>
              </div>
            ) : (
              filteredRegulations.map((reg) => (
                <div key={reg.id} className="card-elevated p-6 hover:border-accent transition cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status as keyof typeof STATUS_COLORS]}`}>
                          {reg.status}
                        </span>
                        <span className={`text-sm font-bold ${IMPACT_COLORS[reg.impactLevel as keyof typeof IMPACT_COLORS]}`}>
                          {reg.impactLevel} IMPACT
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition">
                        {reg.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{reg.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Effective: {reg.effectiveDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{reg.affectedStandards.length} GS1 Standards</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reg.affectedStandards.map((standard, idx) => (
                      <span key={idx} className="inline-block px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        {standard}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-8 p-4 rounded-lg bg-card border border-border text-center text-sm text-muted-foreground">
            Showing {filteredRegulations.length} of {SAMPLE_REGULATIONS.length} regulations
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Intelligent Standards Architect - ESG Regulations Hub</p>
        </div>
      </footer>
    </div>
  );
}
