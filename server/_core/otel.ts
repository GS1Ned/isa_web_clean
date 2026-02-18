import { diag, DiagLogLevel } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

import { serverLogger } from "./logger-wiring";

let sdk: NodeSDK | null = null;
let startOnce: Promise<void> | null = null;

function resolveTracesEndpoint(): string | null {
  const traces = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  if (traces && traces.trim()) return traces.trim();

  const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!base || !base.trim()) return null;

  const trimmed = base.trim().replace(/\/$/, "");
  return trimmed.endsWith("/v1/traces") ? trimmed : `${trimmed}/v1/traces`;
}

function setupDiagLogger() {
  // Avoid console-based diagnostics; route errors through ISA logger.
  diag.setLogger(
    {
      error: (msg: unknown, ...args: unknown[]) => {
        serverLogger.error(String(msg), {
          context: "[otel.diag] error",
          args: args.map(a => String(a)).slice(0, 8),
        });
      },
      warn: (msg: unknown, ...args: unknown[]) => {
        serverLogger.warn(String(msg), {
          context: "[otel.diag] warn",
          args: args.map(a => String(a)).slice(0, 8),
        });
      },
      info: () => {},
      debug: () => {},
      verbose: () => {},
    },
    DiagLogLevel.ERROR
  );
}

export async function initOtel(): Promise<{
  enabled: boolean;
  traces_endpoint?: string;
  reason: string;
}> {
  const enabled = process.env.ISA_OTEL_ENABLED === "true";
  if (!enabled) return { enabled: false, reason: "disabled" };

  const tracesEndpoint = resolveTracesEndpoint();
  if (!tracesEndpoint) return { enabled: false, reason: "missing_otlp_endpoint" };

  if (sdk) return { enabled: true, traces_endpoint: tracesEndpoint, reason: "already_started" };

  if (!startOnce) {
    startOnce = (async () => {
      try {
        setupDiagLogger();

        const exporter = new OTLPTraceExporter({ url: tracesEndpoint });
        const resource = resourceFromAttributes({
          [SemanticResourceAttributes.SERVICE_NAME]:
            process.env.OTEL_SERVICE_NAME || "isa_web",
          [SemanticResourceAttributes.SERVICE_VERSION]:
            process.env.ISA_SERVICE_VERSION ||
            process.env.npm_package_version ||
            "unknown",
        });

        sdk = new NodeSDK({
          resource,
          traceExporter: exporter,
          instrumentations: [getNodeAutoInstrumentations()],
        });

        await sdk.start();
        serverLogger.info("[otel] started", { tracesEndpoint });

        const shutdown = async (signal: string) => {
          try {
            await sdk?.shutdown();
            serverLogger.info("[otel] shutdown", { signal });
          } catch (e) {
            serverLogger.error(e, { context: "[otel] shutdown failed", signal });
          }
        };

        process.once("SIGTERM", () => void shutdown("SIGTERM"));
        process.once("SIGINT", () => void shutdown("SIGINT"));
      } catch (e) {
        // Do not throw: telemetry must never break server start.
        serverLogger.error(e, { context: "[otel] init failed" });
        sdk = null;
      }
    })();
  }

  await startOnce;
  return sdk
    ? { enabled: true, traces_endpoint: tracesEndpoint, reason: "started" }
    : { enabled: false, reason: "init_failed" };
}
