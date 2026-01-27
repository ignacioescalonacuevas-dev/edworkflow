
# Plan: Sección de Analíticas del Servicio de Emergencias

## Resumen

Crear una nueva página de analíticas accesible desde el header del board que muestre estadísticas completas del servicio, con capacidad de análisis histórico y desglose por funcionario.

---

## Datos Disponibles para Analíticas

Basándome en la estructura de datos actual, podemos extraer:

### Métricas Generales del Día
| Métrica | Fuente de Datos |
|---------|-----------------|
| Total de pacientes atendidos | `patients.length` |
| Pacientes activos | `patients.filter(p => !['discharged','transferred','admitted'].includes(p.processState))` |
| Admisiones | `patients.filter(p => admission !== undefined)` |
| Altas (discharges) | `patients.filter(p => processState === 'discharged')` |
| Transferencias | `patients.filter(p => processState === 'transferred')` |
| Distribución por triage (1-5) | Agrupación por `triageLevel` |

### Estudios/Órdenes del Día
| Estudio | Fuente |
|---------|--------|
| CT realizados | `stickerNotes.filter(n => n.text === 'CT')` |
| ECG realizados | `stickerNotes.filter(n => n.text === 'ECG')` |
| ECHO realizados | `stickerNotes.filter(n => n.text === 'ECHO')` |
| X-Ray realizados | `stickerNotes.filter(n => n.text === 'X-Ray')` |
| US realizados | `stickerNotes.filter(n => n.text === 'US')` |
| Laboratorios | `orders.filter(o => o.type === 'lab')` |

### Tiempos de Espera (calculables)
| Métrica | Cálculo |
|---------|---------|
| Tiempo en sala de espera | Desde `arrivalTime` hasta primer cambio a `being_seen` |
| Tiempo total de atención | Desde `arrivalTime` hasta `dischargedAt` o fin del turno |
| Tiempo hasta admisión | Desde `arrivalTime` hasta `admission.startedAt` |
| Tiempo promedio por triage | Agrupado por nivel de triage |

### Estadísticas por Funcionario
| Métrica | Descripción |
|---------|-------------|
| Pacientes por médico | Lista con detalles: nombre, triage, queja, estado |
| Pacientes por enfermero | Lista con detalles: nombre, triage, queja, estado |
| Órdenes realizadas por médico | Conteo de estudios ordenados |
| Admisiones por médico | Cuántos pacientes admitió cada uno |
| Altas por médico | Cuántos pacientes dio de alta |

### Datos Adicionales Sugeridos
| Métrica | Valor |
|---------|-------|
| **Hora pico** | Hora con más llegadas |
| **Ocupación por box** | Cuántos pacientes pasaron por cada box |
| **Precauciones activas** | COVID+, Flu+, MRSA, Isolation |
| **Follow-ups generados** | GP, RACC, Clinics |
| **Pacientes críticos (Triage 1-2)** | Conteo y porcentaje |
| **Tiempo promedio a disposición** | Desde llegada hasta decisión de admitir/dar alta |

---

## Diseño de la UI

### Acceso
- Nuevo botón "Analytics" en el `BoardHeader` junto a los otros controles
- Abre un Dialog/Sheet con las analíticas completas

### Layout de la Página de Analíticas

```text
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Analytics Dashboard              [Today ▼] [Export]       [✕]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │    25    │  │    13    │  │     5    │  │     2    │            │
│  │ Patients │  │ Discharg │  │ Admitted │  │ Transfer │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                     │
│  TRIAGE DISTRIBUTION          │  WAIT TIMES                        │
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐       │
│  │ ████████████ T1: 2      │  │  │ Avg Wait: 45 min        │       │
│  │ ██████████████ T2: 8    │  │  │ Avg Total: 3h 20min     │       │
│  │ ████████ T3: 10         │  │  │ Longest: 6h 45min       │       │
│  │ ███ T4: 4               │  │  │ Shortest: 45 min        │       │
│  │ █ T5: 1                 │  │  └─────────────────────────┘       │
│  └─────────────────────────┘                                        │
│                                                                     │
│  STUDIES PERFORMED TODAY                                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │  8   │ │  12  │ │  6   │ │  15  │ │  4   │ │  22  │             │
│  │  CT  │ │  ECG │ │ ECHO │ │ X-Ray│ │  US  │ │ Labs │             │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  STAFF WORKLOAD                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Physicians                                                  │   │
│  │  ┌─────────────┬───────┬───────┬───────┬───────────────────┐│   │
│  │  │ Name        │ Pts   │ Admit │ D/C   │ Studies           ││   │
│  │  ├─────────────┼───────┼───────┼───────┼───────────────────┤│   │
│  │  │ Dr. TAU     │   6   │   2   │   3   │ 4 CT, 3 ECG       ││   │
│  │  │ Dr. Joanna  │   5   │   1   │   4   │ 2 CT, 2 ECHO      ││   │
│  │  └─────────────┴───────┴───────┴───────┴───────────────────┘│   │
│  │                                                              │   │
│  │  Nurses                                                      │   │
│  │  ┌─────────────┬───────┬─────────────────────────────────────│   │
│  │  │ Name        │ Pts   │ Patients                           ││   │
│  │  ├─────────────┼───────┼─────────────────────────────────────│   │
│  │  │ Nebin       │   7   │ M. O'Brien(T2), K. Nolan(T5)...   ││   │
│  │  │ Beatriz     │   6   │ S. Kelly(T2), A. Kennedy(T4)...   ││   │
│  │  └─────────────┴───────┴─────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Expand: Detailed Patient List per Staff Member]                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Detalle por Funcionario (Expandible)

Al hacer clic en un médico/enfermero, se expande mostrando:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Dr. TAU - 6 Patients                                               │
├─────────────────────────────────────────────────────────────────────┤
│  ▲2 Michael O'Brien    │ Chest pain        │ Admission │ 2h 30m    │
│  ▲3 Catherine Walsh    │ Syncope           │ Review    │ 4h 15m    │
│  ▲1 Brian Gallagher    │ STEMI             │ Admitted  │ 3h 45m    │
│  ▲3 Claire Healy       │ Allergic reaction │ D/C       │ 1h 30m    │
│  ▲4 Conor Maguire      │ Epistaxis         │ D/C       │ 1h 00m    │
│  ▲3 Eamon Hayes        │ GI Bleed          │ D/C       │ 1h 30m    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Sección Técnica

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/AnalyticsDashboard.tsx` | Componente principal del dashboard |
| `src/components/analytics/StatCard.tsx` | Tarjeta individual de estadística |
| `src/components/analytics/TriageDistribution.tsx` | Gráfico de distribución por triage |
| `src/components/analytics/StudiesChart.tsx` | Visualización de estudios realizados |
| `src/components/analytics/StaffWorkload.tsx` | Tabla de carga laboral por staff |
| `src/components/analytics/WaitTimeStats.tsx` | Estadísticas de tiempos de espera |
| `src/components/analytics/StaffDetail.tsx` | Detalle expandible por funcionario |
| `src/hooks/useAnalytics.ts` | Hook para cálculo de métricas |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/BoardHeader.tsx` | Agregar botón para abrir Analytics |

### Hook de Analíticas (useAnalytics.ts)

```typescript
interface AnalyticsData {
  // General stats
  totalPatients: number;
  activePatients: number;
  admissions: number;
  discharges: number;
  transfers: number;
  
  // Triage distribution
  triageDistribution: Record<TriageLevel, number>;
  
  // Studies
  studiesCounts: {
    ct: number;
    ecg: number;
    echo: number;
    xray: number;
    us: number;
    labs: number;
  };
  
  // Wait times
  waitTimes: {
    averageWait: number; // minutes
    averageTotal: number;
    longest: number;
    shortest: number;
  };
  
  // Staff workload
  physicianStats: StaffStats[];
  nurseStats: StaffStats[];
  
  // Peak hours
  peakHour: number;
  hourlyArrivals: number[];
}

interface StaffStats {
  name: string;
  patientCount: number;
  admissions: number;
  discharges: number;
  studies: Record<string, number>;
  patients: PatientSummary[];
}

interface PatientSummary {
  name: string;
  triageLevel: TriageLevel;
  chiefComplaint: string;
  status: ProcessState;
  duration: number; // minutes
}
```

### Cálculo de Tiempos

```typescript
function calculateWaitTime(patient: Patient): number {
  const arrival = new Date(patient.arrivalTime);
  
  // Find first "being_seen" event
  const seenEvent = patient.events.find(e => 
    e.type === 'process_state_change' && 
    e.description.includes('Being Seen')
  );
  
  if (seenEvent) {
    return (new Date(seenEvent.timestamp).getTime() - arrival.getTime()) / 60000;
  }
  
  return null; // Still waiting
}

function calculateTotalTime(patient: Patient): number {
  const arrival = new Date(patient.arrivalTime);
  const end = patient.dischargedAt 
    ? new Date(patient.dischargedAt) 
    : new Date();
    
  return (end.getTime() - arrival.getTime()) / 60000;
}
```

### Selector de Fecha

Permite ver analíticas de:
- Día actual (por defecto)
- Cualquier fecha del historial (usando `shiftHistoryStore`)

### Visualización con Recharts

Usar los componentes de `recharts` ya instalados para:
- Gráfico de barras para distribución de triage
- Gráfico de pastel para distribución de estudios
- Gráfico de línea para llegadas por hora

---

## Resultado Esperado

1. **Visión general inmediata**: Contadores grandes con totales del día
2. **Distribución de triage**: Ver la gravedad de los pacientes atendidos
3. **Estudios realizados**: Cuántos CT, ECG, etc. se hicieron
4. **Tiempos de espera**: Promedios y extremos para identificar cuellos de botella
5. **Carga por funcionario**: Ver cuántos pacientes atendió cada médico/enfermero
6. **Detalle de pacientes**: Lista expandible con todos los datos de cada paciente por staff
7. **Análisis histórico**: Capacidad de ver datos de días anteriores
8. **Exportación**: Opción para copiar/exportar datos para reportes

---

## Métricas Adicionales Propuestas

Además de lo solicitado, podríamos incluir:

- **Tasa de admisión**: % de pacientes que terminan hospitalizados
- **Tiempo door-to-doctor**: Desde llegada hasta ser visto
- **Tiempo door-to-disposition**: Desde llegada hasta decisión
- **Readmisiones** (si el M-Number aparece más de una vez)
- **Ocupación por hora**: Cuántos pacientes había en ED cada hora
- **Precauciones activas**: Conteo de COVID+, Flu+, MRSA
- **Follow-ups generados**: A dónde se derivaron los pacientes
