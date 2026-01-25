import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Search,

  ExternalLink,
  AlertCircle,
  CheckCircle,
  FileText,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const SAMPLE_NEWS = [
  {
    id: 1,
    title: "CSRD Amendment Proposed: Expanded Scope for SMEs",
    summary:
      "European Commission proposes extending CSRD requirements to SMEs starting 2026, affecting supply chain reporting obligations.",
    content:
      "The proposed amendment would lower reporting thresholds and expand CSRD to companies with 250+ employees. This would significantly impact GS1 standards adoption for traceability and product data.",
    type: "AMENDMENT",
    date: "Nov 27, 2024",
    source: "European Commission",
    sourceUrl: "https://ec.europa.eu",
    credibility: "OFFICIAL",
    relatedRegulations: ["CSRD", "ESRS"],
    relatedStandards: ["GTIN", "EPCIS"],
  },
  {
    id: 2,
    title: "ESRS Implementation Guidance Released",
    summary:
      "EFRAG publishes comprehensive guidance on implementing ESRS standards for sustainability reporting.",
    content:
      "The new guidance clarifies reporting requirements for each ESRS standard, including data collection methodologies and GS1 standards integration points.",
    type: "GUIDANCE",
    date: "Nov 25, 2024",
    source: "EFRAG",
    sourceUrl: "https://www.efrag.org",
    credibility: "OFFICIAL",
    relatedRegulations: ["ESRS"],
    relatedStandards: ["GTIN", "GLN"],
  },
  {
    id: 3,
    title: "EU Taxonomy Update: New Activities Included",
    summary:
      "EU Taxonomy Regulation updated to include 20 new sustainable economic activities.",
    content:
      "The update expands the taxonomy to cover additional sectors including circular economy and sustainable agriculture, affecting product classification and claims.",
    type: "UPDATE",
    date: "Nov 22, 2024",
    source: "EU Taxonomy Platform",
    sourceUrl: "https://ec.europa.eu/sustainable-finance",
    credibility: "OFFICIAL",
    relatedRegulations: ["EU_TAXONOMY"],
    relatedStandards: ["Product Data", "Sustainability Claims"],
  },
  {
    id: 4,
    title: "EUDR Enforcement Actions Begin",
    summary:
      "First enforcement actions taken against importers not complying with EUDR due diligence requirements.",
    content:
      "Customs authorities in three EU member states have initiated enforcement actions. Companies must demonstrate traceability through GS1 EPCIS or equivalent systems.",
    type: "ENFORCEMENT",
    date: "Nov 20, 2024",
    source: "European Customs Authority",
    sourceUrl: "https://ec.europa.eu/customs",
    credibility: "OFFICIAL",
    relatedRegulations: ["EUDR"],
    relatedStandards: ["EPCIS", "Traceability"],
  },
  {
    id: 5,
    title: "Digital Product Passport Pilot Phase Extended",
    summary:
      "EU extends DPP pilot phase to include additional product categories and member states.",
    content:
      "The pilot now covers textiles, batteries, and electronics. Companies can begin testing DPP implementations using GS1 standards and QR codes.",
    type: "PROPOSAL",
    date: "Nov 18, 2024",
    source: "European Commission",
    sourceUrl: "https://ec.europa.eu",
    credibility: "OFFICIAL",
    relatedRegulations: ["DPP"],
    relatedStandards: ["Digital Product Passport", "QR Code", "GTIN"],
  },
  {
    id: 6,
    title: "Court Decision: Sustainability Claims Must Be Verifiable",
    summary:
      "EU Court rules that sustainability claims must be backed by verifiable data and GS1 standards.",
    content:
      "The decision strengthens requirements for product-level sustainability data, making GS1 standards adoption essential for compliance.",
    type: "COURT_DECISION",
    date: "Nov 15, 2024",
    source: "Court of Justice of the EU",
    sourceUrl: "https://curia.europa.eu",
    credibility: "OFFICIAL",
    relatedRegulations: ["ESPR"],
    relatedStandards: ["Product Data", "Sustainability Claims"],
  },
];

const TYPE_ICONS = {
  NEW_LAW: <Zap className="w-4 h-4" />,
  AMENDMENT: <AlertCircle className="w-4 h-4" />,
  ENFORCEMENT: <CheckCircle className="w-4 h-4" />,
  COURT_DECISION: <FileText className="w-4 h-4" />,
  GUIDANCE: <FileText className="w-4 h-4" />,
  PROPOSAL: <AlertCircle className="w-4 h-4" />,
};

const TYPE_COLORS = {
  NEW_LAW: "bg-red-100 text-red-800",
  AMENDMENT: "bg-yellow-100 text-yellow-800",
  ENFORCEMENT: "bg-orange-100 text-orange-800",
  COURT_DECISION: "bg-blue-100 text-blue-800",
  GUIDANCE: "bg-green-100 text-green-800",
  PROPOSAL: "bg-purple-100 text-purple-800",
};

export default function HubNews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredNews = useMemo(() => {
    return SAMPLE_NEWS.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.relatedRegulations.some(r =>
          r.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        item.relatedStandards.some(s =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesType = !selectedType || item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

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
            Regulatory News & Updates
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
              Daily Regulatory Updates
            </h2>
            <p className="text-muted-foreground">
              Stay informed with daily curated news on ESG regulations,
              amendments, enforcement actions, and guidance.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search news, regulations, standards..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground py-2">
                Filter by type:
              </span>
              {[
                "NEW_LAW",
                "AMENDMENT",
                "ENFORCEMENT",
                "GUIDANCE",
                "COURT_DECISION",
                "PROPOSAL",
              ].map(type => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(selectedType === type ? null : type)
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedType === type
                      ? "bg-accent text-accent-foreground"
                      : "bg-card border border-border text-foreground hover:border-accent"
                  }`}
                >
                  {type.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* News Items */}
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No news items match your search criteria.
                </p>
              </div>
            ) : (
              filteredNews.map(item => (
                <div
                  key={item.id}
                  className="card-elevated p-6 hover:border-accent transition"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type as keyof typeof TYPE_COLORS]}`}
                    >
                      {TYPE_ICONS[item.type as keyof typeof TYPE_ICONS]}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[item.type as keyof typeof TYPE_COLORS]}`}
                        >
                          {item.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.date}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {item.source}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-accent transition cursor-pointer">
                        {item.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        {item.summary}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          Regulations:
                        </div>
                        {item.relatedRegulations.map((reg, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 rounded bg-accent/10 text-accent text-xs"
                          >
                            {reg}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          GS1 Standards:
                        </div>
                        {item.relatedStandards.map((std, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 rounded bg-secondary/20 text-secondary-foreground text-xs"
                          >
                            {std}
                          </span>
                        ))}
                      </div>

                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition text-sm font-medium"
                      >
                        Read full article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-8 p-4 rounded-lg bg-card border border-border text-center text-sm text-muted-foreground">
            Showing {filteredNews.length} of {SAMPLE_NEWS.length} news items
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
