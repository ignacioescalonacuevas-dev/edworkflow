

# Plan: Corrección de Dropdowns Staff y Estados Históricos

## Resumen

Hay dos bugs identificados:

1. **Dropdowns de Doctor/Nurse vacíos**: Las opciones configuradas en ShiftSetup no aparecen al asignar médico o enfermera en los stickers
2. **Pacientes históricos en "Registered"**: Los pacientes del día de prueba (24/01/2026) muestran todos como "Registered" aunque tienen diferentes estados

---

## Problema 1: Dropdowns de Staff

### Diagnóstico

En `PatientSticker.tsx` línea 279, se extraen `doctors` y `nurses` del store:
```typescript
const { ..., doctors, nurses } = usePatientStore();
```

Y se pasan a los dropdowns (líneas 401-414):
```typescript
<StaffDropdown
  type="doctor"
  options={doctors}  // Si está vacío, no hay opciones
/>
```

El problema es que el store tiene valores por defecto, pero:
- Si el usuario tiene datos previos en localStorage sin los arrays actualizados
- O si los arrays quedaron vacíos después de alguna operación

### Solución

Agregar validación para asegurar que siempre haya opciones disponibles, usando los valores por defecto como fallback.

**Archivo**: `src/components/PatientSticker.tsx`

```typescript
// Línea ~279: Asegurar fallback
const { doctors, nurses, ... } = usePatientStore();

// Usar fallback si el array está vacío
const doctorOptions = doctors.length > 0 ? doctors : ['Dr. TAU', 'Dr. Joanna', 'Dr. Caren'];
const nurseOptions = nurses.length > 0 ? nurses : ['Nebin', 'Beatriz', 'Rinku'];
```

Luego usar `doctorOptions` y `nurseOptions` en los dropdowns.

---

## Problema 2: Estados Históricos Incorrectos

### Diagnóstico

El `shiftHistoryStore` usa zustand persist:
```typescript
persist(
  (set, get) => ({ history: initialHistory, ... }),
  { name: 'shift-history' }
)
```

Cuando hay datos en localStorage:
1. Los datos antiguos de localStorage sobrescriben `initialHistory`
2. Si esos datos fueron creados antes de agregar `processState`, no lo tienen
3. El fallback en `PatientSticker.tsx` línea 287 muestra "registered":
   ```typescript
   const processState = patient.processState || 'registered';
   ```

### Solución

Agregar una función de migración que:
1. Al cargar el store, verifique si los pacientes tienen `processState`
2. Si no lo tienen, calcularlo desde el campo `status` usando `mapStatusToProcessState`

**Archivo**: `src/store/shiftHistoryStore.ts`

Agregar middleware de migración:

```typescript
// Función para migrar paciente individual
function migrateHistoryPatient(patient: Patient): Patient {
  return {
    ...patient,
    triageLevel: patient.triageLevel ?? 3,
    assignedBox: patient.assignedBox ?? patient.box ?? 'Waiting Room',
    currentLocation: patient.currentLocation ?? patient.box ?? 'Waiting Room',
    processState: patient.processState ?? mapStatusToProcessState(patient.status),
  };
}

// Función para migrar snapshot
function migrateSnapshot(snapshot: ShiftSnapshot): ShiftSnapshot {
  return {
    ...snapshot,
    patients: snapshot.patients.map(migrateHistoryPatient),
  };
}

// En el store, agregar migrate option
export const useShiftHistoryStore = create<ShiftHistoryStore>()(
  persist(
    (set, get) => ({ ... }),
    { 
      name: 'shift-history',
      version: 2,  // Incrementar versión
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Migrar datos viejos
          const state = persistedState as ShiftHistoryStore;
          return {
            ...state,
            history: Object.fromEntries(
              Object.entries(state.history || {}).map(([date, snapshot]) => [
                date,
                migrateSnapshot(snapshot)
              ])
            ),
          };
        }
        return persistedState;
      },
    }
  )
);
```

---

## Sección Técnica: Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/PatientSticker.tsx` | Agregar fallback para doctors/nurses vacíos |
| `src/store/shiftHistoryStore.ts` | Agregar migración de datos para processState |
| `src/store/patientStore.ts` | Agregar migración similar para datos del turno actual |

### Cambio 1: PatientSticker.tsx

```typescript
// Después de línea 279
const doctorOptions = doctors.length > 0 ? doctors : ['No doctors configured'];
const nurseOptions = nurses.length > 0 ? nurses : ['No nurses configured'];

// En líneas 401-406
<StaffDropdown
  type="doctor"
  patientId={patient.id}
  currentValue={patient.doctor}
  options={doctorOptions}  // Usar opciones con fallback
  displayValue={getInitials(patient.doctor)}
/>

// En líneas 408-413
<StaffDropdown
  type="nurse"
  patientId={patient.id}
  currentValue={patient.nurse}
  options={nurseOptions}  // Usar opciones con fallback
  displayValue={getInitials(patient.nurse)}
/>
```

### Cambio 2: shiftHistoryStore.ts

Agregar versión y migración al persist:

```typescript
import { mapStatusToProcessState, ProcessState, TriageLevel } from '@/types/patient';

function migrateHistoryPatient(patient: any): Patient {
  return {
    ...patient,
    triageLevel: patient.triageLevel ?? 3,
    assignedBox: patient.assignedBox ?? patient.box ?? 'Waiting Room',
    currentLocation: patient.currentLocation ?? patient.box ?? 'Waiting Room',
    processState: patient.processState ?? mapStatusToProcessState(patient.status),
  };
}

export const useShiftHistoryStore = create<ShiftHistoryStore>()(
  persist(
    (set, get) => ({
      // ... existing code
    }),
    { 
      name: 'shift-history',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState?.history) {
          const migratedHistory: Record<string, ShiftSnapshot> = {};
          for (const [date, snapshot] of Object.entries(persistedState.history as Record<string, ShiftSnapshot>)) {
            migratedHistory[date] = {
              ...snapshot,
              patients: snapshot.patients.map(migrateHistoryPatient),
            };
          }
          return { ...persistedState, history: migratedHistory };
        }
        return persistedState;
      },
    }
  )
);
```

### Cambio 3: patientStore.ts

Agregar versión y migración similar para el store principal:

```typescript
persist(
  (set, get) => ({ ... }),
  { 
    name: 'patient-store',
    version: 2,
    migrate: (persistedState: any, version: number) => {
      if (version < 2 && persistedState?.patients) {
        return {
          ...persistedState,
          patients: persistedState.patients.map(migratePatient),
        };
      }
      return persistedState;
    },
  }
)
```

---

## Resultado Esperado

### Dropdowns de Staff
- Los dropdowns de Doctor y Nurse mostrarán las opciones configuradas en ShiftSetup
- Si no hay opciones configuradas, mostrará un mensaje indicándolo

### Datos Históricos
- Los pacientes del día de prueba (24/01/2026) mostrarán sus estados correctos:
  - 5 pacientes en "Admission Pending" 
  - 13 pacientes en "Discharged"
  - 2 en "Being Seen"
  - 3 en "Triaged" 
  - 2 en "Results Review"

Esto habilitará la sección de análisis y estadísticas con datos precisos.

