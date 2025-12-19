/**
 * Standards Directory Page
 * 
 * Priority 3: Standards Discovery UI
 * 
 * Purpose: Enable users to deterministically discover what standards exist,
 * who owns them, and what their current status is — without interpretation or reasoning.
 * 
 * Scope:
 * - List standards with filtering by organization, jurisdiction, sector, lifecycle status
 * - Navigate to detail view with authoritative sources and transparency metadata
 * - Read-only display, no interpretation
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, Building2, MapPin, Tag, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export function StandardsDirectory() {
  const [, navigate] = useLocation();
  
  // Filter state
  const [organization, setOrganization] = useState<string | undefined>(undefined);
  const [jurisdiction, setJurisdiction] = useState<string | undefined>(undefined);
  const [sector, setSector] = useState<string | undefined>(undefined);
  const [lifecycleStatus, setLifecycleStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // Query standards
  const { data, isLoading } = trpc.standardsDirectory.list.useQuery({
    organization: organization as any,
    jurisdiction: jurisdiction as any,
    sector: sector as any,
    lifecycleStatus: lifecycleStatus as any,
    search: search || undefined,
  });

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleClearFilters = () => {
    setOrganization(undefined);
    setJurisdiction(undefined);
    setSector(undefined);
    setLifecycleStatus(undefined);
    setSearch("");
    setSearchInput("");
  };

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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Standards Directory</h1>
        <p className="text-muted-foreground">
          Discover what standards exist, who owns them, and what their current status is.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter standards by organization, jurisdiction, sector, or lifecycle status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select value={organization} onValueChange={(v) => setOrganization(v === "all" ? undefined : v)}>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="All organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All organizations</SelectItem>
                  <SelectItem value="GS1_Global">GS1 Global</SelectItem>
                  <SelectItem value="GS1_EU">GS1 EU</SelectItem>
                  <SelectItem value="GS1_NL">GS1 NL</SelectItem>
                  <SelectItem value="EFRAG">EFRAG</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={(v) => setJurisdiction(v === "all" ? undefined : v)}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="All jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jurisdictions</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="NL">NL</SelectItem>
                  <SelectItem value="Benelux">Benelux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={sector} onValueChange={(v) => setSector(v === "all" ? undefined : v)}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sectors</SelectItem>
                  <SelectItem value="DIY">DIY</SelectItem>
                  <SelectItem value="FMCG">FMCG</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="All">All (cross-sector)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifecycleStatus">Lifecycle Status</Label>
              <Select value={lifecycleStatus} onValueChange={(v) => setLifecycleStatus(v === "all" ? undefined : v)}>
                <SelectTrigger id="lifecycleStatus">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="ratified">Ratified</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="superseded">Superseded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name or code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${data?.total || 0} standards found`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </>
        ) : data?.standards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No standards found matching your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.standards.map((standard) => (
            <Card
              key={standard.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/standards-directory/${standard.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{standard.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
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
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
                {standard.recordCount && (
                  <CardDescription className="mt-2">
                    {standard.recordCount.toLocaleString()} records
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
