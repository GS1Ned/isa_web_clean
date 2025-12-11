import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  Loader2,
  ExternalLink,
  MessageSquare,
  BookOpen,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Streamdown } from "streamdown";

/**
 * Ask ISA - RAG-Powered Q&A Interface
 *
 * Natural language interface for querying EU regulations and GS1 standards.
 * Uses semantic search and AI to provide accurate answers with source citations.
 */

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    id: number;
    type: string;
    title: string;
    url?: string | null;
    similarity: number;
  }>;
}

const SUGGESTED_QUESTIONS = [
  "What GS1 codes are required for EUDR compliance?",
  "How does CSRD relate to GS1 Digital Link?",
  "Which ESRS datapoints cover supply chain traceability?",
  "What are the key requirements of the Digital Product Passport?",
  "How can EPCIS help with EUDR deforestation tracking?",
  "What Dutch initiatives support textile circularity?",
];

export default function AskISA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const askMutation = trpc.askISA.ask.useMutation({
    onSuccess: data => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    },
    onError: error => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || askMutation.isPending) {
      return;
    }

    const question = input.trim();
    setInput("");

    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: question }]);

    // Send to API
    askMutation.mutate({
      question,
      conversationId,
    });
  };

  const handleSuggestedQuestion = (question: string) => {
    if (askMutation.isPending) {
      return;
    }

    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: question }]);

    // Send to API
    askMutation.mutate({
      question,
      conversationId,
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "regulation":
        return <FileText className="h-4 w-4" />;
      case "standard":
        return <BookOpen className="h-4 w-4" />;
      case "esrs_datapoint":
        return <FileText className="h-4 w-4" />;
      case "dutch_initiative":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case "regulation":
        return "EU Regulation";
      case "standard":
        return "GS1 Standard";
      case "esrs_datapoint":
        return "ESRS Datapoint";
      case "dutch_initiative":
        return "Dutch Initiative";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Ask ISA</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered assistant for EU regulations and GS1 standards
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Natural Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Ask questions in plain English about regulations and standards
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Source Citations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Every answer includes links to official regulations and
                standards
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Semantic Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                AI understands context and finds relevant information across 35+
                regulations
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Ask me anything about ESG compliance
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                I can help you understand EU regulations (CSRD, EUDR, DPP), GS1
                standards, ESRS datapoints, and Dutch compliance initiatives.
              </p>

              {/* Suggested Questions */}
              <div className="w-full max-w-2xl">
                <p className="text-sm font-medium mb-3">Try asking:</p>
                <div className="grid gap-2">
                  {SUGGESTED_QUESTIONS.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div key={idx} className="space-y-2">
                  {/* Message */}
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Sources:
                      </p>
                      <div className="grid gap-2">
                        {message.sources.map((source, sourceIdx) => (
                          <Card
                            key={sourceIdx}
                            className="hover:bg-accent transition-colors"
                          >
                            <CardHeader className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  <div className="mt-0.5">
                                    {getSourceIcon(source.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-sm line-clamp-1">
                                      {source.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {getSourceTypeLabel(source.type)}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {source.similarity}% match
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                {source.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    asChild
                                  >
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {askMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about regulations, standards, or compliance requirements..."
              disabled={askMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || askMutation.isPending}
            >
              {askMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by semantic search across 35 regulations, 60 GS1 standards,
            1,184 ESRS datapoints, and 10 Dutch initiatives
          </p>
        </div>
      </Card>
    </div>
  );
}
