import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Scan,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,

  Hash,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

export default function BarcodeScanner() {
  const [gtin, setGtin] = useState("");
  const [scannedGtin, setScannedGtin] = useState<string | null>(null);

  const {
    data: events,
    isLoading,
    error,
  } = trpc.epcis.getEvents.useQuery({ limit: 100 }, { enabled: !!scannedGtin });

  const handleScan = () => {
    if (gtin.trim()) {
      setScannedGtin(gtin.trim());
    }
  };

  const handleReset = () => {
    setGtin("");
    setScannedGtin(null);
  };

  // Filter events by GTIN
  const matchingEvents =
    events?.events.filter(event => {
      const epcList = event.epcList;
      if (!Array.isArray(epcList)) return false;
      return epcList.some((epc: string) => epc.includes(scannedGtin || ""));
    }) || [];

  const traceabilityStatus =
    matchingEvents.length > 0 ? "compliant" : scannedGtin ? "missing" : null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "compliant":
        return "bg-green-500";
      case "incomplete":
        return "bg-yellow-500";
      case "missing":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="w-5 h-5" />;
      case "incomplete":
        return <AlertTriangle className="w-5 h-5" />;
      case "missing":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Scan className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "compliant":
        return "Fully Traceable";
      case "incomplete":
        return "Partial Traceability";
      case "missing":
        return "No Traceability Data";
      default:
        return "Ready to Scan";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                GS1 Barcode Scanner
              </h1>
              <p className="text-muted-foreground mt-1">
                Scan product barcodes to verify EPCIS traceability compliance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Scanner Input */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scan className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">
                    Enter Product GTIN
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter a 14-digit Global Trade Item Number (GTIN) to check
                    traceability status. Example: 00123456789012
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter GTIN (14 digits)"
                      value={gtin}
                      onChange={e => setGtin(e.target.value)}
                      onKeyPress={e => e.key === "Enter" && handleScan()}
                      maxLength={14}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleScan}
                      disabled={!gtin.trim() || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4 mr-2" />
                          Scan
                        </>
                      )}
                    </Button>
                    {scannedGtin && (
                      <Button variant="outline" onClick={handleReset}>
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Status Result */}
          {scannedGtin && !isLoading && (
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-lg ${getStatusColor(traceabilityStatus)} flex items-center justify-center flex-shrink-0 text-white`}
                >
                  {getStatusIcon(traceabilityStatus)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">
                      {getStatusLabel(traceabilityStatus)}
                    </h3>
                    <Badge className={getStatusColor(traceabilityStatus)}>
                      {traceabilityStatus?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">GTIN:</span>
                      <span className="font-mono font-medium">
                        {scannedGtin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        EPCIS Events Found:
                      </span>
                      <span className="font-medium">
                        {matchingEvents.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Traceability Details */}
          {scannedGtin && matchingEvents.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Traceability Events
              </h3>
              <div className="space-y-3">
                {matchingEvents.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {event.eventType}
                        </Badge>
                        <div className="text-sm font-medium">
                          {event.bizStep || "No business step"}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.eventTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {event.readPoint && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.readPoint}</span>
                        </div>
                      )}
                      {event.disposition && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{event.disposition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {matchingEvents.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    + {matchingEvents.length - 5} more events
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/epcis/supply-chain">
                  <a>
                    <Button variant="outline" size="sm">
                      View Supply Chain Graph
                    </Button>
                  </a>
                </Link>
                <Link href="/epcis/eudr-map">
                  <a>
                    <Button variant="outline" size="sm">
                      View EUDR Map
                    </Button>
                  </a>
                </Link>
              </div>
            </Card>
          )}

          {/* No Data Found */}
          {scannedGtin && matchingEvents.length === 0 && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">
                      No traceability data found for this GTIN
                    </span>
                  </div>
                  <div className="text-sm">
                    This product does not have any EPCIS events recorded in the
                    system. To enable traceability:
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    <li>Upload EPCIS documents containing this GTIN</li>
                    <li>Ensure suppliers are recording supply chain events</li>
                    <li>Verify the GTIN is correctly formatted (14 digits)</li>
                  </ul>
                  <div className="mt-4">
                    <Link href="/epcis/upload">
                      <a>
                        <Button size="sm">Upload EPCIS Events</Button>
                      </a>
                    </Link>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span>Error loading traceability data: {error.message}</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Card */}
          <Card className="p-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-3">About GS1 GTINs</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                A Global Trade Item Number (GTIN) is a unique identifier for
                products used worldwide. GTINs are encoded in barcodes and
                enable supply chain traceability.
              </p>
              <p>
                <strong>Supported formats:</strong> GTIN-14, GTIN-13, GTIN-12,
                GTIN-8 (padded to 14 digits)
              </p>
              <p>
                <strong>
                  Example GTINs to try (after seeding sample data):
                </strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  00123456789012 - Coffee from Brazil (Rainforest Alliance)
                </li>
                <li>00234567890123 - Cocoa from Ghana (Fairtrade)</li>
                <li>00345678901234 - Palm Oil from Indonesia (RSPO)</li>
                <li>00456789012345 - Timber from Sweden (FSC Certified)</li>
                <li>00567890123456 - Soy from Brazil (Organic)</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
