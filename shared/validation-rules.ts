
export type ValidationIssueLevel = "error" | "warning";

export interface ValidationIssueDefinition {
  field: string;
  code: string;
  message: string;
  level: ValidationIssueLevel;
}

export interface CustomValidationRule {
  field: string;
  validate: (value: unknown) => ValidationIssueDefinition[];
}

export const ESRS_TOPIC_CODES: string[] = [
  "E1",
  "E2",
  "E3",
  "E4",
  "E5",
  "S1",
  "S2",
  "S3",
  "G1"
];

export const SECTOR_CODES: string[] = [
  "food",
  "retail",
  "manufacturing",
  "generic"
];

