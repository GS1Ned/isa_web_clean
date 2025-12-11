/**
 * Latest News Panel
 * Shows top 5-8 news items on homepage
 */

import { NewsCardCompact } from "./NewsCardCompact";
import { NewsCardCompactSkeleton } from "./NewsCardSkeleton";
import { Button } from "./ui/button";
import { Newspaper, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export function LatestNewsPanel() {
  const { data: newsItems, isLoading } = trpc.hub.getRecentNews.useQuery({
    limit: 6,
  });

  if (isLoading) {
    return (
      <div className="lg:sticky lg:top-24">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Latest News</h3>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <NewsCardCompactSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="lg:sticky lg:top-24">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Latest News</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            No news articles available yet. Check back soon for ESG regulatory
            updates.
          </p>
          <Link href="/news" className="mt-4 block">
            <Button variant="outline" size="sm" className="w-full gap-2">
              Explore News Hub
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="bg-card border border-border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Latest News</h3>
          </div>
          <Link href="/news">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* News List */}
        <div className="space-y-3">
          {newsItems.slice(0, 5).map((item: any) => (
            <NewsCardCompact
              key={item.id}
              news={{
                id: item.id,
                title: item.title,
                summary: item.summary || "",
                publishedDate: new Date(item.publishedDate || item.createdAt),
                regulationTags: Array.isArray(item.regulationTags)
                  ? item.regulationTags
                  : [],
                impactLevel: item.impactLevel || "MEDIUM",
                newsType: item.newsType,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
