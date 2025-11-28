import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Globe, TrendingUp, Shield, Lightbulb } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ISA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
              How It Works
            </Link>
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="/use-cases" className="text-sm text-muted-foreground hover:text-foreground transition">
              Use Cases
            </Link>
            <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition">
              Compare
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">
              Blog
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm font-medium text-accent hover:text-accent/80 transition">
                Dashboard
              </Link>
            ) : (
              <a href={getLoginUrl()} className="text-sm font-medium text-accent hover:text-accent/80 transition">
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span className="text-sm font-medium text-accent">Intelligent Standards Architect</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Map EU Regulations to GS1 Standards in Minutes
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              ISA bridges the gap between rapidly evolving EU sustainability regulations (CSRD, ESRS, DPP) and GS1 supply chain standards. Explore regulatory texts, discover applicable standards, and generate actionable compliance insights instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={getLoginUrl()} className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-primary text-accent-foreground font-medium hover:shadow-lg transition">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <Link href="#features" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-card transition">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section id="features" className="py-20 md:py-32 bg-card border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Revolutionary Capabilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ISA combines AI-powered analysis with a comprehensive knowledge graph to transform regulatory compliance into competitive advantage.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Insights",
                description: "From CELEX ID or document to actionable GS1 mapping in under 2 minutes. No manual research required."
              },
              {
                icon: Globe,
                title: "Standards Mapping",
                description: "Automatic detection and mapping of GS1 standards mentioned in regulatory texts with confidence scoring."
              },
              {
                icon: TrendingUp,
                title: "Compliance Tracking",
                description: "Monitor regulatory changes and receive alerts when new standards or requirements affect your operations."
              },
              {
                icon: Shield,
                title: "Traceability",
                description: "Stable links back to source documents and local SQLite storage for offline-friendly, auditable compliance."
              },
              {
                icon: Lightbulb,
                title: "AI-Powered Suggestions",
                description: "Intelligent recommendations for applicable standards based on your regulatory context and industry."
              },
              {
                icon: ArrowRight,
                title: "Enterprise Integration",
                description: "REST API (v1.0) and multiple export formats (JSON, CSV, HTML) for seamless ERP/PIM integration."
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card-elevated p-6">
                  <Icon className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 md:py-32 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Development Roadmap</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From current v0.3 to revolutionary v2.0 with Knowledge Graph and advanced analytics.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { version: "v0.3", status: "Current", focus: "Ingestion & UI", color: "from-accent" },
              { version: "v0.5", status: "Q1", focus: "Standards Loop", color: "from-accent" },
              { version: "v1.0", status: "Y+1", focus: "API & Packaging", color: "from-secondary" },
              { version: "v2.0", status: "Y+2", focus: "Knowledge Graph", color: "from-secondary" }
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.color} to-secondary/50 rounded-lg p-6 text-white`}>
                <div className="text-2xl font-bold mb-2">{item.version}</div>
                <div className="text-sm opacity-90 mb-3">{item.status}</div>
                <div className="text-sm font-medium">{item.focus}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-card border-t border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Transform Your Compliance?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forward-thinking organizations using ISA to bridge regulations and standards.
          </p>
          <a href={getLoginUrl()} className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-primary text-accent-foreground font-medium text-lg hover:shadow-lg transition">
            Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-accent-foreground" />
                </div>
                <span className="font-bold text-foreground">ISA</span>
              </div>
              <p className="text-sm text-muted-foreground">Intelligent Standards Architect</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#roadmap">Roadmap</Link></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#about">About</Link></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Intelligent Standards Architect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
