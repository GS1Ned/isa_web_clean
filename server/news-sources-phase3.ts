/**
 * Phase 3 News Sources
 * Additional sources for CSDDD, Green Claims, ESPR, NL-specific initiatives
 */

export interface NewsSource {
  id: string;
  name: string;
  type: "official" | "industry" | "national";
  url: string;
  enabled: boolean;
  priority: number;
  description: string;
}

export const PHASE3_SOURCES: NewsSource[] = [];
