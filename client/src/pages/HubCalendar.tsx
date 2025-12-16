import { useState } from "react";
import { Link } from "wouter";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
} from "lucide-react";

const SAMPLE_DEADLINES = [
  {
    id: 1,
    date: "2024-12-30",
    title: "EUDR Implementation Deadline",
    regulation: "EUDR",
    description:
      "Companies must implement due diligence systems for deforestation-free commodities.",
    daysUntil: 2,
    priority: "CRITICAL",
    affectedStandards: ["EPCIS", "Traceability"],
  },
  {
    id: 2,
    date: "2025-01-01",
    title: "CSRD Reporting Deadline",
    regulation: "CSRD",
    description: "Large companies must file first CSRD sustainability report.",
    daysUntil: 34,
    priority: "CRITICAL",
    affectedStandards: ["GTIN", "EPCIS", "Product Data"],
  },
  {
    id: 3,
    date: "2025-01-15",
    title: "ESRS Compliance Deadline",
    regulation: "ESRS",
    description: "Sustainability reporting must align with ESRS standards.",
    daysUntil: 48,
    priority: "HIGH",
    affectedStandards: ["GTIN", "GLN"],
  },
  {
    id: 4,
    date: "2025-02-28",
    title: "EUDR Reporting Period Ends",
    regulation: "EUDR",
    description:
      "First reporting period for deforestation due diligence closes.",
    daysUntil: 92,
    priority: "HIGH",
    affectedStandards: ["EPCIS"],
  },
  {
    id: 5,
    date: "2025-03-31",
    title: "DPP Pilot Phase Deadline",
    regulation: "DPP",
    description: "Companies must submit DPP implementation results from pilot.",
    daysUntil: 123,
    priority: "MEDIUM",
    affectedStandards: ["Digital Product Passport", "QR Code"],
  },
  {
    id: 6,
    date: "2025-06-30",
    title: "ESPR Implementation Deadline",
    regulation: "ESPR",
    description: "Ecodesign requirements for sustainable products take effect.",
    daysUntil: 214,
    priority: "MEDIUM",
    affectedStandards: ["Product Data", "Digital Product Passport"],
  },
  {
    id: 7,
    date: "2026-01-01",
    title: "CSRD Extended to SMEs",
    regulation: "CSRD",
    description: "Proposed extension of CSRD to companies with 250+ employees.",
    daysUntil: 399,
    priority: "LOW",
    affectedStandards: ["GTIN", "EPCIS"],
  },
];

const PRIORITY_COLORS = {
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
  LOW: "bg-green-100 text-green-800 border-green-300",
};

const PRIORITY_ICONS = {
  CRITICAL: <AlertTriangle className="w-5 h-5" />,
  HIGH: <AlertTriangle className="w-5 h-5" />,
  MEDIUM: <Clock className="w-5 h-5" />,
  LOW: <CheckCircle className="w-5 h-5" />,
};

export default function HubCalendar() {
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const filteredDeadlines = selectedPriority
    ? SAMPLE_DEADLINES.filter(d => d.priority === selectedPriority)
    : SAMPLE_DEADLINES;

  const sortedDeadlines = [...filteredDeadlines].sort(
    (a, b) => a.daysUntil - b.daysUntil
  );

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
            Compliance Calendar
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
              Compliance Calendar
            </h2>
            <p className="text-muted-foreground">
              Track all ESG regulatory deadlines, reporting windows, and
              enforcement dates. Set alerts for key dates.
            </p>
          </div>

          {/* Priority Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground py-2">
                Filter by priority:
              </span>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(priority => (
                <button
                  key={priority}
                  onClick={() =>
                    setSelectedPriority(
                      selectedPriority === priority ? null : priority
                    )
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPriority === priority
                      ? "bg-accent text-accent-foreground"
                      : "bg-card border border-border text-foreground hover:border-accent"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {sortedDeadlines.map((deadline, _idx) => (
              <div
                key={deadline.id}
                className={`card-elevated p-6 border-l-4 ${PRIORITY_COLORS[deadline.priority as keyof typeof PRIORITY_COLORS]}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {
                      PRIORITY_ICONS[
                        deadline.priority as keyof typeof PRIORITY_ICONS
                      ]
                    }
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-background">
                        {deadline.regulation}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {deadline.priority}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {deadline.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {deadline.description}
                    </p>

                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {deadline.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {deadline.daysUntil === 0
                            ? "Today"
                            : deadline.daysUntil === 1
                              ? "Tomorrow"
                              : `${deadline.daysUntil} days`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {deadline.affectedStandards.map((standard, sidx) => (
                        <span
                          key={sidx}
                          className="inline-block px-2 py-1 rounded bg-background text-xs font-medium"
                        >
                          {standard}
                        </span>
                      ))}
                    </div>

                    <button className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition text-sm font-medium">
                      <Bell className="w-4 h-4" />
                      Set Alert
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {SAMPLE_DEADLINES.filter(d => d.priority === "CRITICAL").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Critical Deadlines
              </p>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {SAMPLE_DEADLINES.filter(d => d.priority === "HIGH").length}
              </div>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {SAMPLE_DEADLINES.filter(d => d.priority === "MEDIUM").length}
              </div>
              <p className="text-xs text-muted-foreground">Medium Priority</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {SAMPLE_DEADLINES.filter(d => d.priority === "LOW").length}
              </div>
              <p className="text-xs text-muted-foreground">Low Priority</p>
            </div>
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
