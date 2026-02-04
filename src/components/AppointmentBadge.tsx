import { format } from 'date-fns';
import { Appointment, APPOINTMENT_TYPES } from '@/types/patient';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppointmentBadgeProps {
  appointment: Appointment;
  compact?: boolean;
}

export function AppointmentBadge({ appointment, compact = false }: AppointmentBadgeProps) {
  const config = APPOINTMENT_TYPES[appointment.type];
  const scheduledTime = new Date(appointment.scheduledTime);
  const timeStr = format(scheduledTime, 'HH:mm');
  
  const now = new Date();
  const minutesUntil = Math.ceil((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
  const isUpcoming = minutesUntil > 0 && minutesUntil <= 60;
  const isPast = minutesUntil < 0;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium text-white cursor-default",
                config.color,
                isUpcoming && "ring-1 ring-yellow-400 animate-pulse",
                isPast && "opacity-50",
                appointment.status === 'completed' && "line-through opacity-60"
              )}
            >
              <span>{config.abbrev}</span>
              <span>{timeStr}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="space-y-1">
              <div className="font-medium">{config.label} @ {timeStr}</div>
              {appointment.notes && <div className="text-muted-foreground">{appointment.notes}</div>}
              {isUpcoming && <div className="text-yellow-400">En {minutesUntil} min</div>}
              {isPast && <div className="text-muted-foreground">Hace {Math.abs(minutesUntil)} min</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium text-white",
        config.color,
        isUpcoming && "ring-2 ring-yellow-400",
        appointment.status === 'completed' && "line-through opacity-60"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{config.label}</span>
      <span className="font-mono">{timeStr}</span>
      {isUpcoming && (
        <span className="text-xs bg-black/20 px-1 rounded">
          {minutesUntil}m
        </span>
      )}
    </div>
  );
}
