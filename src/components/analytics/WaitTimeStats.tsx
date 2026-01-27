import { WaitTimeStats as WaitTimeStatsType, formatDuration } from '@/hooks/useAnalytics';
import { Clock, Timer, TrendingUp, TrendingDown } from 'lucide-react';
import { TRIAGE_CONFIG, TriageLevel } from '@/types/patient';

interface WaitTimeStatsProps {
  stats: WaitTimeStatsType;
}

const TRIAGE_COLORS: Record<TriageLevel, string> = {
  1: '#ef4444',
  2: '#f97316', 
  3: '#eab308',
  4: '#22c55e',
  5: '#3b82f6',
};

export function WaitTimeStats({ stats }: WaitTimeStatsProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Wait & Care Times</h3>
      
      <div className="space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Wait</p>
              <p className="text-lg font-semibold">
                {stats.averageWait !== null ? formatDuration(stats.averageWait) : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <Timer className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Total</p>
              <p className="text-lg font-semibold">
                {formatDuration(stats.averageTotal)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Longest</p>
              <p className="text-lg font-semibold">
                {formatDuration(stats.longest)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Shortest</p>
              <p className="text-lg font-semibold">
                {formatDuration(stats.shortest)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Wait by Triage */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Wait Time by Triage</p>
          <div className="space-y-1">
            {([1, 2, 3, 4, 5] as TriageLevel[]).map(level => {
              const data = stats.byTriage[level];
              return (
                <div key={level} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                    style={{ 
                      backgroundColor: TRIAGE_COLORS[level],
                      color: level === 3 ? 'black' : 'white'
                    }}
                  >
                    {level}
                  </div>
                  <span className="text-muted-foreground flex-1">
                    {TRIAGE_CONFIG[level].label}
                  </span>
                  <span className="font-medium">
                    {data.count > 0 ? formatDuration(data.avg) : '-'}
                  </span>
                  <span className="text-muted-foreground w-12 text-right">
                    ({data.count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
