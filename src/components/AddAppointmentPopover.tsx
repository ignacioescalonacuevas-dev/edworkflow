import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AppointmentType, APPOINTMENT_TYPES, REMINDER_OPTIONS } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

interface AddAppointmentPopoverProps {
  patientId: string;
  patientName: string;
  disabled?: boolean;
}

export function AddAppointmentPopover({ patientId, patientName, disabled }: AddAppointmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('mri');
  const [time, setTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  
  const addAppointment = usePatientStore((state) => state.addAppointment);

  const handleAdd = () => {
    if (!time) {
      toast.error('Selecciona una hora para el appointment');
      return;
    }

    // Create scheduled time for today with selected time
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time is in the past, assume it's for tomorrow
    if (scheduledTime < new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    addAppointment(patientId, {
      type: appointmentType,
      scheduledTime,
      reminderMinutes,
      notes: notes.trim() || undefined,
    });

    const typeConfig = APPOINTMENT_TYPES[appointmentType];
    toast.success(`${typeConfig.label} programado para ${time}`);

    // Reset form
    setTime('');
    setNotes('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-6 px-1.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
          title="Agregar appointment"
        >
          <CalendarClock className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="text-sm font-medium">
            Nuevo Appointment
            <span className="text-xs text-muted-foreground ml-2">{patientName}</span>
          </div>

          {/* Appointment Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <Select value={appointmentType} onValueChange={(v) => setAppointmentType(v as AppointmentType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(APPOINTMENT_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.color}`} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <Label className="text-xs">Hora Programada</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Reminder */}
          <div className="space-y-1.5">
            <Label className="text-xs">Recordatorio</Label>
            <Select 
              value={String(reminderMinutes)} 
              onValueChange={(v) => setReminderMinutes(Number(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notas (opcional)</Label>
            <Input
              placeholder="ej: paciente en ayunas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <Button 
            onClick={handleAdd} 
            disabled={!time}
            className="w-full h-8 text-xs"
            size="sm"
          >
            Agregar Appointment
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
