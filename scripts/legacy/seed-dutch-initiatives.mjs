import { getDb } from "../server/db.ts";
import {
  dutchInitiatives,
  initiativeRegulationMappings,
  initiativeStandardMappings,
} from "../drizzle/schema.ts";

async function seedDutchInitiatives() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  console.log("Seeding Dutch compliance initiatives...\n");

  try {
    // 1. UPV Textiel (Extended Producer Responsibility - Textiles)
    const [upvTextiel] = await db.insert(dutchInitiatives).values({
      initiativeName:
        "Uitgebreide Producentenverantwoordelijkheid Textiel (UPV Textiel)",
      shortName: "UPV Textiel",
      initiativeType: "EPR Scheme",
      status: "Active",
      sector: "Textiles",
      scope:
        "Textile producers and importers in the Netherlands must take responsibility for the end-of-life management of textiles placed on the Dutch market.",
      startDate: new Date("2025-01-01"),
      endDate: null,
      reportingDeadline: "Mid-year annually (preceding calendar year data)",
      keyTargets: [
        "50% of textiles placed on market must be prepared for reuse or recycling (2025 target)",
        "Annual reporting on weight of textiles placed on market",
        "Registration with Producer Responsibility Organizations (PROs)",
        "Financial contribution based on textile weight and type",
      ],
      complianceRequirements:
        "Producers and importers must register with a PRO, report annually on textile volumes, and pay fees based on weight and material composition. Detailed material data (fiber composition, weight) must be provided for fee calculation.",
      gs1Relevance:
        "GDSN textile composition attributes are critical for EPR reporting. GS1 Web Vocabulary properties (gs1:materialComposition, gs1:textileWeight) enable automated data collection. GTIN provides unique product identification for traceability.",
      requiredGS1Standards: [60005, 60002], // GDSN, GS1 Web Vocabulary
      requiredGDSNAttributes: [
        "textileMaterialComposition",
        "textileWeight",
        "productRecycledContent",
        "gtin",
      ],
      relatedEURegulations: [30024], // Waste Framework Directive
      managingOrganization: "Producer Responsibility Organizations (PROs)",
      officialUrl:
        "https://www.rijksoverheid.nl/onderwerpen/afval/uitgebreide-producentenverantwoordelijkheid",
      documentationUrl: "https://www.afvalcirculair.nl/onderwerpen/textiel/",
    });
    console.log("✓ Seeded: UPV Textiel");

    // 2. Green Deal Duurzame Zorg 3.0 (Sustainable Healthcare)
    const [greenDealZorg] = await db.insert(dutchInitiatives).values({
      initiativeName: "Green Deal Duurzame Zorg 3.0",
      shortName: "Green Deal Zorg",
      initiativeType: "Voluntary Covenant",
      status: "Active",
      sector: "Healthcare",
      scope:
        "Dutch cure and care sectors committed to reducing environmental impact through CO2 reduction, circular operations, and minimizing medication residues in water.",
      startDate: new Date("2022-01-01"),
      endDate: new Date("2026-12-31"),
      reportingDeadline: "Annual progress reports to RIVM",
      keyTargets: [
        "55% CO2 reduction by 2030 (baseline: 1990)",
        "50% reduction in primary raw materials by 2030",
        "Reduce medication residues in water",
        "Circular operations in healthcare facilities",
      ],
      complianceRequirements:
        "Participating healthcare organizations must track and report CO2 emissions, material consumption, and waste generation. Medication waste management protocols must be implemented.",
      gs1Relevance:
        "GTIN for medical products enables supply chain traceability and waste tracking. GS1 Healthcare standards support circular economy initiatives. Carbon footprint data (GS1 Web Vocabulary: gs1:carbonFootprint) enables emissions reporting.",
      requiredGS1Standards: [30028, 60002], // GS1 Healthcare, GS1 Web Vocabulary
      requiredGDSNAttributes: [
        "gtin",
        "productCarbonFootprint",
        "recyclableContent",
        "hazardousMaterialCode",
      ],
      relatedEURegulations: [30001, 30003], // CSRD, ESPR
      managingOrganization: "RIVM (National Institute for Public Health)",
      officialUrl: "https://www.greendeals.nl/green-deals/duurzame-zorg-30",
      documentationUrl: "https://www.rivm.nl/duurzame-zorg",
    });
    console.log("✓ Seeded: Green Deal Zorg");

    // 3. DSGO (Digitaal Stelsel Gebouwde Omgeving - Digital Built Environment)
    const [dsgo] = await db.insert(dutchInitiatives).values({
      initiativeName: "Digitaal Stelsel Gebouwde Omgeving (DSGO)",
      shortName: "DSGO",
      initiativeType: "Data Framework",
      status: "Active",
      sector: "Construction",
      scope:
        "Federated system of agreements for data sharing in the built environment, facilitating exchange of logistics and material data between software platforms.",
      startDate: new Date("2020-01-01"),
      endDate: null,
      reportingDeadline: "N/A (continuous operation)",
      keyTargets: [
        "Standardized data exchange for construction materials",
        "Building Information Modeling (BIM) integration",
        "Circular material passports for construction products",
        "Interoperability between construction software platforms",
      ],
      complianceRequirements:
        "Construction companies and material suppliers must adopt DSGO data standards for material documentation. Digital product passports must include material composition, origin, and circularity data.",
      gs1Relevance:
        "GTIN for construction materials provides unique identification. GS1 Digital Link enables material passports accessible via QR codes. EPCIS supports construction supply chain traceability and material provenance.",
      requiredGS1Standards: [60017, 30008, 60002], // EPCIS, GS1 Digital Link, GS1 Web Vocabulary
      requiredGDSNAttributes: [
        "gtin",
        "materialComposition",
        "productOrigin",
        "recyclableContent",
        "productWeight",
      ],
      relatedEURegulations: [30003], // ESPR (Digital Product Passport)
      managingOrganization: "DigiGO Foundation",
      officialUrl: "https://www.digigo.nu/",
      documentationUrl: "https://www.digigo.nu/dsgo",
    });
    console.log("✓ Seeded: DSGO");

    // 4. Denim Deal 2.0
    const [denimDeal] = await db.insert(dutchInitiatives).values({
      initiativeName: "Denim Deal 2.0",
      shortName: "Denim Deal",
      initiativeType: "Voluntary Covenant",
      status: "Active",
      sector: "Textiles",
      scope:
        "International covenant involving brands, recyclers, and weavers to establish a circular standard for denim fiber, targeting 1 billion pairs of jeans with 20% post-consumer recycled (PCR) cotton.",
      startDate: new Date("2021-01-01"),
      endDate: null,
      reportingDeadline: "Annual progress reports",
      keyTargets: [
        "1 billion pairs of jeans containing 20% Post-Consumer Recycled (PCR) cotton",
        "Establish circular standard for denim fiber",
        "Scale up PCR cotton supply chain",
        "International expansion of covenant",
      ],
      complianceRequirements:
        "Participating brands must report on PCR cotton usage in denim products. Recyclers must provide traceability data for PCR cotton. Material composition data must be accurate and verifiable.",
      gs1Relevance:
        "GDSN textile composition attributes enable PCR cotton percentage tracking. GS1 Web Vocabulary (gs1:recycledContent) provides standardized data format. Supply chain traceability via EPCIS ensures PCR cotton provenance.",
      requiredGS1Standards: [60005, 60017, 60002], // GDSN, EPCIS, GS1 Web Vocabulary
      requiredGDSNAttributes: [
        "textileMaterialComposition",
        "productRecycledContent",
        "gtin",
        "countryOfOrigin",
      ],
      relatedEURegulations: [30024, 30003], // Waste Framework, ESPR
      managingOrganization: "Denim Deal Consortium",
      officialUrl: "https://www.denimdeal.nl/",
      documentationUrl: "https://www.denimdeal.nl/about",
    });
    console.log("✓ Seeded: Denim Deal");

    // 5. Verpact (Packaging Waste Management)
    const [verpact] = await db.insert(dutchInitiatives).values({
      initiativeName: "Verpact (formerly Afvalfonds Verpakkingen)",
      shortName: "Verpact",
      initiativeType: "EPR Scheme",
      status: "Active",
      sector: "Packaging",
      scope:
        "National EPR scheme managing waste management contributions for all packaging placed on the Dutch market. Requires detailed material sub-type data for fee calculation (Tariefdifferentiatie).",
      startDate: new Date("2013-01-01"),
      endDate: null,
      reportingDeadline: "Annual reporting",
      keyTargets: [
        "100% packaging recyclability by 2030 (aligned with PPWR)",
        "Weight-based fee structure (accurate to gram)",
        "Material sub-type differentiation for fee modulation",
        "Recycled content incentives",
      ],
      complianceRequirements:
        "Producers and importers must report packaging weight and material composition with granular sub-type data (e.g., PET_TRANSPARENT vs PET_OPAQUE). Packaging must be registered with Verpact. Fees are calculated based on weight, material type, and recyclability.",
      gs1Relevance:
        "GDSN Packaging Information Module is CRITICAL for Verpact compliance. packagingMaterialTypeCode must use precise codes (not generic 'PLASTIC'). packagingRecyclingSchemeCode must be set to 'VERPACT'. Accurate weight data (packagingWeight) is mandatory for fee calculation.",
      requiredGS1Standards: [60005], // GDSN
      requiredGDSNAttributes: [
        "packagingMaterialTypeCode",
        "packagingRecyclingSchemeCode",
        "packagingRecyclabilityAssessmentSpecificationCode",
        "packagingRecycledContent",
        "packagingWeight",
      ],
      relatedEURegulations: [30008], // PPWR (Packaging and Packaging Waste Regulation)
      managingOrganization: "Verpact",
      officialUrl: "https://www.verpact.nl/",
      documentationUrl: "https://www.verpact.nl/producenten",
    });
    console.log("✓ Seeded: Verpact\n");

    // Create initiative-regulation mappings
    console.log("Creating initiative-regulation mappings...");

    // UPV Textiel → Waste Framework Directive
    await db.insert(initiativeRegulationMappings).values({
      initiativeId: upvTextiel.insertId,
      regulationId: 30024, // Waste Framework Directive
      relationshipType: "Implements",
      description:
        "UPV Textiel implements the EU Waste Framework Directive's Extended Producer Responsibility requirements for textiles in the Netherlands.",
    });

    // Green Deal Zorg → CSRD
    await db.insert(initiativeRegulationMappings).values({
      initiativeId: greenDealZorg.insertId,
      regulationId: 30001, // CSRD
      relationshipType: "Aligns With",
      description:
        "Green Deal Zorg aligns with CSRD sustainability reporting requirements, particularly for healthcare sector emissions and circular economy metrics.",
    });

    // Green Deal Zorg → ESPR
    await db.insert(initiativeRegulationMappings).values({
      initiativeId: greenDealZorg.insertId,
      regulationId: 30003, // ESPR
      relationshipType: "Complements",
      description:
        "Green Deal Zorg complements ESPR's circular economy objectives for medical products and healthcare equipment.",
    });

    // DSGO → ESPR (Digital Product Passport)
    await db.insert(initiativeRegulationMappings).values({
      initiativeId: dsgo.insertId,
      regulationId: 30003, // ESPR
      relationshipType: "Implements",
      description:
        "DSGO provides the technical infrastructure for Digital Product Passports required by ESPR for construction materials.",
    });

    // Denim Deal → UPV Textiel
    await db.insert(initiativeRegulationMappings).values({
      initiativeId: denimDeal.insertId,
      regulationId: 30024, // Waste Framework Directive
      relationshipType: "Complements",
      description:
        "Denim Deal complements UPV Textiel by establishing circular standards for denim, supporting EPR objectives.",
    });

    // Verpact → PPWR
    await db.insert(initiativeRegulationMappings).values({
      initiativeId: verpact.insertId,
      regulationId: 30008, // PPWR
      relationshipType: "Implements",
      description:
        "Verpact implements PPWR's packaging waste management requirements in the Netherlands, with granular material sub-type differentiation for fee calculation.",
    });

    console.log("✓ Created 6 initiative-regulation mappings\n");

    // Create initiative-standard mappings
    console.log("Creating initiative-standard mappings...");

    // UPV Textiel → GDSN (CRITICAL)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: upvTextiel.insertId,
      standardId: 60005, // GDSN
      criticality: "CRITICAL",
      implementationNotes:
        "GDSN textile composition attributes (textileMaterialComposition, textileWeight) are mandatory for EPR reporting and fee calculation.",
    });

    // UPV Textiel → GS1 Web Vocabulary (RECOMMENDED)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: upvTextiel.insertId,
      standardId: 60002, // GS1 Web Vocabulary
      criticality: "RECOMMENDED",
      implementationNotes:
        "Use gs1:materialComposition and gs1:textileWeight for digital product passports and automated EPR data collection.",
    });

    // Green Deal Zorg → GS1 Healthcare (CRITICAL)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: greenDealZorg.insertId,
      standardId: 30028, // GS1 Healthcare
      criticality: "CRITICAL",
      implementationNotes:
        "GS1 Healthcare standards enable supply chain traceability for medical products, supporting circular economy and waste tracking initiatives.",
    });

    // Green Deal Zorg → GS1 Web Vocabulary (RECOMMENDED)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: greenDealZorg.insertId,
      standardId: 60002, // GS1 Web Vocabulary
      criticality: "RECOMMENDED",
      implementationNotes:
        "Use gs1:carbonFootprint for emissions reporting and gs1:recyclableContent for circular economy metrics.",
    });

    // DSGO → EPCIS (CRITICAL)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: dsgo.insertId,
      standardId: 60017, // EPCIS
      criticality: "CRITICAL",
      implementationNotes:
        "EPCIS provides construction supply chain traceability and material provenance data required for circular material passports.",
    });

    // DSGO → GS1 Digital Link (CRITICAL)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: dsgo.insertId,
      standardId: 30008, // GS1 Digital Link
      criticality: "CRITICAL",
      implementationNotes:
        "GS1 Digital Link enables QR code-based access to material passports, integrating with BIM systems and DSGO data framework.",
    });

    // DSGO → GS1 Web Vocabulary (RECOMMENDED)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: dsgo.insertId,
      standardId: 60002, // GS1 Web Vocabulary
      criticality: "RECOMMENDED",
      implementationNotes:
        "Use gs1:materialComposition and gs1:productOrigin for material passport data.",
    });

    // Denim Deal → GDSN (CRITICAL)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: denimDeal.insertId,
      standardId: 60005, // GDSN
      criticality: "CRITICAL",
      implementationNotes:
        "GDSN textile composition attributes enable PCR cotton percentage tracking and verification.",
    });

    // Denim Deal → EPCIS (RECOMMENDED)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: denimDeal.insertId,
      standardId: 60017, // EPCIS
      criticality: "RECOMMENDED",
      implementationNotes:
        "EPCIS provides supply chain traceability for PCR cotton, ensuring provenance and authenticity.",
    });

    // Denim Deal → GS1 Web Vocabulary (RECOMMENDED)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: denimDeal.insertId,
      standardId: 60002, // GS1 Web Vocabulary
      criticality: "RECOMMENDED",
      implementationNotes:
        "Use gs1:recycledContent to standardize PCR cotton percentage data.",
    });

    // Verpact → GDSN (CRITICAL)
    await db.insert(initiativeStandardMappings).values({
      initiativeId: verpact.insertId,
      standardId: 60005, // GDSN
      criticality: "CRITICAL",
      implementationNotes:
        "GDSN Packaging Information Module is MANDATORY for Verpact compliance. packagingMaterialTypeCode must use granular codes (e.g., PET_TRANSPARENT vs PET_OPAQUE). packagingRecyclingSchemeCode must be 'VERPACT'. packagingWeight must be accurate to gram.",
    });

    console.log("✓ Created 11 initiative-standard mappings\n");

    console.log(
      "✅ Successfully seeded 5 Dutch compliance initiatives with mappings!"
    );
    console.log("\nSummary:");
    console.log("- 5 Dutch initiatives");
    console.log("- 6 initiative-regulation mappings");
    console.log("- 11 initiative-standard mappings");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Dutch initiatives:", error);
    process.exit(1);
  }
}

seedDutchInitiatives();
