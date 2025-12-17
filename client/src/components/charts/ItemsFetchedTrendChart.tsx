import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

interface ItemsFetchedTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  description?: string;
}

// Color palette for different sources (with opacity for stacking)
const SOURCE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function ItemsFetchedTrendChart({ 
  data, 
  title = "Items Fetched Trend",
  description = "Number of news items fetched over time"
}: ItemsFetchedTrendChartProps) {
  // Transform data for Recharts
  const chartData = data.map(point => {
    const dataPoint: any = {
      time: point.timestampLabel,
    };
    
    // Add each source as a separate series
    point.bySource.forEach(source => {
      dataPoint[source.sourceId] = source.itemsFetched;
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
          <AreaChart data={chartData}>
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
              label={{ value: 'Items Fetched', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            
            {/* Stacked areas for each source */}
            {sources.map((source, index) => (
              <Area
                key={source.id}
                type="monotone"
                dataKey={source.id}
                stackId="1"
                stroke={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                fillOpacity={0.6}
                name={source.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
