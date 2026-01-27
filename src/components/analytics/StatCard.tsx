import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  className,
  iconClassName
}: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-4",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trendValue && (
            <p className={cn(
              "text-xs font-medium",
              trend === 'up' && "text-green-500",
              trend === 'down' && "text-red-500",
              trend === 'neutral' && "text-muted-foreground"
            )}>
              {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "rounded-lg p-2 bg-muted/50",
            iconClassName
          )}>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
