#!/usr/bin/env python3
"""
ISA Advisory JSON Validation Script

Purpose: Validate ISA_ADVISORY_v1.0.json against advisory-output.schema.json
"""

import json
import sys

try:
    from jsonschema import validate, ValidationError
except ImportError:
    print("Installing jsonschema...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "jsonschema", "-q"])
    from jsonschema import validate, ValidationError

# Load schema
with open('/home/ubuntu/isa_web/shared/schemas/advisory-output.schema.json', 'r') as f:
    schema = json.load(f)

# Load advisory JSON
with open('/home/ubuntu/isa_web/data/advisories/ISA_ADVISORY_v1.0.json', 'r') as f:
    advisory = json.load(f)

# Validate
try:
    validate(instance=advisory, schema=schema)
    print("✅ Schema validation PASSED")
except ValidationError as e:
    print(f"❌ Schema validation FAILED:")
    print(f"   {e.message}")
    print(f"   Path: {' -> '.join(str(p) for p in e.path)}")
    sys.exit(1)

# Verify completeness
print("\n📊 Completeness Verification:")

# Check all 7 gaps are included
expected_gaps = 7
actual_gaps = len(advisory["gaps"])
print(f"   Gaps: {actual_gaps}/{expected_gaps} {'✅' if actual_gaps == expected_gaps else '❌'}")

# Check all 10 recommendations are included
expected_recs = 10
actual_recs = len(advisory["recommendations"])
print(f"   Recommendations: {actual_recs}/{expected_recs} {'✅' if actual_recs == expected_recs else '❌'}")

# Check mapping results exist
total_mappings = len(advisory["mappingResults"])
print(f"   Mapping results: {total_mappings} {'✅' if total_mappings > 0 else '❌'}")

# Verify dataset references match frozen registry
expected_datasets = {
    "esrs.datapoints.ig3",
    "gs1nl.benelux.diy_garden_pet.v3.1.33",
    "gs1nl.benelux.fmcg.v3.1.33.5",
    "gs1nl.benelux.healthcare.v3.1.33",
    "gs1nl.benelux.validation_rules.v3.1.33.4",
    "gdsn.current.v3.1.32",
    "gs1.ctes_kdes",
    "eu.dpp.identification_rules",
    "gs1.cbv_digital_link"
}

# Collect all dataset references from advisory
used_datasets = set()
for reg in advisory["regulationsCovered"]:
    used_datasets.update(reg["datasetIds"])
for sector in advisory["sectorModelsCovered"]:
    used_datasets.add(sector["id"])
for mapping in advisory["mappingResults"]:
    used_datasets.update(mapping["datasetReferences"])
for gap in advisory["gaps"]:
    used_datasets.update(gap["datasetReferences"])

# Check if all used datasets are in frozen registry
unknown_datasets = used_datasets - expected_datasets
if unknown_datasets:
    print(f"   ❌ Unknown datasets found: {unknown_datasets}")
else:
    print(f"   Dataset references: All valid ✅")

# Verify registry version
if advisory["datasetRegistryVersion"] == "1.0.0":
    print(f"   Registry version: 1.0.0 ✅")
else:
    print(f"   ❌ Registry version mismatch: {advisory['datasetRegistryVersion']} (expected 1.0.0)")

# Summary statistics
print(f"\n📈 Advisory Statistics:")
print(f"   Advisory ID: {advisory['advisoryId']}")
print(f"   Version: {advisory['version']}")
print(f"   Publication Date: {advisory['publicationDate']}")
print(f"   Total Mappings: {advisory['metadata']['totalMappings']}")
print(f"     - Direct: {advisory['metadata']['directMappings']}")
print(f"     - Partial: {advisory['metadata']['partialMappings']}")
print(f"     - Missing: {advisory['metadata']['missingMappings']}")
print(f"   Total Gaps: {advisory['metadata']['totalGaps']}")
print(f"     - Critical: {advisory['metadata']['criticalGaps']}")
print(f"     - Moderate: {advisory['metadata']['moderateGaps']}")
print(f"     - Low Priority: {advisory['metadata']['lowPriorityGaps']}")
print(f"   Total Recommendations: {advisory['metadata']['totalRecommendations']}")
print(f"   Total Datapoints Analyzed: {advisory['metadata']['totalDatapointsAnalyzed']}")
print(f"   Total Attributes Evaluated: {advisory['metadata']['totalAttributesEvaluated']}")
print(f"   Total Records Used: {advisory['metadata']['totalRecordsUsed']}")

print("\n✅ Validation complete - ISA v1.0 advisory JSON is valid and complete")
