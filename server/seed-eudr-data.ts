import { getDb } from "./db.js";
import { eudrGeolocation } from "../drizzle/schema.js";
import { serverLogger } from "./_core/logger-wiring";


/**
 * EUDR Sample Data Seeder
 * Populates eudr_geolocation table with realistic product origin data
 * for demonstrating EUDR compliance mapping
 */

interface EUDRSampleData {
  productGtin: string;
  productName: string;
  originLat: number;
  originLng: number;
  deforestationRisk: "low" | "medium" | "high";
  geofenceGeoJson?: any;
  dueDiligenceStatement?: any;
}

const sampleData: EUDRSampleData[] = [
  // Coffee from Brazil - Mix of compliant and at-risk
  {
    productGtin: "00123456789012",
    productName: "Arabica Coffee Beans - Minas Gerais",
    originLat: -19.9167,
    originLng: -43.9345,
    deforestationRisk: "low",
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "Rainforest Alliance",
      certificationDate: "2024-01-15",
      landUseHistory: "No deforestation detected since 2020",
      supplierVerified: true,
    },
  },
  {
    productGtin: "00123456789029",
    productName: "Robusta Coffee Beans - Amazon Region",
    originLat: -3.4653,
    originLng: -62.2159,
    deforestationRisk: "high",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-62.3, -3.5],
          [-62.1, -3.5],
          [-62.1, -3.4],
          [-62.3, -3.4],
          [-62.3, -3.5],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: false,
      deforestationAlert:
        "Satellite imagery shows recent forest clearing within 5km",
      riskLevel: "High - requires immediate verification",
      actionRequired: "Suspend sourcing until verification complete",
    },
  },
  {
    productGtin: "00123456789036",
    productName: "Organic Coffee Beans - São Paulo",
    originLat: -23.5505,
    originLng: -46.6333,
    deforestationRisk: "low",
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "EU Organic",
      certificationDate: "2023-11-20",
      landUseHistory: "Established plantation, no expansion since 2015",
      supplierVerified: true,
    },
  },

  // Cocoa from West Africa - High-risk regions
  {
    productGtin: "00234567890123",
    productName: "Cocoa Beans - Ghana",
    originLat: 6.6885,
    originLng: -1.6244,
    deforestationRisk: "medium",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-1.7, 6.6],
          [-1.5, 6.6],
          [-1.5, 6.8],
          [-1.7, 6.8],
          [-1.7, 6.6],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "Fairtrade",
      certificationDate: "2024-02-10",
      landUseHistory: "Some expansion detected, verification in progress",
      riskLevel: "Medium - monitoring required",
    },
  },
  {
    productGtin: "00234567890130",
    productName: "Cocoa Beans - Ivory Coast",
    originLat: 7.54,
    originLng: -5.5471,
    deforestationRisk: "high",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-5.6, 7.5],
          [-5.4, 7.5],
          [-5.4, 7.6],
          [-5.6, 7.6],
          [-5.6, 7.5],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: false,
      deforestationAlert: "Located within 2km of protected forest area",
      riskLevel: "High - protected area encroachment risk",
      actionRequired:
        "Require supplier to provide GPS coordinates and land title",
    },
  },

  // Palm Oil from Indonesia - High-risk deforestation areas
  {
    productGtin: "00345678901234",
    productName: "Palm Oil - Sumatra",
    originLat: 2.9938,
    originLng: 99.6094,
    deforestationRisk: "high",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [99.5, 2.9],
          [99.7, 2.9],
          [99.7, 3.1],
          [99.5, 3.1],
          [99.5, 2.9],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: false,
      deforestationAlert: "Plantation expansion detected in peatland area",
      riskLevel: "High - peatland conversion detected",
      actionRequired:
        "Immediate audit required, consider alternative suppliers",
    },
  },
  {
    productGtin: "00345678901241",
    productName: "Certified Palm Oil - Kalimantan",
    originLat: -0.0263,
    originLng: 109.3425,
    deforestationRisk: "low",
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "RSPO (Roundtable on Sustainable Palm Oil)",
      certificationDate: "2023-09-05",
      landUseHistory: "No deforestation, established plantation since 2010",
      supplierVerified: true,
      traceabilityLevel: "Segregated",
    },
  },

  // Timber from various regions
  {
    productGtin: "00456789012345",
    productName: "Teak Wood - Myanmar",
    originLat: 21.9162,
    originLng: 95.956,
    deforestationRisk: "high",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [95.8, 21.8],
          [96.1, 21.8],
          [96.1, 22.0],
          [95.8, 22.0],
          [95.8, 21.8],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: false,
      deforestationAlert: "Source region has history of illegal logging",
      riskLevel: "High - illegal logging risk",
      actionRequired: "Require FLEGT license or equivalent certification",
    },
  },
  {
    productGtin: "00456789012352",
    productName: "FSC Certified Pine - Sweden",
    originLat: 62.3908,
    originLng: 16.325,
    deforestationRisk: "low",
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "FSC (Forest Stewardship Council)",
      certificationDate: "2024-01-30",
      landUseHistory: "Sustainable forestry, replanting program active",
      supplierVerified: true,
      chainOfCustody: "FSC-C123456",
    },
  },

  // Soy from South America
  {
    productGtin: "00567890123456",
    productName: "Soybean - Cerrado Region, Brazil",
    originLat: -15.7942,
    originLng: -47.8822,
    deforestationRisk: "medium",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-48.0, -15.9],
          [-47.7, -15.9],
          [-47.7, -15.7],
          [-48.0, -15.7],
          [-48.0, -15.9],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "ProTerra",
      certificationDate: "2023-12-15",
      landUseHistory: "Some savanna conversion detected, monitoring required",
      riskLevel: "Medium - Cerrado conversion risk",
    },
  },
  {
    productGtin: "00567890123463",
    productName: "Organic Soybean - Paraná, Brazil",
    originLat: -25.4284,
    originLng: -49.2733,
    deforestationRisk: "low",
    dueDiligenceStatement: {
      certified: true,
      certificationBody: "EU Organic + Non-GMO Project",
      certificationDate: "2024-03-01",
      landUseHistory: "Established farmland, no forest conversion",
      supplierVerified: true,
    },
  },

  // Cattle from Brazil - High-risk for deforestation
  {
    productGtin: "00678901234567",
    productName: "Beef Cattle - Pará, Brazil",
    originLat: -3.7183,
    originLng: -52.3267,
    deforestationRisk: "high",
    geofenceGeoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-52.5, -3.8],
          [-52.1, -3.8],
          [-52.1, -3.6],
          [-52.5, -3.6],
          [-52.5, -3.8],
        ],
      ],
    },
    dueDiligenceStatement: {
      certified: false,
      deforestationAlert: "Ranch located in Amazon deforestation hotspot",
      riskLevel: "High - Amazon deforestation risk",
      actionRequired:
        "Require satellite monitoring and ranch-level traceability",
    },
  },
];

export async function seedEUDRData(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let inserted = 0;
  let errors = 0;

  for (const data of sampleData) {
    try {
      await db.insert(eudrGeolocation).values({
        userId,
        productGtin: data.productGtin,
        originLat: data.originLat.toString(),
        originLng: data.originLng.toString(),
        geofenceGeoJson: data.geofenceGeoJson || null,
        deforestationRisk: data.deforestationRisk,
        riskAssessmentDate: new Date().toISOString(),
        dueDiligenceStatement: data.dueDiligenceStatement || null,
      });
      inserted++;
      console.log(`✓ Inserted ${data.productName} (${data.productGtin})`);
    } catch (error) {
      errors++;
      serverLogger.error(`✗ Failed to insert ${data.productName}:`, error);
    }
  }

  return {
    success: true,
    inserted,
    errors,
    total: sampleData.length,
    message: `EUDR sample data seeded: ${inserted} locations inserted, ${errors} errors`,
  };
}

// CLI execution - DISABLED to prevent automatic seeding on deployment
// Seeding should only happen via admin UI at /admin/eudr-seeder
/*
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Seeding EUDR sample data...");
  
  // Use a default user ID for CLI execution (admin user)
  const defaultUserId = 1;
  
  seedEUDRData(defaultUserId)
    .then((result) => {
      console.log("\n" + result.message);
      console.log(`Total: ${result.total}, Inserted: ${result.inserted}, Errors: ${result.errors}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
*/
