/**
 * server/utils/server-logger.test.ts
 * Tests for serverLogger functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { serverLoggerFactory, DEFAULT_PERSIST_FN } from "./server-logger";

describe("serverLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("error logging", () => {
    it("should log error with trace ID", async () => {
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
      const logger = serverLoggerFactory();

      const traceId = await logger.error(new Error("Test error"));

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe("string");
      expect(stderrSpy).toHaveBeenCalled();

      stderrSpy.mockRestore();
    });

    it("should handle error with metadata", async () => {
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

    it("should call persist function when provided", async () => {
      const persistMock = vi.fn().mockResolvedValue(undefined);
      const logger = serverLoggerFactory({ persist: persistMock });

      await logger.error(new Error("Test error"));

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
    });

    it("should handle persist failures gracefully", async () => {
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
      const persistMock = vi.fn().mockRejectedValue(new Error("Persist failed"));
      const logger = serverLoggerFactory({ persist: persistMock });

      const traceId = await logger.error(new Error("Test error"));

      expect(traceId).toBeDefined();
      expect(persistMock).toHaveBeenCalled();
      expect(stderrSpy).toHaveBeenCalledTimes(2); // Original error + persist failure

      stderrSpy.mockRestore();
    });

    it("should handle non-Error objects", async () => {
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
      const logger = serverLoggerFactory();

      const traceId = await logger.error("String error message");

      expect(traceId).toBeDefined();
      expect(stderrSpy).toHaveBeenCalled();

      stderrSpy.mockRestore();
    });
  });

  describe("warn logging", () => {
    it("should log warning with trace ID", async () => {
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
      const logger = serverLoggerFactory();

      const traceId = await logger.warn("Test warning");

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe("string");
      expect(stderrSpy).toHaveBeenCalled();

      stderrSpy.mockRestore();
    });

    it("should handle warning with metadata", async () => {
      const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true as any);
      const logger = serverLoggerFactory();

      const traceId = await logger.warn("Test warning", { context: "test" });

      expect(traceId).toBeDefined();
      expect(stderrSpy).toHaveBeenCalled();

      stderrSpy.mockRestore();
    });
  });

  describe("info logging", () => {
    it("should log info in development mode", () => {
      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const logger = serverLoggerFactory();
      logger.info("Test info message");

      const firstChunk = String(stdoutSpy.mock.calls[0]?.[0] ?? "");
      expect(firstChunk).toContain("[info]");
      expect(firstChunk).toContain("Test info message");

      process.env.NODE_ENV = originalEnv;
      stdoutSpy.mockRestore();
    });

    it("should log JSON in production mode", () => {
      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const logger = serverLoggerFactory();
      logger.info("Test info message");

      expect(stdoutSpy).toHaveBeenCalled();
      const call = String(stdoutSpy.mock.calls[0][0] ?? "");
      expect(typeof call).toBe("string");
      expect(() => JSON.parse(call)).not.toThrow();

      process.env.NODE_ENV = originalEnv;
      stdoutSpy.mockRestore();
    });

    it("should handle info with metadata", () => {
      const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true as any);
      const logger = serverLoggerFactory();

      logger.info("Test info", { context: "test" });

      expect(stdoutSpy).toHaveBeenCalled();

      stdoutSpy.mockRestore();
    });
  });

  describe("factory options", () => {
    it("should use custom environment", async () => {
      const persistMock = vi.fn().mockResolvedValue(undefined);
      const logger = serverLoggerFactory({
        persist: persistMock,
        environment: "staging",
      });

      await logger.error(new Error("Test error"));

      expect(persistMock).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: "staging",
        })
      );
    });

    it("should use default persist function when not provided", async () => {
      const logger = serverLoggerFactory();

      // Should not throw
      await expect(logger.error(new Error("Test error"))).resolves.toBeDefined();
    });
  });
});
