/**
 * Standard Detail Page
 * 
 * Priority 3: Standards Discovery UI
 * 
 * Purpose: Display authoritative information about a single standard
 * with transparency metadata (source URL, version, last verified date).
 * 
 * Scope: Read-only display, no interpretation or reasoning
 */

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ExternalLink,
  Building2,
  MapPin,
  Tag,
  CheckCircle2,
  Calendar,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";

export function StandardDetail() {
  const [, params] = useRoute("/standards-directory/:id");
  const [, navigate] = useLocation();
  
  const standardId = params?.id || "";

  const { data: standard, isLoading } = trpc.standardsDirectory.getDetail.useQuery(
    { id: standardId },
    { enabled: !!standardId }
  );

  const getOrganizationColor = (org: string) => {
    switch (org) {
      case "GS1_Global":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "GS1_EU":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "GS1_NL":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "EFRAG":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "EU":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getLifecycleColor = (status: string) => {
    switch (status) {
      case "current":
      case "ratified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "deprecated":
      case "superseded":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/standards-directory")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/standards-directory")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Standard not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate("/standards-directory")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getOrganizationColor(standard.owningOrganization)}>
                <Building2 className="h-3 w-3 mr-1" />
                {standard.owningOrganization.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {standard.jurisdiction}
              </Badge>
              {standard.sector && (
                <Badge variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {standard.sector}
                </Badge>
              )}
              {standard.lifecycleStatus && (
                <Badge className={getLifecycleColor(standard.lifecycleStatus)}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {standard.lifecycleStatus}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl">{standard.name}</CardTitle>
            {standard.description && (
              <CardDescription className="text-base mt-2">
                {standard.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Transparency Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transparency Metadata</CardTitle>
            <CardDescription>
              Authoritative source information and verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {standard.authoritativeSourceUrl && (
              <div className="flex items-start gap-3">
                <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Authoritative Source URL</p>
                  <a
                    href={standard.authoritativeSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {standard.authoritativeSourceUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {standard.datasetIdentifier && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Dataset/Version Identifier</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {standard.datasetIdentifier}
                  </p>
                </div>
              </div>
            )}

            {standard.lastVerifiedDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Last Verified Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(standard.lastVerifiedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {standard.recordCount && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Record Count</p>
                  <p className="text-sm text-muted-foreground">
                    {standard.recordCount.toLocaleString()} records in dataset
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Details Card (if available) */}
        {(standard.category || standard.scope) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {standard.category && (
                <div>
                  <p className="text-sm font-medium mb-1">Category</p>
                  <p className="text-sm text-muted-foreground">{standard.category}</p>
                </div>
              )}

              {standard.scope && (
                <div>
                  <p className="text-sm font-medium mb-1">Scope</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {standard.scope}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
