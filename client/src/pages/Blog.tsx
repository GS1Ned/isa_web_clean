import { Link } from "wouter";
import { Zap, Calendar, User, ArrowRight } from "lucide-react";

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: "CSRD Compliance Timeline: What You Need to Know",
      excerpt:
        "The Corporate Sustainability Reporting Directive (CSRD) is reshaping how European companies report sustainability data. Learn the key deadlines and what GS1 standards can help you prepare.",
      date: "November 15, 2024",
      author: "Sarah Chen",
      category: "Compliance",
      readTime: "8 min read",
      slug: "csrd-compliance-timeline",
    },
    {
      id: 2,
      title: "GS1 Standards for Digital Product Passports",
      excerpt:
        "Digital Product Passports (DPP) are becoming mandatory for certain product categories. Discover how GS1 standards enable seamless DPP implementation across supply chains.",
      date: "November 8, 2024",
      author: "Michel Dupont",
      category: "Standards",
      readTime: "10 min read",
      slug: "gs1-standards-digital-product-passports",
    },
    {
      id: 3,
      title: "ESRS Reporting Requirements for Supply Chain Data",
      excerpt:
        "The European Sustainability Reporting Standards (ESRS) require detailed supply chain data. Learn how to map ESRS requirements to GS1 data standards for efficient compliance.",
      date: "October 31, 2024",
      author: "Emma Rodriguez",
      category: "Compliance",
      readTime: "9 min read",
      slug: "esrs-reporting-supply-chain",
    },
    {
      id: 4,
      title: "EU Deforestation Regulation: Supply Chain Traceability",
      excerpt:
        "The EU Deforestation Regulation (EUDR) mandates supply chain traceability for forest-risk commodities. Explore how GS1 standards support EUDR compliance and traceability.",
      date: "October 24, 2024",
      author: "Klaus Mueller",
      category: "Regulations",
      readTime: "7 min read",
      slug: "eudr-supply-chain-traceability",
    },
    {
      id: 5,
      title: "The Future of Regulatory Standards Mapping",
      excerpt:
        "As regulations evolve faster than ever, automated standards mapping is becoming essential. Discover how AI-powered tools are revolutionizing regulatory compliance.",
      date: "October 17, 2024",
      author: "Sarah Chen",
      category: "Insights",
      readTime: "11 min read",
      slug: "future-regulatory-standards-mapping",
    },
    {
      id: 6,
      title: "Preparing for PPWR: Packaging and Packaging Waste Regulation",
      excerpt:
        "The Packaging and Packaging Waste Regulation (PPWR) introduces new requirements for packaging data. Learn how to align your data standards with PPWR compliance.",
      date: "October 10, 2024",
      author: "Anna Rossi",
      category: "Compliance",
      readTime: "8 min read",
      slug: "ppwr-packaging-waste-regulation",
    },
  ];

  const categories = [
    "All",
    "Compliance",
    "Standards",
    "Regulations",
    "Insights",
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
              ISA Insights
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay informed on the latest regulatory trends, GS1 standards
              updates, and compliance best practices.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                  category === "All"
                    ? "bg-accent text-accent-foreground"
                    : "bg-background border border-border text-muted-foreground hover:border-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <article
                key={article.id}
                className="card-elevated p-6 hover:border-accent transition flex flex-col"
              >
                {/* Category Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                    {article.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 flex-1">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="space-y-3 mb-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                    <span className="ml-auto">{article.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <button className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition font-medium text-sm">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter to receive the latest regulatory
              updates and compliance insights.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button className="px-6 py-3 rounded-lg bg-gradient-primary text-accent-foreground font-medium hover:shadow-lg transition">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
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
