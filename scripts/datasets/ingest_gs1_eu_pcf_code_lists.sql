-- GS1 EU Carbon Footprint Code Lists Ingestion
-- Source: GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0
-- Total: 28 code values across 5 code lists

-- CfpValueVerificationCode (3 values) - BMS ID 8712
INSERT INTO gs1_eu_carbon_footprint_code_lists (
  codeListName, attributeBmsId, code, definition, sortOrder
) VALUES
(
  'CfpValueVerificationCode',
  '8712',
  'EXTERNAL_VERIFICATION',
  'The values have been verified by an external party.',
  1
),
(
  'CfpValueVerificationCode',
  '8712',
  'NOT_VERIFIED',
  'The values have been calculated according to the reported calculation method, but have not been verified.',
  2
),
(
  'CfpValueVerificationCode',
  '8712',
  'PEER_REVIEWED',
  'The values and methodology have been reviewed internally or by 3rd party.',
  3
);

-- CfpBoundariesCode (8 values) - BMS ID 8702
INSERT INTO gs1_eu_carbon_footprint_code_lists (
  codeListName, attributeBmsId, code, definition, sortOrder
) VALUES
(
  'CfpBoundariesCode',
  '8702',
  'CRADLE_TO_CONSUMPTION',
  'Total amount of CO2 emission from a life cycle assessment (LCA) model that assesses a product''s environmental footprint from raw materials extraction until it is consumed. (PEF guidance, the European Commission 2021b)',
  1
),
(
  'CfpBoundariesCode',
  '8702',
  'CRADLE_TO_GATE',
  'Total amount of CO2 emission from a life cycle assessment (LCA) model that assesses a product''s environmental footprint from raw materials extraction until it leaves the factory gate.',
  2
),
(
  'CfpBoundariesCode',
  '8702',
  'CRADLE_TO_GRAVE',
  'Total amount of CO2 emission from a life cycle assessment (LCA) model that assesses a product''s environmental footprint from raw materials extraction until its disposal, including manufacturing, transportation, product use.',
  3
),
(
  'CfpBoundariesCode',
  '8702',
  'END_OF_LIFE',
  'The emission of the product when it is disposed, recycled, recovered after use.',
  4
),
(
  'CfpBoundariesCode',
  '8702',
  'MANUFACTURING',
  'The emissions resulting from the manufacturing/production of the product.',
  5
),
(
  'CfpBoundariesCode',
  '8702',
  'RAW_MATERIALS',
  'The emissions resulting from the production/extraction, packaging, storage, warehousing and transportation of raw materials.',
  6
),
(
  'CfpBoundariesCode',
  '8702',
  'TRANSPORT_FINAL_PRODUCT',
  'The emissions resulting from the distribution of the product to the retail network or to downstream stakeholders. This stage includes transport of the final product and its packaging, storage and warehousing.',
  7
),
(
  'CfpBoundariesCode',
  '8702',
  'USE',
  'The emissions of the product when used by the consumer.',
  8
);

-- MeasurementUnitCode (5 values) - BMS ID 8705
INSERT INTO gs1_eu_carbon_footprint_code_lists (
  codeListName, attributeBmsId, code, definition, sortOrder
) VALUES
(
  'MeasurementUnitCode',
  '8705',
  'EUR_CO2_EQ_PER_KG',
  'Euro CO2 equivalent per kilogram.',
  1
),
(
  'MeasurementUnitCode',
  '8705',
  'KG_CO2_EQ_PER_100G',
  'Kilogram CO2 equivalent per 100 grams.',
  2
),
(
  'MeasurementUnitCode',
  '8705',
  'KG_CO2_EQ_PER_100ML',
  'Kilogram CO2 equivalent per 100 milliliters.',
  3
),
(
  'MeasurementUnitCode',
  '8705',
  'KG_CO2_EQ_PER_FU',
  'Kilogram CO2 equivalent per functional unit.',
  4
),
(
  'MeasurementUnitCode',
  '8705',
  'KG_CO2_EQ_PER_KG',
  'Kilogram CO2 equivalent per kilogram.',
  5
);

-- CfpMethodologyCode (10 values) - BMS ID 8710
INSERT INTO gs1_eu_carbon_footprint_code_lists (
  codeListName, attributeBmsId, code, definition, sortOrder
) VALUES
(
  'CfpMethodologyCode',
  '8710',
  'CARBON_FOOTPRINT_STANDARD',
  'Product-specific value, based on carbon footprint standard (ISO 14067).',
  1
),
(
  'CfpMethodologyCode',
  '8710',
  'ENVIMAT',
  'Value for the product-group from an input-output study, based on ENVIMAT in Finland (Nissinen et al. 2019, SYKEra 15/2019).',
  2
),
(
  'CfpMethodologyCode',
  '8710',
  'EPD',
  'Environmental Product Declaration (EPD).',
  3
),
(
  'CfpMethodologyCode',
  '8710',
  'GHG_PROTOCOL',
  'The Product Life Cycle Accounting and Reporting Standard can be used to understand the full life cycle emissions of a product and focus efforts on the greatest Greenhouse Gas (GHG) reduction opportunities.',
  4
),
(
  'CfpMethodologyCode',
  '8710',
  'ISO_14064',
  'ISO 14064 specifies requirements for selecting Greenhouse Gas (GHG) validators/verifiers, establishing the level of assurance, objectives, criteria and scope, determining the validation/verification approach, assessing GHG data, information, information systems and controls, evaluating GHG assertions and preparing validation/verification statements.',
  5
),
(
  'CfpMethodologyCode',
  '8710',
  'OTHER',
  'A standard calculation method, not classified in the codelist.',
  6
),
(
  'CfpMethodologyCode',
  '8710',
  'PCR',
  'Product Category Rules.',
  7
),
(
  'CfpMethodologyCode',
  '8710',
  'PCR_EDF',
  'Product-specific value, based on Product Category Rule (PCR) of an Environmental Product Declaration (EPD) system.',
  8
),
(
  'CfpMethodologyCode',
  '8710',
  'PEF',
  'The Product Environmental Footprint (PEF) methodology is performed following the PEF guidelines published by the European Commission and, if available, specific category rules (PEFCRs).',
  9
),
(
  'CfpMethodologyCode',
  '8710',
  'RECIPE',
  'Based on National Institute for Public Health and the Environment (RIVM), Institute of Environmental Sciences (CML), Product Category Rule (PCR).',
  10
);

-- CfpAccountingCode (2 values) - BMS ID 8714
INSERT INTO gs1_eu_carbon_footprint_code_lists (
  codeListName, attributeBmsId, code, definition, sortOrder
) VALUES
(
  'CfpAccountingCode',
  '8714',
  'ATTRIBUTIONAL',
  'An attributional life cycle assessment (ALCA) is focusing on describing, assessing and quantifying environmentally relevant physical flows of specific life cycle(s) and its subsystems. An ALCA gives an estimate of what part of the global environmental burdens belongs to the study object. An ALCA does not include environmental benefits or other indirect consequences that arise outside the life cycle of the investigated product.',
  1
),
(
  'CfpAccountingCode',
  '8714',
  'CONSEQUENTIAL',
  'A consequential life cycle assessment (CLCA) is focusing on describing, assessing and quantifying environmentally relevant flows and how they will change in response to possible decisions. A CLCA gives an estimate of how the production and use of the study object affect the global environmental burdens. For example, an increased use of a material in the studied system can lead to less material being used in other systems.',
  2
);
