/**
 * GS1 Nederland-Aligned Industry Templates
 * 
 * This file contains new industry templates specifically aligned with
 * GS1 Nederland's sector structure and Dutch market requirements.
 * 
 * New sectors added:
 * - Agrarisch & vers (Agricultural & Fresh)
 * - Marketplaces & e-commerce
 * - Bouw & installatie (Construction & Installation)
 * 
 * Updated sectors:
 * - Mode (Fashion) - aligned with GS1 NL Fashion guidelines
 */

import { 
  Leaf, 
  ShoppingBag, 
  Building, 
  Shirt,
  Tractor,
  Store,
  Hammer
} from "lucide-react";

export interface GS1NLIndustryTemplate {
  id: string;
  name: string;
  nameNL: string;
  icon: React.ReactNode;
  description: string;
  descriptionNL: string;
  gs1NLSector: string;
  regulations: string[];
  gs1Standards: string[];
  keyRequirements: string[];
  timeline: string;
  complexity: "Low" | "Medium" | "High";
  phases: {
    name: string;
    nameNL: string;
    duration: string;
    tasks: string[];
  }[];
  quickWins: string[];
  criticalDeadlines: { date: string; requirement: string }[];
  gs1NLResources: { name: string; url: string }[];
}

export const gs1NLIndustryTemplates: GS1NLIndustryTemplate[] = [
  {
    id: "agricultural",
    name: "Agricultural & Fresh",
    nameNL: "Agrarisch & vers",
    icon: <Tractor className="h-8 w-8" />,
    description: "Compliance roadmap for agricultural producers and fresh produce companies focusing on traceability, sustainability, and farm-to-fork transparency.",
    descriptionNL: "Compliance-routekaart voor agrarische producenten en versproducten met focus op traceerbaarheid, duurzaamheid en farm-to-fork transparantie.",
    gs1NLSector: "Agrarisch & vers",
    regulations: ["CSRD", "ESRS", "EUDR", "Farm to Fork Strategy", "EU Organic Regulation"],
    gs1Standards: ["GTIN", "GLN", "EPCIS", "GS1 Digital Link", "GDSN"],
    keyRequirements: [
      "Farm-level traceability (geolocation data)",
      "Deforestation-free sourcing verification",
      "Pesticide and fertilizer usage reporting",
      "Water usage and biodiversity impact",
      "Organic certification verification",
      "Cold chain monitoring and documentation"
    ],
    timeline: "12-18 months",
    complexity: "High",
    phases: [
      {
        name: "Farm Registration",
        nameNL: "Bedrijfsregistratie",
        duration: "3 months",
        tasks: [
          "Register all farm locations with GLN",
          "Implement plot-level geolocation tracking",
          "Set up GS1 Digital Link for product identification",
          "Establish baseline sustainability metrics"
        ]
      },
      {
        name: "Traceability Implementation",
        nameNL: "Traceerbaarheid implementatie",
        duration: "4 months",
        tasks: [
          "Deploy EPCIS for supply chain events",
          "Implement batch/lot tracking with GTIN+AI",
          "Connect to GS1 Data Source for data sharing",
          "Set up cold chain monitoring integration"
        ]
      },
      {
        name: "Sustainability Data Collection",
        nameNL: "Duurzaamheidsdata verzameling",
        duration: "4 months",
        tasks: [
          "Track water usage per crop/product",
          "Document pesticide and fertilizer applications",
          "Calculate carbon footprint per product",
          "Assess biodiversity impact on farm"
        ]
      },
      {
        name: "Compliance & Certification",
        nameNL: "Compliance & certificering",
        duration: "3 months",
        tasks: [
          "Prepare EUDR due diligence statements",
          "Generate ESRS-compliant disclosures",
          "Obtain/maintain organic certifications",
          "Submit regulatory filings"
        ]
      }
    ],
    quickWins: [
      "Start with high-value export products",
      "Leverage existing farm management systems",
      "Use GS1 standards for immediate interoperability with retailers"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting for large companies" },
      { date: "2025-12-30", requirement: "EUDR compliance for operators" },
      { date: "2026-06-30", requirement: "EUDR compliance for SMEs" }
    ],
    gs1NLResources: [
      { name: "GS1 Nederland Agrarisch & vers", url: "https://www.gs1.nl/sectoren/agrarisch-vers/" },
      { name: "GS1 Traceability Standard", url: "https://www.gs1.nl/standaarden/traceerbaarheid/" }
    ]
  },
  {
    id: "marketplaces",
    name: "Marketplaces & E-commerce",
    nameNL: "Marketplaces & e-commerce",
    icon: <Store className="h-8 w-8" />,
    description: "Compliance framework for online marketplaces and e-commerce platforms focusing on product data quality, fraud prevention, and sustainable commerce.",
    descriptionNL: "Compliance-framework voor online marktplaatsen en e-commerce platforms met focus op productdatakwaliteit, fraudepreventie en duurzame handel.",
    gs1NLSector: "Marketplaces & e-commerce",
    regulations: ["CSRD", "ESRS", "Digital Services Act", "Digital Product Passport", "GPSR"],
    gs1Standards: ["GTIN", "GLN", "GS1 Digital Link", "GDSN", "Verified by GS1"],
    keyRequirements: [
      "Product authenticity verification",
      "Accurate product data and images",
      "Seller identity verification",
      "Return and waste reduction tracking",
      "Carbon footprint of logistics",
      "Digital Product Passport integration"
    ],
    timeline: "12-15 months",
    complexity: "Medium",
    phases: [
      {
        name: "Data Quality Foundation",
        nameNL: "Datakwaliteit basis",
        duration: "3 months",
        tasks: [
          "Implement GTIN validation for all listings",
          "Set up Verified by GS1 integration",
          "Establish product image standards",
          "Create seller onboarding requirements"
        ]
      },
      {
        name: "Fraud Prevention",
        nameNL: "Fraudepreventie",
        duration: "3 months",
        tasks: [
          "Deploy GS1 Digital Link verification",
          "Implement seller identity checks via GLN",
          "Set up counterfeit detection systems",
          "Create consumer reporting mechanisms"
        ]
      },
      {
        name: "Sustainability Integration",
        nameNL: "Duurzaamheid integratie",
        duration: "4 months",
        tasks: [
          "Track return rates and reasons",
          "Calculate logistics carbon footprint",
          "Implement sustainable packaging requirements",
          "Prepare for DPP data display"
        ]
      },
      {
        name: "Compliance & Reporting",
        nameNL: "Compliance & rapportage",
        duration: "3 months",
        tasks: [
          "Generate CSRD-compliant reports",
          "Implement DSA transparency requirements",
          "Prepare GPSR compliance documentation",
          "Set up continuous monitoring"
        ]
      }
    ],
    quickWins: [
      "Start with GTIN validation for new listings",
      "Use GS1 Data Source for product enrichment",
      "Implement basic seller verification via GLN"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting begins" },
      { date: "2025-02-17", requirement: "DSA full compliance" },
      { date: "2027-01-01", requirement: "Digital Product Passport pilot" }
    ],
    gs1NLResources: [
      { name: "GS1 Nederland Marketplaces", url: "https://www.gs1.nl/sectoren/marketplaces-e-commerce/" },
      { name: "Verified by GS1", url: "https://www.gs1.nl/standaarden/verified-by-gs1/" }
    ]
  },
  {
    id: "construction",
    name: "Construction & Installation",
    nameNL: "Bouw & installatie",
    icon: <Hammer className="h-8 w-8" />,
    description: "Compliance roadmap for construction and installation companies focusing on building material traceability, circular construction, and energy efficiency.",
    descriptionNL: "Compliance-routekaart voor bouw- en installatiebedrijven met focus op bouwmaterialen traceerbaarheid, circulair bouwen en energie-efficiëntie.",
    gs1NLSector: "Bouw & installatie",
    regulations: ["CSRD", "ESRS", "Construction Products Regulation", "EPBD", "Digital Building Logbook"],
    gs1Standards: ["GTIN", "GLN", "GIAI", "GS1 Digital Link", "EPCIS"],
    keyRequirements: [
      "Building material composition disclosure",
      "Embodied carbon calculation",
      "Circular material passports",
      "Installation product traceability",
      "Energy performance documentation",
      "Waste and recycling tracking"
    ],
    timeline: "15-20 months",
    complexity: "Medium",
    phases: [
      {
        name: "Product Identification",
        nameNL: "Product identificatie",
        duration: "3 months",
        tasks: [
          "Implement GTIN for all building products",
          "Register installation locations with GLN",
          "Set up asset tracking with GIAI",
          "Create product data templates"
        ]
      },
      {
        name: "Material Passport Development",
        nameNL: "Materiaalpaspoort ontwikkeling",
        duration: "4 months",
        tasks: [
          "Document material compositions",
          "Calculate embodied carbon per product",
          "Implement GS1 Digital Link for products",
          "Connect to material databases"
        ]
      },
      {
        name: "Circular Economy Integration",
        nameNL: "Circulaire economie integratie",
        duration: "5 months",
        tasks: [
          "Track material reuse and recycling",
          "Implement deconstruction planning",
          "Set up material marketplace connections",
          "Document end-of-life scenarios"
        ]
      },
      {
        name: "Compliance & Digital Logbook",
        nameNL: "Compliance & digitaal logboek",
        duration: "4 months",
        tasks: [
          "Prepare CSRD disclosures",
          "Implement Digital Building Logbook",
          "Generate CPR documentation",
          "Set up energy performance tracking"
        ]
      }
    ],
    quickWins: [
      "Start with high-impact materials (concrete, steel, insulation)",
      "Leverage existing BIM data for material tracking",
      "Use GS1 standards for supply chain integration"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting for large companies" },
      { date: "2026-01-01", requirement: "CPR revision implementation" },
      { date: "2028-01-01", requirement: "Digital Building Logbook requirements" }
    ],
    gs1NLResources: [
      { name: "GS1 Nederland Bouw & installatie", url: "https://www.gs1.nl/sectoren/bouw-installatie/" },
      { name: "GS1 Asset Identification", url: "https://www.gs1.nl/standaarden/identificatie/" }
    ]
  },
  {
    id: "fashion-gs1nl",
    name: "Fashion (GS1 NL Aligned)",
    nameNL: "Mode",
    icon: <Shirt className="h-8 w-8" />,
    description: "GS1 Nederland-aligned compliance framework for fashion companies focusing on omnichannel experience, inventory management, and textile sustainability.",
    descriptionNL: "GS1 Nederland-afgestemde compliance-framework voor modebedrijven met focus op omnichannel ervaring, voorraadbeheer en textielduurzaamheid.",
    gs1NLSector: "Mode",
    regulations: ["CSRD", "ESRS", "EU Textile Strategy", "Digital Product Passport", "Ecodesign for Textiles"],
    gs1Standards: ["GTIN", "GLN", "SGTIN", "GS1 Digital Link", "EPCIS"],
    keyRequirements: [
      "Size and color variant management (GTIN+AI)",
      "Omnichannel inventory visibility",
      "Fiber composition disclosure",
      "Supply chain worker conditions",
      "Durability and repairability information",
      "Recycled content verification"
    ],
    timeline: "18-24 months",
    complexity: "High",
    phases: [
      {
        name: "Product Master Data",
        nameNL: "Product stamgegevens",
        duration: "3 months",
        tasks: [
          "Implement GTIN for all SKUs including variants",
          "Set up size/color coding with GS1 AIs",
          "Connect to GS1 Data Source",
          "Establish product image standards"
        ]
      },
      {
        name: "Supply Chain Transparency",
        nameNL: "Supply chain transparantie",
        duration: "5 months",
        tasks: [
          "Map manufacturing facilities with GLN",
          "Implement EPCIS for supply chain events",
          "Conduct social audits",
          "Verify material origins"
        ]
      },
      {
        name: "Digital Product Passport",
        nameNL: "Digitaal productpaspoort",
        duration: "4 months",
        tasks: [
          "Design DPP data structure",
          "Implement GS1 Digital Link QR codes",
          "Collect durability and care data",
          "Set up consumer-facing information"
        ]
      },
      {
        name: "Circular Economy & Reporting",
        nameNL: "Circulaire economie & rapportage",
        duration: "4 months",
        tasks: [
          "Establish take-back programs",
          "Partner with textile recyclers",
          "Generate ESRS-compliant reports",
          "Report on circular metrics"
        ]
      }
    ],
    quickWins: [
      "Start with hero products for DPP pilot",
      "Use RFID/SGTIN for inventory accuracy",
      "Leverage GS1 Data Source for omnichannel"
    ],
    criticalDeadlines: [
      { date: "2025-01-01", requirement: "CSRD reporting for large companies" },
      { date: "2027-01-01", requirement: "Textile DPP requirements" },
      { date: "2028-01-01", requirement: "Ecodesign for Textiles" }
    ],
    gs1NLResources: [
      { name: "GS1 Nederland Mode", url: "https://www.gs1.nl/sectoren/mode/" },
      { name: "GS1 Data Source Mode", url: "https://www.gs1.nl/kennisbank/gs1-data-source/" }
    ]
  }
];

export default gs1NLIndustryTemplates;
