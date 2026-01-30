
# Plan: Datos de Prueba para Día Actual y Mejoras de Analíticas

## Resumen

1. **Agregar 25 pacientes de muestra para el día actual** (2026-01-25) con un flujo realista de urgencias (10am-11pm)
2. **Agregar métricas importantes que faltan**: DNW (Did Not Wait), Follow-ups breakdown
3. **No es necesario cambiar el modo lectura** porque ya existe solo para ver días anteriores desde el historial, y el día actual siempre es editable

---

## Diseño de los 25 Pacientes

Considerando que ED cierra admisiones a las 7pm y para las 10-11pm todos deben tener disposición final:

| Hora Llegada | Estado Final | Cantidad |
|--------------|--------------|----------|
| 10:00-12:00 | Discharged | 5 |
| 12:00-14:00 | Discharged | 4 |
| 14:00-16:00 | Admitted (3) + Discharged (2) | 5 |
| 16:00-18:00 | Admitted (2) + Discharged (3) | 5 |
| 18:00-20:00 | Discharged (3) + Transfer (1) + Admitted (1) | 5 |
| 20:00-22:00 | DNW (1) | 1 (Late arrival that left without being seen) |

**Distribución final:**
- Discharged: 17
- Admitted: 6
- Transferred: 1
- DNW (Did Not Wait): 1
- **Total: 25**

---

## Nueva Métrica: DNW (Did Not Wait)

Los pacientes que se fueron sin esperar se marcan con `processState: 'discharged'` pero sin haber pasado nunca por `being_seen`. Se puede detectar así:

```typescript
const dnw = patients.filter(p => 
  p.processState === 'discharged' && 
  !p.events.some(e => e.description.toLowerCase().includes('being seen'))
).length;
```

## Nueva Métrica: Follow-ups Breakdown

Contar los follow-ups por tipo desde los stickerNotes:

```typescript
const followupCounts: Record<string, number> = {};
patients.forEach(p => {
  p.stickerNotes?.forEach(note => {
    if (note.type === 'followup') {
      followupCounts[note.text] = (followupCounts[note.text] || 0) + 1;
    }
  });
});
```

---

## Sección Técnica

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/store/patientStore.ts` | Reemplazar `samplePatients` vacío con 25 pacientes realistas |
| `src/hooks/useAnalytics.ts` | Agregar `dnwCount` y `followupCounts` al AnalyticsData |
| `src/components/AnalyticsDashboard.tsx` | Mostrar DNW y Follow-ups en el dashboard |

### Estructura de Pacientes de Muestra

```typescript
const SHIFT_DATE = '2026-01-25';

// Helper function ya existe en shiftHistoryStore.ts, la reutilizamos
const samplePatients: Patient[] = [
  // 10:00 - Discharged
  createPatient('t1', 'John McCarthy', '12/05/1985', 'M00100001', 
    'Headache x 3 days', 'Box 1', 'Dr. TAU', 'Nebin',
    new Date(`${SHIFT_DATE}T10:15:00`), 'discharged', 3, {
      stickerNotes: [
        { id: 'ts1', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T10:45:00`) },
        { id: 'ts2', type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T12:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T12:30:00`),
  }),
  // ... 24 more patients
];
```

### Distribución por Médico y Enfermero

Para mantener la carga laboral realista:
- **Dr. TAU**: 6 pacientes
- **Dr. Joanna**: 5 pacientes  
- **Dr. Caren**: 5 pacientes
- **Dr. Alysha**: 5 pacientes
- **Dr. Salah**: 4 pacientes

- **Nebin**: 7 pacientes
- **Beatriz**: 6 pacientes
- **Rinku**: 6 pacientes
- **Rafa**: 6 pacientes

### Nuevas Métricas en AnalyticsData

```typescript
export interface AnalyticsData {
  // ... existing fields
  
  // NEW
  dnwCount: number;           // Did Not Wait
  followupCounts: Record<string, number>;  // GP: 5, RACC: 2, etc.
}
```

### Display en Dashboard

Agregar una nueva sección "End of Day Summary" con:
- Total arrivals
- DNW (Did Not Wait)
- Admissions
- Transfers  
- Follow-ups by type (GP, RACC, MRI Scheduled, Ortho Clinic, etc.)

---

## Flujo de Eventos por Paciente (Ejemplo Realista)

```typescript
events: [
  { type: 'arrival', description: 'Patient arrived at ED', timestamp: 10:15 },
  { type: 'triage_change', description: 'Triage level: 3', timestamp: 10:20 },
  { type: 'process_state_change', description: 'Process state changed to: Triaged', timestamp: 10:20 },
  { type: 'doctor_assigned', description: 'Physician assigned: Dr. TAU', timestamp: 10:30 },
  { type: 'process_state_change', description: 'Process state changed to: Being Seen', timestamp: 10:30 },
  { type: 'process_state_change', description: 'Process state changed to: Awaiting Results', timestamp: 11:00 },
  { type: 'process_state_change', description: 'Process state changed to: Disposition', timestamp: 12:00 },
  { type: 'process_state_change', description: 'Process state changed to: Discharged', timestamp: 12:30 },
]
```

---

## Resultado Esperado

1. **25 pacientes cargados** en el día actual para poder probar todas las funciones
2. **Analíticas completas** mostrando:
   - Total de llegadas: 25
   - DNW: 1
   - Admisiones: 6
   - Transfers: 1
   - Altas: 17
   - Follow-ups: GP (X), RACC (X), Fracture Clinic (X), etc.
3. **Poder editar** todos los pacientes ya que es el día actual (no modo lectura)
4. **Estadísticas de fin de día** con toda la información necesaria para el cierre de turno
