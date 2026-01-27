

# Plan: Corregir Guardado de Cama y Nombre del Consultant

## Resumen

Hay dos problemas relacionados:

1. **Nombre del Consultant no aparece**: El badge lee `admission.consultant` pero el formulario escribe en `admission.consultantName`
2. **Número de cama no se guarda**: El `AdmissionForm` estaba en `PatientDetail` que está deshabilitado. No hay forma de editar la cama desde la UI actual

---

## Problema 1: Nombre del Consultant

### Causa Raíz

En `AdmissionBadge.tsx` línea 17:
```typescript
const consultant = admission.consultant || admission.consultantName;
```

El orden está mal - debería priorizar `consultantName` porque es donde escribe el formulario.

### Solución

Cambiar el orden de prioridad:

```typescript
const consultant = admission.consultantName || admission.consultant;
```

---

## Problema 2: Número de Cama no se Guarda

### Causa Raíz

El `AdmissionForm` donde se edita la cama está dentro de `PatientDetail`, pero ese componente está deshabilitado en `Index.tsx`. El badge `AdmissionBadge` solo muestra la info, no permite editarla.

### Solución

Hacer que el `AdmissionBadge` sea clickeable y abra un pequeño formulario para editar consultant y cama, o integrarlo en la UI existente.

**Opción elegida**: Crear un `AdmissionPopover` que se abra al hacer clic en el badge, permitiendo editar:
- Nombre del Consultant
- Número de Cama  
- Marcar Handover Completo

---

## Sección Técnica

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/AdmissionBadge.tsx` | Cambiar orden de prioridad del consultant, hacerlo clickeable para abrir popover de edición |
| `src/store/patientStore.ts` | Sincronizar `consultant` y `consultantName` en `updateAdmission` |
| `src/store/shiftHistoryStore.ts` | Asegurar migración bidireccional de consultant/consultantName |

### Cambio 1: AdmissionBadge.tsx

Convertirlo en un componente editable con popover:

```typescript
import { useState } from 'react';
import { AdmissionData } from '@/types/patient';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePatientStore } from '@/store/patientStore';

interface AdmissionBadgeProps {
  patientId: string;
  admission: AdmissionData;
  className?: string;
  readOnly?: boolean;
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.replace('Dr. ', '').replace('Dr ', '').split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
}

export function AdmissionBadge({ patientId, admission, className, readOnly }: AdmissionBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateAdmission } = usePatientStore();
  
  // Priorizar consultantName (donde escribe el formulario)
  const consultant = admission.consultantName || admission.consultant;
  
  if (!consultant && !admission.bedNumber) return null;
  
  const badge = (
    <div className={cn(
      "flex items-center gap-1 bg-cyan-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm",
      !readOnly && "cursor-pointer hover:bg-cyan-600",
      className
    )}>
      {consultant && (
        <span title={consultant}>
          {getInitials(consultant)}
        </span>
      )}
      {consultant && admission.bedNumber && (
        <span className="text-cyan-200">|</span>
      )}
      {admission.bedNumber && (
        <span className="font-bold">{admission.bedNumber}</span>
      )}
      {admission.handoverComplete && (
        <Check className="h-2.5 w-2.5 text-green-300 ml-0.5" />
      )}
    </div>
  );

  if (readOnly) {
    return <div className="absolute top-5 right-1 z-10">{badge}</div>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="absolute top-5 right-1 z-10">
          {badge}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="end">
        <div className="space-y-2">
          <Label className="text-xs">Consultant</Label>
          <Input
            placeholder="Dr. Smith"
            value={admission.consultantName || ''}
            onChange={(e) => updateAdmission(patientId, { 
              consultantName: e.target.value,
              consultant: e.target.value 
            })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Bed Number</Label>
          <Input
            placeholder="5N-23"
            value={admission.bedNumber || ''}
            onChange={(e) => updateAdmission(patientId, { bedNumber: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Handover Complete</Label>
          <Switch
            checked={admission.handoverComplete || false}
            onCheckedChange={(checked) => updateAdmission(patientId, { handoverComplete: checked })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Cambio 2: PatientSticker.tsx

Actualizar la llamada a AdmissionBadge para incluir `patientId`:

```typescript
{patient.admission && (patient.admission.consultant || patient.admission.consultantName || patient.admission.bedNumber) && (
  <AdmissionBadge 
    patientId={patient.id}
    admission={patient.admission}
    readOnly={isReadOnly}
  />
)}
```

### Cambio 3: patientStore.ts - Sincronizar campos

```typescript
updateAdmission: (patientId, data) => {
  set((state) => ({
    patients: state.patients.map((p) =>
      p.id === patientId && p.admission
        ? {
            ...p,
            admission: { 
              ...p.admission, 
              ...data,
              // Sincronizar consultant con consultantName si se actualiza uno
              consultant: data.consultantName ?? data.consultant ?? p.admission.consultant,
              consultantName: data.consultantName ?? data.consultant ?? p.admission.consultantName,
            },
          }
        : p
    ),
  }));
},
```

### Cambio 4: shiftHistoryStore.ts - Migración

Asegurar que la migración sincroniza ambos campos:

```typescript
function migrateHistoryPatient(patient: any): Patient {
  const consultantValue = patient.admission?.consultantName || patient.admission?.consultant || '';
  
  return {
    ...patient,
    // ... otros campos
    admission: patient.admission ? {
      ...patient.admission,
      consultant: consultantValue,
      consultantName: consultantValue,
      handoverComplete: patient.admission.handoverComplete ?? false,
    } : undefined,
  };
}
```

---

## Resultado Esperado

1. **Consultant visible**: El nombre del consultant aparecerá inmediatamente en el badge celeste
2. **Cama editable**: Al hacer clic en el badge, se abre un popover para editar:
   - Nombre del consultant
   - Número de cama
   - Estado del handover
3. **Datos sincronizados**: Los campos `consultant` y `consultantName` siempre tendrán el mismo valor
4. **Datos históricos**: La migración asegura que datos antiguos muestren correctamente el consultant

