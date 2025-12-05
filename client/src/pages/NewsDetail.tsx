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
                  {(newsItem.regulationTags as string[])?.map((tag) => (
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

              {/* Source Link */}
              {newsItem.sourceUrl && (
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
              )}
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
