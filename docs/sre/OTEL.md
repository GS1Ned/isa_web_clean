# OpenTelemetry (Baseline)

FACT
- ISA can emit traces via OpenTelemetry when explicitly enabled.
- Telemetry is opt-in to avoid surprises in development and CI.

## Configuration

Enable OTel:
- `ISA_OTEL_ENABLED=true`

Set an OTLP traces endpoint:
- Preferred: `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces`
- Alternative: `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` (ISA will append `/v1/traces`)

Optional:
- `OTEL_SERVICE_NAME=isa_web`
- `ISA_SERVICE_VERSION=<version>`

## Implementation Notes

FACT
- Initialization code lives in `server/_core/otel.ts`.
- Server start calls `initOtel()` from `server/_core/index.ts`.

RECOMMENDATION
- Keep telemetry failure-safe: initialization errors must never break server startup.
- Avoid console exporters and route diagnostics through `serverLogger`.

