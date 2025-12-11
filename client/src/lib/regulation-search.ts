/**
 * Regulation Search & Filter Utilities
 * Provides full-text search, advanced filtering, and result ranking
 */

export interface RegulationFilter {
  searchQuery?: string;
  status?: string[];
  regulationType?: string[];
  effectiveDateFrom?: Date;
  effectiveDateTo?: Date;
  sectors?: string[];
  relatedStandards?: string[];
}

export interface SearchResult {
  id: number;
  title: string;
  description: string;
  regulationType: string;
  effectiveDate: Date | null;
  relevanceScore: number;
  matchedTerms: string[];
}

/**
 * Perform full-text search on regulations
 */
export function searchRegulations(
  regulations: any[],
  query: string,
  filters?: RegulationFilter
): SearchResult[] {
  if (!query && !filters) return [];

  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const reg of regulations) {
    let relevanceScore = 0;
    const matchedTerms: string[] = [];

    // Text matching
    if (queryTerms.length > 0) {
      const searchableText = `${reg.title} ${reg.description}`.toLowerCase();

      for (const term of queryTerms) {
        if (searchableText.includes(term)) {
          // Higher score for title matches
          if (reg.title.toLowerCase().includes(term)) {
            relevanceScore += 10;
          } else {
            relevanceScore += 5;
          }

          if (!matchedTerms.includes(term)) {
            matchedTerms.push(term);
          }
        }
      }
    }

    // Filter matching
    if (filters) {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(reg.status)) {
          continue;
        }
      }

      // Regulation type filter
      if (filters.regulationType && filters.regulationType.length > 0) {
        if (!filters.regulationType.includes(reg.regulationType)) {
          continue;
        }
      }

      // Date range filter
      if (filters.effectiveDateFrom && reg.effectiveDate) {
        if (new Date(reg.effectiveDate) < filters.effectiveDateFrom) {
          continue;
        }
      }

      if (filters.effectiveDateTo && reg.effectiveDate) {
        if (new Date(reg.effectiveDate) > filters.effectiveDateTo) {
          continue;
        }
      }

      // Sectors filter
      if (filters.sectors && filters.sectors.length > 0) {
        const regSectors = (reg.affectedSectors || "").toLowerCase();
        const hasMatchingSector = filters.sectors.some(sector =>
          regSectors.includes(sector.toLowerCase())
        );
        if (!hasMatchingSector) {
          continue;
        }
      }

      // Related standards filter
      if (filters.relatedStandards && filters.relatedStandards.length > 0) {
        const regStandards = (reg.relatedStandards || []).map((s: string) =>
          s.toLowerCase()
        );
        const hasMatchingStandard = filters.relatedStandards.some(standard =>
          regStandards.includes(standard.toLowerCase())
        );
        if (!hasMatchingStandard) {
          continue;
        }
      }
    }

    // Only include if there's a match
    if (relevanceScore > 0 || (filters && !query)) {
      results.push({
        id: reg.id,
        title: reg.title,
        description: reg.description,
        regulationType: reg.regulationType,
        effectiveDate: reg.effectiveDate ? new Date(reg.effectiveDate) : null,
        relevanceScore,
        matchedTerms,
      });
    }
  }

  // Sort by relevance score (descending)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get available filter options
 */
export function getFilterOptions(regulations: any[]) {
  const statuses = new Set<string>();
  const types = new Set<string>();
  const sectors = new Set<string>();
  const standards = new Set<string>();

  for (const reg of regulations) {
    if (reg.status) statuses.add(reg.status);
    if (reg.regulationType) types.add(reg.regulationType);
    if (reg.affectedSectors) {
      reg.affectedSectors
        .split(",")
        .forEach((s: string) => sectors.add(s.trim()));
    }
    if (Array.isArray(reg.relatedStandards)) {
      reg.relatedStandards.forEach((s: string) => standards.add(s));
    }
  }

  return {
    statuses: Array.from(statuses).sort(),
    types: Array.from(types).sort(),
    sectors: Array.from(sectors).sort(),
    standards: Array.from(standards).sort(),
  };
}

/**
 * Highlight search terms in text
 */
export function highlightTerms(text: string, terms: string[]): string {
  if (!terms.length) return text;

  let highlighted = text;
  for (const term of terms) {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    highlighted = highlighted.replace(regex, `<mark>$&</mark>`);
  }
  return highlighted;
}

/**
 * Get related regulations based on standards
 */
export function getRelatedRegulations(
  regulations: any[],
  regulationId: number,
  maxResults: number = 5
): any[] {
  const target = regulations.find(r => r.id === regulationId);
  if (!target) return [];

  const targetStandards = new Set(target.relatedStandards || []);

  return regulations
    .filter(r => r.id !== regulationId)
    .map(r => ({
      ...r,
      matchingStandards: (r.relatedStandards || []).filter((s: string) =>
        targetStandards.has(s)
      ).length,
    }))
    .filter(r => r.matchingStandards > 0)
    .sort((a, b) => b.matchingStandards - a.matchingStandards)
    .slice(0, maxResults)
    .map(({ matchingStandards, ...r }) => r);
}
