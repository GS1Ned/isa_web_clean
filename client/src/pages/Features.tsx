import { useState } from "react";
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
  CheckCircle2,
  Wrench,
  Clock,
  Database,
  Map,
  FileText,
  BarChart3,
  Shield,
  Workflow,
  Target,
  Users,
  Settings,
  Sparkles,
  ArrowRight,
  Search,
} from "lucide-react";

/**
 * Features Discovery Dashboard
 *
 * Comprehensive overview of all ISA platform capabilities with:
 * - Status indicators (Active, Built, Planned)
 * - Data availability metrics
 * - Navigation links to feature pages
 * - Coming soon badges with timelines
 */

type FeatureStatus = "active" | "built" | "planned";

interface Feature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  category: string;
  icon: any;
  link?: string;
  recordCount?: number;
  comingSoon?: string;
  tags: string[];
}

const features: Feature[] = [
  // ESG Hub Features
  {
    id: "regulations",
    name: "Regulation Explorer",
    description:
      "Browse 38 EU sustainability regulations with full-text search, filtering, and impact analysis",
    status: "active",
    category: "ESG Hub",
    icon: FileText,
    link: "/hub/regulations",
    recordCount: 38,
    tags: ["CSRD", "ESRS", "EUDR", "DPP"],
  },
  {
    id: "esrs-datapoints",
    name: "ESRS Datapoints Library",
    description:
      "Explore 1,184 official ESRS disclosure datapoints with search and filtering",
    status: "active",
    category: "ESG Hub",
    icon: Database,
    link: "/hub/esrs",
    recordCount: 1184,
    tags: ["ESRS", "Disclosure", "Reporting"],
  },
  {
    id: "gs1-standards",
    name: "GS1 Standards Catalog",
    description:
      "Comprehensive catalog of 60 GS1 standards mapped to EU regulations",
    status: "active",
    category: "ESG Hub",
    icon: Shield,
    link: "/hub/standards-mapping",
    recordCount: 60,
    tags: ["GS1", "Standards", "Traceability"],
  },
  {
    id: "regulation-mapping",
    name: "AI-Powered Regulation Mapping",
    description:
      "450 intelligent mappings between regulations and ESRS datapoints",
    status: "active",
    category: "ESG Hub",
    icon: Sparkles,
    link: "/hub/regulations",
    recordCount: 450,
    tags: ["AI", "Mapping", "Automation"],
  },
  {
    id: "news-feed",
    name: "Regulatory News Feed",
    description: "Curated news from EU Commission, EFRAG, and GS1 sources",
    status: "active",
    category: "ESG Hub",
    icon: FileText,
    link: "/hub/news",
    recordCount: 25,
    tags: ["News", "Updates", "Alerts"],
  },
  {
    id: "regulation-comparison",
    name: "Regulation Comparison Tool",
    description:
      "Side-by-side comparison of regulations showing overlaps and dependencies",
    status: "active",
    category: "ESG Hub",
    icon: BarChart3,
    link: "/hub/compare",
    tags: ["Analysis", "Comparison"],
  },

  // EPCIS Tools
  {
    id: "supply-chain-map",
    name: "Supply Chain Visualization",
    description:
      "Interactive map showing product journey with 2,485 EPCIS events",
    status: "active",
    category: "EPCIS Tools",
    icon: Map,
    link: "/epcis/supply-chain",
    recordCount: 2485,
    tags: ["EPCIS", "Traceability", "Visualization"],
  },
  {
    id: "eudr-map",
    name: "EUDR Compliance Map",
    description:
      "Geolocation-based deforestation risk assessment with 12 origin plots",
    status: "active",
    category: "EPCIS Tools",
    icon: Map,
    link: "/epcis/eudr-map",
    recordCount: 12,
    tags: ["EUDR", "Geolocation", "Risk"],
  },
  {
    id: "barcode-scanner",
    name: "GTIN Barcode Scanner",
    description:
      "Scan product barcodes to verify traceability and compliance status",
    status: "active",
    category: "EPCIS Tools",
    icon: Search,
    link: "/tools/scanner",
    tags: ["GTIN", "Scanner", "Verification"],
  },
  {
    id: "batch-epcis",
    name: "Batch EPCIS Upload",
    description:
      "Upload and process large EPCIS event batches for supply chain tracking",
    status: "active",
    category: "EPCIS Tools",
    icon: Database,
    link: "/epcis/batch-upload",
    tags: ["EPCIS", "Batch", "Upload"],
  },

  // Compliance Features (Built, needs data)
  {
    id: "roadmap-builder",
    name: "Compliance Roadmap Builder",
    description:
      "Create step-by-step compliance roadmaps with milestones and dependencies",
    status: "built",
    category: "Compliance",
    icon: Workflow,
    link: "/compliance/roadmaps",
    recordCount: 0,
    comingSoon: "Sample roadmaps coming soon",
    tags: ["Roadmap", "Planning", "Milestones"],
  },
  {
    id: "roadmap-templates",
    name: "Roadmap Template Library",
    description:
      "Pre-built compliance roadmap templates for common regulatory scenarios",
    status: "built",
    category: "Compliance",
    icon: FileText,
    link: "/compliance/templates",
    recordCount: 0,
    comingSoon: "Templates for CSRD, EUDR, ESPR coming Q2 2025",
    tags: ["Templates", "Roadmap", "Best Practices"],
  },
  {
    id: "compliance-scores",
    name: "Compliance Scoring Dashboard",
    description:
      "Track compliance scores across regulations with historical trends",
    status: "built",
    category: "Compliance",
    icon: Target,
    link: "/compliance/scoring",
    recordCount: 0,
    comingSoon: "Scoring engine in development",
    tags: ["Scoring", "Metrics", "Analytics"],
  },
  {
    id: "remediation-plans",
    name: "Risk Remediation Planner",
    description:
      "Create and track remediation plans for identified compliance risks",
    status: "built",
    category: "Compliance",
    icon: Shield,
    link: "/compliance/remediation",
    recordCount: 0,
    comingSoon: "Remediation workflow coming soon",
    tags: ["Risk", "Remediation", "Action Plans"],
  },
  {
    id: "supply-chain-risks",
    name: "Supply Chain Risk Analytics",
    description:
      "Identify and analyze supply chain risks with AI-powered insights",
    status: "built",
    category: "Compliance",
    icon: BarChart3,
    link: "/compliance/risks",
    recordCount: 0,
    comingSoon: "Risk analytics engine in testing",
    tags: ["Risk", "Analytics", "AI"],
  },

  // User Features
  {
    id: "onboarding",
    name: "Interactive Onboarding",
    description:
      "Guided getting started flow with persistent progress tracking",
    status: "active",
    category: "User Experience",
    icon: Sparkles,
    link: "/getting-started",
    tags: ["Onboarding", "Tutorial", "Progress"],
  },
  {
    id: "user-dashboard",
    name: "Personal Dashboard",
    description:
      "Saved regulations, alerts, and personalized compliance insights",
    status: "active",
    category: "User Experience",
    icon: Users,
    link: "/dashboard",
    tags: ["Dashboard", "Personalization"],
  },
  {
    id: "saved-items",
    name: "Saved Items & Alerts",
    description: "Save regulations and set deadline alerts for important dates",
    status: "active",
    category: "User Experience",
    icon: FileText,
    link: "/dashboard",
    tags: ["Saved", "Alerts", "Notifications"],
  },

  // Admin Features
  {
    id: "cellar-ingestion",
    name: "CELLAR Auto-Ingestion",
    description:
      "Automated monthly sync of EU regulations from CELLAR SPARQL endpoint",
    status: "active",
    category: "Admin",
    icon: Database,
    link: "/admin/cellar-ingestion",
    tags: ["Automation", "CELLAR", "Ingestion"],
  },
  {
    id: "data-seeder",
    name: "Demo Data Seeder",
    description:
      "Populate database with sample EUDR and EPCIS data for testing",
    status: "active",
    category: "Admin",
    icon: Database,
    link: "/admin/eudr-seeder",
    tags: ["Seeding", "Testing", "Demo"],
  },
  {
    id: "template-manager",
    name: "Template Manager",
    description: "Create and manage roadmap templates for compliance workflows",
    status: "active",
    category: "Admin",
    icon: Settings,
    link: "/admin/templates",
    tags: ["Templates", "Management"],
  },
];

const statusConfig = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  built: {
    label: "Built",
    icon: Wrench,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  planned: {
    label: "Planned",
    icon: Clock,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
};

export default function Features() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | null>(
    null
  );

  const categories = Array.from(new Set(features.map(f => f.category)));

  const filteredFeatures = features.filter(feature => {
    if (selectedCategory && feature.category !== selectedCategory) return false;
    if (selectedStatus && feature.status !== selectedStatus) return false;
    return true;
  });

  const stats = {
    total: features.length,
    active: features.filter(f => f.status === "active").length,
    built: features.filter(f => f.status === "built").length,
    planned: features.filter(f => f.status === "planned").length,
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Platform Features</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive overview of all ISA capabilities, from active features
          to planned enhancements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Built
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.built}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Planned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {stats.planned}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Category:
          </span>
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Status:
          </span>
          <Button
            variant={selectedStatus === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(null)}
          >
            All
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(status as FeatureStatus)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map(feature => {
          const config = statusConfig[feature.status];
          const Icon = feature.icon;
          const StatusIcon = config.icon;

          return (
            <Card
              key={feature.id}
              className={`relative border-2 ${config.borderColor}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <Badge
                    variant="outline"
                    className={`${config.bgColor} ${config.color} border-0`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Record Count */}
                  {feature.recordCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Records:</span>
                      <span className="font-medium">
                        {feature.recordCount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Coming Soon Badge */}
                  {feature.comingSoon && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-yellow-700 dark:text-yellow-300">
                          {feature.comingSoon}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {feature.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  {feature.link && (
                    <Link href={feature.link}>
                      <Button
                        className="w-full mt-2"
                        variant={
                          feature.status === "active" ? "default" : "outline"
                        }
                      >
                        {feature.status === "active" ? "Explore" : "View"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No features match the selected filters
          </p>
        </div>
      )}
    </div>
  );
}
