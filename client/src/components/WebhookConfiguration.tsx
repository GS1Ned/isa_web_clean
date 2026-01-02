/**
 * Webhook Configuration Component
 * 
 * Manages Slack and Teams webhook integrations for real-time alerts
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, Send, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface WebhookConfig {
  id?: number;
  platform: "slack" | "teams";
  webhookUrl: string;
  channelName?: string;
  enabled: boolean;
}

export function WebhookConfiguration() {
  const utils = trpc.useUtils();

  // Fetch configurations
  const { data: configurations, isLoading } = trpc.webhookConfig.getConfigurations.useQuery();

  // Mutations
  const saveConfig = trpc.webhookConfig.saveConfiguration.useMutation({
    onSuccess: () => {
      utils.webhookConfig.getConfigurations.invalidate();
      toast.success("Configuration saved", {
        description: "Webhook configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to save configuration", {
        description: error.message,
      });
    },
  });

  const deleteConfig = trpc.webhookConfig.deleteConfiguration.useMutation({
    onSuccess: () => {
      utils.webhookConfig.getConfigurations.invalidate();
      toast.success("Configuration deleted", {
        description: "Webhook configuration has been removed.",
      });
    },
    onError: (error) => {
      toast.error("Failed to delete configuration", {
        description: error.message,
      });
    },
  });

  const testWebhook = trpc.webhookConfig.testWebhook.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Test successful", {
          description: "Test message delivered successfully! Check your channel.",
        });
      } else {
        toast.error("Test failed", {
          description: result.error || "Failed to deliver test message.",
        });
      }
    },
    onError: (error) => {
      toast.error("Test failed", {
        description: error.message,
      });
    },
  });

  // Local state for new configuration
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfig, setNewConfig] = useState<WebhookConfig>({
    platform: "slack",
    webhookUrl: "",
    channelName: "",
    enabled: true,
  });

  const handleSaveNew = () => {
    if (!newConfig.webhookUrl) {
      toast.error("Validation error", {
        description: "Webhook URL is required.",
      });
      return;
    }

    saveConfig.mutate(newConfig);
    setShowNewConfig(false);
    setNewConfig({
      platform: "slack",
      webhookUrl: "",
      channelName: "",
      enabled: true,
    });
  };

  const handleToggleEnabled = (config: any) => {
    saveConfig.mutate({
      ...config,
      enabled: !config.enabled,
    });
  };

  const handleTestWebhook = (config: any) => {
    testWebhook.mutate({
      platform: config.platform,
      webhookUrl: config.webhookUrl,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this webhook configuration?")) {
      deleteConfig.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Webhook Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Configure Slack and Microsoft Teams webhooks to receive real-time alerts in your team channels.
        </p>
      </div>

      {/* Existing configurations */}
      <div className="space-y-4">
        {configurations?.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={config.platform === "slack" ? "default" : "secondary"}>
                    {config.platform === "slack" ? "Slack" : "Teams"}
                  </Badge>
                  {config.channelName && (
                    <span className="text-sm text-muted-foreground">#{config.channelName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.enabled === 1}
                    onCheckedChange={() => handleToggleEnabled(config)}
                    disabled={saveConfig.isPending}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(config)}
                    disabled={testWebhook.isPending || config.enabled === 0}
                  >
                    {testWebhook.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                    disabled={deleteConfig.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Webhook URL:</span>{" "}
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {config.webhookUrl.substring(0, 50)}...
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Status:</span>
                  {config.enabled === 1 ? (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <X className="h-3 w-3" /> Disabled
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new configuration */}
      {!showNewConfig ? (
        <Button onClick={() => setShowNewConfig(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook Integration
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New Webhook Integration</CardTitle>
            <CardDescription>Configure a new Slack or Teams webhook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="flex gap-2">
                <Button
                  variant={newConfig.platform === "slack" ? "default" : "outline"}
                  onClick={() => setNewConfig({ ...newConfig, platform: "slack" })}
                  className="flex-1"
                >
                  Slack
                </Button>
                <Button
                  variant={newConfig.platform === "teams" ? "default" : "outline"}
                  onClick={() => setNewConfig({ ...newConfig, platform: "teams" })}
                  className="flex-1"
                >
                  Microsoft Teams
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL *</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={newConfig.webhookUrl}
                onChange={(e) => setNewConfig({ ...newConfig, webhookUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelName">Channel Name (optional)</Label>
              <Input
                id="channelName"
                placeholder="alerts"
                value={newConfig.channelName || ""}
                onChange={(e) => setNewConfig({ ...newConfig, channelName: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={newConfig.enabled}
                onCheckedChange={(checked) => setNewConfig({ ...newConfig, enabled: checked })}
              />
              <Label htmlFor="enabled">Enable immediately</Label>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Setup Instructions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>
                    <strong>Slack:</strong> Create an Incoming Webhook in your Slack workspace settings
                  </li>
                  <li>
                    <strong>Teams:</strong> Add an Incoming Webhook connector to your Teams channel
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleSaveNew} disabled={saveConfig.isPending} className="flex-1">
                {saveConfig.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewConfig(false);
                  setNewConfig({
                    platform: "slack",
                    webhookUrl: "",
                    channelName: "",
                    enabled: true,
                  });
                }}
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
