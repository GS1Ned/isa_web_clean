/**
 * Pipeline Status Banner
 * Shows last news pipeline run information
 */

import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export function PipelineStatusBanner() {
  const { data: lastRun, isLoading } = trpc.hub.getLastPipelineRun.useQuery();

  if (isLoading) {
    return (
      <Alert className="bg-muted/50 border-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription className="ml-2">
          Loading pipeline status...
        </AlertDescription>
      </Alert>
    );
  }

  if (!lastRun) {
    return null;
  }

  const isSuccess = lastRun.status === "SUCCESS" || lastRun.status === "COMPLETED";
  const isRunning = lastRun.status === "RUNNING" || lastRun.status === "IN_PROGRESS";
  const isFailed = lastRun.status === "FAILED" || lastRun.status === "ERROR";

  const getIcon = () => {
    if (isRunning) return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (isFailed) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  };

  const getVariant = () => {
    if (isFailed) return "destructive";
    return "default";
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Alert variant={getVariant()} className="bg-card">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-1">
          <AlertDescription className="font-medium">
            {isRunning && "News pipeline is currently running..."}
            {isSuccess && "News feed updated successfully"}
            {isFailed && "Last pipeline run encountered errors"}
          </AlertDescription>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last run: {format(new Date(lastRun.startedAt), "d MMM yyyy 'at' HH:mm")}
              {" "}
              ({formatDistanceToNow(new Date(lastRun.startedAt), { addSuffix: true })})
            </span>
            {lastRun.durationMs && (
              <span>Duration: {formatDuration(lastRun.durationMs)}</span>
            )}
            {isSuccess && (
              <>
                <span>Fetched: {lastRun.itemsFetched}</span>
                <span>Processed: {lastRun.itemsProcessed}</span>
                <span>Saved: {lastRun.itemsSaved}</span>
              </>
            )}
            {isFailed && lastRun.errorCount && (
              <span className="text-destructive">Errors: {lastRun.errorCount}</span>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}
