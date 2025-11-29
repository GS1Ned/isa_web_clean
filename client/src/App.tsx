import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import AdminAnalyticsDashboard from "./pages/AdminAnalyticsDashboard";
import AdminPromptOptimization from "./pages/AdminPromptOptimization";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import FeaturesComparison from "./pages/FeaturesComparison";
import UseCases from "./pages/UseCases";
import Contact from "./pages/Contact";
import ComparisonTool from "./pages/ComparisonTool";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import HubHome from "./pages/HubHome";
import HubAbout from "./pages/HubAbout";
import HubRegulations from "./pages/HubRegulations";
import HubNews from "./pages/HubNews";
import HubCalendar from "./pages/HubCalendar";
import HubStandardsMapping from "./pages/HubStandardsMapping";
import HubResources from "./pages/HubResources";
import HubImpactMatrix from "./pages/HubImpactMatrix";
import HubUserDashboard from "./pages/HubUserDashboard";
import AdminNewsPanel from "./pages/AdminNewsPanel";
import HubRegulationDetail from "./pages/HubRegulationDetail";
import HubCompare from "./pages/HubCompare";
import HubCompareEnhanced from "./pages/HubCompareEnhanced";
import AdminCellarIngestion from './pages/AdminCellarIngestion';
import AdminEUDRSeeder from './pages/AdminEUDRSeeder';
import AdminCellarSyncMonitor from './pages/AdminCellarSyncMonitor';
import EPCISUpload from "./pages/EPCISUpload";
import EPCISUploadEnhanced from "./pages/EPCISUploadEnhanced";
import EPCISSupplyChain from "./pages/EPCISSupplyChain";
import EPCISEUDRMap from "./pages/EPCISEUDRMap";
import BarcodeScanner from "./pages/BarcodeScanner";
import ComplianceReport from "./pages/ComplianceReport";
import GettingStarted from "./pages/GettingStarted";
import ESRSDatapoints from "./pages/ESRSDatapoints";
import SupplyChainDashboard from "./pages/SupplyChainDashboard";
import RiskRemediation from "./pages/RiskRemediation";
import AdminEvidenceVerification from "./pages/AdminEvidenceVerification";
import ComplianceScoreboard from "./pages/ComplianceScoreboard";
import ComplianceRoadmap from "./pages/ComplianceRoadmap";
import TemplateLibrary from "./pages/TemplateLibrary";
import AdminTemplateManager from "./pages/AdminTemplateManager";
import TemplateAnalyticsDashboard from "./pages/TemplateAnalyticsDashboard";
import { NotificationPreferences } from "./pages/NotificationPreferences";
import { ExecutiveScorecard } from "./pages/ExecutiveScorecard";
import Features from "./pages/Features";
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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
