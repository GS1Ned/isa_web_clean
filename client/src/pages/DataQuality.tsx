/**
 * Data Quality Dashboard
 * Track B Priority 1: Data Quality Foundation
 * 
 * Provides visibility into data completeness, consistency, and integrity
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DataQuality() {
  const { data: summary, isLoading: summaryLoading } = trpc.dataQuality.getSummary.useQuery();
  const { data: orphanedRegs, isLoading: orphanedRegsLoading } = trpc.dataQuality.getOrphanedRegulations.useQuery();
  const { data: orphanedStds, isLoading: orphanedStdsLoading } = trpc.dataQuality.getOrphanedStandards.useQuery();
  const { data: regsMissingMeta, isLoading: regsMissingMetaLoading } = trpc.dataQuality.getRegulationsWithMissingMetadata.useQuery();
  const { data: stdsMissingMeta, isLoading: stdsMissingMetaLoading } = trpc.dataQuality.getStandardsWithMissingMetadata.useQuery();
  const { data: duplicateRegs, isLoading: duplicateRegsLoading } = trpc.dataQuality.getDuplicateRegulations.useQuery();
  const { data: duplicateStds, isLoading: duplicateStdsLoading } = trpc.dataQuality.getDuplicateStandards.useQuery();

  const getQualityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-600">Fair</Badge>;
    return <Badge className="bg-red-600">Poor</Badge>;
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 75) return <AlertCircle className="h-5 w-5 text-blue-600" />;
    if (score >= 50) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Quality Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor data completeness, consistency, and integrity across ISA knowledge base
        </p>
      </div>

      {/* Schema Debt Warning */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Priority 1 schema enhancements (lifecycle_status, publisher, jurisdiction) are pending due to pre-existing schema migration issues. 
          This dashboard uses existing schema fields only. See <code>docs/PRIORITY_1_SCHEMA_DEBT.md</code> for details.
        </AlertDescription>
      </Alert>

      {/* Quality Score Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Quality</CardTitle>
            {summaryLoading ? <Skeleton className="h-5 w-5" /> : getQualityIcon(summary?.qualityScores.overall || 0)}
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.qualityScores.overall}%</div>
                <div className="mt-2">{getQualityBadge(summary?.qualityScores.overall || 0)}</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regulation Quality</CardTitle>
            {summaryLoading ? <Skeleton className="h-5 w-5" /> : getQualityIcon(summary?.qualityScores.regulationQuality || 0)}
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.qualityScores.regulationQuality}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.totalRecords.regulations} total regulations
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard Quality</CardTitle>
            {summaryLoading ? <Skeleton className="h-5 w-5" /> : getQualityIcon(summary?.qualityScores.standardQuality || 0)}
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.qualityScores.standardQuality}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.totalRecords.standards} total standards
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapping Coverage</CardTitle>
            {summaryLoading ? <Skeleton className="h-5 w-5" /> : getQualityIcon(summary?.qualityScores.mappingCoverage || 0)}
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.qualityScores.mappingCoverage}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.totalRecords.mappings} total mappings
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Quality Issues */}
      <Tabs defaultValue="orphaned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orphaned">Orphaned Records</TabsTrigger>
          <TabsTrigger value="missing">Missing Metadata</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
        </TabsList>

        <TabsContent value="orphaned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orphaned Regulations</CardTitle>
              <CardDescription>
                Regulations with no mapped GS1 standards ({orphanedRegs?.length || 0} found)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orphanedRegsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : orphanedRegs && orphanedRegs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>CELEX ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanedRegs.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.id}</TableCell>
                        <TableCell className="max-w-md truncate">{reg.title}</TableCell>
                        <TableCell>{reg.regulationType}</TableCell>
                        <TableCell>{reg.celexId || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No orphaned regulations found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orphaned Standards</CardTitle>
              <CardDescription>
                GS1 standards with no mapped regulations ({orphanedStds?.length || 0} found)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orphanedStdsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : orphanedStds && orphanedStds.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Standard Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanedStds.map((std) => (
                      <TableRow key={std.id}>
                        <TableCell>{std.id}</TableCell>
                        <TableCell className="max-w-md truncate">{std.standardName}</TableCell>
                        <TableCell>{std.standardCode}</TableCell>
                        <TableCell>{std.category || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No orphaned standards found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulations with Missing Metadata</CardTitle>
              <CardDescription>
                Regulations missing description, source URL, or effective date ({regsMissingMeta?.length || 0} found)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {regsMissingMetaLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : regsMissingMeta && regsMissingMeta.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Missing Fields</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regsMissingMeta.map((reg) => {
                      const missing = [];
                      if (reg.missingDescription) missing.push("Description");
                      if (reg.missingSourceUrl) missing.push("Source URL");
                      if (reg.missingEffectiveDate) missing.push("Effective Date");
                      return (
                        <TableRow key={reg.id}>
                          <TableCell>{reg.id}</TableCell>
                          <TableCell className="max-w-md truncate">{reg.title}</TableCell>
                          <TableCell>{reg.regulationType}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {missing.join(", ")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No regulations with missing metadata found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Standards with Missing Metadata</CardTitle>
              <CardDescription>
                Standards missing description, category, or reference URL ({stdsMissingMeta?.length || 0} found)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stdsMissingMetaLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : stdsMissingMeta && stdsMissingMeta.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Standard Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Missing Fields</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stdsMissingMeta.map((std) => {
                      const missing = [];
                      if (std.missingDescription) missing.push("Description");
                      if (std.missingCategory) missing.push("Category");
                      if (std.missingReferenceUrl) missing.push("Reference URL");
                      return (
                        <TableRow key={std.id}>
                          <TableCell>{std.id}</TableCell>
                          <TableCell className="max-w-md truncate">{std.standardName}</TableCell>
                          <TableCell>{std.standardCode}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {missing.join(", ")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No standards with missing metadata found.</p>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Schema Enhancement Pending:</strong> Additional metadata fields (lifecycle_status, publisher, jurisdiction) 
              will be added once schema migration issues are resolved.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Regulations</CardTitle>
              <CardDescription>
                Regulations with duplicate CELEX IDs ({duplicateRegs?.length || 0} found)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {duplicateRegsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : duplicateRegs && duplicateRegs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CELEX ID</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duplicateRegs.map((dup) => (
                      <TableRow key={dup.celexId}>
                        <TableCell>{dup.celexId}</TableCell>
                        <TableCell>{dup.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No duplicate regulations found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Duplicate Standards</CardTitle>
              <CardDescription>
                Standards with duplicate standard codes ({duplicateStds?.length || 0} found)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {duplicateStdsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : duplicateStds && duplicateStds.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Standard Code</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duplicateStds.map((dup) => (
                      <TableRow key={dup.standardCode}>
                        <TableCell>{dup.standardCode}</TableCell>
                        <TableCell>{dup.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No duplicate standards found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
