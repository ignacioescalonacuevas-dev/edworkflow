
# Plan: Memoria de Preferencias de Posición por Tipo de Nota

## Resumen

Agregar un sistema que recuerde dónde coloca el usuario cada tipo de nota y aplique automáticamente esa posición para nuevos pacientes.

---

## Cómo Funciona

```text
Escenario:
1. Usuario agrega "CT" → va al primer slot disponible (slot 0)
2. Usuario arrastra "CT" al slot 5
3. Sistema guarda: "study:CT prefiere slot 5"
4. Usuario agrega otro paciente y agrega "CT"
5. El "CT" aparece automáticamente en slot 5 (si está libre)
```

---

## Cambios Necesarios

### 1. Agregar Estado de Preferencias

**Archivo:** `src/store/patientStore.ts`

Nuevo campo en el store que mapea tipo+texto de nota a su slot preferido:

```typescript
// Nuevo estado
noteSlotPreferences: Record<string, number>;
// Ejemplo: { "study:CT": 5, "precaution:Flu A +": 8 }
```

---

### 2. Guardar Preferencia al Mover Nota

**Archivo:** `src/store/patientStore.ts`

Cuando el usuario mueve una nota a un nuevo slot, guardar esa preferencia:

```typescript
moveNoteToSlot: (patientId, noteId, targetSlotIndex) => {
  set((state) => {
    // ... lógica existente de mover/intercambiar ...
    
    // NUEVO: Guardar preferencia
    const note = patient.stickerNotes.find(n => n.id === noteId);
    const preferenceKey = `${note.type}:${note.text}`;
    
    return {
      ...nuevoEstado,
      noteSlotPreferences: {
        ...state.noteSlotPreferences,
        [preferenceKey]: targetSlotIndex,
      },
    };
  });
}
```

---

### 3. Aplicar Preferencia al Agregar Nota

**Archivo:** `src/store/patientStore.ts`

Al crear una nota, verificar si hay preferencia guardada:

```typescript
addStickerNote: (patientId, noteData) => {
  const preferenceKey = `${noteData.type}:${noteData.text}`;
  const preferredSlot = state.noteSlotPreferences[preferenceKey];
  
  // Si hay preferencia Y el slot está libre, usarlo
  // Si no, usar primer slot disponible (comportamiento actual)
  const usedSlots = new Set(patient.stickerNotes.map(n => n.slotIndex));
  
  let finalSlot;
  if (preferredSlot !== undefined && !usedSlots.has(preferredSlot)) {
    finalSlot = preferredSlot;
  } else {
    // Buscar primer slot libre (lógica actual)
    finalSlot = primerSlotDisponible;
  }
}
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/store/patientStore.ts` | Agregar `noteSlotPreferences`, modificar `moveNoteToSlot` y `addStickerNote` |

---

## Comportamiento Esperado

| Acción | Resultado |
|--------|-----------|
| Agregar "CT" por primera vez | Va al primer slot libre |
| Mover "CT" al slot 5 | CT se mueve, se guarda preferencia |
| Agregar "CT" a otro paciente | CT aparece en slot 5 automáticamente |
| Slot 5 ocupado en otro paciente | CT va al primer slot libre |
| Mover "CT" al slot 2 | Preferencia se actualiza a slot 2 |

---

## Persistencia

Las preferencias se guardan automáticamente con el middleware `persist` de Zustand que ya está configurado, así que sobreviven recargas del navegador.

Cada coordinador tendrá su propio layout guardado en su dispositivo.

---

## Sección Técnica

### Estructura de Datos

```typescript
// En PatientStore interface
noteSlotPreferences: Record<string, number>;

// Clave del mapa
`${type}:${text}` 
// Ejemplos:
// "study:CT" → 5
// "study:ECHO" → 2
// "precaution:Flu A +" → 8
// "critical:Trop 85" → 0
```

### Flujo de Datos

```text
Usuario arrastra nota
       ↓
handleDragEnd (StickerNotesColumn)
       ↓
onMoveToSlot(noteId, targetSlot)
       ↓
moveNoteToSlot en store
       ↓
1. Actualiza slotIndex de la nota
2. Intercambia si hay otra nota
3. Guarda preferencia: type:text → slot
       ↓
Estado persistido en localStorage
```
