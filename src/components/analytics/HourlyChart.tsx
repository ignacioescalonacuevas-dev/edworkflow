import { HourlyData } from '@/hooks/useAnalytics';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyChartProps {
  data: HourlyData[];
  peakHour: number | null;
}

export function HourlyChart({ data, peakHour }: HourlyChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: `${String(d.hour).padStart(2, '0')}:00`,
  }));

  const maxArrivals = Math.max(...data.map(d => d.arrivals), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Arrivals by Hour</h3>
        {peakHour !== null && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Peak: {String(peakHour).padStart(2, '0')}:00
          </span>
        )}
      </div>
      
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="arrivals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={3}
            />
            <YAxis 
              hide
              domain={[0, maxArrivals + 1]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <p className="text-sm font-medium">{data.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.arrivals} arrivals
                      </p>
                      {data.discharges > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {data.discharges} discharges
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="arrivals"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#arrivals)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
