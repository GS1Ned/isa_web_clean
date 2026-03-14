import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { MessageSquare, Search, Sparkles, Zap } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { AskISAExpertMode } from "@/components/AskISAExpertMode";
import { EnhancedSearchPanel } from "@/components/EnhancedSearchPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type KnowledgeStatsEntry = {
  source_type: string;
  count: number;
  unique_authorities?: number;
};

function formatSourceLabel(sourceType: string) {
  return sourceType
    .replace(/_/g, " ")
    .replace(/\b\w/g, match => match.toUpperCase());
}

export default function AskISAEnhanced() {
  const [activeTab, setActiveTab] = useState<"expert" | "search" | "classic">(
    "expert"
  );
  const knowledgeStatsQuery = trpc.askISAV2.getKnowledgeStats.useQuery();

  const statsCards = useMemo(() => {
    const bySourceType: KnowledgeStatsEntry[] =
      knowledgeStatsQuery.data?.bySourceType ?? [];
    return bySourceType
      .slice()
      .sort(
        (a: KnowledgeStatsEntry, b: KnowledgeStatsEntry) =>
          Number(b.count || 0) - Number(a.count || 0)
      )
      .slice(0, 4);
  }, [knowledgeStatsQuery.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 py-12 text-white">
        <div className="container space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Link href="/hub" className="hover:text-white">
              Hub
            </Link>
            <span>/</span>
            <span className="text-white">Ask ISA</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Sparkles className="h-8 w-8 text-emerald-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Ask ISA
                </h1>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                  <Zap className="mr-1 h-3 w-3" />
                  Expert Mode
                </Badge>
              </div>
              <p className="mt-1 max-w-3xl text-slate-300">
                Intelligence-first workflows for standards and compliance
                questions: expert reasoning, advanced evidence search, and
                classic grounded chat.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs
          value={activeTab}
          onValueChange={value =>
            setActiveTab(value as "expert" | "search" | "classic")
          }
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="expert" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Expert Reasoning
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Advanced Search
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Classic Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expert" className="mt-0">
            <AskISAExpertMode />
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <EnhancedSearchPanel />

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Why this is smarter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Enhanced Search exposes the retrieval layer directly, with
                      filters for source type, semantic layer, and authority
                      posture.
                    </p>
                    <p>
                      Use it when you want to inspect the evidence set before
                      asking for a synthesized answer or when you need to
                      explore adjacent sources.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Knowledge Stats</CardTitle>
                    <CardDescription>
                      Live totals from the v2 knowledge embeddings surface.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-2xl font-semibold text-slate-900">
                        {knowledgeStatsQuery.data?.total ?? "…"}
                      </div>
                      <div className="text-xs text-slate-500">
                        Indexed knowledge items
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {statsCards.map((entry: KnowledgeStatsEntry) => (
                        <div
                          key={String(entry.source_type)}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="text-lg font-semibold text-slate-900">
                            {entry.count}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatSourceLabel(String(entry.source_type))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classic" className="mt-0">
            <Card className="border-slate-200 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle>Classic Ask ISA</CardTitle>
                <CardDescription>
                  The previous chat surface remains available as a fallback for
                  users who want the established conversation flow and history
                  behavior.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Link href="/ask/classic">
                  <Button type="button" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Open Classic Chat
                  </Button>
                </Link>
                <div className="text-sm text-muted-foreground">
                  Use Expert Reasoning above when you want deeper,
                  context-linked, retrieval-aware answers.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
