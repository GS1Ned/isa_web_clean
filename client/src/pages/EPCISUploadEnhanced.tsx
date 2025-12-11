import { useState, useRef } from "react";
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
  FileJson,
  FileText,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Enhanced EPCIS Upload Page
 * Supports file drag-and-drop, format auto-detection, and compliance analysis
 */

export default function EPCISUploadEnhanced() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<"json" | "xml" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  /**
   * Detect file format (JSON or XML)
   */
  const detectFormat = (content: string): "json" | "xml" | null => {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return "json";
    } else if (trimmed.startsWith("<")) {
      return "xml";
    }
    return null;
  };

  /**
   * Validate EPCIS document structure
   */
  const validateEPCISDocument = (
    content: string,
    format: "json" | "xml"
  ): boolean => {
    try {
      if (format === "json") {
        const parsed = JSON.parse(content);

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
      } else if (format === "xml") {
        // Basic XML validation
        if (
          !content.includes("<EPCISDocument") &&
          !content.includes("<epcisDocument")
        ) {
          setValidationError(
            "Invalid EPCIS XML: missing EPCISDocument root element"
          );
          return false;
        }
        if (!content.includes("eventList") && !content.includes("EventList")) {
          setValidationError("Invalid EPCIS XML: missing eventList element");
          return false;
        }
      }

      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(`Validation Error: ${(error as Error).message}`);
      return false;
    }
  };

  /**
   * Handle file selection (from input or drag-drop)
   */
  const handleFileSelect = async (file: File) => {
    try {
      const content = await file.text();
      const format = detectFormat(content);

      if (!format) {
        setValidationError(
          "Unable to detect file format. Please use JSON or XML."
        );
        return;
      }

      setFileContent(content);
      setFileName(file.name);
      setFileFormat(format);
      setValidationError(null);
      setUploadResult(null);
    } catch (error) {
      setValidationError(`File Read Error: ${(error as Error).message}`);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file.type === "application/json" ||
        file.type === "text/xml" ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".xml")
      ) {
        handleFileSelect(file);
      } else {
        setValidationError("Please upload a JSON or XML file");
      }
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handle upload
   */
  const handleUpload = () => {
    if (!fileContent || !fileFormat) {
      setValidationError("Please select a file first");
      return;
    }

    if (!validateEPCISDocument(fileContent, fileFormat)) {
      return;
    }

    uploadMutation.mutate(fileContent);
  };

  /**
   * Load example document
   */
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

    setFileContent(JSON.stringify(exampleDocument, null, 2));
    setFileName("example.json");
    setFileFormat("json");
    setValidationError(null);
    setUploadResult(null);
  };

  /**
   * Clear all inputs
   */
  const handleClear = () => {
    setFileContent("");
    setFileName(null);
    setFileFormat(null);
    setValidationError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to upload EPCIS documents
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
        {/* Left Column: File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload EPCIS Document</CardTitle>
            <CardDescription>
              Drag and drop a file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.xml"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-2">
                {fileFormat === "json" ? (
                  <FileJson className="h-12 w-12 text-blue-500" />
                ) : fileFormat === "xml" ? (
                  <FileText className="h-12 w-12 text-orange-500" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold">
                    {fileName
                      ? `${fileName}`
                      : "Drop file here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {fileName
                      ? `Format: ${fileFormat?.toUpperCase()}`
                      : "JSON or XML files"}
                  </p>
                </div>
              </div>
            </div>

            {/* File Info */}
            {fileName && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  File loaded: {fileName} ({fileFormat?.toUpperCase()})
                </AlertDescription>
              </Alert>
            )}

            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleLoadExample} variant="outline" size="sm">
                Load Example
              </Button>
              {fileContent && (
                <Button onClick={handleClear} variant="outline" size="sm">
                  Clear
                </Button>
              )}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!fileContent || uploadMutation.isPending}
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
                  Upload & Analyze
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Results */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              View upload status and compliance insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadResult && !uploadMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                <Upload className="h-16 w-16 mb-4 opacity-20" />
                <p>Upload an EPCIS document to see analysis results</p>
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
    </div>
  );
}
