
export type EPCISEventType =
  | "ObjectEvent"
  | "AggregationEvent"
  | "TransformationEvent"
  | "TransactionEvent";

export type EPCISRegulation = "EUDR" | "DPP" | "CSRD";

export type EPCISIssueSeverity = "error" | "warning";

export interface EPCISEventRequiredFieldRule {
  eventType: EPCISEventType;
  fields: string[];
}

export interface EPCISESGRule {
  regulation: EPCISRegulation;
  code: string;
  description: string;
}

export const EPCIS_REQUIRED_FIELDS: EPCISEventRequiredFieldRule[] = [
  {
    eventType: "ObjectEvent",
    fields: ["eventTime", "eventTimeZoneOffset", "epcList", "action"]
  },
  {
    eventType: "AggregationEvent",
    fields: ["eventTime", "eventTimeZoneOffset", "parentID", "action"]
  },
  {
    eventType: "TransformationEvent",
    fields: [
      "eventTime",
      "eventTimeZoneOffset",
      "inputEPCList",
      "outputEPCList"
    ]
  },
  {
    eventType: "TransactionEvent",
    fields: ["eventTime", "eventTimeZoneOffset", "epcList", "action"]
  }
];

export const EPCIS_ALLOWED_ACTIONS: string[] = ["ADD", "OBSERVE", "DELETE"];

export const EPCIS_EUDR_REQUIRED_FIELDS: string[] = ["readPoint"];

export const EPCIS_DPP_REQUIRED_BIZ_STEPS: string[] = [
  "urn:epcglobal:cbv:bizstep:commissioning",
  "urn:epcglobal:cbv:bizstep:shipping",
  "urn:epcglobal:cbv:bizstep:receiving",
  "urn:epcglobal:cbv:bizstep:decommissioning"
];

export const EPCIS_CSRD_REQUIRED_SENSOR_TYPE = "gs1:MT-CarbonFootprint";

export const EPCIS_ESG_RULES: EPCISESGRule[] = [
  {
    regulation: "EUDR",
    code: "EUDR_GEO_REQUIRED",
    description:
      "EUDR requires geolocation information at readPoint for traceability."
  },
  {
    regulation: "DPP",
    code: "DPP_BIZSTEP_REQUIRED",
    description:
      "Digital Product Passport requires specific commissioning and lifecycle bizSteps."
  },
  {
    regulation: "CSRD",
    code: "CSRD_CARBON_SENSOR_REQUIRED",
    description:
      "CSRD requires carbon footprint measurement sensor data for Scope 3 relevant events."
  }
];

