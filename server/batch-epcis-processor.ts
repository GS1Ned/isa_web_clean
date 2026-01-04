import { getDb } from "./db";
import {
  epcisEvents,
  epcisBatchJobs,
  supplyChainNodes,
  supplyChainEdges,
  supplyChainRisks,
  supplyChainAnalytics,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Batch EPCIS Processor
 * Handles asynchronous processing of EPCIS event files
 */

interface EPCISEventData {
  type: string;
  eventTime: string;
  eventTimeZoneOffset?: string;
  action?: string;
  bizStep?: string;
  disposition?: string;
  readPoint?: string;
  bizLocation?: string;
  epcList?: string[];
  quantityList?: any[];
  sourceList?: any[];
  destinationList?: any[];
  ilmd?: any;
}

interface EPCISDocument {
  type: string;
  epcisBody: {
    eventList: EPCISEventData[];
  };
}

/**
 * Parse EPCIS document (JSON or XML)
 */
export function parseEPCISDocument(content: string): EPCISDocument | null {
  try {
    const trimmed = content.trim();

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      // JSON format
      return JSON.parse(content);
    } else if (trimmed.startsWith("<")) {
      // XML format - convert to JSON
      return parseXMLToJSON(content);
    }

    return null;
  } catch (error) {
    serverLogger.error("Failed to parse EPCIS document:", error);
    return null;
  }
}

/**
 * Basic XML to JSON conversion for EPCIS
 */
function parseXMLToJSON(xml: string): EPCISDocument {
  // This is a simplified parser. For production, use a proper XML library
  const eventList: EPCISEventData[] = [];

  // Extract events from XML
  const eventMatches = xml.match(/<ObjectEvent>[\s\S]*?<\/ObjectEvent>/g) || [];
  eventMatches.forEach(eventXml => {
    const event: EPCISEventData = {
      type: "ObjectEvent",
      eventTime:
        extractXMLValue(eventXml, "eventTime") || new Date().toISOString(),
    };

    const action = extractXMLValue(eventXml, "action");
    if (action) event.action = action;

    const bizStep = extractXMLValue(eventXml, "bizStep");
    if (bizStep) event.bizStep = bizStep;

    eventList.push(event);
  });

  return {
    type: "EPCISDocument",
    epcisBody: { eventList },
  };
}

function extractXMLValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Process EPCIS events and extract supply chain nodes
 */
export async function processEPCISEvents(
  userId: number,
  jobId: number,
  events: EPCISEventData[]
): Promise<{ processedCount: number; failedCount: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let processedCount = 0;
  let failedCount = 0;

  for (const event of events) {
    try {
      // Insert EPCIS event
      const _insertedEvent = await db.insert(epcisEvents).values({
        userId,
        eventType: event.type as any,
        eventTime: new Date(event.eventTime).toISOString(),
        eventTimeZoneOffset: event.eventTimeZoneOffset,
        action: event.action as any,
        bizStep: event.bizStep,
        disposition: event.disposition,
        readPoint: event.readPoint,
        bizLocation: event.bizLocation,
        epcList: event.epcList ? JSON.stringify(event.epcList) : null,
        quantityList: event.quantityList
          ? JSON.stringify(event.quantityList)
          : null,
        sourceList: event.sourceList ? JSON.stringify(event.sourceList) : null,
        destinationList: event.destinationList
          ? JSON.stringify(event.destinationList)
          : null,
        ilmd: event.ilmd ? JSON.stringify(event.ilmd) : null,
        rawEvent: JSON.stringify(event),
      });

      // Extract and create supply chain nodes from event
      await extractSupplyChainNodes(userId, event);

      processedCount++;
    } catch (error) {
      serverLogger.error("Failed to process event:", error);
      failedCount++;
    }
  }

  // Update job status
  if (db) {
    await db
      .update(epcisBatchJobs)
      .set({
        processedEvents: processedCount,
        failedEvents: failedCount,
        status: failedCount > 0 ? "completed" : "completed",
        completedAt: new Date().toISOString(),
      })
      .where(eq(epcisBatchJobs.id, jobId));
  }

  return { processedCount, failedCount };
}

/**
 * Extract supply chain nodes from EPCIS event
 */
async function extractSupplyChainNodes(userId: number, event: EPCISEventData) {
  const db = await getDb();
  if (!db) return;

  const nodes: Map<string, any> = new Map();

  // Extract from readPoint (location)
  if (event.readPoint) {
    nodes.set(event.readPoint, {
      gln: event.readPoint,
      nodeType: "distributor",
      name: `Node: ${event.readPoint}`,
    });
  }

  // Extract from bizLocation
  if (event.bizLocation) {
    nodes.set(event.bizLocation, {
      gln: event.bizLocation,
      nodeType: "manufacturer",
      name: `Node: ${event.bizLocation}`,
    });
  }

  // Extract from sourceList
  if (event.sourceList && Array.isArray(event.sourceList)) {
    event.sourceList.forEach((source: any) => {
      if (source.source) {
        nodes.set(source.source, {
          gln: source.source,
          nodeType: "supplier",
          name: `Supplier: ${source.source}`,
        });
      }
    });
  }

  // Extract from destinationList
  if (event.destinationList && Array.isArray(event.destinationList)) {
    event.destinationList.forEach((dest: any) => {
      if (dest.destination) {
        nodes.set(dest.destination, {
          gln: dest.destination,
          nodeType: "retailer",
          name: `Retailer: ${dest.destination}`,
        });
      }
    });
  }

  // Insert unique nodes
  for (const [gln, nodeData] of Array.from(nodes.entries())) {
    try {
      await db.insert(supplyChainNodes).values({
        userId,
        gln,
        name: nodeData.name,
        nodeType: nodeData.nodeType,
        riskLevel: "medium",
      });
    } catch (error) {
      // Node might already exist, which is fine
    }
  }
}

/**
 * Detect compliance risks in supply chain
 */
export async function detectComplianceRisks(
  userId: number,
  eventId: number,
  event: EPCISEventData
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const risks: any[] = [];

  // Risk 1: Missing traceability data
  if (!event.epcList || event.epcList.length === 0) {
    risks.push({
      riskType: "traceability",
      severity: "high",
      description: "Event has no EPC list - incomplete product traceability",
      recommendedAction:
        "Ensure all events include EPC identifiers for full supply chain visibility",
    });
  }

  // Risk 2: Missing location data
  if (!event.readPoint && !event.bizLocation) {
    risks.push({
      riskType: "geolocation",
      severity: "medium",
      description: "Event lacks location information",
      recommendedAction:
        "Add readPoint or bizLocation to enable geographic compliance checks",
    });
  }

  // Risk 3: Suspicious event timing
  const eventTime = new Date(event.eventTime);
  const now = new Date();
  const daysDiff =
    (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 30) {
    risks.push({
      riskType: "traceability",
      severity: "low",
      description:
        "Event is more than 30 days old - potential delayed reporting",
      recommendedAction:
        "Ensure timely event reporting for real-time compliance",
    });
  }

  // Insert detected risks
  for (const risk of risks) {
    await db.insert(supplyChainRisks).values({
      userId,
      eventId,
      riskType: risk.riskType,
      severity: risk.severity,
      description: risk.description,
      recommendedAction: risk.recommendedAction,
      isResolved: 0,
    });
  }
}

/**
 * Update supply chain analytics for user
 */
export async function updateSupplyChainAnalytics(
  userId: number
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Get counts
    const eventCount = await db
      .select()
      .from(epcisEvents)
      .where(eq(epcisEvents.userId, userId));
    const nodeCount = await db
      .select()
      .from(supplyChainNodes)
      .where(eq(supplyChainNodes.userId, userId));
    const edgeCount = await db
      .select()
      .from(supplyChainEdges)
      .where(eq(supplyChainEdges.userId, userId));
    const riskCount = await db
      .select()
      .from(supplyChainRisks)
      .where(
        and(
          eq(supplyChainRisks.userId, userId),
          eq(supplyChainRisks.isResolved, 0)
        )
      );
    const highRiskNodes = await db
      .select()
      .from(supplyChainNodes)
      .where(
        and(
          eq(supplyChainNodes.userId, userId),
          eq(supplyChainNodes.riskLevel, "high")
        )
      );

    // Calculate compliance score (0-100)
    const baseScore = 100;
    const riskPenalty = Math.min(riskCount.length * 5, 40);
    const complianceScore = Math.max(baseScore - riskPenalty, 0);

    // Calculate traceability score
    const tracedEvents = eventCount.filter(
      (evt: any) => evt.epcList && evt.epcList !== null
    ).length;
    const traceabilityScore =
      eventCount.length > 0 ? (tracedEvents / eventCount.length) * 100 : 0;

    // Upsert analytics record
    const traceScore = Math.round(traceabilityScore * 100) / 100;
    const compScore = Math.round(complianceScore * 100) / 100;

    await db
      .insert(supplyChainAnalytics)
      .values({
        userId,
        metricDate: new Date().toISOString(),
        totalEvents: eventCount.length,
        totalNodes: nodeCount.length,
        totalEdges: edgeCount.length,
        highRiskNodes: highRiskNodes.length,
        averageTraceabilityScore: traceScore.toString(),
        complianceScore: compScore.toString(),
      })
      .onDuplicateKeyUpdate({
        set: {
          totalEvents: eventCount.length,
          totalNodes: nodeCount.length,
          totalEdges: edgeCount.length,
          highRiskNodes: highRiskNodes.length,
          averageTraceabilityScore: traceScore.toString(),
          complianceScore: compScore.toString(),
        },
      });
  } catch (error) {
    serverLogger.error("Failed to update supply chain analytics:", error);
  }
}
