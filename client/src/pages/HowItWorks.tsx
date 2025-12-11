import { Link } from "wouter";
import { Zap, FileText, Lightbulb, BarChart3, ArrowRight } from "lucide-react";

export default function HowItWorks() {
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

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              How ISA Works
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              From regulatory text to actionable standards mapping in four
              intelligent steps.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-20 md:py-32 bg-card border-t border-border">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="mb-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold text-lg">
                      1
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                      Intelligent Ingestion
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Upload or link to regulatory documents from multiple
                    sources: PDFs, CELEX IDs, government websites, or GitHub
                    repositories. ISA automatically extracts text using OCR for
                    scanned documents and identifies key regulatory content.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        PDF extraction with OCR fallback
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        CELEX ID lookup and retrieval
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Web scraping and URL-based ingestion
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Batch processing for multiple documents
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg p-8 border border-accent/20 flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        Regulatory documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-20">
              <div className="flex flex-col items-center gap-2">
                <div className="w-1 h-12 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
                <ArrowRight className="w-6 h-6 text-accent rotate-90" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold text-lg">
                      2
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                      Standards Normalization
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    ISA analyzes the extracted text and identifies mentions of
                    GS1 standards. Our canonical standards dictionary and
                    normalization engine match regulatory requirements to
                    applicable GS1 standards with confidence scoring.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Semantic text analysis
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Canonical standards matching
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Relevance scoring (0-100%)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Duplicate and overlap detection
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg p-8 border border-secondary/20 flex items-center justify-center h-64">
                    <div className="text-center">
                      <Lightbulb className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Standards mapping</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-20">
              <div className="flex flex-col items-center gap-2">
                <div className="w-1 h-12 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
                <ArrowRight className="w-6 h-6 text-secondary rotate-90" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg p-8 border border-accent/20 flex items-center justify-center h-64">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Knowledge Graph</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold text-lg">
                      3
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                      Knowledge Graph (v2.0)
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Build a semantic network connecting regulations, standards,
                    and artifacts. This enables complex queries, impact
                    analysis, and regulatory change tracking across your entire
                    compliance landscape.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Semantic relationship mapping
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Impact analysis and traceability
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Change propagation tracking
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Advanced querying capabilities
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-20">
              <div className="flex flex-col items-center gap-2">
                <div className="w-1 h-12 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
                <ArrowRight className="w-6 h-6 text-accent rotate-90" />
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold text-lg">
                      4
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                      Actionable Insights
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Export results in multiple formats, access via REST API, or
                    explore through interactive dashboards. ISA delivers
                    compliance intelligence in the format your team needs.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        JSON, CSV, HTML exports
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        REST API (v1.0+)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        Interactive dashboards
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-muted-foreground">
                        ERP/PIM system integration
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg p-8 border border-secondary/20 flex items-center justify-center h-64">
                    <div className="text-center">
                      <Zap className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        Compliance insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Why This Approach?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Speed
              </h3>
              <p className="text-sm text-muted-foreground">
                From document to standards mapping in under 2 minutes. No manual
                research required.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Accuracy
              </h3>
              <p className="text-sm text-muted-foreground">
                Confidence scoring and canonical standards dictionary ensure low
                false positives.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Scalability
              </h3>
              <p className="text-sm text-muted-foreground">
                Process hundreds of regulations and standards simultaneously
                with consistent quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-card border-t border-border">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to See It in Action?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore the interactive demo dashboard to see how ISA maps
            regulations to GS1 standards.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-primary text-accent-foreground font-medium text-lg hover:shadow-lg transition"
          >
            View Demo Dashboard
          </Link>
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
