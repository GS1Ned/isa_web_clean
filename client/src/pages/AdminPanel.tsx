import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import { Zap, Database, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Only allow admin users
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-8">
            Admin access required. Please contact the administrator.
          </p>
          <Link
            href="/"
            className="text-accent hover:text-accent/80 transition"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      // Call the seed endpoint
      const response = await fetch("/api/admin/seed-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSeedResult({
          success: true,
          message: `Successfully seeded database with ${data.regulationsCount} regulations, ${data.standardsCount} standards, and ${data.mappingsCount} mappings.`,
        });
        toast.success("Demo data seeded successfully!");
      } else {
        setSeedResult({
          success: false,
          message: "Failed to seed data. Please check the server logs.",
        });
        toast.error("Failed to seed data");
      }
    } catch (error) {
      setSeedResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      toast.error("Error seeding data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ISA</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin Panel</span>
            <Link
              href="/"
              className="text-sm font-medium text-accent hover:text-accent/80 transition"
            >
              Exit
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-accent/5 to-transparent border-b border-border">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Admin Panel
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage ISA demo data and content
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container max-w-2xl">
          {/* User Info */}
          <div className="card-elevated p-6 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Logged In As
            </h2>
            <div className="bg-background rounded p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">
                  {user?.name}
                </span>{" "}
                ({user?.email})
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Role: </span>
                <span className="badge-primary text-xs">{user?.role}</span>
              </p>
            </div>
          </div>

          {/* Seed Data Section */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-foreground">
                Demo Data Management
              </h2>
            </div>

            <div className="bg-background rounded-lg p-6 border border-border mb-6">
              <h3 className="font-semibold text-foreground mb-3">
                Seed Sample Data
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Populate the database with sample CSRD, ESRS, and DPP
                regulations, GS1 standards, and their mappings. This enables the
                demo dashboard to showcase ISA's capabilities.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      6 Sample Regulations
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSRD, ESRS, DPP, EU Taxonomy
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      8 GS1 Standards
                    </p>
                    <p className="text-xs text-muted-foreground">
                      GTIN, EPCIS, Digital Product Passport, etc.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      9 Regulation-to-Standard Mappings
                    </p>
                    <p className="text-xs text-muted-foreground">
                      With relevance scores and mapping reasons
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="w-full bg-gradient-primary text-accent-foreground hover:shadow-lg"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Seed Demo Data
                  </>
                )}
              </Button>
            </div>

            {/* Result Message */}
            {seedResult && (
              <div
                className={`rounded-lg p-4 border ${
                  seedResult.success
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {seedResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        seedResult.success ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {seedResult.success ? "Success" : "Error"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {seedResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-accent/10 border border-accent/20 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  About This Panel
                </h4>
                <p className="text-sm text-muted-foreground">
                  This admin panel is for demonstration purposes. In production,
                  data management would be handled through a more comprehensive
                  CMS with role-based access control, audit logging, and data
                  validation.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-foreground mb-4">Admin Tools</h3>
            <Link
              href="/admin/news"
              className="block p-4 rounded-lg bg-card border border-border hover:border-accent transition"
            >
              <p className="font-medium text-foreground">
                📰 News Administration
              </p>
              <p className="text-sm text-muted-foreground">
                Manually trigger news ingestion and monitor pipeline health
              </p>
            </Link>
            <Link
              href="/dashboard"
              className="block p-4 rounded-lg bg-card border border-border hover:border-accent transition"
            >
              <p className="font-medium text-foreground">View Demo Dashboard</p>
              <p className="text-sm text-muted-foreground">
                See the regulatory mapping explorer
              </p>
            </Link>
            <Link
              href="/"
              className="block p-4 rounded-lg bg-card border border-border hover:border-accent transition"
            >
              <p className="font-medium text-foreground">Return to Home</p>
              <p className="text-sm text-muted-foreground">
                Back to the main landing page
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
