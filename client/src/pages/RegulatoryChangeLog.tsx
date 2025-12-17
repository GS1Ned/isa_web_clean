import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Plus, Filter } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const SOURCE_TYPES = [
  { value: "EU_DIRECTIVE", label: "EU Directive" },
  { value: "EU_REGULATION", label: "EU Regulation" },
  { value: "EU_DELEGATED_ACT", label: "EU Delegated Act" },
  { value: "EU_IMPLEMENTING_ACT", label: "EU Implementing Act" },
  { value: "EFRAG_IG", label: "EFRAG Implementation Guidance" },
  { value: "EFRAG_QA", label: "EFRAG Q&A" },
  { value: "EFRAG_TAXONOMY", label: "EFRAG Taxonomy" },
  { value: "GS1_AISBL", label: "GS1 AISBL (Global)" },
  { value: "GS1_EUROPE", label: "GS1 in Europe" },
  { value: "GS1_NL", label: "GS1 Netherlands" },
];

const SOURCE_TYPE_COLORS: Record<string, string> = {
  EU_DIRECTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  EU_REGULATION: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  EU_DELEGATED_ACT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  EU_IMPLEMENTING_ACT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  EFRAG_IG: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  EFRAG_QA: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  EFRAG_TAXONOMY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  GS1_AISBL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  GS1_EUROPE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  GS1_NL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function RegulatoryChangeLog() {
  const { user } = useAuth();
  // Using sonner toast directly
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterSourceType, setFilterSourceType] = useState<string | undefined>();
  const [filterVersion, setFilterVersion] = useState<string | undefined>();

  // Form state
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    sourceType: "",
    sourceOrg: "",
    title: "",
    description: "",
    url: "",
    documentHash: "",
    impactAssessment: "",
    isaVersionAffected: "",
  });

  // Queries
  const { data: entries, isLoading, refetch } = trpc.regulatoryChangeLog.list.useQuery({
    sourceType: filterSourceType as any,
    isaVersionAffected: filterVersion,
    limit: 100,
  });

  const { data: statsBySourceType } = trpc.regulatoryChangeLog.statsBySourceType.useQuery();
  const { data: statsByVersion } = trpc.regulatoryChangeLog.statsByVersion.useQuery();

  // Mutations
  const createMutation = trpc.regulatoryChangeLog.create.useMutation({
    onSuccess: () => {
      toast.success("Entry created", {
        description: "Regulatory change log entry has been created successfully.",
      });
      setShowCreateForm(false);
      setFormData({
        entryDate: new Date().toISOString().split("T")[0],
        sourceType: "",
        sourceOrg: "",
        title: "",
        description: "",
        url: "",
        documentHash: "",
        impactAssessment: "",
        isaVersionAffected: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      entryDate: formData.entryDate,
      sourceType: formData.sourceType as "EU_DIRECTIVE" | "EU_REGULATION" | "EU_DELEGATED_ACT" | "EU_IMPLEMENTING_ACT" | "EFRAG_IG" | "EFRAG_QA" | "EFRAG_TAXONOMY" | "GS1_AISBL" | "GS1_EUROPE" | "GS1_NL",
      sourceOrg: formData.sourceOrg,
      title: formData.title,
      description: formData.description,
      url: formData.url,
      documentHash: formData.documentHash || undefined,
      impactAssessment: formData.impactAssessment || undefined,
      isaVersionAffected: formData.isaVersionAffected || undefined,
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Regulatory Change Log</h1>
          <p className="text-muted-foreground mt-2">
            Track authoritative regulatory changes from EU/Dutch sources and GS1 publications
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Source Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsBySourceType ? Object.keys(statsBySourceType).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ISA Versions Affected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsByVersion ? Object.keys(statsByVersion).length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showCreateForm && isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Regulatory Change Log Entry</CardTitle>
            <CardDescription>
              Add a new regulatory change entry. All entries are immutable once created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryDate">Entry Date *</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceType">Source Type *</Label>
                  <Select
                    value={formData.sourceType}
                    onValueChange={(value) => setFormData({ ...formData, sourceType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceOrg">Source Organisation *</Label>
                  <Input
                    id="sourceOrg"
                    value={formData.sourceOrg}
                    onChange={(e) => setFormData({ ...formData, sourceOrg: e.target.value })}
                    placeholder="e.g., European Commission, EFRAG, GS1 in Europe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isaVersionAffected">ISA Version Affected</Label>
                  <Input
                    id="isaVersionAffected"
                    value={formData.isaVersionAffected}
                    onChange={(e) =>
                      setFormData({ ...formData, isaVersionAffected: e.target.value })
                    }
                    placeholder="e.g., v1.1, v1.2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Official title of the regulatory change"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What changed and why it matters"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Source Document URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentHash">Document Hash (SHA256)</Label>
                <Input
                  id="documentHash"
                  value={formData.documentHash}
                  onChange={(e) => setFormData({ ...formData, documentHash: e.target.value })}
                  placeholder="64-character SHA256 hash for traceability"
                  maxLength={64}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impactAssessment">Impact Assessment</Label>
                <Textarea
                  id="impactAssessment"
                  value={formData.impactAssessment}
                  onChange={(e) =>
                    setFormData({ ...formData, impactAssessment: e.target.value })
                  }
                  placeholder="Brief impact analysis (1-2 sentences)"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Entry"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterSourceType">Source Type</Label>
              <Select
                value={filterSourceType || "all"}
                onValueChange={(value) =>
                  setFilterSourceType(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All source types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All source types</SelectItem>
                  {SOURCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterVersion">ISA Version</Label>
              <Select
                value={filterVersion || "all"}
                onValueChange={(value) => setFilterVersion(value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All versions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All versions</SelectItem>
                  {statsByVersion &&
                    Object.keys(statsByVersion).map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && entries && entries.total === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No regulatory change log entries found.
              {isAdmin && " Click 'Add Entry' to create the first one."}
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          entries &&
          entries.entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={SOURCE_TYPE_COLORS[entry.sourceType]}>
                        {SOURCE_TYPES.find((t) => t.value === entry.sourceType)?.label ||
                          entry.sourceType}
                      </Badge>
                      {entry.isaVersionAffected && (
                        <Badge variant="outline">{entry.isaVersionAffected}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{entry.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {entry.sourceOrg} •{" "}
                      {new Date(entry.entryDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={entry.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>

                {entry.impactAssessment && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Impact Assessment</h4>
                    <p className="text-sm text-muted-foreground">{entry.impactAssessment}</p>
                  </div>
                )}

                {entry.documentHash && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Document Hash (SHA256)</h4>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {entry.documentHash}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Entry ID: {entry.id} • Created:{" "}
                  {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                    <>
                      {" "}• Last updated:{" "}
                      {new Date(entry.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
