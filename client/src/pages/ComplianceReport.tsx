import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
} from "lucide-react";

export default function ComplianceReport() {
  const [report, setReport] = useState<any>(null);

  const generateReportMutation =
    trpc.epcis.generateComplianceReport.useMutation({
      onSuccess: data => {
        setReport(data);
      },
    });

  const handleGenerateReport = () => {
    setReport(null);
    generateReportMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500";
      case "at-risk":
        return "bg-yellow-500";
      case "non-compliant":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">EUDR Compliance Report</h1>
        <p className="text-muted-foreground">
          Generate comprehensive compliance reports analyzing your supply chain
          data against EUDR requirements
        </p>
      </div>

      {/* Generate Report Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Compliance Report</CardTitle>
          <CardDescription>
            Analyze your uploaded EPCIS events and geolocation data for EUDR
            compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              {generateReportMutation.isPending
                ? "Generating Report..."
                : "Generate Report"}
            </Button>

            {report && (
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
            )}
          </div>

          {generateReportMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                Error generating report: {generateReportMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Report Display */}
      {report && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-5xl font-bold mb-2">
                    {report.overallScore}/100
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Products
                  </div>
                  <div className="text-3xl font-bold">
                    {report.statistics.totalProducts}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">{report.summary}</p>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Products with Geolocation
                  </div>
                  <div className="text-2xl font-bold">
                    {report.statistics.productsWithGeolocation}/
                    {report.statistics.totalProducts}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(
                      (report.statistics.productsWithGeolocation /
                        report.statistics.totalProducts) *
                      100
                    ).toFixed(1)}
                    % coverage
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Products in Risk Zones
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {report.statistics.productsInRiskZones}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Require enhanced due diligence
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Due Diligence Statements
                  </div>
                  <div className="text-2xl font-bold">
                    {report.statistics.productsWithDueDiligence}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(
                      (report.statistics.productsWithDueDiligence /
                        Math.max(
                          report.statistics.productsWithGeolocation,
                          1
                        )) *
                      100
                    ).toFixed(1)}
                    % of geolocated products
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Findings</CardTitle>
              <CardDescription>
                Compliance assessment across key EUDR requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.findings.map((finding: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(finding.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{finding.category}</h3>
                          <Badge
                            variant={
                              finding.status === "pass"
                                ? "default"
                                : finding.status === "warning"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {finding.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{finding.message}</p>
                        {finding.details && (
                          <p className="text-sm text-muted-foreground">
                            {finding.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Actionable Recommendations</CardTitle>
              <CardDescription>
                Steps to improve your EUDR compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Report State */}
      {!report && !generateReportMutation.isPending && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
            <p className="text-muted-foreground mb-4">
              Click "Generate Report" to analyze your supply chain data for EUDR
              compliance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
