import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, FileText, Target, Database, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function CoverageAnalytics() {
  const { data: statistics, isLoading: statsLoading, error: statsError } = trpc.coverageAnalytics.getStatistics.useQuery();
  const { data: byRegulation, isLoading: regLoading } = trpc.coverageAnalytics.getByRegulation.useQuery();
  const { data: bySector, isLoading: sectorLoading } = trpc.coverageAnalytics.getBySector.useQuery();
  const { data: byGS1Impact, isLoading: impactLoading } = trpc.coverageAnalytics.getByGS1Impact.useQuery();
  const { data: bySource, isLoading: sourceLoading } = trpc.coverageAnalytics.getBySource.useQuery();
  const { data: gaps, isLoading: gapsLoading } = trpc.coverageAnalytics.getGaps.useQuery();

  if (statsError) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load coverage analytics. {statsError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coverage Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor news coverage across regulations, sectors, and sources
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total News Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{statistics?.totalNews || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regulations Tracked</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{statistics?.totalRegulations || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regulations with News</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{statistics?.regulationsWithNews || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{statistics?.coveragePercentage || 0}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>News Coverage Trend (Last 6 Months)</CardTitle>
          <CardDescription>Number of news articles published per month</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : statistics?.monthlyTrend && statistics.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="News Articles" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Regulations */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Regulations by News Coverage</CardTitle>
          <CardDescription>Regulations with the most news articles</CardDescription>
        </CardHeader>
        <CardContent>
          {regLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : byRegulation && byRegulation.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={byRegulation.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="regulation" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="News Articles" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No regulation data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector and Source Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Sectors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sectors</CardTitle>
            <CardDescription>News distribution by sector</CardDescription>
          </CardHeader>
          <CardContent>
            {sectorLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : bySector && bySector.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bySector.slice(0, 8)}
                    dataKey="count"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {bySector.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No sector data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Source Distribution</CardTitle>
            <CardDescription>News by source type</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : bySource && bySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bySource}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sourceType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="News Articles" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No source data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GS1 Impact Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Top GS1 Impact Areas</CardTitle>
          <CardDescription>News coverage by GS1 impact category</CardDescription>
        </CardHeader>
        <CardContent>
          {impactLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : byGS1Impact && byGS1Impact.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={byGS1Impact.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="impactArea" type="category" width={180} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f59e0b" name="News Articles" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No GS1 impact data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coverage Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Gaps</CardTitle>
          <CardDescription>Regulations with no news coverage</CardDescription>
        </CardHeader>
        <CardContent>
          {gapsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : gaps && gaps.length > 0 ? (
            <div className="space-y-2">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Found {gaps.length} regulation(s) with no news coverage
                </AlertDescription>
              </Alert>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {gaps.map((gap) => (
                  <div key={gap.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{gap.title}</div>
                    {gap.celexId && (
                      <div className="text-sm text-muted-foreground">CELEX: {gap.celexId}</div>
                    )}
                    {gap.type && (
                      <div className="text-sm text-muted-foreground">Type: {gap.type}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Excellent! All tracked regulations have news coverage.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
