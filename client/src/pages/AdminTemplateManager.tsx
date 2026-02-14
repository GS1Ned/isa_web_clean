// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminTemplateManager() {
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "custom" as const,
    strategy: "balanced" as const,
    estimatedEffort: 40,
    estimatedImpact: 15,
    targetScore: 80,
    isPublic: true,
    tags: [] as string[],
  });

  // Fetch templates
  const { data: templates, refetch: refetchTemplates } =
    trpc.adminTemplates.listAdminTemplates.useQuery({
      category: selectedCategory,
      search: searchTerm || undefined,
      limit: 50,
    });

  // Fetch template details
  const { data: templateDetails } =
    trpc.adminTemplates.getTemplateForEdit.useQuery(
      { templateId: selectedTemplate || 0 },
      { enabled: selectedTemplate !== null && editMode }
    );

  // Mutations
  const createTemplateMutation =
    trpc.adminTemplates.createTemplate.useMutation();
  const updateTemplateMutation =
    trpc.adminTemplates.updateTemplate.useMutation();
  const deleteTemplateMutation =
    trpc.adminTemplates.deleteTemplate.useMutation();
  const publishTemplateMutation =
    trpc.adminTemplates.publishTemplate.useMutation();
  const unpublishTemplateMutation =
    trpc.adminTemplates.unpublishTemplate.useMutation();

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) return;

    await createTemplateMutation.mutateAsync({
      ...formData,
      estimatedImpact: formData.estimatedImpact,
      targetScore: formData.targetScore,
    });

    setFormData({
      name: "",
      description: "",
      category: "custom",
      strategy: "balanced",
      estimatedEffort: 40,
      estimatedImpact: 15,
      targetScore: 80,
      isPublic: true,
      tags: [],
    });
    setShowCreateForm(false);
    refetchTemplates();
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    await updateTemplateMutation.mutateAsync({
      templateId: selectedTemplate,
      ...formData,
      estimatedImpact: formData.estimatedImpact,
      targetScore: formData.targetScore,
    });

    setEditMode(false);
    refetchTemplates();
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    await deleteTemplateMutation.mutateAsync({ templateId });
    setSelectedTemplate(null);
    refetchTemplates();
  };

  const handlePublishTemplate = async (templateId: number) => {
    await publishTemplateMutation.mutateAsync({ templateId });
    refetchTemplates();
  };

  const handleUnpublishTemplate = async (templateId: number) => {
    await unpublishTemplateMutation.mutateAsync({ templateId });
    refetchTemplates();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Template Manager</h1>
          <p className="text-gray-600">
            Create and manage custom compliance roadmap templates
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-600">
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., CSRD Quick Start"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="csrd">CSRD</option>
                  <option value="eudr">EUDR</option>
                  <option value="esrs">ESRS</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the template purpose..."
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Strategy</label>
                <select
                  value={formData.strategy}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      strategy: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="risk_first">Risk First</option>
                  <option value="quick_wins">Quick Wins</option>
                  <option value="balanced">Balanced</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Estimated Effort (hours)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedEffort}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      estimatedEffort: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Score (%)</label>
                <Input
                  type="number"
                  value={formData.targetScore}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      targetScore: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={e =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                id="isPublic"
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                Make template public
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateTemplate}
                disabled={
                  !formData.name.trim() || createTemplateMutation.isPending
                }
                className="flex-1"
              >
                {createTemplateMutation.isPending
                  ? "Creating..."
                  : "Create Template"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
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
          {["csrd", "eudr", "esrs", "custom"].map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {templates && templates.length > 0 ? (
          templates.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id ? "ring-2 ring-blue-600" : ""
              }`}
              onClick={() => {
                setSelectedTemplate(template.id);
                setEditMode(false);
              }}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      {template.isPublic ? (
                        <Badge className="bg-green-100 text-green-800">
                          Public
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getStrategyColor(template.strategy)}>
                        {template.strategy.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline">
                        {template.estimatedEffort}h effort
                      </Badge>
                      <Badge variant="outline">
                        Target: {template.targetScore}%
                      </Badge>
                      <Badge variant="outline">
                        Used {template.usageCount} times
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {template.isPublic ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          handleUnpublishTemplate(template.id);
                        }}
                      >
                        <EyeOff className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          handlePublishTemplate(template.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedTemplate(template.id);
                        setEditMode(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No templates found</p>
        )}
      </div>

      {/* Edit Panel */}
      {selectedTemplate && editMode && templateDetails && (
        <Card className="border-2 border-blue-600">
          <CardHeader>
            <CardTitle>
              Edit Template: {templateDetails.template.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={formData.name || templateDetails.template.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Strategy</label>
                <select
                  value={formData.strategy || templateDetails.template.strategy}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      strategy: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="risk_first">Risk First</option>
                  <option value="quick_wins">Quick Wins</option>
                  <option value="balanced">Balanced</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={
                  formData.description ||
                  templateDetails.template.description ||
                  ""
                }
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
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

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateTemplate}
                disabled={updateTemplateMutation.isPending}
                className="flex-1 gap-2"
              >
                <Save className="w-4 h-4" />
                {updateTemplateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
