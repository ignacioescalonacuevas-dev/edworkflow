import { ProcessState, PROCESS_STATES } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProcessStateDropdownProps {
  patientId: string;
  currentState: ProcessState;
  readOnly?: boolean;
}

export function ProcessStateDropdown({ patientId, currentState, readOnly = false }: ProcessStateDropdownProps) {
  const { updatePatientProcessState } = usePatientStore();
  
  const stateConfig = PROCESS_STATES.find(s => s.value === currentState);

  if (readOnly) {
    return (
      <span
        className={cn(
          "text-[10px] px-1 py-0.5 shrink-0 rounded border",
          stateConfig?.color
        )}
      >
        {stateConfig?.label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          className={cn(
            "text-[10px] px-1 py-0.5 shrink-0 rounded border cursor-pointer hover:opacity-80 transition-opacity",
            stateConfig?.color
          )}
        >
          {stateConfig?.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-50 bg-background border shadow-lg max-h-64 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {PROCESS_STATES.map((state) => (
          <DropdownMenuItem
            key={state.value}
            onClick={() => updatePatientProcessState(patientId, state.value)}
            className={cn(
              "text-xs cursor-pointer",
              currentState === state.value && "bg-accent"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full mr-2", state.color.split(' ')[0])} />
            {state.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
