#!/usr/bin/env node
/**
 * Test Report Aggregator
 * Combines unit and integration test results into a summary report
 */

import fs from 'fs';
import path from 'path';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


interface TestReport {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  startTime?: number;
  testResults?: Array<{
    name: string;
    status: string;
    duration?: number;
  }>;
}

interface SummaryReport {
  meta: {
    generated_at: string;
    framework: string;
  };
  status: 'pass' | 'fail';
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  pass_rate: number;
  thresholds: {
    min_pass_rate: number;
  };
  suites: {
    unit: TestReport | null;
    integration: TestReport | null;
  };
}

const args = process.argv.slice(2);
const inputs: Record<string, string> = {};
let outputPath = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) {
    const [key, value] = args[i + 1].split(':');
    inputs[key] = value;
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    outputPath = args[i + 1];
    i++;
  }
}

if (!outputPath) {
  cliErr('Error: --output is required');
  process.exit(1);
}

function readReport(filePath: string): TestReport | null {
  try {
    if (!fs.existsSync(filePath)) {
      cliErr(`Warning: ${filePath} does not exist`);
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    cliErr(`Error reading ${filePath}:`, error);
    return null;
  }
}

const unitReport = inputs.unit ? readReport(inputs.unit) : null;
const integrationReport = inputs.integration ? readReport(inputs.integration) : null;

const total = (unitReport?.numTotalTests || 0) + (integrationReport?.numTotalTests || 0);
const passed = (unitReport?.numPassedTests || 0) + (integrationReport?.numPassedTests || 0);
const failed = (unitReport?.numFailedTests || 0) + (integrationReport?.numFailedTests || 0);
const skipped = (unitReport?.numPendingTests || 0) + (integrationReport?.numPendingTests || 0);
const passRate = total > 0 ? (passed / total) * 100 : 0;

const summary: SummaryReport = {
  meta: {
    generated_at: new Date().toISOString(),
    framework: 'vitest'
  },
  status: failed === 0 ? 'pass' : 'fail',
  total,
  passed,
  failed,
  skipped,
  duration_ms: 0, // Vitest doesn't provide total duration in JSON reporter
  pass_rate: parseFloat(passRate.toFixed(2)),
  thresholds: {
    min_pass_rate: 90.0
  },
  suites: {
    unit: unitReport,
    integration: integrationReport
  }
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

cliOut(`Summary report written to ${outputPath}`);
cliOut(`Total: ${total}, Passed: ${passed}, Failed: ${failed}, Pass Rate: ${passRate.toFixed(1)}%`);

process.exit(failed > 0 ? 1 : 0);
