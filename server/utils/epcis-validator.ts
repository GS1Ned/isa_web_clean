
import type {
  EPCISEventType,
  EPCISRegulation,
  EPCISIssueSeverity
} from "../../shared/epcis-validation-rules";
import {
  EPCIS_REQUIRED_FIELDS,
  EPCIS_ALLOWED_ACTIONS,
  EPCIS_EUDR_REQUIRED_FIELDS,
  EPCIS_DPP_REQUIRED_BIZ_STEPS,
  EPCIS_CSRD_REQUIRED_SENSOR_TYPE
} from "../../shared/epcis-validation-rules";
import * as EPCISCBV from "../../shared/epcis-cbv-types";

export interface EPCISValidationIssue {
  field: string;
  code: string;
  message: string;
  severity: EPCISIssueSeverity;
}

export interface EPCISComplianceSummary {
  EUDR: boolean;
  DPP: boolean;
  CSRD: boolean;
}

export interface EPCISValidationResult {
  valid: boolean;
  errors: EPCISValidationIssue[];
  warnings: EPCISValidationIssue[];
  compliance: EPCISComplianceSummary;
}

export interface EPCISValidationOptions {
  regulation?: EPCISRegulation;
}

export interface EPCISEventLike {
  type?: EPCISEventType | string;
  eventTime?: string;
  eventTimeZoneOffset?: string;
  epcList?: string[];
  quantityList?: unknown[];
  parentID?: string;
  inputEPCList?: string[];
  outputEPCList?: string[];
  action?: string;
  bizStep?: string;
  disposition?: string;
  readPoint?: {
    id?: string;
    geo?: {
      latitude?: number;
      longitude?: number;
    };
  };
  sensorElementList?: Array<{
    sensorReport?: Array<{
      type?: string;
    }>;
  }>;
  [key: string]: unknown;
}

function getAllowedBizSteps(): string[] {
  const anyCBV = EPCISCBV as unknown as {
    BIZ_STEPS?: string[];
    CBV_BIZ_STEPS?: string[];
  };
  if (anyCBV.BIZ_STEPS && Array.isArray(anyCBV.BIZ_STEPS)) {
    return anyCBV.BIZ_STEPS;
  }
  if (anyCBV.CBV_BIZ_STEPS && Array.isArray(anyCBV.CBV_BIZ_STEPS)) {
    return anyCBV.CBV_BIZ_STEPS;
  }
  return [];
}

function getAllowedDispositions(): string[] {
  const anyCBV = EPCISCBV as unknown as {
    DISPOSITIONS?: string[];
    CBV_DISPOSITIONS?: string[];
  };
  if (anyCBV.DISPOSITIONS && Array.isArray(anyCBV.DISPOSITIONS)) {
    return anyCBV.DISPOSITIONS;
  }
  if (anyCBV.CBV_DISPOSITIONS && Array.isArray(anyCBV.CBV_DISPOSITIONS)) {
    return anyCBV.CBV_DISPOSITIONS;
  }
  return [];
}

function createIssue(
  field: string,
  code: string,
  message: string,
  severity: EPCISIssueSeverity
): EPCISValidationIssue {
  return {
    field,
    code,
    message,
    severity
  };
}

function isSupportedEventType(value: unknown): value is EPCISEventType {
  return (
    value === "ObjectEvent" ||
    value === "AggregationEvent" ||
    value === "TransformationEvent" ||
    value === "TransactionEvent"
  );
}

function validateEventTime(
  eventTime: unknown,
  issues: EPCISValidationIssue[]
): void {
  if (typeof eventTime !== "string") {
    issues.push(
      createIssue(
        "eventTime",
        "EVENT_TIME_MISSING",
        "eventTime must be an ISO 8601 string.",
        "error"
      )
    );
    return;
  }

  const timestamp = Date.parse(eventTime);
  if (Number.isNaN(timestamp)) {
    issues.push(
      createIssue(
        "eventTime",
        "EVENT_TIME_INVALID",
        "eventTime must be a valid ISO 8601 datetime string.",
        "error"
      )
    );
  }
}

function validateEventTimeZoneOffset(
  offset: unknown,
  issues: EPCISValidationIssue[]
): void {
  if (typeof offset !== "string") {
    issues.push(
      createIssue(
        "eventTimeZoneOffset",
        "TIMEZONE_OFFSET_MISSING",
        "eventTimeZoneOffset must be a string in ±HH:MM format.",
        "error"
      )
    );
    return;
  }

  const pattern = /^[+-](0\d|1\d|2[0-3]):[0-5]\d$/;
  if (!pattern.test(offset)) {
    issues.push(
      createIssue(
        "eventTimeZoneOffset",
        "TIMEZONE_OFFSET_INVALID",
        "eventTimeZoneOffset must be in ±HH:MM format.",
        "error"
      )
    );
  }
}

function validateRequiredFields(
  event: EPCISEventLike,
  type: EPCISEventType,
  issues: EPCISValidationIssue[]
): void {
  const rule = EPCIS_REQUIRED_FIELDS.find(
    item => item.eventType === type
  );
  if (!rule) {
    return;
  }

  rule.fields.forEach(fieldName => {
    const value = (event as Record<string, unknown>)[fieldName];
    if (value === undefined || value === null) {
      issues.push(
        createIssue(
          fieldName,
          "FIELD_REQUIRED",
          "Field " + fieldName + " is required for " + type + ".",
          "error"
        )
      );
    }
  });
}

function validateAction(action: unknown, issues: EPCISValidationIssue[]): void {
  if (typeof action !== "string") {
    issues.push(
      createIssue(
        "action",
        "ACTION_MISSING",
        "action must be one of " + EPCIS_ALLOWED_ACTIONS.join(", ") + ".",
        "error"
      )
    );
    return;
  }

  if (EPCIS_ALLOWED_ACTIONS.indexOf(action) === -1) {
    issues.push(
      createIssue(
        "action",
        "ACTION_INVALID",
        "action value " + action + " is not allowed.",
        "error"
      )
    );
  }
}

function validateEpcIdentifierFormat(
  epc: string,
  index: number,
  issues: EPCISValidationIssue[]
): void {
  const sgtinPattern = /^urn:epc:id:sgtin:[0-9]+\.[0-9]+\.[0-9A-Za-z]+$/;
  const ssccPattern = /^urn:epc:id:sscc:[0-9]+\.[0-9]+$/;
  const graiPattern = /^urn:epc:id:grai:[0-9]+\.[0-9]+\.[0-9A-Za-z]+$/;

  const matchesSgtin = sgtinPattern.test(epc);
  const matchesSscc = ssccPattern.test(epc);
  const matchesGrai = graiPattern.test(epc);

  if (!matchesSgtin && !matchesSscc && !matchesGrai) {
    issues.push(
      createIssue(
        "epcList[" + index + "]",
        "EPC_FORMAT_INVALID",
        "EPC " + epc + " is not a valid SGTIN, SSCC or GRAI URN.",
        "error"
      )
    );
  }
}

function validateEpcLists(
  event: EPCISEventLike,
  issues: EPCISValidationIssue[]
): void {
  if (Array.isArray(event.epcList)) {
    event.epcList.forEach((epc, index) => {
      if (typeof epc === "string") {
        validateEpcIdentifierFormat(epc, index, issues);
      } else {
        issues.push(
          createIssue(
            "epcList[" + index + "]",
            "EPC_NOT_STRING",
            "EPC values must be strings.",
            "error"
          )
        );
      }
    });
  }
}

function validateBizStepAndDisposition(
  event: EPCISEventLike,
  issues: EPCISValidationIssue[]
): void {
  const bizStep = event.bizStep;
  const disposition = event.disposition;
  const allowedBizSteps = getAllowedBizSteps();
  const allowedDispositions = getAllowedDispositions();

  if (typeof bizStep === "string" && allowedBizSteps.length > 0) {
    if (allowedBizSteps.indexOf(bizStep) === -1) {
      issues.push(
        createIssue(
          "bizStep",
          "BIZSTEP_INVALID",
          "bizStep " + bizStep + " is not part of the CBV vocabulary.",
          "error"
        )
      );
    }
  }

  if (typeof disposition === "string" && allowedDispositions.length > 0) {
    if (allowedDispositions.indexOf(disposition) === -1) {
      issues.push(
        createIssue(
          "disposition",
          "DISPOSITION_INVALID",
          "disposition " +
            disposition +
            " is not part of the CBV vocabulary.",
          "error"
        )
      );
    }
  }
}

function hasGeoCoordinates(event: EPCISEventLike): boolean {
  const readPoint = event.readPoint;
  if (!readPoint || !readPoint.geo) {
    return false;
  }
  const latitude = readPoint.geo.latitude;
  const longitude = readPoint.geo.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false;
  }
  return true;
}

function hasCarbonFootprintSensor(event: EPCISEventLike): boolean {
  const sensorElementList = event.sensorElementList;
  if (!Array.isArray(sensorElementList)) {
    return false;
  }
  let found = false;
  sensorElementList.forEach(sensorElement => {
    if (found) {
      return;
    }
    const reports = sensorElement.sensorReport;
    if (!Array.isArray(reports)) {
      return;
    }
    reports.forEach(report => {
      if (found) {
        return;
      }
      if (report && report.type === EPCIS_CSRD_REQUIRED_SENSOR_TYPE) {
        found = true;
      }
    });
  });
  return found;
}

function evaluateEudrCompliance(
  event: EPCISEventLike,
  issues: EPCISValidationIssue[]
): boolean {
  let compliant = true;

  EPCIS_EUDR_REQUIRED_FIELDS.forEach(fieldName => {
    const value = (event as Record<string, unknown>)[fieldName];
    if (value === undefined || value === null) {
      issues.push(
        createIssue(
          fieldName,
          "EUDR_FIELD_REQUIRED",
          "Field " + fieldName + " is required to support EUDR traceability.",
          "error"
        )
      );
      compliant = false;
    }
  });

  if (!hasGeoCoordinates(event)) {
    issues.push(
      createIssue(
        "readPoint.geo",
        "EUDR_GEO_MISSING",
        "EUDR requires geolocation coordinates at readPoint.geo.",
        "error"
      )
    );
    compliant = false;
  }

  return compliant;
}

function evaluateDppCompliance(
  event: EPCISEventLike,
  issues: EPCISValidationIssue[]
): boolean {
  const bizStep = event.bizStep;
  if (typeof bizStep !== "string") {
    issues.push(
      createIssue(
        "bizStep",
        "DPP_BIZSTEP_MISSING",
        "Digital Product Passport requires a lifecycle bizStep.",
        "warning"
      )
    );
    return false;
  }

  if (EPCIS_DPP_REQUIRED_BIZ_STEPS.indexOf(bizStep) === -1) {
    issues.push(
      createIssue(
        "bizStep",
        "DPP_BIZSTEP_UNEXPECTED",
        "bizStep " +
          bizStep +
          " is not one of the DPP lifecycle steps (commissioning, shipping, receiving, decommissioning).",
        "warning"
      )
    );
    return false;
  }

  return true;
}

function evaluateCsrdCompliance(
  event: EPCISEventLike,
  issues: EPCISValidationIssue[]
): boolean {
  if (!hasCarbonFootprintSensor(event)) {
    issues.push(
      createIssue(
        "sensorElementList",
        "CSRD_CARBON_SENSOR_MISSING",
        "CSRD Scope 3 support requires a carbon footprint sensor report.",
        "warning"
      )
    );
    return false;
  }
  return true;
}

/**
 * Validate a single EPCIS 2.0 event for schema, CBV and ESG requirements.
 */
export function validateEPCISEvent(
  event: EPCISEventLike,
  options?: EPCISValidationOptions
): EPCISValidationResult {
  const errors: EPCISValidationIssue[] = [];
  const warnings: EPCISValidationIssue[] = [];

  if (!event || typeof event !== "object") {
    errors.push(
      createIssue(
        "",
        "EVENT_NOT_OBJECT",
        "Event payload must be an object.",
        "error"
      )
    );
    return {
      valid: false,
      errors,
      warnings,
      compliance: {
        EUDR: false,
        DPP: false,
        CSRD: false
      }
    };
  }

  const typeValue = event.type;
  if (!isSupportedEventType(typeValue)) {
    errors.push(
      createIssue(
        "type",
        "EVENT_TYPE_INVALID",
        "type must be one of ObjectEvent, AggregationEvent, TransformationEvent or TransactionEvent.",
        "error"
      )
    );
  } else {
    validateRequiredFields(event, typeValue, errors);
  }

  validateEventTime(event.eventTime, errors);
  validateEventTimeZoneOffset(event.eventTimeZoneOffset, errors);
  validateAction(event.action, errors);
  validateEpcLists(event, errors);
  validateBizStepAndDisposition(event, errors);

  const eudrIssues: EPCISValidationIssue[] = [];
  const dppIssues: EPCISValidationIssue[] = [];
  const csrdIssues: EPCISValidationIssue[] = [];

  const eudrCompliant = evaluateEudrCompliance(event, eudrIssues);
  const dppCompliant = evaluateDppCompliance(event, dppIssues);
  const csrdCompliant = evaluateCsrdCompliance(event, csrdIssues);

  const regulationFilter = options?.regulation;

  eudrIssues.forEach(issue => {
    if (!regulationFilter || regulationFilter === "EUDR") {
      if (issue.severity === "error") {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    } else {
      if (issue.severity === "error") {
        warnings.push(issue);
      }
    }
  });

  dppIssues.forEach(issue => {
    if (!regulationFilter || regulationFilter === "DPP") {
      if (issue.severity === "error") {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    } else {
      if (issue.severity === "error") {
        warnings.push(issue);
      }
    }
  });

  csrdIssues.forEach(issue => {
    if (!regulationFilter || regulationFilter === "CSRD") {
      if (issue.severity === "error") {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    } else {
      if (issue.severity === "error") {
        warnings.push(issue);
      }
    }
  });

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    compliance: {
      EUDR: eudrCompliant,
      DPP: dppCompliant,
      CSRD: csrdCompliant
    }
  };
}

