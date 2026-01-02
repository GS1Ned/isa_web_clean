import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  FileText,

  AlertCircle,
  Target,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

export default function HubDutchInitiativeDetail() {
  const [, params] = useRoute("/hub/dutch-initiatives/:id");
  const initiativeId = parseInt(params?.id || "0");

  const { data, isLoading, error } =
    trpc.dutchInitiatives.getWithMappings.useQuery(
      { initiativeId },
      { enabled: initiativeId > 0 }
    );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading initiative details...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.initiative) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex items-center justify-between h-16">
            <Link
              href="/hub/dutch-initiatives"
              className="text-orange-600 hover:text-orange-700 transition font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dutch Initiatives
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Initiative Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The initiative you're looking for doesn't exist or has been
              removed.
            </p>
            <Link href="/hub/dutch-initiatives">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dutch Initiatives
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { initiative, regulationMappings, standardMappings } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pilot":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Proposed":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "RECOMMENDED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "OPTIONAL":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/hub/dutch-initiatives"
            className="text-orange-600 hover:text-orange-700 transition font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dutch Initiatives
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white">
        <div className="container py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge
                variant="outline"
                className="bg-white/10 border-white/30 text-white"
              >
                🇳🇱 {initiative.sector}
              </Badge>
              <Badge
                variant="outline"
                className={getStatusColor(initiative.status)}
              >
                {initiative.status}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/10 border-white/30 text-white"
              >
                {initiative.initiativeType}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{initiative.shortName}</h1>
            <p className="text-orange-100 text-lg leading-relaxed mb-6">
              {initiative.initiativeName}
            </p>
            <div className="flex items-center gap-6 text-sm flex-wrap">
              {initiative.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Since {new Date(initiative.startDate).getFullYear()}
                  </span>
                </div>
              )}
              {initiative.managingOrganization && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{initiative.managingOrganization}</span>
                </div>
              )}
              {regulationMappings.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{regulationMappings.length} EU Regulations</span>
                </div>
              )}
              {standardMappings.length > 0 && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{standardMappings.length} GS1 Standards</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container">
          <div className="max-w-4xl space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Scope and objectives of this initiative
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    Scope
                  </h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {initiative.scope}
                  </p>
                </div>
                {(Array.isArray(initiative.keyTargets) && initiative.keyTargets.length > 0) && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        Key Targets
                      </h3>
                      <ul className="space-y-2">
                        {initiative.keyTargets.map((target, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                            <span className="text-foreground">{target}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Compliance Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Requirements</CardTitle>
                <CardDescription>
                  What companies must do to participate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {initiative.complianceRequirements}
                </p>
                {initiative.reportingDeadline && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-900">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Reporting Deadline:</span>
                      <span>{initiative.reportingDeadline}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GS1 Relevance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  GS1 Standards Integration
                </CardTitle>
                <CardDescription>
                  How GS1 standards support this initiative
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {initiative.gs1Relevance}
                </p>

                {standardMappings.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">
                      Required GS1 Standards ({standardMappings.length})
                    </h4>
                    {standardMappings.map(mapping => (
                      <div
                        key={mapping.id}
                        className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold">
                                {mapping.standard?.standardName ||
                                  "Unknown Standard"}
                              </h5>
                              <Badge
                                variant="outline"
                                className={getCriticalityColor(
                                  mapping.criticality
                                )}
                              >
                                {mapping.criticality}
                              </Badge>
                            </div>
                            {mapping.standard?.category && (
                              <Badge variant="secondary" className="mb-2">
                                {mapping.standard.category}
                              </Badge>
                            )}
                            {mapping.standard?.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {mapping.standard.description}
                              </p>
                            )}
                            {mapping.implementationNotes && (
                              <p className="text-sm text-foreground italic mt-2 pl-4 border-l-2 border-blue-200">
                                💡 {mapping.implementationNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related EU Regulations */}
            {regulationMappings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    Related EU Regulations
                  </CardTitle>
                  <CardDescription>
                    EU regulations that this initiative implements or
                    complements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regulationMappings.map(mapping => (
                      <Link
                        key={mapping.id}
                        href={`/hub/regulations/${mapping.regulation?.id}`}
                      >
                        <div className="border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold">
                                  {mapping.regulation?.title ||
                                    "Unknown Regulation"}
                                </h5>
                                <Badge variant="outline">
                                  {mapping.relationshipType}
                                </Badge>
                              </div>
                              {mapping.description && (
                                <p className="text-sm text-muted-foreground">
                                  {mapping.description}
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {(initiative.officialUrl || initiative.documentationUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Official documentation and links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {initiative.officialUrl && (
                      <a
                        href={initiative.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Official Website</span>
                      </a>
                    )}
                    {initiative.documentationUrl && (
                      <a
                        href={initiative.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Documentation</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
