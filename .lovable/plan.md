

# Plan: Sistema de Board de Coordinación ED

## Resumen Ejecutivo

Reestructurar la aplicación a un **Board visual de coordinación** tipo grid que replica el sistema de hoja física con stickers. Incluye búsqueda rápida, contadores automáticos por staff, filtros por médico/enfermera, y opción de ocultar pacientes dados de alta.

---

## 1. Diseño del Sticker Unificado

Estructura de **3 columnas verticales** con área central flexible para notas:

```text
+------------------------------------------------------+
| Mary Johnson    2h15  | [checkmark] CT  |     B3    |
| 15/03/1985            | [ ] ECHO        |     DS    |
| M00012345             | Trop 85         |     MG    |
|                       | Flu A +         |           |
|                       | Dr. Adams       |           |
|                       | [+ Add]         |           |
+-------------------------------------------------------
| Chest pain, shortness of breath        [Evaluation] |
+------------------------------------------------------+
```

| Columna | Contenido |
|---------|-----------|
| **Izquierda** | Nombre + tiempo, DOB, M-Number |
| **Medio** | Area flexible: estudios con checkbox, notas, valores criticos, follow-ups, precauciones |
| **Derecha** | Box (arriba), Doctor iniciales (medio), Nurse iniciales (abajo) |
| **Fila inferior** | Chief Complaint + Badge de estado |

### Tipos de notas en columna central:

| Tipo | Ejemplos | Visual |
|------|----------|--------|
| **Estudios** | CT, ECHO, ECG, US, X-Ray | Checkbox |
| **Follow-up** | Women's Clinic, GP, RACC | Tag verde |
| **Valor critico** | Trop 85, K+ 6.2, Hb 7 | Tag rojo/amarillo |
| **Precaucion** | Flu A +, COVID +, MRSA | Tag naranja |
| **Medico admision** | Dr. Adams (admitting) | Tag morado |
| **Nota libre** | Cualquier texto | Tag gris |

### Estados visuales:
- **Posible Admision**: Fondo azul semi-transparente (highlighter azul)
- **Cama Asignada**: Numero de cama visible sobre el highlight
- **Alta/Discharged**: Linea diagonal de abajo-izquierda a arriba-derecha

---

## 2. Sistema de Filtrado del Board

### 2.1 Filtros disponibles

| Filtro | Descripcion | Como activar |
|--------|-------------|--------------|
| **Por Enfermera** | Ver solo pacientes de una enfermera | Click en nombre/contador de enfermera |
| **Por Medico** | Ver solo pacientes de un medico | Click en nombre/contador de medico |
| **Ocultar Discharged** | Quitar dados de alta del board | Toggle switch en header |

### 2.2 Barra de filtros en BoardHeader

```text
+------------------------------------------------------------------------+
| ED Coordination Board                                                   |
|                                                                         |
| [Search...]  [Hide Discharged: ON/OFF]  [+ New Patient]  [Shift Setup] |
|                                                                         |
| Physicians: Dr.Smith(8) Dr.Johnson(5) | Nurses: M.Garcia(6) A.Brown(7) |
|                                        |                                |
| [Clear Filter]  Showing: All patients (24 active, 8 discharged)        |
+------------------------------------------------------------------------+
```

### 2.3 Comportamiento de filtros

- **Click en contador de staff**: Activa filtro para ese staff
- **Filtro activo**: Se muestra badge "Filtering by: Dr. Smith" con boton X para limpiar
- **Toggle Hide Discharged**: ON por defecto para vista limpia
- **Multiples filtros**: Se pueden combinar (ej: "Nurse Garcia" + "Hide Discharged")

---

## 3. Cambios en el Modelo de Datos

### Archivo: `src/types/patient.ts`

**Nuevos campos en interfaz `Patient`:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `dateOfBirth` | `string` | Fecha nacimiento (DD/MM/YYYY) |
| `mNumber` | `string` | Numero M (M00012345) |
| `chiefComplaint` | `string` | Motivo de consulta |
| `nurse` | `string` | Enfermera asignada |
| `stickerNotes` | `StickerNote[]` | Notas de la columna central |

**Nueva interfaz `StickerNote`:**

```typescript
type StickerNoteType = 
  | 'study'        // CT, ECHO, ECG, etc. con checkbox
  | 'followup'     // Women's Clinic, GP, RACC
  | 'critical'     // Valores criticos: Trop 85, K+ 6.2
  | 'precaution'   // Flu A +, COVID +, MRSA
  | 'admitting'    // Medico que admite
  | 'note';        // Nota libre

interface StickerNote {
  id: string;
  type: StickerNoteType;
  text: string;
  completed?: boolean;  // Solo para type 'study'
  createdAt: Date;
}
```

**Constantes predefinidas:**

```typescript
const STUDY_OPTIONS = ['CT', 'ECHO', 'ECG', 'US', 'X-Ray', 'Vascular'];
const FOLLOWUP_OPTIONS = ['GP', 'Women\'s Clinic', 'RACC', 'Fracture Clinic', 'Surgical Clinic'];
const PRECAUTION_OPTIONS = ['Flu A +', 'Flu B +', 'COVID +', 'MRSA', 'Isolation'];

const NOTE_TYPE_CONFIG = {
  study: { label: 'Study', color: 'bg-blue-500/20' },
  followup: { label: 'Follow-up', color: 'bg-green-500/20' },
  critical: { label: 'Critical Value', color: 'bg-red-500/20' },
  precaution: { label: 'Precaution', color: 'bg-orange-500/20' },
  admitting: { label: 'Admitting MD', color: 'bg-purple-500/20' },
  note: { label: 'Note', color: 'bg-gray-500/20' },
};
```

---

## 4. Cambios en el Store

### Archivo: `src/store/patientStore.ts`

**Nuevo estado:**

| Campo | Tipo | Default |
|-------|------|---------|
| `nurses` | `string[]` | Lista de enfermeras del turno |
| `searchQuery` | `string` | Busqueda global |
| `filterByDoctor` | `string or null` | Filtrar por medico |
| `filterByNurse` | `string or null` | Filtrar por enfermera |
| `hideDischargedFromBoard` | `boolean` | Ocultar dados de alta (default: true) |

**Nuevas acciones:**

| Accion | Descripcion |
|--------|-------------|
| `addNurse(name)` | Anadir enfermera |
| `updateNurse(oldName, newName)` | Editar nombre |
| `removeNurse(name)` | Eliminar enfermera |
| `updatePatientNurse(patientId, nurse)` | Asignar enfermera |
| `addStickerNote(patientId, note)` | Anadir nota al sticker |
| `updateStickerNote(patientId, noteId, updates)` | Editar nota |
| `removeStickerNote(patientId, noteId)` | Quitar nota |
| `toggleStudyCompleted(patientId, noteId)` | Toggle checkbox estudio |
| `setSearchQuery(query)` | Filtrar por busqueda |
| `setFilterByDoctor(doctor)` | Filtrar por medico |
| `setFilterByNurse(nurse)` | Filtrar por enfermera |
| `setHideDischargedFromBoard(hide)` | Toggle ocultar discharged |
| `clearFilters()` | Limpiar todos los filtros |
| `clearShift()` | Limpiar turno |

**Selector de pacientes filtrados:**

```typescript
// Funcion para obtener pacientes filtrados
const getFilteredPatients = (state) => {
  let result = state.patients;
  
  // Filtrar por busqueda
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.mNumber.toLowerCase().includes(query) ||
      p.doctor.toLowerCase().includes(query) ||
      p.nurse?.toLowerCase().includes(query) ||
      p.chiefComplaint.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por medico
  if (state.filterByDoctor) {
    result = result.filter(p => p.doctor === state.filterByDoctor);
  }
  
  // Filtrar por enfermera
  if (state.filterByNurse) {
    result = result.filter(p => p.nurse === state.filterByNurse);
  }
  
  // Ocultar discharged
  if (state.hideDischargedFromBoard) {
    result = result.filter(p => p.status !== 'discharged');
  }
  
  return result;
};
```

---

## 5. Nuevos Componentes

### 5.1 `src/components/PatientSticker.tsx`

Componente principal con layout de 3 columnas.

**Props:**
- `patient`: Datos del paciente
- `onClick`: Handler para seleccionar
- `isSelected`: Estado de seleccion

**Estructura visual:**
- Columna izquierda: Nombre + tiempo, DOB, M-Number
- Columna central: StickerNotesColumn
- Columna derecha: Box, Dr iniciales, Nurse iniciales
- Fila inferior: Chief Complaint + Badge estado

**Estilos condicionales:**
- `.sticker-admission`: Fondo azul para admisiones pendientes
- `.sticker-discharged`: Linea diagonal para dados de alta

### 5.2 `src/components/StickerNotesColumn.tsx`

Columna central con notas flexibles:
- Lista de notas existentes
- Boton [+] para anadir nuevas
- Maneja checkbox de estudios

### 5.3 `src/components/StickerNoteItem.tsx`

Cada nota individual:
- Para estudios: Checkbox + texto
- Para otros: Tag con color segun tipo

### 5.4 `src/components/AddNotePopover.tsx`

Popover para anadir notas:
- Selector de tipo (Study, Follow-up, Critical, etc.)
- Input o select segun tipo
- Boton Add

### 5.5 `src/components/PatientBoard.tsx`

Grid principal con stickers:
- Responsive: 2-5 columnas segun pantalla
- Muestra solo pacientes filtrados

### 5.6 `src/components/BoardHeader.tsx`

Header completo con:
- Titulo
- SearchBar
- Toggle "Hide Discharged"
- Boton "+ New Patient"
- StaffCounters (clickeables para filtrar)
- Indicador de filtro activo con boton limpiar
- ShiftSetup

### 5.7 `src/components/StaffCounters.tsx`

Contadores por medico y enfermera:
- Muestra: "Dr. Smith: 8 | Dr. Johnson: 5"
- Click en nombre activa filtro
- Resalta el staff actualmente filtrado

### 5.8 `src/components/SearchBar.tsx`

Barra de busqueda global.

### 5.9 `src/components/FilterIndicator.tsx`

Muestra filtros activos:

```text
Filtering by: Dr. Smith [X]  |  Hiding discharged [X]
```

---

## 6. Modificacion de Componentes Existentes

### 6.1 `src/components/ShiftSetup.tsx`

- Anadir tab "Nurses" (identica a Physicians)
- Anadir boton "Clear Shift" con AlertDialog confirmacion

### 6.2 `src/components/NewPatientForm.tsx`

Nuevos campos en orden:
1. Patient Name
2. Date of Birth (date picker)
3. M-Number (input con formato M00000000)
4. Chief Complaint (textarea)
5. Box / Location
6. Attending Physician
7. Nurse (opcional)

### 6.3 `src/pages/Index.tsx`

Nuevo layout:
- Board principal ocupa todo el ancho
- Panel lateral de detalle aparece cuando hay seleccion

---

## 7. Estilos CSS

### Archivo: `src/index.css`

```css
/* Sticker base */
.sticker {
  @apply p-2 rounded-lg border bg-card text-sm;
}

/* Highlight azul para admision */
.sticker-admission {
  @apply bg-blue-500/20 border-blue-400/50;
}

/* Linea diagonal para discharged */
.sticker-discharged {
  position: relative;
  opacity: 0.6;
}
.sticker-discharged::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top right,
    transparent calc(50% - 1px),
    hsl(var(--muted-foreground) / 0.5) calc(50% - 1px),
    hsl(var(--muted-foreground) / 0.5) calc(50% + 1px),
    transparent calc(50% + 1px)
  );
  pointer-events: none;
}

/* Staff counter clickeable */
.staff-counter {
  @apply px-2 py-1 rounded cursor-pointer hover:bg-accent;
}
.staff-counter-active {
  @apply bg-primary text-primary-foreground;
}
```

---

## 8. Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/PatientSticker.tsx` | Sticker de 3 columnas |
| `src/components/StickerNotesColumn.tsx` | Columna central flexible |
| `src/components/StickerNoteItem.tsx` | Nota individual |
| `src/components/AddNotePopover.tsx` | Popover para anadir notas |
| `src/components/PatientBoard.tsx` | Grid principal |
| `src/components/BoardHeader.tsx` | Header con busqueda y filtros |
| `src/components/SearchBar.tsx` | Barra de busqueda |
| `src/components/StaffCounters.tsx` | Contadores clickeables |
| `src/components/FilterIndicator.tsx` | Indicador de filtros activos |

## 9. Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/types/patient.ts` | Nuevos tipos: dateOfBirth, mNumber, chiefComplaint, nurse, stickerNotes, StickerNote |
| `src/store/patientStore.ts` | nurses[], filtros, searchQuery, acciones CRUD |
| `src/components/ShiftSetup.tsx` | Tab Nurses + Clear Shift |
| `src/components/NewPatientForm.tsx` | Nuevos campos |
| `src/pages/Index.tsx` | Layout Board + Panel |
| `src/index.css` | Estilos sticker y filtros |

---

## 10. Orden de Implementacion

1. **Fase 1**: Actualizar tipos (`patient.ts`)
2. **Fase 2**: Actualizar store (`patientStore.ts`) con filtros
3. **Fase 3**: Modificar ShiftSetup (tab Nurses + Clear Shift)
4. **Fase 4**: Modificar NewPatientForm (nuevos campos)
5. **Fase 5**: Crear StickerNoteItem y StickerNotesColumn
6. **Fase 6**: Crear AddNotePopover
7. **Fase 7**: Crear PatientSticker
8. **Fase 8**: Crear SearchBar
9. **Fase 9**: Crear StaffCounters (clickeables)
10. **Fase 10**: Crear FilterIndicator
11. **Fase 11**: Crear BoardHeader
12. **Fase 12**: Crear PatientBoard
13. **Fase 13**: Actualizar Index.tsx
14. **Fase 14**: Estilos CSS

