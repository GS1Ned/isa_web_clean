import { Link } from "wouter";
import { Zap, Target, Lightbulb } from "lucide-react";

export default function About() {
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
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              About ISA
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Intelligent Standards Architect is a revolutionary RegTech
              platform designed to bridge the gap between EU sustainability
              regulations and GS1 supply chain standards.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-32 bg-card border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Make EU sustainability and regulatory texts instantly explorable
                and mappable to GS1 standards, producing actionable insights and
                data outputs through an approachable, app-like experience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                We believe that compliance should be a competitive advantage,
                not a burden. By automating the reconciliation of regulations
                with standards, we enable organizations to focus on what matters
                most: sustainable business practices.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-secondary" />
                <h2 className="text-3xl font-bold text-foreground">
                  Our Vision
                </h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A world where organizations of all sizes can instantly
                understand how EU regulations apply to their operations and
                which GS1 standards deliver compliance.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                We envision a future where regulatory change is tracked in
                real-time, impact analysis is automated, and compliance is
                achieved through intelligent data exchange across the entire
                value chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            The Problem We Solve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Regulatory Complexity
              </h3>
              <p className="text-sm text-muted-foreground">
                EU sustainability regulations (CSRD, ESRS, DPP) evolve rapidly,
                creating compliance challenges for organizations across
                industries.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Standards Fragmentation
              </h3>
              <p className="text-sm text-muted-foreground">
                GS1 standards exist in a separate ecosystem. Teams struggle to
                reconcile what the law says with which standards deliver it.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Time-to-Insight
              </h3>
              <p className="text-sm text-muted-foreground">
                Manual research and analysis consume weeks. Organizations need
                instant, reliable answers to stay compliant and competitive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 md:py-32 bg-card border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Our Approach
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Intelligent Ingestion
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically extract regulatory text from PDFs, CELEX IDs,
                  websites, and GitHub repositories. OCR-powered fallback
                  ensures no document is left behind.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Standards Normalization
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Apply canonical standards dictionary and normalization rules
                  to identify applicable GS1 standards with confidence scoring.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Knowledge Graph
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Build a semantic network connecting regulations, standards,
                  and artifacts for complex querying and impact analysis (v2.0).
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-accent-foreground font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Actionable Insights
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate JSON/CSV/HTML exports, API access, and dashboards
                  that enable teams to act on compliance requirements instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Compliance?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forward-thinking organizations using ISA to bridge regulations
            and standards.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-primary text-accent-foreground font-medium text-lg hover:shadow-lg transition"
          >
            Get Started
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
