// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Star,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TemplateAnalyticsDashboard() {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "performance" | "recommendations"
  >("overview");

  // Fetch analytics data
  const { data: overallAnalytics } =
    trpc.templateAnalytics.getOverallAnalytics.useQuery();
  const { data: categoryAnalytics } =
    trpc.templateAnalytics.getAnalyticsByCategory.useQuery();
  const { data: strategyAnalytics } =
    trpc.templateAnalytics.getAnalyticsByStrategy.useQuery();
  const { data: topTemplates } =
    trpc.templateAnalytics.getTopPerformingTemplates.useQuery({ limit: 5 });
  const { data: lowestRated } =
    trpc.templateAnalytics.getLowestRatedTemplates.useQuery({ limit: 5 });
  const { data: usageTrends } =
    trpc.templateAnalytics.getUsageTrends.useQuery();
  const { data: recommendations } =
    trpc.templateAnalytics.getImprovementRecommendations.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Template Analytics</h1>
        <p className="text-gray-600">
          Monitor template performance and identify improvement opportunities
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab("overview")}
          className={`px-4 py-2 font-medium ${
            selectedTab === "overview"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab("performance")}
          className={`px-4 py-2 font-medium ${
            selectedTab === "performance"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setSelectedTab("recommendations")}
          className={`px-4 py-2 font-medium ${
            selectedTab === "recommendations"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Recommendations
        </button>
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          {overallAnalytics && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Total Templates</p>
                    <p className="text-3xl font-bold">
                      {overallAnalytics.totalTemplates}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {overallAnalytics.publicTemplates} public
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Total Usage</p>
                    <p className="text-3xl font-bold">
                      {overallAnalytics.totalUsage}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">clones</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Avg Rating</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <p className="text-3xl font-bold">
                        {overallAnalytics.avgRating.toFixed(1)}
                      </p>
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">out of 5</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Avg Usage</p>
                    <p className="text-3xl font-bold">
                      {(
                        overallAnalytics.totalUsage /
                        overallAnalytics.totalTemplates
                      ).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per template</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Analytics */}
          {categoryAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {categoryAnalytics.map(cat => (
                    <div key={cat.category} className="border rounded-lg p-4">
                      <h4 className="font-bold text-lg mb-2">
                        {cat.category.toUpperCase()}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Templates:</span>{" "}
                          {cat.templateCount}
                        </p>
                        <p>
                          <span className="text-gray-600">Usage:</span>{" "}
                          {cat.totalUsage}
                        </p>
                        <p>
                          <span className="text-gray-600">Avg Rating:</span>{" "}
                          {cat.avgRating.toFixed(1)}
                        </p>
                        <p>
                          <span className="text-gray-600">Public:</span>{" "}
                          {cat.publicCount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strategy Analytics */}
          {strategyAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics by Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {strategyAnalytics.map(strat => (
                    <div key={strat.strategy} className="border rounded-lg p-4">
                      <h4 className="font-bold text-lg mb-2">
                        {strat.strategy.replace(/_/g, " ")}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Templates:</span>{" "}
                          {strat.templateCount}
                        </p>
                        <p>
                          <span className="text-gray-600">Usage:</span>{" "}
                          {strat.totalUsage}
                        </p>
                        <p>
                          <span className="text-gray-600">Avg Rating:</span>{" "}
                          {strat.avgRating.toFixed(1)}
                        </p>
                        <p>
                          <span className="text-gray-600">Avg Effort:</span>{" "}
                          {strat.avgEffort}h
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {selectedTab === "performance" && (
        <div className="space-y-6">
          {/* Usage Trends */}
          {usageTrends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usage Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="text-gray-600 text-sm">Total Usage</p>
                    <p className="text-2xl font-bold">
                      {usageTrends.totalUsage}
                    </p>
                  </div>
                  <div className="border-l-4 border-green-600 pl-4">
                    <p className="text-gray-600 text-sm">Avg per Template</p>
                    <p className="text-2xl font-bold">
                      {usageTrends.avgUsagePerTemplate}
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-600 pl-4">
                    <p className="text-gray-600 text-sm">Unused Templates</p>
                    <p className="text-2xl font-bold">
                      {usageTrends.unusedTemplates}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Max Usage:</span>{" "}
                    {usageTrends.maxUsage}
                  </p>
                  <p>
                    <span className="text-gray-600">Min Usage:</span>{" "}
                    {usageTrends.minUsage}
                  </p>
                  <p>
                    <span className="text-gray-600">Highly Used:</span>{" "}
                    {usageTrends.highlyUsedTemplates} templates
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performing Templates */}
          {topTemplates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTemplates.map(template => (
                    <div
                      key={template.id}
                      className="flex justify-between items-start border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {template.category.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {template.strategy.replace(/_/g, " ")}
                          </Badge>
                          {template.isPublic && (
                            <Badge className="bg-green-100 text-green-800">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{template.usageCount} uses</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-sm">
                            {template.rating.toFixed(1)}
                          </p>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lowest Rated Templates */}
          {lowestRated && lowestRated.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  Templates Needing Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowestRated.map(template => (
                    <div
                      key={template.id}
                      className="flex justify-between items-start border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {template.category.toUpperCase()}
                          </Badge>
                          <Badge
                            className={
                              template.improvementPriority === "high"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {template.improvementPriority.toUpperCase()}{" "}
                            PRIORITY
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{template.usageCount} uses</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-sm">
                            {template.rating.toFixed(1)}
                          </p>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab === "recommendations" && (
        <div className="space-y-4">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <Card
                key={idx}
                className={`border-l-4 ${
                  rec.severity === "high"
                    ? "border-l-red-600 bg-red-50"
                    : rec.severity === "medium"
                      ? "border-l-yellow-600 bg-yellow-50"
                      : "border-l-blue-600 bg-blue-50"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {rec.severity === "high" ? (
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">
                        {rec.type.replace(/_/g, " ").toUpperCase()}
                      </h4>
                      <p className="text-sm mb-3">{rec.message}</p>
                      {rec.templates && rec.templates.length > 0 && (
                        <div className="space-y-1">
                          {rec.templates.slice(0, 3).map((t: any) => (
                            <p key={t.id} className="text-xs text-gray-700">
                              • {t.name}
                              {t.rating && ` (Rating: ${t.rating.toFixed(1)})`}
                            </p>
                          ))}
                          {rec.templates.length > 3 && (
                            <p className="text-xs text-gray-600">
                              + {rec.templates.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                      {rec.missingCategories &&
                        rec.missingCategories.length > 0 && (
                          <div className="space-y-1">
                            {rec.missingCategories.map((cat: string) => (
                              <p key={cat} className="text-xs text-gray-700">
                                • {cat.toUpperCase()}
                              </p>
                            ))}
                          </div>
                        )}
                    </div>
                    <Badge
                      className={
                        rec.severity === "high"
                          ? "bg-red-200 text-red-800 h-fit"
                          : rec.severity === "medium"
                            ? "bg-yellow-200 text-yellow-800 h-fit"
                            : "bg-blue-200 text-blue-800 h-fit"
                      }
                    >
                      {rec.severity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="font-medium">
                  All templates are performing well!
                </p>
                <p className="text-sm text-gray-600">
                  No improvement recommendations at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
