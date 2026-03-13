/**
 * Evaluation History Storage
 * 
 * File-based storage for evaluation reports to track Ask ISA quality over time.
 * Stores reports as JSON files in the evaluation-history directory.
 */

import fs from 'fs/promises';
import path from 'path';
import { serverLogger } from './utils/server-logger';

const HISTORY_DIR = path.join(process.cwd(), 'evaluation-history');

export interface EvaluationReport {
  id: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  averageScore: number;
  averageMetrics: {
    keywordCoverage: number;
    citationCount: number;
    authorityScore: number;
    claimVerificationRate: number;
    responseTime: number;
  };
  byCategory: Record<string, {
    total: number;
    passed: number;
    avgScore: number;
  }>;
  byDifficulty: Record<string, {
    total: number;
    passed: number;
    avgScore: number;
  }>;
  results: Array<{
    testCase: {
      id: string;
      question: string;
      category: string;
      difficulty: string;
    };
    passed: boolean;
    score: number;
    metrics: {
      keywordCoverage: number;
      citationCount: number;
      authorityScore: number;
      claimVerificationRate: number;
    };
    duration: number;
    issues: string[];
  }>;
  regressions: string[];
  improvements: string[];
  runBy?: string;
}

/**
 * Ensure the evaluation history directory exists
 */
async function ensureHistoryDir() {
  try {
    await fs.access(HISTORY_DIR);
  } catch {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
  }
}

/**
 * Save an evaluation report to file
 */
export async function saveEvaluationReport(report: EvaluationReport): Promise<void> {
  await ensureHistoryDir();
  
  const filename = `evaluation-${report.id}.json`;
  const filepath = path.join(HISTORY_DIR, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');
}

/**
 * Get all evaluation reports, sorted by timestamp (newest first)
 */
export async function getAllEvaluationReports(): Promise<EvaluationReport[]> {
  try {
    await ensureHistoryDir();
    
    const files = await fs.readdir(HISTORY_DIR);
    const jsonFiles = files.filter(f => f.startsWith('evaluation-') && f.endsWith('.json'));
    
    const reports: EvaluationReport[] = [];
    for (const file of jsonFiles) {
      const filepath = path.join(HISTORY_DIR, file);
      const content = await fs.readFile(filepath, 'utf-8');
      reports.push(JSON.parse(content));
    }
    
    // Sort by timestamp, newest first
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return reports;
  } catch (error) {
    serverLogger.error('Error loading evaluation reports:', error);
    return [];
  }
}

/**
 * Get a single evaluation report by ID
 */
export async function getEvaluationReport(id: string): Promise<EvaluationReport | null> {
  try {
    const filename = `evaluation-${id}.json`;
    const filepath = path.join(HISTORY_DIR, filename);
    
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    serverLogger.error(`Error loading evaluation report ${id}:`, error);
    return null;
  }
}

/**
 * Get the latest evaluation report
 */
export async function getLatestEvaluationReport(): Promise<EvaluationReport | null> {
  const reports = await getAllEvaluationReports();
  return reports.length > 0 ? reports[0] : null;
}

/**
 * Compare two evaluation reports to detect regressions
 */
export function compareReports(current: EvaluationReport, previous: EvaluationReport): {
  regressions: string[];
  improvements: string[];
} {
  const regressions: string[] = [];
  const improvements: string[] = [];
  
  // Compare overall score
  const scoreDiff = current.averageScore - previous.averageScore;
  if (scoreDiff < -0.05) {
    regressions.push(`Overall score decreased by ${Math.abs(scoreDiff * 100).toFixed(1)}%`);
  } else if (scoreDiff > 0.05) {
    improvements.push(`Overall score improved by ${(scoreDiff * 100).toFixed(1)}%`);
  }
  
  // Compare pass rate
  const currentPassRate = current.passed / current.totalTests;
  const previousPassRate = previous.passed / previous.totalTests;
  const passRateDiff = currentPassRate - previousPassRate;
  
  if (passRateDiff < -0.05) {
    regressions.push(`Pass rate decreased by ${Math.abs(passRateDiff * 100).toFixed(1)}%`);
  } else if (passRateDiff > 0.05) {
    improvements.push(`Pass rate improved by ${(passRateDiff * 100).toFixed(1)}%`);
  }
  
  // Compare metrics
  const metrics = [
    { key: 'keywordCoverage', label: 'Keyword coverage' },
    { key: 'citationCount', label: 'Citation count' },
    { key: 'authorityScore', label: 'Authority score' },
    { key: 'claimVerificationRate', label: 'Claim verification rate' },
  ] as const;
  
  for (const { key, label } of metrics) {
    const diff = current.averageMetrics[key] - previous.averageMetrics[key];
    if (diff < -0.05) {
      regressions.push(`${label} decreased by ${Math.abs(diff * 100).toFixed(1)}%`);
    } else if (diff > 0.05) {
      improvements.push(`${label} improved by ${(diff * 100).toFixed(1)}%`);
    }
  }
  
  return { regressions, improvements };
}
