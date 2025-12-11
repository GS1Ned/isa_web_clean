import { Link } from "wouter";
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
  Building2,
  Calendar,
  ExternalLink,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HubDutchInitiatives() {
  const [selectedSector, setSelectedSector] = useState<string | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );

  // Fetch initiatives with filters
  const { data: initiatives, isLoading } = trpc.dutchInitiatives.list.useQuery({
    sector: selectedSector,
    status: selectedStatus,
  });

  // Fetch sectors for filter dropdown
  const { data: sectors } = trpc.dutchInitiatives.getSectors.useQuery();

  const handleClearFilters = () => {
    setSelectedSector(undefined);
    setSelectedStatus(undefined);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Pilot":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Proposed":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white">
        <div className="container py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant="outline"
                className="bg-white/10 border-white/30 text-white"
              >
                🇳🇱 Dutch Initiatives
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Dutch Compliance Initiatives
            </h1>
            <p className="text-orange-100 text-lg leading-relaxed">
              National programs that complement EU regulations. Discover how
              Dutch initiatives like UPV Textiel, Green Deal Zorg, and DSGO
              align with GS1 standards and EU sustainability requirements.
            </p>
            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{initiatives?.length || 0} Initiatives</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{sectors?.length || 0} Sectors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>

            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Sectors</SelectItem>
                {sectors?.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pilot">Pilot</SelectItem>
                <SelectItem value="Proposed">Proposed</SelectItem>
              </SelectContent>
            </Select>

            {(selectedSector || selectedStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading initiatives...</p>
              </div>
            ) : initiatives && initiatives.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {initiatives.map(initiative => (
                  <Link
                    key={initiative.id}
                    href={`/hub/dutch-initiatives/${initiative.id}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <CardTitle className="text-xl">
                            {initiative.shortName}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={getStatusColor(initiative.status)}
                          >
                            {getStatusIcon(initiative.status)}
                            <span className="ml-1">{initiative.status}</span>
                          </Badge>
                        </div>
                        <CardDescription className="text-base font-medium text-foreground">
                          {initiative.initiativeName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary">{initiative.sector}</Badge>
                          <Badge variant="outline">
                            {initiative.initiativeType}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {initiative.scope}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t">
                          {initiative.startDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Since{" "}
                                {new Date(initiative.startDate).getFullYear()}
                              </span>
                            </div>
                          )}
                          {initiative.officialUrl && (
                            <a
                              href={initiative.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No Dutch initiatives found matching your filters.
                  </p>
                  {(selectedSector || selectedStatus) && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
