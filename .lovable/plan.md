
# Plan: Sistema de Edicion y Eliminacion Completo en el Sticker

## Resumen

Implementar funcionalidades de edicion y eliminacion directamente en el sticker para permitir corregir errores sin necesidad de panel lateral. Incluye: eliminar pacientes, desmarcar/eliminar estudios, editar motivo de consulta, y cambiar medico/enfermera/ubicacion.

---

## Cambios Necesarios

### 1. Store - Agregar funcion para eliminar pacientes

**Archivo:** `src/store/patientStore.ts`

**Cambios:**
- Agregar accion `removePatient: (patientId: string) => void` a la interfaz
- Implementar la logica para filtrar el paciente del array

```text
Interfaz:
removePatient: (patientId: string) => void;

Implementacion:
removePatient: (patientId) => {
  set((state) => ({
    patients: state.patients.filter((p) => p.id !== patientId),
    selectedPatientId: state.selectedPatientId === patientId ? null : state.selectedPatientId,
  }));
},
```

---

### 2. Sticker - Menu contextual para eliminar paciente

**Archivo:** `src/components/PatientSticker.tsx`

**Cambios:**
- Agregar boton de menu (tres puntos) en esquina superior derecha del sticker
- Usar `DropdownMenu` con opcion "Eliminar paciente"
- Incluir dialogo de confirmacion usando `AlertDialog`

```text
Componente StickerMenu:
- Icono MoreVertical
- DropdownMenu con opciones:
  - "Eliminar paciente" (con confirmacion)
```

---

### 3. Sticker - Hacer editable el Chief Complaint

**Archivo:** `src/components/PatientSticker.tsx`

**Cambios:**
- Crear componente `EditableChiefComplaint` similar a `EditableBedNumber`
- Al hacer click en el motivo de consulta, se convierte en input editable
- Guardar con Enter o al perder foco, cancelar con Escape

**Requiere agregar al store:**
- `updatePatientChiefComplaint: (patientId: string, complaint: string) => void`

---

### 4. Sticker - Hacer editables Doctor, Nurse y Box

**Archivo:** `src/components/PatientSticker.tsx`

**Cambios:**
- Convertir las iniciales de Doctor/Nurse/Box en dropdowns clickeables
- Usar `DropdownMenu` compacto que muestra la lista del store
- Mostrar iniciales pero al clickear abre selector completo

```text
Componente RightColumnDropdown:
- Click en iniciales de medico -> Dropdown con lista de doctores
- Click en iniciales de enfermera -> Dropdown con lista de nurses
- Click en ubicacion -> Dropdown con lista de locations
```

---

### 5. Studies - Agregar opcion de eliminar

**Archivo:** `src/components/StickerNoteItem.tsx`

**Cambios:**
- Agregar icono X visible al hover en estudios (igual que otras notas)
- Permitir tanto toggle (click normal) como eliminar (click en X)

```text
Antes: Solo se puede marcar completado
Despues: Se puede marcar completado O eliminar con X
```

---

## Flujo de Interaccion Final

| Elemento | Accion | Resultado |
|----------|--------|-----------|
| Nombre paciente | Click en menu (3 puntos) | Abre menu con "Eliminar" |
| Chief Complaint | Click | Se convierte en input editable |
| Box (ej: B3) | Click | Dropdown para cambiar ubicacion |
| Iniciales medico | Click | Dropdown para cambiar medico |
| Iniciales enfermera | Click | Dropdown para cambiar enfermera |
| Estudio (CT, ECHO) | Click | Marca/desmarca completado |
| Estudio (CT, ECHO) | Hover + Click X | Elimina el estudio |
| Otras notas | Hover + Click X | Elimina la nota |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/store/patientStore.ts` | Agregar `removePatient` y `updatePatientChiefComplaint` |
| `src/components/PatientSticker.tsx` | Menu de sticker, Chief Complaint editable, dropdowns para doctor/nurse/box |
| `src/components/StickerNoteItem.tsx` | Agregar X para eliminar estudios |

---

## Detalles Tecnicos

### Nuevas acciones en el Store

```typescript
// En PatientStore interface
removePatient: (patientId: string) => void;
updatePatientChiefComplaint: (patientId: string, complaint: string) => void;

// Implementacion
removePatient: (patientId) => {
  set((state) => ({
    patients: state.patients.filter((p) => p.id !== patientId),
    selectedPatientId: state.selectedPatientId === patientId 
      ? null 
      : state.selectedPatientId,
  }));
},

updatePatientChiefComplaint: (patientId, complaint) => {
  set((state) => ({
    patients: state.patients.map((p) =>
      p.id === patientId ? { ...p, chiefComplaint: complaint } : p
    ),
  }));
},
```

### Componentes nuevos en PatientSticker

```typescript
// Menu de acciones del sticker
function StickerActionsMenu({ patientId, patientName }) {
  // MoreVertical icon + DropdownMenu
  // AlertDialog para confirmacion de eliminacion
}

// Chief Complaint editable
function EditableChiefComplaint({ patientId, complaint }) {
  // Similar a EditableBedNumber
  // Click -> Input -> Enter/Blur guarda
}

// Dropdown para Doctor/Nurse/Box
function StaffDropdown({ type, patientId, currentValue, options }) {
  // Muestra iniciales
  // Click abre dropdown con opciones completas
}
```

---

## Resultado Esperado

El coordinador puede corregir cualquier error directamente desde el sticker:
- Error en nombre del paciente -> Elimina y vuelve a crear (por seguridad no se edita el nombre)
- Error en CT marcado -> Hover y click en X para eliminar
- Error en motivo de consulta -> Click para editar inline
- Cambiar medico/enfermera/ubicacion -> Click en iniciales para abrir dropdown
