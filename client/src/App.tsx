import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DisclaimerBanner } from "./components/DisclaimerBanner";

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
const Blog = lazy(() => import("./pages/Blog"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HubAbout = lazy(() => import("./pages/HubAbout"));
const HubNews = lazy(() => import("./pages/HubNews"));
const HubCalendar = lazy(() => import("./pages/HubCalendar"));
const HubStandardsMapping = lazy(() => import("./pages/HubStandardsMapping"));
const HubResources = lazy(() => import("./pages/HubResources"));
const HubImpactMatrix = lazy(() => import("./pages/HubImpactMatrix"));
const HubUserDashboard = lazy(() => import("./pages/HubUserDashboard"));
const AdminNewsPanel = lazy(() => import("./pages/AdminNewsPanel"));
const HubCompare = lazy(() => import("./pages/HubCompare"));
const HubCompareEnhanced = lazy(() => import("./pages/HubCompareEnhanced"));
const AdminCellarIngestion = lazy(() => import("./pages/AdminCellarIngestion"));
const AdminEUDRSeeder = lazy(() => import("./pages/AdminEUDRSeeder"));
const AdminCellarSyncMonitor = lazy(() => import("./pages/AdminCellarSyncMonitor"));
const AdminAnalyticsDashboard = lazy(() => import("./pages/AdminAnalyticsDashboard"));
const AdminPromptOptimization = lazy(() => import("./pages/AdminPromptOptimization"));
const EPCISUpload = lazy(() => import("./pages/EPCISUpload"));
const EPCISUploadEnhanced = lazy(() => import("./pages/EPCISUploadEnhanced"));
const EPCISSupplyChain = lazy(() => import("./pages/EPCISSupplyChain"));
const EPCISEUDRMap = lazy(() => import("./pages/EPCISEUDRMap"));
const BarcodeScanner = lazy(() => import("./pages/BarcodeScanner"));
const ComplianceReport = lazy(() => import("./pages/ComplianceReport"));
const ESRSDatapoints = lazy(() => import("./pages/ESRSDatapoints"));
const SupplyChainDashboard = lazy(() => import("./pages/SupplyChainDashboard"));
const RiskRemediation = lazy(() => import("./pages/RiskRemediation"));
const AdminEvidenceVerification = lazy(() => import("./pages/AdminEvidenceVerification"));
const ComplianceScoreboard = lazy(() => import("./pages/ComplianceScoreboard"));
const ComplianceRoadmap = lazy(() => import("./pages/ComplianceRoadmap"));
const TemplateLibrary = lazy(() => import("./pages/TemplateLibrary"));
const AdminTemplateManager = lazy(() => import("./pages/AdminTemplateManager"));
const TemplateAnalyticsDashboard = lazy(() => import("./pages/TemplateAnalyticsDashboard"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences").then(m => ({ default: m.NotificationPreferences })));
const ExecutiveScorecard = lazy(() => import("./pages/ExecutiveScorecard").then(m => ({ default: m.ExecutiveScorecard })));
const HubDutchInitiatives = lazy(() => import("./pages/HubDutchInitiatives"));
const HubDutchInitiativeDetail = lazy(() => import("./pages/HubDutchInitiativeDetail"));
const AskISA = lazy(() => import("./pages/AskISA"));
const AdminKnowledgeBase = lazy(() => import("./pages/AdminKnowledgeBase"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (    <Switch>
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
      <Route path="/hub/calendar" component={HubCalendar} />
      <Route path="/hub/standards-mapping" component={HubStandardsMapping} />
      <Route path="/hub/resources" component={HubResources} />
      <Route path="/hub/impact-matrix" component={HubImpactMatrix} />
      <Route path="/hub/dashboard" component={HubUserDashboard} />
      <Route path="/hub/compare" component={HubCompareEnhanced} />
      <Route path="/hub/compare-legacy" component={HubCompare} />
      <Route path="/hub/esrs-datapoints" component={ESRSDatapoints} />
      <Route path="/hub/dutch-initiatives/:id" component={HubDutchInitiativeDetail} />
      <Route path="/hub/dutch-initiatives" component={HubDutchInitiatives} />
      <Route path="/ask" component={AskISA} />
      <Route path="/admin/knowledge-base" component={AdminKnowledgeBase} />
      <Route path="/admin/eudr-seeder" component={AdminEUDRSeeder} />
      <Route path="/admin/cellar" component={AdminCellarIngestion} />
      <Route path="/admin/cellar-sync" component={AdminCellarSyncMonitor} />
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
      <Route path="/admin/prompt-optimization" component={AdminPromptOptimization} />
      <Route path="/admin/evidence-verification" component={AdminEvidenceVerification} />
      <Route path="/scoreboard" component={ComplianceScoreboard} />
      <Route path="/compliance/roadmap" component={ComplianceRoadmap} />
      <Route path="/templates" component={TemplateLibrary} />
      <Route path="/admin/templates" component={AdminTemplateManager} />
      <Route path="/admin/template-analytics" component={TemplateAnalyticsDashboard} />
      <Route path="/notification-preferences" component={NotificationPreferences} />
      <Route path="/admin/executive-scorecard" component={ExecutiveScorecard} />
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
    </ErrorBoundary>
  );
}

export default App;
