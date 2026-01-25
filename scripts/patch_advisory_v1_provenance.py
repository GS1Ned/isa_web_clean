#!/usr/bin/env python3
"""
Patch ISA_ADVISORY_v1.0.json with provenance metadata and stable identifiers.

This script:
1. Adds generatedAt timestamp
2. Adds sourceArtifacts with SHA256 hashes
3. Ensures stable ESRS/GS1 identifiers
4. Applies canonical ordering
5. Sets confidenceScore to 0 for missing mappings, null for direct/partial (v1.0 doesn't have scores yet)
"""

import json
from datetime import datetime, timezone

# Load current advisory
with open('/home/ubuntu/isa_web/data/advisories/ISA_ADVISORY_v1.0.json', 'r') as f:
    advisory = json.load(f)

# Add generatedAt (current timestamp in RFC3339 format)
advisory["generatedAt"] = datetime.now(timezone.utc).isoformat()

# Add sourceArtifacts with SHA256 hashes (from computed hashes)
advisory["sourceArtifacts"] = {
    "advisoryMarkdown": {
        "path": "docs/ISA_First_Advisory_Report_GS1NL.md",
        "sha256": "c0a27b2f558a64ee526f6d79d1a066a72b66688fdcd8509cce64031e911b8d52"
    },
    "datasetRegistry": {
        "path": "data/metadata/dataset_registry_v1.0_FROZEN.json",
        "version": "1.0.0",
        "sha256": "e2f655a9095ef4fa089d360b19189d73f9f6415762cd03baed0b7e97b6dcbc14"
    },
    "schema": {
        "id": "https://isa.manus.space/schemas/advisory-output.schema.json",
        "version": "1.0",
        "sha256": "aef56bd7f4a660d670a35cc0a06b4f5904cc4ed1b238cfafc8495dc1119d91f0"
    }
}

# Remove deprecated markdownSource field if it exists
if "markdownSource" in advisory:
    del advisory["markdownSource"]

# Set confidenceScore based on confidence level
# For v1.0: missing=0, direct/partial=null (scores not calculated yet)
for mapping in advisory["mappingResults"]:
    if mapping["confidence"] == "missing":
        mapping["confidenceScore"] = 0
    else:  # direct or partial
        mapping["confidenceScore"] = None

# Apply canonical ordering
# Sort mappingResults by mappingId
advisory["mappingResults"] = sorted(advisory["mappingResults"], key=lambda m: m["mappingId"])

# Sort gaps by gapId
advisory["gaps"] = sorted(advisory["gaps"], key=lambda g: g["gapId"])

# Sort recommendations by recommendationId
advisory["recommendations"] = sorted(advisory["recommendations"], key=lambda r: r["recommendationId"])

# Ensure uniqueness (remove duplicates if any)
def ensure_unique_ids(items, id_field):
    seen = set()
    unique_items = []
    for item in items:
        item_id = item[id_field]
        if item_id not in seen:
            seen.add(item_id)
            unique_items.append(item)
    return unique_items

advisory["mappingResults"] = ensure_unique_ids(advisory["mappingResults"], "mappingId")
advisory["gaps"] = ensure_unique_ids(advisory["gaps"], "gapId")
advisory["recommendations"] = ensure_unique_ids(advisory["recommendations"], "recommendationId")

# Write updated advisory
with open('/home/ubuntu/isa_web/data/advisories/ISA_ADVISORY_v1.0.json', 'w') as f:
    json.dump(advisory, f, indent=2, ensure_ascii=False)

print("✅ Advisory patched with provenance metadata")
print(f"   generatedAt: {advisory['generatedAt']}")
print(f"   sourceArtifacts: 3 artifacts with SHA256 hashes")
print(f"   Canonical ordering applied")
print(f"   Confidence scores: {sum(1 for m in advisory['mappingResults'] if m['confidenceScore'] == 0)} missing=0, {sum(1 for m in advisory['mappingResults'] if m['confidenceScore'] is None)} direct/partial=null")
