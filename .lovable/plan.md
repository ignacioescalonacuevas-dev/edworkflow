
# Plan: Sistema de Cuadrícula para Notas (Estilo Escritorio)

## Resumen

Cambiar el sistema de posicionamiento libre a un sistema de cuadrícula donde las notas se "acomodan" automáticamente en celdas predefinidas, evitando que se sobrepongan. Como los íconos del escritorio de Windows/Mac.

---

## Concepto Visual

```text
Antes (posición libre - se solapan):
┌────────────────────┐
│  [CT] [ECHO]       │  <- pueden quedar encima
│    [MRI]           │     unas de otras
│ [+]                │
└────────────────────┘

Después (cuadrícula - ordenadas):
┌────────────────────┐
│ [CT]  [ECHO] [MRI] │  <- fila 1
│ [LAB] [RX]   [___] │  <- fila 2
│ [+]                │
└────────────────────┘
```

---

## Cambios Necesarios

### 1. Cambiar el Tipo de Posición

**Archivo:** `src/types/patient.ts`

Cambiar de coordenadas X/Y a índice de cuadrícula:

```typescript
interface StickerNote {
  // ... campos existentes
  gridIndex?: number;  // Posición en la cuadrícula (0, 1, 2, ...)
}
```

---

### 2. Reducir Márgenes de DOB y M-Number

**Archivo:** `src/components/PatientSticker.tsx`

Hacer más compacta la información del paciente para dar más espacio a las notas:

- Combinar DOB y M-Number en una sola línea
- Reducir el tamaño de texto

```text
Antes:
Juan García          B5
12/03/1985           DR
M12345678            EN

Después:
Juan García          B5
12/03/1985 M12345678 DR
                     EN
```

---

### 3. Modificar el Contenedor de Notas

**Archivo:** `src/components/StickerNotesColumn.tsx`

- Usar CSS Grid en lugar de posición absoluta
- Definir celdas de tamaño fijo
- Cuando se arrastra una nota, calcular a qué celda corresponde y hacer "swap" con la nota que esté ahí
- Volver a usar `@dnd-kit/sortable` pero con grid layout

```typescript
// Cuadrícula de 3 columnas
<div className="grid grid-cols-3 gap-0.5">
  {sortedNotes.map(note => (
    <StickerNoteItem key={note.id} note={note} ... />
  ))}
</div>
```

---

### 4. Simplificar el Item de Nota

**Archivo:** `src/components/StickerNoteItem.tsx`

- Quitar `position: absolute`
- Volver a `useSortable` en lugar de `useDraggable`
- Mantener el arrastre desde cualquier parte

---

### 5. Actualizar el Store

**Archivo:** `src/store/patientStore.ts`

- Revertir a `reorderStickerNotes` en lugar de `updateNotePosition`
- El orden del array determina la posición en la cuadrícula

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/types/patient.ts` | Quitar campo `position`, usar orden del array |
| `src/components/PatientSticker.tsx` | Compactar DOB y M-Number en una línea |
| `src/components/StickerNotesColumn.tsx` | Cambiar a CSS Grid, volver a sortable |
| `src/components/StickerNoteItem.tsx` | Quitar position absolute, volver a useSortable |
| `src/store/patientStore.ts` | Restaurar `reorderStickerNotes` |

---

## Detalles Técnicos

### Layout de Cuadrícula

```text
Configuración:
- Columnas: 3 (ajustable)
- Tamaño celda: ~35px x ~18px
- Gap: 2px

Ejemplo con 5 notas:
┌─────┬─────┬─────┐
│ CT  │ECHO │ MRI │  <- índices 0, 1, 2
├─────┼─────┼─────┤
│ LAB │ RX  │     │  <- índices 3, 4
└─────┴─────┴─────┘
```

### Comportamiento de Arrastre

1. Usuario toma una nota y la arrastra
2. Al soltar sobre otra nota, intercambian posiciones
3. Las notas siempre quedan alineadas en la cuadrícula
4. No hay superposición posible

---

## Resultado Esperado

- Notas organizadas en cuadrícula limpia
- Se pueden mover libremente pero siempre "encajan" en su celda
- No hay superposición
- Más espacio para notas gracias a DOB/M-Number compactados
- Interfaz más ordenada y profesional
