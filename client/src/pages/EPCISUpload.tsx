// @ts-nocheck
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
import {
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

/**
 * EPCIS Upload Page
 * Allows users to upload EPCIS documents and view compliance reports
 */

export default function EPCISUpload() {
  const [jsonInput, setJsonInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Generate supply chain map mutation
  const generateMapMutation = trpc.epcis.generateSupplyChainMap.useMutation();

  const uploadMutation = trpc.epcis.uploadEvents.useMutation({
    onSuccess: data => {
      setUploadResult(data);
      setValidationError(null);
      // Automatically generate supply chain map after upload
      generateMapMutation.mutate();
    },
    onError: error => {
      setValidationError(error.message);
      setUploadResult(null);
    },
  });

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      // Basic EPCIS document structure validation
      if (!parsed.type || parsed.type !== "EPCISDocument") {
        setValidationError(
          "Invalid EPCIS document: missing or incorrect 'type' field"
        );
        return false;
      }

      if (!parsed.epcisBody || !parsed.epcisBody.eventList) {
        setValidationError(
          "Invalid EPCIS document: missing 'epcisBody.eventList'"
        );
        return false;
      }

      if (!Array.isArray(parsed.epcisBody.eventList)) {
        setValidationError(
          "Invalid EPCIS document: 'eventList' must be an array"
        );
        return false;
      }

      if (parsed.epcisBody.eventList.length === 0) {
        setValidationError("Invalid EPCIS document: 'eventList' is empty");
        return false;
      }

      // Validate each event has required fields
      for (let i = 0; i < parsed.epcisBody.eventList.length; i++) {
        const event = parsed.epcisBody.eventList[i];
        if (!event.type) {
          setValidationError(`Event ${i + 1}: missing 'type' field`);
          return false;
        }
        if (!event.eventTime) {
          setValidationError(`Event ${i + 1}: missing 'eventTime' field`);
          return false;
        }
      }

      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(`JSON Parse Error: ${(error as Error).message}`);
      return false;
    }
  };

  const handleUpload = () => {
    if (!handleValidate()) return;

    try {
      // Send raw string to backend (supports both JSON and XML)
      uploadMutation.mutate(jsonInput);
    } catch (error) {
      setValidationError(`Upload Error: ${(error as Error).message}`);
    }
  };

  const handleLoadExample = () => {
    const exampleDocument = {
      "@context":
        "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
      type: "EPCISDocument",
      schemaVersion: "2.0",
      creationDate: new Date().toISOString(),
      epcisBody: {
        eventList: [
          {
            type: "ObjectEvent",
            eventTime: "2024-01-15T10:00:00Z",
            eventTimeZoneOffset: "+01:00",
            action: "OBSERVE",
            bizStep: "urn:epcglobal:cbv:bizstep:receiving",
            disposition: "urn:epcglobal:cbv:disp:in_progress",
            readPoint: "urn:epc:id:sgln:4012345.00001.0",
            bizLocation: "urn:epc:id:sgln:4012345.00001.0",
            epcList: ["urn:epc:id:sgtin:4012345.011111.987"],
            sourceList: [
              {
                type: "owning_party",
                source: "urn:epc:id:pgln:4012345.00000",
              },
            ],
          },
          {
            type: "TransformationEvent",
            eventTime: "2024-01-15T14:00:00Z",
            eventTimeZoneOffset: "+01:00",
            bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
            disposition: "urn:epcglobal:cbv:disp:active",
            bizLocation: "urn:epc:id:sgln:4012345.00002.0",
            inputEPCList: ["urn:epc:id:sgtin:4012345.011111.987"],
            outputEPCList: ["urn:epc:id:sgtin:4012345.022222.654"],
          },
        ],
      },
    };

    setJsonInput(JSON.stringify(exampleDocument, null, 2));
    setValidationError(null);
    setUploadResult(null);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">EPCIS Event Upload</h1>
        <p className="text-muted-foreground">
          Upload EPCIS 2.0 documents (JSON or XML) to track supply chain events
          and validate EUDR compliance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: JSON Editor */}
        <Card>
          <CardHeader>
            <CardTitle>EPCIS Document</CardTitle>
            <CardDescription>
              Paste your EPCIS 2.0 document (JSON or XML) below or load an
              example
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleLoadExample} variant="outline" size="sm">
                Load Example
              </Button>
              <Button onClick={handleValidate} variant="outline" size="sm">
                Validate
              </Button>
            </div>

            <textarea
              value={jsonInput}
              onChange={e => {
                setJsonInput(e.target.value);
                setValidationError(null);
                setUploadResult(null);
              }}
              placeholder='{"type": "EPCISDocument", "epcisBody": {"eventList": [...]}}'
              className="w-full h-96 p-4 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {validationError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {!validationError && jsonInput && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  JSON syntax valid. Click "Upload" to process events.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              disabled={!jsonInput || uploadMutation.isPending}
              className="w-full"
              size="lg"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload EPCIS Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Results */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
            <CardDescription>
              View upload status and compliance insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadResult && !uploadMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                <Upload className="h-16 w-16 mb-4 opacity-20" />
                <p>Upload an EPCIS document to see results</p>
              </div>
            )}

            {uploadMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Processing EPCIS events...
                </p>
              </div>
            )}

            {uploadResult && (
              <div className="space-y-6">
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 font-medium">
                    {uploadResult.message}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Events Uploaded
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {uploadResult.eventsUploaded}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        Success
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Next Steps</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>
                        View your events in the{" "}
                        <a
                          href="/epcis/events"
                          className="text-primary hover:underline"
                        >
                          Events Dashboard
                        </a>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>
                        Visualize your supply chain in the{" "}
                        <a
                          href="/epcis/supply-chain"
                          className="text-primary hover:underline"
                        >
                          Supply Chain Map
                        </a>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <span>
                        Check EUDR compliance for your products in the{" "}
                        <a
                          href="/epcis/eudr-map"
                          className="text-primary hover:underline"
                        >
                          EUDR Mapper
                        </a>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documentation Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>EPCIS 2.0 Documentation</CardTitle>
          <CardDescription>
            Learn about EPCIS event types and how to structure your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Supported Event Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  type: "ObjectEvent",
                  desc: "Track individual product movements (receiving, shipping, storing)",
                },
                {
                  type: "AggregationEvent",
                  desc: "Track packaging relationships (items → cases → pallets)",
                },
                {
                  type: "TransactionEvent",
                  desc: "Track business transactions (purchase orders, invoices)",
                },
                {
                  type: "TransformationEvent",
                  desc: "Track manufacturing processes (raw materials → finished goods)",
                },
                {
                  type: "AssociationEvent",
                  desc: "Track associations between objects (pallets → containers)",
                },
              ].map(event => (
                <Card key={event.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{event.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {event.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">EUDR Compliance Requirements</h3>
            <p className="text-sm text-muted-foreground mb-3">
              For EUDR compliance, your EPCIS events must include:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Origin tracking (sourceList with owning_party)</li>
              <li>Business location (bizLocation with GLN)</li>
              <li>Transformation events (manufacturing processes)</li>
              <li>Geolocation data (latitude/longitude of origin)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
