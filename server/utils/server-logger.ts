/**
 * server/utils/server-logger.ts
 * Lightweight server logger shim that emits structured JSON and supports
 * an optional persist function injection.
 *
 * NOTE: The persist function is a no-op by default. To persist to error_ledger,
 * wire a persist function at server startup that does an insert into your DB.
 */
import crypto from "crypto";

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

    try {
      console.error(JSON.stringify({ level: "error", traceId, payload, meta: metaObj, ts: row.created_at }));
    } catch {
      console.error("[error]", payload.message ?? JSON.stringify(payload));
    }

    try {
      await persist(row);
    } catch (e) {
      try {
        console.error(JSON.stringify({ level: "error", msg: "persist failed", err: String(e), traceId }));
      } catch {
        console.error("[error] persist failed", e);
      }
    }

    return traceId;
  }

  async function warn(warnMsg: unknown, meta?: unknown) {
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    const traceId = (metaObj as any).traceId ?? crypto.randomUUID();
    try {
      console.warn(JSON.stringify({ level: "warn", traceId, message: String(warnMsg), meta: metaObj, ts: nowIso() }));
    } catch {
      console.warn("[warn]", warnMsg);
    }
    return traceId;
  }

  function info(msg: unknown, meta?: unknown) {
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    if (process.env.NODE_ENV !== "production") {
      console.log("[info]", msg, metaObj);
    } else {
      console.log(JSON.stringify({ level: "info", message: String(msg), meta: metaObj, ts: nowIso() }));
    }
  }

  return { error, warn, info };
};

export const serverLogger = serverLoggerFactory();
