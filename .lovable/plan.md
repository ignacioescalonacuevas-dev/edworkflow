

# Plan: Corregir Filtro "Hide D/C" para Incluir Admisiones Completadas

## Problema Identificado

El botón "Hide D/C" actualmente filtra:
- `processState === 'discharged'`
- `processState === 'transferred'`

Pero NO filtra pacientes con admisión **completada** (`admission?.completedAt` existe). Estos pacientes ya fueron transferidos al ward y no deberían mostrarse en el tablero activo.

```text
FILTRO ACTUAL:
┌────────────────────────────────────────────────────────┐
│ Estado              │ ¿Se esconde?                     │
├────────────────────────────────────────────────────────┤
│ registered          │ NO (visible)                     │
│ to_be_seen          │ NO (visible)                     │
│ awaiting_results    │ NO (visible)                     │
│ admission           │ NO (visible) ← PROBLEMA          │
│ discharged          │ SÍ (escondido)                   │
│ transferred         │ SÍ (escondido)                   │
└────────────────────────────────────────────────────────┘
```

## Solución

Modificar el filtro para incluir pacientes con admisión completada:

```text
NUEVO FILTRO:
┌────────────────────────────────────────────────────────┐
│ Estado              │ ¿Se esconde?                     │
├────────────────────────────────────────────────────────┤
│ registered          │ NO (visible)                     │
│ to_be_seen          │ NO (visible)                     │
│ awaiting_results    │ NO (visible)                     │
│ admission (pending) │ NO (visible)                     │
│ admission (complete)│ SÍ (escondido) ← ARREGLADO       │
│ discharged          │ SÍ (escondido)                   │
│ transferred         │ SÍ (escondido)                   │
└────────────────────────────────────────────────────────┘
```

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/store/patientStore.ts` | Modificar la función `getFilteredPatients` para incluir admisiones completadas |

---

## Sección Técnica

### src/store/patientStore.ts

**Líneas 1199-1207: Modificar filtro hideDischargedFromBoard**

```typescript
// ANTES:
if (state.hideDischargedFromBoard) {
  result = result.filter(p => 
    p.processState !== 'discharged' && 
    p.processState !== 'transferred' &&
    p.status !== 'discharged' && 
    p.status !== 'transferred'
  );
}

// DESPUÉS:
if (state.hideDischargedFromBoard) {
  result = result.filter(p => {
    // Hide discharged
    if (p.processState === 'discharged' || p.status === 'discharged') return false;
    
    // Hide transferred
    if (p.processState === 'transferred' || p.status === 'transferred') return false;
    
    // Hide completed admissions (patient already transferred to ward)
    if (p.admission?.completedAt) return false;
    
    return true;
  });
}
```

### Lógica Explicada

1. **Discharged**: Pacientes dados de alta a casa
2. **Transferred**: Pacientes transferidos a otro hospital
3. **Admission Completada**: Pacientes cuya admisión ya fue completada (`admission.completedAt` existe), lo que significa que ya están en la cama del ward

Los pacientes en proceso de admisión (sin `completedAt`) seguirán visibles para tracking.

---

## Resultado Esperado

- Pacientes activos (registered, to_be_seen, awaiting_results) → **Visibles**
- Pacientes en proceso de admisión (sin completar) → **Visibles**
- Pacientes con admisión completada → **Escondidos con Hide D/C**
- Pacientes discharged → **Escondidos con Hide D/C**
- Pacientes transferred → **Escondidos con Hide D/C**

