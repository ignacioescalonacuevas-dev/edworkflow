

# Plan: Translate Agenda and Notes System to English

## Overview

Several UI elements in the Agenda panel and the new free notes feature are in Spanish. This plan will translate all Spanish text to English for consistency with the project's language requirements.

---

## Spanish Text Found

| Location | Spanish | English |
|----------|---------|---------|
| **AgendaPanel.tsx** | | |
| Line 3 | `import { es } from 'date-fns/locale'` | Remove (not needed) |
| Line 119 | `en {item.minutesUntil}m` | `in {item.minutesUntil}m` |
| Line 124 | `hace {Math.abs(...)}m` | `{Math.abs(...)}m ago` |
| Line 162 | `En Progreso` | `In Progress` |
| Line 166 | `Completado` | `Completed` |
| Line 169 | `Cancelar` | `Cancel` |
| Line 243 | `Agenda del Turno` | `Shift Agenda` |
| Line 249 | `Próximos 60 min` | `Next 60 min` |
| Line 252 | `Sin appointments próximos` | `No upcoming appointments` |
| Line 256 | `En Progreso` | `In Progress` |
| Line 262 | `Pendientes` | `Pending` |
| Line 268 | `Completados` | `Completed` |
| Line 276 | `No hay appointments programados` | `No scheduled appointments` |
| Line 278 | `...para agregar` | `...to add` |
| **AddAppointmentPopover.tsx** | | |
| Line 29 | `Selecciona una hora para el appointment` | `Please select a time for the appointment` |
| Line 51 | `programado para ${time}` | `scheduled for ${time}` |
| Line 67 | `title="Agregar appointment"` | `title="Add appointment"` |
| Line 79 | `Nuevo Appointment` | `New Appointment` |
| Line 85 | `Tipo` | `Type` |
| Line 105 | `Hora Programada` | `Scheduled Time` |
| Line 116 | `Recordatorio` | `Reminder` |
| Line 136 | `Notas (opcional)` | `Notes (optional)` |
| Line 138 | `ej: paciente en ayunas` | `e.g. patient fasting` |
| Line 151 | `Agregar Appointment` | `Add Appointment` |
| **types/patient.ts** | | |
| Line 185-189 | `60 min antes`, etc. | `60 min before`, etc. |
| **PatientSticker.tsx** | | |
| Line 77 | `+Cama` | `+Bed` |
| Line 124 | `Notas de admisión...` | `Admission notes...` |
| Line 153 | `[+ Nota...]` | `[+ Note...]` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/AgendaPanel.tsx` | Translate 12 strings |
| `src/components/AddAppointmentPopover.tsx` | Translate 9 strings |
| `src/types/patient.ts` | Translate 5 reminder labels |
| `src/components/PatientSticker.tsx` | Translate 3 strings |

---

## Technical Section

### 1. AgendaPanel.tsx

```tsx
// Line 3: Remove unused Spanish locale
// import { es } from 'date-fns/locale';  // DELETE

// Line 119
<span className="text-[10px] text-muted-foreground">
  in {item.minutesUntil}m
</span>

// Line 124
<span className="text-[10px] text-red-400">
  {Math.abs(item.minutesUntil)}m ago
</span>

// Lines 162-169 - Dropdown items
<DropdownMenuItem>In Progress</DropdownMenuItem>
<DropdownMenuItem>Completed</DropdownMenuItem>
<DropdownMenuItem>Cancel</DropdownMenuItem>

// Line 243
<SheetTitle>Shift Agenda</SheetTitle>

// Lines 248-271 - Section titles
renderSection('Next 60 min', ..., 'No upcoming appointments')
renderSection('In Progress', ...)
renderSection('Pending', ...)
renderSection('Completed', ...)

// Lines 276-279 - Empty state
<div>No scheduled appointments</div>
<div>Use the <CalendarClock /> button on each sticker to add</div>
```

### 2. AddAppointmentPopover.tsx

```tsx
// Line 29
toast.error('Please select a time for the appointment');

// Line 51  
toast.success(`${typeConfig.label} scheduled for ${time}`);

// Line 67
title="Add appointment"

// Line 79
<div>New Appointment</div>

// Labels
<Label>Type</Label>
<Label>Scheduled Time</Label>
<Label>Reminder</Label>
<Label>Notes (optional)</Label>

// Line 138
placeholder="e.g. patient fasting"

// Line 151
<Button>Add Appointment</Button>
```

### 3. types/patient.ts

```typescript
export const REMINDER_OPTIONS = [
  { value: 60, label: '60 min before' },
  { value: 30, label: '30 min before' },
  { value: 15, label: '15 min before' },
  { value: 10, label: '10 min before' },
  { value: 5, label: '5 min before' },
] as const;
```

### 4. PatientSticker.tsx

```tsx
// Line 77 - BedNumberDisplay
{bedNumber || '+Bed'}

// Line 124 - EditableFreeNote placeholder
placeholder="Admission notes..."

// Line 153 - Empty state placeholder
[+ Note...]
```

---

## Expected Result

- ✅ All Agenda panel text in English
- ✅ All appointment popover text in English  
- ✅ Reminder options in English
- ✅ Free note placeholders in English
- ✅ Consistent with project's English-only UI requirement

