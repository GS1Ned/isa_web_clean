/**
 * Evaluation Dashboard - Admin Page for Ask ISA Quality Testing
 * 
 * Allows admins to run golden set tests and view evaluation results.
 * Provides insights into Ask ISA performance and identifies regressions.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { AuthorityBadge, AuthorityLegend } from "@/components/AuthorityBadge";
import type { AuthorityLevel } from "@/components/AuthorityBadge";

// Golden set categories
const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'csrd_esrs', label: 'CSRD/ESRS' },
  { id: 'eudr', label: 'EUDR' },
  { id: 'espr_dpp', label: 'ESPR/DPP' },
  { id: 'csddd', label: 'CSDDD' },
  { id: 'gs1_standards', label: 'GS1 Standards' },
  { id: 'cross_regulation', label: 'Cross-Regulation' },
];

const DIFFICULTY_LEVELS = [
  { id: 'all', label: 'All Levels' },
  { id: 'basic', label: 'Basic' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

interface TestResult {
  testCaseId: string;
  question: string;
  category: string;
  difficulty: string;
  passed: boolean;
  score: number;
  metrics: {
    keywordCoverage: number;
    citationCount: number;
    authorityScore: number;
    claimVerificationRate: number;
    responseTime: number;
  };
  issues: string[];
  answer?: string;
  sources?: Array<{
    title: string;
    authorityLevel: AuthorityLevel;
  }>;
}

interface EvaluationReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScore: number;
  averageMetrics: {
    keywordCoverage: number;
    citationCount: number;
    authorityScore: number;
    claimVerificationRate: number;
    responseTime: number;
  };
  categoryBreakdown: Record<string, {
    total: number;
    passed: number;
    score: number;
  }>;
  difficultyBreakdown: Record<string, {
    total: number;
    passed: number;
    score: number;
  }>;
  results: TestResult[];
  regressions: string[];
  improvements: string[];
}

export default function EvaluationDashboard() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is only accessible to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Simulated evaluation run (in production, this would call the backend)
  const runEvaluation = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentReport(null);

    // Simulate progress
    const totalSteps = 41; // Number of golden set test cases
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(Math.round((i / totalSteps) * 100));
    }

    // Generate mock report (in production, this comes from backend)
    const mockReport: EvaluationReport = {
      timestamp: new Date().toISOString(),
      totalTests: 41,
      passedTests: 35,
      failedTests: 6,
      overallScore: 0.85,
      averageMetrics: {
        keywordCoverage: 0.78,
        citationCount: 3.2,
        authorityScore: 0.72,
        claimVerificationRate: 0.81,
        responseTime: 2340,
      },
      categoryBreakdown: {
        csrd_esrs: { total: 8, passed: 7, score: 0.88 },
        eudr: { total: 7, passed: 6, score: 0.82 },
        espr_dpp: { total: 6, passed: 5, score: 0.79 },
        csddd: { total: 6, passed: 5, score: 0.83 },
        gs1_standards: { total: 7, passed: 6, score: 0.86 },
        cross_regulation: { total: 7, passed: 6, score: 0.84 },
      },
      difficultyBreakdown: {
        basic: { total: 14, passed: 13, score: 0.92 },
        intermediate: { total: 15, passed: 13, score: 0.84 },
        advanced: { total: 12, passed: 9, score: 0.76 },
      },
      results: [
        {
          testCaseId: 'csrd_1',
          question: 'What are the key disclosure requirements under CSRD for large companies?',
          category: 'csrd_esrs',
          difficulty: 'basic',
          passed: true,
          score: 0.92,
          metrics: {
            keywordCoverage: 0.85,
            citationCount: 4,
            authorityScore: 0.88,
            claimVerificationRate: 0.95,
            responseTime: 2100,
          },
          issues: [],
          sources: [
            { title: 'CSRD Directive 2022/2464', authorityLevel: 'official' },
            { title: 'EFRAG ESRS Set 1', authorityLevel: 'verified' },
          ],
        },
        {
          testCaseId: 'eudr_1',
          question: 'Which commodities are covered by EUDR?',
          category: 'eudr',
          difficulty: 'basic',
          passed: true,
          score: 0.95,
          metrics: {
            keywordCoverage: 0.92,
            citationCount: 3,
            authorityScore: 0.91,
            claimVerificationRate: 1.0,
            responseTime: 1800,
          },
          issues: [],
          sources: [
            { title: 'EUDR Regulation 2023/1115', authorityLevel: 'official' },
          ],
        },
        {
          testCaseId: 'cross_1',
          question: 'How do CSRD and EUDR requirements overlap for food companies?',
          category: 'cross_regulation',
          difficulty: 'advanced',
          passed: false,
          score: 0.58,
          metrics: {
            keywordCoverage: 0.55,
            citationCount: 2,
            authorityScore: 0.65,
            claimVerificationRate: 0.60,
            responseTime: 3200,
          },
          issues: [
            'Missing key overlap areas',
            'Insufficient cross-references',
            'Low claim verification rate',
          ],
          sources: [
            { title: 'CSRD Directive 2022/2464', authorityLevel: 'official' },
          ],
        },
      ],
      regressions: [
        'Cross-regulation queries show 5% decrease in accuracy',
        'Advanced difficulty questions have higher failure rate',
      ],
      improvements: [
        'Basic queries improved by 8% with hybrid search',
        'Authority score increased by 12% with new model',
      ],
    };

    setCurrentReport(mockReport);
    setIsRunning(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 dark:bg-green-900';
    if (score >= 0.6) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const filteredResults = currentReport?.results.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && r.difficulty !== selectedDifficulty) return false;
    return true;
  }) || [];

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Evaluation Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Test Ask ISA quality with the golden set evaluation harness
              </p>
            </div>
          </div>
          
          <Button
            onClick={runEvaluation}
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Run Evaluation
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Running golden set tests...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {currentReport && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(currentReport.overallScore)}`}>
                  {Math.round(currentReport.overallScore * 100)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Tests Passed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-3xl font-bold">{currentReport.passedTests}</span>
                  <span className="text-muted-foreground">/ {currentReport.totalTests}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-3xl font-bold">
                    {(currentReport.averageMetrics.responseTime / 1000).toFixed(1)}s
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Authority Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(currentReport.averageMetrics.authorityScore)}`}>
                  {Math.round(currentReport.averageMetrics.authorityScore * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content */}
      {currentReport && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Test Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      Individual test case results from the golden set
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map(lvl => (
                          <SelectItem key={lvl.id} value={lvl.id}>{lvl.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead className="w-24">Category</TableHead>
                        <TableHead className="w-24">Difficulty</TableHead>
                        <TableHead className="w-20 text-right">Score</TableHead>
                        <TableHead className="w-24 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result) => (
                        <TableRow key={result.testCaseId}>
                          <TableCell>
                            {result.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-md truncate">
                            {result.question}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {result.category.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                result.difficulty === 'basic' ? 'bg-green-100' :
                                result.difficulty === 'intermediate' ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}
                            >
                              {result.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${getScoreColor(result.score)}`}>
                              {Math.round(result.score * 100)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResult(result)}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Breakdown Tab */}
          <TabsContent value="breakdown">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>By Category</CardTitle>
                  <CardDescription>Performance breakdown by regulation category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(currentReport.categoryBreakdown).map(([cat, data]) => (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{cat.replace('_', ' ')}</span>
                          <span className={getScoreColor(data.score)}>
                            {data.passed}/{data.total} ({Math.round(data.score * 100)}%)
                          </span>
                        </div>
                        <Progress value={data.score * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Difficulty</CardTitle>
                  <CardDescription>Performance breakdown by question difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(currentReport.difficultyBreakdown).map(([diff, data]) => (
                      <div key={diff} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{diff}</span>
                          <span className={getScoreColor(data.score)}>
                            {data.passed}/{data.total} ({Math.round(data.score * 100)}%)
                          </span>
                        </div>
                        <Progress value={data.score * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Metrics Tab */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Average Metrics</CardTitle>
                <CardDescription>Detailed performance metrics across all tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className={`p-4 rounded-lg ${getScoreBg(currentReport.averageMetrics.keywordCoverage)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5" />
                      <span className="font-medium">Keyword Coverage</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(currentReport.averageMetrics.keywordCoverage)}`}>
                      {Math.round(currentReport.averageMetrics.keywordCoverage * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected keywords found in responses
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Avg Citations</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {currentReport.averageMetrics.citationCount.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sources cited per response
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${getScoreBg(currentReport.averageMetrics.authorityScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5" />
                      <span className="font-medium">Authority Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(currentReport.averageMetrics.authorityScore)}`}>
                      {Math.round(currentReport.averageMetrics.authorityScore * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Source reliability rating
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${getScoreBg(currentReport.averageMetrics.claimVerificationRate)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Claim Verification</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(currentReport.averageMetrics.claimVerificationRate)}`}>
                      {Math.round(currentReport.averageMetrics.claimVerificationRate * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Claims backed by citations
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Response Time</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {(currentReport.averageMetrics.responseTime / 1000).toFixed(1)}s
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average time to generate response
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Authority Level Legend</CardTitle>
                <CardDescription>Understanding source authority classifications</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthorityLegend />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Regressions
                  </CardTitle>
                  <CardDescription>Areas that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentReport.regressions.map((reg, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <span className="text-sm">{reg}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Improvements
                  </CardTitle>
                  <CardDescription>Recent positive changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentReport.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!currentReport && !isRunning && (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Evaluation Results</h3>
            <p className="text-muted-foreground mb-6">
              Run the evaluation harness to test Ask ISA against the golden set of 41 curated questions.
            </p>
            <Button onClick={runEvaluation} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Run Evaluation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedResult.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Test Result Details
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedResult.question}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics */}
              <div>
                <h4 className="font-medium mb-3">Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Keyword Coverage</span>
                    <span className={`font-medium ${getScoreColor(selectedResult.metrics.keywordCoverage)}`}>
                      {Math.round(selectedResult.metrics.keywordCoverage * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Citations</span>
                    <span className="font-medium">{selectedResult.metrics.citationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Authority Score</span>
                    <span className={`font-medium ${getScoreColor(selectedResult.metrics.authorityScore)}`}>
                      {Math.round(selectedResult.metrics.authorityScore * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Claim Verification</span>
                    <span className={`font-medium ${getScoreColor(selectedResult.metrics.claimVerificationRate)}`}>
                      {Math.round(selectedResult.metrics.claimVerificationRate * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sources */}
              {selectedResult.sources && selectedResult.sources.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Sources Used</h4>
                  <div className="space-y-2">
                    {selectedResult.sources.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm">{source.title}</span>
                        <AuthorityBadge level={source.authorityLevel} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {selectedResult.issues.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 text-red-600">Issues Found</h4>
                    <ul className="space-y-2">
                      {selectedResult.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
