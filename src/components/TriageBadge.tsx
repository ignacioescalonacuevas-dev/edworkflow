import { TriageLevel, TRIAGE_CONFIG } from '@/types/patient';
import { cn } from '@/lib/utils';

interface TriageBadgeProps {
  level: TriageLevel;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  inline?: boolean; // New: compact inline version
}

export function TriageBadge({ level, className, onClick, interactive = false, inline = false }: TriageBadgeProps) {
  const config = TRIAGE_CONFIG[level];
  
  // Inline compact version - small triangle next to name
  if (inline) {
    return (
      <div 
        className={cn(
          "inline-flex items-center shrink-0",
          interactive && "cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
        title={`Triage ${level}: ${config.label} (${config.time})`}
        onClick={onClick}
      >
        {/* Small inline triangle */}
        <div 
          className={cn(
            "w-0 h-0",
            "border-l-[8px] border-t-[8px]",
            "border-r-[8px] border-r-transparent",
            "border-b-[8px] border-b-transparent",
            level === 1 && "border-l-red-500 border-t-red-500",
            level === 2 && "border-l-orange-500 border-t-orange-500",
            level === 3 && "border-l-yellow-400 border-t-yellow-400",
            level === 4 && "border-l-green-500 border-t-green-500",
            level === 5 && "border-l-blue-500 border-t-blue-500",
          )}
        />
      </div>
    );
  }
  
  // Original corner badge version
  return (
    <div 
      className={cn("absolute top-0 left-0 z-10", className)}
      title={`Triage ${level}: ${config.label} (${config.time})`}
      onClick={onClick}
    >
      {/* Triangle using CSS borders */}
      <div 
        className={cn(
          "w-0 h-0",
          "border-l-[18px] border-t-[18px]",
          "border-r-[18px] border-r-transparent",
          "border-b-[18px] border-b-transparent",
          level === 1 && "border-l-red-500 border-t-red-500",
          level === 2 && "border-l-orange-500 border-t-orange-500",
          level === 3 && "border-l-yellow-400 border-t-yellow-400",
          level === 4 && "border-l-green-500 border-t-green-500",
          level === 5 && "border-l-blue-500 border-t-blue-500",
          interactive && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
      />
      <span className={cn(
        "absolute top-[1px] left-[3px] text-[10px] font-bold",
        config.color
      )}>
        {level}
      </span>
    </div>
  );
}
