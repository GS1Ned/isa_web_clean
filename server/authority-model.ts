/**
 * Authority Model for Ask ISA
 * 
 * Classifies sources by their authority level to help users understand
 * the reliability and trustworthiness of cited information.
 * 
 * Authority Levels:
 * - Official (1.0): EU regulations, directives, official legal texts
 * - Verified (0.9): GS1 standards, EFRAG guidance, official industry standards
 * - Guidance (0.7): Implementation guides, technical specifications
 * - Industry (0.5): Whitepapers, best practices, industry reports
 * - Community (0.3): User-generated content, forum discussions
 */

import { serverLogger } from './_core/logger-wiring';

/**
 * Authority levels with their weights and display properties
 */
export type AuthorityLevel = 'official' | 'verified' | 'guidance' | 'industry' | 'community';

export interface AuthorityInfo {
  level: AuthorityLevel;
  score: number;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

/**
 * Authority level definitions with metadata
 */
export const AUTHORITY_LEVELS: Record<AuthorityLevel, AuthorityInfo> = {
  official: {
    level: 'official',
    score: 1.0,
    label: 'Official',
    description: 'Official EU legislation and regulatory texts',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'shield-check',
  },
  verified: {
    level: 'verified',
    score: 0.9,
    label: 'Verified',
    description: 'GS1 standards and EFRAG official guidance',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'badge-check',
  },
  guidance: {
    level: 'guidance',
    score: 0.7,
    label: 'Guidance',
    description: 'Implementation guides and technical specifications',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'book-open',
  },
  industry: {
    level: 'industry',
    score: 0.5,
    label: 'Industry',
    description: 'Industry reports, whitepapers, and best practices',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'building-office',
  },
  community: {
    level: 'community',
    score: 0.3,
    label: 'Community',
    description: 'Community contributions and user-generated content',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    icon: 'users',
  },
};

/**
 * Patterns for classifying source authority based on URL and title
 */
const AUTHORITY_PATTERNS: Array<{
  level: AuthorityLevel;
  urlPatterns: RegExp[];
  titlePatterns: RegExp[];
}> = [
  {
    level: 'official',
    urlPatterns: [
      /eur-lex\.europa\.eu/i,
      /europa\.eu\/legal/i,
      /ec\.europa\.eu/i,
      /efrag\.org.*official/i,
    ],
    titlePatterns: [
      /^(EU\s+)?Regulation\s+\d+\/\d+/i,
      /^(EU\s+)?Directive\s+\d+\/\d+/i,
      /^CSRD\b/i,
      /^ESRS\s+\d/i,
      /^EUDR\b/i,
      /^ESPR\b/i,
      /^CSDDD\b/i,
      /^PPWR\b/i,
      /^EU\s+Taxonomy/i,
      /Delegated\s+(Act|Regulation)/i,
      /Implementing\s+(Act|Regulation)/i,
    ],
  },
  {
    level: 'verified',
    urlPatterns: [
      /gs1\.org/i,
      /gs1\.nl/i,
      /gs1\.eu/i,
      /efrag\.org/i,
      /iso\.org/i,
    ],
    titlePatterns: [
      /^GS1\s+/i,
      /^GTIN\b/i,
      /^GLN\b/i,
      /^SSCC\b/i,
      /^EPCIS\b/i,
      /^CBV\b/i,
      /^Digital\s+Link/i,
      /^EFRAG\s+/i,
      /^ISO\s+\d+/i,
    ],
  },
  {
    level: 'guidance',
    urlPatterns: [
      /implementation.*guide/i,
      /technical.*specification/i,
      /guidance.*document/i,
    ],
    titlePatterns: [
      /Implementation\s+Guide/i,
      /Technical\s+Specification/i,
      /User\s+Guide/i,
      /How\s+to/i,
      /Best\s+Practice/i,
      /Guidance\s+(on|for)/i,
    ],
  },
  {
    level: 'industry',
    urlPatterns: [
      /whitepaper/i,
      /report/i,
      /research/i,
    ],
    titlePatterns: [
      /Whitepaper/i,
      /Industry\s+Report/i,
      /Market\s+Analysis/i,
      /Research\s+Paper/i,
    ],
  },
];

/**
 * Regulation type to authority level mapping
 */
const REGULATION_TYPE_AUTHORITY: Record<string, AuthorityLevel> = {
  'CSRD': 'official',
  'ESRS': 'official',
  'DPP': 'official',
  'EUDR': 'official',
  'ESPR': 'official',
  'PPWR': 'official',
  'EU_TAXONOMY': 'official',
  'OTHER': 'guidance',
};

/**
 * Classify the authority level of a source
 * 
 * @param source - Source information to classify
 * @returns Authority information including level, score, and display properties
 */
export function classifyAuthority(source: {
  type: 'regulation' | 'standard';
  title: string;
  url?: string;
  regulationType?: string;
  category?: string;
}): AuthorityInfo {
  // Check regulation type first (most reliable)
  if (source.type === 'regulation' && source.regulationType) {
    const level = REGULATION_TYPE_AUTHORITY[source.regulationType];
    if (level) {
      return AUTHORITY_LEVELS[level];
    }
  }

  // Standards are typically verified
  if (source.type === 'standard') {
    // Check if it's a GS1 standard
    if (source.title?.toLowerCase().includes('gs1') || 
        source.category?.toLowerCase().includes('gs1')) {
      return AUTHORITY_LEVELS.verified;
    }
    return AUTHORITY_LEVELS.guidance;
  }

  // Check URL and title patterns
  for (const pattern of AUTHORITY_PATTERNS) {
    // Check URL patterns
    if (source.url) {
      for (const urlPattern of pattern.urlPatterns) {
        if (urlPattern.test(source.url)) {
          return AUTHORITY_LEVELS[pattern.level];
        }
      }
    }

    // Check title patterns
    if (source.title) {
      for (const titlePattern of pattern.titlePatterns) {
        if (titlePattern.test(source.title)) {
          return AUTHORITY_LEVELS[pattern.level];
        }
      }
    }
  }

  // Default to industry level for unclassified sources
  serverLogger.info(`[Authority] Unclassified source: "${source.title?.slice(0, 50)}..." defaulting to industry`);
  return AUTHORITY_LEVELS.industry;
}

/**
 * Get authority badge configuration for frontend display
 */
export function getAuthorityBadge(level: AuthorityLevel): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  tooltip: string;
} {
  const info = AUTHORITY_LEVELS[level];
  return {
    label: info.label,
    color: info.color,
    bgColor: info.bgColor,
    icon: info.icon,
    tooltip: info.description,
  };
}

/**
 * Calculate weighted authority score for a set of sources
 * Used to assess overall answer reliability
 */
export function calculateAuthorityScore(
  sources: Array<{ authorityLevel: AuthorityLevel; similarity?: number }>
): {
  score: number;
  level: AuthorityLevel;
  breakdown: Record<AuthorityLevel, number>;
} {
  if (sources.length === 0) {
    return {
      score: 0,
      level: 'community',
      breakdown: { official: 0, verified: 0, guidance: 0, industry: 0, community: 0 },
    };
  }

  // Count sources by authority level
  const breakdown: Record<AuthorityLevel, number> = {
    official: 0,
    verified: 0,
    guidance: 0,
    industry: 0,
    community: 0,
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const source of sources) {
    breakdown[source.authorityLevel]++;
    
    // Weight by similarity if available, otherwise equal weight
    const weight = source.similarity ?? 1;
    const authorityScore = AUTHORITY_LEVELS[source.authorityLevel].score;
    
    totalWeightedScore += authorityScore * weight;
    totalWeight += weight;
  }

  const avgScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  // Determine overall level based on score
  let level: AuthorityLevel = 'community';
  if (avgScore >= 0.95) level = 'official';
  else if (avgScore >= 0.85) level = 'verified';
  else if (avgScore >= 0.65) level = 'guidance';
  else if (avgScore >= 0.4) level = 'industry';

  return {
    score: Math.round(avgScore * 100) / 100,
    level,
    breakdown,
  };
}

/**
 * Format authority information for LLM context
 */
export function formatAuthorityForContext(
  sources: Array<{
    title: string;
    authorityLevel: AuthorityLevel;
    similarity?: number;
  }>
): string {
  const lines = sources.map((s, i) => {
    const info = AUTHORITY_LEVELS[s.authorityLevel];
    const similarity = s.similarity ? ` (${Math.round(s.similarity * 100)}% relevant)` : '';
    return `[${i + 1}] ${s.title}${similarity} - Authority: ${info.label}`;
  });

  return lines.join('\n');
}
