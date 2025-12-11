import type { MappingConfidenceLevel, GPCAttributeMappingRule, GPCAttributeMappingTarget } from "../../shared/gpc-attribute-mappings";
import { GPC_ATTRIBUTE_MAPPINGS } from "../../shared/gpc-attribute-mappings";

export interface GPCAttributeValueMap {
  [attribute: string]: unknown;
}

export interface GPCToGS1MappingInput {
  gpcBrick: string;
  attributes: GPCAttributeValueMap;
}

export interface GS1AttributeMappingResult {
  gpcAttribute: string;
  gs1AttributeCode: string;
  gs1Standard: string;
  confidence: MappingConfidenceLevel;
  value: unknown;
  notes?: string;
}

export interface UnmappedAttribute {
  gpcAttribute: string;
  value: unknown;
  reason: string;
}

export interface GPCToGS1MappingResult {
  gpcBrick: string;
  gs1Attributes: GS1AttributeMappingResult[];
  unmappedAttributes: UnmappedAttribute[];
}

/**
 * Map GPC attribute payloads for a given brick into GS1 attribute mappings.
 */
export function mapGPCToGS1(input: GPCToGS1MappingInput): GPCToGS1MappingResult {
  const brick = String(input.gpcBrick || "").trim();
  const gs1Attributes: GS1AttributeMappingResult[] = [];
  const unmappedAttributes: UnmappedAttribute[] = [];

  const attributes = input.attributes || {};
  const entries = Object.entries(attributes);

  entries.forEach(([attributeName, value]) => {
    const rules = findMappingRules(brick, attributeName);
    if (!rules.length) {
      unmappedAttributes.push({
        gpcAttribute: attributeName,
        value,
        reason: "No mapping rule found for attribute."
      });
      return;
    }

    const attributeLower = attributeName.toLowerCase();
    if (attributeLower == "netcontent") {
      const parsed = parseNetContent(value);
      rules.forEach(rule => {
        rule.targets.forEach(target => {
          const targetValue = target.gs1AttributeCode === "NET_CONTENT_UOM" ? parsed.unit : parsed.amount;
          gs1Attributes.push({
            gpcAttribute: attributeName,
            gs1AttributeCode: target.gs1AttributeCode,
            gs1Standard: target.gs1Standard,
            confidence: target.confidence,
            value: targetValue,
            notes: target.notes
          });
        });
      });
    } else {
      rules.forEach(rule => {
        rule.targets.forEach(target => {
          gs1Attributes.push({
            gpcAttribute: attributeName,
            gs1AttributeCode: target.gs1AttributeCode,
            gs1Standard: target.gs1Standard,
            confidence: target.confidence,
            value,
            notes: target.notes
          });
        });
      });
    }
  });

  return {
    gpcBrick: brick,
    gs1Attributes,
    unmappedAttributes
  };
}

/**
 * Find mapping rules for a given brick and GPC attribute.
 * Brick specific rules take precedence, then wildcard rules.
 */
export function findMappingRules(gpcBrick: string, gpcAttribute: string): GPCAttributeMappingRule[] {
  const brickId = String(gpcBrick || "").trim();
  const attributeId = String(gpcAttribute || "").trim();

  const specific = GPC_ATTRIBUTE_MAPPINGS.filter(rule => {
    return rule.gpcBrick == brickId && rule.gpcAttribute == attributeId;
  });

  if (specific.length) {
    return specific;
  }

  const wildcard = GPC_ATTRIBUTE_MAPPINGS.filter(rule => {
    return rule.gpcBrick == "*" && rule.gpcAttribute == attributeId;
  });

  return wildcard;
}

interface ParsedNetContent {
  amount: number | null;
  unit: string | null;
}

/**
 * Parse net content string values such as "500ml" or "0.5 L".
 */
export function parseNetContent(value: unknown): ParsedNetContent {
  if (typeof value != "string") {
    return {
      amount: null,
      unit: null
    };
  }

  const trimmed = value.trim();
  const expression = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z%]+)?$/;
  const match = trimmed.match(expression);
  if (!match) {
    return {
      amount: null,
      unit: null
    };
  }

  const amountStr = match[1].replace(",", ".");
  const unit = match[2] || null;
  const amountNumber = Number(amountStr);
  if (Number.isNaN(amountNumber)) {
    return {
      amount: null,
      unit
    };
  }

  return {
    amount: amountNumber,
    unit
  };
}

/**
 * Utility to aggregate GS1 attributes by code and keep highest confidence.
 */
export function mergeGS1Attributes(results: GS1AttributeMappingResult[]): GS1AttributeMappingResult[] {
  const byKey = new Map<string, GS1AttributeMappingResult>();

  const confidenceRank: Record<MappingConfidenceLevel, number> = {
    exact: 3,
    partial: 2,
    none: 1
  };

  results.forEach(result => {
    const key = result.gs1AttributeCode;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, result);
      return;
    }

    const existingRank = confidenceRank[existing.confidence];
    const newRank = confidenceRank[result.confidence];
    if (newRank > existingRank) {
      byKey.set(key, result);
    }
  });

  return Array.from(byKey.values());
}

