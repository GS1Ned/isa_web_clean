import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { I18nProvider } from "./lib/i18n";

// Critical pages - loaded immediately
import Home from "./pages/Home";
import GettingStarted from "./pages/GettingStarted";
import HubHome from "./pages/HubHome";
import HubRegulations from "./pages/HubRegulations";
import HubRegulationDetail from "./pages/HubRegulationDetail";
import Features from "./pages/Features";

// Lazy-loaded pages - loaded on demand
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const FeaturesComparison = lazy(() => import("./pages/FeaturesComparison"));
const UseCases = lazy(() => import("./pages/UseCases"));
const Contact = lazy(() => import("./pages/Contact"));
const ComparisonTool = lazy(() => import("./pages/ComparisonTool"));
// Blog and FAQ pages available but not currently routed
const HubAbout = lazy(() => import("./pages/HubAbout"));
const HubNews = lazy(() => import("./pages/HubNews"));
const NewsHub = lazy(() => import("./pages/NewsHub"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const EventsOverview = lazy(() => import("./pages/EventsOverview"));
const HubCalendar = lazy(() => import("./pages/HubCalendar"));
const HubStandardsMapping = lazy(() => import("./pages/HubStandardsMapping"));
const HubEsrsGs1Mappings = lazy(() => import("./pages/HubEsrsGs1Mappings"));
const ToolsComplianceRoadmap = lazy(() => import("./pages/ToolsComplianceRoadmap"));
const GapAnalyzer = lazy(() => import("./pages/GapAnalyzer"));
const ImpactSimulator = lazy(() => import("./pages/ImpactSimulator"));
const DualCoreDemo = lazy(() => import("./pages/DualCoreDemo"));
const HubResources = lazy(() => import("./pages/HubResources"));
const HubImpactMatrix = lazy(() => import("./pages/HubImpactMatrix"));
const HubUserDashboard = lazy(() => import("./pages/HubUserDashboard"));
// AdminNewsPanel available but not currently routed
const AdminNewsPipelineManager = lazy(
  () => import("./pages/AdminNewsPipelineManager")
);
const NewsAdmin = lazy(() =>
  import("./pages/NewsAdmin").then(m => ({ default: m.NewsAdmin }))
);
const HubCompare = lazy(() => import("./pages/HubCompare"));
const HubCompareEnhanced = lazy(() => import("./pages/HubCompareEnhanced"));
const AdminCellarIngestion = lazy(() => import("./pages/AdminCellarIngestion"));
const AdminEUDRSeeder = lazy(() => import("./pages/AdminEUDRSeeder"));
const AdminCellarSyncMonitor = lazy(
  () => import("./pages/AdminCellarSyncMonitor")
);
const AdvisoryDashboard = lazy(() => import("./pages/AdvisoryDashboard"));
const AdvisoryExplorer = lazy(() => import("./pages/AdvisoryExplorer"));
const AdvisoryTraceability = lazy(() => import("./pages/AdvisoryTraceability")
);
const DatasetRegistry = lazy(() => import("./pages/DatasetRegistry"));
const AdvisoryReports = lazy(() => import("./pages/AdvisoryReports"));
const GovernanceDocuments = lazy(() => import("./pages/GovernanceDocuments"));
const AdminAnalyticsDashboard = lazy(
  () => import("./pages/AdminAnalyticsDashboard")
);
const AdminFeedbackDashboard = lazy(
  () => import("./pages/AdminFeedbackDashboard")
);
const ComplianceChecklistGenerator = lazy(
  () => import("./pages/ComplianceChecklistGenerator").then(m => ({ default: m.ComplianceChecklistGenerator }))
);
const AIGapAnalysisWizard = lazy(
  () => import("./pages/AIGapAnalysisWizard")
);
const ComplianceMonitoringDashboard = lazy(
  () => import("./pages/ComplianceMonitoringDashboard")
);
const IndustryTemplates = lazy(
  () => import("./pages/IndustryTemplates")
);
const ExternalAPIIntegration = lazy(
  () => import("./pages/ExternalAPIIntegration")
);
const AdminPromptOptimization = lazy(
  () => import("./pages/AdminPromptOptimization")
);
const EPCISUpload = lazy(() => import("./pages/EPCISUpload"));
const EPCISUploadEnhanced = lazy(() => import("./pages/EPCISUploadEnhanced"));
const EPCISSupplyChain = lazy(() => import("./pages/EPCISSupplyChain"));
const EPCISEUDRMap = lazy(() => import("./pages/EPCISEUDRMap"));
const BarcodeScanner = lazy(() => import("./pages/BarcodeScanner"));
const ComplianceReport = lazy(() => import("./pages/ComplianceReport"));
const ESRSDatapoints = lazy(() => import("./pages/ESRSDatapoints"));
const SupplyChainDashboard = lazy(() => import("./pages/SupplyChainDashboard"));
const RiskRemediation = lazy(() => import("./pages/RiskRemediation"));
const AdminEvidenceVerification = lazy(
  () => import("./pages/AdminEvidenceVerification")
);
const ComplianceScoreboard = lazy(() => import("./pages/ComplianceScoreboard"));
const ComplianceRoadmap = lazy(() => import("./pages/ComplianceRoadmap"));
const TemplateLibrary = lazy(() => import("./pages/TemplateLibrary"));
const AdminTemplateManager = lazy(() => import("./pages/AdminTemplateManager"));
const TemplateAnalyticsDashboard = lazy(
  () => import("./pages/TemplateAnalyticsDashboard")
);
const NotificationPreferences = lazy(() =>
  import("./pages/NotificationPreferences").then(m => ({
    default: m.NotificationPreferences,
  }))
);
const ExecutiveScorecard = lazy(() =>
  import("./pages/ExecutiveScorecard").then(m => ({
    default: m.ExecutiveScorecard,
  }))
);
const HubDutchInitiatives = lazy(() => import("./pages/HubDutchInitiatives"));
const HubDutchInitiativeDetail = lazy(
  () => import("./pages/HubDutchInitiativeDetail")
);
const AskISA = lazy(() => import("./pages/AskISA"));
const EvaluationDashboard = lazy(() => import("./pages/EvaluationDashboard"));
const AdminKnowledgeBase = lazy(() => import("./pages/AdminKnowledgeBase"));
const DataQuality = lazy(() => import("./pages/DataQuality"));
const CompareRegulations = lazy(() => import("./pages/CompareRegulations"));
const RegulatoryChangeLog = lazy(() => import("./pages/RegulatoryChangeLog"));
const AdvisoryDiff = lazy(() => import("./pages/AdvisoryDiff"));
const AdminScraperHealth = lazy(() => import("./pages/AdminScraperHealth"));
const AdvisoryDiffComparison = lazy(() => import("./pages/AdvisoryDiffComparison"));
const AdminMonitoring = lazy(() => import("./pages/AdminMonitoring"));
const SystemMonitoring = lazy(() => import("./pages/SystemMonitoring"));
const AdminCoverageAnalytics = lazy(() => import("./pages/admin/CoverageAnalytics"));
const AdminPipelineObservability = lazy(() => import("./pages/AdminPipelineObservability"));
const ObservabilityDashboard = lazy(() => import("./pages/admin/ObservabilityDashboard"));
const StakeholderDashboard = lazy(() => import("./pages/StakeholderDashboard").then(m => ({ default: m.StakeholderDashboard })));
const StandardsDirectory = lazy(() => import("./pages/StandardsDirectory").then(m => ({ default: m.StandardsDirectory })));
const StandardDetail = lazy(() => import("./pages/StandardDetail").then(m => ({ default: m.StandardDetail })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AttributeRecommender = lazy(() => import("./pages/AttributeRecommender"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const EsgTraceability = lazy(() => import("./pages/EsgTraceability"));
const EsgPriorities = lazy(() => import("./pages/EsgPriorities"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"//"} component={Home} />
      <Route path={"/hub/regulations/:id"} component={HubRegulationDetail} />
      <Route path={"/about"} component={About} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/features"} component={Features} />
      <Route path={"/features-comparison"} component={FeaturesComparison} />
      <Route path={"/use-cases"} component={UseCases} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/compare"} component={ComparisonTool} />
      <Route path="/" component={Home} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/about" component={About} />
      <Route path="/hub" component={HubHome} />
      <Route path="/hub/about" component={HubAbout} />
      <Route path="/hub/regulations" component={HubRegulations} />
      <Route path="/hub/news" component={HubNews} />
      <Route path="/news/:id" component={NewsDetail} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/events" component={EventsOverview} />
      <Route path="/news" component={NewsHub} />
      <Route path="/hub/calendar" component={HubCalendar} />
      <Route path="/hub/standards" component={StandardsDirectory} />
      <Route path="/hub/standards-mapping" component={HubStandardsMapping} />
      <Route path="/hub/esrs-gs1-mappings" component={HubEsrsGs1Mappings} />
      <Route path="/hub/esg-traceability" component={EsgTraceability} />
      <Route path="/hub/esg-priorities" component={EsgPriorities} />
      <Route path="/tools/compliance-roadmap" component={ToolsComplianceRoadmap} />
      <Route path="/tools/gap-analyzer" component={GapAnalyzer} />
      <Route path="/tools/impact-simulator" component={ImpactSimulator} />
      <Route path="/tools/dual-core" component={DualCoreDemo} />
      <Route path="/tools/attribute-recommender" component={AttributeRecommender} />
      <Route path="/hub/resources" component={HubResources} />
      <Route path="/hub/impact-matrix" component={HubImpactMatrix} />
      <Route path="/hub/dashboard" component={HubUserDashboard} />
      <Route path="/hub/regulations/compare" component={CompareRegulations} />
      <Route path="/hub/compare" component={HubCompareEnhanced} />
      <Route path="/hub/compare-legacy" component={HubCompare} />
      <Route path="/hub/esrs" component={ESRSDatapoints} />
      <Route path="/hub/esrs-datapoints" component={ESRSDatapoints} />
      <Route
        path="/hub/dutch-initiatives/:id"
        component={HubDutchInitiativeDetail}
      />
      <Route path="/hub/dutch-initiatives" component={HubDutchInitiatives} />
      <Route path="/ask" component={AskISA} />
      <Route path="/stakeholder-dashboard" component={StakeholderDashboard} />
      <Route path="/advisory/dashboard" component={AdvisoryDashboard} />
      <Route path="/advisory/explorer" component={AdvisoryExplorer} />
      <Route path="/advisory/traceability" component={AdvisoryTraceability} />
      <Route path="/admin/knowledge-base" component={AdminKnowledgeBase} />
      <Route path="/admin/evaluation" component={EvaluationDashboard} />
      <Route path="/admin/data-quality" component={DataQuality} />
      <Route path="/standards-directory/:id" component={StandardDetail} />
      <Route path="/standards-directory" component={StandardsDirectory} />
      <Route path="/regulatory-changes" component={RegulatoryChangeLog} />
      <Route path="/admin/regulatory-changes" component={RegulatoryChangeLog} />
      <Route path="/advisory/diff" component={AdvisoryDiff} />
      <Route path="/advisory/compare" component={AdvisoryDiffComparison} />
      <Route path="/dataset-registry" component={DatasetRegistry} />
      <Route path="/advisory-reports" component={AdvisoryReports} />
      <Route path="/governance-documents" component={GovernanceDocuments} />
      <Route path="/admin/monitoring" component={AdminMonitoring} />
      <Route path="/admin/system-monitoring" component={SystemMonitoring} />
      <Route path="/admin/coverage-analytics" component={AdminCoverageAnalytics} />
      <Route path="/admin/eudr-seeder" component={AdminEUDRSeeder} />
      <Route path="/admin/cellar" component={AdminCellarIngestion} />
      <Route path="/admin/cellar-sync" component={AdminCellarSyncMonitor} />
      <Route path="/admin/news-pipeline" component={AdminNewsPipelineManager} />
      <Route path="/admin/news" component={NewsAdmin} />
      <Route path="/admin/scraper-health" component={AdminScraperHealth} />
      <Route path="/admin/pipeline-observability" component={AdminPipelineObservability} />
      <Route path="/admin/observability" component={ObservabilityDashboard} />
      <Route path="/epcis/upload" component={EPCISUploadEnhanced} />
      <Route path="/epcis/upload-legacy" component={EPCISUpload} />
      <Route path="/epcis/supply-chain" component={EPCISSupplyChain} />
      <Route path="/epcis/eudr-map" component={EPCISEUDRMap} />
      <Route path="/tools/scanner" component={BarcodeScanner} />
      <Route path="/tools/compliance-report" component={ComplianceReport} />
      <Route path="/supply-chain" component={SupplyChainDashboard} />
      <Route path="/remediation" component={RiskRemediation} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path="/admin/analytics" component={AdminAnalyticsDashboard} />
      <Route path="/admin/feedback" component={AdminFeedbackDashboard} />
      <Route path="/tools/compliance-checklist" component={ComplianceChecklistGenerator} />
      <Route path="/tools/ai-gap-analysis" component={AIGapAnalysisWizard} />
      <Route path="/compliance/monitoring" component={ComplianceMonitoringDashboard} />
      <Route path="/templates/industry" component={IndustryTemplates} />
      <Route path="/api-integration" component={ExternalAPIIntegration} />
      <Route
        path="/admin/prompt-optimization"
        component={AdminPromptOptimization}
      />
      <Route
        path="/admin/evidence-verification"
        component={AdminEvidenceVerification}
      />
      <Route path="/scoreboard" component={ComplianceScoreboard} />
      <Route path="/compliance/roadmap" component={ComplianceRoadmap} />
      <Route path="/templates" component={TemplateLibrary} />
      <Route path="/admin/templates" component={AdminTemplateManager} />
      <Route
        path="/admin/template-analytics"
        component={TemplateAnalyticsDashboard}
      />
      <Route
        path="/notification-preferences"
        component={NotificationPreferences}
      />
      <Route path="/admin/executive-scorecard" component={ExecutiveScorecard} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <DisclaimerBanner />
            <Toaster />
            <Suspense fallback={<PageLoader />}>
              <Router />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
