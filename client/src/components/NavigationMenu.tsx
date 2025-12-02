import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string; description?: string }[];
}

export function NavigationMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: "Getting Started",
      href: "/getting-started",
    },
    {
      label: "Ask ISA",
      href: "/ask",
    },
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "ESG Hub",
      children: [
        { label: "Hub Home", href: "/hub", description: "Overview and key statistics" },
        { label: "About ESG Hub", href: "/hub/about", description: "AI methodology and value proposition" },
        { label: "Regulations", href: "/hub/regulations", description: "Explore EU ESG regulations" },
        { label: "News Feed", href: "/hub/news", description: "Latest regulatory updates" },
        { label: "Calendar", href: "/hub/calendar", description: "Compliance deadlines" },
        { label: "Standards Mapping", href: "/hub/standards-mapping", description: "GS1 standards by regulation" },
        { label: "ESRS Datapoints", href: "/hub/esrs-datapoints", description: "Browse 1,184 EFRAG disclosure requirements" },
        { label: "Dutch Initiatives", href: "/hub/dutch-initiatives", description: "🇳🇱 National compliance programs" },
        { label: "Resources", href: "/hub/resources", description: "Guides and templates" },
        { label: "Impact Matrix", href: "/hub/impact-matrix", description: "Regulation overlap analysis" },
      ],
    },
    {
      label: "EPCIS Tools",
      children: [
        { label: "Upload Events", href: "/epcis/upload", description: "Upload EPCIS documents" },
        { label: "Supply Chain Map", href: "/epcis/supply-chain", description: "Visualize supply chain" },
        { label: "EUDR Map", href: "/epcis/eudr-map", description: "Geolocation compliance" },
        { label: "Barcode Scanner", href: "/tools/scanner", description: "Scan products for traceability" },
        { label: "Compliance Report", href: "/tools/compliance-report", description: "Generate EUDR compliance reports" },
      ],
    },
    {
      label: "About",
      children: [
        { label: "How It Works", href: "/how-it-works" },
        { label: "Features", href: "/features" },
        { label: "Use Cases", href: "/use-cases" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  // Add admin menu for admin users
  if (user?.role === "admin") {
    navItems.push({
      label: "Admin",
      children: [
        { label: "Knowledge Base", href: "/admin/knowledge-base", description: "Generate embeddings for Ask ISA" },
        { label: "News Management", href: "/admin/news", description: "Manage news articles" },
        { label: "Analytics", href: "/admin/analytics", description: "Hub engagement metrics" },
        { label: "CELLAR Ingestion", href: "/admin/cellar", description: "EU regulation sync" },
        { label: "Sync Monitor", href: "/admin/cellar-sync", description: "Monitor sync history" },
        { label: "EUDR Data Seeder", href: "/admin/eudr-seeder", description: "Populate sample data" },
      ],
    });
  }

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              ⚡
            </div>
            ISA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.href ? (
                  <Link href={item.href} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                    onClick={() => toggleDropdown(item.label)}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-popover border rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} className="block px-3 py-2 rounded-md hover:bg-accent transition-colors">
                          <div className="font-medium text-sm text-foreground">{child.label}</div>
                          {child.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {child.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Dashboard/Login */}
            {user ? (
              <Link href="/hub/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            {navItems.map((item) => (
              <div key={item.label} className="mb-4">
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => toggleDropdown(item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {item.children && openDropdown === item.label && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.children.map((child) => (
                          <Link 
                            key={child.href} 
                            href={child.href}
                            className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Mobile Dashboard/Login */}
            <div className="px-4 pt-4 border-t">
              {user ? (
                <Link href="/hub/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
