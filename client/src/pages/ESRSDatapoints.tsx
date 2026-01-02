import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, FileText, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ESRSDatapoints() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<
    string | undefined
  >();
  const [selectedDataType, setSelectedDataType] = useState<
    string | undefined
  >();
  const [showVoluntaryOnly, setShowVoluntaryOnly] = useState<
    boolean | undefined
  >();

  const pageSize = 50;

  // Fetch datapoints with filters
  const { data, isLoading } = trpc.esrs.list.useQuery({
    page,
    pageSize,
    search: search || undefined,
    standard: selectedStandard,
    data_type: selectedDataType,
    voluntary: showVoluntaryOnly,
  });

  // Fetch available standards for filter
  const { data: standards } = trpc.esrs.getStandards.useQuery();

  // Fetch statistics
  const { data: stats } = trpc.esrs.getStats.useQuery();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleStandardFilter = (value: string) => {
    setSelectedStandard(value === "all" ? undefined : value);
    setPage(1);
  };

  const handleDataTypeFilter = (value: string) => {
    setSelectedDataType(value === "all" ? undefined : value);
    setPage(1);
  };

  const handleVoluntaryFilter = (value: string) => {
    setShowVoluntaryOnly(value === "all" ? undefined : value === "true");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedStandard(undefined);
    setSelectedDataType(undefined);
    setShowVoluntaryOnly(undefined);
    setPage(1);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">ESRS Datapoint Browser</h1>
        <p className="text-muted-foreground text-lg">
          Explore {stats?.total || "1,184"} official EFRAG disclosure
          requirements across all ESRS standards
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Datapoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Official EFRAG IG 3
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                ESRS Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.keys(stats.byStandard).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                E1-E5, S1-S4, G1, ESRS 2
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Data Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.keys(stats.byDataType).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Narrative, quantitative, qualitative
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific disclosure requirements by keyword, standard, or data
            type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, or disclosure requirement..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Standard Filter */}
            <Select
              value={selectedStandard || "all"}
              onValueChange={handleStandardFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Standards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Standards</SelectItem>
                {standards?.filter((std): std is string => std !== null).map(std => (
                  <SelectItem key={std} value={std}>
                    {std}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Data Type Filter */}
            <Select
              value={selectedDataType || "all"}
              onValueChange={handleDataTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Data Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data Types</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="quantitative">Quantitative</SelectItem>
                <SelectItem value="qualitative">Qualitative</SelectItem>
                <SelectItem value="semi-narrative">Semi-narrative</SelectItem>
              </SelectContent>
            </Select>

            {/* Voluntary Filter */}
            <Select
              value={showVoluntaryOnly?.toString() || "all"}
              onValueChange={handleVoluntaryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Requirements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requirements</SelectItem>
                <SelectItem value="false">Mandatory Only</SelectItem>
                <SelectItem value="true">Voluntary Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datapoints
            {data && (
              <Badge variant="secondary" className="ml-2">
                {data.total} results
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Page {data?.page || 1} of {data?.totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data && data.datapoints.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">ID</TableHead>
                      <TableHead className="w-[100px]">Standard</TableHead>
                      <TableHead className="w-[80px]">DR</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[120px]">Data Type</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.datapoints.map(dp => (
                      <TableRow key={dp.id}>
                        <TableCell className="font-mono text-xs">
                          {dp.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{dp.esrsStandard}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {dp.disclosureRequirement}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div
                            className="truncate"
                            title={dp.name || ""}
                          >
                            {dp.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{dp.dataType}</Badge>
                        </TableCell>
                        <TableCell>
                          {dp.voluntary ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Voluntary
                            </Badge>
                          ) : (
                            <Badge variant="default">Mandatory</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(data.page - 1) * data.pageSize + 1} to{" "}
                  {Math.min(data.page * data.pageSize, data.total)} of{" "}
                  {data.total} datapoints
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= (data.totalPages || 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No datapoints found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
