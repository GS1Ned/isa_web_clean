#!/usr/bin/env python3
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_env_file(path: Path):
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def require_env(name: str) -> str:
    value = os.environ.get(name, "")
    if not value:
        raise SystemExit(f"STOP=neo4j_project_postgres_env_missing {name}")
    return value


def connect_pg(url: str):
    import pg8000.dbapi

    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    ssl_context = True
    if query.get("sslmode", [""])[0] == "disable":
      ssl_context = False

    return pg8000.dbapi.connect(
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        database=parsed.path.lstrip("/"),
        ssl_context=ssl_context,
    )


def fetch_rows(conn):
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT
              r.celex_id,
              r.title,
              r.regulation_type,
              r.source_url,
              d.code,
              d.name,
              d.esrs_standard,
              d.disclosure_requirement,
              m.relevance_score,
              m.reasoning
            FROM regulation_esrs_mappings m
            JOIN regulations r
              ON r.id = m.regulation_id
            JOIN esrs_datapoints d
              ON d.id = m.datapoint_id
            ORDER BY r.celex_id, d.code
            """
        )
        return cur.fetchall()
    finally:
        cur.close()


def main():
    load_env_file(REPO_ROOT / ".env")

    pg_url = require_env("DATABASE_URL_POSTGRES")
    neo4j_uri = require_env("NEO4J_URI")
    neo4j_username = require_env("NEO4J_USERNAME")
    neo4j_password = require_env("NEO4J_PASSWORD")
    neo4j_database = require_env("NEO4J_DATABASE")

    from neo4j import GraphDatabase

    pg_conn = connect_pg(pg_url)
    rows = fetch_rows(pg_conn)
    pg_conn.close()

    driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_username, neo4j_password))
    try:
        with driver.session(database=neo4j_database) as session:
            session.run(
                "CREATE CONSTRAINT regulation_celex_id IF NOT EXISTS FOR (n:Regulation) REQUIRE n.celexId IS UNIQUE"
            )
            session.run(
                "CREATE CONSTRAINT esrs_datapoint_code IF NOT EXISTS FOR (n:ESRSDatapoint) REQUIRE n.code IS UNIQUE"
            )

            payload = [
                {
                    "celexId": row[0],
                    "regulationTitle": row[1],
                    "regulationType": row[2],
                    "sourceUrl": row[3],
                    "code": row[4],
                    "name": row[5],
                    "esrsStandard": row[6],
                    "disclosureRequirement": row[7],
                    "relevanceScore": row[8],
                    "reasoning": row[9],
                }
                for row in rows
                if row[0] and row[4]
            ]

            session.run(
                """
                UNWIND $rows AS row
                MERGE (reg:Regulation {celexId: row.celexId})
                SET
                  reg.title = row.regulationTitle,
                  reg.regulationType = row.regulationType,
                  reg.sourceUrl = row.sourceUrl,
                  reg.updatedAt = datetime()
                MERGE (dp:ESRSDatapoint {code: row.code})
                SET
                  dp.name = row.name,
                  dp.esrsStandard = row.esrsStandard,
                  dp.disclosureRequirement = row.disclosureRequirement,
                  dp.updatedAt = datetime()
                MERGE (reg)-[rel:REQUIRES_DISCLOSURE]->(dp)
                SET
                  rel.relevanceScore = row.relevanceScore,
                  rel.reasoning = row.reasoning,
                  rel.projectionSource = 'postgres.regulation_esrs_mappings',
                  rel.updatedAt = datetime()
                """,
                rows=payload,
            )

            summary = session.run(
                """
                MATCH (:Regulation)-[r:REQUIRES_DISCLOSURE]->(:ESRSDatapoint)
                RETURN count(r) AS relationshipCount
                """
            ).single()
            counts = session.run(
                """
                MATCH (r:Regulation) RETURN count(r) AS regulations
                """
            ).single()
            datapoints = session.run(
                """
                MATCH (d:ESRSDatapoint) RETURN count(d) AS datapoints
                """
            ).single()

            print(f"INFO=neo4j_pg_projection_regulations value={counts['regulations'] if counts else 0}")
            print(f"INFO=neo4j_pg_projection_datapoints value={datapoints['datapoints'] if datapoints else 0}")
            print(
                f"INFO=neo4j_pg_projection_relationships value={summary['relationshipCount'] if summary else 0}"
            )
            print("DONE=neo4j_project_postgres_regulation_mappings_ok")
    finally:
        driver.close()


if __name__ == "__main__":
    print("READY=neo4j_project_postgres_regulation_mappings_start")
    main()
