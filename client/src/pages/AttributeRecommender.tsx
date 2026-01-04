import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  Lightbulb,
  Search,
  Sparkles,
  Code,
  FileText,
  TrendingUp,
  ArrowRight,
  Building2,
  Factory,
  Leaf,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

// Epistemic status badge component
function EpistemicBadge({ status, confidence }: { status: string; confidence: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'fact':
        return { 
          icon: CheckCircle2, 
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'Fact',
          description: 'Grounded in database records'
        };
      case 'inference':
        return { 
          icon: Lightbulb, 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Inference',
          description: 'Derived from rules applied to facts'
        };
      case 'uncertain':
        return { 
          icon: HelpCircle, 
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Uncertain',
          description: 'Involves assumptions'
        };
      default:
        return { 
          icon: Info, 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          label: status,
          description: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`${config.color} text-xs gap-1`}>
          <Icon className="h-3 w-3" />
          {config.label}
          <span className="opacity-70">({confidence})</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
        <p className="text-xs mt-1">Confidence: {confidence}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Confidence level badge
function ConfidenceBadge({ level, score }: { level: string; score: number }) {
  const getConfig = () => {
    switch (level) {
      case 'high':
        return { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: TrendingUp };
      case 'low':
        return { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Info };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`${config.color} gap-1`}>
          <Icon className="h-3 w-3" />
          {Math.round(score * 100)}%
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Confidence: {level}</p>
        <p className="text-xs text-muted-foreground">Score: {score.toFixed(2)}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Effort badge
function EffortBadge({ effort }: { effort: string }) {
  const getConfig = () => {
    switch (effort) {
      case 'low':
        return { color: 'bg-green-100 text-green-800', label: 'Low Effort' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Effort' };
      case 'high':
        return { color: 'bg-red-100 text-red-800', label: 'High Effort' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: effort };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  );
}

// XML Snippet component with copy functionality
function XmlSnippet({ xml }: { xml: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    toast.success("XML snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 p-3 rounded-md text-xs overflow-x-auto">
        <code>{xml}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 h-6 w-6 p-0"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}

export default function AttributeRecommender() {
  // Form state
  const [sector, setSector] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("");
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);
  const [selectedCurrentAttributes, setSelectedCurrentAttributes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Query data
  const { data: sectors } = trpc.attributeRecommender.getAvailableSectors.useQuery();
  const { data: regulations } = trpc.attributeRecommender.getAvailableRegulations.useQuery();
  const { data: companySizes } = trpc.attributeRecommender.getCompanySizeOptions.useQuery();
  const { data: sampleAttributes } = trpc.attributeRecommender.getSampleAttributes.useQuery();

  // Recommendation mutation
  const recommendMutation = trpc.attributeRecommender.recommend.useMutation({
    onSuccess: () => {
      toast.success("Recommendations generated successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Filter attributes by search
  const filteredAttributes = useMemo(() => {
    if (!sampleAttributes) return [];
    if (!searchTerm) return sampleAttributes;
    return sampleAttributes.filter(
      (attr) =>
        attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attr.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sampleAttributes, searchTerm]);

  // Group attributes by category
  const groupedAttributes = useMemo(() => {
    const groups: Record<string, typeof filteredAttributes> = {};
    filteredAttributes.forEach((attr) => {
      if (!groups[attr.category]) {
        groups[attr.category] = [];
      }
      groups[attr.category].push(attr);
    });
    return groups;
  }, [filteredAttributes]);

  const handleRecommend = () => {
    if (!sector) {
      toast.error("Please select a sector");
      return;
    }

    recommendMutation.mutate({
      sector,
      companySize: companySize as 'small' | 'medium' | 'large' | undefined,
      targetRegulations: selectedRegulations.length > 0 ? selectedRegulations : undefined,
      currentAttributes: selectedCurrentAttributes.length > 0 ? selectedCurrentAttributes : undefined,
    });
  };

  const toggleRegulation = (regId: string) => {
    setSelectedRegulations((prev) =>
      prev.includes(regId)
        ? prev.filter((r) => r !== regId)
        : [...prev, regId]
    );
  };

  const toggleAttribute = (attrId: string) => {
    setSelectedCurrentAttributes((prev) =>
      prev.includes(attrId)
        ? prev.filter((a) => a !== attrId)
        : [...prev, attrId]
    );
  };

  const results = recommendMutation.data;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/tools/gap-analyzer" className="hover:text-primary">Gap Analyzer</Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-primary font-medium">Attribute Recommender</span>
          </div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            GS1 Attribute Recommender
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Get AI-powered recommendations for GS1 attributes based on your sector, 
            target regulations, and current data coverage. Each recommendation includes 
            confidence scoring and implementation guidance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sector Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sector
              </CardTitle>
              <CardDescription>Select your industry sector</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector..." />
                </SelectTrigger>
                <SelectContent>
                  {sectors?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Company Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Company Size
              </CardTitle>
              <CardDescription>Optional: affects regulatory scope</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size..." />
                </SelectTrigger>
                <SelectContent>
                  {companySizes?.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Target Regulations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Target Regulations
              </CardTitle>
              <CardDescription>Select regulations to focus on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {regulations?.map((reg) => (
                <div key={reg.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={reg.id}
                    checked={selectedRegulations.includes(reg.id)}
                    onCheckedChange={() => toggleRegulation(reg.id)}
                  />
                  <label
                    htmlFor={reg.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {reg.shortName}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Attributes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Current Attributes
              </CardTitle>
              <CardDescription>Select attributes you already have</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search attributes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {Object.entries(groupedAttributes).map(([category, attrs]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-muted-foreground mt-2 mb-1">{category}</p>
                    {attrs.map((attr) => (
                      <div key={attr.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={attr.id}
                          checked={selectedCurrentAttributes.includes(attr.id)}
                          onCheckedChange={() => toggleAttribute(attr.id)}
                        />
                        <label
                          htmlFor={attr.id}
                          className="text-xs leading-none cursor-pointer"
                        >
                          {attr.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleRecommend}
            disabled={!sector || recommendMutation.isPending}
          >
            {recommendMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!results && !recommendMutation.isPending && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No recommendations yet</p>
                <p className="text-sm">Configure your parameters and click Generate</p>
              </div>
            </Card>
          )}

          {recommendMutation.isPending && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-lg font-medium">Analyzing requirements...</p>
                <p className="text-sm text-muted-foreground">Generating personalized recommendations</p>
              </div>
            </Card>
          )}

          {results && (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recommendation Summary</span>
                    <EpistemicBadge 
                      status={results.epistemic.status} 
                      confidence={results.epistemic.confidence} 
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{results.summary.totalRecommendations}</p>
                      <p className="text-xs text-muted-foreground">Total Recommendations</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{results.summary.highConfidenceCount}</p>
                      <p className="text-xs text-muted-foreground">High Confidence</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{results.summary.mediumConfidenceCount}</p>
                      <p className="text-xs text-muted-foreground">Medium Confidence</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{results.summary.lowConfidenceCount}</p>
                      <p className="text-xs text-muted-foreground">Low Confidence</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Regulations covered:</span>
                    {results.summary.regulationsCovered.map((reg) => (
                      <Badge key={reg} variant="secondary">{reg}</Badge>
                    ))}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">
                      Estimated implementation effort: <strong>{results.summary.estimatedImplementationEffort}</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Attributes</CardTitle>
                  <CardDescription>
                    Prioritized list of GS1 attributes to implement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {results.recommendations.map((rec) => (
                      <AccordionItem key={rec.attributeId} value={rec.attributeId} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                              {rec.priorityRank}
                            </span>
                            <div className="flex-1 text-left">
                              <p className="font-medium">{rec.attributeName}</p>
                              <p className="text-xs text-muted-foreground">{rec.attributeCode} • {rec.dataType}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <ConfidenceBadge level={rec.confidenceLevel} score={rec.confidenceScore} />
                              <EffortBadge effort={rec.estimatedEffort} />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          {/* Rationale */}
                          <div>
                            <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                              <Lightbulb className="h-4 w-4" />
                              Recommendation Rationale
                            </h4>
                            <p className="text-sm text-muted-foreground">{rec.recommendationRationale}</p>
                          </div>

                          {/* Regulatory Relevance */}
                          {rec.regulatoryRelevance.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4" />
                                Regulatory Relevance
                              </h4>
                              <div className="space-y-1">
                                {rec.regulatoryRelevance.map((rel, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">{rel.regulation}</Badge>
                                    <span className="text-muted-foreground">{rel.requirement}</span>
                                    <Badge variant="secondary" className="text-xs">{rel.mappingType}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ESRS Datapoints */}
                          {rec.esrsDatapoints.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">ESRS Datapoints</h4>
                              <div className="flex flex-wrap gap-1">
                                {rec.esrsDatapoints.map((dp) => (
                                  <Badge key={dp} variant="outline">{dp}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Implementation Notes */}
                          <div>
                            <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Implementation Notes
                            </h4>
                            <p className="text-sm text-muted-foreground">{rec.implementationNotes}</p>
                          </div>

                          {/* GDSN XML Snippet */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                              <Code className="h-4 w-4" />
                              GDSN XML Snippet
                            </h4>
                            <XmlSnippet xml={rec.gdsnXmlSnippet} />
                          </div>

                          {/* Epistemic Status */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Epistemic status:</span>
                            <EpistemicBadge 
                              status={rec.epistemic.status} 
                              confidence={rec.epistemic.confidence} 
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
