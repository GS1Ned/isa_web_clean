
import { describe, it, expect } from "vitest";
import type {
  EPCISValidationResult,
  EPCISEventLike
} from "./epcis-validator";
import { validateEPCISEvent } from "./epcis-validator";

function buildValidObjectEvent(): EPCISEventLike {
  return {
    type: "ObjectEvent",
    eventTime: "2025-12-11T10:00:00Z",
    eventTimeZoneOffset: "+01:00",
    epcList: ["urn:epc:id:sgtin:0614141.107346.2017"],
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:shipping",
    disposition: "urn:epcglobal:cbv:disp:in_transit",
    readPoint: {
      id: "urn:epc:id:sgln:0614141.00777.0",
      geo: {
        latitude: 52.37,
        longitude: 4.89
      }
    },
    sensorElementList: [
      {
        sensorReport: [
          {
            type: "gs1:MT-CarbonFootprint"
          }
        ]
      }
    ]
  };
}

describe("validateEPCISEvent - basic schema", () => {
  it("accepts a valid ObjectEvent with required fields", () => {
    const event = buildValidObjectEvent();
    const result: EPCISValidationResult = validateEPCISEvent(event);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("rejects payloads that are not objects", () => {
    const result = validateEPCISEvent(undefined as unknown as EPCISEventLike);
    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.code === "EVENT_NOT_OBJECT")).toBe(
      true
    );
  });

  it("rejects unsupported event type", () => {
    const event: EPCISEventLike = {
      type: "UnknownEvent",
      eventTime: "2025-12-11T10:00:00Z",
      eventTimeZoneOffset: "+01:00",
      action: "ADD"
    };
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "EVENT_TYPE_INVALID")
    ).toBe(true);
  });

  it("rejects missing required fields for ObjectEvent", () => {
    const event: EPCISEventLike = {
      type: "ObjectEvent"
    };
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "FIELD_REQUIRED")
    ).toBe(true);
  });
});

describe("validateEPCISEvent - time and timezone", () => {
  it("rejects invalid eventTime string", () => {
    const event = buildValidObjectEvent();
    event.eventTime = "not-a-date";
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "EVENT_TIME_INVALID")
    ).toBe(true);
  });

  it("rejects missing eventTimeZoneOffset", () => {
    const event = buildValidObjectEvent();
    delete (event as Record<string, unknown>).eventTimeZoneOffset;
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "TIMEZONE_OFFSET_MISSING")
    ).toBe(true);
  });

  it("rejects invalid eventTimeZoneOffset format", () => {
    const event = buildValidObjectEvent();
    event.eventTimeZoneOffset = "0100";
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "TIMEZONE_OFFSET_INVALID")
    ).toBe(true);
  });
});

describe("validateEPCISEvent - EPC and CBV checks", () => {
  it("rejects invalid EPC URN format", () => {
    const event = buildValidObjectEvent();
    event.epcList = ["not-a-urn"];
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "EPC_FORMAT_INVALID")
    ).toBe(true);
  });

  it("rejects non string EPC values", () => {
    const event = buildValidObjectEvent();
    event.epcList = [123 as unknown as string];
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "EPC_NOT_STRING")
    ).toBe(true);
  });

  it("rejects invalid action value", () => {
    const event = buildValidObjectEvent();
    event.action = "INVALID";
    const result = validateEPCISEvent(event);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "ACTION_INVALID")
    ).toBe(true);
  });
});

describe("validateEPCISEvent - ESG compliance", () => {
  it("flags missing geolocation for EUDR", () => {
    const event = buildValidObjectEvent();
    if (event.readPoint) {
      delete event.readPoint.geo;
    }
    const result = validateEPCISEvent(event, { regulation: "EUDR" });
    expect(result.compliance.EUDR).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "EUDR_GEO_MISSING")
    ).toBe(true);
  });

  it("flags missing readPoint for EUDR", () => {
    const event = buildValidObjectEvent();
    delete (event as Record<string, unknown>).readPoint;
    const result = validateEPCISEvent(event, { regulation: "EUDR" });
    expect(result.compliance.EUDR).toBe(false);
    expect(
      result.errors.some(issue => issue.code === "EUDR_FIELD_REQUIRED")
    ).toBe(true);
  });

  it("flags non DPP lifecycle bizStep as warning", () => {
    const event = buildValidObjectEvent();
    event.bizStep = "urn:epcglobal:cbv:bizstep:packing";
    const result = validateEPCISEvent(event, { regulation: "DPP" });
    expect(result.compliance.DPP).toBe(false);
    expect(
      result.warnings.some(issue => issue.code === "DPP_BIZSTEP_UNEXPECTED")
    ).toBe(true);
  });

  it("flags missing bizStep for DPP", () => {
    const event = buildValidObjectEvent();
    delete (event as Record<string, unknown>).bizStep;
    const result = validateEPCISEvent(event, { regulation: "DPP" });
    expect(result.compliance.DPP).toBe(false);
    expect(
      result.warnings.some(issue => issue.code === "DPP_BIZSTEP_MISSING")
    ).toBe(true);
  });

  it("flags missing carbon footprint sensor for CSRD", () => {
    const event = buildValidObjectEvent();
    delete (event as Record<string, unknown>).sensorElementList;
    const result = validateEPCISEvent(event, { regulation: "CSRD" });
    expect(result.compliance.CSRD).toBe(false);
    expect(
      result.warnings.some(
        issue => issue.code === "CSRD_CARBON_SENSOR_MISSING"
      )
    ).toBe(true);
  });

  it("reports compliance summary for fully compliant event", () => {
    const event = buildValidObjectEvent();
    const result = validateEPCISEvent(event);
    expect(result.compliance.EUDR).toBe(true);
    expect(result.compliance.DPP).toBe(true);
    expect(result.compliance.CSRD).toBe(true);
  });
});

