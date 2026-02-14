// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Copy, TrendingUp, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TemplateLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [cloneTitle, setCloneTitle] = useState("");

  // Fetch categories
  const { data: categories } = trpc.templates.getCategories.useQuery();

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } =
    trpc.templates.listTemplates.useQuery({
      category: selectedCategory,
      search: searchTerm || undefined,
      limit: 20,
    });

  // Fetch template details
  const { data: templateDetails } = trpc.templates.getTemplate.useQuery(
    { templateId: selectedTemplate || 0 },
    { enabled: selectedTemplate !== null }
  );

  // Fetch stats
  const { data: stats } = trpc.templates.getStats.useQuery();

  // Mutations
  const cloneTemplateMutation = trpc.templates.cloneTemplate.useMutation();
  const rateTemplateMutation = trpc.templates.rateTemplate.useMutation();

  const handleCloneTemplate = async () => {
    if (!selectedTemplate || !cloneTitle.trim()) return;

    await cloneTemplateMutation.mutateAsync({
      templateId: selectedTemplate,
      roadmapTitle: cloneTitle,
      startDate: new Date(),
    });

    setCloneTitle("");
    setShowCloneForm(false);
    setSelectedTemplate(null);
  };

  const handleRateTemplate = async (rating: number) => {
    if (!selectedTemplate) return;

    await rateTemplateMutation.mutateAsync({
      templateId: selectedTemplate,
      rating,
    });
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "risk_first":
        return "bg-red-100 text-red-800";
      case "quick_wins":
        return "bg-green-100 text-green-800";
      case "balanced":
        return "bg-blue-100 text-blue-800";
      case "comprehensive":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Roadmap Templates</h1>
        <p className="text-gray-600">
          Start your compliance journey with pre-built roadmaps for common
          scenarios
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold">{stats.totalTemplates}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold">{stats.totalUsage}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600">Top Rated</p>
                <div className="flex gap-1 mt-2">
                  {stats.topRated.slice(0, 3).map(t => (
                    <Badge key={t.id} variant="outline" className="text-xs">
                      {t.name.substring(0, 8)}...
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600">Most Used</p>
                <div className="flex gap-1 mt-2">
                  {stats.mostUsed.slice(0, 3).map(t => (
                    <Badge key={t.id} variant="outline" className="text-xs">
                      {t.name.substring(0, 8)}...
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Button>
          {categories?.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesLoading ? (
          <p className="text-gray-500">Loading templates...</p>
        ) : templates && templates.length > 0 ? (
          templates.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id ? "ring-2 ring-blue-600" : ""
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {template.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {template.rating}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{template.description}</p>

                <div className="flex gap-2 flex-wrap">
                  <Badge className={getStrategyColor(template.strategy)}>
                    {template.strategy.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline">
                    {template.estimatedEffort}h effort
                  </Badge>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Target: {template.targetScore}%</span>
                  <span>Used {template.usageCount} times</span>
                </div>

                <Button
                  className="w-full"
                  onClick={e => {
                    e.stopPropagation();
                    setShowCloneForm(true);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No templates found</p>
        )}
      </div>

      {/* Template Details Panel */}
      {selectedTemplate && templateDetails && (
        <Card className="border-2 border-blue-600">
          <CardHeader>
            <CardTitle>{templateDetails.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">
                {templateDetails.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Strategy</p>
                <p className="font-medium">{templateDetails.strategy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target Score</p>
                <p className="font-medium">{templateDetails.targetScore}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated Effort</p>
                <p className="font-medium">
                  {templateDetails.estimatedEffort} hours
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated Impact</p>
                <p className="font-medium">
                  +{templateDetails.estimatedImpact}%
                </p>
              </div>
            </div>

            {templateDetails.actions && templateDetails.actions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">
                  Actions ({templateDetails.actions.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {templateDetails.actions.map(action => (
                    <div
                      key={action.id}
                      className="text-sm border-l-2 border-blue-300 pl-3"
                    >
                      <p className="font-medium">{action.title}</p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {templateDetails.milestones &&
              templateDetails.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    Milestones ({templateDetails.milestones.length})
                  </h4>
                  <div className="space-y-2">
                    {templateDetails.milestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className="text-sm flex justify-between"
                      >
                        <span>{milestone.title}</span>
                        <span className="text-gray-500">
                          {milestone.targetScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Rating */}
            <div>
              <p className="text-sm font-medium mb-2">Rate this template</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRateTemplate(rating)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating <=
                        parseFloat((templateDetails.rating || 0).toString())
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Clone Form */}
            {showCloneForm ? (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Enter roadmap title..."
                  value={cloneTitle}
                  onChange={e => setCloneTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCloneTemplate}
                    disabled={
                      !cloneTitle.trim() || cloneTemplateMutation.isPending
                    }
                    className="flex-1"
                  >
                    {cloneTemplateMutation.isPending
                      ? "Creating..."
                      : "Create Roadmap"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCloneForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => setShowCloneForm(true)}
                disabled={cloneTemplateMutation.isPending}
              >
                <Copy className="w-4 h-4 mr-2" />
                Create Roadmap from Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
