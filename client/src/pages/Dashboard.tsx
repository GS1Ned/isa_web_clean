import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Zap,
  Search,

  TrendingUp,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  exportToJSON,
  exportToCSV,
  exportToPDF,
  exportToHTML,
  generateFilename,
} from "@/lib/export";

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Fetch regulations
  const regulationsQuery = trpc.regulations.list.useQuery({
    type: selectedType === "ALL" ? undefined : selectedType,
  });

  // Fetch insights/stats
  const statsQuery = trpc.insights.stats.useQuery();
  const changesQuery = trpc.insights.recentChanges.useQuery({ limit: 5 });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to access the demo dashboard.
          </p>
          <Link
            href="/"
            className="text-accent hover:text-accent/80 transition"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const regulations = regulationsQuery.data || [];
  const filteredRegulations = regulations.filter(
    reg =>
      reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = statsQuery.data;
  const changes = changesQuery.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ISA</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Demo Dashboard
            </span>
            <Link
              href="/"
              className="text-sm font-medium text-accent hover:text-accent/80 transition"
            >
              Exit
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-accent/5 to-transparent border-b border-border">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Regulatory Mapping Explorer
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore how EU regulations map to GS1 standards with live filtering
            and relevance scoring.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-background rounded-lg p-6 border border-border">
              <div className="text-sm text-muted-foreground mb-2">
                Total Regulations
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalRegulations || 0}
              </div>
            </div>
            <div className="bg-background rounded-lg p-6 border border-border">
              <div className="text-sm text-muted-foreground mb-2">
                GS1 Standards
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalStandards || 0}
              </div>
            </div>
            <div className="bg-background rounded-lg p-6 border border-border">
              <div className="text-sm text-muted-foreground mb-2">
                Mappings Found
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalMappings || 0}
              </div>
            </div>
            <div className="bg-background rounded-lg p-6 border border-border">
              <div className="text-sm text-muted-foreground mb-2">
                Recent Changes
              </div>
              <div className="text-3xl font-bold text-foreground">
                {changes.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Regulations List */}
            <div className="lg:col-span-2">
              <div className="card-elevated p-6 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Regulations
                </h2>

                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search regulations..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedType === "ALL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType("ALL")}
                    >
                      All
                    </Button>
                    {["CSRD", "ESRS", "DPP", "EU_TAXONOMY"].map(type => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Export Buttons */}
                {filteredRegulations.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToJSON(
                          filteredRegulations,
                          generateFilename("json")
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToCSV(
                          filteredRegulations,
                          generateFilename("csv")
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToPDF(
                          filteredRegulations,
                          generateFilename("pdf")
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportToHTML(
                          filteredRegulations,
                          generateFilename("html")
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      HTML
                    </Button>
                  </div>
                )}

                {/* Regulations List */}
                <div className="space-y-4">
                  {regulationsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                  ) : filteredRegulations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No regulations found matching your search.
                    </div>
                  ) : (
                    filteredRegulations.map(reg => (
                      <div
                        key={reg.id}
                        className="bg-background rounded-lg p-4 border border-border hover:border-accent transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">
                            {reg.title}
                          </h3>
                          <span className="badge-primary text-xs">
                            {reg.regulationType}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {reg.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{reg.celexId || "No CELEX ID"}</span>
                          {reg.effectiveDate && (
                            <span>
                              Effective:{" "}
                              {new Date(reg.effectiveDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Changes */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Recent Changes
                  </h3>
                </div>
                <div className="space-y-3">
                  {changesQuery.isLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-5 h-5 text-accent animate-spin mx-auto" />
                    </div>
                  ) : changes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No recent changes.
                    </p>
                  ) : (
                    changes.map(change => (
                      <div
                        key={change.id}
                        className="bg-background rounded p-3 border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-accent">
                            {change.changeType}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              change.severity === "CRITICAL"
                                ? "bg-red-500/20 text-red-400"
                                : change.severity === "HIGH"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {change.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {change.changeDescription}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* How to Use */}
              <div className="card-elevated p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    How to Use
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-accent">1.</span>
                    <span>Search for regulations by keyword</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">2.</span>
                    <span>Filter by regulation type (CSRD, ESRS, DPP)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">3.</span>
                    <span>View mapped GS1 standards and relevance scores</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">4.</span>
                    <span>Track regulatory changes in real-time</span>
                  </li>
                </ul>
              </div>

              {/* Info Box */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  This is a demo dashboard showing sample CSRD, ESRS, and DPP
                  regulations mapped to GS1 standards. In production, ISA
                  processes real regulatory documents with AI-powered analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
