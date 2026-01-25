import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Search,

  FileText,
  CheckSquare,
  BookOpen,
  Lightbulb,
  Download as DownloadIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SAMPLE_RESOURCES = [
  {
    id: 1,
    title: "CSRD Compliance Checklist",
    description:
      "Step-by-step checklist for implementing CSRD requirements and GS1 standards integration.",
    type: "CHECKLIST",
    relatedRegulations: ["CSRD"],
    relatedStandards: ["GTIN", "EPCIS", "Product Data"],
    downloadCount: 1243,
    fileSize: "2.4 MB",
  },
  {
    id: 2,
    title: "EUDR Due Diligence Implementation Guide",
    description:
      "Comprehensive guide for implementing EUDR due diligence using GS1 traceability standards.",
    type: "GUIDE",
    relatedRegulations: ["EUDR"],
    relatedStandards: ["EPCIS", "Traceability", "GLN"],
    downloadCount: 856,
    fileSize: "5.1 MB",
  },
  {
    id: 3,
    title: "Digital Product Passport Template",
    description:
      "Ready-to-use template for creating Digital Product Passports with GS1 standards.",
    type: "TEMPLATE",
    relatedRegulations: ["DPP", "ESPR"],
    relatedStandards: ["Digital Product Passport", "QR Code", "GTIN"],
    downloadCount: 2104,
    fileSize: "1.8 MB",
  },
  {
    id: 4,
    title: "GS1 Standards Integration Whitepaper",
    description:
      "In-depth analysis of how GS1 standards support ESG regulatory compliance across all major regulations.",
    type: "WHITEPAPER",
    relatedRegulations: ["CSRD", "ESRS", "EUDR", "DPP"],
    relatedStandards: ["GTIN", "EPCIS", "GLN", "Digital Product Passport"],
    downloadCount: 3421,
    fileSize: "8.7 MB",
  },
  {
    id: 5,
    title: "Supply Chain Sustainability Data Template",
    description:
      "Excel template for collecting and organizing supply chain sustainability data for CSRD/ESRS reporting.",
    type: "TEMPLATE",
    relatedRegulations: ["CSRD", "ESRS"],
    relatedStandards: ["GTIN", "GLN", "Product Data"],
    downloadCount: 1876,
    fileSize: "3.2 MB",
  },
  {
    id: 6,
    title: "Case Study: EUDR Implementation Success",
    description:
      "Real-world case study of a company successfully implementing EUDR using GS1 standards.",
    type: "CASE_STUDY",
    relatedRegulations: ["EUDR"],
    relatedStandards: ["EPCIS", "Traceability"],
    downloadCount: 642,
    fileSize: "4.5 MB",
  },
  {
    id: 7,
    title: "ESRS Reporting Data Mapping Guide",
    description:
      "Guide for mapping GS1 standards data to ESRS reporting requirements.",
    type: "GUIDE",
    relatedRegulations: ["ESRS"],
    relatedStandards: ["GTIN", "Product Data", "Sustainability Claims"],
    downloadCount: 1234,
    fileSize: "3.8 MB",
  },
  {
    id: 8,
    title: "Sustainability Claims Verification Tool",
    description:
      "Interactive tool for verifying sustainability claims against GS1 standards and regulations.",
    type: "TOOL",
    relatedRegulations: ["ESPR", "ESRS"],
    relatedStandards: ["Sustainability Claims", "Product Data"],
    downloadCount: 2456,
    fileSize: "6.2 MB",
  },
];

const TYPE_ICONS = {
  GUIDE: <BookOpen className="w-5 h-5" />,
  CHECKLIST: <CheckSquare className="w-5 h-5" />,
  TEMPLATE: <FileText className="w-5 h-5" />,
  CASE_STUDY: <Lightbulb className="w-5 h-5" />,
  WHITEPAPER: <FileText className="w-5 h-5" />,
  TOOL: <Lightbulb className="w-5 h-5" />,
};

const TYPE_COLORS = {
  GUIDE: "bg-blue-100 text-blue-800",
  CHECKLIST: "bg-green-100 text-green-800",
  TEMPLATE: "bg-purple-100 text-purple-800",
  CASE_STUDY: "bg-orange-100 text-orange-800",
  WHITEPAPER: "bg-red-100 text-red-800",
  TOOL: "bg-teal-100 text-teal-800",
};

export default function HubResources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    return SAMPLE_RESOURCES.filter(resource => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.relatedRegulations.some(r =>
          r.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        resource.relatedStandards.some(s =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesType = !selectedType || resource.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  const resourceTypes = Array.from(new Set(SAMPLE_RESOURCES.map(r => r.type)));

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
            Resources Library
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
              Resources & Downloads
            </h2>
            <p className="text-muted-foreground">
              Access guides, checklists, templates, and case studies for
              implementing ESG regulations with GS1 standards.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources, guides, templates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground py-2">
                Filter by type:
              </span>
              {resourceTypes.map(type => (
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
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredResources.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No resources match your search criteria.
                </p>
              </div>
            ) : (
              filteredResources.map(resource => (
                <div
                  key={resource.id}
                  className="card-elevated p-6 hover:border-accent transition flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[resource.type as keyof typeof TYPE_COLORS]}`}
                    >
                      {TYPE_ICONS[resource.type as keyof typeof TYPE_ICONS]}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[resource.type as keyof typeof TYPE_COLORS]}`}
                      >
                        {resource.type}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {resource.description}
                  </p>

                  <div className="mb-4 space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Regulations:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {resource.relatedRegulations.map((reg, idx) => (
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
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        GS1 Standards:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {resource.relatedStandards.map((std, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 rounded bg-secondary/20 text-secondary-foreground text-xs font-medium"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      <div>{resource.fileSize}</div>
                      <div>
                        {resource.downloadCount.toLocaleString()} downloads
                      </div>
                    </div>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 transition">
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-8 p-4 rounded-lg bg-card border border-border text-center text-sm text-muted-foreground">
            Showing {filteredResources.length} of {SAMPLE_RESOURCES.length}{" "}
            resources
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
