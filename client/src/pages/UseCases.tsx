import { Link } from "wouter";
import { Zap, Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function UseCases() {
  const useCases = [
    {
      role: "GS1 Consultants",
      icon: Users,
      description:
        "Help clients map compliance requirements to supply chain standards",
      scenario:
        "A GS1 consultant receives a new CSRD requirement from a client. Instead of manually researching which GS1 standards apply, ISA instantly identifies 8 relevant standards with 92% average relevance scores and provides mapping rationale.",
      benefits: [
        "Reduce research time from 8 hours to 15 minutes",
        "Increase accuracy of standard recommendations",
        "Deliver faster, higher-quality consulting reports",
        "Upsell compliance mapping services",
      ],
      timeSaving: "95% faster",
      color: "accent",
    },
    {
      role: "Regulatory Analysts",
      icon: TrendingUp,
      description: "Track regulatory changes and assess compliance impact",
      scenario:
        "A regulatory analyst monitors ESRS updates for a multinational company. ISA automatically detects new climate reporting requirements, identifies affected GS1 standards, and alerts the team to potential supply chain data gaps.",
      benefits: [
        "Automated regulatory change detection",
        "Real-time impact assessment across supply chains",
        "Proactive compliance planning",
        "Reduce compliance risk and penalties",
      ],
      timeSaving: "80% faster",
      color: "secondary",
    },
    {
      role: "Supply Chain Practitioners",
      icon: CheckCircle2,
      description: "Ensure supply chain data meets regulatory requirements",
      scenario:
        "A supply chain manager needs to verify that their product data collection aligns with new DPP requirements. ISA maps DPP requirements to GS1 standards, identifies data gaps, and recommends collection priorities.",
      benefits: [
        "Align data collection with regulations",
        "Reduce data quality issues",
        "Streamline compliance audits",
        "Improve supplier collaboration",
      ],
      timeSaving: "70% faster",
      color: "accent",
    },
  ];

  const metrics = [
    {
      label: "Average Time Saved per Analysis",
      value: "6-8 hours",
      description: "Compared to manual research and mapping",
    },
    {
      label: "Accuracy Improvement",
      value: "92%+",
      description: "Confidence score for standard recommendations",
    },
    {
      label: "Compliance Coverage",
      value: "100%",
      description: "All relevant GS1 standards identified",
    },
    {
      label: "Cost Reduction",
      value: "40-60%",
      description: "Per compliance project",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ISA</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:text-accent/80 transition"
          >
            Back
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Use Cases
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              See how different stakeholders use ISA to accelerate compliance
              and standards mapping.
            </p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6">
            {metrics.map(metric => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {metric.value}
                </div>
                <p className="font-medium text-foreground text-sm mb-1">
                  {metric.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 flex-1">
        <div className="container">
          <div className="space-y-16">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={useCase.role}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                >
                  <div className={index % 2 === 1 ? "order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                          useCase.color === "accent"
                            ? "bg-accent/20 text-accent"
                            : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">
                        {useCase.role}
                      </h2>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                      {useCase.description}
                    </p>

                    {/* Scenario */}
                    <div className="bg-card rounded-lg p-6 border border-border mb-6">
                      <h3 className="font-semibold text-foreground mb-3">
                        Scenario
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {useCase.scenario}
                      </p>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">
                        Key Benefits
                      </h3>
                      <ul className="space-y-2">
                        {useCase.benefits.map(benefit => (
                          <li key={benefit} className="flex items-start gap-3">
                            <CheckCircle2
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                useCase.color === "accent"
                                  ? "text-accent"
                                  : "text-secondary"
                              }`}
                            />
                            <span className="text-sm text-muted-foreground">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Time Saving Badge */}
                    <div
                      className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                        useCase.color === "accent"
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {useCase.timeSaving} faster
                      </span>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className={index % 2 === 1 ? "order-1" : ""}>
                    <div
                      className={`bg-gradient-to-br ${
                        useCase.color === "accent"
                          ? "from-accent/10 to-secondary/5 border-accent/20"
                          : "from-secondary/10 to-accent/5 border-secondary/20"
                      } rounded-lg p-12 border flex items-center justify-center h-80`}
                    >
                      <div className="text-center">
                        <Icon
                          className={`w-24 h-24 mx-auto mb-4 ${
                            useCase.color === "accent"
                              ? "text-accent"
                              : "text-secondary"
                          } opacity-30`}
                        />
                        <p className="text-muted-foreground font-medium">
                          {useCase.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Return on Investment
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-3">40-60%</div>
              <p className="text-muted-foreground">
                Cost reduction per compliance project
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-secondary mb-3">6-8h</div>
              <p className="text-muted-foreground">Time saved per analysis</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-3">3-6mo</div>
              <p className="text-muted-foreground">
                Payback period for typical enterprise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            See ISA in Action
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore the demo dashboard to see how ISA maps regulations to GS1
            standards in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-primary text-accent-foreground font-medium text-lg hover:shadow-lg transition"
            >
              View Demo Dashboard
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-border text-foreground font-medium text-lg hover:border-accent transition"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; 2025 Intelligent Standards Architect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
