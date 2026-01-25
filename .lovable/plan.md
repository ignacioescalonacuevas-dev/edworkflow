

# Plan: Habilitar Arrastre de Notas a Cualquier Slot Vacío

## Problema Identificado

El componente `StickerNoteItem` usa `useSortable` (del sistema sortable) pero los slots vacíos usan `useDroppable` (del sistema core). Estos dos sistemas no están conectados correctamente, por lo que las notas solo se pueden intercambiar entre sí pero no mover a slots vacíos.

---

## Solución

Cambiar `StickerNoteItem` para usar `useDraggable` en lugar de `useSortable`. Esto hará que las notas sean arrastrables y compatibles con los slots vacíos que ya tienen `useDroppable`.

---

## Cambios Necesarios

### Archivo: `src/components/StickerNoteItem.tsx`

Cambiar de `useSortable` a `useDraggable`:

```typescript
// ANTES
import { useSortable } from '@dnd-kit/sortable';

const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });

// DESPUÉS  
import { useDraggable } from '@dnd-kit/core';

const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: note.id });
```

---

## Comportamiento Esperado

| Acción | Resultado |
|--------|-----------|
| Arrastrar nota a slot vacío | La nota se mueve a ese slot |
| Arrastrar nota sobre otra nota | Las notas intercambian posiciones |
| Arrastrar nota a slot con botón [+] | La nota reemplaza el botón [+], que se mueve al próximo slot vacío |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/StickerNoteItem.tsx` | Cambiar `useSortable` por `useDraggable` |

---

## Sección Técnica

### Diferencia entre sistemas

```text
useSortable (sortable):
- Diseñado para listas ordenables
- Las items se reordenan automáticamente
- No funciona bien con "huecos" vacíos

useDraggable + useDroppable (core):
- Sistema más flexible
- Cada nota es arrastrable
- Cada slot (vacío o con nota) es un objetivo
- Perfecto para una cuadrícula con espacios vacíos
```

### Código actualizado

```typescript
import { useDraggable } from '@dnd-kit/core';

export function StickerNoteItem({ note, onToggle, onRemove }: StickerNoteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: note.id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };
  
  // ... resto del componente igual
}
```

