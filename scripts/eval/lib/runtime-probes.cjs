const { percentile } = require("./common.cjs");

async function measureRuntimeProbe(options) {
  const probeId = String(options?.probeId || "").trim();
  const fn = options?.fn;
  const warmups = Number.isInteger(options?.warmups) ? options.warmups : 1;
  const runs = Number.isInteger(options?.runs) ? options.runs : 7;

  if (!probeId) {
    throw new Error("runtime probe requires non-empty probeId");
  }
  if (typeof fn !== "function") {
    throw new Error(`runtime probe "${probeId}" requires fn function`);
  }
  if (warmups < 0 || runs <= 0) {
    throw new Error(`runtime probe "${probeId}" requires warmups >= 0 and runs > 0`);
  }

  for (let i = 0; i < warmups; i += 1) {
    await fn();
  }

  const samples = [];
  for (let i = 0; i < runs; i += 1) {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    const elapsedMs = Number(end - start) / 1_000_000;
    samples.push(elapsedMs);
  }

  return {
    p50_ms: Number(percentile(samples, 0.5).toFixed(4)),
    p95_ms: Number(percentile(samples, 0.95).toFixed(4)),
    samples: runs,
    measurement_mode: "runtime",
    runtime_probe_id: probeId,
  };
}

module.exports = {
  measureRuntimeProbe,
};
