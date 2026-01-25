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
  gs1Attributes: Omit<GS1AttributeMapping, "exampleValue">[];
}

/**
 * Static mapping rules covering key ESRS standards:
 *
 * - E1: Climate change (GHG emissions, energy use)
 * - E2: Pollution
 * - E3: Water and marine resources
 * - E5: Resource use and circular economy
 * - S1: Own workforce
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
];
