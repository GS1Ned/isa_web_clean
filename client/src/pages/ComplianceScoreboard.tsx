// @ts-nocheck
import React, {  } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,

  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ComplianceScoreboard() {
  const { data: score, isLoading: scoreLoading } =
    trpc.scoring.getScore.useQuery();
  const { data: metrics } = trpc.scoring.getMetrics.useQuery();
  const { data: milestones } = trpc.scoring.getMilestones.useQuery();
  const { data: history } = trpc.scoring.getScoreHistory.useQuery({ days: 30 });

  const recalculateMutation = trpc.scoring.recalculateScore.useMutation();

  const handleRecalculate = async () => {
    try {
      await recalculateMutation.mutateAsync({ reason: "user_requested" });
    } catch (error) {
      console.error("Failed to recalculate score:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-blue-50 border-blue-200";
    if (score >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance Scoreboard</h1>
        <p className="text-gray-600">
          Track your real-time compliance metrics and achievements
        </p>
      </div>

      {scoreLoading ? (
        <div className="text-center py-12">Loading compliance score...</div>
      ) : !score ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No compliance data available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Score Card */}
          <Card className={`border-2 ${getScoreBgColor(score.overallScore)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Overall Compliance Score
                  </CardTitle>
                  <CardDescription>
                    Your comprehensive compliance rating
                  </CardDescription>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={`text-5xl font-bold ${getScoreColor(score.overallScore)}`}
                >
                  {score.overallScore.toFixed(1)}
                </div>
                <div className="flex-1">
                  <Progress value={score.overallScore} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">Target: 100%</p>
                </div>
              </div>
              <Button
                onClick={handleRecalculate}
                variant="outline"
                className="w-full"
              >
                Recalculate Score
              </Button>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Risk Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {score.riskManagementScore.toFixed(1)}
                </div>
                <Progress
                  value={score.riskManagementScore}
                  className="h-2 mb-2"
                />
                <p className="text-xs text-gray-600">
                  {score.resolvedRisks}/{score.totalRisks} risks resolved
                </p>
              </CardContent>
            </Card>

            {/* Remediation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Remediation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {score.remediationScore.toFixed(1)}
                </div>
                <Progress value={score.remediationScore} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">
                  {score.completedPlans}/{score.totalRemediationPlans} plans
                  completed
                </p>
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {score.evidenceScore.toFixed(1)}
                </div>
                <Progress value={score.evidenceScore} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">
                  {score.verifiedEvidence}/{score.totalEvidence} verified
                </p>
              </CardContent>
            </Card>

            {/* Regulations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Regulations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {score.regulationScore.toFixed(1)}
                </div>
                <Progress value={score.regulationScore} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">
                  {score.regulationsCovered} covered
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
              <TabsTrigger value="milestones">Achievements</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
            </TabsList>

            {/* Detailed Metrics */}
            <TabsContent value="metrics" className="space-y-4">
              {metrics ? (
                <div className="grid gap-4">
                  {/* Risk Management Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Risk Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Resolution Rate</span>
                          <span className="font-semibold">
                            {metrics.resolutionRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={metrics.resolutionRate}
                          className="h-2"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {metrics.resolvedRisks} of {metrics.totalRisks} risks
                        resolved
                      </div>
                    </CardContent>
                  </Card>

                  {/* Remediation Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Remediation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Plan Completion Rate</span>
                          <span className="font-semibold">
                            {metrics.completionRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={metrics.completionRate}
                          className="h-2"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {metrics.completedPlans} of{" "}
                        {metrics.totalRemediationPlans} plans completed
                      </div>
                    </CardContent>
                  </Card>

                  {/* Evidence Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Evidence Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Verification Rate</span>
                          <span className="font-semibold">
                            {metrics.verificationRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={metrics.verificationRate}
                          className="h-2"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {metrics.verifiedEvidence} of {metrics.totalEvidence}{" "}
                        evidence verified
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  Loading metrics...
                </div>
              )}
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="milestones" className="space-y-4">
              {milestones && milestones.length > 0 ? (
                <div className="grid gap-3">
                  {milestones.map(milestone => (
                    <Card key={milestone.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{milestone.badge}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {milestone.milestoneTitle}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {milestone.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Achieved{" "}
                              {new Date(
                                milestone.achievedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Unlocked
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-600">
                      No achievements yet. Keep improving your compliance!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Trend */}
            <TabsContent value="trend" className="space-y-4">
              {history && history.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>30-Day Score Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {history.slice(-7).map((entry, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                            <span className="font-semibold">
                              {entry.overallScore.toFixed(1)}
                            </span>
                          </div>
                          <Progress
                            value={entry.overallScore}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-600">No trend data available yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
