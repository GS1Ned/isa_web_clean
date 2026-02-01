/**
 * Ask ISA Enhanced - Unified Q&A and Search Interface
 * 
 * Combines the original Ask ISA chat interface with the new enhanced search panel.
 * Users can switch between conversational AI and advanced filtered search.
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Sparkles, Zap } from "lucide-react";
import AskISA from "./AskISA";
import { EnhancedSearchPanel } from "@/components/EnhancedSearchPanel";

export default function AskISAEnhanced() {
  const [activeTab, setActiveTab] = useState<"chat" | "search">("chat");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Ask ISA</h1>
          <Badge variant="secondary" className="ml-2">
            <Zap className="h-3 w-3 mr-1" />
            Enhanced
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your intelligent assistant for EU sustainability regulations and GS1 standards.
          Choose between conversational AI or advanced filtered search.
        </p>
      </div>

      {/* Mode Selector */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "search")} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversational AI
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </TabsTrigger>
        </TabsList>

        {/* Chat Interface */}
        <TabsContent value="chat" className="mt-0">
          <AskISA />
        </TabsContent>

        {/* Enhanced Search Interface */}
        <TabsContent value="search" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Panel */}
            <div className="lg:col-span-2">
              <EnhancedSearchPanel
                onResultSelect={(result) => {
                  // Could open a detail modal or navigate to the source
                  console.log("Selected result:", result);
                }}
              />
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">About Enhanced Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs space-y-2">
                    <p>
                      Enhanced Search allows you to query our knowledge base of 1,000+
                      documents with advanced filtering capabilities.
                    </p>
                    <p>
                      <strong>Filter by Source Type:</strong> Regulations, GS1 Standards,
                      ESRS Datapoints, and more.
                    </p>
                    <p>
                      <strong>Filter by Semantic Layer:</strong> Juridisch (legal),
                      Normatief (normative), or Operationeel (operational).
                    </p>
                    <p>
                      <strong>Filter by Authority:</strong> From binding regulations to
                      informational guidance.
                    </p>
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Knowledge Base Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded p-2 text-center">
                      <div className="font-bold text-lg">1,077</div>
                      <div className="text-muted-foreground">Embeddings</div>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <div className="font-bold text-lg">39</div>
                      <div className="text-muted-foreground">GS1 Standards</div>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <div className="font-bold text-lg">20</div>
                      <div className="text-muted-foreground">Regulations</div>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <div className="font-bold text-lg">914</div>
                      <div className="text-muted-foreground">ESRS Datapoints</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs space-y-2">
                    <p>
                      <strong>Tip 1:</strong> Use specific keywords like "carbon footprint"
                      or "CSRD Article 8" for better results.
                    </p>
                    <p>
                      <strong>Tip 2:</strong> Combine filters to narrow down results. For
                      example, select "Regulations" + "Juridisch" for legally binding
                      requirements.
                    </p>
                    <p>
                      <strong>Tip 3:</strong> Click on any result to see more details and
                      access the original source.
                    </p>
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
