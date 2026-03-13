// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Bell,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Activity,
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

interface ComplianceStatus {
  regulationId: number;
  regulationName: string;
  status: "compliant" | "partial" | "non-compliant" | "unknown";
  score: number;
  lastChecked: string;
  pendingActions: number;
  recentChanges: number;
}

interface Alert {
  id: number;
  type: "change" | "deadline" | "gap" | "update";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
  regulationId?: number;
  isRead: boolean;
}

export default function ComplianceMonitoringDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  
  // Fetch regulations for monitoring
  const { data: regulations, isLoading: regulationsLoading } = trpc.regulation.list.useQuery({
    limit: 100,
  });

  // Mock compliance statuses (in production, this would come from a dedicated API)
  const complianceStatuses: ComplianceStatus[] = [
    {
      regulationId: 1,
      regulationName: "CSRD - Corporate Sustainability Reporting Directive",
      status: "partial",
      score: 72,
      lastChecked: "2026-02-01T10:30:00Z",
      pendingActions: 5,
      recentChanges: 2,
    },
    {
      regulationId: 2,
      regulationName: "EUDR - EU Deforestation Regulation",
      status: "partial",
      score: 58,
      lastChecked: "2026-02-01T10:30:00Z",
      pendingActions: 8,
      recentChanges: 1,
    },
    {
      regulationId: 3,
      regulationName: "ESRS - European Sustainability Reporting Standards",
      status: "partial",
      score: 65,
      lastChecked: "2026-02-01T10:30:00Z",
      pendingActions: 12,
      recentChanges: 3,
    },
    {
      regulationId: 4,
      regulationName: "EU Taxonomy Regulation",
      status: "compliant",
      score: 91,
      lastChecked: "2026-02-01T10:30:00Z",
      pendingActions: 1,
      recentChanges: 0,
    },
    {
      regulationId: 5,
      regulationName: "CBAM - Carbon Border Adjustment Mechanism",
      status: "non-compliant",
      score: 35,
      lastChecked: "2026-02-01T10:30:00Z",
      pendingActions: 15,
      recentChanges: 4,
    },
  ];

  // Mock alerts
  const alerts: Alert[] = [
    {
      id: 1,
      type: "change",
      title: "ESRS E1 Updated",
      description: "New disclosure requirements for Scope 3 emissions added to ESRS E1-6",
      severity: "high",
      timestamp: "2026-02-01T09:00:00Z",
      regulationId: 3,
      isRead: false,
    },
    {
      id: 2,
      type: "deadline",
      title: "CSRD Reporting Deadline",
      description: "First CSRD report due in 45 days for large companies",
      severity: "high",
      timestamp: "2026-01-31T14:00:00Z",
      regulationId: 1,
      isRead: false,
    },
    {
      id: 3,
      type: "gap",
      title: "New Gap Detected",
      description: "Missing biodiversity impact assessment for EUDR compliance",
      severity: "medium",
      timestamp: "2026-01-30T11:00:00Z",
      regulationId: 2,
      isRead: true,
    },
    {
      id: 4,
      type: "update",
      title: "CBAM Phase 2 Guidance",
      description: "European Commission released implementation guidance for CBAM Phase 2",
      severity: "medium",
      timestamp: "2026-01-29T16:00:00Z",
      regulationId: 5,
      isRead: true,
    },
  ];

  // Calculate overall metrics
  const overallScore = Math.round(
    complianceStatuses.reduce((sum, s) => sum + s.score, 0) / complianceStatuses.length
  );
  const totalPendingActions = complianceStatuses.reduce((sum, s) => sum + s.pendingActions, 0);
  const totalRecentChanges = complianceStatuses.reduce((sum, s) => sum + s.recentChanges, 0);
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const getStatusColor = (status: ComplianceStatus["status"]) => {
    switch (status) {
      case "compliant": return "bg-green-500";
      case "partial": return "bg-yellow-500";
      case "non-compliant": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: ComplianceStatus["status"]) => {
    switch (status) {
      case "compliant": return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case "partial": return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case "non-compliant": return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-500";
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "change": return <FileText className="h-4 w-4" />;
      case "deadline": return <Clock className="h-4 w-4" />;
      case "gap": return <AlertTriangle className="h-4 w-4" />;
      case "update": return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Compliance Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time tracking of your regulatory compliance status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/tools/ai-gap-analysis">
            <Button size="sm">
              <Target className="h-4 w-4 mr-2" />
              Run Gap Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{overallScore}%</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5% vs last month
              </div>
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{totalPendingActions}</div>
              <div className="flex items-center text-red-500 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                +3 new this week
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Actions required across all regulations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{totalRecentChanges}</div>
              <Badge variant="secondary">{selectedTimeRange}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Regulatory updates detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{unreadAlerts}</div>
              {unreadAlerts > 0 && (
                <Badge variant="destructive">Action Required</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Alerts requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Compliance Status
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
            {unreadAlerts > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Deadlines
          </TabsTrigger>
        </TabsList>

        {/* Compliance Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulation Compliance Status</CardTitle>
              <CardDescription>
                Monitor your compliance status across all tracked regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStatuses.map((status) => (
                  <div
                    key={status.regulationId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
                      <div>
                        <h3 className="font-medium">{status.regulationName}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Score: {status.score}%</span>
                          <span>•</span>
                          <span>{status.pendingActions} pending actions</span>
                          {status.recentChanges > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-orange-500">{status.recentChanges} recent changes</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(status.status)}
                      <Link href={`/hub/regulations/${status.regulationId}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Stay informed about regulatory changes and compliance updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg ${
                      !alert.isRead ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <div className={`mt-1 ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        {!alert.isRead && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Trends</CardTitle>
                  <CardDescription>
                    Track your compliance progress over time
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {(["7d", "30d", "90d"] as const).map((range) => (
                    <Button
                      key={range}
                      variant={selectedTimeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Compliance trend visualization</p>
                  <p className="text-sm">Connect to analytics API for real-time data</p>
                </div>
              </div>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">+12%</div>
                  <div className="text-sm text-muted-foreground">CSRD Progress</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">+5%</div>
                  <div className="text-sm text-muted-foreground">EUDR Progress</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">+8%</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Important compliance deadlines and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: "2026-03-15",
                    title: "CSRD First Report Due",
                    regulation: "CSRD",
                    daysLeft: 42,
                    priority: "high",
                  },
                  {
                    date: "2026-06-30",
                    title: "EUDR Due Diligence Statement",
                    regulation: "EUDR",
                    daysLeft: 149,
                    priority: "medium",
                  },
                  {
                    date: "2026-09-01",
                    title: "CBAM Phase 2 Compliance",
                    regulation: "CBAM",
                    daysLeft: 212,
                    priority: "medium",
                  },
                  {
                    date: "2026-12-31",
                    title: "EU Taxonomy Alignment Report",
                    regulation: "EU Taxonomy",
                    daysLeft: 333,
                    priority: "low",
                  },
                ].map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold">{deadline.daysLeft}</div>
                        <div className="text-xs text-muted-foreground">days left</div>
                      </div>
                      <div>
                        <h3 className="font-medium">{deadline.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{deadline.regulation}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(deadline.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        deadline.priority === "high"
                          ? "destructive"
                          : deadline.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {deadline.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions to improve your compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/tools/ai-gap-analysis">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Target className="h-6 w-6" />
                <span>Run Gap Analysis</span>
              </Button>
            </Link>
            <Link href="/tools/compliance-checklist">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <span>Generate Checklist</span>
              </Button>
            </Link>
            <Link href="/ask">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Ask ISA</span>
              </Button>
            </Link>
            <Link href="/notification-preferences">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Bell className="h-6 w-6" />
                <span>Manage Alerts</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
