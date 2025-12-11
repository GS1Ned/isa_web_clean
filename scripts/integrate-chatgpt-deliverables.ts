#!/usr/bin/env tsx

/**
 * Integration Automation Script for ChatGPT Deliverables
 * 
 * This script automates the integration of code deliverables from ChatGPT:
 * 1. Extracts files from pasted content
 * 2. Validates for common issues
 * 3. Auto-fixes mechanical problems
 * 4. Runs tests and generates reports
 * 
 * Usage:
 *   pnpm integrate <pasted-content-file>
 *   pnpm integrate /home/ubuntu/upload/pasted_content_12.txt
 * 
 * Target: Reduce integration time from ~11 min to ~2 min per task
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ============================================================================
// Types
// ============================================================================

interface TaskDeliverable {
  taskId: string;
  taskName: string;
  files: FileDeliverable[];
}

interface FileDeliverable {
  path: string;
  content: string;
  lineStart: number;
  lineEnd: number;
}

interface ValidationIssue {
  file: string;
  line: number;
  type: "separator" | "unbalanced_braces" | "missing_import" | "truncation";
  severity: "error" | "warning";
  message: string;
  autoFixable: boolean;
}

interface IntegrationReport {
  tasks: TaskDeliverable[];
  validationIssues: ValidationIssue[];
  fixesApplied: string[];
  testsRun: TestResult[];
  totalTime: number;
  success: boolean;
}

interface TestResult {
  file: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  errors: string[];
}

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = "/home/ubuntu/isa_web";
const UPLOAD_DIR = "/home/ubuntu/upload";

const ISSUE_PATTERNS = {
  separator: /^[⸻═─]{3,}$/,
  importMissing: /^import.*from\s+["'](.+)["'];?$/,
  configConstant: /["']([A-Z_]+)["']/g,
};

// ============================================================================
// Module 1: File Extraction
// ============================================================================

/**
 * Extract task deliverables from pasted content file
 */
function extractDeliverables(contentPath: string): TaskDeliverable[] {
  const content = fs.readFileSync(contentPath, "utf-8");
  const lines = content.split("\n");
  
  const tasks: TaskDeliverable[] = [];
  let currentTask: TaskDeliverable | null = null;
  let currentFile: FileDeliverable | null = null;
  let fileContentLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect task boundary: "CGPT-XX: Task Name"
    const taskMatch = line.match(/^(CGPT-\d+):\s*(.+)$/);
    if (taskMatch) {
      // Save previous file if exists
      if (currentFile && currentTask) {
        currentFile.content = fileContentLines.join("\n");
        currentFile.lineEnd = i - 1;
        currentTask.files.push(currentFile);
        fileContentLines = [];
      }
      
      // Start new task
      currentTask = {
        taskId: taskMatch[1],
        taskName: taskMatch[2],
        files: [],
      };
      tasks.push(currentTask);
      currentFile = null;
      continue;
    }
    
    // Detect file boundary: "File N: /path/to/file.ts"
    const fileMatch = line.match(/^File \d+:\s*(.+)$/);
    if (fileMatch && currentTask) {
      // Save previous file if exists
      if (currentFile) {
        currentFile.content = fileContentLines.join("\n");
        currentFile.lineEnd = i - 1;
        currentTask.files.push(currentFile);
        fileContentLines = [];
      }
      
      // Start new file
      currentFile = {
        path: fileMatch[1],
        content: "",
        lineStart: i + 1,
        lineEnd: -1,
      };
      continue;
    }
    
    // Skip separator lines and "Files Created" headers
    if (line.match(/^[⸻═─]{3,}$/) || line.match(/^Files Created$/i)) {
      continue;
    }
    
    // Accumulate file content (skip empty separator lines)
    if (currentFile) {
      // Skip lines that are just separators
      if (!line.trim().match(/^[⸻═─]+$/)) {
        fileContentLines.push(line);
      }
    }
  }
  
  // Save last file
  if (currentFile && currentTask) {
    currentFile.content = fileContentLines.join("\n");
    currentFile.lineEnd = lines.length - 1;
    currentTask.files.push(currentFile);
  }
  
  return tasks;
}

// ============================================================================
// Module 2: Validation
// ============================================================================

/**
 * Validate extracted files for common issues
 */
function validateDeliverables(tasks: TaskDeliverable[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (const task of tasks) {
    for (const file of task.files) {
      const lines = file.content.split("\n");
      
      // Check for separator characters
      for (let i = 0; i < lines.length; i++) {
        if (ISSUE_PATTERNS.separator.test(lines[i].trim())) {
          issues.push({
            file: file.path,
            line: i + 1,
            type: "separator",
            severity: "error",
            message: `Invalid separator character found: "${lines[i].trim()}"`,
            autoFixable: true,
          });
        }
      }
      
      // Check for unbalanced braces (only for .ts/.tsx files)
      if (file.path.match(/\.(ts|tsx)$/)) {
        const openBraces = (file.content.match(/{/g) || []).length;
        const closeBraces = (file.content.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          issues.push({
            file: file.path,
            line: lines.length,
            type: "unbalanced_braces",
            severity: "error",
            message: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`,
            autoFixable: openBraces === closeBraces + 1, // Can fix if missing one closing brace
          });
        }
      }
      
      // Check for file truncation (ends mid-statement)
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine && !lastLine.match(/[;})\]]\s*$/) && file.path.match(/\.(ts|tsx)$/)) {
        issues.push({
          file: file.path,
          line: lines.length,
          type: "truncation",
          severity: "warning",
          message: "File may be truncated (doesn't end with closing punctuation)",
          autoFixable: false,
        });
      }
    }
  }
  
  return issues;
}

// ============================================================================
// Module 3: Auto-Fix
// ============================================================================

/**
 * Detect missing files referenced in imports
 */
function detectMissingFiles(tasks: TaskDeliverable[]): string[] {
  const missingFiles: string[] = [];
  const extractedPaths = new Set<string>();
  const referencedPaths = new Set<string>();
  
  // Collect all extracted file paths
  for (const task of tasks) {
    for (const file of task.files) {
      extractedPaths.add(file.path);
    }
  }
  
  // Scan for import statements and collect referenced paths
  for (const task of tasks) {
    for (const file of task.files) {
      const lines = file.content.split("\n");
      for (const line of lines) {
        const importMatch = line.match(/^import.*from\s+["'](.+)["'];?$/);
        if (importMatch) {
          const importPath = importMatch[1];
          // Convert relative imports to absolute paths
          if (importPath.startsWith(".")) {
            const fileDir = path.dirname(file.path);
            const resolvedPath = path.normalize(path.join(fileDir, importPath));
            // Add common extensions if not present
            const possiblePaths = [
              resolvedPath,
              resolvedPath + ".ts",
              resolvedPath + ".tsx",
              resolvedPath + "/index.ts",
              resolvedPath + "/index.tsx",
            ];
            for (const p of possiblePaths) {
              referencedPaths.add(p);
            }
          }
        }
      }
    }
  }
  
  // Find referenced but not extracted files
  for (const refPath of referencedPaths) {
    if (!extractedPaths.has(refPath)) {
      missingFiles.push(refPath);
    }
  }
  
  return missingFiles;
}

/**
 * Automatically fix common mechanical issues
 */
function autoFixIssues(tasks: TaskDeliverable[], issues: ValidationIssue[]): string[] {
  const fixesApplied: string[] = [];
  
  for (const task of tasks) {
    for (const file of task.files) {
      let content = file.content;
      let modified = false;
      
      // Fix: Remove separator lines
      const separatorIssues = issues.filter(
        (i) => i.file === file.path && i.type === "separator" && i.autoFixable
      );
      if (separatorIssues.length > 0) {
        const lines = content.split("\n");
        const filteredLines = lines.filter((line) => !ISSUE_PATTERNS.separator.test(line.trim()));
        content = filteredLines.join("\n");
        modified = true;
        fixesApplied.push(`${file.path}: Removed ${separatorIssues.length} separator line(s)`);
      }
      
      // Fix: Add missing closing brace
      const braceIssues = issues.filter(
        (i) => i.file === file.path && i.type === "unbalanced_braces" && i.autoFixable
      );
      if (braceIssues.length > 0) {
        content = content + "\n});\n";
        modified = true;
        fixesApplied.push(`${file.path}: Added missing closing brace`);
      }
      
      // Fix: Correct import paths (../../shared → ../../../shared for client files)
      const normalizedPath = file.path.startsWith("/") ? file.path.substring(1) : file.path;
      if (normalizedPath.startsWith("client/src/")) {
        const originalContent = content;
        let replacementCount = 0;
        content = content.replace(
          /from\s+["'](\.\.\/)+shared\/([^"']+)["']/g,
          (match, dots, sharedPath) => {
            replacementCount++;
            // Count directory depth from project root
            // For client/src/components/File.tsx: parts = [client, src, components, File.tsx]
            // Need 3 levels up: ../../../ (one for each of: File.tsx, components, src)
            const pathParts = normalizedPath.split("/");
            const depth = pathParts.length - 1; // -1 to exclude filename
            const correctDots = "../".repeat(depth);
            return `from "${correctDots}shared/${sharedPath}"`;
          }
        );
        if (content !== originalContent && replacementCount > 0) {
          modified = true;
          fixesApplied.push(`${file.path}: Fixed ${replacementCount} import path(s) to shared/`);
        }
      }
      
      // Fix: Convert JSX.Element to React.JSX.Element
      if (file.path.match(/\.(tsx)$/)) {
        const originalContent = content;
        content = content.replace(/:\s*JSX\.Element\s*{/g, ": React.JSX.Element {");
        if (content !== originalContent) {
          modified = true;
          fixesApplied.push(`${file.path}: Converted JSX.Element to React.JSX.Element`);
        }
      }
      
      // Fix: Add missing React import for JSX components
      if (file.path.match(/\.(tsx)$/) && content.includes("React.JSX.Element")) {
        const hasReactImport = /^import\s+.*React.*from\s+["']react["']/m.test(content);
        if (!hasReactImport) {
          // Add React import at the top after any initial comments
          const lines = content.split("\n");
          let insertIndex = 0;
          // Skip initial empty lines and comments
          while (insertIndex < lines.length && (lines[insertIndex].trim() === "" || lines[insertIndex].trim().startsWith("//"))) {
            insertIndex++;
          }
          lines.splice(insertIndex, 0, "import * as React from \"react\";");
          content = lines.join("\n");
          modified = true;
          fixesApplied.push(`${file.path}: Added missing React import`);
        }
      }
      
      // Update file content if modified
      if (modified) {
        file.content = content;
      }
    }
  }
  
  return fixesApplied;
}

// ============================================================================
// Module 4: File Writing
// ============================================================================

/**
 * Write extracted and fixed files to project directory
 */
function writeFiles(tasks: TaskDeliverable[]): void {
  for (const task of tasks) {
    console.log(`\n📦 Writing files for ${task.taskId}: ${task.taskName}`);
    
    for (const file of task.files) {
      const fullPath = path.join(PROJECT_ROOT, file.path);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(fullPath, file.content, "utf-8");
      console.log(`  ✅ ${file.path} (${file.content.split("\n").length} lines)`);
    }
  }
}

// ============================================================================
// Module 5: Test Execution
// ============================================================================

/**
 * Run tests for integrated files
 */
function runTests(tasks: TaskDeliverable[]): TestResult[] {
  const results: TestResult[] = [];
  
  console.log("\n🧪 Running tests...\n");
  
  // Collect all test files
  const testFiles: string[] = [];
  for (const task of tasks) {
    for (const file of task.files) {
      if (file.path.match(/\.test\.(ts|tsx)$/)) {
        testFiles.push(file.path);
      }
    }
  }
  
  if (testFiles.length === 0) {
    console.log("  ⚠️  No test files found");
    return results;
  }
  
  // Run vitest for each test file
  for (const testFile of testFiles) {
    const startTime = Date.now();
    
    // Convert absolute path to relative path from PROJECT_ROOT
    const relativePath = testFile.startsWith("/") ? testFile.substring(1) : testFile;
    
    try {
      const output = execSync(
        `cd ${PROJECT_ROOT} && npx vitest run ${relativePath}`,
        { encoding: "utf-8" }
      );
      
      const duration = Date.now() - startTime;
      
      // Parse text output
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      const totalMatch = output.match(/\((\d+)\s+tests?\)/);
      
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const total = totalMatch ? parseInt(totalMatch[1]) : passed + failed;
      
      results.push({
        file: testFile,
        passed,
        failed,
        total,
        duration,
        errors: [],
      });
      
      const status = failed === 0 ? "✅" : "⚠️";
      console.log(`  ${status} ${testFile}: ${passed}/${total} passed`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      
      // When tests fail, vitest exits with error but still outputs results
      // Try to parse test counts from error output
      let passed = 0;
      let failed = 0;
      let total = 0;
      const errors: string[] = [];
      
      if (error && typeof error === "object" && "stdout" in error) {
        const output = String((error as { stdout?: unknown }).stdout || "");
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);
        
        passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        failed = failedMatch ? parseInt(failedMatch[1]) : 0;
        total = passed + failed;
        
        // Extract error messages
        const failLines = output.match(/FAIL.*$/gm);
        if (failLines) {
          errors.push(...failLines.slice(0, 3)); // First 3 failures
        }
      }
      
      results.push({
        file: testFile,
        passed,
        failed,
        total,
        duration,
        errors,
      });
      
      const status = failed > 0 ? "⚠️" : "❌";
      console.log(`  ${status} ${testFile}: ${passed}/${total} passed (${failed} failed)`);
    }
  }
  
  return results;
}

// ============================================================================
// Module 6: Reporting
// ============================================================================

/**
 * Generate integration report
 */
function generateReport(report: IntegrationReport): void {
  console.log("\n" + "=".repeat(80));
  console.log("📊 INTEGRATION REPORT");
  console.log("=".repeat(80));
  
  // Tasks summary
  console.log(`\n✅ Tasks Integrated: ${report.tasks.length}`);
  for (const task of report.tasks) {
    console.log(`   - ${task.taskId}: ${task.taskName} (${task.files.length} files)`);
  }
  
  // Validation issues
  console.log(`\n🔍 Validation Issues: ${report.validationIssues.length}`);
  if (report.validationIssues.length > 0) {
    const errors = report.validationIssues.filter((i) => i.severity === "error");
    const warnings = report.validationIssues.filter((i) => i.severity === "warning");
    console.log(`   - Errors: ${errors.length}`);
    console.log(`   - Warnings: ${warnings.length}`);
    console.log(`   - Auto-fixable: ${report.validationIssues.filter((i) => i.autoFixable).length}`);
  }
  
  // Fixes applied
  console.log(`\n🔧 Fixes Applied: ${report.fixesApplied.length}`);
  for (const fix of report.fixesApplied) {
    console.log(`   - ${fix}`);
  }
  
  // Test results
  const totalPassed = report.testsRun.reduce((sum, t) => sum + t.passed, 0);
  const totalFailed = report.testsRun.reduce((sum, t) => sum + t.failed, 0);
  const totalTests = totalPassed + totalFailed;
  
  console.log(`\n🧪 Test Results: ${totalPassed}/${totalTests} passed`);
  for (const test of report.testsRun) {
    const status = test.failed === 0 ? "✅" : "❌";
    console.log(`   ${status} ${test.file}: ${test.passed}/${test.total} passed (${test.duration}ms)`);
    
    if (test.errors.length > 0) {
      for (const error of test.errors) {
        console.log(`      ⚠️  ${error}`);
      }
    }
  }
  
  // Summary
  console.log(`\n⏱️  Total Time: ${(report.totalTime / 1000).toFixed(1)}s`);
  console.log(`\n${report.success ? "✅ Integration successful!" : "❌ Integration failed"}`);
  console.log("=".repeat(80) + "\n");
}

/**
 * Save report to file
 */
function saveReport(report: IntegrationReport, outputPath: string): void {
  const markdown = `# Integration Report

**Date:** ${new Date().toISOString()}
**Total Time:** ${(report.totalTime / 1000).toFixed(1)}s
**Status:** ${report.success ? "✅ Success" : "❌ Failed"}

## Tasks Integrated

${report.tasks.map((t) => `- **${t.taskId}**: ${t.taskName} (${t.files.length} files)`).join("\n")}

## Validation Issues

Total: ${report.validationIssues.length} (${report.validationIssues.filter((i) => i.severity === "error").length} errors, ${report.validationIssues.filter((i) => i.severity === "warning").length} warnings)

${report.validationIssues.map((i) => `- **${i.file}:${i.line}** [${i.severity}] ${i.message}`).join("\n")}

## Fixes Applied

${report.fixesApplied.map((f) => `- ${f}`).join("\n")}

## Test Results

Total: ${report.testsRun.reduce((sum, t) => sum + t.passed, 0)}/${report.testsRun.reduce((sum, t) => sum + t.total, 0)} passed

${report.testsRun.map((t) => `- **${t.file}**: ${t.passed}/${t.total} passed (${t.duration}ms)`).join("\n")}
`;
  
  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log(`📄 Report saved to: ${outputPath}\n`);
}

// ============================================================================
// Main CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("Usage: pnpm integrate <pasted-content-file>");
    console.error("Example: pnpm integrate /home/ubuntu/upload/pasted_content_12.txt");
    process.exit(1);
  }
  
  const contentPath = args[0];
  
  if (!fs.existsSync(contentPath)) {
    console.error(`Error: File not found: ${contentPath}`);
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  console.log("🚀 Starting ChatGPT Deliverable Integration\n");
  console.log(`📄 Input: ${contentPath}\n`);
  
  // Step 1: Extract deliverables
  console.log("📦 Extracting deliverables...");
  const tasks = extractDeliverables(contentPath);
  console.log(`   Found ${tasks.length} task(s) with ${tasks.reduce((sum, t) => sum + t.files.length, 0)} file(s)`);
  
  // Step 2: Detect missing files
  console.log("\n🔍 Detecting missing files...");
  const missingFiles = detectMissingFiles(tasks);
  if (missingFiles.length > 0) {
    console.log(`   ⚠️  Found ${missingFiles.length} missing file(s):`);
    missingFiles.forEach((f) => console.log(`      - ${f}`));
  } else {
    console.log(`   ✅ No missing files detected`);
  }
  
  // Step 3: Validate
  console.log("\n🔍 Validating files...");
  const issues = validateDeliverables(tasks);
  console.log(`   Found ${issues.length} issue(s)`);
  
  // Step 4: Auto-fix
  console.log("\n🔧 Applying auto-fixes...");
  const fixes = autoFixIssues(tasks, issues);
  console.log(`   Applied ${fixes.length} fix(es)`);
  if (fixes.length > 0) {
    fixes.forEach((f) => console.log(`      - ${f}`));
  }
  
  // Step 4: Write files
  writeFiles(tasks);
  
  // Step 5: Run tests
  const testResults = runTests(tasks);
  
  // Step 6: Generate report
  const totalTime = Date.now() - startTime;
  const success = testResults.every((t) => t.failed === 0) && testResults.length > 0;
  
  const report: IntegrationReport = {
    tasks,
    validationIssues: issues,
    fixesApplied: fixes,
    testsRun: testResults,
    totalTime,
    success,
  };
  
  generateReport(report);
  
  // Save report
  const reportPath = path.join(PROJECT_ROOT, "docs/agent_collaboration", `integration_report_${Date.now()}.md`);
  saveReport(report, reportPath);
  
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
