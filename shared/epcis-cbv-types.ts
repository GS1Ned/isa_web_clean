/**
 * EPCIS/CBV Traceability Types for ISA
 *
 * Lightweight TypeScript types for GS1 EPCIS 2.0 and CBV 2.0 standards,
 * focused on ESG traceability use cases (EUDR, CSRD, PPWR).
 *
 * Source: https://ref.gs1.org/epcis/ and https://ref.gs1.org/cbv/
 * Standards: EPCIS 2.0, CBV 2.0
 * Curated: 2025-12-10
 */

// ============================================================================
// CBV Business Step (bizStep)
// ============================================================================

export type CBVBizStep =
  | "BizStep-commissioning" // Origin: catching, harvesting, slaughtering → EUDR
  | "BizStep-shipping" // Transport → CSRD Scope 3, CBAM
  | "BizStep-receiving" // Custody transfer → EUDR, CSRD
  | "BizStep-transforming" // Manufacturing/processing → EUDR, CSRD, PPWR
  | "BizStep-destroying" // Disposal → PPWR, Waste Directive
  | "BizStep-recycling" // Recycling process → PPWR, Circular Economy
  | "BizStep-repairing" // Repair → PPWR, Right to Repair
  | "BizStep-collecting"; // Collection for recycling → PPWR, EPR

export interface CBVBizStepInfo {
  code: CBVBizStep;
  uri: string;
  label: string;
  description: string;
  esgUseCases: string[];
  regulationMapping: string[];
}

// ============================================================================
// CBV Disposition (disposition)
// ============================================================================

export type CBVDisposition =
  | "Disp-in_transit" // Goods moving → CSRD Scope 3, CBAM
  | "Disp-active" // In use → Product lifetime tracking
  | "Disp-recalled" // Recalled → Product safety
  | "Disp-expired" // Expired → Food waste, PPWR
  | "Disp-destroyed" // Destroyed → PPWR end-of-life
  | "Disp-recyclable" // Recyclable → PPWR compliance
  | "Disp-returned"; // Returned → PPWR take-back, EPR

export interface CBVDispositionInfo {
  code: CBVDisposition;
  uri: string;
  label: string;
  description: string;
  esgUseCases: string[];
  regulationMapping: string[];
}

// ============================================================================
// CBV Business Transaction Type (bizTransactionList.type)
// ============================================================================

export type CBVBizTransactionType =
  | "BTT-cert" // Certification → EUDR (FSC, PEFC), CSRD
  | "BTT-pedigree" // Pedigree/provenance → EUDR, CSRD
  | "BTT-po" // Purchase Order → Supply chain mapping
  | "BTT-desadv"; // Despatch Advice/ASN → CSRD Scope 3

export interface CBVBizTransactionTypeInfo {
  code: CBVBizTransactionType;
  uri: string;
  label: string;
  description: string;
  esgUseCases: string[];
  regulationMapping: string[];
}

// ============================================================================
// CBV Source/Destination Type (sourceList/destinationList.type)
// ============================================================================

export type CBVSourceDestType =
  | "SDT-owning_party" // Owner → EUDR ownership chain
  | "SDT-possessing_party" // Possessor → EUDR custody chain
  | "SDT-location"; // Location → EUDR geographic origin, CSRD

export interface CBVSourceDestTypeInfo {
  code: CBVSourceDestType;
  uri: string;
  label: string;
  description: string;
  esgUseCases: string[];
  regulationMapping: string[];
}

// ============================================================================
// CBV Error Reason (errorDeclaration.reason)
// ============================================================================

export type CBVErrorReason = "ER-incorrect_data"; // Data correction → CSRD data quality

export interface CBVErrorReasonInfo {
  code: CBVErrorReason;
  uri: string;
  label: string;
  description: string;
  esgUseCases: string[];
  regulationMapping: string[];
}

// ============================================================================
// GS1 Sensor Measurement Type (sensorReport.type)
// ============================================================================

export type GS1MeasurementType =
  | "Temperature" // Cold chain → CSRD Scope 3 refrigerant
  | "Humidity" // Storage conditions → Food safety
  | "Speed" // Vehicle speed → CSRD Scope 3, CBAM
  | "Mileage"; // Distance → CSRD Scope 3, CBAM

export interface GS1MeasurementTypeInfo {
  code: GS1MeasurementType;
  uri: string;
  label: string;
  description: string;
  esgUseCases: string[];
  regulationMapping: string[];
}

// ============================================================================
// EPCIS Event Types
// ============================================================================

export type EPCISEventType =
  | "ObjectEvent" // Instance/class-level object observation
  | "AggregationEvent" // Parent-child relationships (packaging)
  | "TransactionEvent" // Business transaction association
  | "TransformationEvent" // Input → output transformation
  | "AssociationEvent"; // Object associations (pallets, containers)

export interface EPCISEventTypeInfo {
  type: EPCISEventType;
  description: string;
  esgUseCases: string[];
  typicalBizSteps: CBVBizStep[];
}

// ============================================================================
// EPCIS Event Action
// ============================================================================

export type EPCISAction = "ADD" | "OBSERVE" | "DELETE";

// ============================================================================
// ESG Traceability Patterns
// ============================================================================

export interface EUDRTraceabilityChain {
  origin: {
    bizStep: "BizStep-commissioning";
    location: string; // Geographic coordinates
    certification?: "BTT-cert"; // FSC, PEFC, etc.
  };
  transformation: {
    bizStep: "BizStep-transforming";
    inputs: string[]; // Input EPCs
    outputs: string[]; // Output EPCs
  };
  custody: {
    sourceDestType: "SDT-owning_party" | "SDT-possessing_party";
    parties: string[]; // GLNs of parties in chain
  };
  transport: {
    bizStep: "BizStep-shipping" | "BizStep-receiving";
    disposition: "Disp-in_transit";
    locations: string[]; // GLNs of facilities
  };
}

export interface CSRDScope3Emissions {
  transport: {
    bizStep: "BizStep-shipping";
    disposition: "Disp-in_transit";
    sensorData: {
      speed?: number; // MeasurementType-Speed
      mileage?: number; // MeasurementType-Mileage
    };
  };
  manufacturing: {
    bizStep: "BizStep-transforming";
    location: string; // GLN of facility
  };
}

export interface PPWRCircularEconomy {
  production: {
    bizStep: "BizStep-commissioning";
  };
  use: {
    disposition: "Disp-active";
  };
  collection: {
    bizStep: "BizStep-collecting";
    disposition: "Disp-returned";
  };
  recycling: {
    bizStep: "BizStep-recycling";
    disposition: "Disp-recyclable";
  };
  disposal: {
    bizStep: "BizStep-destroying";
    disposition: "Disp-destroyed";
  };
}

// ============================================================================
// Regulation Mapping Helpers
// ============================================================================

export interface RegulationEPCISMapping {
  regulationId: string; // e.g., "EUDR", "CSRD", "PPWR"
  requiredBizSteps: CBVBizStep[];
  requiredDispositions: CBVDisposition[];
  requiredTransactionTypes: CBVBizTransactionType[];
  requiredSensorTypes: GS1MeasurementType[];
  traceabilityRequirements: string[];
}

export const REGULATION_EPCIS_MAPPINGS: Record<string, RegulationEPCISMapping> =
  {
    EUDR: {
      regulationId: "EUDR",
      requiredBizSteps: [
        "BizStep-commissioning", // Origin tracking
        "BizStep-transforming", // Processing steps
        "BizStep-shipping", // Transport
        "BizStep-receiving", // Custody transfer
      ],
      requiredDispositions: [],
      requiredTransactionTypes: [
        "BTT-cert", // Certifications (FSC, PEFC)
        "BTT-pedigree", // Provenance documentation
      ],
      requiredSensorTypes: [],
      traceabilityRequirements: [
        "Geographic origin (commissioning location)",
        "Custody chain (owning_party, possessing_party)",
        "Transformation steps (inputs → outputs)",
        "Certifications (FSC, PEFC, organic)",
      ],
    },
    CSRD: {
      regulationId: "CSRD",
      requiredBizSteps: [
        "BizStep-shipping", // Scope 3 transport
        "BizStep-transforming", // Manufacturing emissions
      ],
      requiredDispositions: [
        "Disp-in_transit", // Goods in transit
      ],
      requiredTransactionTypes: [],
      requiredSensorTypes: [
        "Speed", // Vehicle speed for emissions
        "Mileage", // Distance for emissions
        "Temperature", // Cold chain refrigerant emissions
      ],
      traceabilityRequirements: [
        "Scope 3 transport emissions (shipping + sensor data)",
        "Manufacturing facility locations",
        "Supply chain mapping (custody chain)",
      ],
    },
    PPWR: {
      regulationId: "PPWR",
      requiredBizSteps: [
        "BizStep-commissioning", // Production
        "BizStep-collecting", // Collection schemes
        "BizStep-recycling", // Recycling process
        "BizStep-destroying", // Disposal
        "BizStep-repairing", // Lifetime extension
      ],
      requiredDispositions: [
        "Disp-active", // In use
        "Disp-recyclable", // Recyclable status
        "Disp-returned", // Take-back
        "Disp-destroyed", // End-of-life
      ],
      requiredTransactionTypes: [],
      requiredSensorTypes: [],
      traceabilityRequirements: [
        "Product lifecycle tracking (commissioning → active → collecting → recycling/destroying)",
        "Recycled content verification (transformation inputs)",
        "Take-back scheme compliance (returned disposition)",
        "Repair and reuse tracking (repairing bizStep)",
      ],
    },
  };

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get ESG-relevant EPCIS/CBV codes for a regulation
 */
export function getEPCISCodesForRegulation(
  regulationId: string
): RegulationEPCISMapping | undefined {
  return REGULATION_EPCIS_MAPPINGS[regulationId];
}

/**
 * Check if a bizStep is relevant for ESG traceability
 */
export function isESGRelevantBizStep(bizStep: string): bizStep is CBVBizStep {
  const esgBizSteps: CBVBizStep[] = [
    "BizStep-commissioning",
    "BizStep-shipping",
    "BizStep-receiving",
    "BizStep-transforming",
    "BizStep-destroying",
    "BizStep-recycling",
    "BizStep-repairing",
    "BizStep-collecting",
  ];
  return esgBizSteps.includes(bizStep as CBVBizStep);
}

/**
 * Check if a disposition is relevant for ESG traceability
 */
export function isESGRelevantDisposition(
  disposition: string
): disposition is CBVDisposition {
  const esgDispositions: CBVDisposition[] = [
    "Disp-in_transit",
    "Disp-active",
    "Disp-recalled",
    "Disp-expired",
    "Disp-destroyed",
    "Disp-recyclable",
    "Disp-returned",
  ];
  return esgDispositions.includes(disposition as CBVDisposition);
}

/**
 * Get human-readable label for EPCIS/CBV code
 */
export function getCodeLabel(code: string): string {
  // Remove prefix and convert to title case
  return code
    .replace(/^(BizStep-|Disp-|BTT-|SDT-|ER-)/, "")
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get regulation tags for an EPCIS/CBV code
 */
export function getRegulationTagsForCode(code: string): string[] {
  const tags: string[] = [];

  for (const [regulationId, mapping] of Object.entries(
    REGULATION_EPCIS_MAPPINGS
  )) {
    if (
      mapping.requiredBizSteps.includes(code as CBVBizStep) ||
      mapping.requiredDispositions.includes(code as CBVDisposition) ||
      mapping.requiredTransactionTypes.includes(
        code as CBVBizTransactionType
      ) ||
      mapping.requiredSensorTypes.includes(code as GS1MeasurementType)
    ) {
      tags.push(regulationId);
    }
  }

  return tags;
}
