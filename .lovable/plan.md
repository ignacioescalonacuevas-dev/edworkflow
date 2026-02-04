
# Plan: Sistema de Agenda y Recordatorios

## Resumen

Crear un sistema de **Appointments/Citas** que permite:
1. Programar citas para pacientes (MRI, RACC, Ultrasound, etc.) con hora específica
2. Mostrar recordatorios automáticos X minutos antes de la hora
3. Ver un panel/agenda con todas las citas del turno ordenadas cronológicamente
4. Notificaciones visuales y sonoras cuando se acerca la hora

---

## Tipos de Appointments Comunes

Basado en tu descripción, los tipos de citas más frecuentes son:

| Tipo | Ejemplo |
|------|---------|
| **MRI** | MRI a las 18:00 |
| **RACC** | RACC a las 17:00 |
| **Ultrasound** | US a las 14:30 |
| **CT** | CT a las 11:00 |
| **ECHO** | Echo a las 15:45 |
| **Procedimiento** | Procedimiento a las 16:00 |
| **Consulta** | Consulta con cardio a las 13:00 |

---

## Como Funciona

### 1. Agregar Cita a un Paciente

En el sticker del paciente, un nuevo tipo de nota "Appointment" permitira:
- Seleccionar tipo (MRI, RACC, US, etc.)
- Poner hora programada (ej: 18:00)
- Tiempo de recordatorio (30 min antes, 15 min antes, 10 min antes)

```text
┌────────────────────────────────────┐
│  Tipo: [MRI ▼]                     │
│  Hora: [18:00]                     │
│  Recordar: [30 min antes ▼]        │
│  Nota: [paciente ayuno]            │
│                                    │
│  [Agregar Appointment]             │
└────────────────────────────────────┘
```

### 2. Visualizacion en el Sticker

La cita aparecera como un badge especial en el sticker:

```text
┌─────────────────────────────────────────┐
│ △ John Smith                    B4      │
│   15/03/1985                    DR:TA   │
│   M00123456    [CT][MRI 18:00]  NR:NE   │
│   ───────────────────────────────────   │
│   Chest Pain                   Triaged  │
└─────────────────────────────────────────┘
                    ↑
              Badge con hora
```

### 3. Panel de Agenda

Un nuevo boton "Agenda" en el header abrira un panel lateral o dialogo mostrando:

```text
┌─────────────────────────────────────────┐
│  📅 Agenda del Turno                    │
├─────────────────────────────────────────┤
│                                         │
│  ⏰ PROXIMOS 30 MIN                     │
│  ───────────────────                    │
│  ⚠️ 17:45 - MRI - John Smith (B4)       │
│     Recordar en 15 min                  │
│                                         │
│  📋 PENDIENTES HOY                      │
│  ───────────────────                    │
│  🔵 18:00 - RACC - Maria Garcia (B2)    │
│  🔵 19:30 - US - Peter Jones (B1)       │
│  🔵 20:00 - Cardio - Ana Lopez (TR)     │
│                                         │
│  ✓ COMPLETADOS                          │
│  ───────────────────                    │
│  ✓ 14:00 - CT - Pablo Ruiz              │
│  ✓ 15:30 - Echo - Luis Fernandez        │
│                                         │
└─────────────────────────────────────────┘
```

### 4. Notificaciones

Cuando llega el tiempo de recordatorio:
- **Toast notification** prominente en la pantalla
- **Sonido opcional** (beep corto)
- **Badge contador** en el boton Agenda mostrando cuantos recordatorios activos hay

```text
┌─────────────────────────────────────────┐
│  🔔 RECORDATORIO                        │
│                                         │
│  MRI para John Smith en 30 minutos      │
│  Hora programada: 18:00                 │
│  Ubicacion actual: Box 4                │
│                                         │
│  [Ver Paciente]        [Marcar Listo]   │
└─────────────────────────────────────────┘
```

---

## Flujo de Usuario

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     CREAR APPOINTMENT                                  │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
               ┌─────────────────────────────────────┐
               │  Click en "+" del sticker           │
               │  Seleccionar "Appointment"          │
               │  Elegir tipo + hora + recordatorio  │
               └─────────────────────────────────────┘
                                 │
                                 ▼
               ┌─────────────────────────────────────┐
               │  Appointment aparece en sticker     │
               │  Se agrega a la Agenda              │
               └─────────────────────────────────────┘
                                 │
                                 ▼ (cuando llega la hora - X min)
               ┌─────────────────────────────────────┐
               │  Toast notification aparece         │
               │  Badge en boton Agenda se actualiza │
               │  (Sonido opcional)                  │
               └─────────────────────────────────────┘
                                 │
                                 ▼
               ┌─────────────────────────────────────┐
               │  Coordinador ve recordatorio        │
               │  Gestiona envio del paciente        │
               │  Marca como "En camino" o "Listo"   │
               └─────────────────────────────────────┘
```

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---------|--------|
| `src/types/patient.ts` | Agregar tipo `Appointment` e interface |
| `src/store/patientStore.ts` | Agregar appointments al paciente y acciones |
| `src/components/AppointmentBadge.tsx` | **Nuevo**: Badge de cita en sticker |
| `src/components/AgendaPanel.tsx` | **Nuevo**: Panel con todas las citas |
| `src/components/AddAppointmentPopover.tsx` | **Nuevo**: Formulario para agregar cita |
| `src/components/AppointmentReminder.tsx` | **Nuevo**: Hook y componente de notificaciones |
| `src/components/PatientSticker.tsx` | Mostrar badges de appointments |
| `src/components/BoardHeader.tsx` | Agregar boton "Agenda" |

---

## Seccion Tecnica

### Nuevos Tipos en patient.ts

```typescript
export type AppointmentType = 
  | 'mri' | 'ct' | 'ultrasound' | 'echo' | 'xray' 
  | 'racc' | 'procedure' | 'consult' | 'other';

export interface Appointment {
  id: string;
  type: AppointmentType;
  scheduledTime: Date;          // Hora programada (ej: 18:00)
  reminderMinutes: number;      // Cuanto antes avisar (30, 15, 10)
  reminderTriggered: boolean;   // Ya se mostro el recordatorio?
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;               // Notas adicionales
  createdAt: Date;
}

export const APPOINTMENT_TYPES: Record<AppointmentType, { label: string; color: string }> = {
  mri: { label: 'MRI', color: 'bg-pink-500' },
  ct: { label: 'CT', color: 'bg-orange-500' },
  ultrasound: { label: 'US', color: 'bg-cyan-500' },
  echo: { label: 'Echo', color: 'bg-indigo-500' },
  xray: { label: 'X-Ray', color: 'bg-amber-500' },
  racc: { label: 'RACC', color: 'bg-green-500' },
  procedure: { label: 'Procedure', color: 'bg-purple-500' },
  consult: { label: 'Consult', color: 'bg-blue-500' },
  other: { label: 'Other', color: 'bg-gray-500' },
};

// Agregar al Patient interface:
export interface Patient {
  // ... campos existentes
  appointments: Appointment[];  // NUEVO
}
```

### Nuevas Acciones en patientStore.ts

```typescript
// Agregar cita
addAppointment: (patientId: string, appointment: Omit<Appointment, 'id' | 'createdAt' | 'reminderTriggered' | 'status'>) => void;

// Actualizar estado de cita
updateAppointmentStatus: (patientId: string, appointmentId: string, status: Appointment['status']) => void;

// Marcar recordatorio como visto
markReminderTriggered: (patientId: string, appointmentId: string) => void;

// Cancelar cita
cancelAppointment: (patientId: string, appointmentId: string) => void;
```

### Hook de Recordatorios (useAppointmentReminders.ts)

```typescript
export function useAppointmentReminders() {
  const { patients } = usePatientStore();
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const reminders: Reminder[] = [];

      patients.forEach(patient => {
        patient.appointments?.forEach(apt => {
          if (apt.status !== 'pending' || apt.reminderTriggered) return;
          
          const reminderTime = new Date(apt.scheduledTime);
          reminderTime.setMinutes(reminderTime.getMinutes() - apt.reminderMinutes);
          
          if (now >= reminderTime && now < apt.scheduledTime) {
            reminders.push({
              patientId: patient.id,
              patientName: patient.name,
              appointmentId: apt.id,
              type: apt.type,
              scheduledTime: apt.scheduledTime,
              location: patient.assignedBox,
            });
          }
        });
      });

      setPendingReminders(reminders);
    };

    // Verificar cada minuto
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [patients]);

  return pendingReminders;
}
```

### Componente de Notificacion Toast

```typescript
// En el componente principal, mostrar toasts para recordatorios
useEffect(() => {
  pendingReminders.forEach(reminder => {
    toast.info(
      `MRI para ${reminder.patientName} en ${reminder.minutesUntil} min`,
      {
        duration: 10000,
        action: {
          label: 'Ver',
          onClick: () => scrollToPatient(reminder.patientId),
        },
      }
    );
  });
}, [pendingReminders]);
```

---

## Resultado Final

Despues de implementar:

| Funcionalidad | Estado |
|---------------|--------|
| Agregar appointments a pacientes | Nuevo |
| Badge visual en sticker con hora | Nuevo |
| Panel Agenda con lista cronologica | Nuevo |
| Recordatorios automaticos (toast) | Nuevo |
| Marcar citas como completadas | Nuevo |
| Contador de recordatorios pendientes | Nuevo |
| Sonido de notificacion (opcional) | Nuevo |

---

## Opciones de Recordatorio

| Tiempo | Uso tipico |
|--------|------------|
| 60 min | Para preparacion larga (ayuno, etc) |
| 30 min | Default - tiempo para coordinar |
| 15 min | Recordatorio cercano |
| 10 min | Ultimo aviso |
| 5 min | Urgente |
