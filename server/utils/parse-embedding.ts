/**
 * Parse an embedding value that may come from pgvector (string) or MySQL (JSON array).
 * pgvector returns embeddings as strings like '[0.1,0.2,...]'
 * MySQL/TiDB returns them as JSON arrays.
 */
export function parseEmbedding(raw: unknown): number[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as number[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      return null;
    }
  }
  return null;
}
