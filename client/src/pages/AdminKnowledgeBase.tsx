import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Database,
  FileText,
  BookOpen,
  Lightbulb,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/**
 * Admin Knowledge Base Manager
 *
 * Manage vector embeddings for Ask ISA RAG system.
 * Generate embeddings for regulations, standards, ESRS datapoints, and Dutch initiatives.
 */

interface SourceTypeConfig {
  type: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative";
  label: string;
  icon: typeof FileText;
  description: string;
  estimatedCount: number;
  estimatedTime: string;
}

const SOURCE_TYPES: SourceTypeConfig[] = [
  {
    type: "regulation",
    label: "EU Regulations",
    icon: FileText,
    description: "CSRD, EUDR, DPP, and other EU sustainability regulations",
    estimatedCount: 35,
    estimatedTime: "~2 minutes",
  },
  {
    type: "standard",
    label: "GS1 Standards",
    icon: BookOpen,
    description: "GTIN, GLN, Digital Link, EPCIS, and other GS1 standards",
    estimatedCount: 60,
    estimatedTime: "~3 minutes",
  },
  {
    type: "esrs_datapoint",
    label: "ESRS Datapoints",
    icon: FileText,
    description: "EFRAG disclosure requirements from ESRS standards",
    estimatedCount: 1184,
    estimatedTime: "~15 minutes",
  },
  {
    type: "dutch_initiative",
    label: "Dutch Initiatives",
    icon: Lightbulb,
    description:
      "National compliance programs (UPV Textiel, Green Deal Zorg, etc.)",
    estimatedCount: 10,
    estimatedTime: "~30 seconds",
  },
];

export default function AdminKnowledgeBase() {
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Fetch embedding statistics
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.askISA.getEmbeddingStats.useQuery();

  // Generate embeddings mutation
  const generateMutation = trpc.askISA.generateEmbeddings.useMutation({
    onSuccess: () => {
      setGeneratingType(null);
      refetchStats();
    },
    onError: error => {
      console.error("Failed to generate embeddings:", error);
      setGeneratingType(null);
    },
  });

  const handleGenerate = (sourceType: SourceTypeConfig["type"]) => {
    if (generatingType) return;

    setGeneratingType(sourceType);
    generateMutation.mutate({
      sourceType,
    });
  };

  const getStatsForType = (type: string) => {
    return stats?.find(s => s.sourceType === type)?.count || 0;
  };

  const getSourceIcon = (Icon: typeof FileText) => {
    return <Icon className="h-5 w-5" />;
  };

  const totalEmbeddings =
    stats?.reduce((sum, s) => sum + (s.count || 0), 0) || 0;

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Knowledge Base Manager</h1>
            <p className="text-muted-foreground mt-1">
              Generate vector embeddings for Ask ISA semantic search
            </p>
          </div>
        </div>

        {/* Overall Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Embedding Statistics
            </CardTitle>
            <CardDescription>
              Vector embeddings enable semantic search across regulations and
              standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Embeddings
                </p>
                <p className="text-3xl font-bold">
                  {statsLoading ? "..." : totalEmbeddings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coverage</p>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(totalEmbeddings / 1289) * 100}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">
                    {Math.round((totalEmbeddings / 1289) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalEmbeddings} / 1,289 total sources
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => refetchStats()}
              disabled={statsLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`}
              />
              Refresh Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generation Status */}
      {generateMutation.isPending && (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Generating Embeddings...</AlertTitle>
          <AlertDescription>
            Processing {generatingType}. This may take several minutes depending
            on the source type. Do not close this page.
          </AlertDescription>
        </Alert>
      )}

      {generateMutation.isSuccess && generateMutation.data && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            Generation Complete!
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            Processed {generateMutation.data.processed} sources:{" "}
            {generateMutation.data.successCount} succeeded,{" "}
            {generateMutation.data.errorCount} failed.
          </AlertDescription>
        </Alert>
      )}

      {generateMutation.isError && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900 dark:text-red-100">
            Generation Failed
          </AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-200">
            {generateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Source Type Cards */}
      <div className="grid gap-6">
        {SOURCE_TYPES.map(sourceType => {
          const Icon = sourceType.icon;
          const currentCount = getStatsForType(sourceType.type);
          const isGenerating = generatingType === sourceType.type;
          const isComplete = currentCount >= sourceType.estimatedCount;
          const progress = Math.min(
            (currentCount / sourceType.estimatedCount) * 100,
            100
          );

          return (
            <Card
              key={sourceType.type}
              className={isGenerating ? "ring-2 ring-primary" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isComplete
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-secondary"
                      }`}
                    >
                      {getSourceIcon(Icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{sourceType.label}</CardTitle>
                        {isComplete && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {sourceType.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {currentCount} / {sourceType.estimatedCount} embeddings
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleGenerate(sourceType.type)}
                      disabled={isGenerating || generateMutation.isPending}
                      variant={isComplete ? "outline" : "default"}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : isComplete ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Embeddings
                        </>
                      )}
                    </Button>

                    <span className="text-xs text-muted-foreground">
                      Est. time: {sourceType.estimatedTime}
                    </span>
                  </div>

                  {/* Warning for large datasets */}
                  {sourceType.type === "esrs_datapoint" && !isComplete && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Note:</strong> ESRS datapoints will take ~15
                        minutes to process all 1,184 items. Consider running
                        this during off-peak hours.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Box */}
      <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Vector embeddings convert text into numerical representations that
            capture semantic meaning. This enables Ask ISA to understand
            questions and find relevant information even when exact keywords
            don't match.
          </p>
          <p>
            <strong>Generation process:</strong> Each source (regulation,
            standard, etc.) is converted into a 1536-dimensional vector using
            OpenAI's text-embedding-3-small model via Manus Forge API.
          </p>
          <p>
            <strong>When to regenerate:</strong> Run generation again when
            content is updated or new regulations/standards are added to the
            database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
