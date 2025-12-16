import { Link } from "wouter";
import { Zap, CheckCircle2, Clock, Zap as ZapIcon } from "lucide-react";

export default function FeaturesComparison() {
  const features = [
    {
      category: "Core Capabilities",
      items: [
        { name: "Regulatory Text Extraction", v03: true, v10: true, v20: true },
        { name: "OCR for Scanned Documents", v03: true, v10: true, v20: true },
        { name: "CELEX ID Lookup", v03: true, v10: true, v20: true },
        { name: "GS1 Standards Mapping", v03: true, v10: true, v20: true },
        { name: "Relevance Scoring", v03: true, v10: true, v20: true },
      ],
    },
    {
      category: "Data Access & Integration",
      items: [
        { name: "Streamlit UI", v03: true, v10: false, v20: false },
        { name: "REST API", v03: false, v10: true, v20: true },
        { name: "GraphQL API", v03: false, v10: false, v20: true },
        { name: "Webhook Support", v03: false, v10: true, v20: true },
        { name: "ERP/PIM Integration", v03: false, v10: true, v20: true },
      ],
    },
    {
      category: "Knowledge Graph & Analytics",
      items: [
        {
          name: "Regulation-Standard Mapping",
          v03: true,
          v10: true,
          v20: true,
        },
        {
          name: "Knowledge Graph (Semantic Network)",
          v03: false,
          v10: false,
          v20: true,
        },
        {
          name: "Impact Analysis & Traceability",
          v03: false,
          v10: false,
          v20: true,
        },
        {
          name: "Change Propagation Tracking",
          v03: false,
          v10: false,
          v20: true,
        },
        { name: "Advanced Query Engine", v03: false, v10: false, v20: true },
      ],
    },
    {
      category: "Export & Reporting",
      items: [
        { name: "JSON Export", v03: false, v10: true, v20: true },
        { name: "CSV Export", v03: false, v10: true, v20: true },
        { name: "PDF Reports", v03: false, v10: true, v20: true },
        { name: "HTML Dashboards", v03: false, v10: true, v20: true },
        { name: "Custom Report Builder", v03: false, v10: false, v20: true },
      ],
    },
    {
      category: "AI & Automation",
      items: [
        { name: "Text Normalization", v03: true, v10: true, v20: true },
        {
          name: "Regulatory Change Detection",
          v03: false,
          v10: true,
          v20: true,
        },
        { name: "AI-Powered Gap Analysis", v03: false, v10: false, v20: true },
        {
          name: "Compliance Recommendations",
          v03: false,
          v10: false,
          v20: true,
        },
        { name: "Multi-Language Support", v03: false, v10: false, v20: true },
      ],
    },
    {
      category: "Enterprise Features",
      items: [
        { name: "User Authentication", v03: false, v10: true, v20: true },
        { name: "Role-Based Access Control", v03: false, v10: true, v20: true },
        { name: "Audit Logging", v03: false, v10: true, v20: true },
        { name: "Data Encryption", v03: false, v10: true, v20: true },
        { name: "Multi-Tenant Support", v03: false, v10: false, v20: true },
      ],
    },
  ];

  const _getIcon = (v03: boolean, v10: boolean, v20: boolean) => {
    if (v20) return "v2.0";
    if (v10) return "v1.0";
    if (v03) return "v0.3";
    return "planned";
  };

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
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Features Roadmap
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              See how ISA evolves from v0.3 to v2.0, with progressive feature
              rollout and capability expansion.
            </p>
          </div>
        </div>
      </section>

      {/* Version Timeline */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent/20 text-accent mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                v0.3 (Current)
              </h3>
              <p className="text-sm text-muted-foreground">
                Core ingestion and mapping
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary/20 text-secondary mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                v1.0 (Q2 2025)
              </h3>
              <p className="text-sm text-muted-foreground">
                REST API & exports
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent/20 text-accent mb-4">
                <ZapIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                v2.0 (Q4 2025)
              </h3>
              <p className="text-sm text-muted-foreground">
                Knowledge Graph & AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison Table */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    v0.3
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    v1.0
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">
                    v2.0
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map(category => (
                  <tbody key={category.category}>
                    <tr className="border-b border-border bg-accent/5">
                      <td colSpan={4} className="py-3 px-4">
                        <h3 className="font-bold text-foreground text-sm">
                          {category.category}
                        </h3>
                      </td>
                    </tr>
                    {category.items.map(item => (
                      <tr
                        key={item.name}
                        className="border-b border-border hover:bg-accent/5 transition"
                      >
                        <td className="py-4 px-4 text-foreground">
                          {item.name}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.v03 ? (
                            <CheckCircle2 className="w-5 h-5 text-accent mx-auto" />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.v10 ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary mx-auto" />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.v20 ? (
                            <CheckCircle2 className="w-5 h-5 text-accent mx-auto" />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-foreground">Available</p>
                <p className="text-sm text-muted-foreground">
                  Feature is live and production-ready
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-foreground">Planned</p>
                <p className="text-sm text-muted-foreground">
                  Feature in active development
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded border border-border flex-shrink-0 mt-1"></div>
              <div>
                <p className="font-medium text-foreground">Not Included</p>
                <p className="text-sm text-muted-foreground">
                  Feature planned for future release
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Milestones */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Key Milestones
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elevated p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                v0.3 (Current)
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>Streamlit UI for exploration</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>PDF/CELEX ingestion</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>GS1 standards mapping</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>Relevance scoring</span>
                </li>
              </ul>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                v1.0 (Q2 2025)
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-secondary">→</span>
                  <span>Production REST API</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">→</span>
                  <span>JSON/CSV/PDF exports</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">→</span>
                  <span>User authentication</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">→</span>
                  <span>Change detection</span>
                </li>
              </ul>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                v2.0 (Q4 2025)
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">★</span>
                  <span>Knowledge Graph</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">★</span>
                  <span>AI-powered analytics</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">★</span>
                  <span>Impact analysis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">★</span>
                  <span>Multi-language support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore the current capabilities with our demo dashboard and see the
            future of regulatory standards mapping.
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
