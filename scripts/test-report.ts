import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type AssertionLocation = {
  line?: number;
  column?: number;
};

type AssertionResult = {
  title?: string;
  fullName?: string;
  status?: string;
  failureMessages?: string[];
  location?: AssertionLocation;
  ancestorTitles?: string[];
};

type TestSuiteResult = {
  name?: string;
  status?: string;
  assertionResults?: AssertionResult[];
};

type VitestJsonReport = {
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  numPendingTests?: number;
  numTodoTests?: number;
  numTotalTestSuites?: number;
  numPassedTestSuites?: number;
  numFailedTestSuites?: number;
  numPendingTestSuites?: number;
  testResults?: TestSuiteResult[];
};

type FailedTest = {
  phase: string;
  file: string;
  name: string;
  location?: string;
};

type PhaseSummary = {
  phase: string;
  totals: {
    tests: number;
    passed: number;
    failed: number;
    skipped: number;
    todo: number;
    suites: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
    };
  };
  failedTests: FailedTest[];
};

type AggregatedSummary = {
  generatedAt: string;
  phases: PhaseSummary[];
  totals: PhaseSummary["totals"];
  failedTests: FailedTest[];
};

type InputSpec = {
  phase: string;
  filePath: string;
};

const args = process.argv.slice(2);
const inputs: InputSpec[] = [];
let outputPath: string | undefined;

const usage = () =>
  "Usage: tsx scripts/test-report.ts --input <phase>:<file> [--input <phase>:<file> ...] --output <file>";

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--input") {
    const value = args[index + 1];
    if (!value) {
      throw new Error("Missing value for --input\n" + usage());
    }
    index += 1;
    const spec = parseInputSpec(value);
    inputs.push(spec);
  } else if (arg.startsWith("--input=")) {
    const spec = parseInputSpec(arg.slice("--input=".length));
    inputs.push(spec);
  } else if (arg === "--output") {
    const value = args[index + 1];
    if (!value) {
      throw new Error("Missing value for --output\n" + usage());
    }
    index += 1;
    outputPath = value;
  } else if (arg.startsWith("--output=")) {
    outputPath = arg.slice("--output=".length);
  } else if (arg === "--help" || arg === "-h") {
    console.log(usage());
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}\n${usage()}`);
  }
}

if (inputs.length === 0) {
  throw new Error("At least one --input value is required.\n" + usage());
}

if (!outputPath) {
  throw new Error("--output is required.\n" + usage());
}

const phases: PhaseSummary[] = inputs.map((input) => summarizePhase(input.phase, input.filePath));
const totals = mergeTotals(phases.map((phase) => phase.totals));
const failedTests = phases.flatMap((phase) => phase.failedTests);

const summary: AggregatedSummary = {
  generatedAt: new Date().toISOString(),
  phases,
  totals,
  failedTests,
};

writeFileSync(outputPath, JSON.stringify(summary, null, 2));

printHumanSummary(summary, outputPath);

function parseInputSpec(value: string): InputSpec {
  const delimiterIndex = value.indexOf(":");
  if (delimiterIndex <= 0) {
    throw new Error(`Invalid input spec: ${value}. Expected <phase>:<file>.`);
  }
  const phase = value.slice(0, delimiterIndex).trim();
  const filePath = value.slice(delimiterIndex + 1).trim();
  if (!phase || !filePath) {
    throw new Error(`Invalid input spec: ${value}. Expected <phase>:<file>.`);
  }
  return { phase, filePath };
}

function summarizePhase(phase: string, filePath: string): PhaseSummary {
  const content = readFileSync(filePath, "utf-8");
  const report = JSON.parse(content) as VitestJsonReport;

  const totals = {
    tests: report.numTotalTests ?? 0,
    passed: report.numPassedTests ?? 0,
    failed: report.numFailedTests ?? 0,
    skipped: report.numPendingTests ?? 0,
    todo: report.numTodoTests ?? 0,
    suites: {
      total: report.numTotalTestSuites ?? 0,
      passed: report.numPassedTestSuites ?? 0,
      failed: report.numFailedTestSuites ?? 0,
      skipped: report.numPendingTestSuites ?? 0,
    },
  };

  const failedTests: FailedTest[] = [];
  const testResults = report.testResults ?? [];
  for (const suite of testResults) {
    const fileName = suite.name ? path.normalize(suite.name) : "(unknown file)";
    const assertions = suite.assertionResults ?? [];
    for (const assertion of assertions) {
      if (assertion.status !== "failed") {
        continue;
      }
      const name = assertion.fullName ?? buildFullName(assertion) ?? "(unnamed test)";
      failedTests.push({
        phase,
        file: fileName,
        name,
        location: formatLocation(assertion.location),
      });
    }
  }

  return {
    phase,
    totals,
    failedTests,
  };
}

function buildFullName(assertion: AssertionResult): string | undefined {
  const title = assertion.title ?? "";
  const ancestors = assertion.ancestorTitles ?? [];
  const segments = [...ancestors, title].filter((segment) => segment && segment.length > 0);
  return segments.length > 0 ? segments.join(" > ") : undefined;
}

function formatLocation(location?: AssertionLocation): string | undefined {
  if (!location || typeof location.line !== "number") {
    return undefined;
  }
  const column = typeof location.column === "number" ? `:${location.column}` : "";
  return `${location.line}${column}`;
}

function mergeTotals(values: PhaseSummary["totals"][]): PhaseSummary["totals"] {
  return values.reduce(
    (accumulator, current) => ({
      tests: accumulator.tests + current.tests,
      passed: accumulator.passed + current.passed,
      failed: accumulator.failed + current.failed,
      skipped: accumulator.skipped + current.skipped,
      todo: accumulator.todo + current.todo,
      suites: {
        total: accumulator.suites.total + current.suites.total,
        passed: accumulator.suites.passed + current.suites.passed,
        failed: accumulator.suites.failed + current.suites.failed,
        skipped: accumulator.suites.skipped + current.suites.skipped,
      },
    }),
    {
      tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      todo: 0,
      suites: { total: 0, passed: 0, failed: 0, skipped: 0 },
    },
  );
}

function printHumanSummary(summary: AggregatedSummary, outputFile: string) {
  console.log("\nCI Test Report Summary");
  console.log("----------------------");
  for (const phase of summary.phases) {
    const totals = phase.totals;
    console.log(
      `${phase.phase}: ${totals.passed} passed, ${totals.failed} failed, ${totals.skipped} skipped, ${totals.todo} todo (${totals.tests} total tests)`,
    );
  }
  console.log(
    `Overall: ${summary.totals.passed} passed, ${summary.totals.failed} failed, ${summary.totals.skipped} skipped, ${summary.totals.todo} todo (${summary.totals.tests} total tests)`,
  );

  if (summary.failedTests.length > 0) {
    console.log("\nFailing tests:");
    for (const test of summary.failedTests) {
      const location = test.location ? `:${test.location}` : "";
      console.log(`- [${test.phase}] ${test.file}${location} :: ${test.name}`);
    }
  }

  console.log(`\nJSON report written to ${outputFile}`);
}
