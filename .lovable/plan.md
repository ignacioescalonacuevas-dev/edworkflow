

# Plan: Conectar el Historial al PatientBoard

## El Problema

Cuando haces click en "View" en el historial, el board sigue mostrando los pacientes del día actual (vacío) en lugar de los 25 pacientes del snapshot del 24/01/2026.

```text
ACTUAL:
┌────────────────────────────────────────────────────────┐
│ History → View (24/01) → Board VACÍO ❌                │
│                                                        │
│ PatientBoard usa patientStore.patients (vacío)         │
└────────────────────────────────────────────────────────┘

ESPERADO:
┌────────────────────────────────────────────────────────┐
│ History → View (24/01) → Board con 25 pacientes ✅     │
│                                                        │
│ PatientBoard usa shiftHistoryStore snapshot            │
└────────────────────────────────────────────────────────┘
```

---

## Solución

Modificar `PatientBoard.tsx` para que detecte cuando `viewingDate` está activo y use los pacientes del historial en lugar del store actual.

---

## Cambios Necesarios

| Archivo | Descripción |
|---------|-------------|
| `src/components/PatientBoard.tsx` | Usar pacientes del historial cuando `viewingDate` esté activo |

---

## Sección Técnica

### PatientBoard.tsx - Lógica de fuente de datos

```typescript
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';

export function PatientBoard() {
  const store = usePatientStore();
  const { viewingDate, loadShift } = useShiftHistoryStore();
  
  // Si estamos viendo historial, usar esos pacientes
  const historyShift = viewingDate ? loadShift(viewingDate) : null;
  
  // Determinar qué pacientes mostrar
  const patients = historyShift 
    ? historyShift.patients 
    : getFilteredPatients(store);
  
  // Sort by arrival time (most recent first)
  const sortedPatients = [...patients].sort(
    (a, b) => new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime()
  );

  // ... resto del componente
}
```

---

## Resultado Esperado

1. **Hoy (25/01/2026)**: Board vacío (correcto, es el estado actual)
2. **Click en History → View (24/01/2026)**: Se muestran los 25 pacientes del snapshot
3. **Click en "Back to Today"**: Vuelve al board vacío del día actual

---

## Flujo Visual Corregido

```text
Estado Actual: 25/01/2026 (vacío)
         │
         ▼ Click "History"
┌─────────────────────────────────────┐
│  📅 Fri, 24 Jan 2026  [View]        │
└─────────────────────────────────────┘
         │
         ▼ Click "View"
┌─────────────────────────────────────┐
│ ED Coordination Board [READ-ONLY]   │
│ 📅 Friday, 24 January 2026          │
├─────────────────────────────────────┤
│ [25 Patient Stickers...]            │
│ Michael O'Brien, Sarah Kelly, etc.  │
└─────────────────────────────────────┘
         │
         ▼ Click "Back to Today"
┌─────────────────────────────────────┐
│ ED Coordination Board               │
│ 📅 Sunday, 25 January 2026          │
├─────────────────────────────────────┤
│ No Patients Found                   │
│ Add a new patient or adjust filters │
└─────────────────────────────────────┘
```

