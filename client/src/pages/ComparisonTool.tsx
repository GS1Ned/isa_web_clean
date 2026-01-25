import { useState } from "react";
import { Link } from "wouter";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function ComparisonTool() {
  const [selectedReg1, setSelectedReg1] = useState<number | null>(null);
  const [selectedReg2, setSelectedReg2] = useState<number | null>(null);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");

  // Fetch all regulations
  const regulationsQuery = trpc.regulations.list.useQuery({});
  const regulations = regulationsQuery.data || [];

  // Filter regulations based on search
  const filteredReg1 = regulations.filter(reg =>
    reg.title.toLowerCase().includes(searchTerm1.toLowerCase())
  );
  const filteredReg2 = regulations.filter(reg =>
    reg.title.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  // Get selected regulations
  const reg1 = regulations.find(r => r.id === selectedReg1);
  const reg2 = regulations.find(r => r.id === selectedReg2);

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
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:text-accent/80 transition"
          >
            Back
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Regulation Comparison
          </h1>
          <p className="text-lg text-muted-foreground">
            Compare two regulations side-by-side to see which GS1 standards
            apply to each.
          </p>
        </div>
      </section>

      {/* Comparison Tool */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Regulation Selector */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Select First Regulation
              </h2>

              <div className="mb-4">
                <Input
                  placeholder="Search regulations..."
                  value={searchTerm1}
                  onChange={e => setSearchTerm1(e.target.value)}
                  className="mb-3"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {regulationsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  </div>
                ) : filteredReg1.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No regulations found
                  </p>
                ) : (
                  filteredReg1.map(reg => (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedReg1(reg.id)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedReg1 === reg.id
                          ? "bg-accent/20 border-accent"
                          : "bg-background border-border hover:border-accent"
                      }`}
                    >
                      <p className="font-medium text-sm text-foreground">
                        {reg.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reg.regulationType}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Comparison Arrow */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <ArrowRight className="w-8 h-8 text-accent" />
                <p className="text-sm text-muted-foreground text-center">
                  Compare
                </p>
                <ArrowRight className="w-8 h-8 text-accent rotate-180" />
              </div>
            </div>

            {/* Right Regulation Selector */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Select Second Regulation
              </h2>

              <div className="mb-4">
                <Input
                  placeholder="Search regulations..."
                  value={searchTerm2}
                  onChange={e => setSearchTerm2(e.target.value)}
                  className="mb-3"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {regulationsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  </div>
                ) : filteredReg2.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No regulations found
                  </p>
                ) : (
                  filteredReg2.map(reg => (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedReg2(reg.id)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedReg2 === reg.id
                          ? "bg-secondary/20 border-secondary"
                          : "bg-background border-border hover:border-secondary"
                      }`}
                    >
                      <p className="font-medium text-sm text-foreground">
                        {reg.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reg.regulationType}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Comparison Results */}
          {reg1 && reg2 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Comparison Results
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Regulation 1 */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    {reg1.title}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        Type
                      </p>
                      <p className="text-sm text-foreground">
                        {reg1.regulationType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        CELEX ID
                      </p>
                      <p className="text-sm text-foreground">
                        {reg1.celexId || "N/A"}
                      </p>
                    </div>
                    {reg1.effectiveDate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Effective Date
                        </p>
                        <p className="text-sm text-foreground">
                          {new Date(reg1.effectiveDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        Description
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reg1.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                    <p className="text-xs font-medium text-accent mb-2">
                      Applicable GS1 Standards
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In the demo dashboard, you can see which GS1 standards map
                      to this regulation with relevance scores.
                    </p>
                  </div>
                </div>

                {/* Regulation 2 */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    {reg2.title}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        Type
                      </p>
                      <p className="text-sm text-foreground">
                        {reg2.regulationType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        CELEX ID
                      </p>
                      <p className="text-sm text-foreground">
                        {reg2.celexId || "N/A"}
                      </p>
                    </div>
                    {reg2.effectiveDate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Effective Date
                        </p>
                        <p className="text-sm text-foreground">
                          {new Date(reg2.effectiveDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        Description
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reg2.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                    <p className="text-xs font-medium text-secondary mb-2">
                      Applicable GS1 Standards
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In the demo dashboard, you can see which GS1 standards map
                      to this regulation with relevance scores.
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="mt-8 card-elevated p-6 bg-accent/5 border border-accent/20">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Comparison Insights
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Overlapping Standards:</strong> Both regulations
                    share common GS1 standards for supply chain data exchange
                    and product identification.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Unique to {reg1.regulationType}:</strong> Specific
                    standards required for {reg1.regulationType} compliance that
                    don't apply to {reg2.regulationType}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Implementation Strategy:</strong> Use ISA's
                    Knowledge Graph (v2.0) to identify shared standards and
                    optimize your data collection strategy.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Want to see detailed mappings and export these comparisons?
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-primary text-accent-foreground font-medium hover:shadow-lg transition"
                >
                  View Full Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!reg1 || !reg2) && (
            <div className="mt-12 text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-lg text-muted-foreground">
                Select two regulations to see a detailed comparison
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
