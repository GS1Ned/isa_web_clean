import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import AdminAnalyticsDashboard from "./pages/AdminAnalyticsDashboard";
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
import AdminCellarIngestion from "./pages/AdminCellarIngestion";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (    <Switch>
      <Route path={"//"} component={Home} />
      <Route path={"/hub/regulations/:id"} component={HubRegulationDetail} />
      <Route path={"/about"} component={About} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/features"} component={FeaturesComparison} />
      <Route path={"/use-cases"} component={UseCases} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/compare"} component={ComparisonTool} />
      <Route path="/blog" component={Blog} />
      <Route path="/faq" component={FAQ} />
      <Route path="/hub" component={HubHome} />
      <Route path="/hub/regulations" component={HubRegulations} />
      <Route path="/hub/news" component={HubNews} />
      <Route path="/hub/calendar" component={HubCalendar} />
      <Route path="/hub/standards-mapping" component={HubStandardsMapping} />
      <Route path="/hub/resources" component={HubResources} />
      <Route path="/hub/impact-matrix" component={HubImpactMatrix} />
      <Route path="/hub/dashboard" component={HubUserDashboard} />
      <Route path="/hub/compare" component={HubCompare} />
      <Route path="/admin/news" component={AdminNewsPanel} />
      <Route path="/admin/cellar-ingestion" component={AdminCellarIngestion} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/admin/analytics"} component={AdminAnalyticsDashboard} />
      <Route path={"404"} component={NotFound} />
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
