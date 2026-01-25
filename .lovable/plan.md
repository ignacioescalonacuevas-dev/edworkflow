

# Plan: Agregar Fecha del Turno y Generar 25 Pacientes de Ejemplo

## Resumen

Agregaremos la fecha del turno visible en el header del board y generaremos 25 pacientes con datos realistas simulando un día típico de urgencias (24/01/2026).

---

## Cambios Visuales

### Antes
```text
┌────────────────────────────────────────────────────────────┐
│ 🏥 ED Coordination Board                    [Controles]    │
├────────────────────────────────────────────────────────────┤
```

### Después
```text
┌────────────────────────────────────────────────────────────┐
│ 🏥 ED Coordination Board                    [Controles]    │
│ 📅 Friday, 24 January 2026                                 │
├────────────────────────────────────────────────────────────┤
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/BoardHeader.tsx` | Agregar línea con la fecha del turno formateada |
| `src/store/patientStore.ts` | Reemplazar datos de ejemplo con 25 pacientes del 24/01/2026 |

---

## Datos de los 25 Pacientes

Los pacientes tendrán una mezcla realista de:

**Distribución de Estados:**
- 2 en Treatment Room (en evaluación activa)
- 3 en Waiting Room (esperando resultados)
- 0 en CT/MRI/Echo (en estudios)
- 2 en Review (pendientes de decisión)
- 5 en Admission (esperando cama)
- 18 Discharged (dados de alta)

**Motivos de Consulta Variados:**
- Dolor torácico, disnea
- Dolor abdominal, náuseas
- Cefalea, mareo
- Traumatismos (caída, accidente)
- Fiebre, síntomas respiratorios
- Síncope, palpitaciones
- Dolor lumbar

**Notas Clínicas:**
- Estudios: CT, ECHO, ECG, X-Ray
- Valores críticos: Trop +, K+ elevado, Lactato
- Precauciones: Flu A+, COVID+, MRSA
- Follow-ups: GP, Clinic, RACC
- Médicos admitiendo

**Staff del Turno:**
- Physicians: Dr. TAU, Dr. Joanna, Dr. Caren, Dr. Alysha, Dr. Salah
- Nurses: Nebin, Beatriz, Rinku, Rafa

---

## Sección Técnica

### 1. BoardHeader.tsx - Agregar fecha visible

```typescript
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

// Dentro del componente:
const { shiftDate, hideDischargedFromBoard, setHideDischargedFromBoard } = usePatientStore();

// Después del título, agregar:
{shiftDate && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Calendar className="h-4 w-4" />
    <span>{format(new Date(shiftDate), 'EEEE, dd MMMM yyyy')}</span>
  </div>
)}
```

### 2. patientStore.ts - Datos de ejemplo

Se generarán 25 pacientes con:
- Llegadas distribuidas entre 10:00 y 18:00 del 24/01/2026
- Boxes del 1 al 6 + treatment + Waiting Area
- Variedad de estudios y notas según el caso clínico
- Estados coherentes con el tiempo de estadía
- Algunos ya dados de alta

Ejemplo de estructura:
```typescript
{
  id: 'p1',
  name: 'Michael O\'Brien',
  dateOfBirth: '18/05/1958',
  mNumber: 'M00234567',
  chiefComplaint: 'Chest pain radiating to left arm',
  box: 'Resus',
  doctor: 'Dr. Smith',
  nurse: 'N. Garcia',
  arrivalTime: new Date('2026-01-24T06:30:00'),
  status: 'admission',
  stickerNotes: [
    { type: 'study', text: 'ECG', completed: true },
    { type: 'study', text: 'ECHO', completed: true },
    { type: 'critical', text: 'Trop 156' },
    { type: 'admitting', text: 'Cardio' },
  ],
  // ... más datos
}
```

### 3. Inicializar shiftDate

Al cargar los datos de ejemplo, también se establecerá:
```typescript
shiftDate: new Date('2026-01-24'),
shiftConfigured: true,
```

---

## Resultado Esperado

Un board completamente poblado con 25 pacientes que representa un turno real del 24/01/2026, con la fecha visible debajo del título. Esto permitirá continuar el desarrollo de otras funcionalidades con datos realistas para probar.

