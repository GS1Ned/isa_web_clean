import { getDb } from "./db.js";
import { epcisEvents, eudrGeolocation } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

/**
 * EUDR Compliance Analyzer
 * Analyzes EPCIS events and geolocation data for EUDR compliance
 */

export interface EUDRComplianceReport {
  overallScore: number; // 0-100
  status: "compliant" | "at-risk" | "non-compliant";
  summary: string;
  findings: {
    category: string;
    status: "pass" | "warning" | "fail";
    message: string;
    details?: string;
  }[];
  recommendations: string[];
  statistics: {
    totalProducts: number;
    productsWithGeolocation: number;
    productsInRiskZones: number;
    productsWithDueDiligence: number;
  };
}

/**
 * Analyze EUDR compliance for a user's EPCIS events
 */
export async function analyzeEUDRCompliance(
  userId: number
): Promise<EUDRComplianceReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all EPCIS events for user
  const events = await db
    .select()
    .from(epcisEvents)
    .where(eq(epcisEvents.userId, userId));

  // Get all EUDR geolocation data for user
  const geolocations = await db
    .select()
    .from(eudrGeolocation)
    .where(eq(eudrGeolocation.userId, userId));

  // Extract unique products (GTINs)
  const products = new Set<string>();
  events.forEach(event => {
    if (event.epcList) {
      (event.epcList as string[]).forEach(epc => {
        // Extract GTIN from URN or use as-is
        const gtin = epc.includes(":") ? epc.split(":").pop() || epc : epc;
        products.add(gtin);
      });
    }
  });

  const totalProducts = products.size;

  // Check geolocation coverage
  const productsWithGeolocation = geolocations.length;
  const geolocationCoverage =
    totalProducts > 0 ? (productsWithGeolocation / totalProducts) * 100 : 0;

  // Check risk zones
  const productsInRiskZones = geolocations.filter(
    geo =>
      geo.deforestationRisk === "high" || geo.deforestationRisk === "medium"
  ).length;

  // Check due diligence statements
  const productsWithDueDiligence = geolocations.filter(
    geo =>
      geo.dueDiligenceStatement &&
      typeof geo.dueDiligenceStatement === "object" &&
      Object.keys(geo.dueDiligenceStatement).length > 0
  ).length;

  const dueDiligenceCoverage =
    productsWithGeolocation > 0
      ? (productsWithDueDiligence / productsWithGeolocation) * 100
      : 0;

  // Generate findings
  const findings: EUDRComplianceReport["findings"] = [];

  // Finding 1: Geolocation Data Completeness
  if (geolocationCoverage >= 90) {
    findings.push({
      category: "Geolocation Data",
      status: "pass",
      message: `Excellent geolocation coverage (${geolocationCoverage.toFixed(1)}%)`,
      details: `${productsWithGeolocation} out of ${totalProducts} products have geolocation data.`,
    });
  } else if (geolocationCoverage >= 50) {
    findings.push({
      category: "Geolocation Data",
      status: "warning",
      message: `Moderate geolocation coverage (${geolocationCoverage.toFixed(1)}%)`,
      details: `${productsWithGeolocation} out of ${totalProducts} products have geolocation data. EUDR requires geolocation for all commodities.`,
    });
  } else {
    findings.push({
      category: "Geolocation Data",
      status: "fail",
      message: `Insufficient geolocation coverage (${geolocationCoverage.toFixed(1)}%)`,
      details: `Only ${productsWithGeolocation} out of ${totalProducts} products have geolocation data. EUDR compliance requires comprehensive geolocation tracking.`,
    });
  }

  // Finding 2: Risk Zone Assessment
  if (productsInRiskZones === 0) {
    findings.push({
      category: "Deforestation Risk",
      status: "pass",
      message: "No products sourced from high-risk deforestation zones",
      details: "All products are from compliant or low-risk regions.",
    });
  } else if (productsInRiskZones <= productsWithGeolocation * 0.2) {
    findings.push({
      category: "Deforestation Risk",
      status: "warning",
      message: `${productsInRiskZones} products from at-risk zones`,
      details:
        "Some products originate from regions with deforestation concerns. Enhanced due diligence required.",
    });
  } else {
    findings.push({
      category: "Deforestation Risk",
      status: "fail",
      message: `${productsInRiskZones} products from high-risk deforestation zones`,
      details:
        "Significant portion of products from high-risk areas. Immediate action required to ensure EUDR compliance.",
    });
  }

  // Finding 3: Due Diligence Statements
  if (dueDiligenceCoverage >= 90) {
    findings.push({
      category: "Due Diligence",
      status: "pass",
      message: `Comprehensive due diligence coverage (${dueDiligenceCoverage.toFixed(1)}%)`,
      details: `${productsWithDueDiligence} out of ${productsWithGeolocation} products have due diligence statements.`,
    });
  } else if (dueDiligenceCoverage >= 50) {
    findings.push({
      category: "Due Diligence",
      status: "warning",
      message: `Partial due diligence coverage (${dueDiligenceCoverage.toFixed(1)}%)`,
      details: `${productsWithDueDiligence} out of ${productsWithGeolocation} products have due diligence statements. Complete coverage required for EUDR.`,
    });
  } else {
    findings.push({
      category: "Due Diligence",
      status: "fail",
      message: `Insufficient due diligence statements (${dueDiligenceCoverage.toFixed(1)}%)`,
      details: `Only ${productsWithDueDiligence} out of ${productsWithGeolocation} products have due diligence statements. EUDR requires documented due diligence for all products.`,
    });
  }

  // Finding 4: Traceability Chain
  const eventsPerProduct =
    totalProducts > 0 ? events.length / totalProducts : 0;
  if (eventsPerProduct >= 3) {
    findings.push({
      category: "Traceability Chain",
      status: "pass",
      message: `Strong traceability (avg ${eventsPerProduct.toFixed(1)} events per product)`,
      details: "Comprehensive supply chain tracking with multiple touchpoints.",
    });
  } else if (eventsPerProduct >= 1) {
    findings.push({
      category: "Traceability Chain",
      status: "warning",
      message: `Basic traceability (avg ${eventsPerProduct.toFixed(1)} events per product)`,
      details:
        "Limited supply chain visibility. Additional tracking recommended for complete EUDR compliance.",
    });
  } else {
    findings.push({
      category: "Traceability Chain",
      status: "fail",
      message: "Insufficient traceability data",
      details:
        "Minimal supply chain tracking. EUDR requires comprehensive traceability from origin to market.",
    });
  }

  // Calculate overall compliance score
  const passCount = findings.filter(f => f.status === "pass").length;
  const warningCount = findings.filter(f => f.status === "warning").length;
  const failCount = findings.filter(f => f.status === "fail").length;

  const overallScore = Math.round(
    (passCount * 100 + warningCount * 50 + failCount * 0) / findings.length
  );

  // Determine overall status
  let status: "compliant" | "at-risk" | "non-compliant";
  if (overallScore >= 80) {
    status = "compliant";
  } else if (overallScore >= 50) {
    status = "at-risk";
  } else {
    status = "non-compliant";
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (geolocationCoverage < 90) {
    recommendations.push(
      `Add geolocation data for ${totalProducts - productsWithGeolocation} products missing coordinates. Use GPS coordinates with 6+ decimal precision.`
    );
  }

  if (productsInRiskZones > 0) {
    recommendations.push(
      `Conduct enhanced due diligence for ${productsInRiskZones} products from at-risk zones. Verify deforestation-free certification.`
    );
  }

  if (dueDiligenceCoverage < 90) {
    recommendations.push(
      `Document due diligence statements for ${productsWithGeolocation - productsWithDueDiligence} products. Include risk assessment and mitigation measures.`
    );
  }

  if (eventsPerProduct < 3) {
    recommendations.push(
      "Enhance supply chain tracking by capturing additional EPCIS events (processing, shipping, receiving) for complete traceability."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Maintain current compliance practices. Continue monitoring for regulatory updates and supply chain changes."
    );
  }

  // Generate summary
  const summary =
    `EUDR Compliance Score: ${overallScore}/100 (${status.toUpperCase()}). ` +
    `${passCount} requirements met, ${warningCount} warnings, ${failCount} critical issues. ` +
    `${productsWithGeolocation}/${totalProducts} products have geolocation data, ` +
    `${productsInRiskZones} in risk zones.`;

  return {
    overallScore,
    status,
    summary,
    findings,
    recommendations,
    statistics: {
      totalProducts,
      productsWithGeolocation,
      productsInRiskZones,
      productsWithDueDiligence,
    },
  };
}
