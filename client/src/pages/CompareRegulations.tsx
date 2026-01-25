/**
 * Compare Regulations Page
 *
 * Allows users to select and compare multiple regulations side-by-side.
 * Features:
 * - Multi-select regulation picker
 * - Side-by-side timeline comparison
 * - Overlapping deadline detection
 * - URL state management for sharing comparisons
 */

import { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CompareTimelines } from "@/components/CompareTimelines";
import { ArrowLeft, GitCompare, Info } from "lucide-react";

// Regulation database (in production, this would come from the database)
const AVAILABLE_REGULATIONS = [
  {
    code: "CSRD",
    title: "Corporate Sustainability Reporting Directive",
    color: "#3b82f6", // Blue
    timeline: [
      {
        date: "2024-01-01",
        event: "CSRD Effective",
        description: "Directive enters into force",
        status: "completed" as const,
      },
      {
        date: "2025-01-01",
        event: "First Reporting Period",
        description: "Large companies begin reporting under CSRD",
        status: "upcoming" as const,
      },
      {
        date: "2026-01-01",
        event: "Enforcement Begins",
        description: "Regulatory enforcement of CSRD requirements",
        status: "future" as const,
      },
      {
        date: "2028-01-01",
        event: "SME Scope Expansion",
        description: "Extended to small and medium-sized enterprises",
        status: "future" as const,
      },
    ],
  },
  {
    code: "PPWR",
    title: "Packaging and Packaging Waste Regulation",
    color: "#10b981", // Green
    timeline: [
      {
        date: "2024-04-24",
        event: "PPWR Adopted",
        description: "Regulation officially adopted by EU Parliament",
        status: "completed" as const,
      },
      {
        date: "2025-01-01",
        event: "Digital Product Passport Pilot",
        description: "DPP requirements begin for pilot sectors",
        status: "upcoming" as const,
      },
      {
        date: "2026-01-01",
        event: "Recycled Content Requirements",
        description: "Minimum recycled content rules take effect",
        status: "future" as const,
      },
      {
        date: "2030-01-01",
        event: "Full Implementation",
        description: "All PPWR requirements fully enforced",
        status: "future" as const,
      },
    ],
  },
  {
    code: "ESPR",
    title: "Ecodesign for Sustainable Products Regulation",
    color: "#8b5cf6", // Purple
    timeline: [
      {
        date: "2024-07-18",
        event: "ESPR Enters into Force",
        description: "Regulation published and enters into force",
        status: "completed" as const,
      },
      {
        date: "2025-01-01",
        event: "First Product Groups Identified",
        description: "Priority product groups for ecodesign requirements",
        status: "upcoming" as const,
      },
      {
        date: "2026-07-01",
        event: "Digital Product Passports Mandatory",
        description: "DPP requirements for priority products",
        status: "future" as const,
      },
      {
        date: "2027-01-01",
        event: "Extended Product Groups",
        description: "Additional product categories added",
        status: "future" as const,
      },
    ],
  },
  {
    code: "EUDR",
    title: "EU Deforestation Regulation",
    color: "#f59e0b", // Orange
    timeline: [
      {
        date: "2023-06-29",
        event: "EUDR Adopted",
        description: "Regulation officially adopted",
        status: "completed" as const,
      },
      {
        date: "2024-12-30",
        event: "Large Operators Compliance",
        description: "Large operators must comply with due diligence",
        status: "upcoming" as const,
      },
      {
        date: "2025-06-30",
        event: "SME Compliance Deadline",
        description: "Small and medium enterprises must comply",
        status: "future" as const,
      },
      {
        date: "2025-12-30",
        event: "Full Enforcement",
        description: "All operators subject to penalties",
        status: "future" as const,
      },
    ],
  },
];

export default function CompareRegulations() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();

  // Parse selected regulations from URL
  const urlParams = new URLSearchParams(searchParams);
  const urlSelected =
    urlParams.get("regulations")?.split(",").filter(Boolean) || [];

  const [selectedCodes, setSelectedCodes] = useState<string[]>(urlSelected);
  const [showSelector, setShowSelector] = useState(selectedCodes.length === 0);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedCodes.length > 0) {
      setLocation(
        `/hub/regulations/compare?regulations=${selectedCodes.join(",")}`,
        { replace: true }
      );
    } else {
      setLocation("/hub/regulations/compare", { replace: true });
    }
  }, [selectedCodes, setLocation]);

  const selectedRegulations = AVAILABLE_REGULATIONS.filter(reg =>
    selectedCodes.includes(reg.code)
  );

  const handleToggleRegulation = (code: string) => {
    setSelectedCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        if (prev.length >= 4) {
          return prev; // Max 4 regulations
        }
        return [...prev, code];
      }
    });
  };

  const handleRemoveRegulation = (code: string) => {
    setSelectedCodes(prev => prev.filter(c => c !== code));
  };

  const handleAddRegulation = () => {
    setShowSelector(true);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/hub/regulations">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Regulations
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <GitCompare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Compare Regulations</h1>
            <p className="text-muted-foreground">
              Compare timelines across multiple regulations to identify
              overlapping deadlines and dependencies
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                How to Use Timeline Comparison
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>
                  • Select 2-4 regulations to compare their implementation
                  timelines
                </li>
                <li>
                  • Overlapping periods are highlighted to help coordinate
                  compliance activities
                </li>
                <li>
                  • Use filters to focus on specific time ranges or event types
                </li>
                <li>
                  • Click news titles to read full articles and understand
                  regulatory context
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulation Selector */}
      {(showSelector || selectedCodes.length === 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Regulations to Compare</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose 2-4 regulations (maximum 4)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {AVAILABLE_REGULATIONS.map(reg => {
                const isSelected = selectedCodes.includes(reg.code);
                const isDisabled = !isSelected && selectedCodes.length >= 4;

                return (
                  <div
                    key={reg.code}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isDisabled
                          ? "border-border bg-muted opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50 cursor-pointer"
                    }`}
                    onClick={() =>
                      !isDisabled && handleToggleRegulation(reg.code)
                    }
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => handleToggleRegulation(reg.code)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: reg.color }}
                        />
                        <Badge variant="secondary">{reg.code}</Badge>
                      </div>
                      <h4 className="font-semibold mb-1">{reg.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reg.timeline.length}{" "}
                        {reg.timeline.length === 1 ? "milestone" : "milestones"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCodes.length >= 2 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowSelector(false)} size="lg">
                  Compare {selectedCodes.length} Regulations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline Comparison */}
      {selectedCodes.length >= 1 && !showSelector && (
        <CompareTimelines
          regulations={selectedRegulations}
          onRemoveRegulation={handleRemoveRegulation}
          onAddRegulation={
            selectedCodes.length < 4 ? handleAddRegulation : undefined
          }
        />
      )}

      {/* Empty State */}
      {selectedCodes.length === 0 && !showSelector && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <GitCompare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Regulations Selected
              </h3>
              <p className="text-muted-foreground mb-4">
                Select at least 2 regulations to start comparing their
                timelines.
              </p>
              <Button onClick={() => setShowSelector(true)}>
                Select Regulations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
