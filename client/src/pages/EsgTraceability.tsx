/**
 * ESG Regulatory Traceability View
 * 
 * Read-only UI for viewing EU ESG to GS1 mapping traceability chains.
 * 
 * GOVERNANCE:
 * - No narrative claims
 * - Every GS1 reference links to traceability chain
 * - Explicit exclusions remain visible
 * - GS1 is never legally required
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, AlertTriangle, CheckCircle2, CircleDot, XCircle } from "lucide-react";

// GS1 relevance indicator component
function RelevanceIndicator({ strength }: { strength: string }) {
  switch (strength) {
    case "strong":
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Strong</Badge>;
    case "partial":
      return <Badge variant="secondary" className="bg-yellow-600"><CircleDot className="w-3 h-3 mr-1" />Partial</Badge>;
    default:
      return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />None</Badge>;
  }
}

export default function EsgTraceability() {
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");
  
  // Get artefact version for immutability check
  const { data: version } = trpc.esgArtefacts.getArtefactVersion.useQuery();
  
  // Get traceability chain when instrument selected
  const { data: chain, isLoading: chainLoading } = trpc.esgArtefacts.getTraceabilityChain.useQuery(
    { instrumentId: selectedInstrument },
    { enabled: !!selectedInstrument }
  );
  
  // Get relevance summary
  const { data: summary } = trpc.esgArtefacts.getGs1RelevanceSummary.useQuery(
    { instrumentId: selectedInstrument },
    { enabled: !!selectedInstrument }
  );

  // Available instruments (hardcoded from frozen artefact)
  const instruments = [
    { id: "CSRD", name: "Corporate Sustainability Reporting Directive" },
    { id: "ESRS", name: "European Sustainability Reporting Standards" },
    { id: "TAXONOMY", name: "EU Taxonomy Regulation" },
    { id: "CSDDD", name: "Corporate Sustainability Due Diligence Directive" },
    { id: "BATTERIES", name: "EU Batteries Regulation" },
    { id: "PPWR", name: "Packaging and Packaging Waste Regulation" },
    { id: "SFDR", name: "Sustainable Finance Disclosure Regulation" },
    { id: "EUDR", name: "EU Deforestation Regulation" },
    { id: "CBAM", name: "Carbon Border Adjustment Mechanism" },
    { id: "PAY_TRANSPARENCY", name: "Pay Transparency Directive" },
    { id: "FORCED_LABOUR", name: "Forced Labour Regulation" },
  ];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">EU ESG Regulatory Traceability</h1>
        <p className="text-muted-foreground">
          Trace GS1 relevance claims from legal articles through obligations to data requirements.
        </p>
      </div>

      {/* Governance disclaimer */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>GS1 is never legally required.</strong> GS1 standards may support compliance activities 
          but are not mandated by any EU regulation. This view is for guidance only.
        </AlertDescription>
      </Alert>

      {/* Artefact version badge */}
      {version && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{version.id}</Badge>
          <span>Status: {version.status}</span>
          <span>•</span>
          <span>Validated: {version.validatedAt}</span>
        </div>
      )}

      {/* Instrument selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Regulatory Instrument</CardTitle>
          <CardDescription>
            Choose an EU regulation to view its traceability chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an instrument..." />
            </SelectTrigger>
            <SelectContent>
              {instruments.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.id} — {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* GS1 Relevance Summary */}
      {summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>GS1 Relevance Summary</CardTitle>
            <CardDescription>{summary.disclaimer}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <div className="text-2xl font-bold text-green-600">{summary.strong || 0}</div>
                <div className="text-sm text-muted-foreground">Strong Support</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <div className="text-2xl font-bold text-yellow-600">{summary.partial || 0}</div>
                <div className="text-sm text-muted-foreground">Partial Support</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="text-2xl font-bold text-gray-600">{summary.none || 0}</div>
                <div className="text-sm text-muted-foreground">No GS1 Support</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traceability Chain */}
      {chainLoading && (
        <div className="text-center py-8 text-muted-foreground">Loading traceability chain...</div>
      )}

      {chain && (
        <div className="space-y-6">
          {/* Instrument */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>Instrument</Badge>
                {chain.instrument?.id}
              </CardTitle>
              <CardDescription>{chain.instrument?.fullName}</CardDescription>
            </CardHeader>
            <CardContent>
              {chain.instrument?.eliUrl && (
                <a 
                  href={chain.instrument.eliUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  EUR-Lex Source
                </a>
              )}
            </CardContent>
          </Card>

          {/* Obligations */}
          {chain.obligations?.map((obligation: any) => (
            <Card key={obligation.id} className="ml-4 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Badge variant="secondary">Obligation</Badge>
                  {obligation.id}
                </CardTitle>
                <CardDescription>{obligation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Article: {obligation.articleRef}
                </div>
                
                {/* Atomic Requirements */}
                {obligation.atomicRequirements?.map((atomic: any) => (
                  <div key={atomic.id} className="mt-4 ml-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Atomic</Badge>
                      <span className="font-medium">{atomic.id}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Subject:</strong> {atomic.subject}</div>
                      <div><strong>Action:</strong> {atomic.action}</div>
                      <div><strong>Scope:</strong> {atomic.scope}</div>
                    </div>

                    {/* Data Requirements & GS1 Mappings */}
                    {atomic.dataRequirements?.map((data: any) => (
                      <div key={data.id} className="mt-3 ml-4 p-3 bg-background rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Data</Badge>
                            <span className="text-sm font-medium">{data.id}</span>
                          </div>
                          {data.gs1Mapping && (
                            <RelevanceIndicator strength={data.gs1Mapping.mappingStrength} />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {data.dataClass}: {data.dataElements?.join(", ")}
                        </div>
                        
                        {data.gs1Mapping && (
                          <div className="text-xs space-y-1 p-2 bg-muted rounded">
                            <div><strong>GS1 Capability:</strong> {data.gs1Mapping.gs1Capability}</div>
                            <div><strong>Standards:</strong> {data.gs1Mapping.gs1Standards?.join(", ")}</div>
                            <div><strong>Justification:</strong> {data.gs1Mapping.justification}</div>
                            {data.gs1Mapping.exclusions && (
                              <div className="text-orange-600">
                                <strong>Exclusions:</strong> {data.gs1Mapping.exclusions}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Separator />
          
          {/* Chain disclaimer */}
          <div className="text-sm text-muted-foreground text-center">
            {chain.disclaimer}
          </div>
        </div>
      )}

      {!selectedInstrument && (
        <div className="text-center py-12 text-muted-foreground">
          Select a regulatory instrument above to view its traceability chain.
        </div>
      )}
    </div>
  );
}
