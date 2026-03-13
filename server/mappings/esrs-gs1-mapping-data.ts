/**
 * Canonical GS1 attribute mapping structure used by the ESRS mapping library.
 */
export interface GS1AttributeMapping {
  attributeName: string;
  gs1Standard: string;
  data_type:
    | "narrative"
    | "monetary"
    | "percentage"
    | "date"
    | "boolean"
    | "quantitative";
  unit?: string;
  mappingConfidence: number;
  mappingReason: string;
  exampleValue?: string;
}

/**
 * Static ESRS → GS1 mapping rule.
 *
 * esrsPattern:
 *   - Glob pattern such as "E1-1_*" or exact "E1-1_01".
 */
export interface ESRSMappingRule {
  esrsPattern: string;
  esrs_standard: string;
  topic: string;
  matchTerms?: string[];
  gs1Attributes: Omit<GS1AttributeMapping, "exampleValue">[];
}

/**
 * Static mapping rules covering key ESRS standards:
 *
 * - E1: Climate change (GHG emissions, energy use)
 * - E2: Pollution
 * - E3: Water and marine resources
 * - E4: Biodiversity and ecosystems
 * - E5: Resource use and circular economy
 * - ESRS 2: General disclosures / value chain context
 * - S1: Own workforce
 * - S2: Workers in the value chain
 * - S4: Consumers and end users
 *
 * These rules are intentionally conservative and can be refined as the
 * underlying GS1 attribute catalog evolves.
 */
export const ESRS_GS1_MAPPING_RULES: ESRSMappingRule[] = [
  {
    esrsPattern: "E1-1_*",
    esrs_standard: "E1",
    topic: "Scope 1 GHG emissions (direct emissions)",
    gs1Attributes: [
      {
        attributeName: "greenhouseGasEmissionsScope1",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "tonnes CO2e",
        mappingConfidence: 0.95,
        mappingReason:
          "Direct match between ESRS E1 Scope 1 emissions datapoints and GDSN sustainability attributes for GHG reporting.",
      },
      {
        attributeName: "reportingPeriodStartDate",
        gs1Standard: "GDM",
        data_type: "date",
        mappingConfidence: 0.8,
        mappingReason:
          "Reporting period start date is required to contextualise annual GHG emission figures.",
      },
      {
        attributeName: "reportingPeriodEndDate",
        gs1Standard: "GDM",
        data_type: "date",
        mappingConfidence: 0.8,
        mappingReason:
          "Reporting period end date is required to contextualise annual GHG emission figures.",
      },
    ],
  },
  {
    esrsPattern: "E1-2_*",
    esrs_standard: "E1",
    topic: "Scope 2 GHG emissions (purchased energy)",
    gs1Attributes: [
      {
        attributeName: "greenhouseGasEmissionsScope2",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "tonnes CO2e",
        mappingConfidence: 0.93,
        mappingReason:
          "Direct linkage from ESRS E1 Scope 2 datapoints to GDSN attributes representing indirect emissions from purchased energy.",
      },
      {
        attributeName: "electricityConsumptionTotal",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "kWh",
        mappingConfidence: 0.85,
        mappingReason:
          "Electricity consumption is a primary driver of Scope 2 emissions and is typically modelled as a GDSN sustainability attribute.",
      },
    ],
  },
  {
    esrsPattern: "E1-3_*",
    esrs_standard: "E1",
    topic: "Scope 3 GHG emissions (value chain)",
    matchTerms: [
      "Scope 3 GHG emissions from value chain",
      "Supply Chain Emissions",
      "Supply Chain Traceability - Emissions",
      "EPCIS enables Scope 3 tracking",
    ],
    gs1Attributes: [
      {
        attributeName: "greenhouseGasEmissionsScope3",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "tonnes CO2e",
        mappingConfidence: 0.9,
        mappingReason:
          "Scope 3 emissions can be represented via aggregated sustainability attributes in GDSN for upstream and downstream value chain activities.",
      },
      {
        attributeName: "supplyChainEmissionsCategory",
        gs1Standard: "GDM",
        data_type: "narrative",
        mappingConfidence: 0.75,
        mappingReason:
          "Categorisation of Scope 3 emissions by activity type aligns with GDM-style data structures for supply chain segmentation.",
      },
    ],
  },
  {
    esrsPattern: "E1-3_*",
    esrs_standard: "E1",
    topic: "Product carbon footprint disclosure and battery carbon footprint declaration",
    matchTerms: [
      "Product carbon footprint disclosure",
      "Product Carbon Footprint",
      "GHG Emissions Scope 3 - Product Carbon Footprint",
      "Battery Carbon Footprint",
      "Digital Link provides carbon footprint access",
    ],
    gs1Attributes: [
      {
        attributeName: "productCarbonFootprint",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "kg CO2e",
        mappingConfidence: 0.97,
        mappingReason:
          "Product-level carbon footprint disclosure aligns directly with GS1 sustainability attribute payloads and DPP-facing product carbon footprint fields.",
      },
      {
        attributeName: "gtin",
        gs1Standard: "GTIN",
        data_type: "narrative",
        mappingConfidence: 0.84,
        mappingReason:
          "GTIN anchors product-level carbon footprint disclosure to a resolvable product identity for DPP and sustainability evidence exchange.",
      },
      {
        attributeName: "serialNumber",
        gs1Standard: "Digital Link",
        data_type: "narrative",
        mappingConfidence: 0.79,
        mappingReason:
          "Serial identifiers strengthen instance-level product carbon footprint and battery passport traceability when disclosure is provided through Digital Link.",
      },
    ],
  },
  {
    esrsPattern: "E1-5_*",
    esrs_standard: "E1",
    topic: "Energy consumption and energy mix",
    gs1Attributes: [
      {
        attributeName: "totalEnergyConsumption",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "kWh",
        mappingConfidence: 0.9,
        mappingReason:
          "Total energy consumption is typically recorded in GDSN attribute sets for product manufacturing and facility operations.",
      },
      {
        attributeName: "renewableEnergyShare",
        gs1Standard: "GDSN",
        data_type: "percentage",
        unit: "percent",
        mappingConfidence: 0.8,
        mappingReason:
          "Share of renewable energy is captured as a percentage field in sustainability-related GDSN or GS1 Web Vocabulary attributes.",
      },
    ],
  },
  {
    esrsPattern: "E2-1_*",
    esrs_standard: "E2",
    topic: "Air pollutant emissions",
    gs1Attributes: [
      {
        attributeName: "airPollutantEmissionsNOx",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "kg",
        mappingConfidence: 0.85,
        mappingReason:
          "NOx emission quantities can be mapped to air pollutant fields in environmental performance attribute groups in GDSN.",
      },
      {
        attributeName: "airPollutantEmissionsSOx",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "kg",
        mappingConfidence: 0.85,
        mappingReason:
          "SOx emission quantities are typically recorded alongside NOx in environmental performance attributes.",
      },
    ],
  },
  {
    esrsPattern: "E2-2_*",
    esrs_standard: "E2",
    topic: "Water and soil pollutant discharges",
    gs1Attributes: [
      {
        attributeName: "waterPollutantDischarge",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "kg",
        mappingConfidence: 0.8,
        mappingReason:
          "Discharges of pollutants into water bodies are captured as mass-based attributes in environmental reporting models.",
      },
      {
        attributeName: "pollutantTypeDescription",
        gs1Standard: "GDM",
        data_type: "narrative",
        mappingConfidence: 0.75,
        mappingReason:
          "GDM-style attributes can be used to describe pollutant categories or substance families relevant for ESRS E2.",
      },
    ],
  },
  {
    esrsPattern: "E2-4_*",
    esrs_standard: "E2",
    topic: "Substances of concern in products and compliance tracking",
    matchTerms: [
      "Substances of concern in products",
      "GDSN captures hazardous substance data",
      "Product regulatory compliance tracking",
      "GTIN links to compliance data",
    ],
    gs1Attributes: [
      {
        attributeName: "hazardousSubstances",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.95,
        mappingReason:
          "Hazardous substance disclosure is the clearest GS1-aligned data element for ESRS pollution and substances-of-concern reporting.",
      },
      {
        attributeName: "gtin",
        gs1Standard: "GTIN",
        data_type: "narrative",
        mappingConfidence: 0.82,
        mappingReason:
          "GTIN provides the product identity needed to connect substances-of-concern records to specific regulated items.",
      },
      {
        attributeName: "supplierInformation",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.76,
        mappingReason:
          "Supplier information strengthens product compliance traceability for upstream substances-of-concern reporting and escalation.",
      },
    ],
  },
  {
    esrsPattern: "E3-1_*",
    esrs_standard: "E3",
    topic: "Water withdrawal by source",
    gs1Attributes: [
      {
        attributeName: "waterWithdrawalVolume",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "m3",
        mappingConfidence: 0.88,
        mappingReason:
          "Water withdrawal volumes are commonly modelled as quantitative attributes for facilities and production processes.",
      },
      {
        attributeName: "waterSourceType",
        gs1Standard: "GDM",
        data_type: "narrative",
        mappingConfidence: 0.78,
        mappingReason:
          "Source type (surface water, groundwater, municipal supply) is expressed as descriptive metadata aligned with GDM-style attributes.",
      },
    ],
  },
  {
    esrsPattern: "E3-2_*",
    esrs_standard: "E3",
    topic: "Water consumption",
    gs1Attributes: [
      {
        attributeName: "waterConsumptionVolume",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        unit: "m3",
        mappingConfidence: 0.88,
        mappingReason:
          "Water consumption volumes after reuse and recycling are captured as quantitative attributes in sustainability datasets.",
      },
    ],
  },
  {
    esrsPattern: "E3-3_*",
    esrs_standard: "E3",
    topic: "Seafood and marine-resource traceability",
    matchTerms: [
      "Seafood traceability",
      "GS1 Fresh Foods enables seafood traceability",
      "Sustainable fishing compliance",
    ],
    gs1Attributes: [
      {
        attributeName: "countryOfOrigin",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.88,
        mappingReason:
          "Country and location of origin are foundational for marine-resource traceability and sustainable sourcing claims.",
      },
      {
        attributeName: "harvestDate",
        gs1Standard: "GDSN",
        data_type: "date",
        mappingConfidence: 0.8,
        mappingReason:
          "Harvest date provides event timing needed to evidence seafood provenance and responsible sourcing windows.",
      },
      {
        attributeName: "batchNumber",
        gs1Standard: "EPCIS",
        data_type: "narrative",
        mappingConfidence: 0.75,
        mappingReason:
          "Batch or lot identity supports chain-of-custody evidence for seafood traceability across handling events.",
      },
    ],
  },
  {
    esrsPattern: "E4-2_*",
    esrs_standard: "E4",
    topic: "Deforestation-free sourcing and agricultural traceability",
    matchTerms: [
      "Deforestation-free sourcing",
      "GS1 supports origin and certification data",
      "GS1 Traceability supports EUDR",
      "Traceability for biodiversity impact",
      "Agricultural product traceability",
      "GS1 Fresh Foods enables farm-to-fork",
      "Deforestation-free Supply Chain",
    ],
    gs1Attributes: [
      {
        attributeName: "countryOfOrigin",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.94,
        mappingReason:
          "Origin data is central to deforestation-free and biodiversity-sensitive sourcing claims under EUDR-adjacent reporting patterns.",
      },
      {
        attributeName: "supplierInformation",
        gs1Standard: "GLN",
        data_type: "narrative",
        mappingConfidence: 0.9,
        mappingReason:
          "Supplier identification is necessary to map upstream biodiversity and deforestation impacts across the supply chain.",
      },
      {
        attributeName: "organicCertification",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.84,
        mappingReason:
          "Certification and sustainability claims are practical evidence hooks for deforestation-free and agricultural sourcing assertions.",
      },
      {
        attributeName: "harvestDate",
        gs1Standard: "GDSN",
        data_type: "date",
        mappingConfidence: 0.79,
        mappingReason:
          "Harvest timing helps anchor agricultural provenance and seasonal sourcing evidence for biodiversity-sensitive products.",
      },
    ],
  },
  {
    esrsPattern: "E5-1_*",
    esrs_standard: "E5",
    topic: "Material composition and recycled content",
    gs1Attributes: [
      {
        attributeName: "primaryMaterialType",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.85,
        mappingReason:
          "Primary material composition is modelled in GDSN packaging and product description modules and is central to ESRS E5.",
      },
      {
        attributeName: "recycledContentPercentage",
        gs1Standard: "GDSN",
        data_type: "percentage",
        unit: "percent",
        mappingConfidence: 0.9,
        mappingReason:
          "Percentage of recycled content is a key circular economy metric and aligns directly with ESRS E5 datapoints.",
      },
    ],
  },
  {
    esrsPattern: "E5-1_*",
    esrs_standard: "E5",
    topic: "Resource inflows and outflows, material flow, and circular asset tracking",
    matchTerms: [
      "Resource inflows and outflows",
      "EPCIS enables material flow tracking",
      "Returnable asset tracking",
      "GRAI enables circular asset management",
    ],
    gs1Attributes: [
      {
        attributeName: "materialComposition",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.9,
        mappingReason:
          "Material composition is the clearest GS1-native evidence for circular material flow and resource-inflow disclosures.",
      },
      {
        attributeName: "recycledContentPercentage",
        gs1Standard: "GDSN",
        data_type: "percentage",
        unit: "percent",
        mappingConfidence: 0.86,
        mappingReason:
          "Recycled content supports both circular inflow reporting and resource-efficiency analysis for product and packaging flows.",
      },
      {
        attributeName: "serialNumber",
        gs1Standard: "GRAI",
        data_type: "narrative",
        mappingConfidence: 0.78,
        mappingReason:
          "Serialized asset identifiers are a practical evidence path for returnable asset reuse and lifecycle circulation tracking.",
      },
    ],
  },
  {
    esrsPattern: "E5-2_*",
    esrs_standard: "E5",
    topic: "Packaging recyclability and end-of-life",
    gs1Attributes: [
      {
        attributeName: "packagingRecyclabilityClass",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.75,
        mappingReason:
          "Recyclability classification of packaging aligns with GS1 packaging attribute sets and supports ESRS and PPWR alignment.",
      },
      {
        attributeName: "packagingMaterialTypeCode",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.65,
        mappingReason:
          "GS1 packaging material type codes can approximate ESRS indicators on material recyclability, but there may be gaps in granularity.",
      },
    ],
  },
  {
    esrsPattern: "E5-2_*",
    esrs_standard: "E5",
    topic: "Repair, recycling, and end-of-life information access",
    matchTerms: [
      "Repair and recycling information access",
      "Digital Link enables repair/recycle info",
      "Product Recyclability",
      "Resource Outflows - Recyclability",
    ],
    gs1Attributes: [
      {
        attributeName: "repairabilityScore",
        gs1Standard: "GDSN",
        data_type: "quantitative",
        mappingConfidence: 0.91,
        mappingReason:
          "Repairability score is a direct product-level signal for circularity and downstream end-of-life usability.",
      },
      {
        attributeName: "endOfLifeInstructions",
        gs1Standard: "Digital Link",
        data_type: "narrative",
        mappingConfidence: 0.86,
        mappingReason:
          "End-of-life instructions are a reviewer-usable route for recycling and disposal guidance on DPP-linked products.",
      },
      {
        attributeName: "warrantyInformation",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.76,
        mappingReason:
          "Warranty information supports repairability and durability narratives that underpin circular-economy reuse claims.",
      },
    ],
  },
  {
    esrsPattern: "E5-7_*",
    esrs_standard: "E5",
    topic: "Digital Product Passport data carrier and product-passport access",
    matchTerms: [
      "Digital Product Passport data carrier",
      "Digital Link enables DPP access",
      "Digital Product Passport - Textile",
      "Digital Product Passport - Electronics",
      "Textile DPP",
      "Electronics DPP",
    ],
    gs1Attributes: [
      {
        attributeName: "gtin",
        gs1Standard: "GTIN",
        data_type: "narrative",
        mappingConfidence: 0.94,
        mappingReason:
          "GTIN is the baseline product identifier for DPP entry points and product-model level passport resolution.",
      },
      {
        attributeName: "serialNumber",
        gs1Standard: "Digital Link",
        data_type: "narrative",
        mappingConfidence: 0.9,
        mappingReason:
          "Serial numbers enable instance-level Digital Link resolution for product passports on individual items.",
      },
      {
        attributeName: "materialComposition",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.82,
        mappingReason:
          "Material composition is one of the most common passport payloads for textiles and electronics.",
      },
      {
        attributeName: "batteryInformation",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.78,
        mappingReason:
          "Battery information is a practical passport field for electronics and battery-adjacent products.",
      },
    ],
  },
  {
    esrsPattern: "S1-1_*",
    esrs_standard: "S1",
    topic: "Total workforce (headcount and FTE)",
    gs1Attributes: [
      {
        attributeName: "totalNumberOfEmployees",
        gs1Standard: "GDM",
        data_type: "quantitative",
        mappingConfidence: 0.85,
        mappingReason:
          "Headcount metrics for own workforce can be represented as numeric attributes at company level in canonical ESG data models.",
      },
      {
        attributeName: "headcountReportingDate",
        gs1Standard: "GDM",
        data_type: "date",
        mappingConfidence: 0.8,
        mappingReason:
          "Reporting date for headcount aligns with corporate ESG data structures that mirror CSRD/ESRS reporting conventions.",
      },
    ],
  },
  {
    esrsPattern: "S1-2_*",
    esrs_standard: "S1",
    topic: "Gender diversity in management and workforce",
    gs1Attributes: [
      {
        attributeName: "femaleManagementSharePercentage",
        gs1Standard: "GDM",
        data_type: "percentage",
        unit: "percent",
        mappingConfidence: 0.82,
        mappingReason:
          "Share of women in management is a key ESRS S1 diversity indicator and maps naturally to percentage attributes.",
      },
      {
        attributeName: "diversityPolicyDescription",
        gs1Standard: "GDM",
        data_type: "narrative",
        mappingConfidence: 0.7,
        mappingReason:
          "Narrative description of diversity policies can use text attributes in company-level ESG data models.",
      },
    ],
  },
  {
    esrsPattern: "S1-3_*",
    esrs_standard: "S1",
    topic: "Supply chain due diligence and human-rights traceability",
    matchTerms: [
      "Supply chain due diligence",
      "EPCIS supports supply chain transparency",
      "Human rights due diligence traceability",
      "GS1 Traceability supports CSDDD",
    ],
    gs1Attributes: [
      {
        attributeName: "supplierInformation",
        gs1Standard: "GLN",
        data_type: "narrative",
        mappingConfidence: 0.9,
        mappingReason:
          "Supplier information is the clearest GS1-aligned evidence path for human-rights due-diligence coverage across supply-chain tiers.",
      },
      {
        attributeName: "gln",
        gs1Standard: "GLN",
        data_type: "narrative",
        mappingConfidence: 0.86,
        mappingReason:
          "GLN provides stable party and location identity for supply-chain transparency and escalation analysis.",
      },
      {
        attributeName: "countryOfOrigin",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.78,
        mappingReason:
          "Origin and sourcing context improve due-diligence traceability where supplier risk is location-sensitive.",
      },
    ],
  },
  {
    esrsPattern: "S2-1_*",
    esrs_standard: "S2",
    topic: "Supplier identification and value chain mapping",
    matchTerms: [
      "Value chain mapping",
      "GLN enables supplier identification",
    ],
    gs1Attributes: [
      {
        attributeName: "gln",
        gs1Standard: "GLN",
        data_type: "narrative",
        mappingConfidence: 0.95,
        mappingReason:
          "GLN is the most direct GS1-native identifier for supplier and site mapping across the value chain.",
      },
      {
        attributeName: "supplierInformation",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.9,
        mappingReason:
          "Supplier information provides the business context required to operationalise value-chain mapping and stakeholder analysis.",
      },
      {
        attributeName: "countryOfOrigin",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.74,
        mappingReason:
          "Origin data complements supplier mapping when value-chain risk analysis depends on geography.",
      },
    ],
  },
  {
    esrsPattern: "ESRS2-1_*",
    esrs_standard: "ESRS 2",
    topic: "Value chain description and standardised business vocabulary",
    matchTerms: [
      "Description of value chain",
      "GLN supports value chain documentation",
      "Standardized business vocabulary",
      "CBV ensures data consistency",
    ],
    gs1Attributes: [
      {
        attributeName: "gln",
        gs1Standard: "GLN",
        data_type: "narrative",
        mappingConfidence: 0.9,
        mappingReason:
          "GLN anchors value-chain documentation to stable party and location identities across enterprise boundaries.",
      },
      {
        attributeName: "supplierInformation",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.84,
        mappingReason:
          "Supplier information carries the descriptive business context needed to narrate value-chain structure and dependencies.",
      },
      {
        attributeName: "gtin",
        gs1Standard: "GTIN",
        data_type: "narrative",
        mappingConfidence: 0.76,
        mappingReason:
          "GTIN provides the item-level anchor needed when value-chain documentation is tied to concrete product flows.",
      },
    ],
  },
  {
    esrsPattern: "S4-1_*",
    esrs_standard: "S4",
    topic: "Healthcare product traceability and patient safety",
    matchTerms: [
      "Healthcare product traceability",
      "GS1 Healthcare enables patient safety",
    ],
    gs1Attributes: [
      {
        attributeName: "gtin",
        gs1Standard: "GTIN",
        data_type: "narrative",
        mappingConfidence: 0.92,
        mappingReason:
          "GTIN is the baseline healthcare product identifier for patient-safety and regulated product traceability workflows.",
      },
      {
        attributeName: "serialNumber",
        gs1Standard: "GS1 Digital Link",
        data_type: "narrative",
        mappingConfidence: 0.88,
        mappingReason:
          "Serialisation is required for healthcare traceability and adverse-event investigation at the item level.",
      },
      {
        attributeName: "expirationDate",
        gs1Standard: "GDSN",
        data_type: "date",
        mappingConfidence: 0.82,
        mappingReason:
          "Expiration date is a reviewer-usable patient-safety field for medical-device and pharmaceutical lifecycle control.",
      },
      {
        attributeName: "sterilizationMethod",
        gs1Standard: "GDSN",
        data_type: "narrative",
        mappingConfidence: 0.76,
        mappingReason:
          "Sterilization metadata is relevant for healthcare product safety and downstream traceability evidence.",
      },
    ],
  },
];
