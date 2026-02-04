import { useEffect, useState, useRef, useCallback } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { Appointment, APPOINTMENT_TYPES } from '@/types/patient';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface PendingReminder {
  patientId: string;
  patientName: string;
  appointmentId: string;
  type: Appointment['type'];
  scheduledTime: Date;
  location: string;
  minutesUntil: number;
  notes?: string;
}

export function useAppointmentReminders() {
  const patients = usePatientStore((state) => state.patients);
  const markReminderTriggered = usePatientStore((state) => state.markReminderTriggered);
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());

  const checkReminders = useCallback(() => {
    const now = new Date();
    const reminders: PendingReminder[] = [];

    patients.forEach(patient => {
      patient.appointments?.forEach(apt => {
        if (apt.status !== 'pending' || apt.reminderTriggered) return;
        
        const scheduledTime = new Date(apt.scheduledTime);
        const reminderTime = new Date(scheduledTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - apt.reminderMinutes);
        
        // Check if we're in the reminder window (between reminder time and scheduled time)
        if (now >= reminderTime && now < scheduledTime) {
          const minutesUntil = Math.ceil((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
          
          reminders.push({
            patientId: patient.id,
            patientName: patient.name,
            appointmentId: apt.id,
            type: apt.type,
            scheduledTime,
            location: patient.assignedBox || patient.box || 'Unknown',
            minutesUntil,
            notes: apt.notes,
          });

          // Show toast notification if not already shown
          const notificationKey = `${patient.id}-${apt.id}`;
          if (!notifiedRef.current.has(notificationKey)) {
            notifiedRef.current.add(notificationKey);
            markReminderTriggered(patient.id, apt.id);
            
            const typeConfig = APPOINTMENT_TYPES[apt.type];
            toast.info(
              `${typeConfig.label} para ${patient.name} en ${minutesUntil} min`,
              {
                duration: 15000,
                description: `Hora: ${format(scheduledTime, 'HH:mm')} | Box: ${patient.assignedBox || patient.box}`,
                action: {
                  label: 'OK',
                  onClick: () => {},
                },
              }
            );
          }
        }
      });
    });

    setPendingReminders(reminders);
  }, [patients, markReminderTriggered]);

  useEffect(() => {
    // Check immediately
    checkReminders();
    
    // Then check every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  // Get count of upcoming appointments (within next 60 min)
  const upcomingCount = pendingReminders.length;

  return { pendingReminders, upcomingCount };
}
