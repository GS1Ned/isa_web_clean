/**
 * Latest News Panel
 * Shows top 5-8 news items on homepage
 */

import React from "react";
import { NewsCardCompact } from "./NewsCardCompact";
import { NewsCardCompactSkeleton } from "./NewsCardSkeleton";
import { Button } from "./ui/button";
import { Newspaper, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type CompactNewsItem = Parameters<typeof NewsCardCompact>[0]["news"];

type RawLatestNewsItem = {
  id?: unknown;
  title?: unknown;
  summary?: unknown;
  publishedDate?: unknown;
  createdAt?: unknown;
  regulationTags?: unknown;
  impactLevel?: unknown;
  newsType?: unknown;
};

function isRawLatestNewsItem(value: unknown): value is RawLatestNewsItem {
  return typeof value === "object" && value !== null;
}

function mapToCompactNewsItem(value: unknown): CompactNewsItem | null {
  if (!isRawLatestNewsItem(value)) {
    return null;
  }

  return {
    id: value.id as CompactNewsItem["id"],
    title: value.title as CompactNewsItem["title"],
    summary: (value.summary || "") as CompactNewsItem["summary"],
    publishedDate: new Date(
      (value.publishedDate || value.createdAt || "") as string | number | Date,
    ),
    regulationTags: Array.isArray(value.regulationTags)
      ? (value.regulationTags as CompactNewsItem["regulationTags"])
      : [],
    impactLevel: (value.impactLevel || "MEDIUM") as CompactNewsItem["impactLevel"],
    newsType: value.newsType as CompactNewsItem["newsType"],
  };
}

export function LatestNewsPanel() {
  const { data: newsItems, isLoading } = trpc.hub.getRecentNews.useQuery({
    limit: 6,
  });
  const recentItems: unknown[] = Array.isArray(newsItems)
    ? newsItems.slice(0, 5)
    : [];

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

  if (recentItems.length === 0) {
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
          {recentItems
            .map(mapToCompactNewsItem)
            .filter((item): item is CompactNewsItem => item !== null)
            .map(item => (
              <NewsCardCompact key={item.id} news={item} />
            ))}
        </div>
      </div>
    </div>
  );
}
