/**
 * ISA Tracer — thin wrapper around the OpenTelemetry API.
 *
 * Provides `withSpan()` for instrumenting critical ISA decision paths without
 * coupling business logic directly to OTel primitives.  All calls are
 * failure-safe: if OTel is disabled or the tracer is unavailable the wrapped
 * function executes normally with no overhead.
 *
 * Usage:
 *   import { withSpan } from '../_core/tracer';
 *   const result = await withSpan('isa.ask_enhanced', { question: q }, async () => {
 *     return performLlmCall();
 *   });
 */

import { trace, SpanStatusCode, type Span } from "@opentelemetry/api";

const TRACER_NAME = "isa_web";

/**
 * Executes `fn` inside a named OTel span.  Attributes are set on span start;
 * errors are recorded and the span status is set to ERROR before re-throwing.
 *
 * @param spanName   Dot-namespaced span identifier, e.g. "isa.esrs_mapping.query"
 * @param attributes Key–value pairs attached to the span (string / number / boolean values only)
 * @param fn         Async function to execute inside the span
 */
export async function withSpan<T>(
  spanName: string,
  attributes: Record<string, string | number | boolean>,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer(TRACER_NAME);
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      for (const [key, value] of Object.entries(attributes)) {
        span.setAttribute(key, value);
      }
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}
