import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  Circle,
  Rocket,
  Database,
  Scan,
  Map,
  BarChart3,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

/**
 * Getting Started Page
 * Interactive onboarding flow to help users discover ISA features
 */

export default function GettingStarted() {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(1);
  // const [isInitialized, setIsInitialized] = useState(false);

  // Load saved progress
  // TEMPORARILY DISABLED: onboarding router commented out
  // const { data: savedProgress } = trpc.onboarding.getProgress.useQuery(undefined, {
  //   retry: false,
  // });
  // savedProgress disabled - onboarding router commented out

  // Save progress mutation
  // const saveProgressMutation = trpc.onboarding.saveProgress.useMutation();
  const saveProgressMutation = { mutate: (_args: any) => {}, isPending: false };

  // Initialize from saved progress
  // TEMPORARILY DISABLED
  // useEffect(() => {
  //   if (savedProgress && !isInitialized) {
  //     const stepsArray = savedProgress.completedSteps || [];
  //     setCompletedSteps(new Set(stepsArray));
  //     setCurrentStep(savedProgress.currentStep || 1);
  //     setIsInitialized(true);
  //   }
  // }, [savedProgress, isInitialized]);

  // Seed sample data mutations
  const seedEUDRMutation = trpc.epcis.seedEUDRSampleData.useMutation({
    onSuccess: () => {
      markStepComplete(1);
    },
  });

  const seedEPCISMutation = trpc.epcis.seedEPCISSampleEvents.useMutation({
    onSuccess: () => {
      markStepComplete(1);
    },
  });

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev).add(step);
      const newStepsArray = Array.from(newSet);
      const newCurrentStep = step === currentStep ? step + 1 : currentStep;

      // Save to database
      saveProgressMutation.mutate({
        completedSteps: newStepsArray,
        currentStep: newCurrentStep,
      });

      return newSet;
    });
    if (step === currentStep) {
      setCurrentStep(step + 1);
    }
  };

  const isStepComplete = (step: number) => completedSteps.has(step);

  const handleSeedAllData = async () => {
    try {
      await seedEUDRMutation.mutateAsync();
      await seedEPCISMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to seed data:", error);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Load Sample Data",
      description:
        "Populate ISA with sample supply chain data to explore features",
      icon: Database,
      action: handleSeedAllData,
      actionLabel: "Seed Sample Data",
      isLoading: seedEUDRMutation.isPending || seedEPCISMutation.isPending,
      nextLink: null,
    },
    {
      id: 2,
      title: "Try Barcode Scanner",
      description: "Scan a product GTIN to verify traceability status",
      icon: Scan,
      action: () => markStepComplete(2),
      actionLabel: "Open Scanner",
      isLoading: false,
      nextLink: "/tools/scanner",
    },
    {
      id: 3,
      title: "View Supply Chain Map",
      description: "Visualize product journey from origin to destination",
      icon: Map,
      action: () => markStepComplete(3),
      actionLabel: "View Map",
      isLoading: false,
      nextLink: "/epcis/supply-chain",
    },
    {
      id: 4,
      title: "Explore EUDR Compliance",
      description: "Check deforestation risk zones and compliance status",
      icon: BarChart3,
      action: () => markStepComplete(4),
      actionLabel: "View EUDR Map",
      isLoading: false,
      nextLink: "/epcis/eudr-map",
    },
  ];

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Getting Started with ISA</h1>
            <p className="text-muted-foreground mt-1">
              Follow these steps to explore ISA's supply chain compliance
              features
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSteps.size} of {steps.length} steps completed
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Completion Alert */}
      {completedSteps.size === steps.length && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <Sparkles className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            Congratulations! You've completed the getting started guide
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            You're now ready to use ISA for real supply chain compliance
            workflows. Explore the ESG Hub for regulations or upload your own
            EPCIS data.
          </AlertDescription>
        </Alert>
      )}

      {/* Steps */}
      <div className="grid gap-6">
        {steps.map(step => {
          const Icon = step.icon;
          const isComplete = isStepComplete(step.id);
          const isCurrent = currentStep === step.id;

          return (
            <Card
              key={step.id}
              className={`transition-all ${
                isCurrent ? "ring-2 ring-primary shadow-lg" : ""
              } ${isComplete ? "bg-green-50 dark:bg-green-950 border-green-500" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isComplete
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          Step {step.id}: {step.title}
                        </CardTitle>
                        {isComplete && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                        {isCurrent && !isComplete && (
                          <Badge variant="default">
                            <Circle className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {step.nextLink ? (
                    <Link href={step.nextLink}>
                      <Button
                        onClick={step.action}
                        disabled={isComplete}
                        variant={isComplete ? "outline" : "default"}
                      >
                        {isComplete ? "Completed" : step.actionLabel}
                        {!isComplete && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={step.action}
                      disabled={step.isLoading || isComplete}
                      variant={isComplete ? "outline" : "default"}
                    >
                      {step.isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isComplete ? "Completed" : step.actionLabel}
                      {!isComplete && !step.isLoading && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {isComplete && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Step completed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Cards */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Explore More Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ESG Hub</CardTitle>
              <CardDescription>
                Explore EU sustainability regulations (CSRD, EUDR, DPP, ESRS)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/hub">
                <Button variant="outline" className="w-full">
                  Explore Regulations
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>EPCIS Upload</CardTitle>
              <CardDescription>
                Upload your own supply chain traceability data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/epcis/upload">
                <Button variant="outline" className="w-full">
                  Upload Events
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Manage sample data and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/eudr-seeder">
                <Button variant="outline" className="w-full">
                  Open Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
