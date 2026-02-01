import { useState, useEffect } from "react";
import { Bell, Clock, Mail, RotateCcw, Save, FileText, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";

export function NotificationPreferences() {
  const { data: preferences, isLoading } =
    trpc.notificationPreferences.getPreferences.useQuery();
  const [localPrefs, setLocalPrefs] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [subscribedRegulations, setSubscribedRegulations] = useState<Set<number>>(new Set());
  
  // Fetch regulations for subscription options
  const { data: regulations } = trpc.regulations.list.useQuery({ limit: 50 });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const updateNotificationTypes =
    trpc.notificationPreferences.updateNotificationTypes.useMutation({
      onSuccess: () => setSaved(true),
    });

  const updateSeverityFilter =
    trpc.notificationPreferences.updateSeverityFilter.useMutation({
      onSuccess: () => setSaved(true),
    });

  const updateDeliveryChannels =
    trpc.notificationPreferences.updateDeliveryChannels.useMutation({
      onSuccess: () => setSaved(true),
    });

  const updateQuietHours =
    trpc.notificationPreferences.updateQuietHours.useMutation({
      onSuccess: () => setSaved(true),
    });

  const updateBatchSettings =
    trpc.notificationPreferences.updateBatchSettings.useMutation({
      onSuccess: () => setSaved(true),
    });

  const resetToDefaults =
    trpc.notificationPreferences.resetToDefaults.useMutation({
      onSuccess: () => {
        setLocalPrefs(preferences);
        setSaved(true);
      },
    });

  if (isLoading || !localPrefs) {
    return <div className="p-8 text-center">Loading preferences...</div>;
  }

  const handleNotificationTypeChange = (type: string, value: boolean) => {
    setLocalPrefs({ ...localPrefs, [type]: value });
    updateNotificationTypes.mutate({ [type]: value });
  };

  const handleSeverityChange = (severity: string) => {
    setLocalPrefs({ ...localPrefs, minSeverity: severity });
    updateSeverityFilter.mutate({ minSeverity: severity as any });
  };

  const handleDeliveryChange = (channel: string, value: boolean) => {
    setLocalPrefs({ ...localPrefs, [channel]: value });
    updateDeliveryChannels.mutate({ [channel]: value });
  };

  const handleQuietHoursChange = (field: string, value: any) => {
    setLocalPrefs({ ...localPrefs, [field]: value });
  };

  const handleQuietHoursSave = () => {
    updateQuietHours.mutate({
      quietHoursEnabled: localPrefs.quietHoursEnabled,
      quietHoursStart: localPrefs.quietHoursStart,
      quietHoursEnd: localPrefs.quietHoursEnd,
    });
  };

  const handleBatchSettingsSave = () => {
    updateBatchSettings.mutate({
      batchNotifications: localPrefs.batchNotifications,
      batchInterval: localPrefs.batchInterval,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-gray-600 mt-2">
          Customize how you receive compliance alerts
        </p>
      </div>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "riskDetected", label: "Risk Detection" },
              { key: "remediationUpdated", label: "Remediation Updates" },
              { key: "commentAdded", label: "Comments" },
              { key: "approvalRequested", label: "Approval Requests" },
              { key: "approvalDecision", label: "Approval Decisions" },
              { key: "templateUpdated", label: "Template Updates" },
              { key: "scoreChanged", label: "Score Changes" },
              { key: "milestoneAchieved", label: "Milestone Achievements" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <label className="text-sm font-medium">{item.label}</label>
                <Switch
                  checked={localPrefs[item.key] || false}
                  onCheckedChange={value =>
                    handleNotificationTypeChange(item.key, value)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Filtering */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Filtering</CardTitle>
          <CardDescription>
            Only receive notifications with this severity or higher
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {["low", "medium", "high", "critical"].map(severity => (
              <Button
                key={severity}
                variant={
                  localPrefs.minSeverity === severity ? "default" : "outline"
                }
                onClick={() => handleSeverityChange(severity)}
                className="capitalize"
              >
                {severity}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">In-App Notifications</label>
            <Switch
              checked={localPrefs.inAppNotifications || false}
              onCheckedChange={value =>
                handleDeliveryChange("inAppNotifications", value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Email Notifications</label>
            <Switch
              checked={localPrefs.emailNotifications || false}
              onCheckedChange={value =>
                handleDeliveryChange("emailNotifications", value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Quiet Hours</label>
            <Switch
              checked={localPrefs.quietHoursEnabled || false}
              onCheckedChange={value =>
                handleQuietHoursChange("quietHoursEnabled", value)
              }
            />
          </div>
          {localPrefs.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  value={localPrefs.quietHoursStart || "22:00"}
                  onChange={e =>
                    handleQuietHoursChange("quietHoursStart", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  value={localPrefs.quietHoursEnd || "08:00"}
                  onChange={e =>
                    handleQuietHoursChange("quietHoursEnd", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                />
              </div>
            </div>
          )}
          {localPrefs.quietHoursEnabled && (
            <Button onClick={handleQuietHoursSave} className="w-full mt-2">
              <Save className="w-4 h-4 mr-2" />
              Save Quiet Hours
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Batch Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Notifications</CardTitle>
          <CardDescription>
            Group similar notifications together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Batching</label>
            <Switch
              checked={localPrefs.batchNotifications || false}
              onCheckedChange={value =>
                handleQuietHoursChange("batchNotifications", value)
              }
            />
          </div>
          {localPrefs.batchNotifications && (
            <div>
              <label className="text-sm font-medium">
                Batch Interval (minutes)
              </label>
              <input
                type="range"
                min="15"
                max="1440"
                step="15"
                value={localPrefs.batchInterval || 60}
                onChange={e =>
                  handleQuietHoursChange(
                    "batchInterval",
                    parseInt(e.target.value)
                  )
                }
                className="w-full mt-2"
              />
              <div className="text-sm text-gray-600 mt-2">
                {localPrefs.batchInterval || 60} minutes
              </div>
              <Button onClick={handleBatchSettingsSave} className="w-full mt-2">
                <Save className="w-4 h-4 mr-2" />
                Save Batch Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regulatory Change Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Regulatory Change Alerts
          </CardTitle>
          <CardDescription>
            Get notified when regulations you follow are updated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Enable Regulatory Alerts</label>
            <Switch
              checked={localPrefs?.regulatoryAlertsEnabled || false}
              onCheckedChange={value => {
                setLocalPrefs({ ...localPrefs, regulatoryAlertsEnabled: value });
                handleNotificationTypeChange('regulatoryAlertsEnabled', value);
              }}
            />
          </div>
          
          {localPrefs?.regulatoryAlertsEnabled && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Select regulations to follow:</p>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                {regulations?.regulations?.map((reg: any) => (
                  <div key={reg.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={subscribedRegulations.has(reg.id)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(subscribedRegulations);
                        if (checked) {
                          newSet.add(reg.id);
                        } else {
                          newSet.delete(reg.id);
                        }
                        setSubscribedRegulations(newSet);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reg.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {reg.regulationType || 'Regulation'}
                        </Badge>
                        {reg.celexId && (
                          <span className="text-xs text-gray-500">{reg.celexId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!regulations?.regulations || regulations.regulations.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No regulations available</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  You'll receive alerts when selected regulations are updated, amended, or when new guidance is published.
                </p>
              </div>
              
              <Button 
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }}
                className="w-full"
                disabled={subscribedRegulations.size === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Save Subscriptions ({subscribedRegulations.size} selected)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => resetToDefaults.mutate()}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      {saved && (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
          ✓ Preferences saved successfully
        </div>
      )}
    </div>
  );
}
