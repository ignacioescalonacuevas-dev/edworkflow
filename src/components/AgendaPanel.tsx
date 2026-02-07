import { useState, useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { APPOINTMENT_TYPES, Appointment } from '@/types/patient';
import { useAppointmentReminders } from '@/hooks/useAppointmentReminders';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  CalendarClock, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgendaItem {
  patientId: string;
  patientName: string;
  patientBox: string;
  appointment: Appointment;
  minutesUntil: number;
}

interface AgendaPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AgendaPanel({ open: controlledOpen, onOpenChange }: AgendaPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  
  const patients = usePatientStore((state) => state.patients);
  const updateAppointmentStatus = usePatientStore((state) => state.updateAppointmentStatus);
  const { upcomingCount } = useAppointmentReminders();

  const agendaItems = useMemo(() => {
    const now = new Date();
    const items: AgendaItem[] = [];

    patients.forEach(patient => {
      patient.appointments?.forEach(apt => {
        const scheduledTime = new Date(apt.scheduledTime);
        const minutesUntil = Math.ceil((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
        
        items.push({
          patientId: patient.id,
          patientName: patient.name,
          patientBox: patient.assignedBox || patient.box || 'Unknown',
          appointment: apt,
          minutesUntil,
        });
      });
    });

    return items.sort((a, b) => 
      new Date(a.appointment.scheduledTime).getTime() - new Date(b.appointment.scheduledTime).getTime()
    );
  }, [patients]);

  const upcoming = agendaItems.filter(item => 
    item.appointment.status === 'pending' && 
    item.minutesUntil > 0 && 
    item.minutesUntil <= 60
  );
  
  const pending = agendaItems.filter(item => 
    item.appointment.status === 'pending' && 
    item.minutesUntil > 60
  );
  
  const inProgress = agendaItems.filter(item => 
    item.appointment.status === 'in_progress'
  );
  
  const completed = agendaItems.filter(item => 
    item.appointment.status === 'completed' || item.appointment.status === 'cancelled'
  );

  const renderItem = (item: AgendaItem) => {
    const config = APPOINTMENT_TYPES[item.appointment.type];
    const scheduledTime = new Date(item.appointment.scheduledTime);
    const timeStr = format(scheduledTime, 'HH:mm');
    const isUpcomingSoon = item.minutesUntil > 0 && item.minutesUntil <= 30;
    const isPast = item.minutesUntil < 0;

    return (
      <div 
        key={`${item.patientId}-${item.appointment.id}`}
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
          isUpcomingSoon && "bg-yellow-500/10 border-yellow-500/30",
          isPast && item.appointment.status === 'pending' && "bg-red-500/10 border-red-500/30",
          item.appointment.status === 'completed' && "opacity-60",
          item.appointment.status === 'cancelled' && "opacity-40 line-through"
        )}
      >
        <div className="flex flex-col items-center w-12 shrink-0">
          <span className={cn(
            "text-lg font-mono font-semibold",
            isUpcomingSoon && "text-yellow-400"
          )}>
            {timeStr}
          </span>
          {item.appointment.status === 'pending' && item.minutesUntil > 0 && (
            <span className="text-[10px] text-muted-foreground">
              in {item.minutesUntil}m
            </span>
          )}
          {isPast && item.appointment.status === 'pending' && (
            <span className="text-[10px] text-red-400">
              {Math.abs(item.minutesUntil)}m ago
            </span>
          )}
        </div>

        <div 
          className={cn(
            "w-12 h-6 rounded flex items-center justify-center text-xs font-medium text-white shrink-0",
            config.color
          )}
        >
          {config.abbrev}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{item.patientName}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {item.patientBox}
            {item.appointment.notes && (
              <span className="ml-2 truncate">• {item.appointment.notes}</span>
            )}
          </div>
        </div>

        {item.appointment.status === 'pending' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Clock className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateAppointmentStatus(item.patientId, item.appointment.id, 'in_progress')}>
                <AlertCircle className="h-4 w-4 mr-2 text-blue-400" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateAppointmentStatus(item.patientId, item.appointment.id, 'completed')}>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateAppointmentStatus(item.patientId, item.appointment.id, 'cancelled')}>
                <XCircle className="h-4 w-4 mr-2 text-red-400" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {item.appointment.status === 'in_progress' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-green-400"
            onClick={() => updateAppointmentStatus(item.patientId, item.appointment.id, 'completed')}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}

        {item.appointment.status === 'completed' && (
          <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
        )}

        {item.appointment.status === 'cancelled' && (
          <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>
    );
  };

  const renderSection = (title: string, items: AgendaItem[], icon: React.ReactNode, emptyText?: string) => {
    if (items.length === 0 && !emptyText) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          )}
        </div>
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground/60 italic pl-6">{emptyText}</div>
        ) : (
          <div className="space-y-1.5">
            {items.map(renderItem)}
          </div>
        )}
      </div>
    );
  };

  const isControlled = controlledOpen !== undefined;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 relative">
            <CalendarClock className="h-4 w-4" />
            Agenda
            {upcomingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] animate-pulse"
              >
                {upcomingCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Shift Agenda
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {renderSection(
            'Next 60 min',
            upcoming,
            <AlertCircle className="h-4 w-4 text-yellow-400" />,
            'No upcoming appointments'
          )}
          
          {renderSection(
            'In Progress',
            inProgress,
            <Clock className="h-4 w-4 text-blue-400" />
          )}
          
          {renderSection(
            'Pending',
            pending,
            <Clock className="h-4 w-4" />
          )}
          
          {renderSection(
            'Completed',
            completed,
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          )}

          {agendaItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <div className="text-sm">No scheduled appointments</div>
              <div className="text-xs mt-1">
                Use the <CalendarClock className="h-3 w-3 inline" /> button on each sticker to add
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
