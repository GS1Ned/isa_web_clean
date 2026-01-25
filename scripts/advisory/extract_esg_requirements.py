#!/usr/bin/env python3
"""
Extract ESG regulatory requirements from ingested databases
"""

import sqlite3
import json
from collections import defaultdict

def extract_esrs_datapoints(db_path):
    """Extract ESRS datapoints with product/supply-chain relevance"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    # Query ESRS datapoints
    query = """
    SELECT 
        code,
        esrsStandard,
        disclosureRequirement,
        name,
        dataType,
        mandatory,
        voluntary,
        phaseIn
    FROM esrs_datapoints
    WHERE 1=1
    ORDER BY esrsStandard, disclosureRequirement, code
    """
    
    cursor = conn.execute(query)
    datapoints = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    # Categorize by standard
    by_standard = defaultdict(list)
    for dp in datapoints:
        std = dp['esrsStandard'] or 'Unknown'
        by_standard[std].append(dp)
    
    return datapoints, by_standard

def extract_dpp_rules(db_path):
    """Extract DPP identification rules"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    query = """
    SELECT 
        ruleId,
        productCategory,
        identifierType,
        mandatory,
        description
    FROM dpp_rules
    ORDER BY productCategory, ruleId
    """
    
    cursor = conn.execute(query)
    rules = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return rules

def analyze_product_relevance(datapoints):
    """Identify datapoints with product/supply-chain relevance"""
    
    # Keywords indicating product/supply-chain relevance
    product_keywords = [
        'product', 'material', 'packaging', 'waste', 'recycl',
        'supply', 'chain', 'supplier', 'sourcing', 'procurement',
        'traceability', 'origin', 'composition', 'substance',
        'emission', 'footprint', 'impact', 'circular'
    ]
    
    relevant = []
    for dp in datapoints:
        name_lower = (dp['name'] or '').lower()
        if any(kw in name_lower for kw in product_keywords):
            relevant.append(dp)
    
    return relevant

def main():
    db_path = '/home/ubuntu/.manus/isa_web.db'
    
    print("=== Extracting ESG Regulatory Requirements ===\n")
    
    # Extract ESRS datapoints
    print("1. ESRS Datapoints (CSRD)")
    datapoints, by_standard = extract_esrs_datapoints(db_path)
    print(f"   Total datapoints: {len(datapoints)}")
    
    for std, dps in sorted(by_standard.items()):
        print(f"   - {std}: {len(dps)} datapoints")
    
    # Analyze product relevance
    product_relevant = analyze_product_relevance(datapoints)
    print(f"\n   Product/supply-chain relevant: {len(product_relevant)} datapoints")
    
    # Extract DPP rules
    print("\n2. EU Digital Product Passport")
    dpp_rules = extract_dpp_rules(db_path)
    print(f"   Total rules: {len(dpp_rules)}")
    
    # Save analysis results
    output = {
        'esrs': {
            'total': len(datapoints),
            'by_standard': {k: len(v) for k, v in by_standard.items()},
            'product_relevant': len(product_relevant),
            'product_relevant_datapoints': [
                {
                    'code': dp['code'],
                    'standard': dp['esrsStandard'],
                    'dr': dp['disclosureRequirement'],
                    'name': dp['name'],
                    'mandatory': dp['mandatory'],
                    'voluntary': dp['voluntary']
                }
                for dp in product_relevant[:50]  # Top 50 for report
            ]
        },
        'dpp': {
            'total': len(dpp_rules),
            'rules': [
                {
                    'ruleId': r['ruleId'],
                    'category': r['productCategory'],
                    'identifierType': r['identifierType'],
                    'mandatory': r['mandatory'],
                    'description': r['description']
                }
                for r in dpp_rules
            ]
        }
    }
    
    with open('/home/ubuntu/isa_web/scripts/advisory/esg_requirements.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print("\n✅ ESG requirements extracted")
    print("   Output: scripts/advisory/esg_requirements.json")
    
    return output

if __name__ == '__main__':
    main()
