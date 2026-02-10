import pino from 'pino';
import crypto from 'crypto';

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

const isProduction = process.env.NODE_ENV === 'production';

const pinoLogger = pino({
  level: isProduction ? 'info' : 'trace',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
        level: isProduction ? 'error' : 'trace',
      },
      {
        target: 'pino-loki',
        options: {
          batching: true,
          interval: 5,
          host: 'http://loki:3100',
          labels: { job: 'node-app' },
        },
        level: 'info',
      },
    ],
  },
});

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
  const environment = opts?.environment ?? process.env.NODE_ENV ?? 'unknown';

  async function error(err: unknown, meta?: unknown) {
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    const traceId = (metaObj as any).traceId ?? crypto.randomUUID();
    const payload =
      err && typeof err === 'object' && 'message' in (err as any)
        ? {
            name: (err as any).name ?? 'Error',
            message: (err as any).message ?? String(err),
            stack: (err as any).stack ?? undefined,
          }
        : { message: String(err) };

    const row = {
      trace_id: traceId,
      created_at: nowIso(),
      error_code: (metaObj as any).code ?? payload.name ?? 'ERROR',
      classification: (metaObj as any).classification ?? 'deterministic',
      commit_sha: (metaObj as any).commitSha ?? null,
      branch: (metaObj as any).branch ?? null,
      environment,
      affected_files: safeStringify((metaObj as any).affectedFiles ?? null),
      error_payload: safeStringify({ payload, meta: metaObj }),
      failing_inputs: safeStringify((metaObj as any).failingInputs ?? null),
    };

    pinoLogger.error({ traceId, payload, meta }, (err as Error)?.message || String(err));

    try {
      await persist(row);
    } catch (e) {
      pinoLogger.error({ err: e, traceId }, 'Persist function failed');
    }

    return traceId;
  }

  async function warn(warnMsg: unknown, meta?: unknown) {
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    const traceId = (metaObj as any).traceId ?? crypto.randomUUID();
    pinoLogger.warn({ traceId, meta: metaObj }, String(warnMsg));
    return traceId;
  }

  function info(msg: unknown, meta?: unknown) {
    const metaObj = (typeof meta === 'object' && meta !== null ? meta : {}) as Record<string, unknown>;
    pinoLogger.info({ meta: metaObj }, String(msg));
  }

  return { error, warn, info };
};

export const serverLogger = serverLoggerFactory();
