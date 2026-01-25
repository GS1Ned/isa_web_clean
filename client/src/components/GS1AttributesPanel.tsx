/**
 * GS1 Attributes Panel
 *
 * Displays GS1 Data Source Benelux attributes and Web Vocabulary terms
 * relevant to a specific regulation, helping companies understand which
 * GS1 fields they need to populate for compliance.
 */

import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Package, Leaf, CheckCircle2 } from "lucide-react";

interface GS1AttributesPanelProps {
  regulationId: number;
  regulationName: string;
}

export function GS1AttributesPanel({
  regulationId,
  regulationName,
}: GS1AttributesPanelProps) {
  const { data: attributes, isLoading: attributesLoading } =
    trpc.gs1Attributes.getAttributesByRegulation.useQuery({
      regulationId,
    });

  const { data: webVocab, isLoading: webVocabLoading } =
    trpc.gs1Attributes.getWebVocabularyByRegulation.useQuery({
      regulationId,
    });

  if (attributesLoading || webVocabLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GS1 Attributes You Need</CardTitle>
          <CardDescription>
            Loading GS1 data model requirements...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAttributes = attributes && attributes.length > 0;
  const hasWebVocab = webVocab && webVocab.length > 0;

  if (!hasAttributes && !hasWebVocab) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No GS1 attributes mapped to {regulationName} yet. Attribute mappings
          are being continuously expanded.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          GS1 Attributes You Need
        </CardTitle>
        <CardDescription>
          GS1 Data Source fields and Web Vocabulary properties required for{" "}
          {regulationName} compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attributes">
              Data Source Attributes ({attributes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="vocabulary">
              Web Vocabulary ({webVocab?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="space-y-4 mt-4">
            {hasAttributes ? (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    These are GS1 Data Source Benelux attributes from the Food,
                    Health & Beauty sector model. Populate these fields in your
                    product master data to meet {regulationName} requirements.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {attributes.map(attr => (
                    <div
                      key={attr.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">
                              {attr.attributeName}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {attr.attributeCode}
                            </Badge>
                            {attr.packagingRelated && (
                              <Badge
                                variant="secondary"
                                className="text-xs flex items-center gap-1"
                              >
                                <Package className="h-3 w-3" />
                                Packaging
                              </Badge>
                            )}
                            {attr.sustainabilityRelated && (
                              <Badge
                                variant="secondary"
                                className="text-xs flex items-center gap-1"
                              >
                                <Leaf className="h-3 w-3" />
                                Sustainability
                              </Badge>
                            )}
                            {attr.verifiedByAdmin && (
                              <Badge
                                variant="default"
                                className="text-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>

                          {attr.description && (
                            <p className="text-sm text-muted-foreground">
                              {attr.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Data Type:{" "}
                              <span className="font-medium">
                                {attr.datatype}
                              </span>
                            </span>
                            <span>
                              Sector:{" "}
                              <span className="font-medium">{attr.sector}</span>
                            </span>
                            {attr.relevanceScore && (
                              <span>
                                Relevance:{" "}
                                <span className="font-medium">
                                  {(
                                    parseFloat(attr.relevanceScore) * 100
                                  ).toFixed(0)}
                                  %
                                </span>
                              </span>
                            )}
                          </div>

                          {attr.mappingReason && (
                            <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
                              {attr.mappingReason}
                            </p>
                          )}

                          {attr.codeLists && attr.codeLists.length > 0 && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-primary hover:underline">
                                View {attr.codeLists.length} allowed values
                              </summary>
                              <div className="mt-2 grid grid-cols-2 gap-2 pl-4">
                                {attr.codeLists.slice(0, 10).map(code => (
                                  <div key={code.id} className="text-xs">
                                    <span className="font-mono bg-muted px-1 rounded">
                                      {code.code}
                                    </span>
                                    {code.description && (
                                      <span className="ml-2 text-muted-foreground">
                                        {code.description}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {attr.codeLists.length > 10 && (
                                  <div className="text-xs text-muted-foreground col-span-2">
                                    ... and {attr.codeLists.length - 10} more
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No Data Source attributes mapped yet. Check the Web Vocabulary
                  tab for JSON-LD properties.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-4 mt-4">
            {hasWebVocab ? (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    These are GS1 Web Vocabulary properties (JSON-LD) relevant
                    for {regulationName}. Use these properties in Digital
                    Product Passports and machine-readable data exchange.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {webVocab.map(term => (
                    <div
                      key={term.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium font-mono text-sm">
                              {term.termName}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {term.termType}
                            </Badge>
                            {term.dppRelevant && (
                              <Badge variant="secondary" className="text-xs">
                                DPP
                              </Badge>
                            )}
                            {term.esrsRelevant && (
                              <Badge variant="secondary" className="text-xs">
                                ESRS
                              </Badge>
                            )}
                            {term.eudrRelevant && (
                              <Badge variant="secondary" className="text-xs">
                                EUDR
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm font-medium">{term.label}</p>

                          {term.description && (
                            <p className="text-sm text-muted-foreground">
                              {term.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              URI:{" "}
                              <code className="font-mono bg-muted px-1 rounded">
                                {term.termUri}
                              </code>
                            </span>
                          </div>

                          {term.domain && (
                            <div className="text-xs text-muted-foreground">
                              Domain:{" "}
                              <code className="font-mono bg-muted px-1 rounded">
                                {term.domain}
                              </code>
                            </div>
                          )}

                          {term.range && (
                            <div className="text-xs text-muted-foreground">
                              Range:{" "}
                              <code className="font-mono bg-muted px-1 rounded">
                                {term.range}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No Web Vocabulary properties mapped yet. Check the Data Source
                  Attributes tab for structured fields.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
