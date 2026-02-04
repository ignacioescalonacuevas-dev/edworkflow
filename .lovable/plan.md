

# Plan: Agregar `did_not_wait` (DNW) como ProcessState

## Resumen

Agregar `'did_not_wait'` como un estado de proceso oficial. Esto permite marcar pacientes que se van antes de ser atendidos y filtrarlos/contarlos correctamente.

## Flujo Clínico con DNW

| Estado | Significado | Paciente en ED? |
|--------|-------------|-----------------|
| `registered` | Recién registrado, esperando triage/atención | **SÍ** |
| `did_not_wait` | **NUEVO** - Se fue sin ser visto | **NO** |
| `to_be_seen` | Esperando ser atendido por médico | **SÍ** |
| `awaiting_results` | En evaluación, esperando resultados | **SÍ** |
| `admission` | En proceso de admisión (asignando cama, médico) | **SÍ** |
| `admitted` | Ya admitido, en camino a piso | **NO** |
| `discharged` | Dado de alta | **NO** |
| `transferred` | Transferido a otro hospital | **NO** |

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/types/patient.ts` | Agregar `'did_not_wait'` al tipo `ProcessState` |
| `src/types/patient.ts` | Agregar configuración visual en `PROCESS_STATES` |
| `src/types/patient.ts` | Agregar mapeo en `migrateProcessState` |
| `src/store/patientStore.ts` | Agregar `'did_not_wait'` al mapeo de status legacy |
| `src/components/FilterIndicator.tsx` | Agregar botón DNW a los filtros de estado |
| `src/components/ProcessStateDropdown.tsx` | Mostrará automáticamente DNW (usa `PROCESS_STATES`) |
| `src/hooks/useAnalytics.ts` | Simplificar conteo de DNW usando el nuevo estado |

---

## Sección Técnica

### 1. Actualizar el tipo ProcessState

**Archivo:** `src/types/patient.ts`  
**Líneas 87-93**

Agregar `did_not_wait` después de `registered`:

```typescript
export type ProcessState = 
  | 'registered'
  | 'did_not_wait'     // NUEVO: Paciente se fue sin ser atendido
  | 'to_be_seen'
  | 'awaiting_results'
  | 'admission'
  | 'admitted'         // (de nuestro plan anterior)
  | 'discharged'
  | 'transferred';
```

### 2. Agregar configuración visual

**Archivo:** `src/types/patient.ts`  
**Array `PROCESS_STATES` (líneas 101-108)**

```typescript
export const PROCESS_STATES: ProcessStateConfig[] = [
  { value: 'registered', label: 'Registered', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'did_not_wait', label: 'Did Not Wait', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },  // NUEVO
  { value: 'to_be_seen', label: 'To Be Seen', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'admission', label: 'Admission', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'admitted', label: 'Admitted', color: 'bg-green-500/20 text-green-400 border-green-500/30' },  // (plan anterior)
  { value: 'discharged', label: 'Discharged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'transferred', label: 'Transferred', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];
```

### 3. Actualizar función de migración

**Archivo:** `src/types/patient.ts`  
**Función `migrateProcessState`**

```typescript
export function migrateProcessState(state: string): ProcessState {
  const map: Record<string, ProcessState> = {
    // ... existing mappings ...
    'did_not_wait': 'did_not_wait',  // NUEVO
    'dnw': 'did_not_wait',           // Alias común
    // ...
  };
  return map[state] || 'registered';
}
```

### 4. Actualizar store: updatePatientProcessState

**Archivo:** `src/store/patientStore.ts`

Agregar `did_not_wait` al mapeo de legacy status:

```typescript
const statusMap: Record<ProcessState, PatientStatus> = {
  'registered': 'waiting_room',
  'did_not_wait': 'discharged',  // DNW es terminal, usa discharged como legacy
  'to_be_seen': 'treatment_room',
  'awaiting_results': 'review',
  'admission': 'admission',
  'admitted': 'admission',
  'discharged': 'discharged',
  'transferred': 'transferred',
};
```

### 5. Actualizar store: getFilteredPatients

**Archivo:** `src/store/patientStore.ts`

Agregar `did_not_wait` a la lista de estados terminales (ocultos por Hide D/C):

```typescript
if (state.hideDischargedFromBoard && !state.filterByProcessState) {
  result = result.filter(p => {
    if (p.processState === 'discharged') return false;
    if (p.processState === 'transferred') return false;
    if (p.processState === 'did_not_wait') return false;  // NUEVO
    if (p.processState === 'admitted') return false;
    return true;
  });
}
```

### 6. Actualizar FilterIndicator

**Archivo:** `src/components/FilterIndicator.tsx`

Agregar botón DNW a los filtros:

```typescript
const stateButtons: Array<{
  key: ProcessState;  // Ya no necesita | 'admitted' porque admitted es ProcessState
  label: string;
  color: string;
  activeColor: string;
}> = [
  { key: 'registered', label: 'Reg', color: 'bg-muted/50 text-muted-foreground hover:bg-muted', activeColor: 'bg-muted text-foreground' },
  { key: 'did_not_wait', label: 'DNW', color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30', activeColor: 'bg-orange-500/40 text-orange-300' },  // NUEVO
  { key: 'to_be_seen', label: 'TBS', color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30', activeColor: 'bg-purple-500/40 text-purple-300' },
  { key: 'awaiting_results', label: 'Wait', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30', activeColor: 'bg-yellow-500/40 text-yellow-300' },
  { key: 'admission', label: 'Adm', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30', activeColor: 'bg-cyan-500/40 text-cyan-300' },
  { key: 'admitted', label: "Adm'd", color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30', activeColor: 'bg-green-500/40 text-green-300' },
  { key: 'discharged', label: 'D/C', color: 'bg-muted/50 text-muted-foreground hover:bg-muted', activeColor: 'bg-muted text-foreground' },
  { key: 'transferred', label: 'Trans', color: 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30', activeColor: 'bg-slate-500/40 text-slate-300' },
];
```

También actualizar `isTerminal` para incluir DNW:

```typescript
const isTerminal = ['discharged', 'transferred', 'admitted', 'did_not_wait'].includes(key);
```

Y simplificar el tipo de `handleStateClick`:

```typescript
const handleStateClick = (stateKey: ProcessState) => {
  // ...
};
```

### 7. Simplificar Analytics

**Archivo:** `src/hooks/useAnalytics.ts`  
**Líneas 142-146**

Ahora el conteo de DNW es directo:

```typescript
// ANTES (inferido):
const dnwCount = patients.filter(p => 
  p.processState === 'discharged' && 
  !p.events.some(e => e.description.toLowerCase().includes('being seen'))
).length;

// DESPUÉS (directo):
const dnwCount = patients.filter(p => p.processState === 'did_not_wait').length;
```

### 8. Actualizar activePatients en analytics

**Archivo:** `src/hooks/useAnalytics.ts**  
**Línea 130-132**

```typescript
const activePatients = patients.filter(p => 
  !['discharged', 'transferred', 'did_not_wait', 'admitted'].includes(p.processState)
).length;
```

### 9. Actualizar tipo de filterByProcessState en store

**Archivo:** `src/store/patientStore.ts**

Cambiar el tipo (ya que `admitted` ahora es ProcessState):

```typescript
// ANTES:
filterByProcessState: ProcessState | 'admitted' | null;

// DESPUÉS:
filterByProcessState: ProcessState | null;
```

Y el setter correspondiente.

---

## Nota Importante: Plan Combinado

Este plan **combina** los dos cambios pendientes:
1. Agregar `'admitted'` como ProcessState real (plan anterior aprobado)
2. Agregar `'did_not_wait'` como ProcessState real (este plan)

Ambos cambios se implementarán juntos para evitar hacer dos actualizaciones separadas al tipo `ProcessState`.

---

## Estados Finales (8 estados)

| Estado | Label | Color | Terminal? |
|--------|-------|-------|-----------|
| `registered` | Registered | Gris | No |
| `did_not_wait` | Did Not Wait | Naranja | **Sí** |
| `to_be_seen` | To Be Seen | Púrpura | No |
| `awaiting_results` | Awaiting Results | Amarillo | No |
| `admission` | Admission | Cyan | No |
| `admitted` | Admitted | Verde | **Sí** |
| `discharged` | Discharged | Gris | **Sí** |
| `transferred` | Transferred | Slate | **Sí** |

---

## Resultado Esperado

1. El coordinador puede marcar a un paciente como DNW desde el dropdown de estado
2. Los DNW aparecen en el filtro de la barra de conteo (botón naranja "DNW")
3. Los DNW se ocultan con Hide D/C (son terminales)
4. Las estadísticas de analytics cuentan DNW directamente del estado
5. El flujo de admisión ahora tiene `admission` → `admitted` claramente separados

