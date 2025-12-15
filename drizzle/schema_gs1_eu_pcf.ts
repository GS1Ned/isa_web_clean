/**
 * GS1 EU Carbon Footprint (PCF) Attributes Schema
 * 
 * Source: GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0
 * Publisher: GS1 in Europe
 * Publication Date: Feb 2025
 * Status: Ratified
 * 
 * This schema stores the official GS1 EU GDSN attributes for Product Carbon Footprint (PCF)
 * data exchange, addressing ISA v1.0 Gap #1 (Product Carbon Footprint).
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * GS1 EU Carbon Footprint Attributes
 * 
 * Stores the 9 GDSN BMS attributes for exchanging Product Carbon Footprint data:
 * - 3 CarbonFootPrintHeader attributes (not repeated, applicable to trade item)
 * - 6 CarbonFootprintDetail attributes (repeatable for multiple life cycle stages)
 */
export const gs1EuCarbonFootprintAttributes = mysqlTable(
  "gs1_eu_carbon_footprint_attributes",
  {
    id: int("id").autoincrement().primaryKey(),
    
    // Attribute metadata
    bmsId: varchar("bmsId", { length: 10 }).notNull().unique(),
    gdsnName: varchar("gdsnName", { length: 100 }).notNull(),
    attributeName: varchar("attributeName", { length: 255 }).notNull(),
    className: mysqlEnum("className", [
      "CarbonFootPrintHeader",
      "CarbonFootprintDetail",
    ]).notNull(),
    
    // Attribute definition
    definition: text("definition").notNull(),
    instruction: text("instruction"),
    businessUsage: text("businessUsage"),
    
    // Data specifications
    dataType: mysqlEnum("dataType", [
      "Code",
      "Date",
      "Numeric",
      "Text",
    ]).notNull(),
    codeList: varchar("codeList", { length: 100 }),
    example: text("example"),
    
    // Cardinality
    mandatory: boolean("mandatory").default(false).notNull(),
    repeatable: boolean("repeatable").default(false).notNull(),
    
    // Source metadata
    sourceDocument: varchar("sourceDocument", { length: 255 })
      .default("GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0")
      .notNull(),
    sourcePublisher: varchar("sourcePublisher", { length: 100 })
      .default("GS1 in Europe")
      .notNull(),
    sourceVersion: varchar("sourceVersion", { length: 20 })
      .default("1.0")
      .notNull(),
    sourceDate: varchar("sourceDate", { length: 20 })
      .default("2025-02")
      .notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    bmsIdIdx: index("bmsId_idx").on(table.bmsId),
    gdsnNameIdx: index("gdsnName_idx").on(table.gdsnName),
    classNameIdx: index("className_idx").on(table.className),
  })
);

export type Gs1EuCarbonFootprintAttribute =
  typeof gs1EuCarbonFootprintAttributes.$inferSelect;
export type InsertGs1EuCarbonFootprintAttribute =
  typeof gs1EuCarbonFootprintAttributes.$inferInsert;

/**
 * GS1 EU Carbon Footprint Code Lists
 * 
 * Stores enumerated values for the 5 code list attributes:
 * - CfpValueVerificationCode (3 values)
 * - CfpBoundariesCode (8 values)
 * - MeasurementUnitCode (5 values)
 * - CfpMethodologyCode (10 values)
 * - CfpAccountingCode (2 values)
 * 
 * Total: 28 code values
 */
export const gs1EuCarbonFootprintCodeLists = mysqlTable(
  "gs1_eu_carbon_footprint_code_lists",
  {
    id: int("id").autoincrement().primaryKey(),
    
    // Code list metadata
    codeListName: varchar("codeListName", { length: 100 }).notNull(),
    attributeBmsId: varchar("attributeBmsId", { length: 10 }).notNull(),
    
    // Code value
    code: varchar("code", { length: 100 }).notNull(),
    definition: text("definition").notNull(),
    
    // Sorting and status
    sortOrder: int("sortOrder").default(0),
    isActive: boolean("isActive").default(true).notNull(),
    
    // Source metadata
    sourceDocument: varchar("sourceDocument", { length: 255 })
      .default("GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0")
      .notNull(),
    sourceVersion: varchar("sourceVersion", { length: 20 })
      .default("1.0")
      .notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    codeListNameIdx: index("codeListName_idx").on(table.codeListName),
    attributeBmsIdIdx: index("attributeBmsId_idx").on(table.attributeBmsId),
    codeIdx: index("code_idx").on(table.code),
  })
);

export type Gs1EuCarbonFootprintCodeList =
  typeof gs1EuCarbonFootprintCodeLists.$inferSelect;
export type InsertGs1EuCarbonFootprintCodeList =
  typeof gs1EuCarbonFootprintCodeLists.$inferInsert;
