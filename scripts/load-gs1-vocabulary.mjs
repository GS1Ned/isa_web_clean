#!/usr/bin/env node
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

const vocab = [
  { uri: 'https://gs1.org/voc/Product', type: 'Class', label: 'Product', def: 'A product offered for sale by an organization', domain: null },
  { uri: 'https://gs1.org/voc/FoodBeverageTobaccoProduct', type: 'Class', label: 'Food Beverage Tobacco Product', def: 'A food, beverage, or tobacco product', domain: null },
  { uri: 'https://gs1.org/voc/WearableProduct', type: 'Class', label: 'Wearable Product', def: 'A wearable product such as clothing or accessories', domain: null },
  { uri: 'https://gs1.org/voc/Place', type: 'Class', label: 'Place', def: 'A physical or virtual location', domain: null },
  { uri: 'https://gs1.org/voc/Organization', type: 'Class', label: 'Organization', def: 'An organization such as a company or institution', domain: null },
  { uri: 'https://gs1.org/voc/Offer', type: 'Class', label: 'Offer', def: 'An offer to sell a product', domain: null },
  { uri: 'https://gs1.org/voc/CertificationDetails', type: 'Class', label: 'Certification Details', def: 'Details about a certification or accreditation', domain: null },
  { uri: 'https://gs1.org/voc/NutritionalProductInformation', type: 'Class', label: 'Nutritional Product Information', def: 'Nutritional information about a food product', domain: null },
  { uri: 'https://gs1.org/voc/PackagingDetails', type: 'Class', label: 'Packaging Details', def: 'Details about product packaging', domain: null },
  { uri: 'https://gs1.org/voc/AllergenDetails', type: 'Class', label: 'Allergen Details', def: 'Information about allergens present in a product', domain: null },
  { uri: 'https://gs1.org/voc/ChemicalRegulationInformation', type: 'Class', label: 'Chemical Regulation Information', def: 'Chemical regulations applicable to a product', domain: null },
  { uri: 'https://gs1.org/voc/SustainabilityInformation', type: 'Class', label: 'Sustainability Information', def: 'Sustainability-related information about a product or organization', domain: null },
  { uri: 'https://gs1.org/voc/CircularityInformation', type: 'Class', label: 'Circularity Information', def: 'Circular economy information including recyclability and reusability', domain: null },
  { uri: 'https://gs1.org/voc/DigitalProductPassport', type: 'Class', label: 'Digital Product Passport', def: 'A digital record of product lifecycle information as required by ESPR', domain: null },
  { uri: 'https://gs1.org/voc/TradeItem', type: 'Class', label: 'Trade Item', def: 'Any item upon which there is a need to retrieve pre-defined information', domain: null },
  { uri: 'https://gs1.org/voc/Batch', type: 'Class', label: 'Batch', def: 'A batch or lot of products', domain: null },
  { uri: 'https://gs1.org/voc/gtin', type: 'Property', label: 'GTIN', def: 'Global Trade Item Number identifying a product', domain: 'Product' },
  { uri: 'https://gs1.org/voc/gln', type: 'Property', label: 'GLN', def: 'Global Location Number identifying a location or organization', domain: 'Place' },
  { uri: 'https://gs1.org/voc/sscc', type: 'Property', label: 'SSCC', def: 'Serial Shipping Container Code', domain: 'LogisticsUnit' },
  { uri: 'https://gs1.org/voc/sgtin', type: 'Property', label: 'SGTIN', def: 'Serialised Global Trade Item Number', domain: 'Product' },
  { uri: 'https://gs1.org/voc/productName', type: 'Property', label: 'Product Name', def: 'Consumer-facing name of the product', domain: 'Product' },
  { uri: 'https://gs1.org/voc/brand', type: 'Property', label: 'Brand', def: 'Brand name of the product', domain: 'Product' },
  { uri: 'https://gs1.org/voc/netContent', type: 'Property', label: 'Net Content', def: 'Net content of the product', domain: 'Product' },
  { uri: 'https://gs1.org/voc/countryOfOrigin', type: 'Property', label: 'Country of Origin', def: 'Country where the product was produced', domain: 'Product' },
  { uri: 'https://gs1.org/voc/gpcCategoryCode', type: 'Property', label: 'GPC Category Code', def: 'GS1 Global Product Classification code', domain: 'Product' },
  { uri: 'https://gs1.org/voc/targetMarket', type: 'Property', label: 'Target Market', def: 'Target market country for the product', domain: 'Product' },
  { uri: 'https://gs1.org/voc/netWeight', type: 'Property', label: 'Net Weight', def: 'Net weight of the product', domain: 'Product' },
  { uri: 'https://gs1.org/voc/grossWeight', type: 'Property', label: 'Gross Weight', def: 'Gross weight including packaging', domain: 'Product' },
  { uri: 'https://gs1.org/voc/allergenStatement', type: 'Property', label: 'Allergen Statement', def: 'Textual description of allergens present', domain: 'FoodBeverageTobaccoProduct' },
  { uri: 'https://gs1.org/voc/ingredientStatement', type: 'Property', label: 'Ingredient Statement', def: 'Full ingredient list', domain: 'FoodBeverageTobaccoProduct' },
  { uri: 'https://gs1.org/voc/nutritionalClaim', type: 'Property', label: 'Nutritional Claim', def: 'Nutritional claims made about the product', domain: 'FoodBeverageTobaccoProduct' },
  { uri: 'https://gs1.org/voc/packagingMaterial', type: 'Property', label: 'Packaging Material', def: 'Material used for packaging', domain: 'PackagingDetails' },
  { uri: 'https://gs1.org/voc/packagingRecyclingScheme', type: 'Property', label: 'Packaging Recycling Scheme', def: 'Recycling scheme applicable to the packaging', domain: 'PackagingDetails' },
  { uri: 'https://gs1.org/voc/recyclablePackaging', type: 'Property', label: 'Recyclable Packaging', def: 'Whether the packaging is recyclable', domain: 'PackagingDetails' },
  { uri: 'https://gs1.org/voc/carbonFootprint', type: 'Property', label: 'Carbon Footprint', def: 'Product carbon footprint value', domain: 'SustainabilityInformation' },
  { uri: 'https://gs1.org/voc/recycledContent', type: 'Property', label: 'Recycled Content', def: 'Percentage of recycled content in the product', domain: 'CircularityInformation' },
  { uri: 'https://gs1.org/voc/repairabilityScore', type: 'Property', label: 'Repairability Score', def: 'Product repairability index score', domain: 'CircularityInformation' },
  { uri: 'https://gs1.org/voc/dppUniqueIdentifier', type: 'Property', label: 'DPP Unique Identifier', def: 'Unique identifier for the Digital Product Passport', domain: 'DigitalProductPassport' },
  { uri: 'https://gs1.org/voc/dppDataCarrier', type: 'Property', label: 'DPP Data Carrier', def: 'Data carrier encoding the DPP identifier', domain: 'DigitalProductPassport' },
  { uri: 'https://gs1.org/voc/dppAccessURL', type: 'Property', label: 'DPP Access URL', def: 'URL to access the Digital Product Passport data', domain: 'DigitalProductPassport' },
  { uri: 'https://gs1.org/voc/organizationName', type: 'Property', label: 'Organization Name', def: 'Legal name of the organization', domain: 'Organization' },
  { uri: 'https://gs1.org/voc/organizationRole', type: 'Property', label: 'Organization Role', def: 'Role of the organization in the supply chain', domain: 'Organization' },
  { uri: 'https://gs1.org/voc/hazardousSubstance', type: 'Property', label: 'Hazardous Substance', def: 'Hazardous substance present in the product', domain: 'ChemicalRegulationInformation' },
  { uri: 'https://gs1.org/voc/safetyDataSheet', type: 'Property', label: 'Safety Data Sheet', def: 'Reference to the product safety data sheet', domain: 'ChemicalRegulationInformation' },
  { uri: 'https://gs1.org/voc/certificationAgency', type: 'Property', label: 'Certification Agency', def: 'Organization that issued the certification', domain: 'CertificationDetails' },
  { uri: 'https://gs1.org/voc/certificationStandard', type: 'Property', label: 'Certification Standard', def: 'Standard against which certification was assessed', domain: 'CertificationDetails' },
  { uri: 'https://gs1.org/voc/certificationValue', type: 'Property', label: 'Certification Value', def: 'Value or level of the certification', domain: 'CertificationDetails' },
  { uri: 'https://gs1.org/voc/energyPerNutrientBasis', type: 'Property', label: 'Energy Per Nutrient Basis', def: 'Energy content per reference quantity', domain: 'NutritionalProductInformation' },
  { uri: 'https://gs1.org/voc/nutrientBasisQuantity', type: 'Property', label: 'Nutrient Basis Quantity', def: 'Reference quantity for nutritional values', domain: 'NutritionalProductInformation' },
  { uri: 'https://gs1.org/voc/durabilityScore', type: 'Property', label: 'Durability Score', def: 'Product durability assessment score', domain: 'CircularityInformation' },
  { uri: 'https://gs1.org/voc/packagingWeight', type: 'Property', label: 'Packaging Weight', def: 'Weight of the packaging', domain: 'PackagingDetails' },
  { uri: 'https://gs1.org/voc/recyclableContent', type: 'Property', label: 'Recyclable Content', def: 'Percentage of recyclable content', domain: 'CircularityInformation' },
];

(async () => {
  let ok = 0, fail = 0;
  for (const v of vocab) {
    try {
      await sql`INSERT INTO gs1_web_vocabulary (uri, label, definition, domain, term_type, source_system, trust_level, retrieved_at)
        VALUES (${v.uri}, ${v.label}, ${v.def}, ${v.domain}, ${v.type}, 'gs1_web_vocabulary_curated', 'T1', NOW())
        ON CONFLICT (uri) DO UPDATE SET label=EXCLUDED.label, definition=EXCLUDED.definition, domain=EXCLUDED.domain, term_type=EXCLUDED.term_type, retrieved_at=NOW()`;
      ok++;
    } catch(e) { fail++; console.error(v.uri, e.message); }
  }
  console.log('Loaded:', ok, 'Failed:', fail);
  const cnt = await sql`SELECT count(*) as c FROM gs1_web_vocabulary`;
  console.log('Total gs1_web_vocabulary:', cnt[0].c);
  await sql.end();
})();
