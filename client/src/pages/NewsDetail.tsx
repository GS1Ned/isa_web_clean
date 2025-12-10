/**
 * News Detail Page
 * Displays full news article with AI-powered recommendations
 */

import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendedResources } from "@/components/RecommendedResources";
import { ArrowLeft, Calendar, ExternalLink, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const newsId = params?.id ? parseInt(params.id) : 0;

  const { data: newsItems } = trpc.hub.getRecentNews.useQuery({ limit: 100 });
  const { data: recommendations, isLoading: recsLoading } = trpc.hub.getNewsRecommendations.useQuery(
    { newsId },
    { enabled: newsId > 0 }
  );

  const newsItem = newsItems?.find((item) => item.id === newsId);

  if (!newsItem) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">News Article Not Found</h1>
          <Link href="/news">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const impactColors = {
    HIGH: "bg-red-500/10 text-red-600 border-red-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    LOW: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  return (
    <div className="container py-8">
      <Link href="/news">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to News Hub
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              {/* Header */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {newsItem.impactLevel && (
                    <Badge className={impactColors[newsItem.impactLevel as keyof typeof impactColors]}>
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {newsItem.impactLevel} Impact
                    </Badge>
                  )}
                  {Array.isArray(newsItem.regulationTags) && newsItem.regulationTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl font-bold">{newsItem.title}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(newsItem.publishedDate || newsItem.createdAt), "MMMM d, yyyy")}
                  </div>
                  {newsItem.sourceTitle && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>{newsItem.sourceTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {newsItem.summary && (
                <div className="bg-accent/50 rounded-lg p-4 mb-6">
                  <p className="text-lg leading-relaxed">{newsItem.summary}</p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{newsItem.content}</p>
              </div>

              {/* GS1 Insights Section */}
              {(newsItem.gs1ImpactAnalysis || newsItem.suggestedActions || newsItem.gs1ImpactTags || newsItem.sectorTags) && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    GS1 Impact Intelligence
                  </h3>

                  {/* GS1 Impact Tags & Sector Tags */}
                  {(newsItem.gs1ImpactTags || newsItem.sectorTags) && (
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(newsItem.gs1ImpactTags) && newsItem.gs1ImpactTags.map((tag) => (
                        <Badge key={tag} className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                          {tag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {Array.isArray(newsItem.sectorTags) && newsItem.sectorTags.map((tag) => (
                        <Badge key={tag} className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* GS1 Impact Analysis */}
                  {newsItem.gs1ImpactAnalysis && (
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">Impact Analysis</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-wrap">
                        {newsItem.gs1ImpactAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {Array.isArray(newsItem.suggestedActions) && newsItem.suggestedActions.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {newsItem.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Multi-Source Display */}
              {newsItem.sources && newsItem.sources.length > 1 ? (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">Multiple Sources</h3>
                    <Badge variant="secondary" className="text-xs">
                      {newsItem.sources.length} sources
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {newsItem.sources.map((source, index) => {
                      const sourceTypeLabels: Record<string, string> = {
                        EU_OFFICIAL: "EU Official",
                        GS1_OFFICIAL: "GS1 Official",
                        DUTCH_NATIONAL: "Dutch National",
                        INDUSTRY: "Industry",
                        MEDIA: "Media",
                      };
                      const sourceTypeColors: Record<string, string> = {
                        EU_OFFICIAL: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                        GS1_OFFICIAL: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                        DUTCH_NATIONAL: "bg-orange-500/10 text-orange-600 border-orange-500/20",
                        INDUSTRY: "bg-green-500/10 text-green-600 border-green-500/20",
                        MEDIA: "bg-gray-500/10 text-gray-600 border-gray-500/20",
                      };
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-accent/30">
                          <Badge className={sourceTypeColors[source.type] || sourceTypeColors.MEDIA}>
                            {sourceTypeLabels[source.type] || source.type}
                          </Badge>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm hover:underline text-primary"
                          >
                            {source.name}
                          </a>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : newsItem.sourceUrl ? (
                <div className="mt-6 pt-6 border-t">
                  <a
                    href={newsItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    Read full article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recommendations */}
        <div className="space-y-6">
          {recsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ) : recommendations && recommendations.length > 0 ? (
            <RecommendedResources recommendations={recommendations as any} maxDisplay={8} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
