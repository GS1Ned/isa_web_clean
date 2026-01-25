import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CoverageData {
  [key: string]: {
    name: string;
    mappings: number;
    coverage: string;
    keyAttributes?: string[];
  };
}

interface ComplianceCoverageChartProps {
  coverageData: CoverageData;
  title?: string;
  description?: string;
}

export function ComplianceCoverageChart({ 
  coverageData, 
  title = "ESRS Compliance Coverage",
  description = "Visual breakdown of GS1 standard coverage across ESRS requirements"
}: ComplianceCoverageChartProps) {
  const standards = Object.keys(coverageData).sort();
  const maxMappings = Math.max(...standards.map(std => coverageData[std].mappings || 0));

  // Group by category
  const environmental = standards.filter(s => s.startsWith('E'));
  const social = standards.filter(s => s.startsWith('S'));
  const governance = standards.filter(s => s.startsWith('G'));

  const renderStandardBar = (standard: string) => {
    const data = coverageData[standard];
    const percentage = maxMappings > 0 ? (data.mappings / maxMappings) * 100 : 0;
    const coverageColor = 
      data.coverage === "comprehensive" ? "bg-green-500" :
      data.coverage === "partial" ? "bg-yellow-500" :
      "bg-gray-300";

    return (
      <div key={standard} className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">ESRS {standard}</span>
            <Badge variant={data.coverage === "comprehensive" ? "default" : "secondary"} className="text-xs">
              {data.coverage}
            </Badge>
          </div>
          <span className="text-muted-foreground">{data.mappings} mapping{data.mappings !== 1 ? 's' : ''}</span>
        </div>
        <div className="relative h-8 bg-slate-100 rounded-md overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 ${coverageColor} transition-all duration-500 flex items-center justify-end pr-2`}
            style={{ width: `${Math.max(percentage, 5)}%` }}
          >
            {data.mappings > 0 && (
              <span className="text-xs font-medium text-white">{data.mappings}</span>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground pl-1">
          {data.name}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environmental Standards */}
        {environmental.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-green-700 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              Environmental (E)
            </h3>
            <div className="space-y-4">
              {environmental.map(renderStandardBar)}
            </div>
          </div>
        )}

        {/* Social Standards */}
        {social.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-blue-700 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              Social (S)
            </h3>
            <div className="space-y-4">
              {social.map(renderStandardBar)}
            </div>
          </div>
        )}

        {/* Governance Standards */}
        {governance.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-purple-700 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              Governance (G)
            </h3>
            <div className="space-y-4">
              {governance.map(renderStandardBar)}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500"></div>
              <span className="text-muted-foreground">Comprehensive coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-500"></div>
              <span className="text-muted-foreground">Partial coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-300"></div>
              <span className="text-muted-foreground">Gap identified</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
