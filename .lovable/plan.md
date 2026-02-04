

# Plan: Filtros por Estado de Proceso en la Barra de Conteo

## Resumen

Transformar la sección "Showing: 25 (16 discharged)" en un sistema interactivo de filtrado por estado. Los coordinadores podrán hacer clic en botones/badges para filtrar el tablero y ver solo pacientes en un estado específico (Registered, To Be Seen, Awaiting Results, Admission, Discharged, Transferred).

## Diseño Visual

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  ANTES (estático)                                                           │
│  ─────────────────                                                          │
│  Showing: 25 (16 discharged)                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  DESPUÉS (interactivo)                                                      │
│  ─────────────────                                                          │
│  Showing: 25  │  [Reg 2] [TBS 4] [Wait 3] [Adm 5] [D/C 10] [Trans 1]        │
│                                                                             │
│  Con filtro activo:                                                         │
│  Showing: 10 of 25  │  [Reg 2] [TBS 4] [Wait 3] [Adm 5] [D/C●10] [Trans 1]  │
│                                           (resaltado = filtro activo)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Comportamiento

1. **Botones de estado**: Cada estado muestra su conteo de pacientes
2. **Clic para filtrar**: Al hacer clic, se filtra el tablero para mostrar solo pacientes en ese estado
3. **Clic de nuevo para quitar**: Clicar el mismo botón desactiva el filtro
4. **Solo un estado a la vez**: Similar a los filtros de estudios pendientes
5. **Visual activo**: El botón activo se resalta con borde/fondo distintivo
6. **Interacción con Hide D/C**: 
   - Si Hide D/C está activado, los botones de D/C, Transferred y Admitted (admisión completada) aparecen deshabilitados
   - Al activar un filtro de estado terminal, se desactiva temporalmente Hide D/C

## Estados a mostrar

| Estado | Abreviación | Color | Descripción |
|--------|-------------|-------|-------------|
| registered | Reg | Gris | Recién registrados |
| to_be_seen | TBS | Púrpura | Esperando ser vistos |
| awaiting_results | Wait | Amarillo | Esperando resultados |
| admission | Adm | Cyan | En proceso de admisión (pendientes) |
| discharged | D/C | Gris oscuro | Dados de alta |
| transferred | Trans | Slate | Transferidos |
| (admission completada) | Adm'd | Verde | Admitidos (ya en cama) |

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/store/patientStore.ts` | Agregar `filterByProcessState` y `setFilterByProcessState` |
| `src/components/FilterIndicator.tsx` | Agregar botones interactivos de estado con conteos |
| `src/store/patientStore.ts` | Modificar `getFilteredPatients` para incluir filtro por estado |

---

## Sección Técnica

### 1. Store: Agregar nuevo filtro

**Archivo:** `src/store/patientStore.ts`

Agregar al interface:
```typescript
interface PatientStore {
  // ... existing
  filterByProcessState: ProcessState | 'admitted' | null;  // 'admitted' = admisión completada
  setFilterByProcessState: (state: ProcessState | 'admitted' | null) => void;
}
```

Inicializar en el estado:
```typescript
filterByProcessState: null,
```

Agregar acción:
```typescript
setFilterByProcessState: (state) => set({ filterByProcessState: state }),
```

Agregar a `clearFilters`:
```typescript
clearFilters: () => set({
  searchQuery: '',
  filterByDoctor: null,
  filterByNurse: null,
  filterByPendingStudy: null,
  filterByProcessState: null,  // <-- nuevo
}),
```

### 2. Store: Modificar getFilteredPatients

**Archivo:** `src/store/patientStore.ts`

Agregar nuevo bloque de filtro (después del filtro de searchQuery):
```typescript
// Filter by process state
if (state.filterByProcessState) {
  result = result.filter(p => {
    if (state.filterByProcessState === 'admitted') {
      // Show only completed admissions
      return p.processState === 'admission' && p.admission?.completedAt;
    }
    if (state.filterByProcessState === 'admission') {
      // Show only pending admissions (not completed)
      return p.processState === 'admission' && !p.admission?.completedAt;
    }
    return p.processState === state.filterByProcessState;
  });
}
```

Nota: Si hay un filtro de estado activo para estados terminales (discharged, transferred, admitted), debemos ignorar `hideDischargedFromBoard` para ese filtro:
```typescript
// Modify hideDischargedFromBoard logic
if (state.hideDischargedFromBoard && !state.filterByProcessState) {
  // Only apply if no process state filter is active
  result = result.filter(p => {
    if (p.processState === 'discharged') return false;
    if (p.processState === 'transferred') return false;
    if (p.processState === 'admission' && p.admission?.completedAt) return false;
    return true;
  });
}
```

### 3. FilterIndicator: UI interactiva

**Archivo:** `src/components/FilterIndicator.tsx`

Agregar imports y lógica de conteo:
```typescript
import { PROCESS_STATES } from '@/types/patient';
import { Button } from '@/components/ui/button';

// Calcular conteos por estado
const stateCounts = useMemo(() => {
  const counts: Record<string, number> = {};
  patients.forEach(p => {
    // Separar admisiones pendientes de completadas
    if (p.processState === 'admission') {
      if (p.admission?.completedAt) {
        counts['admitted'] = (counts['admitted'] || 0) + 1;
      } else {
        counts['admission'] = (counts['admission'] || 0) + 1;
      }
    } else {
      counts[p.processState] = (counts[p.processState] || 0) + 1;
    }
  });
  return counts;
}, [patients]);
```

Agregar botones de estado:
```typescript
// Estado buttons config
const stateButtons = [
  { key: 'registered', label: 'Reg', color: 'bg-gray-500/20 text-gray-400' },
  { key: 'to_be_seen', label: 'TBS', color: 'bg-purple-500/20 text-purple-400' },
  { key: 'awaiting_results', label: 'Wait', color: 'bg-yellow-500/20 text-yellow-400' },
  { key: 'admission', label: 'Adm', color: 'bg-cyan-500/20 text-cyan-400' },
  { key: 'admitted', label: "Adm'd", color: 'bg-green-500/20 text-green-400' },
  { key: 'discharged', label: 'D/C', color: 'bg-gray-500/20 text-gray-400' },
  { key: 'transferred', label: 'Trans', color: 'bg-slate-500/20 text-slate-400' },
];

// En el JSX, después de "Showing: X"
<div className="flex items-center gap-1">
  {stateButtons.map(({ key, label, color }) => {
    const count = stateCounts[key] || 0;
    const isActive = filterByProcessState === key;
    const isDisabled = hideDischargedFromBoard && 
      ['discharged', 'transferred', 'admitted'].includes(key);
    
    return (
      <button
        key={key}
        onClick={() => setFilterByProcessState(isActive ? null : key)}
        disabled={isDisabled && count === 0}
        className={cn(
          "px-2 py-0.5 rounded text-xs font-medium transition-all",
          color,
          isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background",
          count === 0 && "opacity-40 cursor-not-allowed",
          isDisabled && "opacity-30"
        )}
      >
        {label} {count}
      </button>
    );
  })}
</div>
```

### 4. Mostrar filtro activo en badges

Cuando hay un filtro de estado activo, mostrarlo como badge removible:
```typescript
{filterByProcessState && (
  <Badge variant="secondary" className="gap-1 text-xs">
    {stateButtons.find(s => s.key === filterByProcessState)?.label || filterByProcessState}
    <button onClick={() => setFilterByProcessState(null)} className="hover:text-destructive">
      <X className="h-3 w-3" />
    </button>
  </Badge>
)}
```

Actualizar `hasFilters`:
```typescript
const hasFilters = filterByDoctor || filterByNurse || searchQuery || 
  filterByPendingStudy || filterByProcessState;
```

---

## Resultado Esperado

1. El coordinador ve un conteo visual de pacientes por cada estado
2. Puede hacer clic en cualquier estado para filtrar el tablero instantáneamente
3. Puede ver solo los pacientes registrados nuevos, o solo los que esperan resultados
4. Puede revisar todos los discharged/transferred incluso con Hide D/C activado
5. El filtro activo aparece como badge removible
6. Clear all limpia también este filtro

