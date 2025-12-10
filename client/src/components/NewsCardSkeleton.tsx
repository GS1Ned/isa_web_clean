/**
 * NewsCardSkeleton Component
 * Loading skeleton for news cards
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function NewsCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-5 w-16 bg-muted rounded"></div>
          <div className="h-5 w-12 bg-muted rounded"></div>
          <div className="h-5 w-14 bg-muted rounded"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center gap-4 mt-3">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>

        {/* Link skeleton */}
        <div className="h-4 w-32 bg-muted rounded"></div>
      </CardContent>
    </Card>
  );
}

export function NewsCardCompactSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-border bg-card animate-pulse">
      {/* Impact indicator skeleton */}
      <div className="w-1 rounded-full bg-muted"></div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Title skeleton */}
        <div className="h-5 bg-muted rounded w-3/4"></div>

        {/* Meta info skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 bg-muted rounded"></div>
          <div className="h-3 w-12 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}
