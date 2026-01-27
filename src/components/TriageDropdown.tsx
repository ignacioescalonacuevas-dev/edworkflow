import { TriageLevel, TRIAGE_CONFIG } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TriageBadge } from './TriageBadge';

interface TriageDropdownProps {
  patientId: string;
  currentLevel: TriageLevel;
  readOnly?: boolean;
}

export function TriageDropdown({ patientId, currentLevel, readOnly = false }: TriageDropdownProps) {
  const { updatePatientTriage } = usePatientStore();

  if (readOnly) {
    return <TriageBadge level={currentLevel} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <div>
          <TriageBadge level={currentLevel} interactive />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="z-50 bg-background border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Manchester Triage</div>
        {([1, 2, 3, 4, 5] as TriageLevel[]).map((level) => {
          const config = TRIAGE_CONFIG[level];
          return (
            <DropdownMenuItem
              key={level}
              onClick={() => updatePatientTriage(patientId, level)}
              className={cn(
                "text-xs cursor-pointer gap-2",
                currentLevel === level && "bg-accent"
              )}
            >
              <span className={cn(
                "w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold",
                config.bgColor,
                config.color
              )}>
                {level}
              </span>
              <span>{config.label}</span>
              <span className="text-muted-foreground ml-auto">{config.time}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
