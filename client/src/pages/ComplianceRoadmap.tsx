// @ts-nocheck
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  TrendingUp,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

export default function ComplianceRoadmap() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState(60);
  const [targetScore, setTargetScore] = useState(85);
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(
    null
  );

  const { data: roadmaps, isLoading: roadmapsLoading } =
    trpc.roadmap.listRoadmaps.useQuery({
      limit: 10,
    });

  const { data: roadmapDetails, isLoading: _detailsLoading } =
    trpc.roadmap.getRoadmap.useQuery(
      { roadmapId: selectedRoadmapId! },
      { enabled: !!selectedRoadmapId }
    );

  const { data: _roadmapStats } = trpc.roadmap.getRoadmapStats.useQuery(
    { roadmapId: selectedRoadmapId! },
    { enabled: !!selectedRoadmapId }
  );

  const generateMutation = trpc.roadmap.generateRoadmap.useMutation();
  const _updateStatusMutation = trpc.roadmap.updateActionStatus.useMutation();
  const exportPDFMutation = trpc.roadmapExport.exportAsPDF.useMutation();
  const { data: csvData } = trpc.roadmapExport.exportAsCSV.useQuery(
    { roadmapId: selectedRoadmapId! },
    { enabled: false }
  );
  const { data: jsonData } = trpc.roadmapExport.exportAsJSON.useQuery(
    { roadmapId: selectedRoadmapId! },
    { enabled: false }
  );

  const handleExportPDF = async () => {
    if (!selectedRoadmapId) return;
    try {
      const result = await exportPDFMutation.mutateAsync({
        roadmapId: selectedRoadmapId,
      });
      // Download PDF
      const blob = new Blob(
        [Uint8Array.from(atob(result.data), c => c.charCodeAt(0))],
        { type: result.mimeType }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedRoadmapId) return;
    const utils = trpc.useUtils();
    const result = await utils.roadmapExport.exportAsCSV.fetch({
      roadmapId: selectedRoadmapId,
    });
    if (result) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportJSON = async () => {
    if (!selectedRoadmapId) return;
    const utils = trpc.useUtils();
    const result = await utils.roadmapExport.exportAsJSON.fetch({
      roadmapId: selectedRoadmapId,
    });
    if (result) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedStrategy) return;

    try {
      const result = await generateMutation.mutateAsync({
        strategy: selectedStrategy as any,
        currentScore,
        targetScore,
        timelineWeeks,
      });

      if (result.success) {
        setSelectedRoadmapId(result.roadmap.id);
        setSelectedStrategy(null);
      }
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "blocked":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance Roadmap</h1>
        <p className="text-gray-600">
          Generate strategic implementation plans to improve compliance
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Roadmap</TabsTrigger>
          <TabsTrigger value="existing">My Roadmaps</TabsTrigger>
        </TabsList>

        {/* Generate Roadmap Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Roadmap</CardTitle>
              <CardDescription>
                Choose a strategy and set your compliance goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strategy Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Strategy
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "risk_first",
                      name: "Risk First",
                      description: "Prioritize critical risks",
                    },
                    {
                      id: "quick_wins",
                      name: "Quick Wins",
                      description: "High impact, low effort",
                    },
                    {
                      id: "balanced",
                      name: "Balanced",
                      description: "Mix of quick wins and risks",
                    },
                    {
                      id: "comprehensive",
                      name: "Comprehensive",
                      description: "All improvements",
                    },
                  ].map(strategy => (
                    <button
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedStrategy === strategy.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h4 className="font-semibold">{strategy.name}</h4>
                      <p className="text-sm text-gray-600">
                        {strategy.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentScore}
                    onChange={e => setCurrentScore(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{currentScore}%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetScore}
                    onChange={e => setTargetScore(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{targetScore}%</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Timeline (weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={timelineWeeks}
                  onChange={e => setTimelineWeeks(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {timelineWeeks} weeks
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateRoadmap}
                disabled={!selectedStrategy || generateMutation.isPending}
                className="w-full"
              >
                {generateMutation.isPending
                  ? "Generating..."
                  : "Generate Roadmap"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Existing Roadmaps Tab */}
        <TabsContent value="existing" className="space-y-6">
          {roadmapsLoading ? (
            <div className="text-center py-8">Loading roadmaps...</div>
          ) : !roadmaps || roadmaps.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">
                  No roadmaps yet. Generate one to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {roadmaps.map(roadmap => (
                <Card
                  key={roadmap.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRoadmapId(roadmap.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{roadmap.title}</CardTitle>
                        <CardDescription>{roadmap.strategy}</CardDescription>
                      </div>
                      <Badge
                        className={
                          roadmap.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : roadmap.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {roadmap.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="font-semibold">
                            {roadmap.progressPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={roadmap.progressPercentage}
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Current</p>
                          <p className="font-semibold">
                            {typeof roadmap.currentScore === "number"
                              ? roadmap.currentScore.toFixed(1)
                              : parseFloat(roadmap.currentScore as any).toFixed(
                                  1
                                )}
                            %
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Projected</p>
                          <p className="font-semibold text-green-600">
                            {typeof roadmap.projectedScore === "number"
                              ? roadmap.projectedScore.toFixed(1)
                              : parseFloat(
                                  roadmap.projectedScore as any
                                ).toFixed(1)}
                            %
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-semibold">
                            {Math.ceil(
                              (new Date(
                                roadmap.targetCompletionDate as any
                              ).getTime() -
                                new Date(roadmap.startDate as any).getTime()) /
                                (7 * 24 * 60 * 60 * 1000)
                            )}{" "}
                            weeks
                          </p>{" "}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Roadmap Details */}
      {selectedRoadmapId && roadmapDetails && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {roadmapDetails.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={exportPDFMutation.isPending}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {exportPDFMutation.isPending ? "Generating..." : "PDF"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportJSON}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Score</p>
                  <p className="text-2xl font-bold">
                    {typeof roadmapDetails.currentScore === "number"
                      ? roadmapDetails.currentScore.toFixed(1)
                      : parseFloat(roadmapDetails.currentScore as any).toFixed(
                          1
                        )}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Projected Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {typeof roadmapDetails.projectedScore === "number"
                      ? roadmapDetails.projectedScore.toFixed(1)
                      : parseFloat(
                          roadmapDetails.projectedScore as any
                        ).toFixed(1)}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Effort</p>
                  <p className="text-2xl font-bold">
                    {roadmapDetails.estimatedEffort}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Est. Impact</p>
                  <p className="text-2xl font-bold text-blue-600">
                    +
                    {roadmapDetails.estimatedImpact
                      ? (typeof roadmapDetails.estimatedImpact === "number"
                          ? (roadmapDetails.estimatedImpact as number).toFixed(1)
                          : parseFloat(String(roadmapDetails.estimatedImpact)).toFixed(1))
                      : "0"}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Implementation Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roadmapDetails.actions.map((action, idx) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                      {idx + 1}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge variant="outline">
                          {action.estimatedEffort}h effort
                        </Badge>
                        <Badge variant="outline">
                          +{typeof action.estimatedImpact === "number"
                            ? (action.estimatedImpact as number).toFixed(1)
                            : parseFloat(String(action.estimatedImpact)).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {action.startDate
                          ? new Date(
                              action.startDate as any
                            ).toLocaleDateString()
                          : "TBD"}{" "}
                        -{" "}
                        {action.targetDate
                          ? new Date(
                              action.targetDate as any
                            ).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(action.status || "pending")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roadmapDetails.milestones.map(milestone => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(
                          milestone.targetDate as any
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {typeof milestone.targetScore === "number"
                          ? (milestone.targetScore as number).toFixed(1)
                          : parseFloat(String(milestone.targetScore)).toFixed(1)}%
                      </p>
                      {milestone.status === "completed" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
