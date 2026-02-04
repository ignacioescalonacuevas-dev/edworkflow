

# Plan: Agrandar Notas y Mejorar Contraste de Colores

## Problema Actual

1. **Notas pequeñas**: 28x22px sigue siendo difícil de ver
2. **Bajo contraste**: Colores claros (`text-blue-300`) sobre fondos con baja opacidad (`bg-blue-500/20`) dificultan la lectura

```text
Antes (bajo contraste):
┌──────┐
│  CT  │  ← text-blue-300 sobre bg-blue-500/20 = difícil leer
└──────┘
  28px

Después (alto contraste):
┌────────┐
│   CT   │  ← text-blue-700 sobre bg-blue-100 = fácil leer
└────────┘
   34px
```

---

## Cambios Visuales

| Aspecto | Antes | Después |
|---------|-------|---------|
| Ancho nota | 28px | 34px |
| Alto nota | 22px | 26px |
| Tamaño texto | 10px | 11px |
| Ancho columna | 90px | 110px |
| Contraste | Bajo (text-xxx-300) | Alto (text-xxx-700) |

---

## Nuevos Colores con Alto Contraste

| Tipo | Antes | Después |
|------|-------|---------|
| Study (pending) | `bg-blue-500/30 text-blue-300` | `bg-blue-100 text-blue-700 border-blue-300` |
| Study (done) | `bg-green-500/40 text-green-300` | `bg-green-100 text-green-700 border-green-400` |
| Follow-up | `bg-green-500/20 text-green-300` | `bg-emerald-100 text-emerald-700 border-emerald-300` |
| Critical | `bg-red-500/20 text-red-300` | `bg-red-100 text-red-700 border-red-300` |
| Precaution | `bg-orange-500/20 text-orange-300` | `bg-amber-100 text-amber-700 border-amber-300` |
| Admitting | `bg-purple-500/20 text-purple-300` | `bg-purple-100 text-purple-700 border-purple-300` |
| Note | `bg-gray-500/20 text-gray-300` | `bg-slate-100 text-slate-700 border-slate-300` |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/types/patient.ts` | Actualizar `NOTE_TYPE_CONFIG` con colores de alto contraste |
| `src/components/StickerNoteItem.tsx` | Agrandar dimensiones (34x26px) y actualizar colores de estudios |
| `src/components/StickerNotesColumn.tsx` | Agrandar slots (34x26px) y columna (110px) |

---

## Sección Técnica

### 1. types/patient.ts - Nuevos Colores

```typescript
export const NOTE_TYPE_CONFIG: Record<StickerNoteType, { label: string; color: string }> = {
  study: { label: 'Study', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  followup: { label: 'Follow-up', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  critical: { label: 'Critical Value', color: 'bg-red-100 text-red-700 border-red-300' },
  precaution: { label: 'Precaution', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  admitting: { label: 'Admitting MD', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  note: { label: 'Note', color: 'bg-slate-100 text-slate-700 border-slate-300' },
};
```

### 2. StickerNoteItem.tsx - Nuevas Dimensiones y Colores

```tsx
// Tamaño de notas
"w-[34px] h-[26px] text-[11px]"

// Colores de estudios
note.completed 
  ? "bg-green-100 text-green-700 border-green-400"
  : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
```

### 3. StickerNotesColumn.tsx - Slots y Columna Agrandados

```tsx
// Slots
"w-[34px] h-[26px]"

// Columna contenedora
"w-[110px]"
```

---

## Resultado Esperado

- ✅ Notas 21% más grandes (34x26 vs 28x22)
- ✅ Texto legible con alto contraste (colores oscuros sobre fondos claros)
- ✅ Cada tipo de nota claramente distinguible por color

