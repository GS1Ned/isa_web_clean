import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  MessageSquare,
  BarChart3,
  FileText,
  Building2,
  Truck,
  ShoppingCart,
  Wheat,
  Briefcase,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { NavigationMenu } from "@/components/NavigationMenu";
import { LatestNewsPanel } from "@/components/LatestNewsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Key regulations for quick access
const KEY_REGULATIONS = [
  {
    code: "CSRD",
    name: "Corporate Sustainability Reporting Directive",
    description: "Mandatory sustainability reporting for large companies",
    status: "Active",
    deadline: "2025",
    href: "/hub/regulations/1",
  },
  {
    code: "EUDR",
    name: "EU Deforestation Regulation",
    description: "Due diligence for deforestation-free supply chains",
    status: "Active",
    deadline: "Dec 2024",
    href: "/hub/regulations/6",
  },
  {
    code: "ESPR",
    name: "Ecodesign for Sustainable Products Regulation",
    description: "Digital Product Passport and ecodesign requirements",
    status: "Upcoming",
    deadline: "2027",
    href: "/hub/regulations/3",
  },
  {
    code: "CSDDD",
    name: "Corporate Sustainability Due Diligence Directive",
    description: "Human rights and environmental due diligence",
    status: "Upcoming",
    deadline: "2027",
    href: "/hub/regulations/7",
  },
];

// Industry categories for filtering
const INDUSTRIES = [
  { id: "retail", name: "Retail & Consumer Goods", icon: ShoppingCart },
  { id: "manufacturing", name: "Manufacturing", icon: Building2 },
  { id: "logistics", name: "Logistics & Transport", icon: Truck },
  { id: "food", name: "Food & Agriculture", icon: Wheat },
  { id: "services", name: "Corporate Services", icon: Briefcase },
];

// Example questions for Ask ISA
const EXAMPLE_QUESTIONS = [
  {
    question: "What CSRD disclosures apply to my company?",
    description: "Get personalized requirements based on your sector",
  },
  {
    question: "How does EUDR affect my coffee supply chain?",
    description: "Understand specific commodity requirements",
  },
  {
    question: "Which GS1 standards support DPP compliance?",
    description: "Map regulations to implementation standards",
  },
];

export default function Home() {
  useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/hub/regulations?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <NavigationMenu />

      {/* Hero Section - Task Focused */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-[1fr,420px] gap-12 items-start">
            {/* Hero Content - Left Side */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Intelligent Standards Architect
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Navigate EU ESG Compliance with Confidence
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                ISA maps EU sustainability regulations to GS1 standards, helping
                compliance teams, data architects, and executives understand
                requirements and take action.
              </p>

              {/* Quick Search */}
              <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search regulations, standards, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6">
                  Search
                </Button>
              </form>

              {/* Primary CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/ask">
                  <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="h-5 w-5" />
                    Ask ISA
                  </Button>
                </Link>
                <Link href="/hub">
                  <Button size="lg" variant="outline" className="gap-2">
                    Explore ESG Hub
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/tools/gap-analyzer">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Target className="h-5 w-5" />
                    Gap Analyzer
                  </Button>
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

      {/* Key Regulations Quick Access */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Key EU Regulations</h2>
            <Link href="/hub/regulations">
              <Button variant="ghost" className="gap-2">
                View all regulations
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KEY_REGULATIONS.map((reg) => (
              <Link key={reg.code} href={reg.href}>
                <Card className="h-full hover:shadow-md hover:border-blue-500 transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={reg.status === "Active" ? "default" : "secondary"}
                        className={reg.status === "Active" ? "bg-green-600" : ""}
                      >
                        {reg.status}
                      </Badge>
                      <span className="text-2xl font-bold text-blue-600">{reg.code}</span>
                    </div>
                    <CardTitle className="text-base leading-tight">{reg.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{reg.description}</CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {reg.deadline}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Selector */}
      <section className="py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Find Regulations by Industry</h2>
            <p className="text-muted-foreground">Select your industry to see relevant compliance requirements</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <Button
                  key={industry.id}
                  variant={selectedIndustry === industry.id ? "default" : "outline"}
                  className={`gap-2 ${selectedIndustry === industry.id ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => setSelectedIndustry(selectedIndustry === industry.id ? null : industry.id)}
                >
                  <Icon className="h-4 w-4" />
                  {industry.name}
                </Button>
              );
            })}
          </div>
          {selectedIndustry && (
            <div className="text-center">
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    {INDUSTRIES.find(i => i.id === selectedIndustry)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Key regulations affecting this sector
                  </p>
                  <Link href={`/hub/regulations?industry=${selectedIndustry}`}>
                    <Button className="gap-2">
                      View All {INDUSTRIES.find(i => i.id === selectedIndustry)?.name} Regulations
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Ask ISA Preview */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                AI-Powered Assistant
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ask ISA Anything About EU Compliance
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Get instant answers to your regulatory questions. ISA understands
                CSRD, EUDR, ESPR, CSDDD, and how they map to GS1 standards for your
                supply chain.
              </p>
              <div className="space-y-4">
                {EXAMPLE_QUESTIONS.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-border"
                  >
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">"{item.question}"</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/ask" className="inline-block mt-6">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-5 w-5" />
                  Start Asking ISA
                </Button>
              </Link>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-sm">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">ISA Knowledge Base</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">EU Regulations</span>
                    <span className="font-semibold text-foreground">38</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">ESRS Datapoints</span>
                    <span className="font-semibold text-foreground">1,184</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">GS1 Standards</span>
                    <span className="font-semibold text-foreground">60</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">AI Mappings</span>
                    <span className="font-semibold text-foreground">450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Overview */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Compliance Tools</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical tools to assess your compliance status and plan your implementation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/tools/gap-analyzer">
              <Card className="h-full hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Gap Analyzer</CardTitle>
                  <CardDescription>
                    Identify compliance gaps between your current state and regulatory requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    Start Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tools/impact-simulator">
              <Card className="h-full hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Impact Simulator</CardTitle>
                  <CardDescription>
                    Model the business impact of different compliance scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    Run Simulation
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tools/compliance-roadmap">
              <Card className="h-full hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Compliance Roadmap</CardTitle>
                  <CardDescription>
                    Generate a timeline-based implementation plan for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    Create Roadmap
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your ESG Compliance?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join organizations using ISA to navigate EU sustainability regulations with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/ask">
              <Button size="lg" variant="secondary" className="gap-2">
                <MessageSquare className="h-5 w-5" />
                Ask ISA
              </Button>
            </Link>
            <Link href="/hub">
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                Explore ESG Hub
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/getting-started">
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                Getting Started Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-lg">ISA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligent Standards Architect - Your AI-powered guide to EU ESG compliance and GS1 standards.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hub" className="text-muted-foreground hover:text-foreground">ESG Hub</Link></li>
                <li><Link href="/hub/regulations" className="text-muted-foreground hover:text-foreground">Regulations</Link></li>
                <li><Link href="/standards-directory" className="text-muted-foreground hover:text-foreground">Standards</Link></li>
                <li><Link href="/news" className="text-muted-foreground hover:text-foreground">News Hub</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ask" className="text-muted-foreground hover:text-foreground">Ask ISA</Link></li>
                <li><Link href="/tools/gap-analyzer" className="text-muted-foreground hover:text-foreground">Gap Analyzer</Link></li>
                <li><Link href="/tools/impact-simulator" className="text-muted-foreground hover:text-foreground">Impact Simulator</Link></li>
                <li><Link href="/epcis/upload" className="text-muted-foreground hover:text-foreground">EPCIS Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">About ISA</Link></li>
                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><a href="https://www.gs1.nl" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">GS1 Netherlands</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Intelligent Standards Architect. Built for GS1 Netherlands.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
