import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Factory,
  ShoppingCart,
  Utensils,
  Shirt,
  Cpu,
  Car,
  Building2,
  Leaf,
  FileText,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  Target,
  Download,
  Play,
} from "lucide-react";

interface IndustryTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  regulations: string[];
  keyRequirements: string[];
  timeline: string;
  complexity: "Low" | "Medium" | "High";
  phases: {
    name: string;
    duration: string;
    tasks: string[];
  }[];
  quickWins: string[];
  criticalDeadlines: { date: string; requirement: string }[];
}

const industryTemplates: IndustryTemplate[] = [
  {
    id: "retail",
    name: "Retail & Consumer Goods",
    icon: <ShoppingCart className="h-8 w-8" />,
    description: "Compliance roadmap for retail chains and consumer goods companies focusing on product sustainability and supply chain transparency.",
    regulations: ["CSRD", "ESRS", "EUDR", "Digital Product Passport", "Packaging Regulation"],
    keyRequirements: [
      "Supply chain due diligence",
      "Product carbon footprint disclosure",
      "Packaging sustainability reporting",
      "Deforestation-free sourcing verification",
      "Digital product information sharing"
    ],
    timeline: "18-24 months",
    complexity: "High",
    phases: [
      {
        name: "Foundation",
        duration: "3 months",
        tasks: [
          "Conduct materiality assessment",
          "Map supply chain tiers 1-3",
          "Establish data collection framework",
          "Identify high-risk product categories"
        ]
      },
      {
        name: "Data Infrastructure",
        duration: "4 months",
        tasks: [
          "Implement GS1 Digital Link for products",
          "Set up supplier data exchange",
          "Deploy carbon footprint calculation tools",
          "Create product passport templates"
        ]
      },
      {
        name: "Compliance Implementation",
        duration: "6 months",
        tasks: [
          "Verify deforestation-free supply chains",
          "Calculate Scope 3 emissions",
          "Prepare ESRS disclosures",
          "Implement packaging tracking"
        ]
      },
      {
        name: "Reporting & Audit",
        duration: "3 months",
        tasks: [
          "Generate CSRD-compliant reports",
          "Conduct third-party verification",
          "Submit regulatory filings",
          "Establish continuous monitoring"
        ]
      }
    ],
    quickWins: [
      "Start with top 20% of products by revenue",
      "Use GS1 standards for immediate interoperability",
      "Leverage existing ERP data for emissions baseline"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting for large companies" },
      { date: "2025-12-30", requirement: "EUDR compliance deadline" },
      { date: "2027-01-01", requirement: "Digital Product Passport pilot" }
    ]
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: <Factory className="h-8 w-8" />,
    description: "Comprehensive compliance framework for manufacturing companies with focus on emissions, resource efficiency, and circular economy.",
    regulations: ["CSRD", "ESRS", "EU ETS", "CBAM", "Ecodesign Regulation"],
    keyRequirements: [
      "Scope 1, 2, 3 emissions reporting",
      "Resource efficiency metrics",
      "Circular economy indicators",
      "Carbon border adjustment compliance",
      "Product lifecycle assessment"
    ],
    timeline: "12-18 months",
    complexity: "High",
    phases: [
      {
        name: "Emissions Baseline",
        duration: "3 months",
        tasks: [
          "Install energy monitoring systems",
          "Calculate Scope 1 & 2 emissions",
          "Identify emission hotspots",
          "Set science-based targets"
        ]
      },
      {
        name: "Supply Chain Integration",
        duration: "4 months",
        tasks: [
          "Engage tier 1 suppliers on emissions data",
          "Implement supplier sustainability questionnaires",
          "Calculate Scope 3 upstream emissions",
          "Verify CBAM-relevant imports"
        ]
      },
      {
        name: "Process Optimization",
        duration: "5 months",
        tasks: [
          "Implement energy efficiency measures",
          "Increase recycled content usage",
          "Design for circularity",
          "Reduce waste to landfill"
        ]
      },
      {
        name: "Compliance & Reporting",
        duration: "3 months",
        tasks: [
          "Prepare ESRS E1-E5 disclosures",
          "Submit EU ETS reports",
          "File CBAM declarations",
          "Obtain third-party assurance"
        ]
      }
    ],
    quickWins: [
      "Start with direct emissions (Scope 1)",
      "Use industry emission factors for initial estimates",
      "Focus on top 10 suppliers for Scope 3"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD first reporting period" },
      { date: "2026-01-01", requirement: "CBAM full implementation" },
      { date: "2027-01-01", requirement: "Ecodesign requirements" }
    ]
  },
  {
    id: "food",
    name: "Food & Beverage",
    icon: <Utensils className="h-8 w-8" />,
    description: "Tailored compliance roadmap for food and beverage companies addressing traceability, sustainability, and agricultural supply chains.",
    regulations: ["CSRD", "ESRS", "EUDR", "Farm to Fork Strategy", "Food Information Regulation"],
    keyRequirements: [
      "Agricultural supply chain traceability",
      "Deforestation-free ingredient sourcing",
      "Food waste reduction reporting",
      "Sustainable packaging disclosure",
      "Water usage and biodiversity impact"
    ],
    timeline: "15-20 months",
    complexity: "High",
    phases: [
      {
        name: "Supply Chain Mapping",
        duration: "4 months",
        tasks: [
          "Map ingredient origins to farm level",
          "Identify EUDR-relevant commodities",
          "Assess deforestation risk by origin",
          "Establish traceability systems"
        ]
      },
      {
        name: "Sustainability Data",
        duration: "4 months",
        tasks: [
          "Collect water usage data",
          "Calculate agricultural emissions",
          "Track food waste across value chain",
          "Assess biodiversity impacts"
        ]
      },
      {
        name: "Certification & Verification",
        duration: "4 months",
        tasks: [
          "Obtain deforestation-free certifications",
          "Verify sustainable sourcing claims",
          "Implement due diligence procedures",
          "Prepare geolocation data for EUDR"
        ]
      },
      {
        name: "Reporting & Communication",
        duration: "3 months",
        tasks: [
          "Generate ESRS-compliant disclosures",
          "Update product labels and information",
          "Publish sustainability report",
          "Engage stakeholders on progress"
        ]
      }
    ],
    quickWins: [
      "Start with high-risk commodities (palm oil, soy, cocoa)",
      "Leverage existing food safety traceability",
      "Use certified sustainable suppliers"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting begins" },
      { date: "2025-12-30", requirement: "EUDR compliance for operators" },
      { date: "2026-06-30", requirement: "EUDR compliance for SMEs" }
    ]
  },
  {
    id: "textiles",
    name: "Textiles & Fashion",
    icon: <Shirt className="h-8 w-8" />,
    description: "Compliance framework for textile and fashion companies focusing on circular economy, supply chain transparency, and product passports.",
    regulations: ["CSRD", "ESRS", "EU Textile Strategy", "Digital Product Passport", "Ecodesign for Textiles"],
    keyRequirements: [
      "Fiber composition disclosure",
      "Supply chain worker conditions",
      "Microplastic shedding data",
      "Durability and repairability info",
      "Recycled content verification"
    ],
    timeline: "18-24 months",
    complexity: "High",
    phases: [
      {
        name: "Product Analysis",
        duration: "3 months",
        tasks: [
          "Catalog all product SKUs",
          "Analyze fiber compositions",
          "Identify high-impact product categories",
          "Assess current sustainability claims"
        ]
      },
      {
        name: "Supply Chain Transparency",
        duration: "5 months",
        tasks: [
          "Map manufacturing facilities",
          "Conduct social audits",
          "Verify material origins",
          "Implement worker welfare standards"
        ]
      },
      {
        name: "Product Passport Development",
        duration: "4 months",
        tasks: [
          "Design digital product passport structure",
          "Implement GS1 identifiers",
          "Collect durability and care data",
          "Create QR code linking system"
        ]
      },
      {
        name: "Circular Economy Integration",
        duration: "4 months",
        tasks: [
          "Establish take-back programs",
          "Partner with recyclers",
          "Design for recyclability",
          "Report on circular metrics"
        ]
      }
    ],
    quickWins: [
      "Start with hero products for DPP pilot",
      "Use existing supplier audit data",
      "Leverage GS1 standards for interoperability"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting for large companies" },
      { date: "2027-01-01", requirement: "Textile DPP requirements" },
      { date: "2028-01-01", requirement: "Ecodesign for Textiles" }
    ]
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: <Cpu className="h-8 w-8" />,
    description: "Compliance roadmap for electronics manufacturers addressing battery regulations, e-waste, and digital product passports.",
    regulations: ["CSRD", "ESRS", "Battery Regulation", "WEEE Directive", "Digital Product Passport"],
    keyRequirements: [
      "Battery passport compliance",
      "Recycled content in batteries",
      "E-waste collection targets",
      "Conflict mineral due diligence",
      "Product repairability scores"
    ],
    timeline: "12-18 months",
    complexity: "Medium",
    phases: [
      {
        name: "Product Assessment",
        duration: "2 months",
        tasks: [
          "Inventory battery-containing products",
          "Assess current recycled content",
          "Evaluate repairability of products",
          "Map conflict mineral supply chains"
        ]
      },
      {
        name: "Battery Passport Implementation",
        duration: "4 months",
        tasks: [
          "Design battery passport data model",
          "Implement unique battery identifiers",
          "Collect state of health data",
          "Set up carbon footprint tracking"
        ]
      },
      {
        name: "Circular Design",
        duration: "4 months",
        tasks: [
          "Redesign for easier battery replacement",
          "Increase recycled content in products",
          "Improve product durability",
          "Establish repair service network"
        ]
      },
      {
        name: "Compliance & Reporting",
        duration: "3 months",
        tasks: [
          "Submit battery passport data",
          "Report WEEE collection rates",
          "File conflict mineral disclosures",
          "Prepare ESRS reports"
        ]
      }
    ],
    quickWins: [
      "Start with EV and industrial batteries",
      "Use existing BMS data for state of health",
      "Partner with certified recyclers"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting begins" },
      { date: "2027-02-18", requirement: "Battery Passport for EV batteries" },
      { date: "2027-08-18", requirement: "Battery Passport for all batteries" }
    ]
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: <Car className="h-8 w-8" />,
    description: "Comprehensive compliance framework for automotive companies covering EV batteries, supply chain emissions, and end-of-life vehicles.",
    regulations: ["CSRD", "ESRS", "Battery Regulation", "ELV Directive", "CO2 Standards for Vehicles"],
    keyRequirements: [
      "Vehicle lifecycle emissions",
      "Battery passport for EVs",
      "Recycled content requirements",
      "End-of-life vehicle recovery",
      "Supply chain due diligence"
    ],
    timeline: "18-24 months",
    complexity: "High",
    phases: [
      {
        name: "Emissions Baseline",
        duration: "3 months",
        tasks: [
          "Calculate manufacturing emissions",
          "Assess supply chain carbon footprint",
          "Model use-phase emissions",
          "Evaluate end-of-life impacts"
        ]
      },
      {
        name: "Battery Compliance",
        duration: "5 months",
        tasks: [
          "Implement battery passport system",
          "Track battery state of health",
          "Verify recycled content in batteries",
          "Establish second-life partnerships"
        ]
      },
      {
        name: "Circular Economy",
        duration: "5 months",
        tasks: [
          "Design for recyclability",
          "Increase recycled material usage",
          "Optimize end-of-life recovery",
          "Partner with recycling networks"
        ]
      },
      {
        name: "Reporting & Verification",
        duration: "4 months",
        tasks: [
          "Generate ESRS disclosures",
          "Submit CO2 fleet reports",
          "File battery passport data",
          "Obtain third-party assurance"
        ]
      }
    ],
    quickWins: [
      "Start with EV models for battery passport",
      "Use existing LCA data for emissions",
      "Leverage OEM sustainability programs"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting for large OEMs" },
      { date: "2027-02-18", requirement: "Battery Passport for EV batteries" },
      { date: "2030-01-01", requirement: "CO2 fleet emission targets" }
    ]
  }
];

export default function IndustryTemplates() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Industry-Specific Compliance Templates</h1>
        <p className="text-gray-600">
          Pre-built compliance roadmaps tailored to your industry's specific regulatory requirements
        </p>
      </div>

      {!selectedIndustry ? (
        /* Industry Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industryTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedIndustry(template)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge className={getComplexityColor(template.complexity)}>
                        {template.complexity} Complexity
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.timeline}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.regulations.slice(0, 3).map((reg) => (
                    <Badge key={reg} variant="secondary" className="text-xs">
                      {reg}
                    </Badge>
                  ))}
                  {template.regulations.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.regulations.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Industry Detail View */
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => setSelectedIndustry(null)}>
            ← Back to Industries
          </Button>

          {/* Industry Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-100 rounded-lg text-blue-600">
                    {selectedIndustry.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedIndustry.name}</CardTitle>
                    <CardDescription className="mt-1">{selectedIndustry.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Template
                  </Button>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Start Implementation
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="phases">Implementation Phases</TabsTrigger>
              <TabsTrigger value="deadlines">Critical Deadlines</TabsTrigger>
              <TabsTrigger value="quickwins">Quick Wins</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Regulations</p>
                        <p className="text-2xl font-bold">{selectedIndustry.regulations.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Requirements</p>
                        <p className="text-2xl font-bold">{selectedIndustry.keyRequirements.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Timeline</p>
                        <p className="text-2xl font-bold">{selectedIndustry.timeline}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Deadlines</p>
                        <p className="text-2xl font-bold">{selectedIndustry.criticalDeadlines.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Regulations & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Applicable Regulations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedIndustry.regulations.map((reg) => (
                        <div key={reg} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>{reg}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Key Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedIndustry.keyRequirements.map((req) => (
                        <div key={req} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="phases" className="space-y-6">
              {selectedIndustry.phases.map((phase, index) => (
                <Card key={phase.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle>{phase.name}</CardTitle>
                          <CardDescription>Duration: {phase.duration}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{phase.tasks.length} tasks</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                          <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">{task}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="deadlines" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Compliance Deadlines</CardTitle>
                  <CardDescription>Key dates you need to meet for regulatory compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedIndustry.criticalDeadlines.map((deadline, index) => {
                      const deadlineDate = new Date(deadline.date);
                      const today = new Date();
                      const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil < 180;
                      const isPast = daysUntil < 0;

                      return (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isPast ? 'bg-red-50 border-red-200' : 
                            isUrgent ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded ${
                              isPast ? 'bg-red-100' : 
                              isUrgent ? 'bg-yellow-100' : 
                              'bg-blue-100'
                            }`}>
                              <AlertTriangle className={`h-5 w-5 ${
                                isPast ? 'text-red-600' : 
                                isUrgent ? 'text-yellow-600' : 
                                'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{deadline.requirement}</p>
                              <p className="text-sm text-gray-600">{deadline.date}</p>
                            </div>
                          </div>
                          <Badge className={
                            isPast ? 'bg-red-100 text-red-800' : 
                            isUrgent ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }>
                            {isPast ? 'Overdue' : `${daysUntil} days`}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quickwins" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Quick Wins
                  </CardTitle>
                  <CardDescription>
                    Start with these actions for immediate progress and early compliance wins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedIndustry.quickWins.map((win, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
