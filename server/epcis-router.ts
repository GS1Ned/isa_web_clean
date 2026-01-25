import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc.js";
import { getDb } from "./db.js";
import {
  epcisEvents,
  supplyChainNodes,
  supplyChainEdges,
  eudrGeolocation,
} from "../drizzle/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { seedEUDRData } from "./seed-eudr-data.js";
import { seedEPCISEvents } from "./seed-epcis-events.js";
import { parseEPCISXML, detectFormat } from "./epcis-xml-parser.js";
import { analyzeEUDRCompliance } from "./eudr-analyzer.js";

/**
 * EPCIS 2.0 Integration Router
 * Handles supply chain traceability events for EUDR/CSDDD compliance
 */

// Zod schemas for EPCIS event types
const EPCISEventSchema = z.object({
  type: z.enum([
    "ObjectEvent",
    "AggregationEvent",
    "TransactionEvent",
    "TransformationEvent",
    "AssociationEvent",
  ]),
  eventTime: z.string(),
  eventTimeZoneOffset: z.string().optional(),
  action: z.enum(["OBSERVE", "ADD", "DELETE"]).optional(),
  bizStep: z.string().optional(),
  disposition: z.string().optional(),
  readPoint: z.string().optional(),
  bizLocation: z.string().optional(),
  epcList: z.array(z.string()).optional(),
  quantityList: z
    .array(
      z.object({
        epcClass: z.string(),
        quantity: z.number(),
        uom: z.string().optional(),
      })
    )
    .optional(),
  sensorElementList: z.array(z.any()).optional(),
  sourceList: z
    .array(
      z.object({
        type: z.string(),
        source: z.string(),
      })
    )
    .optional(),
  destinationList: z
    .array(
      z.object({
        type: z.string(),
        destination: z.string(),
      })
    )
    .optional(),
  ilmd: z.any().optional(),
});

const EPCISDocumentSchema = z.object({
  "@context": z.union([z.string(), z.array(z.string())]).optional(),
  type: z.literal("EPCISDocument"),
  schemaVersion: z.string().optional(),
  creationDate: z.string().optional(),
  epcisBody: z.object({
    eventList: z.array(EPCISEventSchema),
  }),
});

export const epcisRouter = router({
  /**
   * Upload EPCIS events from an EPCIS document (JSON or XML)
   */
  uploadEvents: protectedProcedure
    .input(z.string()) // Accept raw string (XML or JSON)
    .mutation(async ({ input, ctx }) => {
      // Detect format and parse
      const format = detectFormat(input);
      let parsedDocument: any;

      if (format === "xml") {
        parsedDocument = parseEPCISXML(input);
      } else {
        parsedDocument = JSON.parse(input);
      }

      // Validate against schema
      const validatedInput = EPCISDocumentSchema.parse(parsedDocument);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      const events = validatedInput.epcisBody.eventList;
      const insertedEvents = [];

      for (const event of events) {
        const [insertedEvent] = await db.insert(epcisEvents).values({
          userId,
          eventType: event.type,
          eventTime: new Date(event.eventTime).toISOString(),
          eventTimeZoneOffset: event.eventTimeZoneOffset,
          action: event.action,
          bizStep: event.bizStep,
          disposition: event.disposition,
          readPoint: event.readPoint,
          bizLocation: event.bizLocation,
          epcList: event.epcList,
          quantityList: event.quantityList,
          sensorElementList: event.sensorElementList,
          sourceList: event.sourceList,
          destinationList: event.destinationList,
          ilmd: event.ilmd,
          rawEvent: event,
        });

        insertedEvents.push(insertedEvent);
      }

      return {
        success: true,
        eventsUploaded: insertedEvents.length,
        format: format.toUpperCase(),
        message: `Successfully uploaded ${insertedEvents.length} EPCIS events from ${format.toUpperCase()} format. Supply chain visualization will be updated automatically.`,
      };
    }),

  /**
   * Get EPCIS events for the current user
   */
  getEvents: protectedProcedure
    .input(
      z.object({
        eventType: z
          .enum([
            "ObjectEvent",
            "AggregationEvent",
            "TransactionEvent",
            "TransformationEvent",
            "AssociationEvent",
          ])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      const conditions = [eq(epcisEvents.userId, userId)];
      if (input.eventType) {
        conditions.push(eq(epcisEvents.eventType, input.eventType));
      }

      const events = await db
        .select()
        .from(epcisEvents)
        .where(and(...conditions))
        .orderBy(desc(epcisEvents.eventTime))
        .limit(input.limit)
        .offset(input.offset);

      return {
        events,
        count: events.length,
      };
    }),

  /**
   * Get event statistics for the current user
   */
  getEventStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;

    const events = await db
      .select()
      .from(epcisEvents)
      .where(eq(epcisEvents.userId, userId));

    const stats = {
      totalEvents: events.length,
      byType: {
        ObjectEvent: events.filter(e => e.eventType === "ObjectEvent").length,
        AggregationEvent: events.filter(e => e.eventType === "AggregationEvent")
          .length,
        TransactionEvent: events.filter(e => e.eventType === "TransactionEvent")
          .length,
        TransformationEvent: events.filter(
          e => e.eventType === "TransformationEvent"
        ).length,
        AssociationEvent: events.filter(e => e.eventType === "AssociationEvent")
          .length,
      },
      uniqueLocations: new Set(events.map(e => e.bizLocation).filter(Boolean))
        .size,
      dateRange: {
        earliest:
          events.length > 0
            ? new Date(Math.min(...events.map(e => new Date(e.eventTime).getTime())))
            : null,
        latest:
          events.length > 0
            ? new Date(Math.max(...events.map(e => new Date(e.eventTime).getTime())))
            : null,
      },
    };

    return stats;
  }),

  /**
   * Validate EUDR traceability for a product
   */
  validateEUDRTraceability: protectedProcedure
    .input(
      z.object({
        productGtin: z.string().length(14),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      // Find all events related to this product
      const events = await db
        .select()
        .from(epcisEvents)
        .where(eq(epcisEvents.userId, userId));

      const productEvents = events.filter(event => {
        const epcList = event.epcList as string[] | null;
        if (!epcList) return false;
        return epcList.some(epc => epc.includes(input.productGtin));
      });

      // Check for required EUDR data points
      const hasOriginTracking = productEvents.some(
        e => e.sourceList && (e.sourceList as any[]).length > 0
      );
      const hasGeolocation = productEvents.some(e => e.bizLocation);
      const hasTransformationEvents = productEvents.some(
        e => e.eventType === "TransformationEvent"
      );

      // Check if geolocation data exists
      const geolocationData = await db
        .select()
        .from(eudrGeolocation)
        .where(
          and(
            eq(eudrGeolocation.userId, userId),
            eq(eudrGeolocation.productGtin, input.productGtin)
          )
        )
        .limit(1);

      const hasEUDRGeolocation = geolocationData.length > 0;

      const isCompliant =
        hasOriginTracking &&
        hasGeolocation &&
        hasTransformationEvents &&
        hasEUDRGeolocation;

      return {
        productGtin: input.productGtin,
        isCompliant,
        eventsFound: productEvents.length,
        checks: {
          hasOriginTracking,
          hasGeolocation,
          hasTransformationEvents,
          hasEUDRGeolocation,
        },
        missingRequirements: [
          ...(!hasOriginTracking ? ["Origin tracking (sourceList)"] : []),
          ...(!hasGeolocation ? ["Business location (bizLocation)"] : []),
          ...(!hasTransformationEvents
            ? ["Transformation events (manufacturing)"]
            : []),
          ...(!hasEUDRGeolocation ? ["EUDR geolocation data"] : []),
        ],
        events: productEvents.map(e => ({
          id: e.id,
          type: e.eventType,
          time: e.eventTime,
          location: e.bizLocation,
        })),
      };
    }),

  /**
   * Generate supply chain map from EPCIS events
   */
  generateSupplyChainMap: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;

    // Get all events for the user
    const events = await db
      .select()
      .from(epcisEvents)
      .where(eq(epcisEvents.userId, userId));

    // Extract unique locations (GLNs) from events
    const locations = new Set<string>();
    events.forEach(event => {
      if (event.bizLocation) locations.add(event.bizLocation);
      if (event.readPoint) locations.add(event.readPoint);
      if (event.sourceList) {
        (event.sourceList as any[]).forEach(source =>
          locations.add(source.source)
        );
      }
      if (event.destinationList) {
        (event.destinationList as any[]).forEach(dest =>
          locations.add(dest.destination)
        );
      }
    });

    // Create nodes for each location
    const nodesCreated = [];
    for (const location of Array.from(locations)) {
      // Check if node already exists
      const existing = await db
        .select()
        .from(supplyChainNodes)
        .where(
          and(
            eq(supplyChainNodes.userId, userId),
            eq(supplyChainNodes.gln, location)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        const [node] = await db.insert(supplyChainNodes).values({
          userId,
          gln: location,
          name: `Location ${location.substring(0, 8)}...`,
          nodeType: "supplier", // Default, can be refined later
        });
        nodesCreated.push(node);
      }
    }

    // Create edges based on event flow
    const edgesCreated = [];
    for (const event of events) {
      if (event.sourceList && event.destinationList) {
        const sources = event.sourceList as any[];
        const destinations = event.destinationList as any[];

        for (const source of sources) {
          for (const dest of destinations) {
            // Find node IDs
            const [fromNode] = await db
              .select()
              .from(supplyChainNodes)
              .where(
                and(
                  eq(supplyChainNodes.userId, userId),
                  eq(supplyChainNodes.gln, source.source)
                )
              )
              .limit(1);

            const [toNode] = await db
              .select()
              .from(supplyChainNodes)
              .where(
                and(
                  eq(supplyChainNodes.userId, userId),
                  eq(supplyChainNodes.gln, dest.destination)
                )
              )
              .limit(1);

            if (fromNode && toNode) {
              const [edge] = await db.insert(supplyChainEdges).values({
                userId,
                fromNodeId: fromNode.id,
                toNodeId: toNode.id,
                relationshipType: "supplies",
                lastTransactionDate: event.eventTime,
              });
              edgesCreated.push(edge);
            }
          }
        }
      }
    }

    return {
      success: true,
      nodesCreated: nodesCreated.length,
      edgesCreated: edgesCreated.length,
      message: `Generated supply chain map with ${nodesCreated.length} nodes and ${edgesCreated.length} edges`,
    };
  }),

  /**
   * Get supply chain visualization data
   */
  getSupplyChainVisualization: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;

    const nodes = await db
      .select()
      .from(supplyChainNodes)
      .where(eq(supplyChainNodes.userId, userId));

    const edges = await db
      .select()
      .from(supplyChainEdges)
      .where(eq(supplyChainEdges.userId, userId));

    return {
      nodes: nodes.map(n => ({
        id: n.id,
        gln: n.gln,
        name: n.name,
        type: n.nodeType,
        tierLevel: n.tierLevel,
        riskLevel: n.riskLevel,
      })),
      edges: edges.map(e => ({
        id: e.id,
        from: e.fromNodeId,
        to: e.toNodeId,
        type: e.relationshipType,
        productGtin: e.productGtin,
      })),
    };
  }),

  /**
   * Get EUDR geolocation data for mapping
   */
  getEUDRGeolocations: protectedProcedure
    .input(
      z.object({
        productGtin: z.string().optional(),
        riskLevel: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;

      // Build where conditions
      const conditions = [eq(eudrGeolocation.userId, userId)];

      if (input.productGtin) {
        conditions.push(eq(eudrGeolocation.productGtin, input.productGtin));
      }

      if (input.riskLevel) {
        conditions.push(eq(eudrGeolocation.deforestationRisk, input.riskLevel));
      }

      const geolocations = await db
        .select()
        .from(eudrGeolocation)
        .where(and(...conditions))
        .orderBy(desc(eudrGeolocation.createdAt));

      return {
        geolocations: geolocations.map(g => ({
          id: g.id,
          productGtin: g.productGtin,
          lat: parseFloat(g.originLat),
          lng: parseFloat(g.originLng),
          riskLevel: g.deforestationRisk || "low",
          riskAssessmentDate: g.riskAssessmentDate,
          geofence: g.geofenceGeoJson,
          dueDiligence: g.dueDiligenceStatement,
        })),
        totalCount: geolocations.length,
      };
    }),

  /**
   * Generate EUDR compliance report
   */
  generateComplianceReport: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const report = await analyzeEUDRCompliance(userId);
    return report;
  }),

  /**
   * Seed EUDR sample geolocation data
   */
  seedEUDRSampleData: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const result = await seedEUDRData(userId);
    return result;
  }),

  /**
   * Seed EPCIS sample events for demonstration
   */
  seedEPCISSampleEvents: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const result = await seedEPCISEvents(userId);
    return result;
  }),
});
