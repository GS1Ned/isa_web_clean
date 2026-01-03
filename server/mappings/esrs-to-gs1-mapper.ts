import {
  ESRS_GS1_MAPPING_RULES,
  type ESRSMappingRule,
  type GS1AttributeMapping,
} from "./esrs-gs1-mapping-data";

/**
 * Options to control ESRS → GS1 mapping behaviour.
 *
 * includeLowConfidence:
 *   - false / undefined → filter out mappings with confidence < 0.7
 *   - true              → include all mappings regardless of confidence
 *
 * filterByStandard:
 *   - When provided, only mappings whose `gs1Standard` matches (case-insensitive) are returned.
 *
 * maxAttributesPerDatapoint:
 *   - When provided, the list of GS1 attributes for each datapoint is truncated to this length
 *     after filtering and sorting by confidence (descending).
 */
export interface MappingOptions {
  includeLowConfidence?: boolean;
  filterByStandard?: string;
  maxAttributesPerDatapoint?: number;
}

/**
 * Final ESRS → GS1 mapping structure returned by the library.
 */
export interface ESRSToGS1Mapping {
  esrsDatapointId: string;
  esrsDatapointName: string;
  esrsStandard: string;
  gs1Attributes: GS1AttributeMapping[];
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Map ESRS datapoint IDs to GS1 attribute mappings using a static rule table.
 *
 * @param esrsDatapointIds Array of ESRS datapoint identifiers (e.g. "E1-1_01", "E5-2_01").
 * @param options Optional mapping behaviour configuration.
 *
 * @example
 * ```ts
 * const mappings = await mapESRSToGS1Attributes([
 *   "E1-1_01",
 *   "E5-2_01",
 * ], {
 *   filterByStandard: "GDSN",
 *   maxAttributesPerDatapoint: 3,
 * });
 * ```
 */
export async function mapESRSToGS1Attributes(
  esrsDatapointIds: string[],
  options?: MappingOptions
): Promise<ESRSToGS1Mapping[]> {
  if (!Array.isArray(esrsDatapointIds)) {
    throw new Error("esrsDatapointIds must be an array of strings.");
  }

  if (esrsDatapointIds.length === 0) {
    return [];
  }

  const normalizedOptions: MappingOptions = options ?? {};

  const results: ESRSToGS1Mapping[] = esrsDatapointIds.map(rawId => {
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id) {
      return createUnknownMapping(rawId ?? "", "Invalid");
    }

    const rules = findMatchingRules(id);
    if (rules.length === 0) {
      return createUnknownMapping(id, "Unknown");
    }

    const attributesFromRules: GS1AttributeMapping[] = rules.flatMap(rule =>
      rule.gs1Attributes.map<GS1AttributeMapping>(attr => ({
        ...attr,
      }))
    );

    const filteredAttributes = filterAttributes(
      attributesFromRules,
      normalizedOptions
    );

    const primaryRule = rules[0];
    const esrsStandard = primaryRule.esrs_standard || deriveStandardFromId(id);
    const esrsDatapointName = primaryRule.topic || id;

    return {
      esrsDatapointId: id,
      esrsDatapointName,
      esrsStandard,
      gs1Attributes: filteredAttributes,
    };
  });

  return results;
}

/**
 * Find all ESRS mapping rules whose glob pattern matches the given datapoint ID.
 */
function findMatchingRules(datapointId: string): ESRSMappingRule[] {
  return ESRS_GS1_MAPPING_RULES.filter(rule =>
    patternMatches(rule.esrsPattern, datapointId)
  );
}

/**
 * Convert a simple glob pattern with `*` wildcards into a regular expression and test it.
 *
 * Supported:
 *   - `*` → any sequence of characters (including empty)
 *   - All other characters are treated literally.
 */
function patternMatches(pattern: string, value: string): boolean {
  if (!pattern) {
    return false;
  }

  // Replace * with placeholder before escaping
  const withPlaceholder = pattern.replace(/\*/g, "__WILDCARD__");
  // Escape regex special characters
  const escaped = withPlaceholder.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");
  // Replace placeholder with .*
  const regexPattern = `^${escaped.replace(/__WILDCARD__/g, ".*")}$`;
  const regex = new RegExp(regexPattern);
  return regex.test(value);
}

/**
 * Apply confidence, standard and length filters to the attribute list.
 */
function filterAttributes(
  attributes: GS1AttributeMapping[],
  options: MappingOptions
): GS1AttributeMapping[] {
  let filtered = attributes.slice();

  if (!options.includeLowConfidence) {
    filtered = filtered.filter(
      attr => attr.mappingConfidence >= LOW_CONFIDENCE_THRESHOLD
    );
  }

  if (options.filterByStandard) {
    const target = options.filterByStandard.toLowerCase();
    filtered = filtered.filter(
      attr => attr.gs1Standard.toLowerCase() === target
    );
  }

  filtered.sort((a, b) => b.mappingConfidence - a.mappingConfidence);

  if (
    typeof options.maxAttributesPerDatapoint === "number" &&
    options.maxAttributesPerDatapoint >= 0
  ) {
    filtered = filtered.slice(0, options.maxAttributesPerDatapoint);
  }

  return filtered;
}

/**
 * Best-effort derivation of the ESRS standard from the datapoint ID prefix.
 *
 * Examples:
 *   - "E1-1_01" → "E1"
 *   - "S1-2_05" → "S1"
 */
function deriveStandardFromId(datapointId: string): string {
  const match = datapointId.match(/^([A-Z]\d?)/);
  if (match) {
    return match[1];
  }
  return "Unknown";
}

/**
 * Create a placeholder mapping for unknown or invalid datapoint IDs.
 */
function createUnknownMapping(
  datapointId: string,
  esrsStandard: string
): ESRSToGS1Mapping {
  return {
    esrsDatapointId: datapointId,
    esrsDatapointName: "Unknown ESRS datapoint",
    esrsStandard,
    gs1Attributes: [],
  };
}

export type {
  GS1AttributeMapping,
  ESRSMappingRule,
} from "./esrs-gs1-mapping-data";
