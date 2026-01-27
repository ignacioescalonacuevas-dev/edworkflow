import { StudiesCounts } from '@/hooks/useAnalytics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StudiesChartProps {
  counts: StudiesCounts;
}

const STUDY_CONFIG = [
  { key: 'ct', label: 'CT', color: '#8b5cf6' },
  { key: 'ecg', label: 'ECG', color: '#06b6d4' },
  { key: 'echo', label: 'ECHO', color: '#f43f5e' },
  { key: 'xray', label: 'X-Ray', color: '#f97316' },
  { key: 'us', label: 'US', color: '#22c55e' },
  { key: 'vascular', label: 'Vascular', color: '#ec4899' },
  { key: 'labs', label: 'Labs', color: '#6366f1' },
];

export function StudiesChart({ counts }: StudiesChartProps) {
  const data = STUDY_CONFIG.map(config => ({
    name: config.label,
    value: counts[config.key as keyof StudiesCounts] || 0,
    color: config.color,
  })).filter(d => d.value > 0);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Studies Performed</h3>
      
      {total === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
          No studies recorded
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-[150px] w-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                          <p className="text-sm font-medium">{data.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {data.value} ({Math.round((data.value / total) * 100)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
            {STUDY_CONFIG.map(config => {
              const value = counts[config.key as keyof StudiesCounts] || 0;
              return (
                <div key={config.key} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                  <span className="text-xs font-medium ml-auto">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t text-center">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground ml-2">Total Studies</span>
      </div>
    </div>
  );
}
