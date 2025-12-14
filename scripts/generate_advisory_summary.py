#!/usr/bin/env python3
"""
Generate ISA_ADVISORY_v1.0.summary.json for fast stats and regression testing.
"""

import json
from datetime import datetime, timezone

# Load advisory
with open('/home/ubuntu/isa_web/data/advisories/ISA_ADVISORY_v1.0.json', 'r') as f:
    advisory = json.load(f)

# Count mappings by confidence
mapping_by_confidence = {"direct": 0, "partial": 0, "missing": 0}
for m in advisory["mappingResults"]:
    mapping_by_confidence[m["confidence"]] += 1

# Count gaps by category
gaps_by_severity = {"critical": 0, "moderate": 0, "low-priority": 0}
for g in advisory["gaps"]:
    gaps_by_severity[g["category"]] += 1

# Count recommendations by timeframe
recs_by_timeframe = {"short-term": 0, "medium-term": 0, "long-term": 0}
for r in advisory["recommendations"]:
    recs_by_timeframe[r["timeframe"]] += 1

# Create summary
summary = {
    "advisoryId": advisory["advisoryId"],
    "version": advisory["version"],
    "publicationDate": advisory["publicationDate"],
    "generatedAt": advisory["generatedAt"],
    "datasetRegistryVersion": advisory["datasetRegistryVersion"],
    "mappingResults": {
        "total": len(advisory["mappingResults"]),
        "byConfidence": mapping_by_confidence
    },
    "gaps": {
        "total": len(advisory["gaps"]),
        "bySeverity": gaps_by_severity
    },
    "recommendations": {
        "total": len(advisory["recommendations"]),
        "byTimeframe": recs_by_timeframe
    },
    "statistics": advisory["metadata"]
}

# Write summary
with open('/home/ubuntu/isa_web/data/advisories/ISA_ADVISORY_v1.0.summary.json', 'w') as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)

print("✅ Summary generated:")
print(f"   Mappings: {mapping_by_confidence}")
print(f"   Gaps: {gaps_by_severity}")
print(f"   Recommendations: {recs_by_timeframe}")
