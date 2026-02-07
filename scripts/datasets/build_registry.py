#!/usr/bin/env python3
"""
Build dataset_registry.json from inventory and DATASETS_CATALOG.md
Maps existing datasets to registry schema with full metadata
"""

import json
import csv
import hashlib
from datetime import datetime
from pathlib import Path

def get_file_hash(filepath):
    """Calculate SHA256 hash"""
    try:
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except:
        return None

def load_inventory(csv_path):
    """Load inventory CSV into dict keyed by path"""
    inventory = {}
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            inventory[row['path']] = row
    return inventory

def build_registry(repo_root, inventory_csv):
    """Build dataset registry JSON"""
    
    inventory = load_inventory(inventory_csv)
    repo_path = Path(repo_root)
    
    datasets = []
    
    # Dataset 1: ESRS Datapoints (EFRAG IG3)
    esrs_file = "data/efrag/EFRAGIG3ListofESRSDataPoints(1)(1).xlsx"
    if esrs_file in inventory:
        datasets.append({
            "id": "esrs.datapoints.ig3",
            "title": "ESRS Datapoints (EFRAG IG3)",
            "description": "European Sustainability Reporting Standards datapoints from EFRAG Implementation Guidance 3",
            "publisher": "EFRAG",
            "jurisdiction": "EU",
            "sourceType": "taxonomy",
            "canonicalDomains": ["Regulations_and_Obligations", "Disclosures_and_Datapoints"],
            "status": "mvp",
            "version": "IG3-2024",
            "releaseDate": "2024-11-01",
            "language": ["EN"],
            "license": {
                "type": "public",
                "termsUrl": "https://www.efrag.org/en/terms-and-conditions",
                "notes": "EFRAG public guidance"
            },
            "access": {
                "method": "direct_download",
                "primaryUrl": "https://www.efrag.org/en/news-and-calendar",
                "credentialsRequired": False
            },
            "formats": [
                {"mediaType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
            ],
            "repoAssets": [
                {
                    "path": esrs_file,
                    "role": "canonical",
                    "bytes": int(inventory[esrs_file]['bytes'])
                }
            ],
            "lineage": {
                "hashes": [
                    {"alg": "sha256", "value": inventory[esrs_file]['sha256']}
                ]
            },
            "ingestion": {
                "module": "server/ingest-esrs-datapoints.ts",
                "targetTables": ["esrs_datapoints"],
                "refreshCadence": "semiannual"
            },
            "tags": ["esrs", "csrd", "sustainability", "reporting"]
        })
    
    # Dataset 2-4: GS1 NL Sector Models
    gs1_nl_files = {
        "gs1nl.benelux.diy_garden_pet.v3.1.33": {
            "file": "data/standards/gs1-nl/benelux-datasource/v3.1.33/GS1 Data Source Datamodel 3.1.33.xlsx",
            "title": "GS1 NL Data Source - DIY/Garden/Pets (DHZTD)",
            "version": "3.1.33",
            "releaseDate": "2023-09-08",
            "sector": "DIY/Garden/Pets"
        },
        "gs1nl.benelux.fmcg.v3.1.33.5": {
            "file": "data/standards/gs1-nl/benelux-datasource/v3.1.33/benelux-fmcg-data-model-31335-nederlands.xlsx",
            "title": "GS1 NL Data Source - FMCG (Food/Health/Beauty)",
            "version": "3.1.33.5",
            "releaseDate": "2024-05-09",
            "sector": "Food/Health/Beauty"
        },
        "gs1nl.benelux.healthcare.v3.1.33": {
            "file": "data/standards/gs1-nl/benelux-datasource/v3.1.33/common-echo-datamodel_3133.xlsx",
            "title": "GS1 NL Data Source - Healthcare (ECHO)",
            "version": "3.1.33",
            "releaseDate": "2023-09-08",
            "sector": "Healthcare"
        }
    }
    
    for dataset_id, meta in gs1_nl_files.items():
        if meta['file'] in inventory:
            datasets.append({
                "id": dataset_id,
                "title": meta['title'],
                "description": f"GS1 Netherlands Data Source sector model for {meta['sector']} products",
                "publisher": "GS1 Netherlands",
                "jurisdiction": "NL",
                "sourceType": "data_model",
                "canonicalDomains": ["GS1_Sector_Data_Models", "Product_and_Packaging"],
                "status": "mvp",
                "version": meta['version'],
                "releaseDate": meta['releaseDate'],
                "language": ["NL", "EN"],
                "license": {
                    "type": "licensed",
                    "notes": "GS1 Netherlands Data Source License"
                },
                "access": {
                    "method": "portal",
                    "credentialsRequired": True,
                    "notes": "Requires GS1 Netherlands membership"
                },
                "formats": [
                    {"mediaType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
                ],
                "repoAssets": [
                    {
                        "path": meta['file'],
                        "role": "canonical",
                        "bytes": int(inventory[meta['file']]['bytes'])
                    }
                ],
                "lineage": {
                    "hashes": [
                        {"alg": "sha256", "value": inventory[meta['file']]['sha256']}
                    ]
                },
                "ingestion": {
                    "module": "server/ingest-gs1-nl-complete.ts",
                    "targetTables": ["gs1_attributes"],
                    "refreshCadence": "annual"
                },
                "tags": ["gs1-nl", "benelux", meta['sector'].lower().replace('/', '-')]
            })
    
    # Dataset 5: GS1 NL Validation Rules
    validation_file = "data/standards/gs1-nl/benelux-datasource/v3.1.33/overview_of_validation_rules_for_the_benelux-31334.xlsx"
    if validation_file in inventory:
        datasets.append({
            "id": "gs1nl.benelux.validation_rules.v3.1.33.4",
            "title": "GS1 NL/Benelux Validation Rules",
            "description": "GS1 Netherlands/Benelux validation rules and data quality constraints",
            "publisher": "GS1 Netherlands",
            "jurisdiction": "NL",
            "sourceType": "standard_spec",
            "canonicalDomains": ["GS1_Sector_Data_Models", "Assurance_and_Auditability"],
            "status": "mvp",
            "version": "3.1.33.4",
            "releaseDate": "2024-11-15",
            "language": ["NL", "EN"],
            "license": {
                "type": "licensed",
                "notes": "GS1 Netherlands Data Source License"
            },
            "access": {
                "method": "portal",
                "credentialsRequired": True
            },
            "formats": [
                {"mediaType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
            ],
            "repoAssets": [
                {
                    "path": validation_file,
                    "role": "canonical",
                    "bytes": int(inventory[validation_file]['bytes'])
                }
            ],
            "lineage": {
                "hashes": [
                    {"alg": "sha256", "value": inventory[validation_file]['sha256']}
                ]
            },
            "ingestion": {
                "module": "server/ingest-validation-rules.ts",
                "targetTables": ["gs1_validation_rules", "gs1_local_code_lists"],
                "refreshCadence": "annual"
            },
            "tags": ["gs1-nl", "validation", "data-quality"]
        })
    
    # Build registry object
    registry = {
        "registryVersion": "1.0.0",
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "generatedBy": "ISA Dataset Governance Script",
        "notes": "Day-1 canonical dataset registry for ISA MVP. Includes ESRS datapoints, GS1 NL sector models, and validation rules.",
        "datasets": datasets
    }
    
    return registry

if __name__ == '__main__':
    import sys
    repo_root = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent.parent
    inventory_csv = sys.argv[2] if len(sys.argv) > 2 else str(repo_root / 'docs/evidence/generated/inventory/INVENTORY_BEFORE.csv')
    output_json = sys.argv[3] if len(sys.argv) > 3 else str(repo_root / 'data/metadata/dataset_registry.json')
    
    registry = build_registry(repo_root, inventory_csv)
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Registry created: {output_json}")
    print(f"   Datasets: {len(registry['datasets'])}")
