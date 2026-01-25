import { useState } from "react";
import { Link } from "wouter";
import { Zap, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqItems = [
    {
      id: "what-is-isa",
      category: "About ISA",
      question: "What is the Intelligent Standards Architect (ISA)?",
      answer:
        "ISA is a RegTech platform that bridges the gap between EU sustainability regulations (CSRD, ESRS, DPP) and GS1 supply chain standards. It enables organizations to quickly map compliance requirements to data standards, reducing implementation time from months to days.",
    },
    {
      id: "how-does-isa-work",
      category: "How It Works",
      question: "How does ISA map regulations to GS1 standards?",
      answer:
        "ISA uses a four-step process: (1) Ingestion - extract regulatory text from CELEX or documents, (2) Normalization - parse and structure the requirements, (3) Knowledge Graph - map requirements to applicable GS1 standards, (4) Insights - generate actionable compliance recommendations.",
    },
    {
      id: "who-uses-isa",
      category: "Use Cases",
      question: "Who should use ISA?",
      answer:
        "ISA is designed for GS1 consultants, regulatory analysts, supply chain practitioners, and companies implementing EU compliance requirements. It's particularly valuable for organizations managing multiple regulations across different product categories.",
    },
    {
      id: "csrd-compliance",
      category: "Compliance",
      question: "How does ISA help with CSRD compliance?",
      answer:
        "The Corporate Sustainability Reporting Directive (CSRD) requires detailed supply chain data. ISA maps CSRD requirements to GS1 standards (GTIN, EPCIS, Digital Product Passport) so you can structure your data correctly from the start, reducing compliance risk and implementation costs.",
    },
    {
      id: "esrs-standards",
      category: "Compliance",
      question: "What are ESRS and how does ISA support them?",
      answer:
        "The European Sustainability Reporting Standards (ESRS) define how companies must report sustainability data. ISA maps ESRS requirements to GS1 data standards, enabling you to collect and report sustainability information using standardized supply chain formats.",
    },
    {
      id: "dpp-definition",
      category: "Standards",
      question: "What is a Digital Product Passport (DPP)?",
      answer:
        "A Digital Product Passport is a digital record containing product information required by EU regulations. It includes sustainability data, material composition, and supply chain details. ISA shows how GS1 standards (GTIN, EPCIS, Core Business Vocabulary) support DPP implementation.",
    },
    {
      id: "gs1-standards",
      category: "Standards",
      question: "Which GS1 standards does ISA cover?",
      answer:
        "ISA covers key GS1 standards including GTIN (product identification), EPCIS (event data), Digital Product Passport, Core Business Vocabulary (CBV), and others. The platform continuously expands coverage as new standards emerge.",
    },
    {
      id: "eudr-traceability",
      category: "Compliance",
      question:
        "How does ISA support EU Deforestation Regulation (EUDR) compliance?",
      answer:
        "The EUDR mandates supply chain traceability for forest-risk commodities. ISA maps EUDR requirements to GS1 standards for product identification and supply chain tracking, enabling you to demonstrate compliance with traceability obligations.",
    },
    {
      id: "data-security",
      category: "Security",
      question: "How secure is ISA?",
      answer:
        "ISA is built with enterprise-grade security including encrypted data transmission, secure authentication, role-based access control, and regular security audits. All data is stored in secure, compliant infrastructure. Contact our team for detailed security documentation.",
    },
    {
      id: "implementation-time",
      category: "Implementation",
      question: "How long does ISA implementation take?",
      answer:
        "ISA significantly accelerates compliance implementation. Typical projects that took 3-6 months can now be completed in 2-4 weeks. The exact timeline depends on your organization's complexity and regulatory scope.",
    },
    {
      id: "demo-access",
      category: "Getting Started",
      question: "How can I access the ISA demo?",
      answer:
        "You can explore the interactive demo dashboard by logging in or requesting demo access. Visit the Dashboard page to explore sample regulations and their mapped GS1 standards in real-time.",
    },
    {
      id: "integration-support",
      category: "Technical",
      question: "Does ISA integrate with existing systems?",
      answer:
        "Yes. ISA provides REST APIs (v1.0) and data export capabilities (JSON, CSV, PDF) for integration with your existing systems. Our team can help with custom integrations and data mapping.",
    },
    {
      id: "pricing",
      category: "Pricing",
      question: "What is ISA's pricing model?",
      answer:
        "ISA offers flexible pricing based on your organization's size and regulatory scope. Contact our sales team for a customized quote. We offer free trials and pilot programs for qualified organizations.",
    },
    {
      id: "support",
      category: "Support",
      question: "What support is available?",
      answer:
        "We provide comprehensive support including onboarding assistance, training, technical support, and ongoing regulatory updates. Premium support packages include dedicated account management and custom development.",
    },
    {
      id: "roadmap",
      category: "Product",
      question: "What's on the ISA roadmap?",
      answer:
        "ISA is evolving from v0.3 (current) to v1.0 (REST API, advanced analytics) and v2.0 (Knowledge Graph, AI-driven insights). Visit the Features page to see detailed roadmap timelines and planned capabilities.",
    },
  ];

  const filteredItems = faqItems.filter(
    item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const _categories = [
    "All",
    ...Array.from(new Set(faqItems.map(item => item.category))),
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Help & FAQ
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Find answers to common questions about ISA, regulatory compliance,
              GS1 standards, and implementation.
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 py-3 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="max-w-3xl">
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="card-elevated overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full px-6 py-4 flex items-start justify-between hover:bg-accent/5 transition"
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.question}
                        </h3>
                      </div>
                      {expandedId === item.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
                      )}
                    </button>

                    {expandedId === item.id && (
                      <div className="px-6 py-4 border-t border-border bg-muted/30">
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  No results found for "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-accent hover:text-accent/80 transition font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Didn't find what you're looking for?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact our team for personalized assistance with your regulatory
              compliance questions.
            </p>
            <Link href="/contact">
              <button className="px-8 py-3 rounded-lg bg-gradient-primary text-accent-foreground font-medium hover:shadow-lg transition">
                Contact Us
              </button>
            </Link>
          </div>
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
