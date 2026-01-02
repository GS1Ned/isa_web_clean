import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, ExternalLink, Download, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Governance Documents Page
 * 
 * Catalog of official GS1 and EU regulatory documents with verification tracking.
 * Supports Lane C governance with explicit currency disclaimers.
 */
export default function GovernanceDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: documents, isLoading } = trpc.governanceDocuments.list.useQuery({
    documentType: documentTypeFilter,
    category: categoryFilter,
    status: statusFilter,
    searchTerm: searchTerm || undefined,
  });

  const { data: stats } = trpc.governanceDocuments.stats.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "DRAFT":
        return "secondary";
      case "SUPERSEDED":
        return "warning";
      case "WITHDRAWN":
      case "ARCHIVED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getVerificationBadge = (lastVerifiedDate: string | null) => {
    if (!lastVerifiedDate) {
      return <Badge variant="destructive">Never Verified</Badge>;
    }

    const daysSinceVerification = Math.floor(
      (Date.now() - new Date(lastVerifiedDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVerification > 90) {
      return <Badge variant="destructive">Verification Expired</Badge>;
    } else if (daysSinceVerification > 60) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Verification Expiring Soon</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-500 text-green-700">Recently Verified</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Lane C Governance Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Lane C Governance:</strong> This catalog is for reference only and may not reflect
          the most current versions of official documents. Always verify document availability and
          currency with official GS1 and EU regulatory sources. Last updated:{" "}
          {new Date().toLocaleDateString()}.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Governance Documents</h1>
        <p className="text-muted-foreground">
          Catalog of official GS1 and EU regulatory documents
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {stats.byDocumentType.slice(0, 3).map((item: any) => (
                  <div key={item.type} className="flex justify-between">
                    <span>{item.type?.replace(/_/g, " ")}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {stats.byStatus.map((item: any) => (
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title, code, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GS1_STANDARD">GS1 Standard</SelectItem>
                <SelectItem value="GS1_GUIDELINE">GS1 Guideline</SelectItem>
                <SelectItem value="GS1_WHITE_PAPER">GS1 White Paper</SelectItem>
                <SelectItem value="EU_REGULATION">EU Regulation</SelectItem>
                <SelectItem value="EU_DIRECTIVE">EU Directive</SelectItem>
                <SelectItem value="EU_IMPLEMENTING_ACT">EU Implementing Act</SelectItem>
                <SelectItem value="EU_DELEGATED_ACT">EU Delegated Act</SelectItem>
                <SelectItem value="TECHNICAL_SPECIFICATION">Technical Specification</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="IDENTIFICATION">Identification</SelectItem>
                <SelectItem value="CAPTURE">Capture</SelectItem>
                <SelectItem value="SHARE">Share</SelectItem>
                <SelectItem value="ESG_REPORTING">ESG Reporting</SelectItem>
                <SelectItem value="TRACEABILITY">Traceability</SelectItem>
                <SelectItem value="DIGITAL_PRODUCT_PASSPORT">Digital Product Passport</SelectItem>
                <SelectItem value="CIRCULAR_ECONOMY">Circular Economy</SelectItem>
                <SelectItem value="DUE_DILIGENCE">Due Diligence</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUPERSEDED">Superseded</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setDocumentTypeFilter(undefined);
                setCategoryFilter(undefined);
                setStatusFilter(undefined);
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {isLoading && <div>Loading documents...</div>}
        
        {documents && documents.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No documents found matching your search criteria.
            </CardContent>
          </Card>
        )}

        {documents?.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {doc.title}
                  </CardTitle>
                  {doc.description && (
                    <CardDescription className="mt-2">{String(doc.description)}</CardDescription>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={getStatusColor(doc.status) as any}>{doc.status}</Badge>
                  <Badge variant="outline">{doc.documentType.replace(/_/g, " ")}</Badge>
                  {doc.isOfficial && <Badge variant="default">Official</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {doc.documentCode && (
                  <div>
                    <div className="text-muted-foreground">Document Code</div>
                    <div className="font-medium">{doc.documentCode}</div>
                  </div>
                )}
                {doc.version && (
                  <div>
                    <div className="text-muted-foreground">Version</div>
                    <div className="font-medium">{doc.version}</div>
                  </div>
                )}
                {doc.publishedDate && (
                  <div>
                    <div className="text-muted-foreground">Published</div>
                    <div className="font-medium">
                      {new Date(doc.publishedDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <Badge variant="outline">{doc.category.replace(/_/g, " ")}</Badge>
                </div>
              </div>
              {Array.isArray(doc.tags) && doc.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(doc.tags as string[]).map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="default" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Document
                  </a>
                </Button>
                {doc.downloadUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                )}
              </div>

              {/* Superseded Notice */}
              {doc.status === "SUPERSEDED" && doc.supersededBy && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Superseded:</strong> This document has been replaced by a newer version
                    (ID: {doc.supersededBy}).
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
