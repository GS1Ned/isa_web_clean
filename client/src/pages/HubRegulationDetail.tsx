import { useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bookmark,
  Share2,
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { ExportButtons } from "@/components/ExportButtons";
import { ESRSDatapointsSection } from "@/components/ESRSDatapointsSection";
import { GS1AttributesPanelEnhanced } from "@/components/GS1AttributesPanelEnhanced";
import { AskISAWidget } from "@/components/AskISAWidget";
import { RegulationTimeline } from "@/components/RegulationTimeline";
import { getRegulationMilestones } from "@/lib/regulation-milestones";

export default function HubRegulationDetail() {
  const [, params] = useRoute("/hub/regulations/:id");
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const regulationId = parseInt(params?.id || "0");

  // Fetch regulation data with standards
  const { data, isLoading, error } = trpc.regulations.getWithStandards.useQuery(
    { regulationId },
    { enabled: regulationId > 0 }
  );

  // Fetch ESRS mappings
  const { data: esrsMappings } = trpc.regulations.getEsrsMappings.useQuery(
    { regulationId },
    { enabled: regulationId > 0 }
  );

  // TODO: Implement saved items functionality when userContent router is available
  // const { data: savedItems } = trpc.userContent.getSavedItems.useQuery(
  //   undefined,
  //   { enabled: !!user }
  // );

  const handleSave = () => {
    if (!user) {
      toast.error("Please sign in to save regulations");
      return;
    }
    // TODO: Implement save functionality when userContent router is available
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved successfully");
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading regulation details...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !data || !data.regulation) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex items-center justify-between h-16">
            <Link
              href="/hub/regulations"
              className="text-blue-600 hover:text-blue-700 transition font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Regulations
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Regulation not found
            </h1>
            <p className="text-muted-foreground mb-6">
              The regulation you're looking for doesn't exist or has been
              removed.
            </p>
            <Link href="/hub/regulations">
              <Button>Browse All Regulations</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { regulation, mappings, standards } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/hub/regulations"
            className="text-blue-600 hover:text-blue-700 transition font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Regulations
          </Link>
          <div className="flex items-center gap-2">
            <ExportButtons
              regulationId={String(regulation.id)}
              regulationTitle={regulation.title}
              variant="outline"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              disabled={!user}
            >
              <Bookmark
                className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
              />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-12">
        <div className="container">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {regulation.regulationType && (
                <Badge className="bg-white/20 border-white/30 text-white">
                  {regulation.regulationType}
                </Badge>
              )}
              {regulation.celexId && (
                <Badge
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white"
                >
                  CELEX: {regulation.celexId}
                </Badge>
              )}
              {mappings && mappings.length > 0 && (
                <Badge className="bg-green-500/20 border-green-300/30 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {mappings.length} GS1 Standards Mapped
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{regulation.title}</h1>
            {regulation.description && (
              <p className="text-blue-100 text-lg leading-relaxed">
                {regulation.description}
              </p>
            )}
            <div className="flex items-center gap-6 mt-6 text-sm">
              {regulation.effectiveDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Effective:{" "}
                    {new Date(regulation.effectiveDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {regulation.sourceUrl && (
                <a
                  href={regulation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Source</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="standards">
                  GS1 Standards ({mappings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="attributes">GS1 Attributes</TabsTrigger>
                <TabsTrigger value="datapoints">
                  ESRS Datapoints ({esrsMappings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Regulation Details</CardTitle>
                    <CardDescription>
                      Key information about this EU sustainability regulation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {regulation.celexId && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                          CELEX ID
                        </h3>
                        <p className="text-foreground">{regulation.celexId}</p>
                      </div>
                    )}
                    {regulation.effectiveDate && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                          Effective Date
                        </h3>
                        <p className="text-foreground">
                          {new Date(
                            regulation.effectiveDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                    {regulation.regulationType && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                          Type
                        </h3>
                        <p className="text-foreground">
                          {regulation.regulationType}
                        </p>
                      </div>
                    )}
                    {regulation.description && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                          Description
                        </h3>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {regulation.description}
                        </p>
                      </div>
                    )}
                    {regulation.sourceUrl && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                          Official Source
                        </h3>
                        <a
                          href={regulation.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on EUR-Lex
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {regulation.lastUpdated && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Last Updated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {new Date(regulation.lastUpdated).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* GS1 Standards Tab */}
              <TabsContent value="standards" className="space-y-6">
                {mappings && mappings.length > 0 ? (
                  <div className="space-y-4">
                    {mappings.map(mapping => {
                      const standard = standards?.find(
                        s => s.id === mapping.standardId
                      );
                      return (
                        <Card key={mapping.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {standard?.standardName ||
                                    `Standard ID: ${mapping.standardId}`}
                                </CardTitle>
                                {standard?.standardCode && (
                                  <CardDescription className="mt-1">
                                    Code: {standard.standardCode}
                                  </CardDescription>
                                )}
                              </div>
                              {mapping.relevanceScore !== null && (
                                <Badge variant="outline" className="ml-4">
                                  Score:{" "}
                                  {(
                                    parseFloat(mapping.relevanceScore) * 100
                                  ).toFixed(0)}
                                  %
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {mapping.mappingReason && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                  Mapping Rationale
                                </h4>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {mapping.mappingReason}
                                </p>
                              </div>
                            )}
                            {standard?.description && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                  Standard Description
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {standard.description}
                                </p>
                              </div>
                            )}
                            {mapping.verifiedByAdmin && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                              >
                                ✓ Verified by Admin
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No GS1 standards mapped to this regulation yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* GS1 Attributes Tab */}
              <TabsContent value="attributes">
                <GS1AttributesPanelEnhanced
                  regulationId={regulationId}
                  regulationName={regulation.title}
                />
              </TabsContent>

              {/* ESRS Datapoints Tab */}
              <TabsContent value="datapoints">
                <ESRSDatapointsSection regulationId={regulationId} />
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Regulation Timeline</CardTitle>
                    <CardDescription>
                      Chronological view of regulation milestones and related news developments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegulationTimeline
                      regulationCode={regulation.celexId || regulation.title}
                      milestones={getRegulationMilestones(
                        regulation.celexId || regulation.title,
                        regulation.effectiveDate ? new Date(regulation.effectiveDate).toISOString() : undefined
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              <AskISAWidget 
                regulationId={regulation.id.toString()}
                regulationName={regulation.title}
                contextHint={`${regulation.title} compliance and GS1 standards mapping`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
