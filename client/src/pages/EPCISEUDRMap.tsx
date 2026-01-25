import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons for risk levels
const createRiskIcon = (riskLevel: string) => {
  const colors = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${colors[riskLevel as keyof typeof colors]}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function EPCISEUDRMap() {
  const [selectedRisk, setSelectedRisk] = useState<
    "low" | "medium" | "high" | undefined
  >();
  const [selectedGtin, _setSelectedGtin] = useState<string | undefined>();

  const { data, isLoading, error } = trpc.epcis.getEUDRGeolocations.useQuery({
    riskLevel: selectedRisk,
    productGtin: selectedGtin,
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const _getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "high":
        return <XCircle className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Compliant";
      case "medium":
        return "At Risk";
      case "high":
        return "Non-Compliant";
      default:
        return "Unknown";
    }
  };

  // Calculate center of all markers
  const center: [number, number] = data?.geolocations.length
    ? [
        data.geolocations.reduce((sum, g) => sum + g.lat, 0) /
          data.geolocations.length,
        data.geolocations.reduce((sum, g) => sum + g.lng, 0) /
          data.geolocations.length,
      ]
    : [51.5074, -0.1278]; // Default to London

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                EUDR Geolocation Map
              </h1>
              <p className="text-muted-foreground mt-1">
                Product origins and deforestation risk assessment
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedRisk === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk(undefined)}
              >
                All Locations
              </Button>
              <Button
                variant={selectedRisk === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk("low")}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Compliant
              </Button>
              <Button
                variant={selectedRisk === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk("medium")}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                At Risk
              </Button>
              <Button
                variant={selectedRisk === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRisk("high")}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Non-Compliant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Statistics Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Overview</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-sm text-destructive">
                  Error loading data
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {data?.totalCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Locations
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Compliant</span>
                      </div>
                      <span className="text-sm font-medium">
                        {data?.geolocations.filter(g => g.riskLevel === "low")
                          .length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">At Risk</span>
                      </div>
                      <span className="text-sm font-medium">
                        {data?.geolocations.filter(
                          g => g.riskLevel === "medium"
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Non-Compliant</span>
                      </div>
                      <span className="text-sm font-medium">
                        {data?.geolocations.filter(g => g.riskLevel === "high")
                          .length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Legend */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Legend</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-md flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Compliant</div>
                    <div className="text-xs text-muted-foreground">
                      Low deforestation risk, due diligence complete
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow-md flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">At Risk</div>
                    <div className="text-xs text-muted-foreground">
                      Medium risk, additional verification needed
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-md flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Non-Compliant</div>
                    <div className="text-xs text-muted-foreground">
                      High risk, immediate action required
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden" style={{ height: "600px" }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <XCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Error loading map data
                    </div>
                  </div>
                </div>
              ) : data?.geolocations.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">
                      No geolocation data available
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Upload EPCIS events with geolocation data to see them on
                      the map
                    </div>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={center}
                  zoom={4}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {data?.geolocations.map(location => (
                    <>
                      <Marker
                        key={location.id}
                        position={[location.lat, location.lng]}
                        icon={createRiskIcon(location.riskLevel)}
                      >
                        <Popup>
                          <div className="p-2">
                            <div className="font-semibold mb-2">
                              Product: {location.productGtin}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getRiskColor(location.riskLevel)}
                                >
                                  {getRiskLabel(location.riskLevel)}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground">
                                Lat: {location.lat.toFixed(6)}, Lng:{" "}
                                {location.lng.toFixed(6)}
                              </div>
                              {location.riskAssessmentDate && (
                                <div className="text-muted-foreground text-xs">
                                  Assessed:{" "}
                                  {new Date(
                                    location.riskAssessmentDate
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                      {location.geofence && (
                        <Circle
                          key={`circle-${location.id}`}
                          center={[location.lat, location.lng]}
                          radius={5000}
                          pathOptions={{
                            color:
                              location.riskLevel === "high"
                                ? "#ef4444"
                                : location.riskLevel === "medium"
                                  ? "#f59e0b"
                                  : "#22c55e",
                            fillColor:
                              location.riskLevel === "high"
                                ? "#ef4444"
                                : location.riskLevel === "medium"
                                  ? "#f59e0b"
                                  : "#22c55e",
                            fillOpacity: 0.1,
                          }}
                        />
                      )}
                    </>
                  ))}
                </MapContainer>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
