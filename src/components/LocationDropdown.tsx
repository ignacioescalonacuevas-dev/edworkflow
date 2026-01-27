import { ALL_LOCATIONS, IMAGING_LOCATIONS, ED_LOCATIONS, getLocationAbbreviation } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LocationDropdownProps {
  patientId: string;
  currentLocation: string;
  assignedBox: string;
  readOnly?: boolean;
}

export function LocationDropdown({ patientId, currentLocation, assignedBox, readOnly = false }: LocationDropdownProps) {
  const { updatePatientCurrentLocation } = usePatientStore();
  
  const isAway = currentLocation !== assignedBox;
  const displayValue = isAway ? `→${getLocationAbbreviation(currentLocation)}` : '';

  if (readOnly) {
    if (!isAway) return null;
    return (
      <span className="text-[10px] text-amber-400 font-medium">
        {displayValue}
      </span>
    );
  }

  if (!isAway) {
    // Show a button to move patient away from box
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground cursor-pointer transition-colors min-h-[14px]">
            ──
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="z-50 bg-background border shadow-lg max-h-64 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Move to Imaging</div>
          {IMAGING_LOCATIONS.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => updatePatientCurrentLocation(patientId, loc)}
              className="text-xs cursor-pointer"
            >
              {loc}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="text-[10px] text-amber-400 font-medium cursor-pointer hover:opacity-70 transition-opacity">
          {displayValue}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-50 bg-background border shadow-lg max-h-64 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={() => updatePatientCurrentLocation(patientId, assignedBox)}
          className="text-xs cursor-pointer text-green-400"
        >
          ← Back to {assignedBox}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground font-medium">ED Locations</div>
        {ED_LOCATIONS.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => updatePatientCurrentLocation(patientId, loc)}
            className={cn(
              "text-xs cursor-pointer",
              currentLocation === loc && "bg-accent"
            )}
          >
            {loc}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Imaging</div>
        {IMAGING_LOCATIONS.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => updatePatientCurrentLocation(patientId, loc)}
            className={cn(
              "text-xs cursor-pointer",
              currentLocation === loc && "bg-accent"
            )}
          >
            {loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
