export type ESRSMaterialityLevel = "mandatory" | "high" | "medium" | "low";

export interface ESRSDatapoint {
  id: string;
  topic: string;
  label: string;
  sectorTags: string[];
  materiality: ESRSMaterialityLevel;
  supportedStandards: string[];
}

export const ESRS_DATAPOINT_CATALOG: ESRSDatapoint[] = [
  {
    id: "E1-1_01",
    topic: "E1",
    label: "Gross Scope 1 GHG emissions",
    sectorTags: ["generic", "food"],
    materiality: "mandatory",
    supportedStandards: ["GDSN", "EPCIS"]
  },
  {
    id: "E1-2_01",
    topic: "E1",
    label: "Gross Scope 2 GHG emissions",
    sectorTags: ["generic", "food"],
    materiality: "mandatory",
    supportedStandards: ["GDSN"]
  },
  {
    id: "E1-3_01",
    topic: "E1",
    label: "Gross Scope 3 GHG emissions",
    sectorTags: ["generic", "food", "retail"],
    materiality: "high",
    supportedStandards: ["GDSN", "EPCIS"]
  },
  {
    id: "E1-5_01",
    topic: "E1",
    label: "Energy consumption by source",
    sectorTags: ["generic", "manufacturing"],
    materiality: "high",
    supportedStandards: ["GDSN"]
  },
  {
    id: "E1-7_01",
    topic: "E1",
    label: "Internal carbon price",
    sectorTags: ["generic"],
    materiality: "medium",
    supportedStandards: []
  },
  {
    id: "E2-3_01",
    topic: "E2",
    label: "Air pollutant emissions (NOx, SOx)",
    sectorTags: ["generic", "manufacturing"],
    materiality: "high",
    supportedStandards: ["GDSN"]
  },
  {
    id: "E2-5_01",
    topic: "E2",
    label: "Water pollutants discharged",
    sectorTags: ["food", "generic"],
    materiality: "medium",
    supportedStandards: []
  },
  {
    id: "E2-6_01",
    topic: "E2",
    label: "Hazardous waste generation",
    sectorTags: ["generic"],
    materiality: "medium",
    supportedStandards: ["GDSN"]
  },
  {
    id: "S1-1_01",
    topic: "S1",
    label: "Total employees (headcount)",
    sectorTags: ["generic", "food", "retail"],
    materiality: "mandatory",
    supportedStandards: ["GDSN"]
  },
  {
    id: "S1-3_01",
    topic: "S1",
    label: "Work related injuries",
    sectorTags: ["generic", "manufacturing"],
    materiality: "high",
    supportedStandards: ["GDSN"]
  },
  {
    id: "S1-5_01",
    topic: "S1",
    label: "Gender diversity in leadership",
    sectorTags: ["generic"],
    materiality: "medium",
    supportedStandards: []
  },
  {
    id: "S1-6_01",
    topic: "S1",
    label: "Training hours per employee",
    sectorTags: ["generic", "food"],
    materiality: "low",
    supportedStandards: ["GDSN"]
  }
];

