import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { AdvisoryReportPdfExportButton } from "@/components/AdvisoryReportPdfExportButton";
import {
  formatAdvisoryEnumLabel,
  formatDecisionArtifactCount,
  getAdvisoryPublicationStatusTone,
  getAdvisoryReviewStatusTone,
} from "@/lib/advisory-report-ui";

/**
 * Advisory Reports Page
 * 
 * Displays AI-generated compliance and standards advisory documents.
 * Implements Decision 4: Publication deferred to Phase 9, internal-only by default.
 */
export default function AdvisoryReports() {
  const [, setLocation] = useLocation();
  const [reportTypeFilter, setReportTypeFilter] = useState<string | undefined>();
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string | undefined>();

  const { data: reports, isLoading } = trpc.advisoryReports.list.useQuery({
    reportType: reportTypeFilter,
    reviewStatus: reviewStatusFilter,
    publicationStatus: undefined, // Show all for now
  });
  const { data: stats } = trpc.advisoryReports.stats.useQuery();

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Lane C Governance Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Lane C Governance:</strong> Advisory reports are AI-generated and for internal use
          only. Publication is deferred pending Phase 9 governance review. Always consult official GS1
          and regulatory documentation for authoritative guidance.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Advisory Reports</h1>
        <p className="text-muted-foreground">
          AI-generated compliance and standards advisory documents
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Review Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {stats.byReviewStatus.map((item: any) => (
                  <div key={item.status} className="flex justify-between">
                    <span>{item.status}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Publication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {stats.byPublicationStatus.map((item: any) => (
                  <div key={item.status} className="flex justify-between">
                    <span>{item.status}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="COMPLIANCE_ASSESSMENT">Compliance Assessment</SelectItem>
              <SelectItem value="STANDARDS_MAPPING">Standards Mapping</SelectItem>
              <SelectItem value="REGULATION_IMPACT">Regulation Impact</SelectItem>
              <SelectItem value="IMPLEMENTATION_GUIDE">Implementation Guide</SelectItem>
              <SelectItem value="GAP_ANALYSIS">Gap Analysis</SelectItem>
              <SelectItem value="SECTOR_ADVISORY">Sector Advisory</SelectItem>
              <SelectItem value="CUSTOM">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Review Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => {
              setReportTypeFilter(undefined);
              setReviewStatusFilter(undefined);
            }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading && <div>Loading reports...</div>}
        
        {reports && reports.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No advisory reports found matching your filters.
            </CardContent>
          </Card>
        )}

        {reports?.map((report) => {
          const reviewTone = getAdvisoryReviewStatusTone(report.reviewStatus);
          const publicationTone = getAdvisoryPublicationStatusTone(report.publicationStatus);

          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {report.title}
                    </CardTitle>
                    {Array.isArray(report.decisionArtifacts) && report.decisionArtifacts.length > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {formatDecisionArtifactCount(report.decisionArtifacts.length)}
                        </Badge>
                      </div>
                    )}
                    {report.executiveSummary && (
                      <CardDescription className="mt-2">{report.executiveSummary}</CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline">
                      {formatAdvisoryEnumLabel(report.reportType)}
                    </Badge>
                    <Badge variant={reviewTone.variant} className={reviewTone.className}>
                      {formatAdvisoryEnumLabel(report.reviewStatus)}
                    </Badge>
                    <Badge
                      variant={publicationTone.variant}
                      className={publicationTone.className}
                    >
                      {formatAdvisoryEnumLabel(report.publicationStatus)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Version</div>
                  <div className="font-medium">{report.version}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Generated</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(report.generatedDate))} ago
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Generated By</div>
                  <div className="font-medium">{report.generatedBy || "AI System"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Views</div>
                  <div className="font-medium">{report.viewCount}</div>
                </div>
              </div>

              {/* Quality Score */}
              {report.qualityScore && typeof report.qualityScore !== 'object' && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Quality Score</div>
                    <div className="text-sm text-muted-foreground">
                      {(Number(report.qualityScore) * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{Number(report.qualityScore).toFixed(2)}</div>
                </div>
              )}

              {/* Tags */}
              {((Array.isArray(report.sectorTags) && report.sectorTags.length > 0) || (Array.isArray(report.gs1ImpactTags) && report.gs1ImpactTags.length > 0)) && (
                <div className="flex flex-wrap gap-2">
                  {(report.sectorTags as string[] | undefined)?.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {(report.gs1ImpactTags as string[] | undefined)?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setLocation(`/advisory-reports/${report.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <AdvisoryReportPdfExportButton
                    reportId={report.id}
                    reportTitle={report.title}
                  />
                </div>

                {/* Governance Notice */}
                {report.publicationStatus === "INTERNAL_ONLY" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Internal Use Only:</strong> This report has not been approved for external
                      publication. Decision 4: Publication deferred to Phase 9.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
