import { useAuth } from "@/_core/hooks/useAuth";

import {
  ArrowRight,
  Zap,
  Globe,
  TrendingUp,
  Shield,
  
  FileText,
  Database,
  Sparkles,
} from "lucide-react";

import { Link } from "wouter";
import { NavigationMenu } from "@/components/NavigationMenu";
import { LatestNewsPanel } from "@/components/LatestNewsPanel";

export default function Home() {
  useAuth(); // Auth context for potential future use

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <NavigationMenu />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-[1fr,420px] gap-12 items-start">
            {/* Hero Content - Left Side */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                <span className="text-sm font-medium text-accent">
                  Intelligent Standards Architect
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Map EU Regulations to GS1 Standards in Minutes
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                ISA bridges the gap between rapidly evolving EU sustainability
                regulations (CSRD, ESRS, DPP) and GS1 supply chain standards.
                Explore regulatory texts, discover applicable standards, and
                generate actionable compliance insights instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/hub"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                  Explore ESG Hub <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/getting-started"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-border text-foreground font-semibold text-lg hover:bg-card hover:border-blue-600 transition"
                >
                  Getting Started Guide
                </Link>
              </div>
            </div>

            {/* Latest News - Right Side (Desktop) */}
            <div className="hidden lg:block">
              <LatestNewsPanel />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News - Mobile */}
      <div className="lg:hidden">
        <LatestNewsPanel />
      </div>

      {/* Statistics Bar */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">38</div>
              <div className="text-sm md:text-base text-blue-100">
                EU Regulations
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1,184</div>
              <div className="text-sm md:text-base text-blue-100">
                ESRS Datapoints
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">60</div>
              <div className="text-sm md:text-base text-blue-100">
                GS1 Standards
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">450</div>
              <div className="text-sm md:text-base text-blue-100">
                AI Mappings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESG Hub Features */}
      <section id="features" className="py-20 md:py-32 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              ESG Hub Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for navigating EU sustainability regulations
              and GS1 standards with AI-powered intelligence.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Regulation Explorer",
                description:
                  "Browse 38 EU sustainability regulations with full-text search, filtering, and AI-powered insights. Auto-synced with EUR-Lex CELLAR database.",
              },
              {
                icon: Database,
                title: "ESRS Datapoints Library",
                description:
                  "Explore 1,184 official EFRAG disclosure requirements across all ESRS standards. Filter by topic, data type, and compliance level.",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Mapping",
                description:
                  "450 intelligent regulation-to-standard mappings with confidence scores. Discover which GS1 standards apply to your compliance requirements.",
              },
              {
                icon: Globe,
                title: "GS1 Standards Catalog",
                description:
                  "Comprehensive catalog of 60 GS1 supply chain standards with detailed descriptions, use cases, and regulatory connections.",
              },
              {
                icon: TrendingUp,
                title: "Regulatory News Feed",
                description:
                  "Stay updated with the latest EU sustainability regulation announcements, amendments, and implementation guidance.",
              },
              {
                icon: Shield,
                title: "Compliance Calendar",
                description:
                  "Track critical deadlines, effective dates, and enforcement timelines for CSRD, EUDR, ESRS, DPP, and PPWR regulations.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="card-elevated p-6 hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EPCIS Tools Preview */}
      <section className="py-20 md:py-32 bg-card border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 mb-6">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Coming Soon
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Supply Chain Traceability
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              EPCIS-powered supply chain visualization, EUDR compliance mapping,
              and real-time traceability analytics.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "EPCIS Event Tracking",
                description:
                  "Upload and visualize supply chain events with interactive flow diagrams and geolocation mapping.",
              },
              {
                title: "EUDR Compliance Map",
                description:
                  "Map deforestation-free supply chains with geofencing, risk scoring, and automated compliance reporting.",
              },
              {
                title: "Supply Chain Analytics",
                description:
                  "Real-time dashboards for supply chain visibility, risk assessment, and sustainability metrics.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-border bg-background/50"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Navigate EU Sustainability Regulations?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join GS1 Netherlands and forward-thinking organizations using ISA to
            bridge regulations and standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hub"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
            >
              Explore ESG Hub <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold text-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
            >
              View All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-foreground">ISA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligent Standards Architect for GS1 Netherlands
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">ESG Hub</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/hub/regulations"
                    className="hover:text-foreground transition"
                  >
                    Regulations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hub/esrs-datapoints"
                    className="hover:text-foreground transition"
                  >
                    ESRS Datapoints
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hub/standards-mapping"
                    className="hover:text-foreground transition"
                  >
                    GS1 Standards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hub/news"
                    className="hover:text-foreground transition"
                  >
                    News Feed
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/getting-started"
                    className="hover:text-foreground transition"
                  >
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-foreground transition"
                  >
                    All Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-foreground transition"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.gs1.nl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition"
                  >
                    GS1 Netherlands
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 Intelligent Standards Architect. Built for GS1
              Netherlands.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
