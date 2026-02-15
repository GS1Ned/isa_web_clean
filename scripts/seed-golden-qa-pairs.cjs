/**
 * ISA Golden QA Dataset Seed Script
 * 
 * Seeds the golden_qa_pairs table with 50 high-quality question-answer pairs
 * covering the main ISA knowledge domains:
 * - GS1 Standards (GTIN, GLN, SSCC, etc.)
 * - GS1 NL Data Model (attributes, sectors)
 * - ESRS/EFRAG (sustainability reporting)
 * - Digital Product Passport (DPP)
 * - Regulations (CSRD, EUDR, etc.)
 * 
 * These pairs serve as the evaluation baseline for RAG quality metrics.
 */

const { format: utilFormat } = require("node:util");
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

const mysql = require('mysql2/promise');

// Map our categories to the schema's domain field
// Map our difficulty to schema's enum: easy, medium, hard
const DIFFICULTY_MAP = {
  'basic': 'easy',
  'intermediate': 'medium',
  'advanced': 'hard'
};

// Map question types based on content
function inferQuestionType(question) {
  if (question.includes('verschil') || question.includes('verhoudt')) return 'comparative';
  if (question.includes('Hoe') || question.includes('wanneer')) return 'procedural';
  if (question.includes('Welke') && question.includes('en')) return 'multi_hop';
  return 'factual';
}

const GOLDEN_QA_PAIRS = [
  // === GS1 STANDARDS (10 pairs) ===
  {
    domain: 'gs1_standards',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is een GTIN en waarvoor wordt het gebruikt?',
    expected_answer: 'Een GTIN (Global Trade Item Number) is een unieke identificatiecode voor producten in de wereldwijde toeleveringsketen. Het wordt gebruikt om producten te identificeren bij de kassa, in voorraadsystemen en in de hele supply chain. GTINs kunnen 8, 12, 13 of 14 cijfers bevatten, afhankelijk van het type product en de toepassing.',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is het verschil tussen een GTIN-13 en een GTIN-14?',
    expected_answer: 'Een GTIN-13 (ook bekend als EAN-13) wordt gebruikt voor consumentenproducten en is de barcode die je op producten in de winkel ziet. Een GTIN-14 wordt gebruikt voor logistieke eenheden zoals dozen en pallets. GTIN-14 bevat een extra indicator digit aan het begin die het verpakkingsniveau aangeeft.',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'general',
    difficulty: 'intermediate',
    question: 'Wat is een GLN en wanneer gebruik je het?',
    expected_answer: 'Een GLN (Global Location Number) is een 13-cijferige identificatiecode voor het uniek identificeren van locaties en partijen in de supply chain. Het wordt gebruikt om fysieke locaties (zoals magazijnen, winkels), juridische entiteiten (bedrijven) en functionele entiteiten (afdelingen) te identificeren. GLNs zijn essentieel voor elektronische berichten zoals orders en facturen.',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'logistics',
    difficulty: 'intermediate',
    question: 'Wat is een SSCC en hoe wordt het toegepast?',
    expected_answer: 'Een SSCC (Serial Shipping Container Code) is een 18-cijferige identificatiecode voor het uniek identificeren van logistieke eenheden zoals pallets, dozen en containers. Elke SSCC is wereldwijd uniek en wordt slechts één keer toegekend. Het wordt gebruikt voor track & trace in de supply chain en is essentieel voor Advanced Shipping Notices (ASN).',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'traceability',
    difficulty: 'advanced',
    question: 'Wat is EPCIS en hoe ondersteunt het traceerbaarheid?',
    expected_answer: 'EPCIS (Electronic Product Code Information Services) is een GS1-standaard voor het vastleggen en delen van gebeurtenissen in de supply chain. Het legt vast WAT er gebeurde (welk product), WAAR (locatie), WANNEER (tijdstip) en WAAROM (business context). EPCIS maakt end-to-end traceerbaarheid mogelijk door gebeurtenissen zoals ontvangst, verzending en transformatie te registreren.',
    expected_citations: ['gs1_standard', 'cbv_vocabulary']
  },
  {
    domain: 'gs1_standards',
    sector: 'traceability',
    difficulty: 'advanced',
    question: 'Wat is het verschil tussen CBV en EPCIS?',
    expected_answer: 'EPCIS definieert de structuur voor het vastleggen van supply chain gebeurtenissen, terwijl CBV (Core Business Vocabulary) de gestandaardiseerde vocabulaire levert voor de inhoud van die gebeurtenissen. CBV definieert standaard waarden voor business steps (zoals "shipping", "receiving"), dispositions (zoals "in_transit", "sellable_accessible") en business transactions. Samen zorgen ze voor interoperabiliteit.',
    expected_citations: ['cbv_vocabulary', 'gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is een GS1 bedrijfsprefix?',
    expected_answer: 'Een GS1 bedrijfsprefix is een uniek nummer dat door GS1 wordt toegekend aan een bedrijf. Dit prefix vormt de basis voor alle GS1 identificatiecodes die het bedrijf aanmaakt, zoals GTINs, GLNs en SSCCs. De lengte van het prefix bepaalt hoeveel unieke nummers een bedrijf kan aanmaken. In Nederland worden bedrijfsprefixen uitgegeven door GS1 Nederland.',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'healthcare',
    difficulty: 'intermediate',
    question: 'Wat is een GS1 DataMatrix en wanneer wordt deze gebruikt?',
    expected_answer: 'Een GS1 DataMatrix is een 2D barcode die meer informatie kan bevatten dan een traditionele streepjescode. Het wordt gebruikt wanneer extra gegevens naast de GTIN nodig zijn, zoals batchnummer, vervaldatum of serienummer. GS1 DataMatrix is verplicht voor farmaceutische producten (FMD) en wordt steeds vaker gebruikt in de gezondheidszorg en voor traceerbaarheid.',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'general',
    difficulty: 'advanced',
    question: 'Wat zijn Application Identifiers (AIs) in GS1?',
    expected_answer: 'Application Identifiers (AIs) zijn numerieke prefixen die aangeven welk type data volgt in een GS1 barcode. Bijvoorbeeld: AI (01) = GTIN, AI (10) = batchnummer, AI (17) = vervaldatum, AI (21) = serienummer. AIs maken het mogelijk om meerdere data-elementen in één barcode te combineren en zorgen voor gestandaardiseerde interpretatie wereldwijd.',
    expected_citations: ['gs1_standard']
  },
  {
    domain: 'gs1_standards',
    sector: 'digital',
    difficulty: 'intermediate',
    question: 'Wat is GS1 Digital Link en wat zijn de voordelen?',
    expected_answer: 'GS1 Digital Link is een standaard die GS1 identificatiecodes koppelt aan weblinks. In plaats van alleen een GTIN te scannen, kan een consument of bedrijf via een QR-code toegang krijgen tot productinformatie, handleidingen, herkomstdata en meer. Het combineert de betrouwbaarheid van GS1 identificatie met de flexibiliteit van het web.',
    expected_citations: ['gs1_standard']
  },

  // === GS1 NL DATA MODEL (10 pairs) ===
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is het GS1 Data Source datamodel?',
    expected_answer: 'Het GS1 Data Source datamodel is de Nederlandse standaard voor het uitwisselen van productinformatie tussen leveranciers en retailers. Het definieert welke attributen (zoals productnaam, ingrediënten, afmetingen) verplicht of optioneel zijn per productcategorie. Het datamodel is gebaseerd op internationale GS1 standaarden maar aangepast aan Nederlandse marktbehoeften.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'intermediate',
    question: 'Welke sectoren worden ondersteund door het GS1 NL datamodel?',
    expected_answer: 'Het GS1 NL datamodel ondersteunt meerdere sectoren: FMCG (Fast Moving Consumer Goods) voor supermarktproducten, DIY (Do It Yourself) voor bouwmarkten, Healthcare voor medische hulpmiddelen en geneesmiddelen, en Fashion voor kleding en schoenen. Elke sector heeft specifieke attributen en validatieregels.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'fmcg',
    difficulty: 'intermediate',
    question: 'Wat zijn verplichte attributen voor FMCG producten in GS1 Data Source?',
    expected_answer: 'Voor FMCG producten zijn onder andere verplicht: GTIN, productnaam (in het Nederlands), merknaam, netto-inhoud met meeteenheid, ingrediëntenlijst (voor voedingsmiddelen), allergeneninformatie, voedingswaarden, en land van herkomst. Daarnaast zijn afbeeldingen en GPC-classificatie vereist voor een complete productregistratie.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'advanced',
    question: 'Hoe werkt de GPC classificatie in het GS1 datamodel?',
    expected_answer: 'GPC (Global Product Classification) is een hiërarchisch classificatiesysteem met vier niveaus: Segment, Family, Class en Brick. Elk product krijgt een GPC Brick Code die bepaalt welke attributen van toepassing zijn. Bijvoorbeeld: een fles wijn valt onder Segment "Food/Beverages", Family "Beverages", Class "Wine" en een specifieke Brick voor het type wijn.',
    expected_citations: ['gs1_nl_datamodel', 'gs1_standard']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is het verschil tussen een basisartikel en een logistiek artikel?',
    expected_answer: 'Een basisartikel (consumer unit) is het product zoals de consument het koopt, bijvoorbeeld een fles shampoo. Een logistiek artikel is een verpakking van meerdere basisartikelen voor transport en opslag, zoals een doos met 12 flessen of een pallet. Beide hebben een eigen GTIN en eigen attributen in het datamodel.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'fmcg',
    difficulty: 'intermediate',
    question: 'Welke allergeneninformatie moet worden vastgelegd volgens GS1 NL?',
    expected_answer: 'Volgens het GS1 NL datamodel moeten de 14 EU-allergenen worden vastgelegd: gluten, schaaldieren, eieren, vis, pinda\'s, soja, melk, noten, selderij, mosterd, sesamzaad, sulfiet, lupine en weekdieren. Voor elk allergeen moet worden aangegeven of het aanwezig is, afwezig is, of dat er kruisbesmetting mogelijk is.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'fmcg',
    difficulty: 'advanced',
    question: 'Hoe worden voedingswaarden gestructureerd in het GS1 datamodel?',
    expected_answer: 'Voedingswaarden worden vastgelegd per 100g/100ml en optioneel per portie. Verplichte nutriënten zijn: energie (kJ en kcal), vetten, verzadigde vetten, koolhydraten, suikers, eiwitten en zout. Optioneel kunnen vitaminen, mineralen en vezels worden toegevoegd. Elk nutriënt heeft een gestandaardiseerde code en meeteenheid.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'intermediate',
    question: 'Wat zijn de beeldrichtlijnen voor productfoto\'s in GS1 Data Source?',
    expected_answer: 'GS1 Data Source vereist productfoto\'s met minimaal 900x900 pixels, witte achtergrond, en het product moet minimaal 80% van het beeld vullen. Er zijn standaard hoeken gedefinieerd: front, back, left, right, top. De hoofdafbeelding moet het product tonen zoals de consument het in de winkel ziet.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is een target market in het GS1 datamodel?',
    expected_answer: 'Een target market is het land of de regio waarvoor de productinformatie is bedoeld. In het GS1 datamodel wordt dit aangegeven met een landcode (bijvoorbeeld NL voor Nederland, BE voor België). Productinformatie kan per target market verschillen, bijvoorbeeld door andere taalversies of lokale regelgeving.',
    expected_citations: ['gs1_nl_datamodel']
  },
  {
    domain: 'gs1_nl_datamodel',
    sector: 'general',
    difficulty: 'advanced',
    question: 'Hoe werkt de validatie van productdata in GS1 Data Source?',
    expected_answer: 'GS1 Data Source valideert productdata op meerdere niveaus: structurele validatie (correct formaat), business rules (logische consistentie zoals gewicht vs. afmetingen), en sectorspecifieke regels. Validatiefouten worden geclassificeerd als errors (blokkeren publicatie) of warnings (advies tot verbetering). De validatie is gebaseerd op de GPC classificatie van het product.',
    expected_citations: ['gs1_nl_datamodel']
  },

  // === ESRS/EFRAG SUSTAINABILITY (10 pairs) ===
  {
    domain: 'esrs_sustainability',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat zijn de ESRS standaarden?',
    expected_answer: 'ESRS (European Sustainability Reporting Standards) zijn de Europese standaarden voor duurzaamheidsrapportage, ontwikkeld door EFRAG. Ze definiëren welke informatie bedrijven moeten rapporteren over milieu (E), sociale aspecten (S) en governance (G). ESRS is verplicht onder de CSRD-richtlijn voor grote bedrijven in de EU.',
    expected_citations: ['esrs_datapoint', 'efrag_guidance']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'environment',
    difficulty: 'intermediate',
    question: 'Wat is het verschil tussen ESRS E1 en ESRS E2?',
    expected_answer: 'ESRS E1 gaat over klimaatverandering en omvat broeikasgasemissies, klimaatrisico\'s en transitieplannen. ESRS E2 gaat over vervuiling en behandelt lucht-, water- en bodemverontreiniging, evenals het gebruik van zorgwekkende stoffen. Beide standaarden vereisen zowel kwantitatieve data als beschrijvingen van beleid en doelstellingen.',
    expected_citations: ['esrs_datapoint']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'general',
    difficulty: 'intermediate',
    question: 'Wat houdt dubbele materialiteit in bij ESRS?',
    expected_answer: 'Dubbele materialiteit betekent dat bedrijven moeten rapporteren over zowel de impact van duurzaamheidskwesties op het bedrijf (financiële materialiteit) als de impact van het bedrijf op mens en milieu (impact materialiteit). Een onderwerp is materieel als het relevant is vanuit minstens één van deze perspectieven.',
    expected_citations: ['esrs_datapoint', 'efrag_guidance']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'environment',
    difficulty: 'advanced',
    question: 'Hoe moeten Scope 1, 2 en 3 emissies worden gerapporteerd onder ESRS E1?',
    expected_answer: 'Onder ESRS E1 moeten bedrijven broeikasgasemissies rapporteren in drie scopes: Scope 1 (directe emissies uit eigen bronnen), Scope 2 (indirecte emissies uit ingekochte energie), en Scope 3 (overige indirecte emissies in de waardeketen). De rapportage moet in CO2-equivalenten, met vermelding van de gebruikte methodologie en emissiefactoren.',
    expected_citations: ['esrs_datapoint']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is CSRD en hoe verhoudt het zich tot ESRS?',
    expected_answer: 'CSRD (Corporate Sustainability Reporting Directive) is de EU-richtlijn die bepaalt welke bedrijven moeten rapporteren over duurzaamheid. ESRS zijn de standaarden die bepalen hoe en wat er gerapporteerd moet worden. CSRD is de wet, ESRS is de inhoudelijke invulling. Grote bedrijven moeten vanaf 2024 gefaseerd aan CSRD voldoen.',
    expected_citations: ['regulation', 'esrs_datapoint']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'social',
    difficulty: 'intermediate',
    question: 'Wat zijn de sociale standaarden in ESRS (S1-S4)?',
    expected_answer: 'ESRS heeft vier sociale standaarden: S1 (eigen werknemers) over arbeidsomstandigheden en mensenrechten, S2 (werknemers in de waardeketen) over due diligence bij leveranciers, S3 (getroffen gemeenschappen) over impact op lokale gemeenschappen, en S4 (consumenten en eindgebruikers) over productveiligheid en privacy.',
    expected_citations: ['esrs_datapoint']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'governance',
    difficulty: 'advanced',
    question: 'Wat zijn de governance-vereisten onder ESRS G1?',
    expected_answer: 'ESRS G1 behandelt bedrijfsvoering en omvat: de rol van bestuursorganen bij duurzaamheid, due diligence processen, risicomanagement, interne controles, en bedrijfsethiek inclusief anti-corruptiebeleid. Bedrijven moeten rapporteren over hoe governance-structuren duurzaamheidsrisico\'s en -kansen adresseren.',
    expected_citations: ['esrs_datapoint']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'environment',
    difficulty: 'intermediate',
    question: 'Wat is een transitieplan voor klimaat onder ESRS?',
    expected_answer: 'Een klimaattransitieplan onder ESRS E1 beschrijft hoe een bedrijf zijn bedrijfsmodel en strategie aanpast om bij te dragen aan de beperking van klimaatverandering. Het moet doelen bevatten voor emissiereductie, geplande acties, benodigde investeringen, en hoe het plan aansluit bij het 1,5°C-doel van het Parijs-akkoord.',
    expected_citations: ['esrs_datapoint', 'efrag_guidance']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'general',
    difficulty: 'basic',
    question: 'Welke bedrijven moeten rapporteren onder CSRD/ESRS?',
    expected_answer: 'Onder CSRD moeten rapporteren: grote bedrijven (>250 werknemers of >€40M omzet of >€20M balanstotaal), beursgenoteerde mkb\'s, en niet-EU bedrijven met >€150M EU-omzet. De invoering is gefaseerd: grote beursgenoteerde bedrijven vanaf 2024, overige grote bedrijven vanaf 2025, beursgenoteerde mkb\'s vanaf 2026.',
    expected_citations: ['regulation']
  },
  {
    domain: 'esrs_sustainability',
    sector: 'general',
    difficulty: 'advanced',
    question: 'Hoe verhoudt ESRS zich tot andere duurzaamheidsstandaarden zoals GRI en ISSB?',
    expected_answer: 'ESRS is ontwikkeld met interoperabiliteit in gedachten. Het is grotendeels compatibel met GRI (Global Reporting Initiative) voor impact-rapportage en met ISSB (International Sustainability Standards Board) voor financiële materialiteit. ESRS is echter uitgebreider door de dubbele materialiteitseis en is juridisch bindend in de EU, terwijl GRI en ISSB vrijwillig zijn.',
    expected_citations: ['esrs_datapoint', 'efrag_guidance']
  },

  // === DIGITAL PRODUCT PASSPORT (10 pairs) ===
  {
    domain: 'dpp',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is een Digital Product Passport (DPP)?',
    expected_answer: 'Een Digital Product Passport (DPP) is een digitaal document dat informatie bevat over de herkomst, samenstelling, reparatie- en demontagemogelijkheden, en recycling van een product. Het doel is om circulaire economie te bevorderen door transparantie in de waardeketen. DPP wordt verplicht onder de EU Ecodesign for Sustainable Products Regulation (ESPR).',
    expected_citations: ['dpp_component', 'regulation']
  },
  {
    domain: 'dpp',
    sector: 'general',
    difficulty: 'intermediate',
    question: 'Welke productcategorieën krijgen als eerste een DPP-verplichting?',
    expected_answer: 'De eerste productcategorieën met DPP-verplichting zijn: batterijen (vanaf 2027), textiel, elektronica, meubels, en bouwproducten. Batterijen zijn het verst gevorderd met specifieke regelgeving (EU Battery Regulation). Voor elke categorie worden specifieke data-eisen ontwikkeld.',
    expected_citations: ['dpp_component', 'regulation']
  },
  {
    domain: 'dpp',
    sector: 'digital',
    difficulty: 'intermediate',
    question: 'Hoe wordt een DPP toegankelijk gemaakt voor gebruikers?',
    expected_answer: 'Een DPP wordt toegankelijk via een data carrier op het product, meestal een QR-code of NFC-tag. Deze linkt naar een unieke identifier (zoals een GS1 Digital Link URL) die toegang geeft tot de productinformatie. Verschillende gebruikers (consumenten, reparateurs, recyclers) kunnen verschillende informatieniveaus zien op basis van toegangsrechten.',
    expected_citations: ['dpp_component', 'gs1_standard']
  },
  {
    domain: 'dpp',
    sector: 'batteries',
    difficulty: 'advanced',
    question: 'Welke informatie moet een batterij-DPP bevatten volgens de EU Battery Regulation?',
    expected_answer: 'Een batterij-DPP moet bevatten: batterijmodel en fabrikant, productiedatum en -locatie, chemische samenstelling, capaciteit en prestaties, carbon footprint, gerecycled materiaalgehalte, informatie over veilig gebruik, en instructies voor inzameling en recycling. Daarnaast moet de state of health beschikbaar zijn voor tweedehands batterijen.',
    expected_citations: ['dpp_component', 'regulation']
  },
  {
    domain: 'dpp',
    sector: 'general',
    difficulty: 'basic',
    question: 'Wat is de relatie tussen DPP en GS1 standaarden?',
    expected_answer: 'GS1 standaarden vormen de basis voor DPP-identificatie en data-uitwisseling. GTIN identificeert het productmodel, serienummers identificeren individuele items, en GS1 Digital Link maakt de QR-code toegankelijk. EPCIS kan worden gebruikt om de levenscyclusgebeurtenissen van het product vast te leggen voor traceerbaarheid.',
    expected_citations: ['dpp_component', 'gs1_standard']
  },
  {
    domain: 'dpp',
    sector: 'general',
    difficulty: 'intermediate',
    question: 'Wat is ESPR en hoe verhoudt het zich tot DPP?',
    expected_answer: 'ESPR (Ecodesign for Sustainable Products Regulation) is de EU-verordening die de juridische basis vormt voor Digital Product Passports. ESPR vervangt de oude Ecodesign-richtlijn en breidt deze uit naar bijna alle fysieke producten. Het stelt eisen aan duurzaamheid, repareerbaarheid en recycleerbaarheid, waarbij DPP het instrument is om deze informatie te delen.',
    expected_citations: ['regulation', 'dpp_component']
  },
  {
    domain: 'dpp',
    sector: 'digital',
    difficulty: 'advanced',
    question: 'Hoe wordt data-integriteit gewaarborgd in een DPP?',
    expected_answer: 'Data-integriteit in DPP wordt gewaarborgd door: gebruik van unieke identifiers (zoals GTIN+serienummer), digitale handtekeningen of blockchain voor onveranderlijkheid, toegangscontrole voor verschillende gebruikersgroepen, en audit trails voor wijzigingen. De EU werkt aan een gedecentraliseerd DPP-register om authenticiteit te verifiëren.',
    expected_citations: ['dpp_component']
  },
  {
    domain: 'dpp',
    sector: 'environment',
    difficulty: 'intermediate',
    question: 'Welke rol speelt de carbon footprint in een DPP?',
    expected_answer: 'De carbon footprint is een verplicht onderdeel van veel DPP-categorieën, te beginnen met batterijen. Het moet de totale CO2-uitstoot over de levenscyclus weergeven, berekend volgens gestandaardiseerde methodologie (zoals PEF - Product Environmental Footprint). Dit stelt consumenten en inkopers in staat om producten te vergelijken op klimaatimpact.',
    expected_citations: ['dpp_component', 'esrs_datapoint']
  },
  {
    domain: 'dpp',
    sector: 'consumer',
    difficulty: 'basic',
    question: 'Wat is het doel van een DPP voor consumenten?',
    expected_answer: 'Voor consumenten biedt een DPP transparantie over de duurzaamheid en herkomst van producten. Ze kunnen zien waar een product vandaan komt, hoe duurzaam het is gemaakt, hoe lang het meegaat, en hoe het gerepareerd of gerecycled kan worden. Dit helpt bij het maken van bewuste aankoopbeslissingen en verlengt de levensduur van producten.',
    expected_citations: ['dpp_component']
  },
  {
    domain: 'dpp',
    sector: 'circular_economy',
    difficulty: 'advanced',
    question: 'Hoe ondersteunt DPP de circulaire economie?',
    expected_answer: 'DPP ondersteunt circulaire economie door: informatie te bieden voor reparatie en onderhoud (verlengt levensduur), demontage-instructies voor recyclers, materiaalsamenstelling voor hoogwaardige recycling, en traceerbaarheid van gerecyclede materialen. Het maakt ook nieuwe businessmodellen mogelijk zoals product-as-a-service en tweedehands markten.',
    expected_citations: ['dpp_component', 'regulation']
  },

  // === REGULATIONS (10 pairs) ===
  {
    domain: 'regulations',
    sector: 'environment',
    difficulty: 'basic',
    question: 'Wat is de EUDR (EU Deforestation Regulation)?',
    expected_answer: 'De EUDR is een EU-verordening die bedrijven verplicht om te garanderen dat bepaalde producten (zoals soja, palmolie, koffie, cacao, rubber, hout en rundvlees) niet bijdragen aan ontbossing. Bedrijven moeten due diligence uitvoeren en de herkomst van producten kunnen traceren tot het perceel waar ze zijn geproduceerd.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'traceability',
    difficulty: 'intermediate',
    question: 'Welke traceerbaarheidseisen stelt de EUDR?',
    expected_answer: 'De EUDR vereist geolocatie van het productieperceel (GPS-coördinaten), productiedatum, en bewijs dat het land na 31 december 2020 niet is ontbost. Bedrijven moeten een due diligence systeem hebben, risico\'s beoordelen, en indien nodig mitigerende maatregelen nemen. Alle informatie moet worden vastgelegd in een due diligence verklaring.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'packaging',
    difficulty: 'intermediate',
    question: 'Wat houdt de EU Packaging and Packaging Waste Regulation (PPWR) in?',
    expected_answer: 'De PPWR stelt eisen aan verpakkingen om afval te verminderen en recycling te bevorderen. Het omvat: minimale gerecycled materiaalgehaltes, ontwerp voor recycling, vermindering van onnodige verpakking, en uitgebreide producentenverantwoordelijkheid. Bepaalde verpakkingsformaten worden verboden en er komen hergebruikdoelstellingen.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'due_diligence',
    difficulty: 'basic',
    question: 'Wat is de Corporate Sustainability Due Diligence Directive (CSDDD)?',
    expected_answer: 'De CSDDD verplicht grote bedrijven om mensenrechten- en milieurisico\'s in hun waardeketen te identificeren, voorkomen en aanpakken. Bedrijven moeten een due diligence proces implementeren, een klachtenmechanisme hebben, en kunnen aansprakelijk worden gesteld voor schade. Het geldt voor EU-bedrijven en niet-EU bedrijven met significante EU-omzet.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'general',
    difficulty: 'advanced',
    question: 'Hoe verhouden CSRD, CSDDD en de Taxonomie zich tot elkaar?',
    expected_answer: 'Deze drie regelgevingen vormen samen het EU-kader voor duurzaam ondernemen: CSRD verplicht rapportage over duurzaamheid, CSDDD verplicht actie (due diligence) in de waardeketen, en de Taxonomie definieert wat als "duurzaam" geldt voor financiering. Ze versterken elkaar: CSRD-rapportage ondersteunt CSDDD-compliance, en beide gebruiken Taxonomie-criteria.',
    expected_citations: ['regulation', 'esrs_datapoint']
  },
  {
    domain: 'regulations',
    sector: 'batteries',
    difficulty: 'intermediate',
    question: 'Wat zijn de belangrijkste verplichtingen onder de EU Battery Regulation?',
    expected_answer: 'De EU Battery Regulation stelt eisen aan: carbon footprint declaratie en maximumwaarden, minimaal gerecycled materiaalgehalte, prestatie en duurzaamheid, verwijderbaarheid en vervangbaarheid, etikettering en QR-code, Digital Product Passport, en inzameling en recycling. De eisen worden gefaseerd ingevoerd vanaf 2024.',
    expected_citations: ['regulation', 'dpp_component']
  },
  {
    domain: 'regulations',
    sector: 'finance',
    difficulty: 'basic',
    question: 'Wat is de EU Taxonomie voor duurzame activiteiten?',
    expected_answer: 'De EU Taxonomie is een classificatiesysteem dat definieert welke economische activiteiten als ecologisch duurzaam worden beschouwd. Een activiteit is Taxonomie-aligned als het substantieel bijdraagt aan minstens één van zes milieudoelen, geen significante schade toebrengt aan de andere doelen, en voldoet aan minimale sociale waarborgen.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'environment',
    difficulty: 'advanced',
    question: 'Wat zijn de zes milieudoelstellingen van de EU Taxonomie?',
    expected_answer: 'De zes milieudoelstellingen zijn: 1) Klimaatmitigatie (beperking klimaatverandering), 2) Klimaatadaptatie (aanpassing aan klimaatverandering), 3) Duurzaam gebruik van water en mariene hulpbronnen, 4) Transitie naar circulaire economie, 5) Preventie en bestrijding van vervuiling, 6) Bescherming van biodiversiteit en ecosystemen.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'consumer',
    difficulty: 'intermediate',
    question: 'Wat is het Right to Repair en hoe wordt dit gereguleerd?',
    expected_answer: 'Het Right to Repair is het recht van consumenten om producten te laten repareren in plaats van te vervangen. De EU reguleert dit via de Ecodesign-verordening (ESPR) die eisen stelt aan repareerbaarheid, beschikbaarheid van reserveonderdelen, en toegang tot reparatie-informatie. Ook komt er een reparatie-index en worden garanties uitgebreid na reparatie.',
    expected_citations: ['regulation']
  },
  {
    domain: 'regulations',
    sector: 'marketing',
    difficulty: 'advanced',
    question: 'Hoe beïnvloedt de Green Claims Directive productcommunicatie?',
    expected_answer: 'De Green Claims Directive verbiedt misleidende milieuclaims en vereist dat claims worden onderbouwd met wetenschappelijk bewijs. Claims zoals "klimaatneutraal" of "eco-friendly" moeten specifiek, verifieerbaar en vergelijkbaar zijn. Bedrijven moeten de methodologie en data achter claims openbaar maken. Dit heeft directe impact op productlabels en marketing.',
    expected_citations: ['regulation']
  }
];

async function seedGoldenQAPairs() {
  cliOut('🌱 Starting Golden QA Dataset Seed...\n');
  
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'dtVAxSKn7P5nF6W.root',
    password: 'qyjk6KJU2cT8Yjkb',
    database: 'isa_db',
    ssl: { rejectUnauthorized: true }
  });

  try {
    // Check current count
    const [existing] = await conn.query('SELECT COUNT(*) as count FROM golden_qa_pairs');
    cliOut(`📊 Existing golden QA pairs: ${existing[0].count}`);
    
    if (existing[0].count > 0) {
      cliOut('⚠️  Golden QA pairs already exist. Skipping seed to avoid duplicates.');
      cliOut('   To re-seed, first run: DELETE FROM golden_qa_pairs;');
      return;
    }

    // Insert all pairs
    let inserted = 0;
    let errors = 0;
    
    for (const pair of GOLDEN_QA_PAIRS) {
      const questionType = inferQuestionType(pair.question);
      const difficulty = DIFFICULTY_MAP[pair.difficulty] || 'medium';
      
      try {
        await conn.query(`
          INSERT INTO golden_qa_pairs 
          (question, question_language, question_type, expected_answer, expected_citations, 
           expected_abstain, domain, sector, difficulty, notes, created_by, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          pair.question,
          'nl',
          questionType,
          pair.expected_answer,
          JSON.stringify(pair.expected_citations),
          0, // expected_abstain = false
          pair.domain,
          pair.sector,
          difficulty,
          null, // notes
          'manus-seed-script',
          1 // is_active
        ]);
        inserted++;
        
        // Progress indicator
        if (inserted % 10 === 0) {
          cliOut(`   Inserted ${inserted}/${GOLDEN_QA_PAIRS.length} pairs...`);
        }
      } catch (err) {
        cliErr(`❌ Error inserting pair: ${pair.question.substring(0, 50)}...`);
        cliErr(`   ${err.message}`);
        errors++;
      }
    }

    cliOut(`\n✅ Seed complete!`);
    cliOut(`   Inserted: ${inserted}`);
    cliOut(`   Errors: ${errors}`);
    cliOut(`   Total pairs: ${GOLDEN_QA_PAIRS.length}`);

    // Show distribution
    const [distribution] = await conn.query(`
      SELECT domain, difficulty, COUNT(*) as count 
      FROM golden_qa_pairs 
      GROUP BY domain, difficulty
      ORDER BY domain, difficulty
    `);
    
    cliOut('\n📊 Distribution by domain and difficulty:');
    cliOut(distribution);

  } finally {
    await conn.end();
  }
}

// Run the seed
seedGoldenQAPairs().catch((err) => cliErr(err));
