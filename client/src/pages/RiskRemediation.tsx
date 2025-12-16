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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  FileUp,
  Plus,

} from "lucide-react";

export default function RiskRemediation() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

  // Fetch user's remediation plans
  const { data: plans, isLoading: plansLoading } =
    trpc.remediation.listPlans.useQuery({
      limit: 20,
      offset: 0,
    });

  // Fetch selected plan details
  const { data: planDetails, isLoading: planLoading } =
    trpc.remediation.getPlan.useQuery(
      { planId: selectedPlanId! },
      { enabled: !!selectedPlanId }
    );

  // Fetch evidence for selected step
  const { data: evidence } = trpc.remediation.getStepEvidence.useQuery(
    { stepId: selectedStepId! },
    { enabled: !!selectedStepId }
  );

  // Mutations
  const createPlanMutation = trpc.remediation.createPlan.useMutation();
  const updateStepMutation = trpc.remediation.updateStepStatus.useMutation();
  const completePlanMutation = trpc.remediation.completePlan.useMutation();

  const _handleCreatePlan = async (riskId: number) => {
    try {
      const result = await createPlanMutation.mutateAsync({
        riskId,
        title: `Remediation Plan for Risk #${riskId}`,
        description: "Systematic approach to address compliance risk",
        targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      setSelectedPlanId(result.planId);
    } catch (error) {
      console.error("Failed to create plan:", error);
    }
  };

  const _handleCompleteStep = async (stepId: number) => {
    try {
      await updateStepMutation.mutateAsync({
        stepId,
        status: "completed",
      });
    } catch (error) {
      console.error("Failed to update step:", error);
    }
  };

  const handleCompletePlan = async () => {
    if (!selectedPlanId) return;
    try {
      await completePlanMutation.mutateAsync({ planId: selectedPlanId });
      setSelectedPlanId(null);
    } catch (error) {
      console.error("Failed to complete plan:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "draft":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Remediation</h1>
        <p className="text-gray-600">
          Manage compliance risks with guided remediation workflows
        </p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Active Plans</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        {/* Active Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          {plansLoading ? (
            <div className="text-center py-8">Loading plans...</div>
          ) : !plans || plans.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">No remediation plans yet</p>
                <p className="text-sm text-gray-500">
                  Create a plan from the risk management dashboard
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plans.map(plan => (
                <Card
                  key={plan.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(plan.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {plan.title}
                          </CardTitle>
                          <CardDescription>
                            Created{" "}
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          {!selectedPlanId ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Select a plan to view workflow</p>
              </CardContent>
            </Card>
          ) : planLoading ? (
            <div className="text-center py-8">Loading workflow...</div>
          ) : planDetails ? (
            <div className="space-y-4">
              {/* Plan Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{planDetails.title}</CardTitle>
                      <CardDescription>
                        {planDetails.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(planDetails.status)}>
                      {planDetails.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {planDetails.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {planDetails.progress.progressPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={planDetails.progress.progressPercentage}
                        className="h-2"
                      />
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-600">Steps Completed</p>
                          <p className="text-lg font-semibold">
                            {planDetails.progress.completedSteps}/
                            {planDetails.progress.totalSteps}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Evidence Submitted</p>
                          <p className="text-lg font-semibold">
                            {planDetails.progress.evidenceSubmitted}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Evidence Verified</p>
                          <p className="text-lg font-semibold">
                            {planDetails.progress.evidenceVerified}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Remediation Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {planDetails.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedStepId(step.id)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                          {idx + 1}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold">{step.title}</h4>
                          <p className="text-sm text-gray-600">
                            {step.description}
                          </p>
                          {step.dueDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(step.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <Badge className={getStatusColor(step.status)}>
                            {step.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Complete Plan Button */}
              {planDetails.status !== "completed" && (
                <Button
                  onClick={handleCompletePlan}
                  className="w-full"
                  disabled={planDetails.progress?.progressPercentage !== 100}
                >
                  Complete Remediation Plan
                </Button>
              )}
            </div>
          ) : null}
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          {!selectedStepId ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Select a step to view evidence</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Evidence List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileUp className="w-5 h-5" />
                    Compliance Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!evidence || evidence.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        No evidence uploaded yet
                      </p>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Evidence
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {evidence.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-gray-600">
                              {item.evidenceType}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded by: {item.uploadedBy}
                            </p>
                          </div>
                          <Badge
                            className={
                              item.verificationStatus === "verified"
                                ? "bg-green-100 text-green-800"
                                : item.verificationStatus === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {item.verificationStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload Evidence Button */}
              <Button className="w-full">
                <FileUp className="w-4 h-4 mr-2" />
                Upload New Evidence
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
