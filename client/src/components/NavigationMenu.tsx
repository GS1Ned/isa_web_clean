import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, Menu, X, Search } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search (when not in an input)
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        setSearchOpen(true);
        // Focus will be handled by autoFocus on the input
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Escape to close search/dropdowns
      if (e.key === "Escape") {
        setSearchOpen(false);
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true"
      );
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!openDropdown || mobileMenuOpen) return;
      const dropdownRoot = dropdownRefs.current[openDropdown];
      if (dropdownRoot && !dropdownRoot.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [openDropdown, mobileMenuOpen]);

  // Restructured navigation: 5 main items
  const navItems: NavItem[] = [
    {
      label: "Explore",
      children: [
        { label: "ESG Hub", href: "/hub", description: "Overview and key statistics" },
        { label: "Regulations", href: "/hub/regulations", description: "Explore EU ESG regulations" },
        { label: "Standards Directory", href: "/standards-directory", description: "GS1 and other standards" },
        { label: "ESRS Datapoints", href: "/hub/esrs-datapoints", description: "1,184 EFRAG disclosure requirements" },
        { label: "Dutch Initiatives", href: "/hub/dutch-initiatives", description: "🇳🇱 National programs" },
        { label: "Calendar", href: "/hub/calendar", description: "Compliance deadlines" },
        { label: "Impact Matrix", href: "/hub/impact-matrix", description: "Regulation overlap analysis" },
      ],
    },
    {
      label: "News & Events",
      children: [
        { label: "News Hub", href: "/news", description: "Latest regulatory updates" },
        { label: "Regulatory Events", href: "/events", description: "Timeline of regulatory changes" },
        { label: "Regulatory Changes", href: "/regulatory-changes", description: "Track regulation updates" },
      ],
    },
    {
      label: "Ask ISA",
      href: "/ask",
    },
    {
      label: "Tools",
      children: [
        { label: "Gap Analyzer", href: "/tools/gap-analyzer", description: "Identify ESRS compliance gaps" },
        { label: "Impact Simulator", href: "/tools/impact-simulator", description: "Project regulatory impacts" },
        { label: "Dual-Core Demo", href: "/tools/dual-core", description: "Combined analysis" },
        { label: "Attribute Recommender", href: "/tools/attribute-recommender", description: "AI-powered GS1 suggestions" },
        { label: "Compliance Roadmap", href: "/tools/compliance-roadmap", description: "Plan your journey" },
        { label: "EPCIS Upload", href: "/epcis/upload", description: "Upload EPCIS documents" },
        { label: "Supply Chain Map", href: "/epcis/supply-chain", description: "Visualize supply chain" },
        { label: "EUDR Map", href: "/epcis/eudr-map", description: "Geolocation compliance" },
        { label: "Barcode Scanner", href: "/tools/scanner", description: "Product traceability" },
      ],
    },
    {
      label: "About",
      children: [
        { label: "How It Works", href: "/how-it-works", description: "ISA methodology" },
        { label: "Features", href: "/features", description: "Platform capabilities" },
        { label: "Use Cases", href: "/use-cases", description: "Industry applications" },
        { label: "Getting Started", href: "/getting-started", description: "Quick start guide" },
        { label: "Contact", href: "/contact", description: "Get in touch" },
      ],
    },
  ];

  // Add admin menu for admin users
  if (user?.role === "admin") {
    navItems.push({
      label: "Admin",
      children: [
        { label: "Knowledge Base", href: "/admin/knowledge-base", description: "Generate embeddings" },
        { label: "News Pipeline", href: "/admin/news-pipeline", description: "Trigger news ingestion" },
        { label: "News Management", href: "/admin/news", description: "Manage articles" },
        { label: "Analytics", href: "/admin/analytics", description: "Hub metrics" },
        { label: "CELLAR Ingestion", href: "/admin/cellar", description: "EU regulation sync" },
        { label: "Sync Monitor", href: "/admin/cellar-sync", description: "Monitor sync history" },
        { label: "EUDR Data Seeder", href: "/admin/eudr-seeder", description: "Populate sample data" },
        { label: "Scraper Health", href: "/admin/scraper-health", description: "Monitor scrapers" },
        { label: "Coverage Analytics", href: "/admin/coverage-analytics", description: "News coverage" },
        { label: "Pipeline Observability", href: "/admin/observability", description: "Pipeline quality" },
        { label: "System Monitoring", href: "/admin/system-monitoring", description: "Error tracking" },
      ],
    });
  }

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const handleTriggerKeyDown = (label: string) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar" || event.key === "ArrowDown") {
      event.preventDefault();
      clearCloseTimeout();
      setOpenDropdown(label);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              ⚡
            </div>
            ISA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <div
                key={item.label}
                className="relative"
                ref={node => {
                  if (item.children) {
                    dropdownRefs.current[item.label] = node;
                  }
                }}
                onPointerEnter={() => {
                  if (!item.children) return;
                  clearCloseTimeout();
                  setOpenDropdown(item.label);
                }}
                onPointerLeave={() => {
                  if (!item.children) return;
                  scheduleClose();
                }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent"
                    onClick={() => toggleDropdown(item.label)}
                    onKeyDown={handleTriggerKeyDown(item.label)}
                    aria-haspopup="menu"
                    aria-expanded={openDropdown === item.label}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 w-72 bg-popover border rounded-lg shadow-lg z-50">
                    <div className="p-2 max-h-[70vh] overflow-y-auto">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <div className="font-medium text-sm text-foreground">
                            {child.label}
                          </div>
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
          </div>

          {/* Right side: Search + Dashboard */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Press / to search"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
              <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">/</kbd>
            </Button>
            {user ? (
              <Link href="/hub/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Search Bar (when open) */}
        {searchOpen && (
          <div className="hidden md:block pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input');
                if (input?.value) {
                  window.location.href = `/hub/regulations?search=${encodeURIComponent(input.value)}`;
                }
              }}
              className="flex gap-2 max-w-xl mx-auto"
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search regulations, standards, or topics... (Press Esc to close)"
                className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            {navItems.map(item => (
              <div key={item.label} className="mb-2">
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
                      <div className="mt-1 ml-4 space-y-1">
                        {item.children.map(child => (
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
                <Link
                  href="/hub/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
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
