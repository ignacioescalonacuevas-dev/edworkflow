
# Plan: Corregir Edición del Nombre del Consultant en Admisiones

## Problema Identificado

Cuando se cambia el proceso del paciente a "Admission Pending" usando el dropdown de estado, **el objeto `admission` no se crea automáticamente**. Esto causa que:

1. El `ConsultantNameDisplay` aparece y permite abrir el popover
2. Pero al intentar escribir el nombre, `updateAdmission` falla silenciosamente porque `patient.admission` es `undefined`

La condición en `updateAdmission` es:
```typescript
if (p.id !== patientId || !p.admission) return p;  // No hace nada si admission no existe
```

---

## Solución

Hay dos cambios necesarios:

### Cambio 1: Crear objeto `admission` al entrar en proceso de admisión

Cuando `updatePatientProcessState` cambia a un estado de admisión (`admission_pending`, `bed_assigned`, `ready_transfer`), automáticamente crear el objeto `admission` si no existe.

**Archivo**: `src/store/patientStore.ts`

En la función `updatePatientProcessState` (línea ~413), agregar lógica para crear admission:

```typescript
updatePatientProcessState: (patientId, processState) => {
  const stateLabel = PROCESS_STATES.find(s => s.value === processState)?.label || processState;
  const isAdmissionState = ['admission_pending', 'bed_assigned', 'ready_transfer'].includes(processState);
  
  set((state) => ({
    patients: state.patients.map((p) => {
      if (p.id !== patientId) return p;
      
      return {
        ...p,
        processState,
        // Crear admission si entramos en estado de admisión y no existe
        admission: isAdmissionState && !p.admission ? {
          specialty: '',
          consultantName: '',
          consultant: '',
          bedNumber: '',
          bedStatus: 'not_assigned',
          handoverComplete: false,
          registrarCalled: false,
          adminComplete: false,
          idBraceletVerified: false,
          mrsaSwabs: false,
          fallsAssessment: false,
          handoverNotes: '',
          startedAt: new Date(),
        } : p.admission,
        events: [
          ...p.events,
          {
            id: generateId(),
            timestamp: new Date(),
            type: 'process_state_change',
            description: `Process state changed to: ${stateLabel}`,
          },
        ],
      };
    }),
  }));
},
```

### Cambio 2: Hacer que `updateAdmission` cree el objeto si no existe

Como seguridad adicional, si se intenta actualizar admission pero no existe, crearlo:

**Archivo**: `src/store/patientStore.ts`

En la función `updateAdmission` (línea ~790):

```typescript
updateAdmission: (patientId, data) => {
  set((state) => ({
    patients: state.patients.map((p) => {
      if (p.id !== patientId) return p;
      
      // Si no existe admission, crear uno nuevo con los datos
      const existingAdmission = p.admission || {
        specialty: '',
        consultantName: '',
        consultant: '',
        bedNumber: '',
        bedStatus: 'not_assigned' as const,
        handoverComplete: false,
        registrarCalled: false,
        adminComplete: false,
        idBraceletVerified: false,
        mrsaSwabs: false,
        fallsAssessment: false,
        handoverNotes: '',
        startedAt: new Date(),
      };
      
      // Sincronizar consultant y consultantName
      const newConsultantName = data.consultantName ?? data.consultant ?? existingAdmission.consultantName;
      const newConsultant = data.consultantName ?? data.consultant ?? existingAdmission.consultant;
      
      return {
        ...p,
        admission: { 
          ...existingAdmission, 
          ...data,
          consultantName: newConsultantName,
          consultant: newConsultant,
        },
      };
    }),
  }));
},
```

---

## Sección Técnica

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/store/patientStore.ts` | Modificar `updatePatientProcessState` para crear admission al entrar en estados de admisión, y modificar `updateAdmission` para crear admission si no existe |

### Flujo Después del Fix

1. Usuario cambia estado a "Admission Pending" via ProcessStateDropdown
2. `updatePatientProcessState` detecta que es estado de admisión
3. Se crea automáticamente el objeto `admission` con campos vacíos
4. Usuario hace clic en `[+ Consultant]` 
5. Se abre popover y puede escribir el nombre
6. `updateAdmission` actualiza el consultant correctamente

---

## Resultado Esperado

- Cuando se cambia el estado a "Admission Pending", "Bed Assigned" o "Ready Transfer", el sistema crea automáticamente el objeto de admisión
- El campo `[+ Consultant]` funciona correctamente para escribir el nombre del médico que admite
- El nombre del consultant (diferente a los médicos de ED) se guarda y muestra correctamente
