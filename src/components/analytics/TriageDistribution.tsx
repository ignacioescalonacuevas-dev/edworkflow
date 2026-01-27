import { TriageLevel, TRIAGE_CONFIG } from '@/types/patient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TriageDistributionProps {
  distribution: Record<TriageLevel, number>;
}

const TRIAGE_COLORS: Record<TriageLevel, string> = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#22c55e', // green
  5: '#3b82f6', // blue
};

export function TriageDistribution({ distribution }: TriageDistributionProps) {
  const data = ([1, 2, 3, 4, 5] as TriageLevel[]).map(level => ({
    level: `T${level}`,
    fullLabel: TRIAGE_CONFIG[level].label,
    count: distribution[level] || 0,
    color: TRIAGE_COLORS[level],
  }));

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Triage Distribution</h3>
      
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="level" 
              axisLine={false}
              tickLine={false}
              width={35}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <p className="text-sm font-medium">{data.fullLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.count} patients ({total > 0 ? Math.round((data.count / total) * 100) : 0}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-5 gap-1 text-center">
        {data.map(item => (
          <div key={item.level} className="flex flex-col items-center">
            <span className="text-lg font-bold" style={{ color: item.color }}>
              {item.count}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
