#!/usr/bin/env python3
import json
import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def parse_jsonl(path: Path):
    rows = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def load_env_file(path: Path):
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def main():
    load_env_file(REPO_ROOT / ".env")

    uri = os.environ.get("NEO4J_URI", "")
    username = os.environ.get("NEO4J_USERNAME", "")
    password = os.environ.get("NEO4J_PASSWORD", "")
    database = os.environ.get("NEO4J_DATABASE", "")

    if not uri or not username or not password or not database:
        raise SystemExit("STOP=neo4j_bootstrap_foundation_env_missing")

    from neo4j import GraphDatabase

    golden_rows = parse_jsonl(
        REPO_ROOT / "data" / "evaluation" / "golden" / "esrs_mapping" / "mappings_v1.jsonl"
    )
    whitepaper_rows = json.loads(
        (REPO_ROOT / "EU_ESG_to_GS1_Mapping_v1.1" / "data" / "gs1_mapping.json").read_text(
            encoding="utf-8"
        )
    )["gs1_mapping"]

    driver = GraphDatabase.driver(uri, auth=(username, password))

    try:
        with driver.session(database=database) as session:
            session.run("CREATE CONSTRAINT regulation_standard_code IF NOT EXISTS FOR (n:RegulationStandard) REQUIRE n.code IS UNIQUE")
            session.run("CREATE CONSTRAINT gs1_attribute_name IF NOT EXISTS FOR (n:GS1Attribute) REQUIRE n.name IS UNIQUE")
            session.run("CREATE CONSTRAINT gs1_standard_code IF NOT EXISTS FOR (n:GS1Standard) REQUIRE n.code IS UNIQUE")
            session.run("CREATE CONSTRAINT disclosure_requirement_id IF NOT EXISTS FOR (n:DisclosureRequirement) REQUIRE n.dataId IS UNIQUE")

            session.run(
                """
                UNWIND $rows AS row
                MERGE (reg:RegulationStandard {code: row.regulationStandard})
                MERGE (attr:GS1Attribute {name: row.gs1Attribute})
                SET attr.updatedAt = datetime()
                MERGE (reg)-[rel:MAPS_TO_ATTRIBUTE {mappingId: row.id}]->(attr)
                SET
                  rel.confidence = row.confidence,
                  rel.rationale = row.rationale,
                  rel.sourceAuthority = row.sourceAuthority,
                  rel.sourceFile = row.source_file,
                  rel.sectors = row.sectors,
                  rel.updatedAt = datetime(),
                  reg.updatedAt = datetime()
                """,
                rows=golden_rows,
            )

            whitepaper_payload = []
            for row in whitepaper_rows:
                source_code = row["data_id"].replace("DR-", "", 1)
                if "-" in source_code:
                    source_code = source_code.split("-", 1)[0]
                whitepaper_payload.append(
                    {
                        "dataId": row["data_id"],
                        "gs1Capability": row["gs1_capability"],
                        "mappingStrength": row["mapping_strength"],
                        "justification": row["justification"],
                        "sectorRelevance": row["sector_relevance"],
                        "gs1Standards": row.get("gs1_standards", []),
                        "sourceCode": source_code,
                    }
                )

            session.run(
                """
                UNWIND $rows AS row
                MERGE (req:DisclosureRequirement {dataId: row.dataId})
                SET
                  req.gs1Capability = row.gs1Capability,
                  req.mappingStrength = row.mappingStrength,
                  req.justification = row.justification,
                  req.sectorRelevance = row.sectorRelevance,
                  req.updatedAt = datetime()
                MERGE (reg:RegulationStandard {code: row.sourceCode})
                MERGE (reg)-[:HAS_REQUIREMENT]->(req)
                WITH req, row
                UNWIND row.gs1Standards AS standardCode
                MERGE (std:GS1Standard {code: standardCode})
                SET std.updatedAt = datetime()
                MERGE (req)-[rel:SUPPORTED_BY]->(std)
                SET
                  rel.mappingStrength = row.mappingStrength,
                  rel.gs1Capability = row.gs1Capability,
                  rel.justification = row.justification,
                  rel.sectorRelevance = row.sectorRelevance,
                  rel.updatedAt = datetime()
                """,
                rows=whitepaper_payload,
            )

            summary = session.run(
                """
                MATCH (n)
                WITH count(n) AS nodeCount
                MATCH ()-[r]->()
                RETURN nodeCount, count(r) AS relationshipCount
                """
            ).single()
            sample = session.run(
                """
                MATCH (reg:RegulationStandard {code: 'ESRS E5'})-[:MAPS_TO_ATTRIBUTE]->(attr:GS1Attribute)
                RETURN reg.code AS code, collect(attr.name)[0..5] AS attributes
                """
            ).single()

            node_count = summary["nodeCount"] if summary else 0
            relationship_count = summary["relationshipCount"] if summary else 0
            sample_attributes = sample["attributes"] if sample else []

            print(f"INFO=neo4j_nodes value={node_count}")
            print(f"INFO=neo4j_relationships value={relationship_count}")
            print(f"INFO=neo4j_esrs_e5_attributes value={json.dumps(sample_attributes)}")
            print("DONE=neo4j_bootstrap_foundation_ok")
    finally:
        driver.close()


if __name__ == "__main__":
    print("READY=neo4j_bootstrap_foundation_start")
    main()
