/**
 * server/utils/server-logger.test.ts
 * Tests for serverLogger functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { serverLoggerFactory } from "./server-logger";

type EnvOverrides = Record<string, string | undefined>;

async function withEnv<T>(overrides: EnvOverrides, fn: () => T | Promise<T>): Promise<T> {
  const prev: EnvOverrides = {};
  for (const [key, value] of Object.entries(overrides)) {
    prev[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

const silentEnv: EnvOverrides = {
  ISA_TEST_SILENT: "true",
  VITEST: "true",
  NODE_ENV: "test",
};

const nonSilentBaseEnv: EnvOverrides = {
  ISA_TEST_SILENT: "false",
  VITEST: "false",
  NODE_ENV: "development",
};

describe("serverLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ISA_TEST_SILENT = "false";
  });

  afterEach(() => {
    if (originalSilent === undefined) {
      delete process.env.ISA_TEST_SILENT;
    } else {
      process.env.ISA_TEST_SILENT = originalSilent;
    }
  });

  describe("silent mode (default for unit tests)", () => {
    it("error should return a trace ID and not write or persist", async () => {
      await withEnv(silentEnv, async () => {
        const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
        const persistMock = vi.fn().mockResolvedValue(undefined);
        const logger = serverLoggerFactory({ persist: persistMock });

        const traceId = await logger.error(new Error("Test error"));

        expect(traceId).toBeDefined();
        expect(typeof traceId).toBe("string");
        expect(stderrSpy).not.toHaveBeenCalled();
        expect(persistMock).not.toHaveBeenCalled();

        stderrSpy.mockRestore();
      });
    });

    it("warn should return a trace ID and not write", async () => {
      await withEnv(silentEnv, async () => {
        const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
        const logger = serverLoggerFactory();

        const traceId = await logger.warn("Test warning");

        expect(traceId).toBeDefined();
        expect(typeof traceId).toBe("string");
        expect(stderrSpy).not.toHaveBeenCalled();

        stderrSpy.mockRestore();
      });
    });

    it("info should not write", async () => {
      await withEnv(silentEnv, async () => {
        const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
        const logger = serverLoggerFactory();

        logger.info("Test info message");

        expect(stdoutSpy).not.toHaveBeenCalled();
        stdoutSpy.mockRestore();
      });
    });
  });

  describe("non-silent mode", () => {
    describe("error logging", () => {
      it("should log error with trace ID", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();

          const traceId = await logger.error(new Error("Test error"));

          expect(traceId).toBeDefined();
          expect(typeof traceId).toBe("string");
          expect(stderrSpy).toHaveBeenCalled();

          stderrSpy.mockRestore();
        });
      });

      it("should handle error with metadata", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();

          const traceId = await logger.error(new Error("Test error"), {
            code: "TEST_ERROR",
            classification: "transient",
          });

          expect(traceId).toBeDefined();
          expect(stderrSpy).toHaveBeenCalled();

          stderrSpy.mockRestore();
        });
      });

      it("should call persist function when provided", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const persistMock = vi.fn().mockResolvedValue(undefined);
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory({ persist: persistMock });

          await logger.error(new Error("Test error"));

          expect(stderrSpy).toHaveBeenCalled();
          expect(persistMock).toHaveBeenCalledWith(
            expect.objectContaining({
              trace_id: expect.any(String),
              created_at: expect.any(String),
              error_code: "Error",
              classification: "deterministic",
              environment: expect.any(String),
              error_payload: expect.anything(),
            })
          );

          stderrSpy.mockRestore();
        });
      });

      it("should handle persist failures gracefully", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const persistMock = vi.fn().mockRejectedValue(new Error("Persist failed"));
          const logger = serverLoggerFactory({ persist: persistMock });

          const traceId = await logger.error(new Error("Test error"));

          expect(traceId).toBeDefined();
          expect(persistMock).toHaveBeenCalled();
          expect(stderrSpy).toHaveBeenCalledTimes(2); // Original error + persist failure

          stderrSpy.mockRestore();
        });
      });

      it("should handle non-Error objects", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();

          const traceId = await logger.error("String error message");

          expect(traceId).toBeDefined();
          expect(stderrSpy).toHaveBeenCalled();

          stderrSpy.mockRestore();
        });
      });
    });

    describe("warn logging", () => {
      it("should log warning with trace ID", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();

          const traceId = await logger.warn("Test warning");

          expect(traceId).toBeDefined();
          expect(typeof traceId).toBe("string");
          expect(stderrSpy).toHaveBeenCalled();

          stderrSpy.mockRestore();
        });
      });

      it("should handle warning with metadata", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();

          const traceId = await logger.warn("Test warning", { context: "test" });

          expect(traceId).toBeDefined();
          expect(stderrSpy).toHaveBeenCalled();

          stderrSpy.mockRestore();
        });
      });
    });

    describe("info logging", () => {
      it("should log info in development mode", async () => {
        await withEnv({ ...nonSilentBaseEnv, NODE_ENV: "development" }, async () => {
          const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();
          logger.info("Test info message");

          const firstChunk = String(stdoutSpy.mock.calls[0]?.[0] ?? "");
          expect(firstChunk).toContain("[info]");
          expect(firstChunk).toContain("Test info message");

          stdoutSpy.mockRestore();
        });
      });

      it("should log JSON in production mode", async () => {
        await withEnv({ ...nonSilentBaseEnv, NODE_ENV: "production" }, async () => {
          const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();
          logger.info("Test info message");

          expect(stdoutSpy).toHaveBeenCalled();
          const call = String(stdoutSpy.mock.calls[0][0] ?? "");
          expect(typeof call).toBe("string");
          expect(() => JSON.parse(call)).not.toThrow();

          stdoutSpy.mockRestore();
        });
      });

      it("should handle info with metadata", async () => {
        await withEnv(nonSilentBaseEnv, async () => {
          const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
          const logger = serverLoggerFactory();

          logger.info("Test info", { context: "test" });

          expect(stdoutSpy).toHaveBeenCalled();

          stdoutSpy.mockRestore();
        });
      });
    });
  });

  describe("factory options", () => {
    it("should use custom environment", async () => {
      await withEnv(nonSilentBaseEnv, async () => {
        const persistMock = vi.fn().mockResolvedValue(undefined);
        const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
        const logger = serverLoggerFactory({
          persist: persistMock,
          environment: "staging",
        });

        await logger.error(new Error("Test error"));

        expect(stderrSpy).toHaveBeenCalled();
        expect(persistMock).toHaveBeenCalledWith(
          expect.objectContaining({
            environment: "staging",
          })
        );

        stderrSpy.mockRestore();
      });
    });

    it("should use default persist function when not provided", async () => {
      const logger = serverLoggerFactory();

      // Should not throw
      await expect(logger.error(new Error("Test error"))).resolves.toBeDefined();
    });
  });
});
