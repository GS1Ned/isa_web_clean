#!/usr/bin/env node
/**
 * Seed ESG data categories, CTEs/KDEs, and DPP product categories
 * Run with: node scripts/seed-esg-data.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Create database connection
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Seeding ESG data from JSON files...\n");

// Load JSON data files
const commonDataCategoriesPath = path.join(
  __dirname,
  "../data/esg/common_data_categories.json"
);
const ctesAndKdesPath = path.join(__dirname, "../data/esg/ctes_and_kdes.json");
const dppIdentificationRulesPath = path.join(
  __dirname,
  "../data/esg/dpp_identification_rules.json"
);

const commonDataCategories = JSON.parse(
  fs.readFileSync(commonDataCategoriesPath, "utf-8")
);
const ctesAndKdes = JSON.parse(fs.readFileSync(ctesAndKdesPath, "utf-8"));
const dppIdentificationRules = JSON.parse(
  fs.readFileSync(dppIdentificationRulesPath, "utf-8")
);

// Seed ESG Data Categories
console.log("📊 Seeding ESG Data Categories...");
for (const category of commonDataCategories) {
  try {
    await connection.execute(
      `INSERT INTO esg_data_categories 
       (categoryId, categoryName, description, regulationLevel, exampleRegulations, likelyGS1Standards, likelyESGUseCases)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       categoryName = VALUES(categoryName),
       description = VALUES(description),
       regulationLevel = VALUES(regulationLevel),
       exampleRegulations = VALUES(exampleRegulations),
       likelyGS1Standards = VALUES(likelyGS1Standards),
       likelyESGUseCases = VALUES(likelyESGUseCases),
       updatedAt = NOW()`,
      [
        category.id,
        category.name,
        category.description,
        category.regulationLevel,
        JSON.stringify(category.exampleRegulations),
        JSON.stringify(category.likelyGS1Standards),
        JSON.stringify(category.likelyESGUseCases),
      ]
    );
    console.log(`  ✓ ${category.name}`);
  } catch (error) {
    console.error(`  ✗ Failed to seed ${category.name}:`, error.message);
  }
}

// Seed Critical Tracking Events
console.log("\n🔄 Seeding Critical Tracking Events (CTEs)...");
for (const cte of ctesAndKdes) {
  try {
    await connection.execute(
      `INSERT INTO critical_tracking_events 
       (cteId, cteName, description, typicalKDEs, exampleStandards, exampleRegulations)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       cteName = VALUES(cteName),
       description = VALUES(description),
       typicalKDEs = VALUES(typicalKDEs),
       exampleStandards = VALUES(exampleStandards),
       exampleRegulations = VALUES(exampleRegulations),
       updatedAt = NOW()`,
      [
        cte.cteId,
        cte.cteName,
        cte.description,
        JSON.stringify(cte.typicalKDEs),
        JSON.stringify(cte.exampleStandards),
        JSON.stringify(cte.exampleRegulations),
      ]
    );
    console.log(`  ✓ ${cte.cteName}`);
  } catch (error) {
    console.error(`  ✗ Failed to seed ${cte.cteName}:`, error.message);
  }
}

// Seed DPP Product Categories
console.log("\n📦 Seeding DPP Product Categories...");
for (const category of dppIdentificationRules) {
  try {
    await connection.execute(
      `INSERT INTO dpp_product_categories 
       (productCategory, inScope, gtinLevel, qualifiersRequired, qualifierAIs, 
        glnPartyRequired, glnFacilityRequired, madeToStockAI, madeToOrderAI, 
        recommendedCarriers, regulation, delegatedActStatus, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       inScope = VALUES(inScope),
       gtinLevel = VALUES(gtinLevel),
       qualifiersRequired = VALUES(qualifiersRequired),
       qualifierAIs = VALUES(qualifierAIs),
       glnPartyRequired = VALUES(glnPartyRequired),
       glnFacilityRequired = VALUES(glnFacilityRequired),
       madeToStockAI = VALUES(madeToStockAI),
       madeToOrderAI = VALUES(madeToOrderAI),
       recommendedCarriers = VALUES(recommendedCarriers),
       regulation = VALUES(regulation),
       delegatedActStatus = VALUES(delegatedActStatus),
       notes = VALUES(notes),
       updatedAt = NOW()`,
      [
        category.productCategory,
        category.inScope,
        category.identifierModel?.gtinLevel || null,
        JSON.stringify(category.identifierModel?.qualifiersRequired || []),
        JSON.stringify(category.identifierModel?.qualifierAIs || {}),
        category.identifierModel?.glnPartyRequired || false,
        category.identifierModel?.glnFacilityRequired || false,
        category.identifierModel?.madeToStockAI || null,
        category.identifierModel?.madeToOrderAI || null,
        JSON.stringify(category.recommendedCarriers),
        category.regulation,
        category.delegatedActStatus,
        category.notes,
      ]
    );
    console.log(`  ✓ ${category.productCategory}`);
  } catch (error) {
    console.error(
      `  ✗ Failed to seed ${category.productCategory}:`,
      error.message
    );
  }
}

console.log("\n✅ ESG data seeding completed!");

// Close connection
await connection.end();
process.exit(0);
