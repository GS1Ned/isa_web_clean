/**
 * Deterministic JSON Serialization Utilities
 * 
 * Purpose: Ensure consistent JSON serialization for KV-cache optimization.
 * 
 * Background: Non-deterministic JSON serialization (varying key order) breaks
 * KV-cache hit rates, causing 10x cost increase (3 USD/MTok uncached vs 
 * 0.30 USD/MTok cached).
 * 
 * Reference: Manus Context Engineering Best Practices
 * https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
 */

import sortKeys from 'sort-keys';

/**
 * Stringify object with deterministic key ordering
 * 
 * @param obj - Object to serialize
 * @param space - Indentation (default: 2 for readability)
 * @returns JSON string with sorted keys
 */
export function stringifyDeterministic(obj: any, space: number = 2): string {
  // Sort keys recursively (deep: true)
  const sorted = sortKeys(obj, { deep: true });
  return JSON.stringify(sorted, null, space);
}

/**
 * Stringify object for compact storage (no indentation)
 * 
 * @param obj - Object to serialize
 * @returns Compact JSON string with sorted keys
 */
export function stringifyCompact(obj: any): string {
  const sorted = sortKeys(obj, { deep: true });
  return JSON.stringify(sorted);
}

/**
 * Parse JSON and return with sorted keys
 * Useful for normalizing JSON from external sources
 * 
 * @param json - JSON string to parse
 * @returns Parsed object with sorted keys
 */
export function parseDeterministic(json: string): any {
  const parsed = JSON.parse(json);
  return sortKeys(parsed, { deep: true });
}
