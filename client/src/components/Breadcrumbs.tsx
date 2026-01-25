/**
 * Breadcrumbs Component
 * Provides navigation hierarchy based on current URL path
 */

import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

// Route to label mapping for breadcrumb display
const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  "hub": "ESG Hub",
  "regulations": "Regulations",
  "standards": "Standards",
  "standards-mapping": "Standards Mapping",
  "standards-directory": "Standards Directory",
  "esrs-datapoints": "ESRS Datapoints",
  "dutch-initiatives": "Dutch Initiatives",
  "calendar": "Calendar",
  "impact-matrix": "Impact Matrix",
  "compare-regulations": "Compare Regulations",
  "resources": "Resources",
  "about": "About",
  "news": "News Hub",
  "events": "Events",
  "ask": "Ask ISA",
  "tools": "Tools",
  "gap-analyzer": "Gap Analyzer",
  "impact-simulator": "Impact Simulator",
  "dual-core": "Dual-Core",
  "attribute-recommender": "Attribute Recommender",
  "compliance-roadmap": "Compliance Roadmap",
  "epcis": "EPCIS Tools",
  "upload": "Upload Events",
  "supply-chain": "Supply Chain Map",
  "eudr-map": "EUDR Map",
  "scanner": "Barcode Scanner",
  "compliance-report": "Compliance Report",
  "getting-started": "Getting Started",
  "features": "Features",
  "how-it-works": "How It Works",
  "use-cases": "Use Cases",
  "faq": "FAQ",
  "contact": "Contact",
  "admin": "Admin",
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

export function Breadcrumbs() {
  const [location] = useLocation();
  
  // Don't show breadcrumbs on home page
  if (location === "/" || location === "") {
    return null;
  }

  // Parse the path into segments
  const segments = location.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/", isLast: false }
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    items.push({
      label,
      href: currentPath,
      isLast: index === segments.length - 1
    });
  });

  return (
    <nav className="bg-muted/30 border-b border-border">
      <div className="container py-3">
        <ol className="flex items-center gap-2 text-sm">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              {item.isLast ? (
                <span className="text-foreground font-medium">{item.label}</span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
