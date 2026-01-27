

# Plan: Separación de Ubicación Física y Estado de Proceso

## Resumen

Rediseñar el modelo de datos del paciente para separar claramente:
1. **Ubicación física** (dónde está el paciente ahora)
2. **Estado del proceso clínico** (en qué etapa del flujo está)
3. **Triage** (categorización Manchester 1-5 con colores)
4. **Info de admisión** (consultant, cama, estado)

Las iniciales del médico y enfermera **siempre estarán visibles**.

---

## Nuevo Modelo de Datos

### Ubicaciones Físicas (dónde está el cuerpo)

```text
ED_LOCATIONS (lugares dentro del ED):
- Box 1, Box 2, Box 3, Box 4, Box 5, Box 6
- Waiting Room
- Treatment Room
- Procedure Room
- Resus

EXTERNAL_LOCATIONS (fuera del ED temporalmente):
- CT Room
- MRI Room
- X-Ray Room
- US Room
- Echo Room
- RACC

FINAL_DESTINATIONS (ya no en ED):
- Ward (admitido)
- Home (dado de alta)
- Transfer Hospital
```

### Estados del Proceso Clínico (flujo lógico)

```text
PROCESS_STATES:
1. registered        → Recién registrado
2. triaged           → Triageado, esperando ser visto
3. being_seen        → Siendo evaluado por médico
4. awaiting_results  → Esperando resultados (labs, imaging)
5. results_review    → Resultados listos, médico revisando
6. disposition       → Decisión tomada (admission/discharge/transfer)
7. admission_pending → Aceptado, esperando cama
8. bed_assigned      → Cama asignada, pendiente handover
9. ready_transfer    → Handover completo, listo para subir
10. discharged       → Dado de alta
11. transferred      → Transferido a otro hospital
12. admitted         → Admitido (ya en ward)
```

### Triage Manchester (1-5)

```text
TRIAGE_CATEGORIES:
1 - Immediate (Rojo)     → Resus, atención inmediata
2 - Very Urgent (Naranja) → 10 min
3 - Urgent (Amarillo)     → 60 min
4 - Standard (Verde)      → 120 min
5 - Non-Urgent (Azul)     → 240 min
```

---

## Visualización del Nuevo Sticker

### Paciente en su Box (3 filas en columna staff)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ▲ [⋮] John Smith Johnson      2h15  │ CT EC US │   B3   │  ← Box asignado
│ 2     15/03/1972                    │ Lb Fb ── │   TM   │  ← Doctor (siempre)
│       M12345678                     │          │   RN   │  ← Nurse (siempre)
├──────────────────────────────────────────────────────────────────────────┤
│ Chest pain                                    [Awaiting Results]        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Paciente fuera de su Box (4 filas en columna staff)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ▲ [⋮] John Smith Johnson      2h15  │ CT EC US │   B3   │  ← Box asignado
│ 2     15/03/1972                    │ Lb Fb ── │  →CT   │  ← Ubicación actual
│       M12345678                     │          │   TM   │  ← Doctor (siempre)
│                                     │          │   RN   │  ← Nurse (siempre)
├──────────────────────────────────────────────────────────────────────────┤
│ Chest pain                                    [Awaiting Results]        │
└──────────────────────────────────────────────────────────────────────────┘

"→CT" indica que el paciente está temporalmente en CT Room
```

### Paciente en Proceso de Admisión

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ▲ [⋮] Maria Lopez          3h45    │ CT EC ── │  B5    │
│ 3     22/08/1955           ┌───────────────────┐ TM    │  ← Doctor
│       M98765432            │ Dr.Ruiz │ 5N-23  ││ RN    │  ← Nurse
├────────────────────────────┴─────────┴────────┴┴───────┴─────────────────┤
│ Pneumonia                                          [Bed Assigned] ✓     │
└──────────────────────────────────────────────────────────────────────────┘

Badge celeste superpuesto muestra:
- Consultant: Dr. Ruiz
- Cama: 5N-23
- ✓ = Handover completo
```

---

## Estructura de la Columna 3 (Staff)

### Siempre visible:

| Fila | Contenido | Siempre visible |
|------|-----------|-----------------|
| 1 | Box asignado (B1-B6, WR, TR) | ✓ |
| 2 | Ubicación actual (solo si ≠ box) | Condicional |
| 3 | Doctor initials | ✓ SIEMPRE |
| 4 | Nurse initials | ✓ SIEMPRE |

### Lógica de visualización:

```typescript
// Si paciente está en su box asignado:
// Mostrar: Box, Doctor, Nurse (3 filas)

// Si paciente está fuera de su box:
// Mostrar: Box, →Ubicación, Doctor, Nurse (4 filas)
```

---

## Sección Técnica

### 1. Nuevos Tipos en patient.ts

```typescript
// Triage Categories (Manchester)
export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export const TRIAGE_CONFIG: Record<TriageLevel, { label: string; color: string; time: string }> = {
  1: { label: 'Immediate', color: 'bg-red-500 text-white', time: '0 min' },
  2: { label: 'Very Urgent', color: 'bg-orange-500 text-white', time: '10 min' },
  3: { label: 'Urgent', color: 'bg-yellow-500 text-black', time: '60 min' },
  4: { label: 'Standard', color: 'bg-green-500 text-white', time: '120 min' },
  5: { label: 'Non-Urgent', color: 'bg-blue-500 text-white', time: '240 min' },
};

// Physical Locations
export const ED_LOCATIONS = [
  'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5', 'Box 6',
  'Waiting Room', 'Treatment Room', 'Procedure Room', 'Resus'
] as const;

export const IMAGING_LOCATIONS = [
  'CT Room', 'MRI Room', 'X-Ray Room', 'US Room', 'Echo Room', 'RACC'
] as const;

export const ALL_LOCATIONS = [...ED_LOCATIONS, ...IMAGING_LOCATIONS] as const;

// Process States (clinical workflow)
export type ProcessState = 
  | 'registered'
  | 'triaged'
  | 'being_seen'
  | 'awaiting_results'
  | 'results_review'
  | 'disposition'
  | 'admission_pending'
  | 'bed_assigned'
  | 'ready_transfer'
  | 'discharged'
  | 'transferred'
  | 'admitted';

export const PROCESS_STATES: { value: ProcessState; label: string; color: string }[] = [
  { value: 'registered', label: 'Registered', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'triaged', label: 'Triaged', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'being_seen', label: 'Being Seen', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'results_review', label: 'Results Review', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'disposition', label: 'Disposition', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { value: 'admission_pending', label: 'Admission Pending', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'bed_assigned', label: 'Bed Assigned', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'ready_transfer', label: 'Ready Transfer', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'discharged', label: 'Discharged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'transferred', label: 'Transferred', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'admitted', label: 'Admitted', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
];

// Location abbreviations
export const LOCATION_ABBREVIATIONS: Record<string, string> = {
  'Box 1': 'B1', 'Box 2': 'B2', 'Box 3': 'B3', 
  'Box 4': 'B4', 'Box 5': 'B5', 'Box 6': 'B6',
  'Waiting Room': 'WR', 'Treatment Room': 'TR',
  'Procedure Room': 'PR', 'Resus': 'RS',
  'CT Room': 'CT', 'MRI Room': 'MRI', 'X-Ray Room': 'XR',
  'US Room': 'US', 'Echo Room': 'EC', 'RACC': 'RA',
};

// Updated Patient interface
export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  mNumber: string;
  chiefComplaint: string;
  
  // NEW: Triage, Location, and Process State
  triageLevel: TriageLevel;
  assignedBox: string;           // Box donde "vive" (Box 1-6, Treatment Room, etc.)
  currentLocation: string;       // Ubicación física actual (puede ser CT Room, MRI, etc.)
  processState: ProcessState;    // Estado del flujo clínico
  
  doctor: string;                // SIEMPRE visible
  nurse: string;                 // SIEMPRE visible
  arrivalTime: Date;
  
  // Deprecated (keep for migration)
  status: PatientStatus;
  box: string;
  
  orders: Order[];
  stickerNotes: StickerNote[];
  admission?: AdmissionData;
  dischargedAt?: Date;
  transferredTo?: string;
  events: PatientEvent[];
}

// Updated AdmissionData
export interface AdmissionData {
  consultant: string;           // Nombre del consultant que acepta
  specialty: string;            // Med Reg, Surg Reg, Cardio Reg, etc.
  bedNumber: string;            // "5N-23" (Ward + cama)
  handoverComplete: boolean;    // Handover nurse-to-nurse completado
  // ... existing fields remain
}
```

### 2. Nuevo Componente: TriageBadge.tsx

```typescript
import { TriageLevel, TRIAGE_CONFIG } from '@/types/patient';
import { cn } from '@/lib/utils';

interface TriageBadgeProps {
  level: TriageLevel;
  className?: string;
}

export function TriageBadge({ level, className }: TriageBadgeProps) {
  const config = TRIAGE_CONFIG[level];
  
  // Triángulo en esquina superior izquierda
  return (
    <div 
      className={cn("absolute top-0 left-0", className)}
      title={`Triage ${level}: ${config.label} (${config.time})`}
    >
      {/* Triángulo con CSS borders */}
      <div 
        className={cn(
          "w-0 h-0",
          "border-l-[20px] border-t-[20px]",
          "border-r-[20px] border-r-transparent",
          "border-b-[20px] border-b-transparent",
          level === 1 && "border-l-red-500 border-t-red-500",
          level === 2 && "border-l-orange-500 border-t-orange-500",
          level === 3 && "border-l-yellow-500 border-t-yellow-500",
          level === 4 && "border-l-green-500 border-t-green-500",
          level === 5 && "border-l-blue-500 border-t-blue-500",
        )}
      />
      <span className={cn(
        "absolute top-[2px] left-[4px] text-[10px] font-bold",
        level === 3 ? "text-black" : "text-white"
      )}>
        {level}
      </span>
    </div>
  );
}
```

### 3. Nuevo Componente: AdmissionBadge.tsx

```typescript
import { AdmissionData } from '@/types/patient';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdmissionBadgeProps {
  admission: AdmissionData;
  className?: string;
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.replace('Dr. ', '').replace('Dr ', '').split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
}

export function AdmissionBadge({ admission, className }: AdmissionBadgeProps) {
  if (!admission.consultant && !admission.bedNumber) return null;
  
  return (
    <div className={cn(
      "absolute top-6 right-1 bg-cyan-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm",
      className
    )}>
      <div className="flex items-center gap-1">
        {admission.consultant && (
          <span title={admission.consultant}>
            {getInitials(admission.consultant)}
          </span>
        )}
        {admission.consultant && admission.bedNumber && (
          <span className="text-cyan-200">|</span>
        )}
        {admission.bedNumber && (
          <span className="font-bold">{admission.bedNumber}</span>
        )}
        {admission.handoverComplete && (
          <Check className="h-2.5 w-2.5 text-green-300 ml-0.5" />
        )}
      </div>
    </div>
  );
}
```

### 4. Actualizar PatientSticker.tsx - Columna Staff

```typescript
// Columna 3: Box + Ubicación (si diferente) + Doctor + Nurse
// SIEMPRE muestra Doctor y Nurse

const isAwayFromBox = patient.currentLocation !== patient.assignedBox;

<div className="flex flex-col items-center justify-between py-0.5">
  {/* Fila 1: Box asignado (siempre) */}
  <StaffDropdown
    type="box"
    patientId={patient.id}
    currentValue={patient.assignedBox}
    options={ED_LOCATIONS}
    displayValue={LOCATION_ABBREVIATIONS[patient.assignedBox] || patient.assignedBox}
  />
  
  {/* Fila 2: Ubicación actual (solo si está fuera del box) */}
  {isAwayFromBox && (
    <LocationDropdown
      patientId={patient.id}
      currentValue={patient.currentLocation}
      options={ALL_LOCATIONS}
      displayValue={`→${LOCATION_ABBREVIATIONS[patient.currentLocation] || patient.currentLocation}`}
    />
  )}
  
  {/* Fila 3: Doctor (SIEMPRE) */}
  <StaffDropdown
    type="doctor"
    patientId={patient.id}
    currentValue={patient.doctor}
    options={doctors}
    displayValue={getInitials(patient.doctor)}
  />
  
  {/* Fila 4: Nurse (SIEMPRE) */}
  <StaffDropdown
    type="nurse"
    patientId={patient.id}
    currentValue={patient.nurse}
    options={nurses}
    displayValue={getInitials(patient.nurse)}
  />
</div>
```

### 5. Actualizar Footer del Sticker

```typescript
// Footer: Chief Complaint + ProcessState (no Status)
<div className="flex items-center justify-between gap-2 pt-1.5 mt-1.5 border-t border-border/50">
  <EditableChiefComplaint 
    patientId={patient.id}
    complaint={patient.chiefComplaint}
  />
  
  <ProcessStateDropdown 
    patientId={patient.id}
    currentState={patient.processState}
  />
</div>

// Triage badge (esquina superior izquierda)
<TriageBadge level={patient.triageLevel} />

// Admission badge (si tiene consultant asignado)
{patient.admission?.consultant && (
  <AdmissionBadge admission={patient.admission} />
)}
```

### 6. Actualizar Store con nuevas acciones

```typescript
// patientStore.ts - nuevas acciones

updatePatientTriage: (patientId: string, level: TriageLevel) => {
  set((state) => ({
    patients: state.patients.map((p) =>
      p.id === patientId ? { ...p, triageLevel: level } : p
    ),
  }));
},

updatePatientAssignedBox: (patientId: string, box: string) => {
  set((state) => ({
    patients: state.patients.map((p) =>
      p.id === patientId ? { 
        ...p, 
        assignedBox: box,
        currentLocation: box, // Reset current location when box changes
      } : p
    ),
  }));
},

updatePatientCurrentLocation: (patientId: string, location: string) => {
  set((state) => ({
    patients: state.patients.map((p) =>
      p.id === patientId ? { ...p, currentLocation: location } : p
    ),
  }));
},

updatePatientProcessState: (patientId: string, state: ProcessState) => {
  // ... con lógica de eventos
},

updateAdmissionConsultant: (patientId: string, consultant: string) => {
  // ...
},

updateAdmissionBed: (patientId: string, bedNumber: string) => {
  // ...
},

completeHandover: (patientId: string) => {
  // ...
},
```

### 7. Migración de datos existentes

```typescript
// En el store, al cargar datos:
function migratePatient(patient: Patient): Patient {
  return {
    ...patient,
    triageLevel: patient.triageLevel ?? 3,
    assignedBox: patient.assignedBox ?? patient.box ?? 'Waiting Room',
    currentLocation: patient.currentLocation ?? patient.box ?? 'Waiting Room',
    processState: patient.processState ?? mapStatusToProcess(patient.status),
  };
}

function mapStatusToProcess(status: PatientStatus): ProcessState {
  const map: Partial<Record<PatientStatus, ProcessState>> = {
    'waiting_room': 'triaged',
    'treatment_room': 'being_seen',
    'review': 'results_review',
    'ct': 'awaiting_results',
    'mri': 'awaiting_results',
    'echo': 'awaiting_results',
    'vascular': 'awaiting_results',
    'admission': 'admission_pending',
    'discharged': 'discharged',
    'transferred': 'transferred',
  };
  return map[status] ?? 'registered';
}
```

---

## Búsqueda Mejorada

```typescript
const matchesSearch = (patient: Patient, query: string): boolean => {
  const q = query.toLowerCase();
  
  // Ubicación física actual
  if (patient.currentLocation.toLowerCase().includes(q)) return true;
  if (LOCATION_ABBREVIATIONS[patient.currentLocation]?.toLowerCase() === q) return true;
  
  // Estado del proceso
  const stateConfig = PROCESS_STATES.find(s => s.value === patient.processState);
  if (stateConfig?.label.toLowerCase().includes(q)) return true;
  
  // Triage (ej: "triage 1", "rojo", "1")
  if (q === String(patient.triageLevel)) return true;
  if (TRIAGE_CONFIG[patient.triageLevel].label.toLowerCase().includes(q)) return true;
  
  // Admisión
  if (patient.admission?.consultant?.toLowerCase().includes(q)) return true;
  if (patient.admission?.bedNumber?.toLowerCase().includes(q)) return true;
  
  // Búsquedas existentes
  if (patient.name.toLowerCase().includes(q)) return true;
  if (patient.mNumber.toLowerCase().includes(q)) return true;
  if (patient.doctor.toLowerCase().includes(q)) return true;
  if (patient.nurse.toLowerCase().includes(q)) return true;
  if (patient.chiefComplaint.toLowerCase().includes(q)) return true;
  
  return false;
};
```

---

## Archivos a Modificar/Crear

| Archivo | Cambios |
|---------|---------|
| `src/types/patient.ts` | Agregar TriageLevel, ProcessState, LOCATION_ABBREVIATIONS, actualizar interfaces |
| `src/components/TriageBadge.tsx` | **NUEVO** - Triángulo de triage Manchester |
| `src/components/AdmissionBadge.tsx` | **NUEVO** - Badge celeste con consultant + cama |
| `src/components/ProcessStateDropdown.tsx` | **NUEVO** - Selector de estado del proceso |
| `src/components/LocationDropdown.tsx` | **NUEVO** - Selector de ubicación actual |
| `src/components/PatientSticker.tsx` | Integrar badges, columna 3 con 4 filas, footer con ProcessState |
| `src/store/patientStore.ts` | Nuevas acciones + migración de datos |
| `src/components/SearchBar.tsx` | Búsqueda inteligente |
| `src/components/NewPatientForm.tsx` | Agregar selector de triage |

