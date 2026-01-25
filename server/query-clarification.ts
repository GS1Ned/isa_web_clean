/**
 * Query Clarification Module
 * 
 * Detects ambiguous queries and generates clarification suggestions
 * to help users get more accurate and relevant responses.
 */

import { serverLogger } from './_core/logger-wiring';

/**
 * Types of ambiguity in user queries
 */
export type AmbiguityType = 
  | 'vague_topic'        // Query too broad (e.g., "ESG")
  | 'multiple_meanings'  // Term has multiple interpretations
  | 'missing_context'    // Needs industry/company context
  | 'unclear_scope'      // Unclear if asking about EU, NL, or global
  | 'time_ambiguity'     // Unclear timeframe (current vs future requirements)
  | 'acronym_ambiguity'  // Acronym could mean multiple things
  | 'comparison_unclear' // Comparing things but unclear what aspect
  | 'none';              // Query is clear

/**
 * Clarification suggestion
 */
export interface ClarificationSuggestion {
  type: AmbiguityType;
  message: string;
  suggestions: string[];
  confidence: number;
}

/**
 * Query analysis result
 */
export interface QueryAnalysis {
  originalQuery: string;
  isAmbiguous: boolean;
  ambiguityScore: number;
  clarifications: ClarificationSuggestion[];
  enhancedQuery?: string;
  relatedTopics: string[];
}

/**
 * Common vague terms that need clarification
 */
const VAGUE_TERMS: Record<string, { message: string; suggestions: string[] }> = {
  'esg': {
    message: 'ESG is a broad topic. Which aspect are you interested in?',
    suggestions: [
      'What are the ESG reporting requirements under CSRD?',
      'How do GS1 standards support ESG compliance?',
      'What ESG regulations affect my industry?',
    ],
  },
  'sustainability': {
    message: 'Sustainability covers many areas. Could you be more specific?',
    suggestions: [
      'What are the sustainability reporting requirements?',
      'How can I measure my company\'s sustainability performance?',
      'What sustainability regulations apply to my products?',
    ],
  },
  'compliance': {
    message: 'Which regulation\'s compliance are you asking about?',
    suggestions: [
      'How do I comply with CSRD requirements?',
      'What are the compliance deadlines for EUDR?',
      'What compliance steps are needed for DPP?',
    ],
  },
  'reporting': {
    message: 'What type of reporting are you interested in?',
    suggestions: [
      'What are the CSRD sustainability reporting requirements?',
      'How do I report Scope 3 emissions?',
      'What data do I need for ESRS reporting?',
    ],
  },
  'regulation': {
    message: 'Which regulation would you like to know about?',
    suggestions: [
      'What is the CSRD regulation?',
      'What does EUDR require?',
      'How does ESPR affect my products?',
    ],
  },
  'standard': {
    message: 'Which standard are you asking about?',
    suggestions: [
      'What are the ESRS reporting standards?',
      'How do GS1 standards work?',
      'What is the EPCIS standard for traceability?',
    ],
  },
  'help': {
    message: 'I\'d be happy to help! What specific topic can I assist with?',
    suggestions: [
      'What regulations apply to my company?',
      'How do I start with sustainability reporting?',
      'What are the key ESG deadlines I should know?',
    ],
  },
  'requirements': {
    message: 'Requirements for which regulation or standard?',
    suggestions: [
      'What are the CSRD reporting requirements?',
      'What are the EUDR traceability requirements?',
      'What are the DPP data requirements?',
    ],
  },
};

/**
 * Acronyms that may need clarification
 */
const AMBIGUOUS_ACRONYMS: Record<string, { meanings: string[]; clarifyingQuestions: string[] }> = {
  'dpp': {
    meanings: ['Digital Product Passport', 'Data Protection Policy'],
    clarifyingQuestions: [
      'Are you asking about Digital Product Passports under ESPR?',
      'What product categories are you interested in for DPP?',
    ],
  },
  'zes': {
    meanings: ['Zero Emission Shipping', 'Zero Emission Zones', 'Zero Emission Solutions'],
    clarifyingQuestions: [
      'Are you asking about Zero Emission Zones for logistics?',
      'Are you interested in Zero Emission Shipping initiatives?',
    ],
  },
};

/**
 * Industry-specific context triggers
 */
const INDUSTRY_CONTEXT_TRIGGERS = [
  'my company',
  'my business',
  'my industry',
  'we need',
  'our products',
  'our supply chain',
];

/**
 * Scope ambiguity triggers
 */
const SCOPE_TRIGGERS = [
  'regulation',
  'law',
  'requirement',
  'standard',
];

/**
 * Analyze query for ambiguity
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase().trim();
  const clarifications: ClarificationSuggestion[] = [];
  let ambiguityScore = 0;
  const relatedTopics: string[] = [];

  // Check for very short queries
  if (lowerQuery.split(/\s+/).length <= 2) {
    ambiguityScore += 0.3;
    
    // Check if it's just a vague term
    for (const [term, info] of Object.entries(VAGUE_TERMS)) {
      if (lowerQuery.includes(term)) {
        clarifications.push({
          type: 'vague_topic',
          message: info.message,
          suggestions: info.suggestions,
          confidence: 0.8,
        });
        ambiguityScore += 0.3;
        break;
      }
    }
  }

  // Check for ambiguous acronyms
  for (const [acronym, info] of Object.entries(AMBIGUOUS_ACRONYMS)) {
    const acronymPattern = new RegExp(`\\b${acronym}\\b`, 'i');
    if (acronymPattern.test(lowerQuery)) {
      // Check if context makes it clear
      const hasContext = info.meanings.some(meaning => 
        lowerQuery.includes(meaning.toLowerCase().split(' ')[0])
      );
      
      if (!hasContext) {
        clarifications.push({
          type: 'acronym_ambiguity',
          message: `"${acronym.toUpperCase()}" could refer to: ${info.meanings.join(', ')}`,
          suggestions: info.clarifyingQuestions,
          confidence: 0.6,
        });
        ambiguityScore += 0.2;
      }
    }
  }

  // Check for missing industry context
  const needsIndustryContext = INDUSTRY_CONTEXT_TRIGGERS.some(trigger => 
    lowerQuery.includes(trigger)
  );
  
  if (needsIndustryContext && !hasIndustryMention(lowerQuery)) {
    clarifications.push({
      type: 'missing_context',
      message: 'Which industry or sector is your company in?',
      suggestions: [
        'What regulations apply to retail companies?',
        'What are the requirements for manufacturing?',
        'How does EUDR affect food and agriculture?',
      ],
      confidence: 0.7,
    });
    ambiguityScore += 0.2;
  }

  // Check for scope ambiguity (EU vs NL vs global)
  const mentionsScope = SCOPE_TRIGGERS.some(trigger => lowerQuery.includes(trigger));
  const hasSpecificScope = /\b(eu|european|dutch|netherlands|nl|global|international)\b/i.test(lowerQuery);
  
  if (mentionsScope && !hasSpecificScope) {
    clarifications.push({
      type: 'unclear_scope',
      message: 'Are you asking about EU, Dutch, or international regulations?',
      suggestions: [
        'What EU sustainability regulations should I know?',
        'What Dutch ESG initiatives exist?',
        'How do EU regulations compare to international standards?',
      ],
      confidence: 0.5,
    });
    ambiguityScore += 0.15;
  }

  // Check for time ambiguity
  const hasTimeReference = /\b(current|now|today|2024|2025|2026|future|upcoming|deadline)\b/i.test(lowerQuery);
  const mentionsDeadline = /\b(when|deadline|date|timeline|start|begin)\b/i.test(lowerQuery);
  
  if (mentionsDeadline && !hasTimeReference) {
    clarifications.push({
      type: 'time_ambiguity',
      message: 'Are you asking about current requirements or future deadlines?',
      suggestions: [
        'What are the current CSRD requirements?',
        'When do EUDR requirements come into force?',
        'What are the upcoming ESG deadlines for 2025?',
      ],
      confidence: 0.5,
    });
    ambiguityScore += 0.1;
  }

  // Check for comparison without clear aspect
  const isComparison = /\b(vs|versus|compared to|difference|between|or)\b/i.test(lowerQuery);
  if (isComparison && lowerQuery.split(/\s+/).length < 8) {
    clarifications.push({
      type: 'comparison_unclear',
      message: 'What aspect would you like to compare?',
      suggestions: [
        'What is the difference in scope between CSRD and NFRD?',
        'How do ESRS and GRI standards compare?',
        'What are the key differences between EUDR and CSDDD?',
      ],
      confidence: 0.6,
    });
    ambiguityScore += 0.15;
  }

  // Generate related topics based on query
  relatedTopics.push(...generateRelatedTopics(lowerQuery));

  // Calculate final ambiguity
  const isAmbiguous = ambiguityScore >= 0.3 || clarifications.length > 0;

  serverLogger.info(
    `[QueryClarification] Analyzed query: ambiguous=${isAmbiguous}, score=${ambiguityScore}, ` +
    `clarifications=${clarifications.length}`
  );

  return {
    originalQuery: query,
    isAmbiguous,
    ambiguityScore: Math.min(1, ambiguityScore),
    clarifications,
    enhancedQuery: isAmbiguous ? undefined : query,
    relatedTopics,
  };
}

/**
 * Check if query mentions a specific industry
 */
function hasIndustryMention(query: string): boolean {
  const industries = [
    'retail', 'manufacturing', 'logistics', 'food', 'agriculture',
    'automotive', 'textile', 'electronics', 'pharmaceutical', 'chemical',
    'construction', 'energy', 'finance', 'banking', 'insurance',
  ];
  return industries.some(ind => query.includes(ind));
}

/**
 * Generate related topics based on query content
 */
function generateRelatedTopics(query: string): string[] {
  const topics: string[] = [];
  
  // Map query terms to related topics
  const topicMappings: Record<string, string[]> = {
    'csrd': ['ESRS', 'Double Materiality', 'Sustainability Reporting'],
    'esrs': ['CSRD', 'EFRAG', 'Disclosure Requirements'],
    'eudr': ['Deforestation', 'Due Diligence', 'Traceability'],
    'espr': ['Digital Product Passport', 'Ecodesign', 'Circular Economy'],
    'dpp': ['ESPR', 'Product Information', 'QR Codes'],
    'csddd': ['Due Diligence', 'Human Rights', 'Supply Chain'],
    'gs1': ['GTIN', 'EPCIS', 'Digital Link', 'Traceability'],
    'gtin': ['Product Identification', 'Barcode', 'GS1'],
    'epcis': ['Supply Chain Visibility', 'Events', 'Traceability'],
    'taxonomy': ['EU Taxonomy', 'Sustainable Activities', 'CSRD'],
    'scope 3': ['Emissions', 'Value Chain', 'ESRS E1'],
    'materiality': ['Double Materiality', 'CSRD', 'Stakeholders'],
  };

  for (const [term, related] of Object.entries(topicMappings)) {
    if (query.includes(term)) {
      topics.push(...related);
    }
  }

  // Remove duplicates and limit
  return Array.from(new Set(topics)).slice(0, 5);
}

/**
 * Generate "Did you mean?" suggestions
 */
export function generateDidYouMean(query: string, searchResults: Array<{ title: string; score: number }>): string[] {
  const suggestions: string[] = [];
  
  // If search results have low scores, suggest related queries
  const lowConfidenceResults = searchResults.filter(r => r.score < 0.5);
  
  if (lowConfidenceResults.length > 0 && searchResults.length > 0) {
    // Extract key terms from top results
    const topTerms = searchResults
      .slice(0, 3)
      .map(r => r.title)
      .join(' ')
      .toLowerCase();
    
    // Generate suggestions based on top result titles
    if (topTerms.includes('csrd')) {
      suggestions.push('What are the CSRD reporting requirements?');
    }
    if (topTerms.includes('eudr')) {
      suggestions.push('What does EUDR require for traceability?');
    }
    if (topTerms.includes('esrs')) {
      suggestions.push('What are the ESRS disclosure standards?');
    }
    if (topTerms.includes('gs1') || topTerms.includes('gtin')) {
      suggestions.push('How do GS1 standards support compliance?');
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * Determine response mode based on evidence quality
 */
export type ResponseMode = 'full' | 'partial' | 'insufficient';

export interface ResponseModeAnalysis {
  mode: ResponseMode;
  reason: string;
  recommendations: string[];
}

export function determineResponseMode(
  searchResults: Array<{ score: number; authorityLevel?: string }>,
  claimVerificationRate: number
): ResponseModeAnalysis {
  // Calculate average search score
  const avgScore = searchResults.length > 0
    ? searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
    : 0;
  
  // Check for official sources
  const hasOfficialSource = searchResults.some(r => 
    r.authorityLevel === 'official' || r.authorityLevel === 'verified'
  );
  
  // Determine mode
  if (avgScore >= 0.7 && hasOfficialSource && claimVerificationRate >= 0.7) {
    return {
      mode: 'full',
      reason: 'High-quality evidence from authoritative sources',
      recommendations: [],
    };
  }
  
  if (avgScore >= 0.4 || searchResults.length >= 2) {
    const recommendations: string[] = [];
    
    if (!hasOfficialSource) {
      recommendations.push('Consider consulting official EU documentation for verification');
    }
    if (claimVerificationRate < 0.7) {
      recommendations.push('Some claims may require additional verification');
    }
    
    return {
      mode: 'partial',
      reason: 'Moderate evidence quality - response may be incomplete',
      recommendations,
    };
  }
  
  return {
    mode: 'insufficient',
    reason: 'Limited evidence available for this query',
    recommendations: [
      'Try rephrasing your question with more specific terms',
      'Check official EU regulation texts directly',
      'Contact GS1 Netherlands for specific guidance',
    ],
  };
}

/**
 * Enhance query with context for better search
 */
export function enhanceQuery(query: string, context?: { industry?: string; scope?: string }): string {
  let enhanced = query;
  
  // Add industry context if missing
  if (context?.industry && !hasIndustryMention(query.toLowerCase())) {
    enhanced = `${query} for ${context.industry} industry`;
  }
  
  // Add scope context if missing
  if (context?.scope && !/\b(eu|european|dutch|netherlands)\b/i.test(query)) {
    enhanced = `${enhanced} (${context.scope})`;
  }
  
  return enhanced;
}
