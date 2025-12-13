#!/usr/bin/env python3
"""
Expand dataset registry to include all canonical datasets
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime

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

def get_file_size(filepath):
    """Get file size in bytes"""
    try:
        return Path(filepath).stat().st_size
    except:
        return 0

def expand_registry(registry_path, repo_root):
    """Add missing canonical datasets to registry"""
    
    # Load existing registry
    with open(registry_path, 'r', encoding='utf-8') as f:
        registry = json.load(f)
    
    existing_ids = {ds['id'] for ds in registry['datasets']}
    new_datasets = []
    
    # Dataset: ESRS Datapoints (IG3)
    if 'esrs.datapoints.ig3' not in existing_ids:
        file_path = Path(repo_root) / 'data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx'
        if file_path.exists():
            new_datasets.append({
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
                    "termsUrl": "https://www.efrag.org/en/terms-and-conditions"
                },
                "access": {
                    "method": "direct_download",
                    "primaryUrl": "https://www.efrag.org/en/news-and-calendar",
                    "credentialsRequired": False
                },
                "formats": [{"mediaType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}],
                "repoAssets": [{
                    "path": "data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx",
                    "role": "canonical",
                    "bytes": get_file_size(file_path)
                }],
                "lineage": {
                    "hashes": [{"alg": "sha256", "value": get_file_hash(file_path)}]
                },
                "ingestion": {
                    "module": "server/ingest-esrs-datapoints.ts",
                    "targetTables": ["esrs_datapoints"],
                    "refreshCadence": "semiannual"
                },
                "tags": ["esrs", "csrd", "sustainability", "reporting"]
            })
    
    # Dataset: GDSN Current (v3.1.32)
    if 'gdsn.current.v3.1.32' not in existing_ids:
        classes_path = Path(repo_root) / 'data/gs1/gdsn/gdsn_classes.json'
        attrs_path = Path(repo_root) / 'data/gs1/gdsn/gdsn_classAttributes.json'
        rules_path = Path(repo_root) / 'data/gs1/gdsn/gdsn_validationRules.json'
        
        if classes_path.exists():
            new_datasets.append({
                "id": "gdsn.current.v3.1.32",
                "title": "GDSN Current Data Model (v3.1.32)",
                "description": "GS1 Global Data Synchronisation Network (GDSN) product classes, attributes, and validation rules",
                "publisher": "GS1 Global",
                "jurisdiction": "GS1",
                "sourceType": "data_model",
                "canonicalDomains": ["GS1_Standards_and_Specs", "Product_and_Packaging"],
                "status": "mvp",
                "version": "3.1.32",
                "releaseDate": "2024-01-01",
                "language": ["EN"],
                "license": {
                    "type": "public",
                    "termsUrl": "https://www.gs1.org/standards/terms-and-conditions"
                },
                "access": {
                    "method": "portal",
                    "primaryUrl": "https://www.gs1.org/standards/gdsn",
                    "credentialsRequired": False
                },
                "formats": [{"mediaType": "application/json"}],
                "repoAssets": [
                    {"path": "data/gs1/gdsn/gdsn_classes.json", "role": "canonical", "bytes": get_file_size(classes_path)},
                    {"path": "data/gs1/gdsn/gdsn_classAttributes.json", "role": "canonical", "bytes": get_file_size(attrs_path)},
                    {"path": "data/gs1/gdsn/gdsn_validationRules.json", "role": "canonical", "bytes": get_file_size(rules_path)}
                ],
                "lineage": {
                    "hashes": [
                        {"alg": "sha256", "value": get_file_hash(classes_path)},
                        {"alg": "sha256", "value": get_file_hash(attrs_path)},
                        {"alg": "sha256", "value": get_file_hash(rules_path)}
                    ]
                },
                "ingestion": {
                    "module": "server/ingest-gdsn-standards.ts",
                    "targetTables": ["gdsn_product_classes", "gdsn_attributes", "gdsn_validation_rules"],
                    "refreshCadence": "annual"
                },
                "tags": ["gdsn", "product-data", "global-standards"]
            })
    
    # Dataset: CTEs and KDEs
    if 'gs1.ctes_kdes' not in existing_ids:
        file_path = Path(repo_root) / 'data/esg/ctes_and_kdes.json'
        if file_path.exists():
            new_datasets.append({
                "id": "gs1.ctes_kdes",
                "title": "GS1 CTEs and KDEs for ESG",
                "description": "GS1 Core Trade Element (CTE) and Key Data Element (KDE) mappings for ESG/sustainability reporting",
                "publisher": "GS1 Global",
                "jurisdiction": "GS1",
                "sourceType": "vocabulary",
                "canonicalDomains": ["GS1_Standards_and_Specs", "Vocabularies_and_Taxonomies"],
                "status": "mvp",
                "version": "1.0",
                "releaseDate": "2024-01-01",
                "language": ["EN"],
                "license": {
                    "type": "public"
                },
                "access": {
                    "method": "internal",
                    "credentialsRequired": False
                },
                "formats": [{"mediaType": "application/json"}],
                "repoAssets": [{
                    "path": "data/esg/ctes_and_kdes.json",
                    "role": "canonical",
                    "bytes": get_file_size(file_path)
                }],
                "lineage": {
                    "hashes": [{"alg": "sha256", "value": get_file_hash(file_path)}]
                },
                "ingestion": {
                    "module": "server/ingest-gs1-standards.ts",
                    "targetTables": ["gs1_standards"],
                    "refreshCadence": "annual"
                },
                "tags": ["cte", "kde", "esg", "sustainability"]
            })
    
    # Dataset: DPP Identification Rules
    if 'eu.dpp.identification_rules' not in existing_ids:
        rules_path = Path(repo_root) / 'data/esg/dpp_identification_rules.json'
        components_path = Path(repo_root) / 'data/esg/dpp_identifier_components.json'
        if rules_path.exists():
            new_datasets.append({
                "id": "eu.dpp.identification_rules",
                "title": "EU Digital Product Passport Identification Rules",
                "description": "EU DPP identification rules and identifier component specifications",
                "publisher": "EU Commission",
                "jurisdiction": "EU",
                "sourceType": "regulation_text",
                "canonicalDomains": ["Regulations_and_Obligations", "Identifiers_and_Digital_Link"],
                "status": "mvp",
                "version": "1.0",
                "releaseDate": "2024-01-01",
                "language": ["EN"],
                "license": {
                    "type": "public"
                },
                "access": {
                    "method": "internal",
                    "credentialsRequired": False
                },
                "formats": [{"mediaType": "application/json"}],
                "repoAssets": [
                    {"path": "data/esg/dpp_identification_rules.json", "role": "canonical", "bytes": get_file_size(rules_path)},
                    {"path": "data/esg/dpp_identifier_components.json", "role": "canonical", "bytes": get_file_size(components_path)}
                ],
                "lineage": {
                    "hashes": [
                        {"alg": "sha256", "value": get_file_hash(rules_path)},
                        {"alg": "sha256", "value": get_file_hash(components_path)}
                    ]
                },
                "ingestion": {
                    "module": "server/ingest-dpp-rules.ts",
                    "targetTables": ["dpp_rules"],
                    "refreshCadence": "annual"
                },
                "tags": ["dpp", "digital-product-passport", "eu-regulation"]
            })
    
    # Dataset: CBV and Digital Link
    if 'gs1.cbv_digital_link' not in existing_ids:
        cbv_path = Path(repo_root) / 'data/cbv/cbv_esg_curated.json'
        link_path = Path(repo_root) / 'data/digital_link/linktypes.json'
        if cbv_path.exists():
            new_datasets.append({
                "id": "gs1.cbv_digital_link",
                "title": "GS1 CBV and Digital Link Vocabularies",
                "description": "GS1 Core Business Vocabulary (CBV) and Digital Link type definitions",
                "publisher": "GS1 Global",
                "jurisdiction": "GS1",
                "sourceType": "vocabulary",
                "canonicalDomains": ["GS1_Standards_and_Specs", "Vocabularies_and_Taxonomies", "Identifiers_and_Digital_Link"],
                "status": "mvp",
                "version": "2.0",
                "releaseDate": "2024-01-01",
                "language": ["EN"],
                "license": {
                    "type": "public",
                    "termsUrl": "https://www.gs1.org/standards/terms-and-conditions"
                },
                "access": {
                    "method": "direct_download",
                    "primaryUrl": "https://www.gs1.org/standards/gs1-web-vocabulary",
                    "credentialsRequired": False
                },
                "formats": [{"mediaType": "application/json"}],
                "repoAssets": [
                    {"path": "data/cbv/cbv_esg_curated.json", "role": "canonical", "bytes": get_file_size(cbv_path)},
                    {"path": "data/digital_link/linktypes.json", "role": "canonical", "bytes": get_file_size(link_path)}
                ],
                "lineage": {
                    "hashes": [
                        {"alg": "sha256", "value": get_file_hash(cbv_path)},
                        {"alg": "sha256", "value": get_file_hash(link_path)}
                    ]
                },
                "ingestion": {
                    "module": "server/ingest-gs1-standards.ts",
                    "targetTables": ["gs1_standards"],
                    "refreshCadence": "annual"
                },
                "tags": ["cbv", "digital-link", "vocabulary", "web-vocabulary"]
            })
    
    # Add new datasets to registry
    registry['datasets'].extend(new_datasets)
    
    # Update registry metadata
    registry['registryVersion'] = "1.0.0"
    registry['generatedAt'] = datetime.utcnow().isoformat() + "Z"
    registry['notes'] = "ISA MVP canonical dataset registry. Includes ESRS, GS1 NL/Benelux, GDSN, CTEs/KDEs, DPP, and CBV datasets."
    
    # Write updated registry
    with open(registry_path, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Registry expanded: added {len(new_datasets)} datasets")
    print(f"   Total datasets: {len(registry['datasets'])}")
    for ds in new_datasets:
        print(f"   + {ds['id']}: {ds['title']}")
    
    return registry

if __name__ == '__main__':
    import sys
    registry_path = sys.argv[1] if len(sys.argv) > 1 else '/home/ubuntu/isa_web/data/metadata/dataset_registry.json'
    repo_root = sys.argv[2] if len(sys.argv) > 2 else '/home/ubuntu/isa_web'
    
    expand_registry(registry_path, repo_root)
