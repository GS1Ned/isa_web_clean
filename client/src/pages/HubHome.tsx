import { Link } from "wouter";
import { Zap, TrendingUp, Calendar, BookOpen, AlertCircle, Search, ArrowRight, BookOpen as BookOpenIcon, Grid3x3, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HubHome() {
  const upcomingDeadlines = [
    { date: "Jan 15, 2025", regulation: "CSRD", description: "Large companies reporting deadline" },
    { date: "Feb 28, 2025", regulation: "EUDR", description: "Deforestation due diligence implementation" },
    { date: "Mar 31, 2025", regulation: "DPP", description: "Digital Product Passport pilot phase" },
  ];

  const recentUpdates = [
    { title: "CSRD Amendment Proposed", type: "AMENDMENT", date: "Nov 27, 2024" },
    { title: "ESRS Implementation Guidance Released", type: "GUIDANCE", date: "Nov 25, 2024" },
    { title: "EU Taxonomy Update: New Activities Included", type: "UPDATE", date: "Nov 22, 2024" },
    { title: "EUDR Enforcement Actions Begin", type: "ENFORCEMENT", date: "Nov 20, 2024" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ISA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/hub/regulations" className="text-sm text-muted-foreground hover:text-foreground transition">
              Regulations
            </Link>
            <Link href="/hub/news" className="text-sm text-muted-foreground hover:text-foreground transition">
              News
            </Link>
            <Link href="/hub/calendar" className="text-sm text-muted-foreground hover:text-foreground transition">
              Calendar
            </Link>
            <Link href="/hub/standards-mapping" className="text-sm text-muted-foreground hover:text-foreground transition">
              Standards
            </Link>
            <Link href="/hub/resources" className="text-sm text-muted-foreground hover:text-foreground transition">
              Resources
            </Link>
            <Link href="/" className="text-sm font-medium text-accent hover:text-accent/80 transition">
              Back to ISA
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent">
        <div className="container">
          <div className="max-w-4xl">
            <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              ESG Regulations Knowledge & News Hub
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Single Source of Truth for ESG Regulatory Intelligence
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Stay ahead of EU sustainability regulations. Track CSRD, ESRS, DPP, EUDR, and 50+ other regulations affecting your supply chain. Updated daily with expert analysis of GS1 standards impact.
            </p>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search regulations, standards, deadlines..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/hub/regulations">
                <Button className="bg-gradient-primary text-accent-foreground hover:shadow-lg transition">
                  Explore Regulations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/hub/calendar">
                <Button variant="outline">
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card-elevated p-6">
              <div className="text-3xl font-bold text-accent mb-2">50+</div>
              <p className="text-sm text-muted-foreground">Active ESG Regulations Tracked</p>
            </div>
            <div className="card-elevated p-6">
              <div className="text-3xl font-bold text-accent mb-2">12</div>
              <p className="text-sm text-muted-foreground">GS1 Standards Mapped</p>
            </div>
            <div className="card-elevated p-6">
              <div className="text-3xl font-bold text-accent mb-2">Daily</div>
              <p className="text-sm text-muted-foreground">Content Updates</p>
            </div>
            <div className="card-elevated p-6">
              <div className="text-3xl font-bold text-accent mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Authoritative Sources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground mb-8">Upcoming Deadlines</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingDeadlines.map((deadline, idx) => (
              <div key={idx} className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-accent mb-2">{deadline.date}</div>
                    <h3 className="font-semibold text-foreground mb-1">{deadline.regulation}</h3>
                    <p className="text-sm text-muted-foreground">{deadline.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Recent Updates</h2>
            <Link href="/hub/news">
              <button className="text-accent hover:text-accent/80 transition font-medium text-sm">
                View All News
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentUpdates.map((update, idx) => (
              <div key={idx} className="card-elevated p-6 hover:border-accent transition">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        {update.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{update.date}</span>
                    </div>
                    <h3 className="font-semibold text-foreground hover:text-accent transition cursor-pointer">
                      {update.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hub Features */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground mb-12">Hub Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Regulation Explorer</h3>
              <p className="text-sm text-muted-foreground">
                Interactive dashboard with 50+ regulations. Filter by status, timeline, industry, and GS1 standards impact.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Daily News Feed</h3>
              <p className="text-sm text-muted-foreground">
                Curated updates on new laws, amendments, enforcement actions, and guidance from authoritative sources.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Compliance Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Track all deadlines, enforcement dates, and reporting windows. Set alerts for key dates.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Standards Mapping</h3>
              <p className="text-sm text-muted-foreground">
                See which GS1 standards are required or recommended by each regulation. Implementation checklists included.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Advanced Search</h3>
              <p className="text-sm text-muted-foreground">
                Find regulations by name, keyword, industry, GS1 standard, or timeline. Save custom filters.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified of regulation updates, approaching deadlines, and enforcement actions relevant to your interests.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Resource Library</h3>
              <p className="text-sm text-muted-foreground">
                Download guides, checklists, templates, and case studies for implementing regulations with GS1 standards.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Grid3x3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Impact Matrix</h3>
              <p className="text-sm text-muted-foreground">
                Visualize regulation overlaps, dependencies, and which GS1 standards satisfy multiple requirements.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Personal Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Save regulations, set custom alerts, and track your compliance progress with personalized insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Stay Compliant?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start exploring the ESG Regulations Hub today. Get daily updates, track deadlines, and understand how regulations affect your GS1 standards.
            </p>
            <Link href="/hub/regulations">
              <Button className="bg-gradient-primary text-accent-foreground hover:shadow-lg transition">
                Explore the Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Intelligent Standards Architect - ESG Regulations Hub. Updated daily.</p>
        </div>
      </footer>
    </div>
  );
}
