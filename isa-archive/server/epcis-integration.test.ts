import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  epcisEvents,
  supplyChainNodes,
  supplyChainEdges,
  eudrGeolocation,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * EPCIS 2.0 Integration Tests
 * Tests for supply chain traceability and EUDR compliance validation
 */

describe("EPCIS Integration", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Use a test user ID
    testUserId = 999999;
  });

  afterAll(async () => {
    // Cleanup test data
    const db = await getDb();
    if (db) {
      await db.delete(epcisEvents).where(eq(epcisEvents.userId, testUserId));
      await db
        .delete(supplyChainNodes)
        .where(eq(supplyChainNodes.userId, testUserId));
      await db
        .delete(supplyChainEdges)
        .where(eq(supplyChainEdges.userId, testUserId));
      await db
        .delete(eudrGeolocation)
        .where(eq(eudrGeolocation.userId, testUserId));
    }
  });

  describe("Database Schema", () => {
    it("should have epcis_events table with correct columns", async () => {
      const db = await getDb();
      expect(db).toBeDefined();

      // Insert a test event
      const testEvent = {
        userId: testUserId,
        eventType: "ObjectEvent" as const,
        eventTime: new Date("2024-01-15T10:00:00Z"),
        eventTimeZoneOffset: "+01:00",
        action: "OBSERVE" as const,
        bizStep: "urn:epcglobal:cbv:bizstep:receiving",
        disposition: "urn:epcglobal:cbv:disp:in_progress",
        readPoint: "urn:epc:id:sgln:4012345.00001.0",
        bizLocation: "urn:epc:id:sgln:4012345.00001.0",
        epcList: ["urn:epc:id:sgtin:4012345.011111.987"],
        rawEvent: { type: "ObjectEvent", eventTime: "2024-01-15T10:00:00Z" },
      };

      const [inserted] = await db!.insert(epcisEvents).values(testEvent);
      expect(inserted).toBeDefined();

      // Verify inserted data
      const retrieved = await db!
        .select()
        .from(epcisEvents)
        .where(eq(epcisEvents.userId, testUserId))
        .limit(1);

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].eventType).toBe("ObjectEvent");
      expect(retrieved[0].bizStep).toBe("urn:epcglobal:cbv:bizstep:receiving");
    });

    it("should have supply_chain_nodes table with correct columns", async () => {
      const db = await getDb();
      expect(db).toBeDefined();

      const testNode = {
        userId: testUserId,
        nodeType: "supplier" as const,
        gln: "4012345000017",
        name: "Test Supplier Co.",
        tierLevel: 1,
        locationLat: "52.5200",
        locationLng: "13.4050",
        riskLevel: "low" as const,
      };

      const [inserted] = await db!.insert(supplyChainNodes).values(testNode);
      expect(inserted).toBeDefined();

      const retrieved = await db!
        .select()
        .from(supplyChainNodes)
        .where(eq(supplyChainNodes.userId, testUserId))
        .limit(1);

      expect(retrieved.length).toBeGreaterThan(0);
      // Note: Multiple tests may create nodes, so we just verify structure
      expect(retrieved[0].name).toBeTruthy();
      expect(retrieved[0]).toHaveProperty("gln");
    });

    it("should have supply_chain_edges table with correct columns", async () => {
      const db = await getDb();
      expect(db).toBeDefined();

      // Create two nodes first
      const [node1] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "supplier",
        gln: "4012345000024",
        name: "Supplier A",
      });

      const [node2] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "manufacturer",
        gln: "4012345000031",
        name: "Manufacturer B",
      });

      const testEdge = {
        userId: testUserId,
        fromNodeId: node1.insertId,
        toNodeId: node2.insertId,
        productGtin: "04012345678901",
        relationshipType: "supplies" as const,
        lastTransactionDate: new Date("2024-01-15"),
      };

      const [inserted] = await db!.insert(supplyChainEdges).values(testEdge);
      expect(inserted).toBeDefined();

      const retrieved = await db!
        .select()
        .from(supplyChainEdges)
        .where(eq(supplyChainEdges.userId, testUserId))
        .limit(1);

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].relationshipType).toBe("supplies");
    });

    it("should have eudr_geolocation table with correct columns", async () => {
      const db = await getDb();
      expect(db).toBeDefined();

      const testGeolocation = {
        userId: testUserId,
        productGtin: "04012345678901",
        originLat: "52.5200",
        originLng: "13.4050",
        geofenceGeoJSON: {
          type: "Polygon",
          coordinates: [
            [
              [13.4, 52.5],
              [13.5, 52.5],
              [13.5, 52.6],
              [13.4, 52.6],
              [13.4, 52.5],
            ],
          ],
        },
        deforestationRisk: "low" as const,
        riskAssessmentDate: new Date("2024-01-15"),
      };

      const [inserted] = await db!
        .insert(eudrGeolocation)
        .values(testGeolocation);
      expect(inserted).toBeDefined();

      const retrieved = await db!
        .select()
        .from(eudrGeolocation)
        .where(eq(eudrGeolocation.userId, testUserId))
        .limit(1);

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].productGtin).toBe("04012345678901");
      expect(retrieved[0].deforestationRisk).toBe("low");
    });
  });

  describe("EPCIS Event Types", () => {
    it("should support ObjectEvent type", async () => {
      const db = await getDb();
      const [event] = await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "ObjectEvent",
        eventTime: new Date(),
        rawEvent: { type: "ObjectEvent" },
      });

      expect(event).toBeDefined();
    });

    it("should support AggregationEvent type", async () => {
      const db = await getDb();
      const [event] = await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "AggregationEvent",
        eventTime: new Date(),
        rawEvent: { type: "AggregationEvent" },
      });

      expect(event).toBeDefined();
    });

    it("should support TransactionEvent type", async () => {
      const db = await getDb();
      const [event] = await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "TransactionEvent",
        eventTime: new Date(),
        rawEvent: { type: "TransactionEvent" },
      });

      expect(event).toBeDefined();
    });

    it("should support TransformationEvent type", async () => {
      const db = await getDb();
      const [event] = await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "TransformationEvent",
        eventTime: new Date(),
        rawEvent: { type: "TransformationEvent" },
      });

      expect(event).toBeDefined();
    });

    it("should support AssociationEvent type", async () => {
      const db = await getDb();
      const [event] = await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "AssociationEvent",
        eventTime: new Date(),
        rawEvent: { type: "AssociationEvent" },
      });

      expect(event).toBeDefined();
    });
  });

  describe("EPCIS Business Vocabulary", () => {
    it("should store bizStep values", async () => {
      const db = await getDb();
      const bizSteps = [
        "urn:epcglobal:cbv:bizstep:receiving",
        "urn:epcglobal:cbv:bizstep:shipping",
        "urn:epcglobal:cbv:bizstep:storing",
        "urn:epcglobal:cbv:bizstep:commissioning",
      ];

      for (const bizStep of bizSteps) {
        const [event] = await db!.insert(epcisEvents).values({
          userId: testUserId,
          eventType: "ObjectEvent",
          eventTime: new Date(),
          bizStep,
          rawEvent: { type: "ObjectEvent", bizStep },
        });

        expect(event).toBeDefined();
      }

      const events = await db!
        .select()
        .from(epcisEvents)
        .where(eq(epcisEvents.userId, testUserId));

      const storedBizSteps = events.map(e => e.bizStep).filter(Boolean);
      expect(storedBizSteps.length).toBeGreaterThan(0);
    });

    it("should store disposition values", async () => {
      const db = await getDb();
      const dispositions = [
        "urn:epcglobal:cbv:disp:in_transit",
        "urn:epcglobal:cbv:disp:in_progress",
        "urn:epcglobal:cbv:disp:active",
      ];

      for (const disposition of dispositions) {
        const [event] = await db!.insert(epcisEvents).values({
          userId: testUserId,
          eventType: "ObjectEvent",
          eventTime: new Date(),
          disposition,
          rawEvent: { type: "ObjectEvent", disposition },
        });

        expect(event).toBeDefined();
      }
    });
  });

  describe("Supply Chain Mapping", () => {
    it("should create supply chain nodes from unique locations", async () => {
      const db = await getDb();

      // Insert events with different locations
      const locations = [
        "urn:epc:id:sgln:4012345.00001.0",
        "urn:epc:id:sgln:4012345.00002.0",
        "urn:epc:id:sgln:4012345.00003.0",
      ];

      for (const location of locations) {
        await db!.insert(epcisEvents).values({
          userId: testUserId,
          eventType: "ObjectEvent",
          eventTime: new Date(),
          bizLocation: location,
          rawEvent: { type: "ObjectEvent", bizLocation: location },
        });
      }

      // Create nodes for each location
      for (const location of locations) {
        await db!.insert(supplyChainNodes).values({
          userId: testUserId,
          nodeType: "supplier",
          gln: location,
          name: `Location ${location.substring(0, 20)}`,
        });
      }

      const nodes = await db!
        .select()
        .from(supplyChainNodes)
        .where(eq(supplyChainNodes.userId, testUserId));

      expect(nodes.length).toBeGreaterThanOrEqual(3);
    });

    it("should create supply chain edges from source/destination relationships", async () => {
      const db = await getDb();

      // Create two nodes
      const [node1] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "supplier",
        gln: "4012345000048",
        name: "Supplier X",
      });

      const [node2] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "manufacturer",
        gln: "4012345000055",
        name: "Manufacturer Y",
      });

      // Create edge
      await db!.insert(supplyChainEdges).values({
        userId: testUserId,
        fromNodeId: node1.insertId,
        toNodeId: node2.insertId,
        relationshipType: "supplies",
      });

      const edges = await db!
        .select()
        .from(supplyChainEdges)
        .where(eq(supplyChainEdges.userId, testUserId));

      expect(edges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("EUDR Compliance Validation", () => {
    it("should validate product with complete EUDR data", async () => {
      const db = await getDb();
      const productGtin = "04012345678918";

      // Insert EPCIS events with origin tracking
      await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "ObjectEvent",
        eventTime: new Date(),
        bizLocation: "urn:epc:id:sgln:4012345.00001.0",
        epcList: [`urn:epc:id:sgtin:${productGtin}.987`],
        sourceList: [
          { type: "owning_party", source: "urn:epc:id:pgln:4012345.00000" },
        ],
        rawEvent: { type: "ObjectEvent" },
      });

      // Insert transformation event
      await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "TransformationEvent",
        eventTime: new Date(),
        epcList: [`urn:epc:id:sgtin:${productGtin}.987`],
        rawEvent: { type: "TransformationEvent" },
      });

      // Insert EUDR geolocation data
      await db!.insert(eudrGeolocation).values({
        userId: testUserId,
        productGtin,
        originLat: "52.5200",
        originLng: "13.4050",
        deforestationRisk: "low",
      });

      // Validate
      const events = await db!
        .select()
        .from(epcisEvents)
        .where(eq(epcisEvents.userId, testUserId));

      const productEvents = events.filter(event => {
        const epcList = event.epcList as string[] | null;
        return epcList?.some(epc => epc.includes(productGtin));
      });

      const hasOriginTracking = productEvents.some(
        e => e.sourceList && (e.sourceList as any[]).length > 0
      );
      const hasGeolocation = productEvents.some(e => e.bizLocation);
      const hasTransformationEvents = productEvents.some(
        e => e.eventType === "TransformationEvent"
      );

      const geolocationData = await db!
        .select()
        .from(eudrGeolocation)
        .where(eq(eudrGeolocation.productGtin, productGtin))
        .limit(1);

      const hasEUDRGeolocation = geolocationData.length > 0;

      expect(hasOriginTracking).toBe(true);
      expect(hasGeolocation).toBe(true);
      expect(hasTransformationEvents).toBe(true);
      expect(hasEUDRGeolocation).toBe(true);
    });

    it("should identify missing EUDR requirements", async () => {
      const db = await getDb();
      const productGtin = "04012345678925";

      // Insert minimal event (missing origin tracking)
      await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "ObjectEvent",
        eventTime: new Date(),
        epcList: [`urn:epc:id:sgtin:${productGtin}.987`],
        rawEvent: { type: "ObjectEvent" },
      });

      const events = await db!
        .select()
        .from(epcisEvents)
        .where(eq(epcisEvents.userId, testUserId));

      const productEvents = events.filter(event => {
        const epcList = event.epcList as string[] | null;
        return epcList?.some(epc => epc.includes(productGtin));
      });

      const hasOriginTracking = productEvents.some(
        e => e.sourceList && (e.sourceList as any[]).length > 0
      );
      const hasGeolocation = productEvents.some(e => e.bizLocation);
      const hasTransformationEvents = productEvents.some(
        e => e.eventType === "TransformationEvent"
      );

      const geolocationData = await db!
        .select()
        .from(eudrGeolocation)
        .where(eq(eudrGeolocation.productGtin, productGtin))
        .limit(1);

      const hasEUDRGeolocation = geolocationData.length > 0;

      const missingRequirements = [
        ...(!hasOriginTracking ? ["Origin tracking (sourceList)"] : []),
        ...(!hasGeolocation ? ["Business location (bizLocation)"] : []),
        ...(!hasTransformationEvents
          ? ["Transformation events (manufacturing)"]
          : []),
        ...(!hasEUDRGeolocation ? ["EUDR geolocation data"] : []),
      ];

      expect(missingRequirements.length).toBeGreaterThan(0);
      expect(missingRequirements).toContain("Origin tracking (sourceList)");
    });
  });

  describe("Sensor Data Support", () => {
    it("should store sensor data for cold chain compliance", async () => {
      const db = await getDb();

      const sensorData = [
        {
          type: "Temperature",
          value: 2.5,
          uom: "CEL",
          time: "2024-01-15T10:00:00Z",
        },
        {
          type: "Humidity",
          value: 65,
          uom: "A93",
          time: "2024-01-15T10:00:00Z",
        },
      ];

      await db!.insert(epcisEvents).values({
        userId: testUserId,
        eventType: "ObjectEvent",
        eventTime: new Date(),
        sensorElementList: sensorData,
        rawEvent: { type: "ObjectEvent", sensorElementList: sensorData },
      });

      const events = await db!
        .select()
        .from(epcisEvents)
        .where(eq(epcisEvents.userId, testUserId));

      const eventsWithSensors = events.filter(e => e.sensorElementList);
      expect(eventsWithSensors.length).toBeGreaterThan(0);
    });
  });
});
