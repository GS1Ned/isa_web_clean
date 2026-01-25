import { XMLParser } from "fast-xml-parser";

/**
 * EPCIS XML to JSON Converter
 * Converts EPCIS 2.0 XML documents to JSON format compatible with ISA's data model
 */

export interface EPCISDocument {
  "@context": string;
  type: string;
  schemaVersion: string;
  creationDate: string;
  epcisBody: {
    eventList: any[];
  };
}

/**
 * Parse EPCIS 2.0 XML document and convert to JSON
 */
export function parseEPCISXML(xmlString: string): EPCISDocument {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseAttributeValue: true,
    trimValues: true,
  });

  const parsed = parser.parse(xmlString);

  // Handle different XML root elements
  const epcisDoc =
    parsed["epcis:EPCISDocument"] || parsed.EPCISDocument || parsed;

  // Extract header information
  const _header = epcisDoc["EPCISHeader"] || epcisDoc["epcis:EPCISHeader"] || {};
  const body = epcisDoc["EPCISBody"] || epcisDoc["epcis:EPCISBody"] || {};
  const eventList = body["EventList"] || body["epcis:EventList"] || {};

  // Extract events (handle both single event and array)
  let events: any[] = [];
  const eventTypes = [
    "ObjectEvent",
    "AggregationEvent",
    "TransactionEvent",
    "TransformationEvent",
    "AssociationEvent",
  ];

  for (const eventType of eventTypes) {
    const xmlEvents = eventList[eventType] || eventList[`epcis:${eventType}`];
    if (xmlEvents) {
      const eventsArray = Array.isArray(xmlEvents) ? xmlEvents : [xmlEvents];
      events = events.concat(
        eventsArray.map(event => convertEventToJSON(event, eventType))
      );
    }
  }

  // Build JSON document
  const jsonDoc: EPCISDocument = {
    "@context":
      "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    type: "EPCISDocument",
    schemaVersion: epcisDoc["@_schemaVersion"] || "2.0",
    creationDate: epcisDoc["@_creationDate"] || new Date().toISOString(),
    epcisBody: {
      eventList: events,
    },
  };

  return jsonDoc;
}

/**
 * Convert individual EPCIS event from XML to JSON format
 */
function convertEventToJSON(xmlEvent: any, eventType: string): any {
  const jsonEvent: any = {
    type: eventType,
    eventTime: xmlEvent.eventTime || xmlEvent["epcis:eventTime"],
    eventTimeZoneOffset:
      xmlEvent.eventTimeZoneOffset ||
      xmlEvent["epcis:eventTimeZoneOffset"] ||
      "+00:00",
  };

  // Common fields
  if (xmlEvent.action || xmlEvent["epcis:action"]) {
    jsonEvent.action = xmlEvent.action || xmlEvent["epcis:action"];
  }

  if (xmlEvent.bizStep || xmlEvent["epcis:bizStep"]) {
    jsonEvent.bizStep = xmlEvent.bizStep || xmlEvent["epcis:bizStep"];
  }

  if (xmlEvent.disposition || xmlEvent["epcis:disposition"]) {
    jsonEvent.disposition =
      xmlEvent.disposition || xmlEvent["epcis:disposition"];
  }

  if (xmlEvent.readPoint || xmlEvent["epcis:readPoint"]) {
    const readPoint = xmlEvent.readPoint || xmlEvent["epcis:readPoint"];
    jsonEvent.readPoint = readPoint.id || readPoint["epcis:id"] || readPoint;
  }

  if (xmlEvent.bizLocation || xmlEvent["epcis:bizLocation"]) {
    const bizLocation = xmlEvent.bizLocation || xmlEvent["epcis:bizLocation"];
    jsonEvent.bizLocation =
      bizLocation.id || bizLocation["epcis:id"] || bizLocation;
  }

  // EPC List
  const epcList = xmlEvent.epcList || xmlEvent["epcis:epcList"];
  if (epcList) {
    const epcs = epcList.epc || epcList["epcis:epc"];
    jsonEvent.epcList = Array.isArray(epcs) ? epcs : epcs ? [epcs] : [];
  }

  // Quantity List
  const quantityList = xmlEvent.quantityList || xmlEvent["epcis:quantityList"];
  if (quantityList) {
    const quantities =
      quantityList.quantityElement || quantityList["epcis:quantityElement"];
    const quantityArray = Array.isArray(quantities)
      ? quantities
      : quantities
        ? [quantities]
        : [];
    jsonEvent.quantityList = quantityArray.map((q: any) => ({
      epcClass: q.epcClass || q["epcis:epcClass"],
      quantity: parseFloat(q.quantity || q["epcis:quantity"] || "0"),
      uom: q.uom || q["epcis:uom"],
    }));
  }

  // Source List
  const sourceList = xmlEvent.sourceList || xmlEvent["epcis:sourceList"];
  if (sourceList) {
    const sources = sourceList.source || sourceList["epcis:source"];
    const sourceArray = Array.isArray(sources)
      ? sources
      : sources
        ? [sources]
        : [];
    jsonEvent.sourceList = sourceArray.map((s: any) => ({
      type: s["@_type"] || "owning_party",
      source: s["#text"] || s,
    }));
  }

  // Destination List
  const destinationList =
    xmlEvent.destinationList || xmlEvent["epcis:destinationList"];
  if (destinationList) {
    const destinations =
      destinationList.destination || destinationList["epcis:destination"];
    const destArray = Array.isArray(destinations)
      ? destinations
      : destinations
        ? [destinations]
        : [];
    jsonEvent.destinationList = destArray.map((d: any) => ({
      type: d["@_type"] || "owning_party",
      destination: d["#text"] || d,
    }));
  }

  // ILMD (Instance/Lot Master Data)
  const ilmd = xmlEvent.ilmd || xmlEvent["epcis:ilmd"];
  if (ilmd) {
    jsonEvent.ilmd = ilmd;
  }

  // Sensor Element List
  const sensorElementList =
    xmlEvent.sensorElementList || xmlEvent["epcis:sensorElementList"];
  if (sensorElementList) {
    const sensorElements =
      sensorElementList.sensorElement ||
      sensorElementList["epcis:sensorElement"];
    const sensorArray = Array.isArray(sensorElements)
      ? sensorElements
      : sensorElements
        ? [sensorElements]
        : [];
    jsonEvent.sensorElementList = sensorArray.map((se: any) => ({
      sensorMetadata: se.sensorMetadata || se["epcis:sensorMetadata"],
      sensorReport: se.sensorReport || se["epcis:sensorReport"],
    }));
  }

  // Transformation-specific fields
  if (eventType === "TransformationEvent") {
    const inputEPCList =
      xmlEvent.inputEPCList || xmlEvent["epcis:inputEPCList"];
    if (inputEPCList) {
      const inputEPCs = inputEPCList.epc || inputEPCList["epcis:epc"];
      jsonEvent.inputEPCList = Array.isArray(inputEPCs)
        ? inputEPCs
        : inputEPCs
          ? [inputEPCs]
          : [];
    }

    const outputEPCList =
      xmlEvent.outputEPCList || xmlEvent["epcis:outputEPCList"];
    if (outputEPCList) {
      const outputEPCs = outputEPCList.epc || outputEPCList["epcis:epc"];
      jsonEvent.outputEPCList = Array.isArray(outputEPCs)
        ? outputEPCs
        : outputEPCs
          ? [outputEPCs]
          : [];
    }
  }

  // Aggregation-specific fields
  if (eventType === "AggregationEvent") {
    const parentID = xmlEvent.parentID || xmlEvent["epcis:parentID"];
    if (parentID) {
      jsonEvent.parentID = parentID;
    }

    const childEPCs = xmlEvent.childEPCs || xmlEvent["epcis:childEPCs"];
    if (childEPCs) {
      const epcs = childEPCs.epc || childEPCs["epcis:epc"];
      jsonEvent.childEPCs = Array.isArray(epcs) ? epcs : epcs ? [epcs] : [];
    }
  }

  return jsonEvent;
}

/**
 * Detect if input string is XML or JSON
 */
export function detectFormat(input: string): "xml" | "json" {
  const trimmed = input.trim();
  if (trimmed.startsWith("<")) {
    return "xml";
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }
  throw new Error("Unable to detect format: input must be XML or JSON");
}
