import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Share2, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { ExportButtons } from "@/components/ExportButtons";
import { ESRSDatapointsSection } from "@/components/ESRSDatapointsSection";

// Mock regulation data - in production, fetch from tRPC
const MOCK_REGULATIONS: Record<number, any> = {
  1: {
    id: 1,
    title: "Corporate Sustainability Reporting Directive (CSRD)",
    shortName: "CSRD",
    description: "The CSRD requires large EU companies to report on their sustainability performance and impacts.",
    status: "ACTIVE",
    regulationType: "DIRECTIVE",
    effectiveDate: new Date("2024-01-01"),
    enforcementDate: new Date("2025-01-01"),
    scope: "Large EU companies (250+ employees, €50M+ revenue, €25M+ assets)",
    affectedSectors: "All sectors",
    relatedStandards: ["ESRS", "GRI", "SASB"],
    keyRequirements: [
      "Double materiality assessment",
      "Sustainability reporting aligned with ESRS",
      "Third-party assurance",
      "Digital reporting (XBRL)",
    ],
    implementationTimeline: [
      { phase: "Adoption", date: "2022-12-14", description: "Directive adopted by EU" },
      { phase: "Transposition", date: "2024-07-06", description: "Member states implement into national law" },
      { phase: "First reporting", date: "2025-04-15", description: "First reports due for large companies" },
      { phase: "Full enforcement", date: "2026-01-01", description: "Mandatory for all in-scope companies" },
    ],
    relatedNews: [
      { id: 1, title: "CSRD Implementation Guidance Released", date: "2024-11-15" },
      { id: 2, title: "First CSRD Reports Filed", date: "2024-10-20" },
    ],
    gs1Impact: {
      applicableStandards: ["GTIN", "EPCIS", "GS1 Digital Link"],
      dataRequirements: "Product-level sustainability data, supply chain traceability, ESG metrics",
      benefits: "GS1 standards enable efficient data capture and reporting",
    },
    references: [
      { title: "CSRD Directive Text", url: "https://eur-lex.europa.eu/eli/dir/2022/2464/oj" },
      { title: "EFRAG ESRS Standards", url: "https://www.efrag.org/esrs" },
    ],
  },
  2: {
    id: 2,
    title: "European Sustainability Reporting Standards (ESRS)",
    shortName: "ESRS",
    description: "ESRS are the sustainability reporting standards that companies must follow under CSRD.",
    status: "ACTIVE",
    regulationType: "STANDARD",
    effectiveDate: new Date("2023-07-31"),
    enforcementDate: new Date("2025-01-01"),
    scope: "Companies subject to CSRD",
    affectedSectors: "All sectors",
    relatedStandards: ["CSRD", "GRI", "ISSB"],
    keyRequirements: [
      "E1: Climate change",
      "E2: Pollution",
      "E3: Water and marine resources",
      "E4: Biodiversity and ecosystems",
      "S1: Own workforce",
      "S2: Workers in value chain",
      "S3: Affected communities",
      "S4: Consumers and end-users",
      "G1: Business conduct",
    ],
    implementationTimeline: [
      { phase: "Standards finalized", date: "2023-07-31", description: "EFRAG finalizes ESRS" },
      { phase: "Adoption", date: "2023-11-15", description: "EU adopts ESRS" },
      { phase: "First reporting", date: "2025-04-15", description: "First ESRS reports" },
    ],
    relatedNews: [
      { id: 3, title: "ESRS Training Programs Launched", date: "2024-09-10" },
    ],
    gs1Impact: {
      applicableStandards: ["EPCIS", "GS1 Digital Link", "GS1 Traceability"],
      dataRequirements: "ESG metrics, supply chain data, product information",
      benefits: "GS1 standards support efficient ESRS data collection",
    },
    references: [
      { title: "ESRS Standards", url: "https://www.efrag.org/esrs" },
    ],
  },
};

export default function HubRegulationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const regulationId = parseInt(id || "1");
  const regulation = MOCK_REGULATIONS[regulationId];

  if (!regulation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-900">Regulation not found</h1>
            <p className="text-slate-600 mt-2">The regulation you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Added to saved regulations");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PROPOSED":
        return "bg-blue-100 text-blue-800";
      case "TRANSITIONAL":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "PROPOSED":
        return <AlertCircle className="w-4 h-4" />;
      case "TRANSITIONAL":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getStatusColor(regulation.status)}>
                  {getStatusIcon(regulation.status)}
                  <span className="ml-1">{regulation.status}</span>
                </Badge>
                <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                  {regulation.regulationType}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{regulation.title}</h1>
              <p className="text-blue-100 text-lg">{regulation.description}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <ExportButtons
                regulationId={String(regulation.id)}
                regulationTitle={regulation.title}
                variant="outline"
              />
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleSave}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Key Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Effective Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {regulation.effectiveDate.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Enforcement Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {regulation.enforcementDate.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-900 font-medium">{regulation.scope}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="gs1-impact">GS1 Impact</TabsTrigger>
            <TabsTrigger value="esrs-datapoints">ESRS Datapoints</TabsTrigger>
            <TabsTrigger value="news">Related News</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {regulation.keyRequirements.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Affected Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{regulation.affectedSectors}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {regulation.implementationTimeline.map((phase: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                        {idx < regulation.implementationTimeline.length - 1 && (
                          <div className="w-1 h-12 bg-blue-200 my-2"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-semibold text-slate-900">{phase.phase}</p>
                        <p className="text-sm text-slate-600">{phase.date}</p>
                        <p className="text-slate-700 mt-1">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ESRS Datapoints Tab */}
          <TabsContent value="esrs-datapoints" className="space-y-6">
            <ESRSDatapointsSection regulationId={regulation.id} />
          </TabsContent>

          {/* GS1 Impact Tab */}
          <TabsContent value="gs1-impact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GS1 Standards Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Applicable GS1 Standards</h4>
                  <div className="flex flex-wrap gap-2">
                    {regulation.gs1Impact.applicableStandards.map((std: string) => (
                      <Badge key={std} variant="secondary">
                        {std}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Data Requirements</h4>
                  <p className="text-slate-700">{regulation.gs1Impact.dataRequirements}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">GS1 Benefits</h4>
                  <p className="text-slate-700">{regulation.gs1Impact.benefits}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="space-y-4">
              {regulation.relatedNews.map((news: any) => (
                <Card key={news.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600 mb-2">{news.date}</p>
                    <h4 className="font-semibold text-slate-900">{news.title}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="space-y-4">
              {regulation.references.map((ref: any, idx: number) => (
                <Card key={idx}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{ref.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{ref.url}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert for authenticated users */}
        {user && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Save this regulation to your dashboard to receive alerts when new news is published or deadlines approach.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
