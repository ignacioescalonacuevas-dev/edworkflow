
# Plan: Sistema de Historial de Turnos por Fecha

## Resumen

Implementar persistencia de turnos por fecha, permitiendo navegar entre días anteriores y ver el historial. Cada día quedará guardado automáticamente y se podrá acceder desde un selector de fechas.

---

## Arquitectura del Sistema

```text
localStorage
├── patient-store          ← Estado actual (turno activo)
└── shift-history          ← Historial de turnos guardados
    ├── "2026-01-24" → { patients, doctors, nurses, ... }
    ├── "2026-01-23" → { patients, doctors, nurses, ... }
    └── "2026-01-22" → { patients, doctors, nurses, ... }
```

---

## Flujo de Usuario

```text
┌─────────────────────────────────────────────────────────────────┐
│ ED Coordination Board                                           │
│ 📅 Saturday, 25 January 2026  [📂 History]                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Click en History
┌─────────────────────────────────────────────────────────────────┐
│  Shift History                                            [X]   │
├─────────────────────────────────────────────────────────────────┤
│  📅 Fri, 24 Jan 2026  │ 25 patients │ 5 admitted │ [View]      │
│  📅 Thu, 23 Jan 2026  │ 22 patients │ 4 admitted │ [View]      │
│  📅 Wed, 22 Jan 2026  │ 28 patients │ 6 admitted │ [View]      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Click en View (modo solo lectura)
┌─────────────────────────────────────────────────────────────────┐
│ ED Coordination Board                    [🔙 Back to Today]     │
│ 📅 Friday, 24 January 2026 (READ-ONLY)                          │
├─────────────────────────────────────────────────────────────────┤
│ [Board del día 24 en modo lectura...]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cambios Necesarios

| Archivo | Descripción |
|---------|-------------|
| `src/store/patientStore.ts` | Agregar estado y acciones para historial |
| `src/store/shiftHistoryStore.ts` | **Nuevo** - Store separado para historial |
| `src/components/BoardHeader.tsx` | Agregar botón "History" y indicador read-only |
| `src/components/ShiftHistoryDialog.tsx` | **Nuevo** - Diálogo con lista de turnos anteriores |
| `src/types/patient.ts` | Agregar tipo `ShiftSnapshot` |

---

## Comportamiento

### Guardado Automático
- Al cambiar de fecha (iniciar nuevo turno), el turno actual se guarda en historial
- Al cerrar la app, el estado persiste normalmente en `patient-store`
- Opcional: botón "Save Shift" para guardar explícitamente

### Visualización de Historial
- Lista de fechas con resumen (total pacientes, admisiones, altas)
- Modo solo lectura (sin edición para días pasados)
- Indicador visual claro cuando se está viendo historial vs. día actual

### sin Límite de Almacenamiento
- Guardar últimos 365 dias por defecto


---

## Tipos de Datos

```typescript
// src/types/patient.ts
interface ShiftSnapshot {
  date: string;                    // "2026-01-24" (key)
  patients: Patient[];
  doctors: string[];
  nurses: string[];
  locations: string[];
  summary: {
    totalPatients: number;
    admissions: number;
    discharges: number;
    transfers: number;
  };
  savedAt: string;                 // ISO timestamp
}
```

---

## Sección Técnica

### 1. ShiftHistoryStore (nuevo archivo)

```typescript
// src/store/shiftHistoryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShiftSnapshot {
  date: string;
  patients: Patient[];
  doctors: string[];
  nurses: string[];
  locations: string[];
  summary: {
    totalPatients: number;
    admissions: number;
    discharges: number;
    transfers: number;
  };
  savedAt: string;
}

interface ShiftHistoryStore {
  history: Record<string, ShiftSnapshot>;
  viewingDate: string | null;  // null = viewing current day
  
  saveShift: (snapshot: ShiftSnapshot) => void;
  loadShift: (date: string) => ShiftSnapshot | null;
  setViewingDate: (date: string | null) => void;
  getAvailableDates: () => string[];
  clearOldHistory: (keepDays: number) => void;
}

export const useShiftHistoryStore = create<ShiftHistoryStore>()(
  persist(
    (set, get) => ({
      history: {},
      viewingDate: null,
      
      saveShift: (snapshot) => {
        set((state) => ({
          history: {
            ...state.history,
            [snapshot.date]: snapshot,
          },
        }));
      },
      
      loadShift: (date) => get().history[date] || null,
      
      setViewingDate: (date) => set({ viewingDate: date }),
      
      getAvailableDates: () => Object.keys(get().history).sort().reverse(),
      
      clearOldHistory: (keepDays) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - keepDays);
        set((state) => ({
          history: Object.fromEntries(
            Object.entries(state.history).filter(
              ([date]) => new Date(date) >= cutoff
            )
          ),
        }));
      },
    }),
    { name: 'shift-history' }
  )
);
```

### 2. PatientStore - Agregar acciones de historial

```typescript
// Agregar al PatientStore
saveCurrentShiftToHistory: () => {
  const state = get();
  if (!state.shiftDate) return;
  
  const dateKey = format(new Date(state.shiftDate), 'yyyy-MM-dd');
  const snapshot: ShiftSnapshot = {
    date: dateKey,
    patients: state.patients,
    doctors: state.doctors,
    nurses: state.nurses,
    locations: state.locations,
    summary: {
      totalPatients: state.patients.length,
      admissions: state.patients.filter(p => p.status === 'admission').length,
      discharges: state.patients.filter(p => p.status === 'discharged').length,
      transfers: state.patients.filter(p => p.status === 'transferred').length,
    },
    savedAt: new Date().toISOString(),
  };
  
  // Llamar al history store
  useShiftHistoryStore.getState().saveShift(snapshot);
},
```

### 3. BoardHeader - Agregar controles de historial

```typescript
// Agregar en BoardHeader.tsx
import { History, ArrowLeft } from 'lucide-react';
import { ShiftHistoryDialog } from './ShiftHistoryDialog';

const { viewingDate, setViewingDate } = useShiftHistoryStore();

// En el header:
{viewingDate ? (
  <Button variant="outline" size="sm" onClick={() => setViewingDate(null)}>
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to Today
  </Button>
) : (
  <ShiftHistoryDialog />
)}

// Indicador de modo lectura:
{viewingDate && (
  <Badge variant="secondary" className="ml-2">
    READ-ONLY
  </Badge>
)}
```

### 4. ShiftHistoryDialog (nuevo componente)

```typescript
// src/components/ShiftHistoryDialog.tsx
export function ShiftHistoryDialog() {
  const { getAvailableDates, loadShift, setViewingDate } = useShiftHistoryStore();
  const dates = getAvailableDates();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shift History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-80">
          {dates.map(date => {
            const shift = loadShift(date);
            return (
              <div key={date} className="flex items-center justify-between p-3 border-b">
                <div>
                  <span className="font-medium">
                    {format(new Date(date), 'EEEE, dd MMM yyyy')}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {shift?.summary.totalPatients} patients · 
                    {shift?.summary.admissions} admitted · 
                    {shift?.summary.discharges} discharged
                  </p>
                </div>
                <Button size="sm" onClick={() => setViewingDate(date)}>
                  View
                </Button>
              </div>
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Proteger Edición en Modo Historial

Los componentes de edición deben verificar si estamos viendo historial:

```typescript
// En cualquier componente que edite datos:
const { viewingDate } = useShiftHistoryStore();
const isReadOnly = viewingDate !== null;

// Deshabilitar botones/inputs cuando isReadOnly
<Button disabled={isReadOnly}>Add Patient</Button>
```

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `src/types/patient.ts` | Modificar - agregar `ShiftSnapshot` |
| `src/store/shiftHistoryStore.ts` | **Crear** |
| `src/store/patientStore.ts` | Modificar - agregar `saveCurrentShiftToHistory` |
| `src/components/ShiftHistoryDialog.tsx` | **Crear** |
| `src/components/BoardHeader.tsx` | Modificar - agregar botón History |
| `src/components/NewPatientForm.tsx` | Modificar - deshabilitar en read-only |
| `src/components/PatientSticker.tsx` | Modificar - deshabilitar edición en read-only |

---

## Resultado Esperado

- Botón "History" en el header que abre lista de turnos anteriores
- Cada día se guarda automáticamente al iniciar uno nuevo
- Navegación a días pasados en modo solo lectura
- Indicador visual "READ-ONLY" cuando se ve historial
- Botón "Back to Today" para volver al turno actual
- Historial de últimos 30 días almacenado en localStorage
