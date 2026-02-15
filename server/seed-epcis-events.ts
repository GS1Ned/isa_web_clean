import { getDb } from "./db.js";
import { epcisEvents } from "../drizzle/schema.js";
import { serverLogger } from "./_core/logger-wiring";


/**
 * EPCIS Sample Events Seeder
 * Creates realistic supply chain events for seeded EUDR GTINs
 * Enables end-to-end traceability demonstration
 */

interface EPCISEventData {
  eventType:
    | "ObjectEvent"
    | "AggregationEvent"
    | "TransactionEvent"
    | "TransformationEvent"
    | "AssociationEvent";
  eventTime: Date;
  eventTimeZoneOffset: string;
  action?: "OBSERVE" | "ADD" | "DELETE";
  bizStep?: string;
  disposition?: string;
  readPoint?: string;
  bizLocation?: string;
  epcList?: string[];
  quantityList?: any[];
  sensorElementList?: any[];
  sourceList?: any[];
  destinationList?: any[];
  ilmd?: any;
}

// Helper to create dates in the past
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const sampleEvents: EPCISEventData[] = [
  // Coffee from Brazil - Complete supply chain
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(180),
    eventTimeZoneOffset: "-03:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
    disposition: "urn:epcglobal:cbv:disp:active",
    readPoint: "urn:epc:id:sgln:0123456.00001.0",
    bizLocation: "urn:epc:id:sgln:0123456.00001.0",
    epcList: [
      "urn:epc:id:sgtin:0123456.789012.1001",
      "urn:epc:id:sgtin:0123456.789012.1002",
      "00123456789012", // Simple GTIN for barcode scanner
    ],
    ilmd: {
      harvestDate: daysAgo(180).toISOString(),
      farmLocation: { lat: -19.9167, lng: -43.9345 },
      certification: "Rainforest Alliance",
      varietyType: "Arabica",
    },
  },
  {
    eventType: "TransformationEvent",
    eventTime: daysAgo(170),
    eventTimeZoneOffset: "-03:00",
    bizStep: "urn:epcglobal:cbv:bizstep:processing",
    disposition: "urn:epcglobal:cbv:disp:in_progress",
    readPoint: "urn:epc:id:sgln:0123456.00002.0",
    bizLocation: "urn:epc:id:sgln:0123456.00002.0",
    epcList: ["urn:epc:id:sgtin:0123456.789012.2001", "00123456789012"],
    ilmd: {
      processType: "Wet processing",
      dryingMethod: "Sun-dried",
      moistureContent: "12%",
    },
  },
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(160),
    eventTimeZoneOffset: "-03:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:shipping",
    disposition: "urn:epcglobal:cbv:disp:in_transit",
    readPoint: "urn:epc:id:sgln:0123456.00003.0",
    bizLocation: "urn:epc:id:sgln:0123456.00003.0",
    epcList: ["urn:epc:id:sgtin:0123456.789012.2001", "00123456789012"],
    sourceList: [
      {
        type: "urn:epcglobal:cbv:sdt:owning_party",
        source: "urn:epc:id:sgln:0123456.00002.0",
      },
    ],
    destinationList: [
      {
        type: "urn:epcglobal:cbv:sdt:owning_party",
        destination: "urn:epc:id:sgln:0234567.00001.0",
      },
    ],
  },
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(150),
    eventTimeZoneOffset: "+01:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:receiving",
    disposition: "urn:epcglobal:cbv:disp:in_progress",
    readPoint: "urn:epc:id:sgln:0234567.00001.0",
    bizLocation: "urn:epc:id:sgln:0234567.00001.0",
    epcList: ["urn:epc:id:sgtin:0123456.789012.2001", "00123456789012"],
  },

  // Cocoa from Ghana - Transformation chain
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(150),
    eventTimeZoneOffset: "+00:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
    disposition: "urn:epcglobal:cbv:disp:active",
    readPoint: "urn:epc:id:sgln:0234567.00010.0",
    bizLocation: "urn:epc:id:sgln:0234567.00010.0",
    epcList: ["urn:epc:id:sgtin:0234567.890123.1001", "00234567890123"],
    ilmd: {
      harvestDate: daysAgo(150).toISOString(),
      farmLocation: { lat: 6.6885, lng: -1.6244 },
      certification: "Fairtrade",
      cocoaType: "Forastero",
    },
  },
  {
    eventType: "TransformationEvent",
    eventTime: daysAgo(140),
    eventTimeZoneOffset: "+00:00",
    bizStep: "urn:epcglobal:cbv:bizstep:processing",
    disposition: "urn:epcglobal:cbv:disp:in_progress",
    readPoint: "urn:epc:id:sgln:0234567.00011.0",
    bizLocation: "urn:epc:id:sgln:0234567.00011.0",
    epcList: ["urn:epc:id:sgtin:0234567.890123.2001", "00234567890123"],
    ilmd: {
      processType: "Fermentation and drying",
      fermentationDays: 7,
      qualityGrade: "Grade 1",
    },
  },

  // Palm Oil from Indonesia - Aggregation
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(120),
    eventTimeZoneOffset: "+07:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
    disposition: "urn:epcglobal:cbv:disp:active",
    readPoint: "urn:epc:id:sgln:0345678.00010.0",
    bizLocation: "urn:epc:id:sgln:0345678.00010.0",
    epcList: ["urn:epc:id:sgtin:0345678.901241.1001", "00345678901234"],
    quantityList: [
      {
        epcClass: "urn:epc:class:lgtin:0345678.901241.lot001",
        quantity: 25000,
        uom: "KGM",
      },
    ],
    ilmd: {
      harvestDate: daysAgo(120).toISOString(),
      plantationLocation: { lat: -0.0263, lng: 109.3425 },
      certification: "RSPO Segregated",
      extractionMethod: "Mechanical pressing",
    },
  },
  {
    eventType: "AggregationEvent",
    eventTime: daysAgo(115),
    eventTimeZoneOffset: "+07:00",
    action: "ADD",
    bizStep: "urn:epcglobal:cbv:bizstep:packing",
    disposition: "urn:epcglobal:cbv:disp:container_closed",
    readPoint: "urn:epc:id:sgln:0345678.00011.0",
    bizLocation: "urn:epc:id:sgln:0345678.00011.0",
    epcList: ["urn:epc:id:sgtin:0345678.901241.1001", "00345678901234"],
  },
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(110),
    eventTimeZoneOffset: "+07:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:shipping",
    disposition: "urn:epcglobal:cbv:disp:in_transit",
    readPoint: "urn:epc:id:sgln:0345678.00012.0",
    bizLocation: "urn:epc:id:sgln:0345678.00012.0",
    epcList: ["urn:epc:id:sgtin:0345678.901241.1001", "00345678901234"],
    sensorElementList: [
      {
        sensorMetadata: {
          time: daysAgo(110).toISOString(),
          deviceID: "urn:epc:id:giai:0345678.sensor001",
        },
        sensorReport: [
          {
            type: "Temperature",
            value: 25.5,
            uom: "CEL",
          },
          {
            type: "Humidity",
            value: 65,
            uom: "PERCENT",
          },
        ],
      },
    ],
  },

  // Timber from Sweden - FSC certified
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(200),
    eventTimeZoneOffset: "+01:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
    disposition: "urn:epcglobal:cbv:disp:active",
    readPoint: "urn:epc:id:sgln:0456789.00010.0",
    bizLocation: "urn:epc:id:sgln:0456789.00010.0",
    epcList: ["urn:epc:id:sgtin:0456789.012352.1001", "00456789012345"],
    ilmd: {
      harvestDate: daysAgo(200).toISOString(),
      forestLocation: { lat: 62.3908, lng: 16.325 },
      certification: "FSC-C123456",
      treeSpecies: "Pinus sylvestris (Scots Pine)",
      sustainableManagement: true,
    },
  },
  {
    eventType: "TransformationEvent",
    eventTime: daysAgo(190),
    eventTimeZoneOffset: "+01:00",
    bizStep: "urn:epcglobal:cbv:bizstep:processing",
    disposition: "urn:epcglobal:cbv:disp:in_progress",
    readPoint: "urn:epc:id:sgln:0456789.00011.0",
    bizLocation: "urn:epc:id:sgln:0456789.00011.0",
    epcList: ["urn:epc:id:sgtin:0456789.012352.2001", "00456789012345"],
    ilmd: {
      processType: "Sawmill processing",
      dimensions: "50mm x 150mm x 3000mm",
      moistureContent: "18%",
    },
  },
  {
    eventType: "TransactionEvent",
    eventTime: daysAgo(185),
    eventTimeZoneOffset: "+01:00",
    action: "ADD",
    bizStep: "urn:epcglobal:cbv:bizstep:shipping",
    disposition: "urn:epcglobal:cbv:disp:in_transit",
    readPoint: "urn:epc:id:sgln:0456789.00012.0",
    bizLocation: "urn:epc:id:sgln:0456789.00012.0",
    epcList: ["urn:epc:id:sgtin:0456789.012352.2001", "00456789012345"],
    sourceList: [
      {
        type: "urn:epcglobal:cbv:sdt:owning_party",
        source: "urn:epc:id:sgln:0456789.00011.0",
      },
    ],
    destinationList: [
      {
        type: "urn:epcglobal:cbv:sdt:owning_party",
        destination: "urn:epc:id:sgln:0567890.00001.0",
      },
    ],
  },

  // Soy from Brazil - Organic certified
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(100),
    eventTimeZoneOffset: "-03:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
    disposition: "urn:epcglobal:cbv:disp:active",
    readPoint: "urn:epc:id:sgln:0567890.00010.0",
    bizLocation: "urn:epc:id:sgln:0567890.00010.0",
    epcList: ["urn:epc:id:sgtin:0567890.123463.1001", "00567890123456"],
    quantityList: [
      {
        epcClass: "urn:epc:class:lgtin:0567890.123463.lot001",
        quantity: 50000,
        uom: "KGM",
      },
    ],
    ilmd: {
      harvestDate: daysAgo(100).toISOString(),
      farmLocation: { lat: -25.4284, lng: -49.2733 },
      certification: "EU Organic + Non-GMO Project",
      varietyType: "Glycine max",
      organicSince: "2015",
    },
  },
  {
    eventType: "ObjectEvent",
    eventTime: daysAgo(95),
    eventTimeZoneOffset: "-03:00",
    action: "OBSERVE",
    bizStep: "urn:epcglobal:cbv:bizstep:storing",
    disposition: "urn:epcglobal:cbv:disp:in_progress",
    readPoint: "urn:epc:id:sgln:0567890.00011.0",
    bizLocation: "urn:epc:id:sgln:0567890.00011.0",
    epcList: ["urn:epc:id:sgtin:0567890.123463.1001", "00567890123456"],
    sensorElementList: [
      {
        sensorMetadata: {
          time: daysAgo(95).toISOString(),
          deviceID: "urn:epc:id:giai:0567890.sensor001",
        },
        sensorReport: [
          {
            type: "Temperature",
            value: 20,
            uom: "CEL",
          },
          {
            type: "Humidity",
            value: 60,
            uom: "PERCENT",
          },
        ],
      },
    ],
  },
];

export async function seedEPCISEvents(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let inserted = 0;
  let errors = 0;

  for (const eventData of sampleEvents) {
    try {
      await db.insert(epcisEvents).values({
        userId,
        eventType: eventData.eventType,
        eventTime: eventData.eventTime.toISOString(),
        eventTimeZoneOffset: eventData.eventTimeZoneOffset,
        action: eventData.action,
        bizStep: eventData.bizStep,
        disposition: eventData.disposition,
        readPoint: eventData.readPoint,
        bizLocation: eventData.bizLocation,
        epcList: eventData.epcList || null,
        quantityList: eventData.quantityList || null,
        sensorElementList: eventData.sensorElementList || null,
        sourceList: eventData.sourceList || null,
        destinationList: eventData.destinationList || null,
        ilmd: eventData.ilmd || null,
        rawEvent: eventData,
      });
      inserted++;
      serverLogger.info(`✓ Inserted ${eventData.eventType} at ${eventData.bizStep}`);
    } catch (error) {
      errors++;
      serverLogger.error(`✗ Failed to insert ${eventData.eventType}:`, error);
    }
  }

  return {
    success: true,
    inserted,
    errors,
    total: sampleEvents.length,
    message: `EPCIS sample events seeded: ${inserted} events inserted, ${errors} errors`,
  };
}

// CLI execution - DISABLED to prevent automatic seeding on deployment
// Seeding should only happen via admin UI at /admin/eudr-seeder
/*
if (import.meta.url === `file://${process.argv[1]}`) {
  serverLogger.info("Seeding EPCIS sample events...");
  
  // Use a default user ID for CLI execution (admin user)
  const defaultUserId = 1;
  
  seedEPCISEvents(defaultUserId)
    .then((result) => {
      serverLogger.info("\n" + result.message);
      serverLogger.info(`Total: ${result.total}, Inserted: ${result.inserted}, Errors: ${result.errors}`);
      process.exit(0);
    })
    .catch((error) => {
      serverLogger.error("Seeding failed:", error);
      process.exit(1);
    });
}
*/
