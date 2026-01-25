/**
 * Claim-Citation Verification Module
 * 
 * Extracts claims from LLM responses and verifies that each claim
 * is properly supported by a citation from the knowledge base.
 * 
 * This addresses the "hallucination" problem by ensuring all factual
 * statements are grounded in authoritative sources.
 */

import { serverLogger } from './_core/logger-wiring';
import { type AuthorityLevel } from './authority-model';

/**
 * A claim extracted from the LLM response
 */
export interface ExtractedClaim {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'factual' | 'procedural' | 'definitional' | 'numerical' | 'temporal';
  confidence: number;
}

/**
 * A citation reference in the response
 */
export interface CitationReference {
  id: number;
  sourceId: number;
  sourceTitle: string;
  sourceUrl?: string;
  authorityLevel: AuthorityLevel;
  position: number;
}

/**
 * Result of claim-citation verification
 */
export interface ClaimVerificationResult {
  claim: ExtractedClaim;
  verified: boolean;
  supportingCitations: CitationReference[];
  verificationScore: number;
  issues: string[];
}

/**
 * Overall verification summary
 */
export interface VerificationSummary {
  totalClaims: number;
  verifiedClaims: number;
  unverifiedClaims: number;
  verificationRate: number;
  overallScore: number;
  claimResults: ClaimVerificationResult[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Patterns for identifying different types of claims
 */
const CLAIM_PATTERNS = {
  // Factual claims about regulations, requirements, etc.
  factual: [
    /(?:requires?|mandates?|obligates?|stipulates?)\s+(?:that\s+)?([^.!?]+)/gi,
    /(?:according to|as per|under)\s+(?:the\s+)?([A-Z][A-Za-z0-9\s]+),?\s+([^.!?]+)/gi,
    /(?:the\s+)?([A-Z][A-Z0-9]+)\s+(?:regulation|directive|standard)\s+([^.!?]+)/gi,
  ],
  // Procedural claims about how to do something
  procedural: [
    /(?:companies?|organizations?|businesses?)\s+(?:must|should|need to|are required to)\s+([^.!?]+)/gi,
    /(?:to comply|for compliance),?\s+([^.!?]+)/gi,
    /(?:the process|the procedure|the steps?)\s+(?:involves?|includes?|requires?)\s+([^.!?]+)/gi,
  ],
  // Definitional claims
  definitional: [
    /([A-Z][A-Za-z0-9\s]+)\s+(?:is|refers to|means|stands for)\s+([^.!?]+)/gi,
    /(?:defined as|known as|called)\s+([^.!?]+)/gi,
  ],
  // Numerical claims (dates, percentages, amounts)
  numerical: [
    /(\d+(?:\.\d+)?%)\s+(?:of|reduction|increase|target)/gi,
    /(?:by|before|from|until)\s+(\d{4})/gi,
    /(\d+(?:,\d{3})*(?:\.\d+)?)\s+(?:companies|organizations|entities|products)/gi,
    /(?:within|after|before)\s+(\d+)\s+(?:days?|months?|years?)/gi,
  ],
  // Temporal claims (deadlines, timelines)
  temporal: [
    /(?:deadline|effective date|entry into force|applicable from)\s+(?:is|of)?\s*([^.!?]+)/gi,
    /(?:starting|beginning|from)\s+(?:in\s+)?(\d{4}|January|February|March|April|May|June|July|August|September|October|November|December)/gi,
  ],
};

/**
 * Citation patterns in text (e.g., [1], [2], (Source: X))
 */
const CITATION_PATTERNS = [
  /\[(\d+)\]/g,                           // [1], [2], etc.
  /\((?:Source|Ref|Citation):\s*(\d+)\)/gi, // (Source: 1)
  /\(see\s+(?:source\s+)?(\d+)\)/gi,      // (see source 1)
  /¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹/g,                  // Superscript numbers
];

/**
 * Extract claims from LLM response text
 */
export function extractClaims(responseText: string): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  let claimId = 0;

  // Split into sentences for analysis
  const sentences = responseText.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    // Skip very short sentences or headers
    if (sentence.length < 20 || sentence.startsWith('#')) continue;
    
    // Check each claim pattern type
    for (const [type, patterns] of Object.entries(CLAIM_PATTERNS)) {
      for (const pattern of patterns) {
        // Reset regex state
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(sentence)) !== null) {
          const claimText = match[0].trim();
          
          // Skip if too short or already captured
          if (claimText.length < 15) continue;
          if (claims.some(c => c.text.includes(claimText) || claimText.includes(c.text))) continue;
          
          const startIndex = responseText.indexOf(claimText);
          if (startIndex === -1) continue;
          
          claims.push({
            id: `claim_${++claimId}`,
            text: claimText,
            startIndex,
            endIndex: startIndex + claimText.length,
            type: type as ExtractedClaim['type'],
            confidence: calculateClaimConfidence(claimText, type),
          });
        }
      }
    }
    
    // Also extract sentences that contain regulation/standard names
    const regulationMentions = sentence.match(/\b(CSRD|ESRS|EUDR|ESPR|CSDDD|PPWR|GS1|GTIN|GLN|EPCIS|EU Taxonomy)\b/gi);
    if (regulationMentions && regulationMentions.length > 0) {
      // Check if this sentence makes a claim about the regulation
      if (/(?:requires?|mandates?|states?|specifies?|defines?)/i.test(sentence)) {
        const startIndex = responseText.indexOf(sentence);
        if (startIndex !== -1 && !claims.some(c => c.startIndex === startIndex)) {
          claims.push({
            id: `claim_${++claimId}`,
            text: sentence.trim(),
            startIndex,
            endIndex: startIndex + sentence.length,
            type: 'factual',
            confidence: 0.8,
          });
        }
      }
    }
  }

  serverLogger.info(`[ClaimVerifier] Extracted ${claims.length} claims from response`);
  return claims;
}

/**
 * Calculate confidence score for a claim
 */
function calculateClaimConfidence(claimText: string, type: string): number {
  let confidence = 0.5;
  
  // Higher confidence for specific regulation mentions
  if (/\b(CSRD|ESRS|EUDR|ESPR|CSDDD|PPWR|EU Taxonomy)\b/i.test(claimText)) {
    confidence += 0.2;
  }
  
  // Higher confidence for specific article/section references
  if (/Article\s+\d+|Section\s+\d+|Chapter\s+\d+/i.test(claimText)) {
    confidence += 0.15;
  }
  
  // Higher confidence for numerical claims with specific values
  if (type === 'numerical' && /\d+(?:\.\d+)?%|\d{4}|\d+\s+(?:days?|months?|years?)/i.test(claimText)) {
    confidence += 0.1;
  }
  
  // Lower confidence for vague language
  if (/(?:may|might|could|possibly|generally|typically|often)/i.test(claimText)) {
    confidence -= 0.15;
  }
  
  return Math.max(0.1, Math.min(1.0, confidence));
}

/**
 * Extract citation references from response text
 */
export function extractCitations(
  responseText: string,
  sources: Array<{
    id: number;
    title: string;
    url?: string;
    authorityLevel?: AuthorityLevel;
  }>
): CitationReference[] {
  const citations: CitationReference[] = [];
  
  for (const pattern of CITATION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(responseText)) !== null) {
      const citationNum = parseInt(match[1] || '1', 10);
      const source = sources[citationNum - 1];
      
      if (source) {
        citations.push({
          id: citationNum,
          sourceId: source.id,
          sourceTitle: source.title,
          sourceUrl: source.url,
          authorityLevel: source.authorityLevel || 'industry',
          position: match.index,
        });
      }
    }
  }
  
  // Also check for inline source mentions
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const titlePattern = new RegExp(escapeRegex(source.title.slice(0, 30)), 'gi');
    let match: RegExpExecArray | null;
    
    while ((match = titlePattern.exec(responseText)) !== null) {
      if (!citations.some(c => c.sourceId === source.id && Math.abs(c.position - match!.index) < 50)) {
        citations.push({
          id: i + 1,
          sourceId: source.id,
          sourceTitle: source.title,
          sourceUrl: source.url,
          authorityLevel: source.authorityLevel || 'industry',
          position: match.index,
        });
      }
    }
  }
  
  serverLogger.info(`[ClaimVerifier] Found ${citations.length} citation references`);
  return citations;
}

/**
 * Verify that claims are supported by citations
 */
export function verifyClaims(
  claims: ExtractedClaim[],
  citations: CitationReference[],
  responseText: string
): ClaimVerificationResult[] {
  const results: ClaimVerificationResult[] = [];
  
  for (const claim of claims) {
    const supportingCitations: CitationReference[] = [];
    const issues: string[] = [];
    
    // Find citations near this claim (within 200 characters)
    const nearbyCitations = citations.filter(c => 
      Math.abs(c.position - claim.startIndex) < 200 ||
      Math.abs(c.position - claim.endIndex) < 200
    );
    
    // Check if any citation is directly in the claim text
    const inlineCitations = citations.filter(c =>
      c.position >= claim.startIndex && c.position <= claim.endIndex
    );
    
    supportingCitations.push(...inlineCitations, ...nearbyCitations);
    
    // Remove duplicates
    const uniqueCitations = supportingCitations.filter((c, i, arr) =>
      arr.findIndex(x => x.sourceId === c.sourceId) === i
    );
    
    // Calculate verification score
    let verificationScore = 0;
    
    if (uniqueCitations.length === 0) {
      issues.push('No citation found for this claim');
      verificationScore = 0;
    } else {
      // Base score from having citations
      verificationScore = 0.5;
      
      // Bonus for official/verified sources
      const hasOfficialSource = uniqueCitations.some(c => 
        c.authorityLevel === 'official' || c.authorityLevel === 'verified'
      );
      if (hasOfficialSource) {
        verificationScore += 0.3;
      }
      
      // Bonus for inline citation
      if (inlineCitations.length > 0) {
        verificationScore += 0.2;
      }
      
      // Penalty for only having industry/community sources
      if (uniqueCitations.every(c => 
        c.authorityLevel === 'industry' || c.authorityLevel === 'community'
      )) {
        verificationScore -= 0.1;
        issues.push('Claim only supported by lower-authority sources');
      }
    }
    
    // Adjust for claim confidence
    verificationScore = verificationScore * claim.confidence;
    
    results.push({
      claim,
      verified: uniqueCitations.length > 0 && verificationScore >= 0.4,
      supportingCitations: uniqueCitations,
      verificationScore: Math.max(0, Math.min(1, verificationScore)),
      issues,
    });
  }
  
  return results;
}

/**
 * Generate verification summary
 */
export function generateVerificationSummary(
  claimResults: ClaimVerificationResult[]
): VerificationSummary {
  const totalClaims = claimResults.length;
  const verifiedClaims = claimResults.filter(r => r.verified).length;
  const unverifiedClaims = totalClaims - verifiedClaims;
  const verificationRate = totalClaims > 0 ? verifiedClaims / totalClaims : 1;
  
  // Calculate overall score (weighted by claim confidence)
  const totalWeight = claimResults.reduce((sum, r) => sum + r.claim.confidence, 0);
  const weightedScore = claimResults.reduce(
    (sum, r) => sum + r.verificationScore * r.claim.confidence,
    0
  );
  const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 1;
  
  // Generate warnings
  const warnings: string[] = [];
  if (verificationRate < 0.5) {
    warnings.push('Less than half of claims are verified by citations');
  }
  if (claimResults.some(r => r.claim.type === 'numerical' && !r.verified)) {
    warnings.push('Some numerical claims lack citation support');
  }
  if (claimResults.some(r => r.claim.type === 'temporal' && !r.verified)) {
    warnings.push('Some deadline/date claims lack citation support');
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (unverifiedClaims > 0) {
    recommendations.push(`Consider adding citations for ${unverifiedClaims} unverified claim(s)`);
  }
  if (claimResults.some(r => r.issues.includes('Claim only supported by lower-authority sources'))) {
    recommendations.push('Some claims could benefit from official source citations');
  }
  
  return {
    totalClaims,
    verifiedClaims,
    unverifiedClaims,
    verificationRate: Math.round(verificationRate * 100) / 100,
    overallScore: Math.round(overallScore * 100) / 100,
    claimResults,
    warnings,
    recommendations,
  };
}

/**
 * Full claim-citation verification pipeline
 */
export function verifyResponseClaims(
  responseText: string,
  sources: Array<{
    id: number;
    title: string;
    url?: string;
    authorityLevel?: AuthorityLevel;
  }>
): VerificationSummary {
  const startTime = Date.now();
  
  // Step 1: Extract claims
  const claims = extractClaims(responseText);
  
  // Step 2: Extract citations
  const citations = extractCitations(responseText, sources);
  
  // Step 3: Verify claims against citations
  const claimResults = verifyClaims(claims, citations, responseText);
  
  // Step 4: Generate summary
  const summary = generateVerificationSummary(claimResults);
  
  const duration = Date.now() - startTime;
  serverLogger.info(
    `[ClaimVerifier] Verification complete in ${duration}ms: ` +
    `${summary.verifiedClaims}/${summary.totalClaims} claims verified ` +
    `(${Math.round(summary.verificationRate * 100)}%)`
  );
  
  return summary;
}

/**
 * Helper to escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
