
# Plan: Corregir visibilidad del formulario de admisión en el sticker

## Problema

Cuando cambias el proceso de un paciente a "Admission", el sistema crea un objeto `admission` con campos vacíos (`consultantName: ''`, `bedNumber: ''`). Pero la condición que decide si mostrar los campos de Consultant y Bed verifica que esos campos **tengan datos**:

```typescript
const hasAdmissionInfo = patient.admission && 
  (patient.admission.consultantName || patient.admission.consultant || patient.admission.bedNumber);
```

Como todos los campos están vacíos, la condición es `false` y los campos para ingresar el médico y la cama **nunca aparecen**. Es un círculo vicioso: no puedes llenar los datos porque los inputs no se muestran, y los inputs no se muestran porque los datos están vacíos.

Solo funciona en pacientes que ya tenían datos de admisión previos (cargados de sample data o migrados).

## Solución

Cambiar la condición para que también muestre los campos cuando el paciente está en un estado de admisión activo (`admission` o `admitted`), independientemente de si los campos ya tienen datos.

## Cambio

| Archivo | Cambio |
|---------|--------|
| `src/components/PatientSticker.tsx` | Modificar condición `hasAdmissionInfo` (línea 378) |

---

## Sección Técnica

### PatientSticker.tsx - Línea 378

```typescript
// ANTES:
const hasAdmissionInfo = patient.admission && 
  (patient.admission.consultantName || patient.admission.consultant || patient.admission.bedNumber);

// DESPUÉS:
const hasAdmissionInfo = patient.admission && 
  (processState === 'admission' || processState === 'admitted' || 
   patient.admission.consultantName || patient.admission.consultant || patient.admission.bedNumber);
```

Esto garantiza que:
- Cuando el coordinador cambia el estado a "Admission", los campos de Consultant y Bed aparecen inmediatamente (aunque estén vacíos)
- Si el paciente ya fue admitido (`admitted`), los campos siguen visibles
- Para otros estados (discharged, transferred), los campos solo aparecen si ya tenían datos (comportamiento actual preservado)
