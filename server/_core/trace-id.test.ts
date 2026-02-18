import { describe, it, expect, vi } from "vitest";

import { traceIdMiddleware, TRACE_ID_HEADER } from "./trace-id";
import { getRequestTraceId, runWithRequestContext } from "./request-context";
import { serverLoggerFactory } from "../utils/server-logger";

function makeReq(headers: Record<string, string>) {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );
  return {
    headers: lower,
    get(name: string) {
      return lower[name.toLowerCase()];
    },
  } as any;
}

describe("trace id propagation", () => {
  it("uses incoming x-trace-id and exposes it via ALS", () => {
    const incoming = "d2b7a2d4-76c4-4e2a-8b9f-7a50e0f7e2d1";
    const req = makeReq({ [TRACE_ID_HEADER]: incoming });
    const setHeader = vi.fn();
    const res = { setHeader } as any;

    let seen: string | undefined;
    traceIdMiddleware(req, res, () => {
      seen = getRequestTraceId();
    });

    const expected = incoming.toLowerCase();
    expect(setHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, expected);
    expect((req as any).traceId).toBe(expected);
    expect(seen).toBe(expected);
  });

  it("falls back to traceparent when x-trace-id is missing", () => {
    // Example traceparent from W3C spec (trace-id is 32 hex chars)
    const traceparent =
      "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    const req = makeReq({ traceparent });
    const setHeader = vi.fn();
    const res = { setHeader } as any;

    let seen: string | undefined;
    traceIdMiddleware(req, res, () => {
      seen = getRequestTraceId();
    });

    const expected = "4bf92f3577b34da6a3ce929d0e0e4736";
    expect(setHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, expected);
    expect((req as any).traceId).toBe(expected);
    expect(seen).toBe(expected);
  });

  it("serverLoggerFactory uses request trace id when meta.traceId is not set", async () => {
    const logger = serverLoggerFactory();
    const traceId = "c4d3f2a1-0000-4000-8000-111111111111";

    await runWithRequestContext({ traceId }, async () => {
      const got = await logger.error(new Error("boom"));
      expect(got).toBe(traceId);
    });
  });
});

