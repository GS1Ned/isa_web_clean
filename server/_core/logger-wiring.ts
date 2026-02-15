/**
 * server/_core/logger-wiring.ts
 * Wire a persisted serverLogger instance that inserts into error_ledger.
 * Export serverLogger for app-wide use.
 */

import { serverLoggerFactory } from "../utils/server-logger";
import { getDb } from "../db";

function writeStdout(line: string) {
  process.stdout.write(line.endsWith("\n") ? line : `${line}\n`);
}

function writeStderr(line: string) {
  process.stderr.write(line.endsWith("\n") ? line : `${line}\n`);
}

type PersistRow = {
  trace_id: string;
  created_at: string;
  error_code?: string | null;
  classification?: string | null;
  commit_sha?: string | null;
  branch?: string | null;
  environment?: string | null;
  affected_files?: unknown;
  error_payload: unknown;
  failing_inputs?: unknown;
  remediation_attempts?: unknown;
};

async function createPersistFn() {
  const db = await getDb();
  if (!db) {
    // Return a silent no-op when DB is unavailable
    // CRITICAL: Do NOT log here - it creates infinite recursion
    return async (_row: PersistRow) => {};
  }

  return async (row: PersistRow) => {
    try {
      const insertSql = `
        INSERT INTO error_ledger
          (trace_id, error_code, classification, commit_sha, branch, environment, affected_files, error_payload, failing_inputs, remediation_attempts, resolved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `;
      const params = [
        row.trace_id,
        row.error_code ?? null,
        row.classification ?? null,
        row.commit_sha ?? null,
        row.branch ?? null,
        row.environment ?? null,
        JSON.stringify(row.affected_files ?? null),
        JSON.stringify(row.error_payload ?? {}),
        JSON.stringify(row.failing_inputs ?? null),
        JSON.stringify(row.remediation_attempts ?? []),
      ];
      await (db as any).execute(insertSql, params);
    } catch (err) {
      // CRITICAL: Do NOT use serverLogger.error here - it creates infinite recursion
      // when persist fails, as serverLogger.error tries to persist again
      writeStderr(JSON.stringify({
        level: "error",
        message: "[serverLogger.persist] failed to insert row",
        error: String(err),
        traceId: row.trace_id,
        ts: new Date().toISOString()
      }));
    }
  };
}

let serverLogger = serverLoggerFactory(); // fallback

(async () => {
  try {
    const persist = await createPersistFn();
    serverLogger = serverLoggerFactory({ persist, environment: process.env.NODE_ENV });
    writeStdout("[logger-wiring] persisted serverLogger wired");
  } catch (e) {
    serverLogger.error("[logger-wiring] failed to wire persisted serverLogger", String(e));
  }
})();

export { serverLogger };
