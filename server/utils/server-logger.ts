/**
 * server/utils/server-logger.ts
 * Lightweight server logger shim that emits structured JSON and supports
 * an optional persist function injection.
 *
 * NOTE: The persist function is a no-op by default. To persist to error_ledger,
 * wire a persist function at server startup that does an insert into your DB.
 */
 import crypto from "crypto";
import util from "util";

type PersistFn = (row: {
  trace_id: string;
  created_at: string;
  error_code?: string;
  classification?: string;
  commit_sha?: string | null;
  branch?: string | null;
  environment?: string | null;
  affected_files?: unknown;
  error_payload: unknown;
  failing_inputs?: unknown;
}) => Promise<void> | void;

export const DEFAULT_PERSIST_FN: PersistFn = async () => {};

function nowIso(): string {
  return new Date().toISOString();
}

function safeStringify(v: unknown) {
  try {
    return JSON.parse(JSON.stringify(v));
  } catch {
    try {
      return String(v);
    } catch {
      return null;
    }
  }
}

export const serverLoggerFactory = (opts?: { persist?: PersistFn; environment?: string }) => {
  const persist = opts?.persist ?? DEFAULT_PERSIST_FN;
  const environment = opts?.environment ?? process.env.NODE_ENV ?? "unknown";
  const silent =
    process.env.ISA_TEST_SILENT === "true" ||
    process.env.NODE_ENV === "test" ||
    process.env.VITEST === "true";

  function writeStdout(line: string) {
    if (silent) return;
    process.stdout.write(line.endsWith("\n") ? line : `${line}\n`);
  }

  function writeStderr(line: string) {
    if (silent) return;
    process.stderr.write(line.endsWith("\n") ? line : `${line}\n`);
  }

  async function error(err: unknown, meta?: unknown) {
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    const traceId = (metaObj as any).traceId ?? crypto.randomUUID();
    const payload =
      err && typeof err === "object" && "message" in (err as any)
        ? {
            name: (err as any).name ?? "Error",
            message: (err as any).message ?? String(err),
            stack: (err as any).stack ?? undefined,
          }
        : { message: String(err) };

    const row = {
      trace_id: traceId,
      created_at: nowIso(),
      error_code: (metaObj as any).code ?? payload.name ?? "ERROR",
      classification: (metaObj as any).classification ?? "deterministic",
      commit_sha: (metaObj as any).commitSha ?? null,
      branch: (metaObj as any).branch ?? null,
      environment,
      affected_files: safeStringify((metaObj as any).affectedFiles ?? null),
      error_payload: safeStringify({ payload, meta: metaObj }),
      failing_inputs: safeStringify((metaObj as any).failingInputs ?? null),
    };

    if (!silent) {
      try {
        writeStderr(JSON.stringify({ level: "error", traceId, payload, meta: metaObj, ts: row.created_at }));
      } catch {
        writeStderr(util.format("[error] %s", payload.message ?? JSON.stringify(payload)));
      }

      try {
        await persist(row);
      } catch (e) {
        try {
          writeStderr(JSON.stringify({ level: "error", msg: "persist failed", err: String(e), traceId }));
        } catch {
          writeStderr(util.format("[error] persist failed %s", String(e)));
        }
      }
    }

    return traceId;
  }

  async function warn(warnMsg: unknown, meta?: unknown) {
    if (silent) return crypto.randomUUID();
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    const traceId = (metaObj as any).traceId ?? crypto.randomUUID();
    try {
      writeStderr(JSON.stringify({ level: "warn", traceId, message: String(warnMsg), meta: metaObj, ts: nowIso() }));
    } catch {
      writeStderr(util.format("[warn] %s", String(warnMsg)));
    }
    return traceId;
  }

  function info(msg: unknown, meta?: unknown) {
    if (silent) return;
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    if (process.env.NODE_ENV !== "production") {
      writeStdout(util.format("[info] %s %s", String(msg), Object.keys(metaObj).length ? JSON.stringify(metaObj) : "{}"));
    } else {
      writeStdout(JSON.stringify({ level: "info", message: String(msg), meta: metaObj, ts: nowIso() }));
    }
  }

  return { error, warn, info };
};

export const serverLogger = serverLoggerFactory();
