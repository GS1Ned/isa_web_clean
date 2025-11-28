import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, CheckCircle, AlertTriangle, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function AdminEUDRSeeder() {
  const [result, setResult] = useState<any>(null);
  
  const seedMutation = trpc.epcis.seedEUDRSampleData.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      setResult({ success: false, error: error.message });
    },
  });

  const handleSeed = () => {
    setResult(null);
    seedMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">EUDR Sample Data Seeder</h1>
              <p className="text-muted-foreground mt-1">
                Populate EUDR geolocation data for demonstration purposes
              </p>
            </div>
            <Link href="/admin">
              <a>
                <Button variant="outline">Back to Admin</Button>
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overview */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">Sample Dataset Overview</h2>
                <p className="text-muted-foreground mb-4">
                  This seeder will populate your EUDR geolocation database with 12 realistic product origins
                  representing various commodities and risk levels. Perfect for demonstrating the EUDR mapping
                  capabilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">4 Compliant locations (Low risk)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">3 At-risk locations (Medium risk)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm">5 Non-compliant locations (High risk)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Commodities included:</div>
                    <div className="text-sm text-muted-foreground">
                      Coffee (Brazil), Cocoa (Ghana, Ivory Coast), Palm Oil (Indonesia),
                      Timber (Myanmar, Sweden), Soy (Brazil), Cattle (Brazil)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Sample Data Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">What will be seeded:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Certified Products (4)</div>
                  <div className="text-xs text-muted-foreground">
                    Rainforest Alliance coffee, FSC timber, RSPO palm oil, EU Organic soy
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Monitoring Required (3)</div>
                  <div className="text-xs text-muted-foreground">
                    Fairtrade cocoa with expansion detected, Cerrado soy conversion monitoring
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">High Risk - Action Required (5)</div>
                  <div className="text-xs text-muted-foreground">
                    Amazon deforestation hotspots, peatland conversion, illegal logging areas
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Seed Action */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Ready to seed data?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will add 12 sample EUDR geolocation records to your database
                </p>
              </div>
              <Button
                onClick={handleSeed}
                disabled={seedMutation.isPending}
                size="lg"
              >
                {seedMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Seed Sample Data
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Result */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{result.message}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Inserted: {result.inserted} | Errors: {result.errors} | Total: {result.total}
                    </div>
                    <div className="mt-4">
                      <Link href="/epcis/eudr-map">
                        <a>
                          <Button variant="outline" size="sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            View EUDR Map
                          </Button>
                        </a>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Error: {result.error || "Failed to seed data"}</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Next Steps */}
          <Card className="p-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-3">After seeding:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Navigate to the EUDR Map to see the populated geolocation data</li>
              <li>Use the filter buttons to view different risk levels</li>
              <li>Click on markers to see detailed due diligence information</li>
              <li>Observe geofence overlays for high-risk areas</li>
              <li>Use this data to demonstrate compliance workflows to stakeholders</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
