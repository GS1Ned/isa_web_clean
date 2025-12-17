import { Link } from "wouter";
import {
  TrendingUp,
  Users,
  Eye,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  
  ResponsiveContainer,
  
} from "recharts";

export default function AdminAnalyticsDashboard() {
  const { user, loading } = useAuth();

  // Fetch hub metrics and engagement stats
  const hubMetrics = trpc.analytics.getHubMetrics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const engagementStats = trpc.analytics.getUserEngagement.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  // Fetch ESRS mapping quality analytics
  const lowScoredQuery = trpc.regulations.getLowScoredMappings.useQuery(
    { minVotes: 3 },
    {
      enabled: !!user && user.role === "admin",
    }
  );
  const voteDistributionQuery =
    trpc.regulations.getVoteDistributionByStandard.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const mostVotedQuery = trpc.regulations.getMostVotedMappings.useQuery(
    { limit: 10 },
    {
      enabled: !!user && user.role === "admin",
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⛔</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            Only administrators can access the analytics dashboard.
          </p>
          <Link href="/hub">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Return to Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const metrics = hubMetrics.data;
  const engagement = engagementStats.data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/hub"
            className="text-accent hover:text-accent/80 transition font-medium"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-lg font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Hub Engagement Analytics
            </h2>
            <p className="text-muted-foreground">
              Track user engagement, content performance, and platform health
              metrics.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-accent opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {metrics?.activeUsers.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Page Views
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.totalPageViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-accent opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground">Total views</p>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Avg Session
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.avgSessionDuration}m
                  </p>
                </div>
                <Clock className="w-8 h-8 text-accent opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground">Average duration</p>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Email Engagement */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Email Engagement
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Open Rate
                    </span>
                    <span className="text-sm font-bold text-accent">
                      {(engagement?.emailOpenRate ?? 0 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-card rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
                      style={{
                        width: `${(engagement?.emailOpenRate ?? 0) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Click Rate
                    </span>
                    <span className="text-sm font-bold text-accent">
                      {(engagement?.emailClickRate ?? 0 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-card rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
                      style={{
                        width: `${(engagement?.emailClickRate ?? 0) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Growth */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                User Growth
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    New Users (This Week)
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {engagement?.newUsersThisWeek}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Returning Users
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {engagement?.returningUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    Retention Rate
                  </span>
                  <span className="text-lg font-bold text-accent">
                    {(engagement?.userRetentionRate ?? 0 * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Top Regulations */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Top Regulations
              </h3>
              <div className="space-y-4">
                {metrics?.topRegulations.map((reg, idx) => (
                  <div key={reg.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {idx + 1}. {reg.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reg.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-card rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{
                          width: `${(reg.views / (metrics?.topRegulations[0]?.views || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Standards */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-accent" />
                Top GS1 Standards
              </h3>
              <div className="space-y-4">
                {metrics?.topStandards.map((std, idx) => (
                  <div key={std.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {idx + 1}. {std.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {std.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-card rounded-full h-2">
                      <div
                        className="bg-secondary rounded-full h-2 transition-all"
                        style={{
                          width: `${(std.views / (metrics?.topStandards[0]?.views || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Metrics */}
          <div className="card-elevated p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Alert Engagement
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Average Alerts per User
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {engagement?.avgAlertsPerUser}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Users have set up alerts
                </p>
              </div>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  Recommendation
                </p>
                <p className="text-sm text-muted-foreground">
                  Encourage more users to set up alerts. Consider sending
                  onboarding emails about alert features to increase engagement.
                </p>
              </div>
            </div>
          </div>

          {/* ESRS Mapping Quality Analytics */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              ESRS Mapping Quality Analytics
            </h2>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="low-scored">Low-Scored</TabsTrigger>
                <TabsTrigger value="most-voted">Most-Voted</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Standards
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {voteDistributionQuery.data?.length || 0}
                    </p>
                  </div>
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Mappings
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {voteDistributionQuery.data?.reduce(
                        (sum, d) => sum + d.totalMappings,
                        0
                      ) || 0}
                    </p>
                  </div>
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Votes
                    </p>
                    <p className="text-3xl font-bold text-accent">
                      {voteDistributionQuery.data?.reduce(
                        (sum, d) => sum + d.totalVotes,
                        0
                      ) || 0}
                    </p>
                  </div>
                  <div className="card-elevated p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      Avg Approval
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {voteDistributionQuery.data &&
                      voteDistributionQuery.data.length > 0
                        ? Math.round(
                            voteDistributionQuery.data.reduce(
                              (sum, d) => sum + d.approvalPercentage,
                              0
                            ) / voteDistributionQuery.data.length
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                {/* Vote Distribution Chart */}
                {voteDistributionQuery.data &&
                  voteDistributionQuery.data.length > 0 && (
                    <div className="card-elevated p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Approval Rate by ESRS Standard
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={voteDistributionQuery.data.map(d => ({
                            standard: d.esrs_standard,
                            approval: d.approvalPercentage,
                            votes: d.totalVotes,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="standard"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            label={{
                              value: "Approval %",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="approval"
                            fill="#3b82f6"
                            name="Approval %"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
              </TabsContent>

              {/* Low-Scored Tab */}
              <TabsContent value="low-scored">
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Low-Scored Mappings (&lt; 50% Approval)
                  </h3>
                  {lowScoredQuery.data && lowScoredQuery.data.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No low-scored mappings found. Great job!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lowScoredQuery.data?.slice(0, 5).map(mapping => (
                        <div
                          key={mapping.mappingId}
                          className="border border-border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">
                                {mapping.datapointName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {mapping.esrs_standard}
                              </p>
                            </div>
                            <Badge
                              variant={
                                mapping.approvalPercentage < 30
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {mapping.approvalPercentage}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Most-Voted Tab */}
              <TabsContent value="most-voted">
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                    Most-Voted Mappings
                  </h3>
                  {mostVotedQuery.data && mostVotedQuery.data.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No voted mappings yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {mostVotedQuery.data?.slice(0, 5).map((mapping, idx) => (
                        <div
                          key={mapping.mappingId}
                          className="border border-border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">
                                #{idx + 1} - {mapping.datapointName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {mapping.esrs_standard}
                              </p>
                            </div>
                            <Badge
                              variant={
                                mapping.approvalPercentage > 70
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {mapping.approvalPercentage}% (
                              {mapping.totalVotes})
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Export Button */}
          <div className="flex gap-3 mt-8">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Export Report (PDF)
            </Button>
            <Button variant="outline">Export Data (CSV)</Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect - ESG Regulations Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
