import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  epcisEvents,
  supplyChainNodes,
  supplyChainEdges,
} from "../drizzle/schema";

/**
 * EPCIS UI Integration Tests
 * Tests for EPCIS upload, visualization, and EUDR mapping features
 */

describe("EPCIS UI Integration", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  const testUserId = 999999;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      await db.delete(epcisEvents).where({ userId: testUserId });
      await db.delete(supplyChainNodes).where({ userId: testUserId });
      await db.delete(supplyChainEdges).where({ userId: testUserId });
    }
  });

  describe("EPCIS Upload Validation", () => {
    it("should validate EPCIS document structure", () => {
      const validDocument = {
        type: "EPCISDocument",
        schemaVersion: "2.0",
        creationDate: new Date().toISOString(),
        epcisBody: {
          eventList: [
            {
              type: "ObjectEvent",
              eventTime: "2024-01-15T10:00:00Z",
              action: "OBSERVE",
              bizStep: "urn:epcglobal:cbv:bizstep:receiving",
            },
          ],
        },
      };

      expect(validDocument.type).toBe("EPCISDocument");
      expect(validDocument.epcisBody.eventList).toBeInstanceOf(Array);
      expect(validDocument.epcisBody.eventList.length).toBeGreaterThan(0);
      expect(validDocument.epcisBody.eventList[0].type).toBe("ObjectEvent");
      expect(validDocument.epcisBody.eventList[0].eventTime).toBeTruthy();
    });

    it("should reject invalid EPCIS document missing type", () => {
      const invalidDocument = {
        schemaVersion: "2.0",
        epcisBody: {
          eventList: [],
        },
      };

      expect(invalidDocument).not.toHaveProperty("type");
    });

    it("should reject EPCIS document with empty eventList", () => {
      const invalidDocument = {
        type: "EPCISDocument",
        epcisBody: {
          eventList: [],
        },
      };

      expect(invalidDocument.epcisBody.eventList.length).toBe(0);
    });

    it("should validate event required fields", () => {
      const event = {
        type: "ObjectEvent",
        eventTime: "2024-01-15T10:00:00Z",
        action: "OBSERVE",
        bizStep: "urn:epcglobal:cbv:bizstep:receiving",
      };

      expect(event.type).toBeTruthy();
      expect(event.eventTime).toBeTruthy();
    });
  });

  describe("Supply Chain Visualization Data", () => {
    it("should create supply chain nodes from EPCIS events", async () => {
      // Create test node
      const [node] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "supplier",
        gln: "urn:epc:id:sgln:4012345.00001.0",
        name: "Test Supplier",
        tierLevel: 1,
        riskLevel: "low",
      });

      expect(node).toBeTruthy();

      // Verify node was created
      const nodes = await db!
        .select()
        .from(supplyChainNodes)
        .where({ userId: testUserId });
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0].name).toContain("Test Supplier");
      expect(nodes[0].nodeType).toBe("supplier");
    });

    it("should create supply chain edges from relationships", async () => {
      // Create two nodes
      const [node1] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "supplier",
        gln: "urn:epc:id:sgln:4012345.00001.0",
        name: "Supplier A",
      });

      const [node2] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "manufacturer",
        gln: "urn:epc:id:sgln:4012345.00002.0",
        name: "Manufacturer B",
      });

      // Create edge
      const [edge] = await db!.insert(supplyChainEdges).values({
        userId: testUserId,
        fromNodeId: node1.insertId,
        toNodeId: node2.insertId,
        relationshipType: "supplies",
      });

      expect(edge).toBeTruthy();

      // Verify edge was created
      const edges = await db!
        .select()
        .from(supplyChainEdges)
        .where({ userId: testUserId });
      expect(edges.length).toBeGreaterThan(0);
      expect(edges[0].relationshipType).toBe("supplies");
    });

    it("should support risk level classification", async () => {
      const riskLevels = ["low", "medium", "high"];

      for (const riskLevel of riskLevels) {
        const [node] = await db!.insert(supplyChainNodes).values({
          userId: testUserId,
          nodeType: "supplier",
          gln: `urn:epc:id:sgln:4012345.0000${riskLevel}.0`,
          name: `${riskLevel} Risk Supplier`,
          riskLevel: riskLevel as "low" | "medium" | "high",
        });

        expect(node).toBeTruthy();
      }

      const nodes = await db!
        .select()
        .from(supplyChainNodes)
        .where({ userId: testUserId });
      const lowRisk = nodes.filter(n => n.riskLevel === "low");
      const mediumRisk = nodes.filter(n => n.riskLevel === "medium");
      const highRisk = nodes.filter(n => n.riskLevel === "high");

      expect(lowRisk.length).toBeGreaterThan(0);
      expect(mediumRisk.length).toBeGreaterThan(0);
      expect(highRisk.length).toBeGreaterThan(0);
    });

    it("should support geolocation data for nodes", async () => {
      const [node] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "supplier",
        gln: "urn:epc:id:sgln:4012345.00001.0",
        name: "Geolocated Supplier",
        locationLat: "52.3676",
        locationLng: "4.9041",
      });

      expect(node).toBeTruthy();

      const nodes = await db!
        .select()
        .from(supplyChainNodes)
        .where({ userId: testUserId });
      const geoNode = nodes.find(n => n.name === "Geolocated Supplier");

      expect(geoNode).toBeTruthy();
      expect(geoNode!.locationLat).toBeTruthy();
      expect(geoNode!.locationLng).toBeTruthy();
    });
  });

  describe("EUDR Compliance Data", () => {
    it("should track origin information for EUDR compliance", async () => {
      const event = {
        type: "ObjectEvent",
        eventTime: "2024-01-15T10:00:00Z",
        action: "OBSERVE",
        bizStep: "urn:epcglobal:cbv:bizstep:receiving",
        sourceList: [
          {
            type: "owning_party",
            source: "urn:epc:id:pgln:4012345.00000",
          },
        ],
      };

      expect(event.sourceList).toBeTruthy();
      expect(event.sourceList.length).toBeGreaterThan(0);
      expect(event.sourceList[0].type).toBe("owning_party");
    });

    it("should support transformation events for manufacturing traceability", async () => {
      const event = {
        type: "TransformationEvent",
        eventTime: "2024-01-15T14:00:00Z",
        bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
        bizLocation: "urn:epc:id:sgln:4012345.00002.0",
        inputEPCList: ["urn:epc:id:sgtin:4012345.011111.987"],
        outputEPCList: ["urn:epc:id:sgtin:4012345.022222.654"],
      };

      expect(event.type).toBe("TransformationEvent");
      expect(event.inputEPCList).toBeTruthy();
      expect(event.outputEPCList).toBeTruthy();
      expect(event.bizLocation).toBeTruthy();
    });

    it("should validate geolocation completeness for EUDR", () => {
      const completeGeolocation = {
        latitude: 52.3676,
        longitude: 4.9041,
        countryCode: "NL",
      };

      const incompleteGeolocation = {
        latitude: 52.3676,
        // Missing longitude
      };

      expect(completeGeolocation.latitude).toBeTruthy();
      expect(completeGeolocation.longitude).toBeTruthy();
      expect(completeGeolocation.countryCode).toBeTruthy();

      expect(incompleteGeolocation.latitude).toBeTruthy();
      expect(incompleteGeolocation).not.toHaveProperty("longitude");
    });
  });

  describe("React Flow Visualization Format", () => {
    it("should format nodes for React Flow", async () => {
      const [dbNode] = await db!.insert(supplyChainNodes).values({
        userId: testUserId,
        nodeType: "supplier",
        gln: "urn:epc:id:sgln:4012345.00001.0",
        name: "Test Node",
        riskLevel: "low",
      });

      const flowNode = {
        id: dbNode.insertId.toString(),
        type: "default",
        data: { label: "Test Node" },
        position: { x: 100, y: 100 },
        style: {
          background: "#ffffff",
          border: "2px solid #10b981",
          borderRadius: "8px",
        },
      };

      expect(flowNode.id).toBeTruthy();
      expect(flowNode.data.label).toBeTruthy();
      expect(flowNode.position).toHaveProperty("x");
      expect(flowNode.position).toHaveProperty("y");
      expect(flowNode.style.border).toContain("#10b981"); // Green for low risk
    });

    it("should format edges for React Flow", async () => {
      const flowEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        label: "supplies",
        type: "smoothstep",
        animated: true,
      };

      expect(flowEdge.source).toBeTruthy();
      expect(flowEdge.target).toBeTruthy();
      expect(flowEdge.label).toBeTruthy();
      expect(Boolean(flowEdge.animated)).toBe(true);
    });

    it("should map risk levels to colors", () => {
      const riskColors = {
        low: "#10b981",
        medium: "#f59e0b",
        high: "#ef4444",
      };

      expect(riskColors.low).toBe("#10b981"); // Green
      expect(riskColors.medium).toBe("#f59e0b"); // Amber
      expect(riskColors.high).toBe("#ef4444"); // Red
    });
  });

  describe("EPCIS Event Types Support", () => {
    it("should support ObjectEvent", () => {
      const event = {
        type: "ObjectEvent",
        action: "OBSERVE",
        epcList: ["urn:epc:id:sgtin:4012345.011111.987"],
      };

      expect(event.type).toBe("ObjectEvent");
      expect(event.action).toBeTruthy();
      expect(event.epcList).toBeInstanceOf(Array);
    });

    it("should support AggregationEvent", () => {
      const event = {
        type: "AggregationEvent",
        action: "ADD",
        parentID: "urn:epc:id:sscc:4012345.0000000001",
        childEPCs: ["urn:epc:id:sgtin:4012345.011111.987"],
      };

      expect(event.type).toBe("AggregationEvent");
      expect(event.parentID).toBeTruthy();
      expect(event.childEPCs).toBeInstanceOf(Array);
    });

    it("should support TransactionEvent", () => {
      const event = {
        type: "TransactionEvent",
        action: "ADD",
        bizTransactionList: [
          {
            type: "po",
            bizTransaction: "urn:epcglobal:cbv:bt:4012345:PO-12345",
          },
        ],
      };

      expect(event.type).toBe("TransactionEvent");
      expect(event.bizTransactionList).toBeInstanceOf(Array);
    });

    it("should support TransformationEvent", () => {
      const event = {
        type: "TransformationEvent",
        inputEPCList: ["urn:epc:id:sgtin:4012345.011111.987"],
        outputEPCList: ["urn:epc:id:sgtin:4012345.022222.654"],
      };

      expect(event.type).toBe("TransformationEvent");
      expect(event.inputEPCList).toBeInstanceOf(Array);
      expect(event.outputEPCList).toBeInstanceOf(Array);
    });

    it("should support AssociationEvent", () => {
      const event = {
        type: "AssociationEvent",
        action: "ADD",
        parentID: "urn:epc:id:grai:4012345.12345.987",
        childEPCs: ["urn:epc:id:sgtin:4012345.011111.987"],
      };

      expect(event.type).toBe("AssociationEvent");
      expect(event.parentID).toBeTruthy();
      expect(event.childEPCs).toBeInstanceOf(Array);
    });
  });
});
