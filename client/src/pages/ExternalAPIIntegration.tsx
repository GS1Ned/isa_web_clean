import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Key,
  Code,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Terminal,
  FileJson,
  Webhook,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  permissions: string[];
  rateLimit: number;
  isActive: boolean;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastDelivery: string | null;
  successRate: number;
}

export default function ExternalAPIIntegration() {
  const [activeTab, setActiveTab] = useState("documentation");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");

  // Mock data - in production this would come from the API
  const [apiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production Integration",
      key: "isa_live_sk_1234567890abcdef",
      createdAt: "2026-01-15",
      lastUsed: "2026-02-01",
      permissions: ["ask-isa", "regulations", "standards"],
      rateLimit: 1000,
      isActive: true,
    },
    {
      id: "2",
      name: "Development Testing",
      key: "isa_test_sk_0987654321fedcba",
      createdAt: "2026-01-20",
      lastUsed: null,
      permissions: ["ask-isa"],
      rateLimit: 100,
      isActive: true,
    },
  ]);

  const [webhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/xxx",
      events: ["regulatory.change", "compliance.alert"],
      isActive: true,
      lastDelivery: "2026-02-01T10:30:00Z",
      successRate: 98.5,
    },
    {
      id: "2",
      name: "Teams Integration",
      url: "https://outlook.office.com/webhook/xxx",
      events: ["compliance.alert"],
      isActive: false,
      lastDelivery: "2026-01-28T14:20:00Z",
      successRate: 95.2,
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    askIsa: `// Ask ISA API - Query compliance questions
const response = await fetch('https://api.isa.gs1.nl/v1/ask', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: "What CSRD requirements apply to retail companies?",
    context: {
      sector: "retail",
      companySize: "large"
    }
  })
});

const data = await response.json();
console.log(data.answer);
console.log(data.sources);`,

    regulations: `// Get Regulations API
const response = await fetch('https://api.isa.gs1.nl/v1/regulations', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const regulations = await response.json();
// Returns array of EU regulations with ESRS mappings`,

    complianceStatus: `// Compliance Status API
const response = await fetch('https://api.isa.gs1.nl/v1/compliance/status', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    organizationId: "your-org-id",
    regulations: ["CSRD", "EUDR", "DPP"]
  })
});

const status = await response.json();
// Returns compliance gaps and recommendations`,

    webhook: `// Webhook Payload Example
{
  "event": "regulatory.change",
  "timestamp": "2026-02-01T10:30:00Z",
  "data": {
    "regulationId": "csrd",
    "changeType": "amendment",
    "summary": "New disclosure requirements added",
    "impactLevel": "HIGH",
    "effectiveDate": "2026-06-01"
  }
}`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">External API Integration</h1>
        <p className="text-gray-600">
          Integrate ISA capabilities into your applications with our REST API and webhooks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documentation">
            <Code className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Activity className="h-4 w-4 mr-2" />
            Usage
          </TabsTrigger>
        </TabsList>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                API Overview
              </CardTitle>
              <CardDescription>
                Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://api.isa.gs1.nl/v1</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600">
                    All API requests require a Bearer token in the Authorization header.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Rate Limits</h4>
                  <p className="text-sm text-gray-600">
                    Default: 1000 requests/hour. Contact us for higher limits.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Response Format</h4>
                  <p className="text-sm text-gray-600">
                    All responses are JSON with consistent error handling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ask ISA Endpoint */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge className="bg-green-100 text-green-800 mr-2">POST</Badge>
                    <code className="font-mono">/ask</code>
                  </div>
                  <Badge variant="outline">Ask ISA</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Query ISA with natural language questions about EU sustainability regulations and GS1 standards.
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(codeExamples.askIsa, "askIsa")}
                  >
                    {copiedCode === "askIsa" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-sm overflow-x-auto">{codeExamples.askIsa}</pre>
                </div>
              </div>

              {/* Regulations Endpoint */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 mr-2">GET</Badge>
                    <code className="font-mono">/regulations</code>
                  </div>
                  <Badge variant="outline">Regulations</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Retrieve all EU regulations with their ESRS datapoint mappings and GS1 standard relationships.
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(codeExamples.regulations, "regulations")}
                  >
                    {copiedCode === "regulations" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-sm overflow-x-auto">{codeExamples.regulations}</pre>
                </div>
              </div>

              {/* Compliance Status Endpoint */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge className="bg-green-100 text-green-800 mr-2">POST</Badge>
                    <code className="font-mono">/compliance/status</code>
                  </div>
                  <Badge variant="outline">Compliance</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get compliance status for your organization across multiple regulations.
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(codeExamples.complianceStatus, "complianceStatus")}
                  >
                    {copiedCode === "complianceStatus" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-sm overflow-x-auto">{codeExamples.complianceStatus}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Key */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="keyName">New API Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button>
                    <Key className="h-4 w-4 mr-2" />
                    Generate Key
                  </Button>
                </div>
              </div>

              {/* Existing Keys */}
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <p className="text-sm text-gray-500">Created: {apiKey.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={apiKey.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch checked={apiKey.isActive} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono text-sm">
                        {showApiKey[apiKey.id] ? apiKey.key : "•".repeat(32)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey({ ...showApiKey, [apiKey.id]: !showApiKey[apiKey.id] })}
                      >
                        {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key, `key-${apiKey.id}`)}
                      >
                        {copiedCode === `key-${apiKey.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-gray-500">
                          <Shield className="h-4 w-4 inline mr-1" />
                          Permissions: {apiKey.permissions.join(", ")}
                        </span>
                        <span className="text-gray-500">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Rate limit: {apiKey.rateLimit}/hour
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Rotate
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Receive real-time notifications for regulatory changes and compliance alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Webhook Payload Example */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  Webhook Payload Example
                </h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(codeExamples.webhook, "webhook")}
                  >
                    {copiedCode === "webhook" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-sm overflow-x-auto">{codeExamples.webhook}</pre>
                </div>
              </div>

              {/* Existing Webhooks */}
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{webhook.name}</h4>
                        <code className="text-sm text-gray-500">{webhook.url}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={webhook.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {webhook.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch checked={webhook.isActive} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-gray-500">
                          Events: {webhook.events.join(", ")}
                        </span>
                        <span className="text-gray-500">
                          Success rate: {webhook.successRate}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Test
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Webhook */}
              <Button className="w-full" variant="outline">
                <Webhook className="h-4 w-4 mr-2" />
                Add New Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-gray-500">API Calls Today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">98.5%</p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">245ms</p>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">42</p>
                  <p className="text-sm text-gray-500">Webhooks Delivered</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Usage by Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">POST</Badge>
                    <code>/ask</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">847 calls</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-full bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                    <code>/regulations</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">312 calls</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/3 h-full bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">POST</Badge>
                    <code>/compliance/status</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">88 calls</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/12 h-full bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Rate Limit Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Production Integration</span>
                    <span className="text-sm text-gray-500">847 / 1000 requests</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div className="w-[85%] h-full bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Resets in 23 minutes</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Development Testing</span>
                    <span className="text-sm text-gray-500">12 / 100 requests</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div className="w-[12%] h-full bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Resets in 23 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
