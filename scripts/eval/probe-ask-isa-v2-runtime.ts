import { getDb } from "../../server/db";

async function main() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const embeddingType = await db.execute(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'knowledge_embeddings'
      AND column_name = 'embedding'
  `);

  let vectorTypeAvailable = true;
  let vectorTypeError: string | null = null;
  try {
    await db.execute(`SELECT '[1,2]'::vector AS sample_vector`);
  } catch (error) {
    vectorTypeAvailable = false;
    vectorTypeError = error instanceof Error ? error.message : String(error);
  }

  const sourceTypes = await db.execute(`
    SELECT source_type, COUNT(*)::int AS count
    FROM knowledge_embeddings
    GROUP BY source_type
    ORDER BY source_type
  `);

  const authorities = await db.execute(`
    SELECT authority_level, COUNT(*)::int AS count
    FROM knowledge_embeddings
    GROUP BY authority_level
    ORDER BY authority_level
  `);

  const layers = await db.execute(`
    SELECT semantic_layer, COUNT(*)::int AS count
    FROM knowledge_embeddings
    GROUP BY semantic_layer
    ORDER BY semantic_layer
  `);

  const hubNews = await db.execute(`
    SELECT to_regclass('public.hub_news') AS table_name
  `);

  const canonicalFacts = await db.execute(`
    SELECT to_regclass('public.canonical_facts') AS table_name
  `);

  const shape = (result: any) => result?.rows ?? result;

  console.log(
    JSON.stringify(
      {
        embeddingType: shape(embeddingType),
        vectorTypeAvailable,
        vectorTypeError,
        sourceTypes: shape(sourceTypes),
        authorities: shape(authorities),
        layers: shape(layers),
        hubNews: shape(hubNews),
        canonicalFacts: shape(canonicalFacts),
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
