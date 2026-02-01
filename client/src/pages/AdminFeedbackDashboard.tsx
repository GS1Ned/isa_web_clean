import { useState } from "react";
import { Link } from "wouter";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function AdminFeedbackDashboard() {
  const { user, loading } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  // Fetch feedback data
  const feedbackQuery = trpc.askISA.getFeedbackStats.useQuery(
    { timeRange },
    { enabled: !!user && user.role === "admin" }
  );

  const recentFeedbackQuery = trpc.askISA.getRecentFeedback.useQuery(
    { limit: 20 },
    { enabled: !!user && user.role === "admin" }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to view this page.
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = feedbackQuery.data;
  const recentFeedback = recentFeedbackQuery.data || [];

  // Calculate metrics
  const totalFeedback = (stats?.positive || 0) + (stats?.negative || 0);
  const positiveRate = totalFeedback > 0 
    ? Math.round((stats?.positive || 0) / totalFeedback * 100) 
    : 0;

  // Pie chart data
  const pieData = [
    { name: "Positive", value: stats?.positive || 0, color: "#22c55e" },
    { name: "Negative", value: stats?.negative || 0, color: "#ef4444" },
  ];

  // Trend data (mock for now, would come from API)
  const trendData = stats?.dailyTrend || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Ask ISA Feedback Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor user satisfaction and identify improvement opportunities
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  feedbackQuery.refetch();
                  recentFeedbackQuery.refetch();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Feedback</CardDescription>
              <CardTitle className="text-3xl">{totalFeedback}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" />
                Responses collected
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Positive Feedback</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {stats?.positive || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {positiveRate}% satisfaction rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Negative Feedback</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {stats?.negative || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-red-600">
                <ThumbsDown className="h-4 w-4 mr-1" />
                {100 - positiveRate}% need improvement
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Confidence</CardDescription>
              <CardTitle className="text-3xl">
                {stats?.avgConfidence ? `${Math.round(stats.avgConfidence * 100)}%` : "N/A"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Model confidence score
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Feedback Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <CardDescription>Positive vs Negative feedback ratio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trend</CardTitle>
              <CardDescription>Daily feedback over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No trend data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Latest user feedback on Ask ISA responses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFeedback.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback collected yet</p>
                <p className="text-sm mt-2">
                  Feedback will appear here once users start rating Ask ISA responses
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {feedback.feedbackType === "positive" ? (
                            <Badge className="bg-green-100 text-green-800">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Positive
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Negative
                            </Badge>
                          )}
                          {feedback.confidenceScore && (
                            <Badge variant="outline">
                              {Math.round(Number(feedback.confidenceScore) * 100)}% confidence
                            </Badge>
                          )}
                          {feedback.sourcesCount && (
                            <Badge variant="outline">
                              {feedback.sourcesCount} sources
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {feedback.timestamp ? new Date(feedback.timestamp).toLocaleString() : "Unknown"}
                          </span>
                        </div>
                        <p className="font-medium text-sm mb-1">
                          Q: {feedback.questionText.length > 100 
                            ? feedback.questionText.substring(0, 100) + "..." 
                            : feedback.questionText}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs p-0 h-auto"
                          onClick={() => setExpandedFeedback(
                            expandedFeedback === feedback.id ? null : feedback.id
                          )}
                        >
                          {expandedFeedback === feedback.id ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide answer
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Show answer
                            </>
                          )}
                        </Button>
                        {expandedFeedback === feedback.id && (
                          <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                            <p className="text-muted-foreground">
                              {feedback.answerText.length > 500
                                ? feedback.answerText.substring(0, 500) + "..."
                                : feedback.answerText}
                            </p>
                          </div>
                        )}
                        {feedback.feedbackComment && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <span className="font-medium">User comment:</span> {feedback.feedbackComment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
