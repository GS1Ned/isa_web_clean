-- GS1 EU Carbon Footprint (PCF) Attributes Schema
-- Source: GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0
-- Publisher: GS1 in Europe
-- Publication Date: Feb 2025
-- Status: Ratified

-- Create GS1 EU Carbon Footprint Attributes table
CREATE TABLE IF NOT EXISTS gs1_eu_carbon_footprint_attributes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Attribute metadata
  bmsId VARCHAR(10) NOT NULL UNIQUE,
  gdsnName VARCHAR(100) NOT NULL,
  attributeName VARCHAR(255) NOT NULL,
  className ENUM('CarbonFootPrintHeader', 'CarbonFootprintDetail') NOT NULL,
  
  -- Attribute definition
  definition TEXT NOT NULL,
  instruction TEXT,
  businessUsage TEXT,
  
  -- Data specifications
  dataType ENUM('Code', 'Date', 'Numeric', 'Text') NOT NULL,
  codeList VARCHAR(100),
  example TEXT,
  
  -- Cardinality
  mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  repeatable BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Source metadata
  sourceDocument VARCHAR(255) NOT NULL DEFAULT 'GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0',
  sourcePublisher VARCHAR(100) NOT NULL DEFAULT 'GS1 in Europe',
  sourceVersion VARCHAR(20) NOT NULL DEFAULT '1.0',
  sourceDate VARCHAR(20) NOT NULL DEFAULT '2025-02',
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX bmsId_idx (bmsId),
  INDEX gdsnName_idx (gdsnName),
  INDEX className_idx (className)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create GS1 EU Carbon Footprint Code Lists table
CREATE TABLE IF NOT EXISTS gs1_eu_carbon_footprint_code_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Code list metadata
  codeListName VARCHAR(100) NOT NULL,
  attributeBmsId VARCHAR(10) NOT NULL,
  
  -- Code value
  code VARCHAR(100) NOT NULL,
  definition TEXT NOT NULL,
  
  -- Sorting and status
  sortOrder INT DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Source metadata
  sourceDocument VARCHAR(255) NOT NULL DEFAULT 'GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0',
  sourceVersion VARCHAR(20) NOT NULL DEFAULT '1.0',
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX codeListName_idx (codeListName),
  INDEX attributeBmsId_idx (attributeBmsId),
  INDEX code_idx (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
