import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { runWithRequestContext } from "./request-context";

export const TRACE_ID_HEADER = "x-trace-id";

function isAllZerosHex(hex: string): boolean {
  return /^0+$/.test(hex);
}

function parseTraceparent(header: string | undefined | null): string | null {
  if (!header) return null;
  const value = header.split(",")[0]?.trim();
  if (!value) return null;

  // W3C traceparent: version-traceid-spanid-flags
  const parts = value.split("-");
  if (parts.length !== 4) return null;

  const traceId = parts[1];
  if (!/^[0-9a-f]{32}$/i.test(traceId)) return null;
  if (isAllZerosHex(traceId)) return null;
  return traceId.toLowerCase();
}

function sanitizeTraceId(header: string | undefined | null): string | null {
  if (!header) return null;
  const value = header.split(",")[0]?.trim();
  if (!value) return null;
  if (value.length > 64) return null;

  // UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  ) {
    return value.toLowerCase();
  }

  // OTel trace id (32 hex chars)
  if (/^[0-9a-f]{32}$/i.test(value) && !isAllZerosHex(value)) {
    return value.toLowerCase();
  }

  // Conservative fallback (allows correlation IDs from upstream systems)
  if (/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value)) {
    return value;
  }

  return null;
}

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingTraceId = sanitizeTraceId(req.get(TRACE_ID_HEADER));
  const traceparentTraceId = parseTraceparent(req.get("traceparent"));

  const traceId = incomingTraceId ?? traceparentTraceId ?? crypto.randomUUID();

  res.setHeader(TRACE_ID_HEADER, traceId);
  (req as any).traceId = traceId;

  runWithRequestContext({ traceId }, () => next());
}

