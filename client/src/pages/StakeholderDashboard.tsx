// @ts-nocheck
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Database, FileText, AlertTriangle } from "lucide-react";

export function StakeholderDashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.stakeholderDashboard.getProjectMetrics.useQuery();
  const { data: governance, isLoading: governanceLoading } = trpc.stakeholderDashboard.getGovernanceStatus.useQuery();
  const { data: requirements, isLoading: requirementsLoading } = trpc.stakeholderDashboard.getDeliveryRequirements.useQuery();
  const { data: decisions, isLoading: decisionsLoading } = trpc.stakeholderDashboard.getPendingDecisions.useQuery();
  const { data: risks, isLoading: risksLoading } = trpc.stakeholderDashboard.getRiskAssessment.useQuery();
  const { data: roadmap, isLoading: roadmapLoading } = trpc.stakeholderDashboard.getPhaseRoadmap.useQuery();
  const { data: coverage, isLoading: coverageLoading } = trpc.stakeholderDashboard.getCoverageMetrics.useQuery();

  if (metricsLoading || governanceLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">ISA Stakeholder Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Live tracking of regulatory updates, GS1 mappings, and project progress
        </p>
      </div>

      {/* Executive Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EU Regulations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.regulations || 0}</div>
            <p className="text-xs text-muted-foreground">Tracked with automated CELLAR sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ESRS Datapoints</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.esrsDatapoints || 0}</div>
            <p className="text-xs text-muted-foreground">From EFRAG IG3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GS1 Attributes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.gs1Attributes || 0}</div>
            <p className="text-xs text-muted-foreground">Across DIY, FMCG, Healthcare</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Pass Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.testPassRate || 0}%</div>
            <p className="text-xs text-muted-foreground">517/574 tests passing</p>
          </CardContent>
        </Card>
      </div>

      {/* Governance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Status</CardTitle>
          <CardDescription>Current lane and compliance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Current Lane: {governance?.currentLane}</div>
              <div className="text-sm text-muted-foreground">{governance?.laneDescription}</div>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {governance?.currentLane}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Prohibited Claims</div>
              <div className="text-2xl font-bold text-red-600">{governance?.prohibitedClaims}</div>
              <div className="text-xs text-muted-foreground">Across {governance?.filesNeedingSanitization} files</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Datasets Verified</div>
              <div className="text-2xl font-bold">{governance?.datasetsVerified}/{governance?.totalDatasets}</div>
              <div className="text-xs text-muted-foreground">{governance?.verificationRate}% verification rate</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Scraper Health</div>
              <div className="text-2xl font-bold text-green-600">{metrics?.scraperHealth}%</div>
              <div className="text-xs text-muted-foreground">7/7 sources healthy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="requirements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requirements">Delivery Requirements</TabsTrigger>
          <TabsTrigger value="decisions">Pending Decisions</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="roadmap">Phase Roadmap</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Metrics</TabsTrigger>
        </TabsList>

        {/* Delivery Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          {requirementsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading requirements...</div>
          ) : (
            <div className="grid gap-4">
              {requirements?.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{req.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={req.priority === "High" ? "destructive" : "secondary"}>
                          {req.priority}
                        </Badge>
                        <Badge variant={req.status === "blocked" ? "outline" : "default"}>
                          {req.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{req.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Effort: {req.effort}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Blocker: {req.blocker}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Decisions Tab */}
        <TabsContent value="decisions" className="space-y-4">
          {decisionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading decisions...</div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Immediate Decisions (Block All Further Work)</h3>
                  <div className="grid gap-4">
                    {decisions?.filter(d => d.category === "Immediate").map((decision) => (
                      <Card key={decision.id} className="border-red-200 bg-red-50/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{decision.question}</CardTitle>
                            <Badge variant="destructive">Immediate</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Impact:</span> {decision.impact}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Timeline:</span> {decision.timeline}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Strategic Decisions (Inform Roadmap Priorities)</h3>
                  <div className="grid gap-4">
                    {decisions?.filter(d => d.category === "Strategic").map((decision) => (
                      <Card key={decision.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{decision.question}</CardTitle>
                            <Badge variant="secondary">Strategic</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Impact:</span> {decision.impact}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Timeline:</span> {decision.timeline}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-4">
          {risksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading risks...</div>
          ) : (
            <>
              {["high", "medium"].map((severity) => (
                <div key={severity}>
                  <h3 className="text-lg font-semibold mb-2 capitalize">
                    {severity === "high" ? "🔴 High Risk (Immediate Attention Required)" : "🟡 Medium Risk (Monitor & Plan)"}
                  </h3>
                  <div className="grid gap-4">
                    {risks?.filter(r => r.severity === severity).map((risk) => (
                      <Card key={risk.id} className={severity === "high" ? "border-red-200" : "border-yellow-200"}>
                        <CardHeader>
                          <CardTitle className="text-base">{risk.title}</CardTitle>
                          <CardDescription>{risk.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Impact:</span> {risk.impact}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Mitigation:</span> {risk.mitigation}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Timeline:</span> {risk.timeline}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>

        {/* Phase Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-4">
          {roadmapLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading roadmap...</div>
          ) : (
            <div className="grid gap-6">
              {roadmap?.map((phase) => (
                <Card key={phase.phase}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Phase {phase.phase}: {phase.title}</CardTitle>
                        <CardDescription>{phase.duration} duration</CardDescription>
                      </div>
                      <Badge variant={phase.status === "ready" ? "default" : "outline"}>
                        {phase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {phase.weeks.map((week, idx) => (
                        <div key={idx} className="border-l-2 border-muted pl-4">
                          <div className="font-medium text-sm mb-1">Week {week.week}: {week.title}</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {week.tasks.map((task, taskIdx) => (
                              <li key={taskIdx}>• {task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Coverage Metrics Tab */}
        <TabsContent value="coverage" className="space-y-4">
          {coverageLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading coverage...</div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>ESRS Coverage Analysis</CardTitle>
                  <CardDescription>Current mapping coverage across ESRS standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Environmental (E1-E5)</span>
                      <span className="text-sm font-bold">{coverage?.esrsCoverage.environmental.percentage}%</span>
                    </div>
                    <Progress value={coverage?.esrsCoverage.environmental.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      Standards: {coverage?.esrsCoverage.environmental.standards.join(", ")}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Social (S1-S4)</span>
                      <span className="text-sm font-bold text-red-600">{coverage?.esrsCoverage.social.percentage}%</span>
                    </div>
                    <Progress value={coverage?.esrsCoverage.social.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      Standards: {coverage?.esrsCoverage.social.standards.join(", ")}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Governance (G1)</span>
                      <span className="text-sm font-bold text-red-600">{coverage?.esrsCoverage.governance.percentage}%</span>
                    </div>
                    <Progress value={coverage?.esrsCoverage.governance.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      Standards: {coverage?.esrsCoverage.governance.standards.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GS1 Sector Coverage</CardTitle>
                  <CardDescription>Attributes by sector from Benelux Data Source v3.1.33</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="font-medium">DIY</div>
                      <div className="text-2xl font-bold">{coverage?.gs1Sectors.diy.attributes}</div>
                      <Badge variant="default">{coverage?.gs1Sectors.diy.coverage} Coverage</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">FMCG</div>
                      <div className="text-2xl font-bold">{coverage?.gs1Sectors.fmcg.attributes}</div>
                      <Badge variant="secondary">{coverage?.gs1Sectors.fmcg.coverage} Coverage</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Healthcare</div>
                      <div className="text-2xl font-bold">{coverage?.gs1Sectors.healthcare.attributes}</div>
                      <Badge variant="secondary">{coverage?.gs1Sectors.healthcare.coverage} Coverage</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Critical Gaps</CardTitle>
                  <CardDescription>Missing attributes identified in Advisory v1.1</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {coverage?.criticalGaps.map((gap, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="font-medium">{gap.name}</div>
                            <div className="text-sm text-muted-foreground">{gap.status}</div>
                          </div>
                        </div>
                        <Badge variant={gap.priority === "Critical" ? "destructive" : "secondary"}>
                          {gap.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Timeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Timeline to External Delivery</CardTitle>
          <CardDescription>Based on current blockers and resource availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Minimum (Lane B Only)</div>
              <div className="text-3xl font-bold">3 weeks</div>
              <div className="text-xs text-muted-foreground">Governance transition only</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Recommended</div>
              <div className="text-3xl font-bold text-blue-600">8 weeks</div>
              <div className="text-xs text-muted-foreground">Lane B + critical data gaps</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Full Feature Set</div>
              <div className="text-3xl font-bold">13 weeks</div>
              <div className="text-xs text-muted-foreground">All phases complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
