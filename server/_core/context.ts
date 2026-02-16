import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import crypto from "node:crypto";
import { getRequestTraceId } from "./request-context";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  traceId: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const headerTraceId = opts.req.headers["x-trace-id"];
  const traceId =
    getRequestTraceId() ??
    (typeof headerTraceId === "string" ? headerTraceId : undefined) ??
    crypto.randomUUID();

  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    traceId,
  };
}
