

# Plan: Agrandar Notas y Mostrar Abreviación al Completar

## Problema Actual

1. **Notas muy pequeñas**: 22x18px con texto de 9px - difícil de leer
2. **Al marcar como hecho**: Solo muestra ✓ y se pierde qué estudio fue completado - el coordinador no puede ver qué se hizo

```text
Antes (problemas):
┌────┐  ┌────┐
│ CT │  │ ✓  │  ← ¿Qué estudio fue? No se sabe
└────┘  └────┘
 22px    22px

Después (solución):
┌──────┐  ┌──────┐
│  CT  │  │CT ✓  │  ← Abreviación + checkmark visible
└──────┘  └──────┘
  28px      28px
```

---

## Cambios Visuales

| Aspecto | Antes | Después |
|---------|-------|---------|
| Ancho nota | 22px | 28px |
| Alto nota | 18px | 22px |
| Tamaño texto | 9px | 10px |
| Completado | Solo ✓ | Abreviación + ✓ pequeño |
| Ancho columna | 72px | 90px |
| Gap entre notas | 0.5 | 1 |

---

## Diseño de Nota Completada

```text
Nota pendiente:        Nota completada:
┌──────┐              ┌──────┐
│  CT  │    →         │CT ✓  │  
│      │              │      │  Fondo verde + abreviación + checkmark
└──────┘              └──────┘
```

El coordinador siempre puede ver:
- Qué estudio/nota es (abreviación)
- Si está completado o no (✓ al lado)

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/StickerNoteItem.tsx` | Agrandar notas, mostrar abreviación + ✓ cuando está completado |
| `src/components/StickerNotesColumn.tsx` | Agrandar slots y columna contenedora |

---

## Sección Técnica

### StickerNoteItem.tsx

**Cambio en estudios completados:**
```tsx
// Antes:
{note.completed ? <Check className="h-2.5 w-2.5" /> : abbreviation}

// Después:
<>
  {abbreviation}
  {note.completed && <Check className="h-2.5 w-2.5 ml-0.5" />}
</>
```

**Cambio en tamaños:**
```tsx
// Antes:
"w-[22px] h-[18px] text-[9px]"

// Después:
"w-[28px] h-[22px] text-[10px]"
```

### StickerNotesColumn.tsx

**Slots más grandes:**
```tsx
// Antes:
"w-[22px] h-[18px]"

// Después:  
"w-[28px] h-[22px]"
```

**Columna contenedora:**
```tsx
// Antes:
"w-[72px]"
"gap-0.5"

// Después:
"w-[90px]"
"gap-1"
```

---

## Resultado Esperado

El coordinador ahora puede:
- ✅ Leer las notas claramente (más grandes)
- ✅ Ver qué estudio fue completado (ej: "CT ✓" en vez de solo "✓")
- ✅ Distinguir pendientes de completados por color + checkmark

