

# Plan: Translate Shift Management System to English

## Overview

The shift management dialogs (End Shift, Previous Shift Warning, and Shift History) contain Spanish text that needs to be translated to English for consistency with the project's English-only UI requirement.

---

## Spanish Text Found

### EndShiftDialog.tsx

| Line | Spanish | English |
|------|---------|---------|
| 3 | `import { es } from 'date-fns/locale'` | Remove import |
| 36 | `'Turno cerrado y guardado en historial'` | `'Shift closed and saved to history'` |
| 40 | `"EEEE, dd 'de' MMMM", { locale: es }` | `'EEEE, MMMM d'` |
| 41 | `'Sin fecha'` | `'No date'` |
| 48 | `Cerrar Turno` | `End Shift` |
| 55 | `Cerrar Turno` | `End Shift` |
| 63 | `Resumen del Turno` | `Shift Summary` |
| 70 | `Total pacientes` | `Total patients` |
| 78 | `Admisiones` | `Admissions` |
| 86 | `Altas` | `Discharges` |
| 94 | `Traslados` | `Transfers` |
| 103 | `Hay {n} pacientes sin cerrar.` | `There are {n} unclosed patients.` |
| 105 | `Se guardarán en el historial...` | `They will be saved to history...` |
| 114 | `Cancelar` | `Cancel` |
| 117 | `Cerrar y Guardar` | `Close and Save` |

### PreviousShiftWarning.tsx

| Line | Spanish | English |
|------|---------|---------|
| 2 | `import { es } from 'date-fns/locale'` | Remove import |
| 25 | `"EEEE, dd 'de' MMMM", { locale: es }` | `'EEEE, MMMM d'` |
| 26 | `'fecha desconocida'` | `'unknown date'` |
| 28 | `"EEEE, dd 'de' MMMM", { locale: es }` | `'EEEE, MMMM d'` |
| 33 | `'Turno anterior cerrado...'` | `'Previous shift closed. Configure new shift.'` |
| 38 | `'Continuando con el turno anterior'` | `'Continuing with previous shift'` |
| 47 | `Turno Anterior Sin Cerrar` | `Previous Shift Not Closed` |
| 50 | `Se detectó un turno...` | `A shift from a previous day was detected that was not closed.` |
| 58 | `Turno abierto` | `Open shift` |
| 66 | `Hoy` | `Today` |
| 72 | `Puedes cerrar el turno...` | `You can close the previous shift and start a new one, or continue working on the existing shift.` |
| 83 | `Continuar Turno` | `Continue Shift` |
| 90 | `Cerrar y Empezar Nuevo` | `Close and Start New` |

### ShiftHistoryDialog.tsx

| Line | Spanish | English |
|------|---------|---------|
| 52 | `Turno del ${date} reabierto para edición` | `Shift from ${date} reopened for editing` |
| 61 | `Historial` | `History` |
| 68 | `Historial de Turnos` | `Shift History` |
| 75 | `No hay turnos guardados.` | `No saved shifts.` |
| 76 | `Los turnos se guardan al cerrar el día.` | `Shifts are saved when closing the day.` |
| 117 | `Reabrir para edición` | `Reopen for editing` |
| 126 | `Ver` | `View` |
| 141 | `¿Reabrir turno?` | `Reopen shift?` |
| 143-145 | `Tienes un turno activo...` | `You have an active shift. Reopening this shift will replace current data with the selected shift's data.` |
| 149 | `Cancelar` | `Cancel` |
| 151 | `Reabrir Turno` | `Reopen Shift` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/EndShiftDialog.tsx` | Translate 14 strings, remove `es` locale |
| `src/components/PreviousShiftWarning.tsx` | Translate 12 strings, remove `es` locale |
| `src/components/ShiftHistoryDialog.tsx` | Translate 11 strings |

---

## Technical Section

### 1. EndShiftDialog.tsx

```tsx
// Line 3: Remove Spanish locale import
// import { es } from 'date-fns/locale';  // DELETE

// Line 36
toast.success('Shift closed and saved to history');

// Line 39-41
const formattedDate = shiftDate 
  ? format(new Date(shiftDate), 'EEEE, MMMM d')
  : 'No date';

// Line 48 - Button
<XCircle /> End Shift

// Line 55 - DialogTitle
End Shift

// Line 63
Shift Summary

// Lines 70, 78, 86, 94 - Stats labels
Total patients
Admissions
Discharges
Transfers

// Lines 103-106 - Warning message
<span>There are {pendingPatients} unclosed patients.</span>
<p>They will be saved to history and you can reopen the shift if needed.</p>

// Lines 114, 117 - Buttons
Cancel
Close and Save
```

### 2. PreviousShiftWarning.tsx

```tsx
// Line 2: Remove Spanish locale import
// import { es } from 'date-fns/locale';  // DELETE

// Lines 24-28 - Date formatting
const formattedShiftDate = shiftDate 
  ? format(new Date(shiftDate), 'EEEE, MMMM d')
  : 'unknown date';

const today = format(new Date(), 'EEEE, MMMM d');

// Line 33
toast.success('Previous shift closed. Configure the new shift.');

// Line 38
toast.info('Continuing with previous shift');

// Lines 47-50 - Dialog header
<DialogTitle>Previous Shift Not Closed</DialogTitle>
<DialogDescription>
  A shift from a previous day was detected that was not closed.
</DialogDescription>

// Lines 58, 66 - Labels
Open shift
Today

// Line 72 - Description
You can close the previous shift and start a new one, or continue working on the existing shift.

// Lines 83, 90 - Buttons
Continue Shift
Close and Start New
```

### 3. ShiftHistoryDialog.tsx

```tsx
// Line 52 - Toast
toast.success(`Shift from ${format(new Date(date), 'MM/dd/yyyy')} reopened for editing`);

// Line 61 - Button
History

// Line 68 - DialogTitle
Shift History

// Lines 75-76 - Empty state
<p>No saved shifts.</p>
<p>Shifts are saved when closing the day.</p>

// Line 117 - Tooltip
title="Reopen for editing"

// Line 126 - Button
View

// Lines 141-145 - Alert dialog
<AlertDialogTitle>Reopen shift?</AlertDialogTitle>
<AlertDialogDescription>
  You have an active shift. Reopening this shift will replace current data with the selected shift's data.
  <br /><br />
  The current shift <strong>will not be saved</strong> automatically. If you want to keep it, close the shift first.
</AlertDialogDescription>

// Lines 149, 151 - Buttons
Cancel
Reopen Shift
```

---

## Expected Result

- All End Shift dialog text in English
- All Previous Shift Warning dialog text in English
- All Shift History dialog text in English
- Date formats in English (without Spanish locale)
- Toast notifications in English
- Consistent with project's English-only UI requirement

