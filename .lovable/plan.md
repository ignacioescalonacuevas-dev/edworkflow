
# Plan: Notas con Posicion Libre (Estilo Post-it)

## Resumen

Cambiar el sistema de notas para que cada nota tenga coordenadas X/Y y pueda colocarse libremente dentro del area del sticker, como post-its en un tablero.

---

## Cambios Necesarios

### 1. Actualizar el Tipo de Datos

**Archivo:** `src/types/patient.ts`

Agregar coordenadas de posicion al tipo StickerNote:

```typescript
interface StickerNote {
  id: string;
  type: StickerNoteType;
  text: string;
  completed: boolean;
  createdAt: Date;
  position?: { x: number; y: number }; // NUEVO: posicion libre
}
```

---

### 2. Modificar el Contenedor de Notas

**Archivo:** `src/components/StickerNotesColumn.tsx`

- Cambiar de `@dnd-kit/sortable` a `@dnd-kit/core` puro (sin ordenamiento, solo drag)
- Usar `DragOverlay` para mostrar la nota mientras se arrastra
- Calcular la nueva posicion basandose en donde se suelta la nota
- El contenedor sera `position: relative` con area definida
- Las notas seran `position: absolute` con top/left basados en sus coordenadas

```text
Antes (lista ordenable):
┌─────────────────┐
│ [CT] [ECHO] [+] │  <- notas en fila, solo intercambian orden
└─────────────────┘

Despues (posicion libre):
┌─────────────────────┐
│  [CT]       [ECHO]  │  <- notas en posiciones X/Y libres
│        [MRI]        │
│ [+]                 │  <- boton de agregar fijo
└─────────────────────┘
```

---

### 3. Modificar el Item de Nota

**Archivo:** `src/components/StickerNoteItem.tsx`

- Cambiar de `useSortable` a `useDraggable`
- Aplicar `position: absolute` con las coordenadas guardadas
- Mantener la funcionalidad de toggle y remove

---

### 4. Actualizar el Store

**Archivo:** `src/store/patientStore.ts`

- Cambiar `reorderStickerNotes` por `updateNotePosition`
- Nueva funcion que actualiza las coordenadas X/Y de una nota

```typescript
updateNotePosition: (patientId: string, noteId: string, position: { x: number; y: number }) => {
  set((state) => ({
    patients: state.patients.map((p) => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        stickerNotes: p.stickerNotes.map((n) =>
          n.id === noteId ? { ...n, position } : n
        ),
      };
    }),
  }));
}
```

---

### 5. Agregar Notas con Posicion Inicial

**Archivo:** `src/store/patientStore.ts`

Al agregar una nota nueva, calcular una posicion inicial que no se solape con las existentes.

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/types/patient.ts` | Agregar campo `position` opcional al tipo StickerNote |
| `src/store/patientStore.ts` | Cambiar `reorderStickerNotes` por `updateNotePosition`, asignar posicion inicial |
| `src/components/StickerNotesColumn.tsx` | Cambiar a drag libre, contenedor relativo, calcular posicion al soltar |
| `src/components/StickerNoteItem.tsx` | Cambiar a `useDraggable`, aplicar posicion absoluta |
| `src/components/PatientSticker.tsx` | Pasar nueva funcion de actualizar posicion |

---

## Consideraciones Tecnicas

- **Area del contenedor:** Definir un tamano minimo para el area de notas (ej: 120x80px)
- **Limites:** Las notas no pueden salir del area del sticker
- **Colisiones:** Las notas pueden solaparse (como post-its reales)
- **Posicion inicial:** Notas nuevas se colocan en una posicion libre calculada
- **Compatibilidad:** Notas existentes sin posicion usaran posicion por defecto

---

## Resultado Esperado

- Cada nota se puede arrastrar y soltar en cualquier parte del area de notas
- Las notas permanecen donde las colocas
- Puedes organizar visualmente los estudios como prefieras
- El boton [+] permanece en una posicion fija
