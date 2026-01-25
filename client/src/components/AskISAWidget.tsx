import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface AskISAWidgetProps {
  regulationId?: string;
  regulationName?: string;
  contextHint?: string;
  className?: string;
}

export function AskISAWidget({ 
  regulationId, 
  regulationName,
  contextHint,
  className = ""
}: AskISAWidgetProps) {
  const [query, setQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [sources, setSources] = useState<any[]>([]);

  const askMutation = trpc.askISA.ask.useMutation({
    onSuccess: (data: any) => {
      setResponse(data.answer);
      setSources(data.sources || []);
      setIsAsking(false);
    },
    onError: (error: any) => {
      setResponse(`Error: ${error.message}`);
      setIsAsking(false);
    }
  });

  const handleAsk = () => {
    if (!query.trim()) return;
    
    setIsAsking(true);
    setResponse("");
    setSources([]);

    // Add context hint if provided
    const contextualQuery = contextHint 
      ? `${query} (Context: ${contextHint})`
      : query;

    askMutation.mutate({ question: contextualQuery });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const suggestedQuestions = regulationName ? [
    `How do I comply with ${regulationName} using GS1 standards?`,
    `Which GS1 attributes are relevant for ${regulationName}?`,
    `What are the key ${regulationName} requirements for supply chain data?`
  ] : [
    "How do I report circular economy metrics using GS1 standards?",
    "Which GS1 attributes help with ESRS E1 climate disclosures?",
    "What GS1 data supports biodiversity reporting?"
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <CardTitle>Ask ISA</CardTitle>
        </div>
        <CardDescription>
          Get instant answers about {regulationName || "regulations"} and GS1 standards mapping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about compliance mapping..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAsking}
          />
          <Button 
            onClick={handleAsk} 
            disabled={isAsking || !query.trim()}
            size="icon"
          >
            {isAsking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggested Questions */}
        {!response && !isAsking && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Try asking:</div>
            <div className="space-y-1">
              {suggestedQuestions.slice(0, 3).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(question)}
                  className="w-full text-left text-xs p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors text-muted-foreground"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAsking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching knowledge base...</span>
          </div>
        )}

        {/* Response */}
        {response && !isAsking && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none bg-slate-50 rounded-lg p-4">
              <Streamdown>{response}</Streamdown>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Sources:</div>
                <div className="space-y-1">
                  {sources.slice(0, 3).map((source, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 text-xs p-2 rounded-md bg-blue-50 border border-blue-200"
                    >
                      <Badge variant="outline" className="text-xs shrink-0">
                        {source.sourceType}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{source.title || source.content?.substring(0, 50)}</div>
                        {source.similarity && (
                          <div className="text-muted-foreground">
                            {Math.round(source.similarity * 100)}% match
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ask Another Question */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setResponse("");
                setSources([]);
              }}
              className="w-full"
            >
              Ask another question
            </Button>
          </div>
        )}

        {/* Link to Full Ask ISA */}
        <div className="pt-4 border-t">
          <a 
            href="/ask" 
            className="flex items-center justify-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span>Open full Ask ISA interface</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
