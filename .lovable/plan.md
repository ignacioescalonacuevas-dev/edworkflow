
# Plan: Simplificar Estados del Proceso del Paciente

## Resumen

Reducir los 12 estados actuales del proceso a solo 6 estados más claros y prácticos:

| # | Antes (12 estados) | Después (6 estados) |
|---|-------------------|---------------------|
| 1 | registered | **registered** (sin cambio) |
| 2 | triaged | → eliminado (merge con registered) |
| 3 | being_seen | **to_be_seen** (renombrado) |
| 4 | awaiting_results | **awaiting_results** (sin cambio) |
| 5 | results_review | → eliminado (merge con awaiting_results) |
| 6 | disposition | → eliminado (merge con awaiting_results) |
| 7 | admission_pending | **admission** (consolidado) |
| 8 | bed_assigned | → eliminado (merge con admission) |
| 9 | ready_transfer | → eliminado (merge con admission) |
| 10 | discharged | **discharged** (sin cambio) |
| 11 | transferred | **transferred** (sin cambio) |
| 12 | admitted | → eliminado (merge con discharged) |

---

## Estados Finales

```text
1. Registered    → Paciente registrado, esperando ser visto
2. To Be Seen    → Médico asignado, en proceso de evaluación  
3. Awaiting Results → Esperando resultados de estudios/labs
4. Admission     → En proceso de admisión (incluye bed assigned, etc.)
5. Discharged    → Dado de alta
6. Transferred   → Transferido a otro hospital
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/types/patient.ts` | Actualizar tipo `ProcessState` y array `PROCESS_STATES` |
| `src/types/patient.ts` | Actualizar función `mapStatusToProcessState()` |
| `src/store/patientStore.ts` | Actualizar lógica de admisión para usar `admission` en vez de estados múltiples |
| `src/components/PatientSticker.tsx` | Actualizar condición `isInAdmissionProcess` |
| `src/components/EndShiftDialog.tsx` | Actualizar filtro de admisiones |
| `src/hooks/useAnalytics.ts` | Actualizar filtro de admisiones |
| `src/data/samplePatients.ts` | Actualizar estados de pacientes de ejemplo |

---

## Sección Técnica

### 1. Nuevo Tipo ProcessState

```typescript
export type ProcessState = 
  | 'registered'
  | 'to_be_seen'
  | 'awaiting_results'
  | 'admission'
  | 'discharged'
  | 'transferred';
```

### 2. Nuevo Array PROCESS_STATES

```typescript
export const PROCESS_STATES: ProcessStateConfig[] = [
  { value: 'registered', label: 'Registered', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'to_be_seen', label: 'To Be Seen', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'admission', label: 'Admission', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'discharged', label: 'Discharged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'transferred', label: 'Transferred', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];
```

### 3. Migración de Estados Existentes

La función de migración mapeará estados viejos a los nuevos:

```typescript
function migrateProcessState(state: string): ProcessState {
  const map: Record<string, ProcessState> = {
    'registered': 'registered',
    'triaged': 'registered',
    'being_seen': 'to_be_seen',
    'awaiting_results': 'awaiting_results',
    'results_review': 'awaiting_results',
    'disposition': 'awaiting_results',
    'admission_pending': 'admission',
    'bed_assigned': 'admission',
    'ready_transfer': 'admission',
    'discharged': 'discharged',
    'transferred': 'transferred',
    'admitted': 'discharged',
  };
  return map[state] || 'registered';
}
```

### 4. Actualizar Condiciones de Admisión

```typescript
// Antes:
const isInAdmissionProcess = processState === 'admission_pending' || 
                             processState === 'bed_assigned' || 
                             processState === 'ready_transfer';

// Después:
const isInAdmissionProcess = processState === 'admission';
```

---

## Consideraciones

- Los pacientes existentes con estados antiguos serán migrados automáticamente al cargar
- El historial de shifts guardados mostrará los nuevos estados correctamente gracias a la migración
- La info de cama/consultor sigue visible en el estado `admission`
