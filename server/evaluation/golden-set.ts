/**
 * Golden Set for Ask ISA Evaluation
 * 
 * A curated set of test questions with expected characteristics
 * for evaluating Ask ISA response quality.
 */

import { type AuthorityLevel } from '../authority-model';

/**
 * A test case in the golden set
 */
export interface GoldenSetTestCase {
  id: string;
  question: string;
  category: 'regulation' | 'standard' | 'compliance' | 'comparison' | 'procedural' | 'definitional';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  
  // Expected characteristics
  expectedTopics: string[];
  expectedRegulations?: string[];
  expectedStandards?: string[];
  minAuthorityLevel: AuthorityLevel;
  
  // Quality constraints
  mustMentionKeywords: string[];
  mustNotMention?: string[];
  minCitationCount: number;
  maxResponseLength?: number;
  
  // Evaluation criteria
  requiresSpecificArticle?: boolean;
  requiresDeadline?: boolean;
  requiresNumericalData?: boolean;
}

/**
 * The golden set of test questions
 */
export const GOLDEN_SET: GoldenSetTestCase[] = [
  // === CSRD Questions ===
  {
    id: 'csrd-001',
    question: 'What is the CSRD and which companies does it apply to?',
    category: 'regulation',
    difficulty: 'basic',
    expectedTopics: ['CSRD', 'scope', 'companies', 'reporting'],
    expectedRegulations: ['CSRD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['Corporate Sustainability Reporting Directive', 'large companies', 'listed'],
    minCitationCount: 1,
  },
  {
    id: 'csrd-002',
    question: 'What are the key deadlines for CSRD compliance?',
    category: 'regulation',
    difficulty: 'intermediate',
    expectedTopics: ['CSRD', 'deadlines', 'timeline', 'phased'],
    expectedRegulations: ['CSRD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['2024', '2025', '2026'],
    minCitationCount: 1,
    requiresDeadline: true,
  },
  {
    id: 'csrd-003',
    question: 'What is double materiality under CSRD?',
    category: 'definitional',
    difficulty: 'intermediate',
    expectedTopics: ['double materiality', 'impact', 'financial', 'CSRD'],
    expectedRegulations: ['CSRD', 'ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['impact materiality', 'financial materiality', 'stakeholders'],
    minCitationCount: 1,
  },
  {
    id: 'csrd-004',
    question: 'How does CSRD relate to the ESRS standards?',
    category: 'comparison',
    difficulty: 'intermediate',
    expectedTopics: ['CSRD', 'ESRS', 'relationship', 'standards'],
    expectedRegulations: ['CSRD', 'ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['ESRS', 'reporting standards', 'EFRAG'],
    minCitationCount: 2,
  },
  
  // === ESRS Questions ===
  {
    id: 'esrs-001',
    question: 'What are the ESRS standards and how many are there?',
    category: 'standard',
    difficulty: 'basic',
    expectedTopics: ['ESRS', 'standards', 'structure'],
    expectedRegulations: ['ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['European Sustainability Reporting Standards', 'EFRAG'],
    minCitationCount: 1,
  },
  {
    id: 'esrs-002',
    question: 'What does ESRS E1 cover regarding climate change?',
    category: 'standard',
    difficulty: 'intermediate',
    expectedTopics: ['ESRS E1', 'climate', 'emissions', 'targets'],
    expectedRegulations: ['ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['climate change', 'GHG emissions', 'Scope 1', 'Scope 2'],
    minCitationCount: 1,
  },
  {
    id: 'esrs-003',
    question: 'What are the disclosure requirements under ESRS S1 for workforce?',
    category: 'standard',
    difficulty: 'advanced',
    expectedTopics: ['ESRS S1', 'workforce', 'social', 'employees'],
    expectedRegulations: ['ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['own workforce', 'working conditions', 'health and safety'],
    minCitationCount: 1,
  },
  
  // === EUDR Questions ===
  {
    id: 'eudr-001',
    question: 'What is the EU Deforestation Regulation and what products does it cover?',
    category: 'regulation',
    difficulty: 'basic',
    expectedTopics: ['EUDR', 'deforestation', 'products', 'commodities'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['deforestation', 'commodities', 'due diligence'],
    minCitationCount: 1,
  },
  {
    id: 'eudr-002',
    question: 'What are the traceability requirements under EUDR?',
    category: 'procedural',
    difficulty: 'intermediate',
    expectedTopics: ['EUDR', 'traceability', 'geolocation', 'supply chain'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['geolocation', 'supply chain', 'due diligence'],
    minCitationCount: 1,
  },
  {
    id: 'eudr-003',
    question: 'When does EUDR come into force and what are the deadlines?',
    category: 'regulation',
    difficulty: 'basic',
    expectedTopics: ['EUDR', 'deadlines', 'enforcement'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['2024', 'SME'],
    minCitationCount: 1,
    requiresDeadline: true,
  },
  
  // === ESPR/DPP Questions ===
  {
    id: 'espr-001',
    question: 'What is the Ecodesign for Sustainable Products Regulation?',
    category: 'regulation',
    difficulty: 'basic',
    expectedTopics: ['ESPR', 'ecodesign', 'products', 'sustainability'],
    expectedRegulations: ['ESPR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['ecodesign', 'sustainable products', 'circular economy'],
    minCitationCount: 1,
  },
  {
    id: 'espr-002',
    question: 'What is a Digital Product Passport and how does it relate to ESPR?',
    category: 'definitional',
    difficulty: 'intermediate',
    expectedTopics: ['DPP', 'Digital Product Passport', 'ESPR', 'traceability'],
    expectedRegulations: ['ESPR', 'DPP'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['Digital Product Passport', 'product information', 'QR code'],
    minCitationCount: 1,
  },
  {
    id: 'espr-003',
    question: 'Which product categories will require Digital Product Passports first?',
    category: 'regulation',
    difficulty: 'intermediate',
    expectedTopics: ['DPP', 'product categories', 'batteries', 'textiles'],
    expectedRegulations: ['ESPR', 'DPP'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['batteries', 'textiles'],
    minCitationCount: 1,
  },
  
  // === CSDDD Questions ===
  {
    id: 'csddd-001',
    question: 'What is the Corporate Sustainability Due Diligence Directive?',
    category: 'regulation',
    difficulty: 'basic',
    expectedTopics: ['CSDDD', 'due diligence', 'supply chain', 'human rights'],
    expectedRegulations: ['CSDDD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['due diligence', 'supply chain', 'human rights', 'environment'],
    minCitationCount: 1,
  },
  {
    id: 'csddd-002',
    question: 'What are the due diligence obligations under CSDDD?',
    category: 'procedural',
    difficulty: 'intermediate',
    expectedTopics: ['CSDDD', 'obligations', 'due diligence', 'steps'],
    expectedRegulations: ['CSDDD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['identify', 'prevent', 'mitigate', 'adverse impacts'],
    minCitationCount: 1,
  },
  
  // === GS1 Standards Questions ===
  {
    id: 'gs1-001',
    question: 'What is a GTIN and how is it used for product identification?',
    category: 'standard',
    difficulty: 'basic',
    expectedTopics: ['GTIN', 'product identification', 'barcode'],
    expectedStandards: ['GTIN'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['Global Trade Item Number', 'barcode', 'unique identifier'],
    minCitationCount: 1,
  },
  {
    id: 'gs1-002',
    question: 'What is EPCIS and how does it support supply chain visibility?',
    category: 'standard',
    difficulty: 'intermediate',
    expectedTopics: ['EPCIS', 'supply chain', 'visibility', 'events'],
    expectedStandards: ['EPCIS'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['Electronic Product Code Information Services', 'events', 'visibility'],
    minCitationCount: 1,
  },
  {
    id: 'gs1-003',
    question: 'How can GS1 Digital Link support Digital Product Passports?',
    category: 'comparison',
    difficulty: 'advanced',
    expectedTopics: ['GS1 Digital Link', 'DPP', 'QR code', 'product information'],
    expectedStandards: ['GS1 Digital Link'],
    expectedRegulations: ['DPP', 'ESPR'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['Digital Link', 'QR code', 'product information', 'web URI'],
    minCitationCount: 2,
  },
  {
    id: 'gs1-004',
    question: 'What is a GLN and when should it be used?',
    category: 'standard',
    difficulty: 'basic',
    expectedTopics: ['GLN', 'location', 'identification'],
    expectedStandards: ['GLN'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['Global Location Number', 'location', 'party'],
    minCitationCount: 1,
  },
  
  // === Compliance Questions ===
  {
    id: 'compliance-001',
    question: 'How can a company prepare for CSRD compliance?',
    category: 'compliance',
    difficulty: 'intermediate',
    expectedTopics: ['CSRD', 'compliance', 'preparation', 'steps'],
    expectedRegulations: ['CSRD', 'ESRS'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['materiality assessment', 'data collection', 'reporting'],
    minCitationCount: 1,
  },
  {
    id: 'compliance-002',
    question: 'What data do companies need to collect for EUDR compliance?',
    category: 'compliance',
    difficulty: 'intermediate',
    expectedTopics: ['EUDR', 'data', 'traceability', 'geolocation'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['geolocation', 'supplier', 'due diligence statement'],
    minCitationCount: 1,
  },
  {
    id: 'compliance-003',
    question: 'How do GS1 standards help with EU regulation compliance?',
    category: 'comparison',
    difficulty: 'advanced',
    expectedTopics: ['GS1', 'compliance', 'traceability', 'regulations'],
    expectedStandards: ['GTIN', 'EPCIS', 'GS1 Digital Link'],
    expectedRegulations: ['EUDR', 'DPP', 'ESPR'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['traceability', 'identification', 'interoperability'],
    minCitationCount: 2,
  },
  
  // === Comparison Questions ===
  {
    id: 'compare-001',
    question: 'What is the difference between CSRD and NFRD?',
    category: 'comparison',
    difficulty: 'intermediate',
    expectedTopics: ['CSRD', 'NFRD', 'differences', 'scope'],
    expectedRegulations: ['CSRD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['Non-Financial Reporting Directive', 'scope', 'expanded'],
    minCitationCount: 1,
  },
  {
    id: 'compare-002',
    question: 'How does EU Taxonomy relate to CSRD reporting?',
    category: 'comparison',
    difficulty: 'advanced',
    expectedTopics: ['EU Taxonomy', 'CSRD', 'alignment', 'sustainable activities'],
    expectedRegulations: ['CSRD', 'EU Taxonomy'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['Taxonomy', 'sustainable activities', 'alignment'],
    minCitationCount: 2,
  },
  
  // === Dutch/NL Specific Questions ===
  {
    id: 'nl-001',
    question: 'What Dutch initiatives exist for sustainable logistics?',
    category: 'regulation',
    difficulty: 'intermediate',
    expectedTopics: ['Netherlands', 'logistics', 'sustainability', 'ZES'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['zero emission', 'logistics'],
    minCitationCount: 1,
  },
  {
    id: 'nl-002',
    question: 'How does GS1 Netherlands support ESG compliance?',
    category: 'standard',
    difficulty: 'intermediate',
    expectedTopics: ['GS1 Netherlands', 'ESG', 'support', 'standards'],
    expectedStandards: ['GS1'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['GS1', 'Netherlands', 'standards'],
    minCitationCount: 1,
  },
  
  // === Advanced/Complex Questions ===
  {
    id: 'advanced-001',
    question: 'How do CSRD, CSDDD, and EU Taxonomy work together?',
    category: 'comparison',
    difficulty: 'advanced',
    expectedTopics: ['CSRD', 'CSDDD', 'EU Taxonomy', 'integration'],
    expectedRegulations: ['CSRD', 'CSDDD', 'EU Taxonomy'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['reporting', 'due diligence', 'sustainable activities'],
    minCitationCount: 3,
  },
  {
    id: 'advanced-002',
    question: 'What is the relationship between ESPR, DPP, and GS1 standards?',
    category: 'comparison',
    difficulty: 'advanced',
    expectedTopics: ['ESPR', 'DPP', 'GS1', 'standards'],
    expectedRegulations: ['ESPR', 'DPP'],
    expectedStandards: ['GS1 Digital Link', 'GTIN'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['Digital Product Passport', 'GS1', 'interoperability'],
    minCitationCount: 2,
  },
  {
    id: 'advanced-003',
    question: 'How can companies implement end-to-end traceability for EUDR using GS1 standards?',
    category: 'procedural',
    difficulty: 'advanced',
    expectedTopics: ['EUDR', 'traceability', 'GS1', 'implementation'],
    expectedRegulations: ['EUDR'],
    expectedStandards: ['EPCIS', 'GTIN', 'GLN'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['EPCIS', 'traceability', 'supply chain', 'geolocation'],
    minCitationCount: 2,
  },
  
  // === Edge Cases ===
  {
    id: 'edge-001',
    question: 'What happens if a company fails to comply with CSRD?',
    category: 'compliance',
    difficulty: 'intermediate',
    expectedTopics: ['CSRD', 'penalties', 'non-compliance', 'enforcement'],
    expectedRegulations: ['CSRD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['penalties', 'member states', 'enforcement'],
    minCitationCount: 1,
  },
  {
    id: 'edge-002',
    question: 'Are SMEs exempt from CSRD requirements?',
    category: 'regulation',
    difficulty: 'intermediate',
    expectedTopics: ['CSRD', 'SME', 'exemption', 'scope'],
    expectedRegulations: ['CSRD'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['SME', 'listed', 'voluntary'],
    minCitationCount: 1,
  },
  {
    id: 'edge-003',
    question: 'How does EUDR apply to imported products?',
    category: 'regulation',
    difficulty: 'intermediate',
    expectedTopics: ['EUDR', 'imports', 'operators', 'traders'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['operators', 'traders', 'import', 'due diligence'],
    minCitationCount: 1,
  },
  
  // === Sector-Specific Questions ===
  {
    id: 'sector-001',
    question: 'What ESG regulations affect the retail sector?',
    category: 'compliance',
    difficulty: 'intermediate',
    expectedTopics: ['retail', 'ESG', 'regulations', 'compliance'],
    expectedRegulations: ['CSRD', 'EUDR', 'ESPR'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['retail', 'supply chain', 'products'],
    minCitationCount: 2,
  },
  {
    id: 'sector-002',
    question: 'How does EUDR impact the food and agriculture sector?',
    category: 'compliance',
    difficulty: 'intermediate',
    expectedTopics: ['EUDR', 'food', 'agriculture', 'commodities'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['commodities', 'soy', 'palm oil', 'coffee', 'cocoa'],
    minCitationCount: 1,
  },
  {
    id: 'sector-003',
    question: 'What sustainability reporting requirements apply to manufacturing companies?',
    category: 'compliance',
    difficulty: 'intermediate',
    expectedTopics: ['manufacturing', 'CSRD', 'ESRS', 'reporting'],
    expectedRegulations: ['CSRD', 'ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['manufacturing', 'emissions', 'supply chain'],
    minCitationCount: 1,
  },
  
  // === Definitional Questions ===
  {
    id: 'def-001',
    question: 'What is Scope 3 emissions reporting?',
    category: 'definitional',
    difficulty: 'basic',
    expectedTopics: ['Scope 3', 'emissions', 'value chain', 'GHG'],
    expectedRegulations: ['ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['value chain', 'indirect emissions', 'upstream', 'downstream'],
    minCitationCount: 1,
  },
  {
    id: 'def-002',
    question: 'What is a materiality assessment in sustainability reporting?',
    category: 'definitional',
    difficulty: 'intermediate',
    expectedTopics: ['materiality', 'assessment', 'CSRD', 'ESRS'],
    expectedRegulations: ['CSRD', 'ESRS'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['materiality', 'stakeholders', 'impacts', 'risks'],
    minCitationCount: 1,
  },
  {
    id: 'def-003',
    question: 'What is a due diligence statement under EUDR?',
    category: 'definitional',
    difficulty: 'intermediate',
    expectedTopics: ['EUDR', 'due diligence statement', 'declaration'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['due diligence statement', 'declaration', 'deforestation-free'],
    minCitationCount: 1,
  },
  
  // === Procedural Questions ===
  {
    id: 'proc-001',
    question: 'What are the steps to conduct a double materiality assessment?',
    category: 'procedural',
    difficulty: 'advanced',
    expectedTopics: ['double materiality', 'assessment', 'steps', 'CSRD'],
    expectedRegulations: ['CSRD', 'ESRS'],
    minAuthorityLevel: 'guidance',
    mustMentionKeywords: ['stakeholder engagement', 'impact', 'financial', 'threshold'],
    minCitationCount: 1,
  },
  {
    id: 'proc-002',
    question: 'How do I implement EPCIS for supply chain traceability?',
    category: 'procedural',
    difficulty: 'advanced',
    expectedTopics: ['EPCIS', 'implementation', 'traceability', 'events'],
    expectedStandards: ['EPCIS'],
    minAuthorityLevel: 'verified',
    mustMentionKeywords: ['events', 'capture', 'share', 'visibility'],
    minCitationCount: 1,
  },
  {
    id: 'proc-003',
    question: 'What is the process for EUDR due diligence?',
    category: 'procedural',
    difficulty: 'intermediate',
    expectedTopics: ['EUDR', 'due diligence', 'process', 'steps'],
    expectedRegulations: ['EUDR'],
    minAuthorityLevel: 'official',
    mustMentionKeywords: ['collect information', 'risk assessment', 'mitigation'],
    minCitationCount: 1,
  },
];

/**
 * Get test cases by category
 */
export function getTestCasesByCategory(category: GoldenSetTestCase['category']): GoldenSetTestCase[] {
  return GOLDEN_SET.filter(tc => tc.category === category);
}

/**
 * Get test cases by difficulty
 */
export function getTestCasesByDifficulty(difficulty: GoldenSetTestCase['difficulty']): GoldenSetTestCase[] {
  return GOLDEN_SET.filter(tc => tc.difficulty === difficulty);
}

/**
 * Get test cases by regulation
 */
export function getTestCasesByRegulation(regulation: string): GoldenSetTestCase[] {
  return GOLDEN_SET.filter(tc => 
    tc.expectedRegulations?.includes(regulation)
  );
}

/**
 * Get a random sample of test cases
 */
export function getRandomSample(count: number): GoldenSetTestCase[] {
  const shuffled = [...GOLDEN_SET].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, GOLDEN_SET.length));
}

/**
 * Get statistics about the golden set
 */
export function getGoldenSetStats(): {
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  byRegulation: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byRegulation: Record<string, number> = {};
  
  for (const tc of GOLDEN_SET) {
    byCategory[tc.category] = (byCategory[tc.category] || 0) + 1;
    byDifficulty[tc.difficulty] = (byDifficulty[tc.difficulty] || 0) + 1;
    
    for (const reg of tc.expectedRegulations || []) {
      byRegulation[reg] = (byRegulation[reg] || 0) + 1;
    }
  }
  
  return {
    total: GOLDEN_SET.length,
    byCategory,
    byDifficulty,
    byRegulation,
  };
}
