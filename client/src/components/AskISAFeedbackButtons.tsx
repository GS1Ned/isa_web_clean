import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface AskISAFeedbackButtonsProps {
  questionId: string;
  questionText: string;
  answerText: string;
  promptVariant?: string;
  confidenceScore?: number;
  sourcesCount?: number;
}

export function AskISAFeedbackButtons({
  questionId,
  questionText,
  answerText,
  promptVariant = "v2_modular",
  confidenceScore,
  sourcesCount,
}: AskISAFeedbackButtonsProps) {
  const { user } = useAuth();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const submitFeedback = trpc.askISA.submitFeedback.useMutation({
    onSuccess: () => {
      setFeedbackSubmitted(true);
      toast.success("Thank you for your feedback!");
    },
    onError: (error: any) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  const handleFeedback = async (type: "positive" | "negative") => {
    if (!user) {
      toast.error("Please log in to provide feedback");
      return;
    }

    if (feedbackSubmitted) {
      toast.info("You've already provided feedback for this answer");
      return;
    }

    await submitFeedback.mutateAsync({
      questionId,
      questionText,
      answerText,
      feedbackType: type,
      promptVariant,
      confidenceScore,
      sourcesCount,
    });
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <Button
        variant={feedbackSubmitted ? "ghost" : "outline"}
        size="sm"
        onClick={() => handleFeedback("positive")}
        disabled={submitFeedback.isPending || feedbackSubmitted}
        className="gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant={feedbackSubmitted ? "ghost" : "outline"}
        size="sm"
        onClick={() => handleFeedback("negative")}
        disabled={submitFeedback.isPending || feedbackSubmitted}
        className="gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      {feedbackSubmitted && (
        <span className="text-sm text-muted-foreground ml-2">
          Thanks for your feedback!
        </span>
      )}
    </div>
  );
}
