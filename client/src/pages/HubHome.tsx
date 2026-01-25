import { Link } from "wouter";
import {
  Zap,

  Calendar,

  AlertCircle,

  ArrowRight,
  Database,
  Sparkles,
  Shield,
  FileText,
  BarChart3,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HubHome() {
  const upcomingDeadlines = [
    {
      date: "Jan 1, 2025",
      regulation: "CSRD",
      description: "Large companies first reporting period begins",
      severity: "critical",
    },
    {
      date: "Jun 30, 2025",
      regulation: "EUDR",
      description: "Deforestation due diligence mandatory for all operators",
      severity: "critical",
    },
    {
      date: "Dec 31, 2026",
      regulation: "ESRS",
      description: "First full ESRS disclosure reports due",
      severity: "important",
    },
  ];

  const quickStartUseCases = [
    {
      title: "CSRD Compliance Planning",
      description:
        "Map CSRD requirements to ESRS datapoints and identify applicable GS1 standards",
      icon: Target,
      link: "/hub/regulations",
      action: "Start Planning",
    },
    {
      title: "EUDR Supply Chain Mapping",
      description:
        "Identify deforestation risks and map GS1 traceability standards to EUDR requirements",
      icon: Shield,
      link: "/hub/standards-mapping",
      action: "Map Standards",
    },
    {
      title: "ESRS Disclosure Preparation",
      description:
        "Browse 1,184 ESRS datapoints and understand which apply to your organization",
      icon: FileText,
      link: "/hub/esrs-datapoints",
      action: "Explore Datapoints",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">
              ISA ESG Hub
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/hub/regulations"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Regulations
            </Link>
            <Link
              href="/hub/esrs-datapoints"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              ESRS Datapoints
            </Link>
            <Link
              href="/hub/standards-mapping"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              GS1 Standards
            </Link>
            <Link
              href="/hub/news"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              News
            </Link>
            <Link
              href="/hub/calendar"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Calendar
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Back to ISA
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Value-Driven */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 via-blue-25 to-transparent dark:from-blue-950/20 dark:via-blue-950/10">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex items-center justify-center mb-6">
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered ESG Regulation Intelligence
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-center text-foreground mb-6 leading-tight">
              Map EU Regulations to GS1 Standards
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                in Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-center text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
              The only platform combining{" "}
              <strong>38 EU sustainability regulations</strong>,{" "}
              <strong>1,184 ESRS datapoints</strong>, and{" "}
              <strong>60 GS1 standards</strong> with{" "}
              <strong>450 AI-powered mappings</strong>. Auto-updated daily from
              official sources.
            </p>

            {/* Statistics Showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-border">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  38
                </div>
                <div className="text-sm text-muted-foreground">
                  EU Regulations
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-border">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  1,184
                </div>
                <div className="text-sm text-muted-foreground">
                  ESRS Datapoints
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-border">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  60
                </div>
                <div className="text-sm text-muted-foreground">
                  GS1 Standards
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-border">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  450
                </div>
                <div className="text-sm text-muted-foreground">AI Mappings</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/hub/regulations">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Explore Regulations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/hub/esrs-datapoints">
                <Button size="lg" variant="outline">
                  Search ESRS Datapoints
                  <Database className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/hub/standards-mapping">
                <Button size="lg" variant="outline">
                  Try AI Mapping
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start - Use Cases */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Quick Start
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your compliance challenge and get actionable insights in
              under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {quickStartUseCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <Card
                  key={idx}
                  className="hover:border-blue-500 transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={useCase.link}>
                      <Button variant="outline" className="w-full">
                        {useCase.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Feature Grid */}
      <section className="py-16 border-b border-border bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Platform Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for ESG compliance intelligence in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">Regulation Explorer</CardTitle>
                <CardDescription className="text-sm">
                  Browse 38 EU regulations with full-text search, filtering, and
                  impact analysis
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">
                  ESRS Datapoints Library
                </CardTitle>
                <CardDescription className="text-sm">
                  Explore 1,184 official ESRS disclosure datapoints with search
                  and filtering
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base">
                  GS1 Standards Catalog
                </CardTitle>
                <CardDescription className="text-sm">
                  Comprehensive catalog of 60 GS1 standards mapped to EU
                  regulations
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-base">AI-Powered Mapping</CardTitle>
                <CardDescription className="text-sm">
                  450 intelligent mappings between regulations and ESRS
                  datapoints
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-base">
                  Regulatory News Feed
                </CardTitle>
                <CardDescription className="text-sm">
                  Curated news from EU Commission, EFRAG, and GS1 sources
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-base">
                  Regulation Comparison
                </CardTitle>
                <CardDescription className="text-sm">
                  Side-by-side comparison showing overlaps and dependencies
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Critical Upcoming Deadlines
              </h2>
              <p className="text-muted-foreground">
                Stay ahead of enforcement dates and reporting windows
              </p>
            </div>
            <Link href="/hub/calendar">
              <Button variant="outline">
                View Full Calendar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingDeadlines.map((deadline, idx) => (
              <Card
                key={idx}
                className={`border-l-4 ${deadline.severity === "critical" ? "border-l-red-500" : "border-l-yellow-500"}`}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Calendar
                      className={`w-5 h-5 flex-shrink-0 mt-1 ${deadline.severity === "critical" ? "text-red-500" : "text-yellow-500"}`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        {deadline.date}
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {deadline.regulation}
                      </CardTitle>
                      <CardDescription>{deadline.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Data Sources */}
      <section className="py-16 border-b border-border bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Trusted Data Sources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All data sourced from official EU and industry authorities,
              auto-updated daily
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                CELLAR Database
              </h3>
              <p className="text-sm text-muted-foreground">
                Official EU legal database with monthly auto-sync for regulation
                updates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">EFRAG ESRS</h3>
              <p className="text-sm text-muted-foreground">
                Official ESRS datapoints from European Financial Reporting
                Advisory Group
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                GS1 Standards
              </h3>
              <p className="text-sm text-muted-foreground">
                Curated catalog from GS1 Netherlands and global standards
                documentation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your ESG Compliance?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join GS1 Netherlands network members using ISA ESG Hub to save
              hours of manual research and stay ahead of regulatory changes.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/hub/regulations">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Exploring
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/getting-started">
                <Button size="lg" variant="outline">
                  View Getting Started Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">ESG Hub</h4>
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
                    href="/hub/compare"
                    className="hover:text-foreground transition"
                  >
                    Comparison Tool
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/hub/news"
                    className="hover:text-foreground transition"
                  >
                    News Feed
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hub/calendar"
                    className="hover:text-foreground transition"
                  >
                    Compliance Calendar
                  </Link>
                </li>
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
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition"
                  >
                    About ISA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground transition">
                    Back to ISA Home
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
            <p>
              &copy; 2025 Intelligent Standards Architect - ESG Hub. Data
              updated daily from official sources.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
