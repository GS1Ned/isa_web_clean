-- GS1 EU Carbon Footprint Attributes Ingestion
-- Source: GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0
-- Total: 9 attributes (3 CarbonFootPrintHeader + 6 CarbonFootprintDetail)

-- Insert CarbonFootPrintHeader attributes
INSERT INTO gs1_eu_carbon_footprint_attributes (
  bmsId, gdsnName, attributeName, className, definition, instruction, businessUsage,
  dataType, codeList, example, mandatory, repeatable
) VALUES
(
  '8700',
  'cfpCountryCode',
  'CFP Target Market Code',
  'CarbonFootPrintHeader',
  'The code specifying a target market for which the carbon footprint values have been calculated. Transportation emissions can greatly vary from country to country.',
  'Populate the country code for which the values have been calculated.',
  'Used by the seller and the buyer to identify the country for which the carbon footprint data has been calculated.',
  'Code',
  'countryCode',
  '528 (Netherlands)',
  FALSE,
  FALSE
),
(
  '8716',
  'cfpDate',
  'CFP Date',
  'CarbonFootPrintHeader',
  'The date on which the product carbon footprint assessment was conducted.',
  'Enter the date on which the product carbon footprint assessment was conducted.',
  'Used by the seller and the buyer to identify the date of the calculated carbon footprint values.',
  'Date',
  NULL,
  '2024-05-31T00:00:00',
  FALSE,
  FALSE
),
(
  '8712',
  'cfpValueVerificationCode',
  'CFP Value Verification Code',
  'CarbonFootPrintHeader',
  'The code indicating how the calculated carbon footprint value is verified.',
  'Enter the code indicating how the value is verified.',
  'Used by the seller and the buyer to identify the verification used to calculate the carbon footprint values.',
  'Code',
  'CfpValueVerificationCode',
  'EXTERNAL_VERIFICATION',
  FALSE,
  FALSE
);

-- Insert CarbonFootprintDetail attributes
INSERT INTO gs1_eu_carbon_footprint_attributes (
  bmsId, gdsnName, attributeName, className, definition, instruction, businessUsage,
  dataType, codeList, example, mandatory, repeatable
) VALUES
(
  '8702',
  'cfpBoundariesCode',
  'CFP Boundaries Code',
  'CarbonFootprintDetail',
  'The code identifying the life cycle stage that the product carbon footprint value refers to. The boundary setting may vary depending on the purpose of the product carbon footprint assessment.',
  'Enter the code that represents the stage that the carbon footprint value refers to. This value should be repeated in case information for multiple stages is available. Only use the stages that correspond with your Life Cycle Assessment (LCA) report.',
  'Used by the seller and the buyer to identify the life cycle stage that the carbon footprint value (specified in the CFP Value attribute) refers to. There may be multiple instances of the CFP Boundaries Code attribute in cases such as: A single CO2 value is provided to cover multiple life cycle stages (for example, transport and manufacturing), where the attribute is repeated. A different CO2 value is provided for each life cycle stage (for example, manufacturing and consumer use), where the entire carbon footprint group (class) of attributes is repeated.',
  'Code',
  'CfpBoundariesCode',
  'RAW_MATERIALS',
  FALSE,
  TRUE
),
(
  '8704',
  'cfpValue',
  'CFP Value',
  'CarbonFootprintDetail',
  'The emissions value, i.e., carbon footprint, for a specific boundary setting.',
  'Enter the value for the carbon footprint that corresponds to the boundaries code used in attribute cfpBoundariesCode.',
  'Used by the seller and the buyer to state the emissions value per boundary setting (specified by the CFP Boundaries Code). Used by consumers who are concerned about the environment for search and discovery to assist in the selection of products with lower carbon footprints.',
  'Numeric',
  NULL,
  'For a clothes dryer: CFP Boundaries Code = USE, CFP Value and Measurement Unit Code = 1.7 KG_CO2_EQ_PER_FU (Kilogram CO2 equivalent per functional unit). For a plastic bottle: CFP Boundaries Code = MANUFACTURING, CFP Value and Measurement Unit Code = 8.28 KG_CO2_EQ_PER_100G (= Kilogram CO2 equivalent per 100 gram)',
  FALSE,
  TRUE
),
(
  '8705',
  'cfpValue/@measurementUnitCode',
  'CFP Value Measurement Unit Code',
  'CarbonFootprintDetail',
  'Any standardised, reproducible unit that can be used to measure any physical property.',
  'Enter the unit of measurement that corresponds to the used cfpValue.',
  'Used by the seller and the buyer to state the emissions value per boundary setting (specified by the CFP Boundaries Code). Used by consumers who are concerned about the environment for search and discovery to assist in the selection of products with lower carbon footprints.',
  'Code',
  'MeasurementUnitCode',
  'For a plastic bottle: CFP Boundaries Code = MANUFACTURING, CFP Value and Measurement Unit Code = 8.28 KG_CO2_EQ_PER_100G (= Kilogram CO2 equivalent per 100 gram)',
  FALSE,
  TRUE
),
(
  '8707',
  'cfpFunctionalUnit',
  'CFP Functional Unit',
  'CarbonFootprintDetail',
  'The functional unit describes the quantity and/or performance characteristics of a product as it is used by the end-user, which forms the basis for calculating the emissions value (i.e., carbon footprint), and can be used for comparison to other similar products.',
  'Specify the Functional Unit (in text) in case you have selected the cfpValue/@measurementUnitCode ''KG_CO2_EQ_PER_FU''. If you have selected another UoM this attribute shall not be used.',
  'Used by the seller and the buyer to understand the basis of use for which the CFP Value attribute is calculated, when the attribute CFP Boundaries Code value is ''USE'', indicating emissions related to the use of the item by the consumer.',
  'Text',
  NULL,
  'For a washing machine: CFP Functional Unit = ''Washing machine with a capacity to wash 10 kg of laundry at 60 degrees''. For a plastic shopping bag: CFP Functional Unit = ''Shopping bag with a volume of 22 liters, can carry a maximum weight of 12 kilograms''',
  FALSE,
  TRUE
),
(
  '8710',
  'cfpMethodologyCode',
  'CFP Methodology Code',
  'CarbonFootprintDetail',
  'The code specifying the method used to assess and communicate the environmental impact of the product in terms of carbon footprint.',
  'Use the code to specify the calculation method that is used to calculate the CFP values.',
  'Used by the seller and the buyer to identify the methodology used to calculate the carbon footprint.',
  'Code',
  'CfpMethodologyCode',
  'CARBON_FOOTPRINT_STANDARDPEF',
  FALSE,
  TRUE
),
(
  '8714',
  'cfpAccountingCode',
  'CFP Accounting Code',
  'CarbonFootprintDetail',
  'The code indicating which method is used to conduct the lifecycle assessment for carbon footprint calculation.',
  'Use the code that corresponds to the method that is used.',
  'Used by the seller and the buyer to identify what activities are represented by the carbon footprint values.',
  'Code',
  'CfpAccountingCode',
  'CONSEQUENTIAL',
  FALSE,
  TRUE
);
