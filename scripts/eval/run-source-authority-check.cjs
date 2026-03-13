#!/usr/bin/env node

const { readJson, avg, writeJson } = require("./lib/common.cjs");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    fixtures: "data/evaluation/golden/source_authority/gs1_authority_cases_v1.json",
    out: "test-results/ci/source-authority-eval.json",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--fixtures") options.fixtures = args[++i];
    else if (arg === "--out") options.out = args[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function deriveCatalogAuthorityTierFromUrl(url) {
  if (!url) return "UNKNOWN";

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname === "eur-lex.europa.eu") return "EU";
    if (hostname === "ref.gs1.org" || hostname === "gs1.org" || hostname === "www.gs1.org") {
      return "GS1_Global";
    }
    if (/^gs1[a-z0-9-]*\.(org|nl|eu)$/.test(hostname)) return "GS1_MO";

    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

function main() {
  const options = parseArgs();
  const payload = readJson(options.fixtures);
  const cases = Array.isArray(payload.cases) ? payload.cases : [];

  if (!cases.length) {
    throw new Error(`No authority cases found in ${options.fixtures}`);
  }

  const perCase = cases.map((item) => {
    const actualAuthorityTier = deriveCatalogAuthorityTierFromUrl(item.url);
    const actualRole =
      actualAuthorityTier === "GS1_Global" || actualAuthorityTier === "EU"
        ? "normative_authority"
        : "canonical_technical_artifact";

    return {
      id: item.id,
      url: item.url,
      expectedAuthorityTier: item.expectedAuthorityTier,
      actualAuthorityTier,
      expectedRole: item.expectedRole,
      actualRole,
      authorityMatch: Number(actualAuthorityTier === item.expectedAuthorityTier),
      roleMatch: Number(actualRole === item.expectedRole),
      registrationGuardrail: Number(
        item.registrationRequired ? actualAuthorityTier === "UNKNOWN" : actualAuthorityTier !== "UNKNOWN"
      ),
    };
  });

  const metrics = {
    "source_authority.normative_domain_classification": Number(
      avg(
        perCase
          .filter((item) => item.expectedRole === "normative_authority")
          .map((item) => item.authorityMatch)
      ).toFixed(4)
    ),
    "source_authority.github_not_automatic_authority": Number(
      avg(
        perCase
          .filter((item) => item.expectedRole === "canonical_technical_artifact")
          .map((item) => item.authorityMatch)
      ).toFixed(4)
    ),
    "source_authority.registration_guardrail": Number(
      avg(perCase.map((item) => item.registrationGuardrail)).toFixed(4)
    ),
  };

  writeJson(options.out, {
    schema_version: "1.0.0",
    generated_at: new Date().toISOString(),
    dataset_id: payload.dataset_id || "unknown",
    fixtures: options.fixtures,
    metrics,
    cases: perCase,
    status: Object.values(metrics).every((value) => value === 1) ? "pass" : "warn",
  });

  process.stdout.write(`DONE=source_authority_eval_written:${options.out}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=source_authority_eval_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
