// @ts-nocheck
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function ExecutiveScorecard() {
  const { data: authUser } = trpc.auth.me.useQuery();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authUser?.role === "admin") {
      setIsAdmin(true);
    }
  }, [authUser]);

  const { data: scorecard, isLoading: scorecardLoading } =
    trpc.executiveAnalytics.getOrganizationScorecard.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: riskStatus } = trpc.executiveAnalytics.getRiskStatus.useQuery(
    undefined,
    {
      enabled: isAdmin,
    }
  );

  const { data: remediationProgress } =
    trpc.executiveAnalytics.getRemediationProgress.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: evidenceMetrics } =
    trpc.executiveAnalytics.getEvidenceMetrics.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: teamPerformance } =
    trpc.executiveAnalytics.getTeamPerformance.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: strategicInsights } =
    trpc.executiveAnalytics.getStrategicInsights.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: complianceTrend } =
    trpc.executiveAnalytics.getComplianceTrend.useQuery(undefined, {
      enabled: isAdmin,
    });

  if (!isAdmin || !authUser) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-600 mt-2">
          Only administrators can access the executive scorecard.
        </p>
      </div>
    );
  }

  if (scorecardLoading) {
    return (
      <div className="p-8 text-center">Loading executive dashboard...</div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Executive Compliance Scorecard</h1>
        <p className="text-gray-600 mt-2">
          Organization-wide compliance posture and strategic insights
        </p>
      </div>

      {/* Main Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={getScoreBgColor(scorecard?.organizationScore || 0)}>
          <CardHeader>
            <CardTitle className="text-sm">Organization Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-bold ${getScoreColor(scorecard?.organizationScore || 0)}`}
            >
              {scorecard?.organizationScore || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {scorecard?.totalUsers || 0} team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-bold ${getScoreColor(scorecard?.riskScore || 0)}`}
            >
              {scorecard?.riskScore || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Risk mitigation effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Remediation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-bold ${getScoreColor(scorecard?.remediationScore || 0)}`}
            >
              {scorecard?.remediationScore || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">Plan completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evidence Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-bold ${getScoreColor(scorecard?.evidenceScore || 0)}`}
            >
              {scorecard?.evidenceScore || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">Documentation quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Regulation Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-5xl font-bold ${getScoreColor(scorecard?.regulationScore || 0)}`}
            >
              {scorecard?.regulationScore || 0}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Applicable regulations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trend Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp
                className={`w-8 h-8 ${complianceTrend?.direction === "improving" ? "text-green-600" : complianceTrend?.direction === "declining" ? "text-red-600" : "text-gray-600"}`}
              />
              <span className="text-2xl font-bold capitalize">
                {complianceTrend?.direction || "stable"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">90-day trajectory</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {riskStatus?.critical || 0}
              </div>
              <p className="text-sm text-gray-600">Critical</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {riskStatus?.high || 0}
              </div>
              <p className="text-sm text-gray-600">High</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {riskStatus?.medium || 0}
              </div>
              <p className="text-sm text-gray-600">Medium</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {riskStatus?.low || 0}
              </div>
              <p className="text-sm text-gray-600">Low</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {riskStatus?.resolved || 0}
              </div>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Resolution Rate</span>
              <span className="text-2xl font-bold text-green-600">
                {riskStatus?.resolutionRate || 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remediation & Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Remediation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm font-bold">
                  {remediationProgress?.completed || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${remediationProgress?.completionRate || 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">In Progress</p>
                <p className="font-bold">
                  {remediationProgress?.inProgress || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Draft</p>
                <p className="font-bold">{remediationProgress?.draft || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Total</p>
                <p className="font-bold">{remediationProgress?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Evidence Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Verified</span>
                <span className="text-sm font-bold">
                  {evidenceMetrics?.verified || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${evidenceMetrics?.verificationRate || 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Rejected</p>
                <p className="font-bold">{evidenceMetrics?.rejected || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Pending</p>
                <p className="font-bold">{evidenceMetrics?.pending || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Total</p>
                <p className="font-bold">{evidenceMetrics?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Performance
          </CardTitle>
          <CardDescription>Top and low performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 text-green-600">Top Performers</h3>
              <div className="space-y-2">
                {teamPerformance?.topPerformers?.map((performer: any) => (
                  <div
                    key={performer.userId}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{performer.name}</span>
                    <span className="font-bold text-green-600">
                      {performer.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-red-600">Needs Support</h3>
              <div className="space-y-2">
                {teamPerformance?.lowPerformers?.map((performer: any) => (
                  <div
                    key={performer.userId}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{performer.name}</span>
                    <span className="font-bold text-red-600">
                      {performer.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span className="font-medium">Team Average</span>
              <span className="text-2xl font-bold">
                {teamPerformance?.averageScore || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Strategic Insights
          </CardTitle>
          <CardDescription>AI-generated recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strategicInsights?.map((insight: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === "critical"
                    ? "bg-red-50 border-red-500"
                    : insight.type === "warning"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-green-50 border-green-500"
                }`}
              >
                <h4 className="font-bold">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
