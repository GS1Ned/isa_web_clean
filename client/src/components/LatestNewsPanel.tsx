/**
 * Latest News Panel
 * Shows top 5-8 news items on homepage
 */

import { NewsCard } from "./NewsCard";
import { Button } from "./ui/button";
import { Newspaper, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export function LatestNewsPanel() {
  const { data: newsItems, isLoading } = trpc.hub.getRecentNews.useQuery({ limit: 6 });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading latest news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return null; // Don't show panel if no news
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Latest ESG Regulatory News</h2>
              <p className="text-muted-foreground mt-1">
                AI-curated updates from EU and GS1 sources
              </p>
            </div>
          </div>
          <Link href="/news">
            <Button variant="outline" className="gap-2">
              View All News
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {newsItems.slice(0, 6).map((item: any) => (
            <NewsCard
              key={item.id}
              news={{
                id: item.id,
                title: item.title,
                summary: item.summary || "",
                publishedDate: new Date(item.publishedDate || item.createdAt),
                regulationTags: (item.regulationTags as string[]) || [],
                impactLevel: item.impactLevel || "MEDIUM",
                sourceUrl: item.sourceUrl || "#",
                sourceTitle: item.sourceTitle || "Unknown Source",
                sourceType: item.sourceType || "EU_OFFICIAL",
                newsType: item.newsType,
              }}
            />
          ))}
        </div>

        {/* View More Button (mobile) */}
        <div className="mt-6 text-center md:hidden">
          <Link href="/news">
            <Button className="gap-2">
              View All News
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
