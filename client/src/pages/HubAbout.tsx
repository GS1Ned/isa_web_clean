import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Sparkles,
  Database,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  FileText,
  Globe,
  Zap,
  HelpCircle,
} from "lucide-react";

export default function HubAbout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-blue-600 text-white">
              AI-Powered Intelligence
            </Badge>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Navigate EU Sustainability Regulations with Confidence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              The ESG Hub is GS1 Netherlands' intelligent platform for mapping
              EU sustainability regulations to GS1 supply chain standards. Built
              on official data sources and powered by advanced AI, we transform
              regulatory complexity into actionable compliance insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/hub/regulations">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Explore 38 Regulations <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/getting-started">
                <Button size="lg" variant="outline">
                  Getting Started Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why ESG Hub?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The only platform that combines official EU regulatory data with
              AI-powered GS1 standards mapping
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <Sparkles className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>AI-Powered Mapping</CardTitle>
                <CardDescription>
                  450 intelligent regulation-to-standard mappings with
                  confidence scores. Our AI analyzes regulatory text to identify
                  applicable GS1 standards automatically.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <Database className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Official Data Sources</CardTitle>
                <CardDescription>
                  Auto-synced with EUR-Lex CELLAR (38 regulations), EFRAG IG 3
                  (1,184 ESRS datapoints), and GS1 Global Office (60 standards).
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <Shield className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Built for GS1 Netherlands</CardTitle>
                <CardDescription>
                  Tailored for supply chain professionals navigating CSRD, EUDR,
                  ESRS, DPP, and PPWR compliance requirements.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform regulatory complexity into
              actionable insights
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Explore Regulations
              </h3>
              <p className="text-muted-foreground">
                Browse 38 EU sustainability regulations with full-text search,
                filtering by topic, and recently updated indicators. Access
                official EUR-Lex sources with one click.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Discover AI Mappings
              </h3>
              <p className="text-muted-foreground">
                Our AI analyzes regulatory text and identifies applicable GS1
                standards with confidence scores. See which standards (GTIN,
                GLN, EPCIS, etc.) apply to your compliance requirements.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Take Action</h3>
              <p className="text-muted-foreground">
                Export mappings, track compliance deadlines, and access ESRS
                datapoints to build your sustainability reporting strategy with
                confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted Data Sources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every regulation, datapoint, and standard comes from official,
              authoritative sources
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Globe className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>EUR-Lex CELLAR</CardTitle>
                <CardDescription className="space-y-2">
                  <p>
                    Official EU legislation database maintained by the
                    Publications Office of the European Union.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Auto-synced monthly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>38 sustainability regulations</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle>EFRAG IG 3</CardTitle>
                <CardDescription className="space-y-2">
                  <p>
                    European Financial Reporting Advisory Group's Implementation
                    Guidance for ESRS disclosure requirements.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Official EFRAG publication</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>1,184 ESRS datapoints</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>GS1 Global Office</CardTitle>
                <CardDescription className="space-y-2">
                  <p>
                    Curated catalog of GS1 supply chain standards from GS1
                    Global Office and GS1 Netherlands expertise.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Maintained by GS1 experts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>60 standards cataloged</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Methodology */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-600 text-white">
                Transparency & Accuracy
              </Badge>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                AI Mapping Methodology
              </h2>
              <p className="text-lg text-muted-foreground">
                How we ensure accurate, reliable regulation-to-standard mappings
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                      1
                    </span>
                    Text Analysis
                  </h3>
                  <p className="text-muted-foreground ml-10">
                    Our AI analyzes the full text of each EU regulation,
                    identifying mentions of supply chain concepts, traceability
                    requirements, product identification, and data exchange
                    standards.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">
                      2
                    </span>
                    Semantic Matching
                  </h3>
                  <p className="text-muted-foreground ml-10">
                    We match regulatory requirements to GS1 standards using
                    semantic similarity, considering synonyms, related concepts,
                    and domain-specific terminology (e.g., "product identifier"
                    → GTIN).
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                      3
                    </span>
                    Confidence Scoring
                  </h3>
                  <p className="text-muted-foreground ml-10">
                    Each mapping receives a confidence score (0-100%) based on
                    text similarity, keyword frequency, and contextual
                    relevance. High-confidence mappings (80%+) indicate strong
                    regulatory-standard alignment.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm">
                      4
                    </span>
                    Expert Validation
                  </h3>
                  <p className="text-muted-foreground ml-10">
                    GS1 Netherlands experts review AI-generated mappings to
                    ensure accuracy and relevance. Users can provide feedback to
                    improve mapping quality over time.
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> AI mappings are provided as guidance to
                help identify potentially applicable GS1 standards.
                Organizations should conduct their own compliance assessments
                and consult legal experts for definitive regulatory
                interpretation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Real-World Use Cases
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              How GS1 Netherlands members use ESG Hub to navigate sustainability
              compliance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>CSRD Reporting Preparation</CardTitle>
                <CardDescription>
                  A food manufacturer uses ESG Hub to identify which ESRS
                  datapoints apply to their operations, then maps required data
                  to existing GS1 GTIN and GLN systems for efficient
                  sustainability reporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Explored ESRS E1-E5 datapoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Mapped to GTIN product data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Reduced reporting prep time by 60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>EUDR Supply Chain Mapping</CardTitle>
                <CardDescription>
                  A timber importer uses ESG Hub to understand EUDR geolocation
                  requirements, then implements EPCIS events to track
                  deforestation-free supply chains with automated compliance
                  reporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Reviewed EUDR Article 9 requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Implemented EPCIS ObjectEvents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Achieved 100% supply chain visibility</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>DPP Readiness Assessment</CardTitle>
                <CardDescription>
                  An electronics manufacturer uses ESG Hub to prepare for
                  Digital Product Passport requirements, mapping product data to
                  GS1 Digital Link and planning EPCIS integration for circular
                  economy tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Analyzed DPP data requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Designed GS1 Digital Link strategy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Ready for 2026 DPP enforcement</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Is ESG Hub data updated automatically?
                  </CardTitle>
                  <CardDescription>
                    Yes. EU regulations are synced monthly from EUR-Lex CELLAR
                    to ensure you always have the latest regulatory text and
                    amendments. ESRS datapoints and GS1 standards are updated
                    quarterly or as new versions are published.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I trust the AI mappings for compliance decisions?
                  </CardTitle>
                  <CardDescription>
                    AI mappings are provided as guidance to help identify
                    potentially applicable standards. While our AI achieves high
                    accuracy (85%+ confidence on most mappings), we recommend
                    conducting your own compliance assessment and consulting
                    legal experts for definitive regulatory interpretation.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Which regulations are covered?
                  </CardTitle>
                  <CardDescription>
                    We currently cover 38 EU sustainability regulations
                    including CSRD (2022/2464), EUDR (2023/1115), ESRS
                    standards, Digital Product Passport (Ecodesign Regulation),
                    PPWR (Packaging Regulation), Battery Regulation, and more.
                    See the full list in the Regulation Explorer.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    How do I export data for my ERP system?
                  </CardTitle>
                  <CardDescription>
                    Most pages include export buttons for JSON, CSV, and PDF
                    formats. For API access and bulk exports, contact GS1
                    Netherlands to discuss enterprise integration options.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Who maintains ESG Hub?
                  </CardTitle>
                  <CardDescription>
                    ESG Hub is developed and maintained by GS1 Netherlands as
                    part of our commitment to helping members navigate EU
                    sustainability regulations. The platform is continuously
                    improved based on user feedback and regulatory updates.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Navigate EU Sustainability Regulations?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join GS1 Netherlands members using ESG Hub to transform regulatory
            complexity into competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hub/regulations">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Explore Regulations <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/getting-started">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Getting Started Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
