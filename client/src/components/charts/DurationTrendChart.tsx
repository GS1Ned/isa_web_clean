import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendDataPoint {
  timestamp: number;
  timestampLabel: string;
  overall: {
    successRate: number;
    itemsFetched: number;
    avgDuration: number;
  };
  bySource: Array<{
    sourceId: string;
    sourceName: string;
    successRate: number;
    itemsFetched: number;
    avgDuration: number;
  }>;
}

interface DurationTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  description?: string;
}

// Color palette for different sources
const SOURCE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

// Format duration for display
const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export default function DurationTrendChart({ 
  data, 
  title = "Execution Duration Trend",
  description = "Average execution time per scraper"
}: DurationTrendChartProps) {
  // Transform data for Recharts
  const chartData = data.map(point => {
    const dataPoint: any = {
      time: point.timestampLabel,
      overall: point.overall.avgDuration,
    };
    
    // Add each source as a separate series
    point.bySource.forEach(source => {
      dataPoint[source.sourceId] = source.avgDuration;
    });
    
    return dataPoint;
  });

  // Get unique source IDs for legend
  const sources = data.length > 0 
    ? data[0].bySource.map(s => ({ id: s.sourceId, name: s.sourceName }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickFormatter={formatDuration}
              label={{ value: 'Duration', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => formatDuration(value)}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            
            {/* Overall line - thicker and prominent */}
            <Line 
              type="monotone" 
              dataKey="overall" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Overall"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            
            {/* Individual source lines */}
            {sources.map((source, index) => (
              <Line
                key={source.id}
                type="monotone"
                dataKey={source.id}
                stroke={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                strokeWidth={2}
                name={source.name}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
