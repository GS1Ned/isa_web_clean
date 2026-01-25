import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,

  Calendar,
  BookOpen,
  HelpCircle,
  Save,
  Bell,
  Newspaper,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { RegulationTimeline } from "@/components/RegulationTimeline";
import { ChevronRight } from "lucide-react";

// Sample regulation data
const REGULATION_DATA = {
  id: 1,
  code: "CSRD",
  title: "Corporate Sustainability Reporting Directive",
  description:
    "The CSRD requires large EU companies to disclose their sustainability performance and impacts.",
  status: "ACTIVE",
  effectiveDate: "2024-01-01",
  implementationDate: "2025-01-01",
  enforcementDate: "2026-01-01",
  scope: "Large companies (250+ employees, €50M+ revenue, €25M+ assets)",

  timeline: [
    {
      date: "2024-01-01",
      event: "CSRD Effective",
      description: "Directive enters into force",
      status: "completed" as const,
    },
    {
      date: "2025-01-01",
      event: "First Reporting Period",
      description: "Large companies begin reporting under CSRD",
      status: "upcoming" as const,
    },
    {
      date: "2026-01-01",
      event: "Enforcement Begins",
      description: "Regulatory enforcement of CSRD requirements",
      status: "future" as const,
    },
    {
      date: "2028-01-01",
      event: "SME Scope Expansion",
      description: "Extended to small and medium-sized enterprises",
      status: "future" as const,
    },
  ],

  relatedStandards: [
    {
      code: "GTIN",
      name: "Global Trade Item Number",
      relevance: "Required for product identification and traceability",
      impact: "HIGH",
    },
    {
      code: "EPCIS",
      name: "Electronic Product Code Information Services",
      relevance: "Enables supply chain visibility and sustainability tracking",
      impact: "HIGH",
    },
    {
      code: "Digital Link",
      name: "GS1 Digital Link",
      relevance: "Connects physical products to digital sustainability data",
      impact: "MEDIUM",
    },
    {
      code: "DPP",
      name: "Digital Product Passport",
      relevance: "Provides product-level sustainability information",
      impact: "MEDIUM",
    },
  ],

  implementationChecklist: [
    {
      phase: "Assessment (Q1 2024)",
      tasks: [
        "Identify scope: Does your company fall under CSRD?",
        "Review current sustainability data collection processes",
        "Assess gaps in ESG reporting capabilities",
        "Evaluate GS1 standards adoption",
      ],
    },
    {
      phase: "Planning (Q2-Q3 2024)",
      tasks: [
        "Define sustainability KPIs and metrics",
        "Map GS1 standards to reporting requirements",
        "Establish data governance processes",
        "Plan system integrations",
      ],
    },
    {
      phase: "Implementation (Q4 2024 - Q2 2025)",
      tasks: [
        "Deploy GS1 standards (GTIN, EPCIS, Digital Link)",
        "Implement data collection systems",
        "Train teams on new processes",
        "Conduct pilot reporting",
      ],
    },
    {
      phase: "Reporting (Q3-Q4 2025)",
      tasks: [
        "Compile sustainability data",
        "Prepare CSRD-compliant report",
        "Third-party assurance review",
        "Submit report to authorities",
      ],
    },
  ],

  faq: [
    {
      question: "Who must comply with CSRD?",
      answer:
        "Large EU companies with 250+ employees, €50M+ revenue, or €25M+ assets. The scope will expand to SMEs by 2028.",
    },
    {
      question: "How do GS1 standards help with CSRD compliance?",
      answer:
        "GS1 standards enable standardized data collection and reporting on supply chain sustainability, product traceability, and environmental impact.",
    },
    {
      question: "What is the implementation timeline?",
      answer:
        "CSRD is effective from January 1, 2024. First reporting period begins January 1, 2025. Enforcement starts January 1, 2026.",
    },
    {
      question: "Can we use existing sustainability data?",
      answer:
        "Partially. You'll need to map existing data to CSRD requirements and may need to enhance collection using GS1 standards for supply chain visibility.",
    },
    {
      question: "What are the penalties for non-compliance?",
      answer:
        "Penalties vary by member state but can include fines up to 5% of net turnover and reputational damage.",
    },
  ],
};

/**
 * Recent Developments Panel Component
 * Shows news articles related to a specific regulation
 */
function RecentDevelopmentsPanel({
  regulationCode,
}: {
  regulationCode: string;
}) {
  const { data: newsItems, isLoading } = trpc.hub.getRecentNews.useQuery({
    limit: 100,
  });

  // Filter news by regulation tag
  const relatedNews =
    newsItems?.filter(
      item =>
        Array.isArray(item.regulationTags) &&
        item.regulationTags.includes(regulationCode)
    ) || [];

  const impactColors = {
    HIGH: "bg-red-500/10 text-red-600 border-red-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    LOW: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (relatedNews.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center py-8">
          <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recent Developments</h3>
          <p className="text-muted-foreground">
            No news articles found for {regulationCode}. Check back later for
            updates.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="h-6 w-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-slate-900">
          Recent Developments
        </h3>
        <Badge variant="secondary" className="ml-2">
          {relatedNews.length}{" "}
          {relatedNews.length === 1 ? "article" : "articles"}
        </Badge>
      </div>

      <div className="space-y-6">
        {relatedNews.map(news => (
          <div
            key={news.id}
            className="border-b border-slate-200 pb-6 last:border-0"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {news.impactLevel && (
                <Badge
                  className={
                    impactColors[news.impactLevel as keyof typeof impactColors]
                  }
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {news.impactLevel} Impact
                </Badge>
              )}
              {Array.isArray(news.regulationTags) &&
                news.regulationTags
                  .filter(tag => tag !== regulationCode)
                  .map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
            </div>

            <Link href={`/news/${news.id}`}>
              <h4 className="text-lg font-bold text-slate-900 hover:text-blue-600 mb-2 cursor-pointer">
                {news.title}
              </h4>
            </Link>

            {news.summary && (
              <p className="text-slate-600 mb-3 line-clamp-2">{news.summary}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(
                  new Date(news.publishedDate || news.createdAt),
                  "MMM d, yyyy"
                )}
              </div>
              {news.sourceTitle && (
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>{news.sourceTitle}</span>
                </div>
              )}
              <Link
                href={`/news/${news.id}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 ml-auto"
              >
                Read more
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {relatedNews.length > 0 && (
        <div className="mt-6 pt-6 border-t text-center">
          <Link href="/news">
            <Button variant="outline" className="gap-2">
              <Newspaper className="h-4 w-4" />
              View All News
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

// EPCIS/CBV Traceability Panel Component
function EPCISTraceabilityPanel({
  regulationCode,
}: {
  regulationCode: string;
}) {
  // Import EPCIS/CBV mapping from shared types
  const mapping =
    {
      CSRD: {
        requiredBizSteps: [
          {
            code: "BizStep-shipping",
            label: "Shipping",
            description: "Transport of goods for Scope 3 emissions tracking",
          },
          {
            code: "BizStep-transforming",
            label: "Transforming",
            description: "Manufacturing processes for emissions calculation",
          },
        ],
        requiredDispositions: [
          {
            code: "Disp-in_transit",
            label: "In Transit",
            description: "Goods moving between locations",
          },
        ],
        requiredSensorTypes: [
          {
            code: "Temperature",
            label: "Temperature",
            description: "Cold chain monitoring for refrigerant emissions",
          },
          {
            code: "Speed",
            label: "Speed",
            description: "Vehicle speed for transport emissions",
          },
          {
            code: "Mileage",
            label: "Mileage",
            description: "Distance traveled for emissions calculation",
          },
        ],
        traceabilityRequirements: [
          "Scope 3 transport emissions (shipping + sensor data)",
          "Manufacturing facility locations",
          "Supply chain mapping (custody chain)",
        ],
      },
      EUDR: {
        requiredBizSteps: [
          {
            code: "BizStep-commissioning",
            label: "Commissioning",
            description: "Origin tracking (harvesting, catching, slaughtering)",
          },
          {
            code: "BizStep-transforming",
            label: "Transforming",
            description: "Processing steps in supply chain",
          },
          {
            code: "BizStep-shipping",
            label: "Shipping",
            description: "Transport between locations",
          },
          {
            code: "BizStep-receiving",
            label: "Receiving",
            description: "Custody transfer checkpoints",
          },
        ],
        requiredDispositions: [],
        requiredTransactionTypes: [
          {
            code: "BTT-cert",
            label: "Certification",
            description: "FSC, PEFC, organic certifications",
          },
          {
            code: "BTT-pedigree",
            label: "Pedigree",
            description: "Provenance documentation",
          },
        ],
        requiredSensorTypes: [],
        traceabilityRequirements: [
          "Geographic origin (commissioning location with coordinates)",
          "Custody chain (owning_party, possessing_party)",
          "Transformation steps (inputs → outputs)",
          "Certifications (FSC, PEFC, organic)",
        ],
      },
      PPWR: {
        requiredBizSteps: [
          {
            code: "BizStep-commissioning",
            label: "Commissioning",
            description: "Production/manufacturing",
          },
          {
            code: "BizStep-collecting",
            label: "Collecting",
            description: "Collection for recycling/reuse",
          },
          {
            code: "BizStep-recycling",
            label: "Recycling",
            description: "Recycling process",
          },
          {
            code: "BizStep-destroying",
            label: "Destroying",
            description: "Disposal/end-of-life",
          },
          {
            code: "BizStep-repairing",
            label: "Repairing",
            description: "Repair for lifetime extension",
          },
        ],
        requiredDispositions: [
          {
            code: "Disp-active",
            label: "Active",
            description: "Product in use",
          },
          {
            code: "Disp-recyclable",
            label: "Recyclable",
            description: "Designated for recycling",
          },
          {
            code: "Disp-returned",
            label: "Returned",
            description: "Take-back schemes",
          },
          {
            code: "Disp-destroyed",
            label: "Destroyed",
            description: "End-of-life verification",
          },
        ],
        requiredSensorTypes: [],
        traceabilityRequirements: [
          "Product lifecycle tracking (commissioning → active → collecting → recycling/destroying)",
          "Recycled content verification (transformation inputs)",
          "Take-back scheme compliance (returned disposition)",
          "Repair and reuse tracking (repairing bizStep)",
        ],
      },
    }[regulationCode] || null;

  if (!mapping) {
    return (
      <Card className="p-8">
        <p className="text-slate-600">
          EPCIS/CBV traceability mapping not yet available for this regulation.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          EPCIS/CBV Traceability Requirements
        </h3>
        <p className="text-slate-700 mb-6">
          This regulation requires specific GS1 EPCIS events and CBV
          vocabularies for supply chain traceability and compliance
          verification. Use these codes when implementing EPCIS-based
          traceability systems.
        </p>
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <ExternalLink className="h-4 w-4" />
          <a
            href="https://ref.gs1.org/epcis/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View EPCIS/CBV Standard Documentation
          </a>
        </div>
      </Card>

      {/* Required BizSteps */}
      {mapping.requiredBizSteps && mapping.requiredBizSteps.length > 0 && (
        <Card className="p-8">
          <h4 className="text-xl font-bold text-slate-900 mb-4">
            Required Business Steps (bizStep)
          </h4>
          <p className="text-sm text-slate-600 mb-6">
            Business process steps that must be captured in EPCIS events to
            demonstrate compliance.
          </p>
          <div className="space-y-4">
            {mapping.requiredBizSteps.map((step: any) => (
              <div
                key={step.code}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {step.code}
                  </Badge>
                  <span className="font-semibold text-slate-900">
                    {step.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Required Dispositions */}
      {mapping.requiredDispositions &&
        mapping.requiredDispositions.length > 0 && (
          <Card className="p-8">
            <h4 className="text-xl font-bold text-slate-900 mb-4">
              Required Dispositions (disposition)
            </h4>
            <p className="text-sm text-slate-600 mb-6">
              Business conditions that must be tracked to demonstrate product
              status and lifecycle.
            </p>
            <div className="space-y-4">
              {mapping.requiredDispositions.map((disp: any) => (
                <div
                  key={disp.code}
                  className="border-l-4 border-green-500 pl-4 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {disp.code}
                    </Badge>
                    <span className="font-semibold text-slate-900">
                      {disp.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{disp.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Required Transaction Types */}
      {mapping.requiredTransactionTypes &&
        mapping.requiredTransactionTypes.length > 0 && (
          <Card className="p-8">
            <h4 className="text-xl font-bold text-slate-900 mb-4">
              Required Transaction Types (bizTransactionList)
            </h4>
            <p className="text-sm text-slate-600 mb-6">
              Business documents that must be linked to EPCIS events for
              compliance verification.
            </p>
            <div className="space-y-4">
              {mapping.requiredTransactionTypes.map((txn: any) => (
                <div
                  key={txn.code}
                  className="border-l-4 border-amber-500 pl-4 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {txn.code}
                    </Badge>
                    <span className="font-semibold text-slate-900">
                      {txn.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{txn.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Required Sensor Types */}
      {mapping.requiredSensorTypes &&
        mapping.requiredSensorTypes.length > 0 && (
          <Card className="p-8">
            <h4 className="text-xl font-bold text-slate-900 mb-4">
              Required Sensor Measurements (sensorReport)
            </h4>
            <p className="text-sm text-slate-600 mb-6">
              Environmental sensor data that must be captured for compliance
              verification.
            </p>
            <div className="space-y-4">
              {mapping.requiredSensorTypes.map((sensor: any) => (
                <div
                  key={sensor.code}
                  className="border-l-4 border-purple-500 pl-4 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {sensor.code}
                    </Badge>
                    <span className="font-semibold text-slate-900">
                      {sensor.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{sensor.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Traceability Requirements Summary */}
      <Card className="p-8 bg-slate-50">
        <h4 className="text-xl font-bold text-slate-900 mb-4">
          Traceability Requirements Summary
        </h4>
        <ul className="space-y-2">
          {mapping.traceabilityRequirements.map((req: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{req}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function HubRegulationDetailEnhanced() {
  const [isSaved, setIsSaved] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const reg = REGULATION_DATA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/hub" className="hover:text-foreground transition-colors">
            ESG Hub
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/hub/regulations" className="hover:text-foreground transition-colors">
            Regulations
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{reg.code}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-sm font-semibold text-blue-600 mb-2">
                {reg.code}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {reg.title}
              </h1>
              <p className="text-lg text-slate-600">{reg.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isSaved ? "default" : "outline"}
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant={hasAlert ? "default" : "outline"}
                size="sm"
                onClick={() => setHasAlert(!hasAlert)}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                {hasAlert ? "Alert On" : "Alert"}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="text-sm text-slate-600 mb-1">Status</div>
            <div className="text-2xl font-bold text-slate-900">
              {reg.status}
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm text-slate-600 mb-1">Effective Date</div>
            <div className="text-2xl font-bold text-slate-900">
              {new Date(reg.effectiveDate).toLocaleDateString()}
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="text-sm text-slate-600 mb-1">Implementation</div>
            <div className="text-2xl font-bold text-slate-900">
              {new Date(reg.implementationDate).toLocaleDateString()}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="traceability">
              EPCIS/CBV Traceability
            </TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
            <TabsTrigger value="news">Recent Developments</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <RegulationTimeline
              regulationCode={reg.code}
              milestones={reg.timeline}
            />
          </TabsContent>

          {/* EPCIS/CBV Traceability Tab */}
          <TabsContent value="traceability" className="space-y-6">
            <EPCISTraceabilityPanel regulationCode={reg.code} />
          </TabsContent>

          {/* Standards Tab */}
          <TabsContent value="standards" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Related GS1 Standards
              </h3>
              <div className="space-y-4">
                {reg.relatedStandards.map((std, idx) => (
                  <div
                    key={idx}
                    className="border-b border-slate-200 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-slate-900">
                          {std.code}: {std.name}
                        </div>
                        <div className="text-slate-600 mt-1">
                          {std.relevance}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          std.impact === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {std.impact} Impact
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Recent Developments Tab */}
          <TabsContent value="news" className="space-y-6">
            <RecentDevelopmentsPanel regulationCode={reg.code} />
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Implementation Checklist
              </h3>
              <div className="space-y-6">
                {reg.implementationChecklist.map((phase, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                      <h4 className="font-bold text-slate-900">
                        {phase.phase}
                      </h4>
                    </div>
                    <div className="ml-9 space-y-2">
                      {phase.tasks.map((task, tidx) => (
                        <label
                          key={tidx}
                          className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-slate-700">{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {reg.faq.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-b border-slate-200 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="font-bold text-slate-900">
                        {item.question}
                      </div>
                    </div>
                    <div className="ml-8 text-slate-600">{item.answer}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Resources */}
        <Card className="p-8 mt-8 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Related Resources
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition"
            >
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">
                  CSRD Implementation Guide
                </div>
                <div className="text-sm text-slate-600">Download PDF</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition"
            >
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">
                  GS1 Standards Mapping
                </div>
                <div className="text-sm text-slate-600">Download Excel</div>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
