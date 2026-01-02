import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface FeedbackButtonsProps {
  mappingId: number;
}

export function FeedbackButtons({ mappingId }: FeedbackButtonsProps) {
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's existing feedback
  const { data: userFeedback } =
    trpc.regulations.getUserMappingFeedback.useQuery(
      { mappingId },
      { enabled: !!user }
    );

  // Get aggregated stats
  const { data: stats } = trpc.regulations.getMappingFeedbackStats.useQuery({
    mappingId,
  });

  // Submit feedback mutation
  const submitFeedback = trpc.regulations.submitMappingFeedback.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted! Thank you for helping improve ISA!");
      // Refetch both queries
      trpc
        .useUtils()
        .regulations.getUserMappingFeedback.invalidate({ mappingId });
      trpc
        .useUtils()
        .regulations.getMappingFeedbackStats.invalidate({ mappingId });
    },
    onError: error => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  const handleVote = async (vote: boolean) => {
    if (!user) {
      toast.error("Please log in to provide feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback.mutateAsync({ mappingId, vote });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userVote = userFeedback?.vote;
  const totalVotes = stats?.totalVotes || 0;
  const positivePercentage = stats?.positivePercentage || 0;

  return (
    <div className="flex items-center gap-2">
      {/* Thumbs Up Button */}
      <Button
        variant={userVote === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote(true)}
        disabled={isSubmitting || !user}
        className="gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        {userVote === 1 && <span className="text-xs">Voted</span>}
      </Button>

      {/* Thumbs Down Button */}
      <Button
        variant={userVote === 0 ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote(false)}
        disabled={isSubmitting || !user}
        className="gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
        {userVote === 0 && <span className="text-xs">Voted</span>}
      </Button>

      {/* Stats Display */}
      {totalVotes > 0 && (
        <div className="text-sm text-muted-foreground ml-2">
          <span className="font-medium">{positivePercentage}%</span> helpful
          <span className="text-xs ml-1">
            ({totalVotes} vote{totalVotes !== 1 ? "s" : ""})
          </span>
        </div>
      )}
    </div>
  );
}
