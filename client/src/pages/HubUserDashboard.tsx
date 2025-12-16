import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Bookmark,
  Trash2,
  Edit2,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const SAMPLE_SAVED_REGULATIONS = [
  {
    id: 1,
    title: "CSRD - Corporate Sustainability Reporting Directive",
    status: "ACTIVE",
    effectiveDate: "Jan 1, 2024",
    savedDate: "Nov 20, 2024",
    alertsEnabled: true,
  },
  {
    id: 2,
    title: "EUDR - EU Deforestation Regulation",
    status: "TRANSITIONAL",
    effectiveDate: "Dec 30, 2024",
    savedDate: "Nov 15, 2024",
    alertsEnabled: true,
  },
  {
    id: 3,
    title: "Digital Product Passport (DPP)",
    status: "TRANSITIONAL",
    effectiveDate: "Jan 1, 2026",
    savedDate: "Nov 10, 2024",
    alertsEnabled: false,
  },
];

const SAMPLE_ALERTS = [
  {
    id: 1,
    type: "DEADLINE",
    regulation: "EUDR",
    title: "EUDR Implementation Deadline in 2 Days",
    message:
      "Companies must implement due diligence systems for deforestation-free commodities.",
    date: "Nov 28, 2024",
    read: false,
  },
  {
    id: 2,
    type: "UPDATE",
    regulation: "CSRD",
    title: "New CSRD Implementation Guidance Published",
    message:
      "EFRAG releases comprehensive guidance on CSRD reporting requirements.",
    date: "Nov 25, 2024",
    read: false,
  },
  {
    id: 3,
    type: "ENFORCEMENT",
    regulation: "EUDR",
    title: "First EUDR Enforcement Actions Announced",
    message:
      "Customs authorities begin enforcement of EUDR due diligence requirements.",
    date: "Nov 20, 2024",
    read: true,
  },
];

export default function HubUserDashboard() {
  const { user, loading } = useAuth();
  const [_location] = useLocation();
  const [savedRegulations, setSavedRegulations] = useState(
    SAMPLE_SAVED_REGULATIONS
  );
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const [activeTab, setActiveTab] = useState<"alerts" | "saved">("alerts");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sign In Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your personalized regulatory dashboard and
            alerts.
          </p>
          <Link href="/">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const markAlertAsRead = (id: number) => {
    setAlerts(
      alerts.map(alert => (alert.id === id ? { ...alert, read: true } : alert))
    );
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleAlerts = (id: number) => {
    setSavedRegulations(
      savedRegulations.map(reg =>
        reg.id === id ? { ...reg, alertsEnabled: !reg.alertsEnabled } : reg
      )
    );
  };

  const removeSavedRegulation = (id: number) => {
    setSavedRegulations(savedRegulations.filter(reg => reg.id !== id));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/hub"
            className="text-accent hover:text-accent/80 transition font-medium"
          >
            ← Back to Hub
          </Link>
          <h1 className="text-lg font-bold text-foreground">My Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Welcome, {user.name}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Your Regulatory Dashboard
            </h2>
            <p className="text-muted-foreground">
              Track saved regulations, manage alerts, and stay updated on
              compliance deadlines.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Saved Regulations
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {savedRegulations.length}
                  </p>
                </div>
                <Bookmark className="w-8 h-8 text-accent opacity-50" />
              </div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Unread Alerts
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {unreadCount}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-accent opacity-50" />
              </div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Alerts Enabled
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {savedRegulations.filter(r => r.alertsEnabled).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-accent opacity-50" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                activeTab === "alerts"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Alerts ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                activeTab === "saved"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className="w-4 h-4 inline mr-2" />
              Saved Regulations
            </button>
          </div>

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No alerts at this time.
                  </p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`card-elevated p-6 transition ${alert.read ? "opacity-75" : "border-accent/50"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {alert.type === "DEADLINE" && (
                          <Calendar className="w-5 h-5 text-orange-600" />
                        )}
                        {alert.type === "UPDATE" && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {alert.type === "ENFORCEMENT" && (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {alert.regulation}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {alert.date}
                          </span>
                          {!alert.read && (
                            <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                          )}
                        </div>

                        <h3 className="font-semibold text-foreground mb-1">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {!alert.read && (
                          <button
                            onClick={() => markAlertAsRead(alert.id)}
                            className="p-2 hover:bg-card rounded-lg transition"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 hover:bg-card rounded-lg transition"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Saved Regulations Tab */}
          {activeTab === "saved" && (
            <div className="space-y-4">
              {savedRegulations.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No saved regulations yet.
                  </p>
                  <Link href="/hub/regulations">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Explore Regulations
                    </Button>
                  </Link>
                </div>
              ) : (
                savedRegulations.map(reg => (
                  <div
                    key={reg.id}
                    className="card-elevated p-6 hover:border-accent transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {reg.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {reg.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Effective: {reg.effectiveDate}</span>
                          </div>
                          <div>Saved: {reg.savedDate}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleAlerts(reg.id)}
                          className={`p-2 rounded-lg transition ${
                            reg.alertsEnabled
                              ? "bg-accent/10 text-accent"
                              : "bg-card text-muted-foreground hover:bg-card/80"
                          }`}
                          title={
                            reg.alertsEnabled
                              ? "Alerts enabled"
                              : "Alerts disabled"
                          }
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-card rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => removeSavedRegulation(reg.id)}
                          className="p-2 hover:bg-card rounded-lg transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect - ESG Regulations Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
