import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
  History,
  Plus,
  Trash2,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Library, AlertTriangle, Info } from "lucide-react";
import { AuthorityBadge, AuthorityScore, AuthorityLegend } from "@/components/AuthorityBadge";

/**
 * Ask ISA - RAG-Powered Q&A Interface
 *
 * Natural language interface for querying EU regulations and GS1 standards.
 * Uses semantic search and AI to provide accurate answers with source citations.
 */

type AuthorityLevel = 'official' | 'verified' | 'guidance' | 'industry' | 'community';

interface ClarificationSuggestion {
  type: string;
  message: string;
  suggestions: string[];
  confidence: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    id: number;
    type?: string;
    title: string;
    url?: string | null;
    similarity: number;
    datasetId?: string;
    datasetVersion?: string;
    lastVerifiedDate?: string;
    isDeprecated?: boolean;
    needsVerification?: boolean;
    deprecationReason?: string;
    authorityLevel?: AuthorityLevel;
    authorityScore?: number;
  }>;
  queryType?: string;
  confidence?: {
    level: "high" | "medium" | "low";
    score: number;
  };
  citationValid?: boolean;
  missingCitations?: string[];
  // New fields for authority and clarification
  authority?: {
    score: number;
    level: AuthorityLevel;
    breakdown?: Record<AuthorityLevel, number>;
  };
  needsClarification?: boolean;
  clarifications?: ClarificationSuggestion[];
  relatedTopics?: string[];
  responseMode?: {
    mode: 'full' | 'partial' | 'insufficient';
    reason: string;
    recommendations: string[];
  };
  claimVerification?: {
    verificationRate: number;
    totalClaims: number;
    verifiedClaims: number;
    unverifiedClaims: number;
    warnings: string[];
  };
}

// Query library organized by category (30 pre-approved questions from ASK_ISA_QUERY_LIBRARY.md)
const QUERY_LIBRARY = {
  gap: [
    "Which gaps exist for CSRD and ESRS in DIY?",
    "Which gaps exist for EUDR in FMCG?",
    "What is the status of Gap #1 (Product Carbon Footprint) in healthcare?",
    "Which critical gaps remain MISSING across all sectors in ISA v1.1?",
    "Which gaps are PARTIAL in DIY and what evidence supports the PARTIAL classification?",
  ],
  mapping: [
    "Which GS1 Netherlands attributes cover ESRS E1 (Climate change) datapoints for DIY and where are the gaps?",
    "Which GS1 Netherlands attributes partially cover ESRS E1-6 (Gross Scopes 1, 2 and 3 emissions) for FMCG?",
    "Which healthcare attributes map to deforestation due diligence requirements relevant to EUDR?",
    "Which GS1 Netherlands attributes are referenced by the Digital Product Passport gap analysis for DIY?",
    "Which mappings exist for supplier due diligence and which are missing for FMCG?",
  ],
  version: [
    "What changed between ISA v1.0 and v1.1 for Gap #1 (Product Carbon Footprint)?",
    "Which gaps were upgraded from MISSING to PARTIAL in v1.1 and why?",
    "What new dataset entries were introduced in dataset registry v1.3.0 to support v1.1?",
    "What changed between v1.0 and v1.1 in recommendations for FMCG regarding Product Carbon Footprint?",
    "What changed between v1.0 and v1.1 in overall mapping coverage for DIY?",
  ],
  provenance: [
    "Which datasets underpin the Product Carbon Footprint recommendations for DIY?",
    "What is the authoritative source of ESRS E1 datapoint definitions used in the advisory?",
    "Which GS1 Netherlands sector model version is used for healthcare analysis?",
    "Which datasets underpin Gap #5 (Circularity data) assessment in FMCG?",
    "Which datasets are referenced by the Digital Product Passport gap and recommendations for healthcare?",
  ],
  recommendation: [
    "What are the short-term recommendations for DIY for 2025–2026?",
    "What are the short-term recommendations for FMCG to address Product Carbon Footprint?",
    "Which recommendations require adoption or alignment with GS1 in Europe publications for healthcare?",
    "What are the medium-term recommendations for healthcare to address supplier due diligence?",
    "What are the long-term recommendations for FMCG to close Circularity data gaps?",
  ],
  coverage: [
    "What is the coverage percentage for ESRS E1 (Climate change) in DIY and which topics drive the missing coverage?",
    "What is the coverage percentage for EUDR-related requirements in FMCG?",
    "Which ESRS topic has the highest coverage in healthcare in ISA v1.1?",
    "What percentage of Digital Product Passport identification requirements are covered in DIY?",
    "What is the coverage percentage for supplier due diligence in healthcare?",
  ],
};

const SUGGESTED_QUESTIONS = [
  ...QUERY_LIBRARY.gap.slice(0, 2),
  ...QUERY_LIBRARY.mapping.slice(0, 1),
  ...QUERY_LIBRARY.recommendation.slice(0, 2),
  ...QUERY_LIBRARY.coverage.slice(0, 1),
];

// Authority filter options
const AUTHORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'official', label: 'Official Only' },
  { value: 'verified', label: 'Verified & Above' },
  { value: 'guidance', label: 'Guidance & Above' },
] as const;

type AuthorityFilter = typeof AUTHORITY_FILTER_OPTIONS[number]['value'];

export default function AskISA() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [advisoryVersion, setAdvisoryVersion] = useState("v1.0");
  const [showHistory, setShowHistory] = useState(false);
  const [authorityFilter, setAuthorityFilter] = useState<AuthorityFilter>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter sources based on authority level
  const filterSourcesByAuthority = (sources: Message['sources']) => {
    if (!sources || authorityFilter === 'all') return sources;
    
    const authorityOrder: AuthorityLevel[] = ['official', 'verified', 'guidance', 'industry', 'community'];
    const filterIndex = authorityOrder.indexOf(
      authorityFilter === 'verified' ? 'verified' : 
      authorityFilter === 'guidance' ? 'guidance' : 'official'
    );
    
    return sources.filter(source => {
      const sourceLevel = source.authorityLevel || 'community';
      const sourceIndex = authorityOrder.indexOf(sourceLevel);
      return sourceIndex <= filterIndex;
    });
  };

  // Fetch conversation history (only for authenticated users)
  const conversationsQuery = trpc.askISA.getMyConversations.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  const deleteConversationMutation = trpc.askISA.deleteConversation.useMutation({
    onSuccess: () => {
      conversationsQuery.refetch();
    },
  });

  const askMutation = trpc.askISA.ask.useMutation({
    onSuccess: data => {
      // Handle clarification request
      if (data.needsClarification && data.clarifications) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: '',
            needsClarification: true,
            clarifications: data.clarifications,
            relatedTopics: data.relatedTopics,
            confidence: data.confidence,
          },
        ]);
        return;
      }
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          queryType: data.queryType,
          confidence: data.confidence,
          citationValid: data.citationValid,
          missingCitations: data.missingCitations,
          // New fields
          authority: data.authority,
          responseMode: data.responseMode,
          claimVerification: data.claimVerification,
          relatedTopics: data.queryAnalysis?.relatedTopics,
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

  const getSourceIcon = (type?: string) => {
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

  const getSourceTypeLabel = (type?: string) => {
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

  const getConfidenceBadge = (confidence?: { level: "high" | "medium" | "low"; score: number }) => {
    if (!confidence) return null;

    const colors = {
      high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <Badge className={colors[confidence.level]}>
        {confidence.level.toUpperCase()} Confidence ({confidence.score} sources)
      </Badge>
    );
  };

  const getQueryTypeBadge = (queryType?: string) => {
    if (!queryType) return null;

    const labels: Record<string, string> = {
      gap: "Gap Analysis",
      mapping: "Mapping Query",
      version: "Version Comparison",
      provenance: "Dataset Provenance",
      recommendation: "Recommendation",
      coverage: "Coverage Analysis",
      general_esg: "General ESG (Not Allowed)",
      hypothetical: "Hypothetical (Not Allowed)",
      speculative: "Speculative (Not Allowed)",
      calculation: "Calculation (Not Allowed)",
      conversational: "Conversational (Not Allowed)",
    };

    return (
      <Badge variant="outline" className="text-xs">
        {labels[queryType] || queryType}
      </Badge>
    );
  };

  const parseRefusalMessage = (content: string) => {
    const parts = content.split("\n\n");
    return {
      reason: parts[0] || content,
      suggestion: parts[1] || null,
    };
  };

  const isRefusalMessage = (message: Message) => {
    return (
      message.role === "assistant" &&
      message.content.startsWith("ISA cannot answer this question")
    );
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  const handleLoadConversation = async (convId: number) => {
    try {
      const utils = trpc.useUtils();
      const conversation = await utils.askISA.getConversation.fetch({ conversationId: convId });
      if (conversation) {
        setConversationId(convId);
        // Convert conversation messages to Message format
        const loadedMessages: Message[] = conversation.messages.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          sources: msg.sources || [],
        }));
        setMessages(loadedMessages);
        setShowHistory(false);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleDeleteConversation = async (convId: number) => {
    if (confirm("Delete this conversation?")) {
      await deleteConversationMutation.mutateAsync({ conversationId: convId });
      if (conversationId === convId) {
        handleNewConversation();
      }
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
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
          
          {/* Action Buttons and Advisory Version Selector */}
          <div className="flex items-center gap-3">
            {/* New Conversation Button */}
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            )}

            {/* History Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>

            {/* Advisory Version Selector */}
            <div className="flex flex-col items-end gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Advisory Version
              </label>
              <Select value={advisoryVersion} onValueChange={setAdvisoryVersion}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1.0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>ISA v1.0 (Locked)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="v1.1" disabled>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">ISA v1.1 (Coming Soon)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Querying locked advisory from 2024-11-07
              </p>
            </div>
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

      {/* Main Layout with Optional History Sidebar */}
      <div className="flex gap-4">
        {/* Conversation History Sidebar */}
        {showHistory && user && (
          <Card className="w-80 h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversation History</CardTitle>
              <CardDescription className="text-xs">
                {conversationsQuery.data?.length || 0} conversations
              </CardDescription>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1 p-4">
              {conversationsQuery.isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversationsQuery.data && conversationsQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {conversationsQuery.data.map((conv: any) => (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer hover:bg-accent transition-colors ${
                        conversationId === conv.id ? "border-primary" : ""
                      }`}
                      onClick={() => handleLoadConversation(conv.id)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm line-clamp-2">
                              {conv.title || "Untitled Conversation"}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {new Date(conv.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <History className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No conversation history yet
                  </p>
                </div>
              )}
            </ScrollArea>
          </Card>
        )}

        {/* Chat Interface */}
        <Card className={`h-[600px] flex flex-col ${
          showHistory && user ? "flex-1" : "w-full"
        }`}>
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

              {/* Query Library */}
              <div className="w-full max-w-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <Library className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Query Library</h3>
                  <Badge variant="secondary" className="ml-2">30 pre-approved questions</Badge>
                </div>
                
                <Tabs defaultValue="suggested" className="w-full">
                  <TabsList className="grid w-full grid-cols-7 mb-4">
                    <TabsTrigger value="suggested">Suggested</TabsTrigger>
                    <TabsTrigger value="gap">Gap</TabsTrigger>
                    <TabsTrigger value="mapping">Mapping</TabsTrigger>
                    <TabsTrigger value="version">Version</TabsTrigger>
                    <TabsTrigger value="provenance">Provenance</TabsTrigger>
                    <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                    <TabsTrigger value="coverage">Coverage</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="suggested" className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="gap" className="space-y-2">
                    {QUERY_LIBRARY.gap.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="mapping" className="space-y-2">
                    {QUERY_LIBRARY.mapping.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="version" className="space-y-2">
                    {QUERY_LIBRARY.version.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="provenance" className="space-y-2">
                    {QUERY_LIBRARY.provenance.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="recommendation" className="space-y-2">
                    {QUERY_LIBRARY.recommendation.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="coverage" className="space-y-2">
                    {QUERY_LIBRARY.coverage.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4 w-full"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </TabsContent>
                </Tabs>
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
                        <>
                          {message.needsClarification && message.clarifications ? (
                            // Clarification request UI
                            <div className="space-y-4">
                              <div className="flex items-start gap-2">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">I need a bit more information</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Your question is a bit broad. Here are some more specific questions you might want to ask:
                                  </p>
                                </div>
                              </div>
                              
                              {message.clarifications.map((clarification, cIdx) => (
                                <div key={cIdx} className="space-y-2">
                                  <p className="text-sm text-muted-foreground">{clarification.message}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {clarification.suggestions.map((suggestion, sIdx) => (
                                      <Button
                                        key={sIdx}
                                        variant="outline"
                                        size="sm"
                                        className="text-left h-auto py-2 px-3 whitespace-normal"
                                        onClick={() => handleSuggestedQuestion(suggestion)}
                                      >
                                        <span className="text-xs">{suggestion}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              {message.relatedTopics && message.relatedTopics.length > 0 && (
                                <div className="pt-2 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground mb-2">Related topics:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.relatedTopics.map((topic, tIdx) => (
                                      <Badge key={tIdx} variant="secondary" className="text-xs">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : isRefusalMessage(message) ? (
                            // Refusal message with suggested alternative
                            <div className="space-y-3">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <Streamdown>{parseRefusalMessage(message.content).reason}</Streamdown>
                              </div>
                              {parseRefusalMessage(message.content).suggestion && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Try this instead:
                                  </p>
                                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                      {parseRefusalMessage(message.content).suggestion}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Normal answer
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <Streamdown>{message.content}</Streamdown>
                            </div>
                          )}
                          {/* Metadata badges */}
                          {(message.confidence || message.queryType || message.authority) && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 flex-wrap">
                              {getQueryTypeBadge(message.queryType)}
                              {getConfidenceBadge(message.confidence)}
                              {/* Authority Score */}
                              {message.authority && (
                                <AuthorityScore
                                  score={message.authority.score}
                                  level={message.authority.level}
                                  breakdown={message.authority.breakdown}
                                />
                              )}
                              {/* Claim Verification */}
                              {message.claimVerification && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    message.claimVerification.verificationRate >= 0.8
                                      ? 'text-green-700 dark:text-green-400'
                                      : message.claimVerification.verificationRate >= 0.5
                                      ? 'text-yellow-700 dark:text-yellow-400'
                                      : 'text-red-700 dark:text-red-400'
                                  }`}
                                >
                                  {Math.round(message.claimVerification.verificationRate * 100)}% verified
                                  ({message.claimVerification.verifiedClaims}/{message.claimVerification.totalClaims} claims)
                                </Badge>
                              )}
                              {message.citationValid === false && message.missingCitations && message.missingCitations.length > 0 && (
                                <Badge variant="outline" className="text-xs text-orange-700 dark:text-orange-400">
                                  Missing: {message.missingCitations.join(", ")}
                                </Badge>
                              )}
                            </div>
                          )}
                          {/* Response Mode Warning */}
                          {message.responseMode && message.responseMode.mode !== 'full' && (
                            <div className={`mt-3 p-3 rounded-md border ${
                              message.responseMode.mode === 'partial'
                                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                            }`}>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                                  message.responseMode.mode === 'partial'
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`} />
                                <div>
                                  <p className={`text-sm font-medium ${
                                    message.responseMode.mode === 'partial'
                                      ? 'text-yellow-800 dark:text-yellow-200'
                                      : 'text-red-800 dark:text-red-200'
                                  }`}>
                                    {message.responseMode.mode === 'partial' ? 'Partial Evidence' : 'Limited Evidence'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {message.responseMode.reason}
                                  </p>
                                  {message.responseMode.recommendations.length > 0 && (
                                    <ul className="text-xs text-muted-foreground mt-2 list-disc list-inside">
                                      {message.responseMode.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">
                          Sources ({filterSourcesByAuthority(message.sources)?.length || 0} of {message.sources.length}):
                        </p>
                        <Select value={authorityFilter} onValueChange={(v) => setAuthorityFilter(v as AuthorityFilter)}>
                          <SelectTrigger className="h-7 w-[140px] text-xs">
                            <SelectValue placeholder="Filter by authority" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTHORITY_FILTER_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        {filterSourcesByAuthority(message.sources)?.map((source, sourceIdx) => (
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
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {getSourceTypeLabel(source.type)}
                                      </Badge>
                                      {/* Authority Badge */}
                                      {source.authorityLevel && (
                                        <AuthorityBadge
                                          level={source.authorityLevel}
                                          size="sm"
                                        />
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {source.similarity}% match
                                      </Badge>
                                      {/* Dataset version indicator */}
                                      {source.datasetVersion && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-mono text-green-700 dark:text-green-400"
                                          title={`Dataset: ${source.datasetId || 'Unknown'} v${source.datasetVersion}`}
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          {source.datasetVersion}
                                        </Badge>
                                      )}
                                      {/* Deprecation warning */}
                                      {source.isDeprecated && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                          title={source.deprecationReason || 'This source has been deprecated'}
                                        >
                                          ⚠️ Deprecated
                                        </Badge>
                                      )}
                                      {/* Verification warning */}
                                      {source.needsVerification && !source.isDeprecated && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs text-yellow-700 dark:text-yellow-400"
                                          title={source.lastVerifiedDate ? `Last verified: ${new Date(source.lastVerifiedDate).toLocaleDateString()}` : 'Not yet verified'}
                                        >
                                          ⚠️ Needs verification
                                        </Badge>
                                      )}
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
    </div>
  );
}
