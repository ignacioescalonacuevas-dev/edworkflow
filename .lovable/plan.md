

# Plan: Crear Día de Ayer con los 25 Pacientes en el Historial

## Resumen

Moveremos los 25 pacientes actuales al historial como el turno del **24/01/2026** (ayer) y actualizaremos el estado actual para que sea **25/01/2026** (hoy) con un board limpio listo para empezar.

---

## Flujo Visual

```text
ANTES:
┌─────────────────────────────────────────┐
│ patient-store: 25 pacientes (24/01)     │
│ shift-history: vacío                    │
└─────────────────────────────────────────┘

DESPUÉS:
┌─────────────────────────────────────────┐
│ patient-store: board vacío (25/01)      │
│ shift-history:                          │
│   └── "2026-01-24" → 25 pacientes       │
└─────────────────────────────────────────┘
```

---

## Cambios Necesarios

| Archivo | Descripción |
|---------|-------------|
| `src/store/shiftHistoryStore.ts` | Inicializar con los 25 pacientes del 24/01/2026 |
| `src/store/patientStore.ts` | Cambiar fecha actual a 25/01/2026, empezar con board vacío |

---

## Sección Técnica

### 1. shiftHistoryStore.ts - Pre-cargar el historial

Moveremos los 25 pacientes de ejemplo al historial inicial:

```typescript
// Importar los pacientes de ejemplo y crear el snapshot inicial
const initialHistory: Record<string, ShiftSnapshot> = {
  '2026-01-24': {
    date: '2026-01-24',
    patients: [...los 25 pacientes...],
    doctors: ['Dr. TAU', 'Dr. Joanna', 'Dr. Caren', 'Dr. Alysha', 'Dr. Salah'],
    nurses: ['Nebin', 'Beatriz', 'Rinku', 'Rafa'],
    locations: ['Waiting Area', 'Treatment', 'Box 1', ...],
    summary: {
      totalPatients: 25,
      admissions: 5,
      discharges: 13,
      transfers: 0,
    },
    savedAt: '2026-01-24T23:59:00.000Z',
  },
};

// En el store:
history: initialHistory,  // Empezar con el día 24 ya guardado
```

### 2. patientStore.ts - Actualizar a "hoy" (25/01/2026)

```typescript
// Cambiar la fecha del turno actual
const SHIFT_DATE = '2026-01-25';  // Hoy

// Iniciar con pacientes vacíos (nuevo día)
const samplePatients: Patient[] = [];

// Estado inicial actualizado
shiftDate: new Date('2026-01-25'),
shiftConfigured: true,
patients: [],  // Board vacío, listo para el nuevo turno
```

---

## Resultado Esperado

1. **Hoy (25/01/2026)**: Board vacío, listo para agregar pacientes del nuevo turno
2. **Historial**: El botón "History" mostrará el turno del 24/01/2026 disponible para ver
3. **Vista Read-Only**: Al hacer click en "View" del día 24, se verán los 25 pacientes en modo solo lectura
4. **Navegación**: Botón "Back to Today" para volver al turno actual

---

## Estructura del Snapshot del 24/01/2026

```typescript
{
  date: '2026-01-24',
  patients: [
    // 2 Treatment Room
    // 3 Waiting Room  
    // 2 Review
    // 5 Admission
    // 13 Discharged
  ],
  doctors: ['Dr. TAU', 'Dr. Joanna', 'Dr. Caren', 'Dr. Alysha', 'Dr. Salah'],
  nurses: ['Nebin', 'Beatriz', 'Rinku', 'Rafa'],
  locations: ['Waiting Area', 'Treatment', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5', 'Box 6', 'Resus'],
  summary: {
    totalPatients: 25,
    admissions: 5,
    discharges: 13,
    transfers: 0,
  },
  savedAt: '2026-01-24T23:59:00.000Z',
}
```

