
# Plan: Arrastrar Notas desde Cualquier Parte

## Resumen

Modificar el componente `StickerNoteItem` para que toda la nota sea arrastrable, no solo el icono de las rayitas. Esto hara que sea mas intuitivo mover las notas dentro del sticker.

---

## Cambio Principal

### Archivo: `src/components/StickerNoteItem.tsx`

**Problema actual:**
- Los `listeners` y `attributes` del drag-and-drop solo estan en el icono `GripVertical`
- El icono es muy pequeno (h-2.5 w-2.5) y esta oculto hasta hacer hover
- Es dificil descubrir que se puede arrastrar

**Solucion:**
- Mover los `listeners` y `attributes` al contenedor principal (`div` exterior)
- Agregar cursor `grab` al contenedor cuando no se esta arrastrando
- Agregar cursor `grabbing` cuando se esta arrastrando activamente
- Eliminar el icono GripVertical ya que no sera necesario

---

## Cambios Especificos

### Para notas tipo "study"

```text
Antes:
<div ref={setNodeRef}>
  <div {...listeners}>GripVertical</div>  <- Solo aqui se puede arrastrar
  <button>CT</button>
  <X />
</div>

Despues:
<div ref={setNodeRef} {...listeners} {...attributes}>  <- Todo el elemento es arrastrable
  <button>CT</button>
  <X />
</div>
```

### Para otras notas

```text
Antes:
<div ref={setNodeRef}>
  <div {...listeners}>GripVertical</div>  <- Solo aqui se puede arrastrar
  <span>Nota</span>
  <X />
</div>

Despues:
<div ref={setNodeRef} {...listeners} {...attributes}>  <- Todo el elemento es arrastrable
  <span>Nota</span>
  <X />
</div>
```

---

## Estilos Actualizados

| Estado | Cursor | Opacidad |
|--------|--------|----------|
| Normal | `cursor-grab` | 1 |
| Arrastrando | `cursor-grabbing` | 0.5 |

---

## Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/StickerNoteItem.tsx` | Mover listeners al contenedor, eliminar GripVertical, agregar cursores |

---

## Codigo Final Simplificado

```typescript
// Para study type
<div 
  ref={setNodeRef} 
  style={style} 
  {...attributes}
  {...listeners}
  className={cn(
    "flex items-center gap-0.5 group touch-none",
    isDragging ? "cursor-grabbing" : "cursor-grab"
  )}
>
  <button onClick={() => onToggle(note.id)}>...</button>
  <button onClick={() => onRemove(note.id)}><X /></button>
</div>

// Para otras notas
<div 
  ref={setNodeRef} 
  style={style}
  {...attributes}
  {...listeners}
  className={cn(
    "flex items-center gap-0.5 group touch-none",
    isDragging ? "cursor-grabbing" : "cursor-grab"
  )}
>
  <span>{note.text}</span>
  <button onClick={() => onRemove(note.id)}><X /></button>
</div>
```

---

## Resultado Esperado

- Puedes tomar cualquier nota desde cualquier parte y arrastrarla
- El cursor cambia a "mano abierta" cuando pasas sobre una nota
- El cursor cambia a "mano cerrada" mientras arrastras
- Ya no hay icono de rayitas porque no es necesario
- Mas intuitivo y facil de usar
