

# Plan: Optimización de Tamaños y Espaciado para Tablet

## Resumen

Ajustar todos los tamaños de fuente, espaciado y proporciones de los stickers para maximizar la legibilidad en pantallas tablet (1024×768), manteniendo la estructura de 3 columnas del sticker y la grilla 4×8.

---

## Análisis de Tamaños Actuales vs Propuestos

### Problema Actual

Los tamaños actuales usan fuentes muy pequeñas (`text-[9px]`, `text-[10px]`) que son difíciles de leer en tablet. El espaciado es mínimo y los elementos están muy comprimidos.

### Propuesta de Escalado

```text
Pantalla tablet: ~1024×768 útiles
Grid 4×8: 32 celdas
Espacio por celda: ~245px ancho × ~85px alto

Con estos tamaños, podemos usar fuentes más grandes:
```

| Elemento | Actual | Propuesto | Mejora |
|----------|--------|-----------|--------|
| Nombre paciente | `text-xs` (12px) | `text-sm` (14px) | +17% |
| DOB / M-Number | `text-[9px]` | `text-xs` (12px) | +33% |
| Tiempo transcurrido | `text-[9px]` | `text-[11px]` | +22% |
| Staff initials (Box/Dr/Nurse) | `text-[10px]` | `text-xs` (12px) | +20% |
| Chief Complaint | `text-[10px]` | `text-xs` (12px) | +20% |
| Status badge | `text-[9px]` | `text-[11px]` | +22% |
| Notas/Studies | `text-[10px]` | `text-[11px]` | +10% |

---

## Visualización: Antes vs Después

```text
ANTES (tamaños pequeños):
┌─────────────────────────────────────────────────────────┐
│ [⋮] John Smith  2h15 │ [CT][E][MR] │   B3    │ ← 12px nombre
│     15/03/1972       │ [Lab][+][ ] │   TM    │ ← 9px fecha
│     M12345           │             │   RN    │ ← 9px M#
├─────────────────────────────────────────────────────────┤
│ Chest pain                    [Waiting Room] │ ← 10px CC
└─────────────────────────────────────────────────────────┘ ← 9px status

DESPUÉS (optimizado para tablet):
┌─────────────────────────────────────────────────────────┐
│ [⋮] John Smith    2h15  │ [CT][Eco][MR] │   B3   │ ← 14px nombre
│     15/03/1972          │ [Lab][ + ][ ] │   TM   │ ← 12px fecha
│     M12345              │               │   RN   │ ← 12px M#
├─────────────────────────────────────────────────────────┤
│ Chest pain                       [Waiting Room]  │ ← 12px CC
└─────────────────────────────────────────────────────────┘ ← 11px status
```

---

## Cambios Necesarios

| Archivo | Descripción |
|---------|-------------|
| `src/components/PatientSticker.tsx` | Aumentar fuentes y espaciado interno |
| `src/components/StickerNotesColumn.tsx` | Ajustar altura de slots y ancho mínimo |
| `src/components/StickerNoteItem.tsx` | Aumentar tamaño de notas y botones |
| `src/index.css` | Actualizar estilos base del `.sticker` |

---

## Sección Técnica

### 1. PatientSticker.tsx - Cambios de Tamaño

```typescript
// CAMBIOS EN EL COMPONENTE PRINCIPAL

// Sticker container: aumentar padding
className="sticker ... p-2.5" // antes: p-2

// Grid principal: aumentar gap
className="grid grid-cols-[1fr_auto_48px] gap-2 flex-1" // antes: gap-1.5, col3: 40px

// COL 1: Patient Info
<span className="font-semibold text-sm truncate">{patient.name}</span>  // antes: text-xs
<span className="text-[11px] text-muted-foreground">{elapsedTime}</span> // antes: text-[9px]
<span className="text-xs text-muted-foreground">{patient.dateOfBirth}</span> // antes: text-[9px]
<span className="text-xs text-muted-foreground font-mono">{patient.mNumber}</span> // antes: text-[9px]

// COL 3: Staff dropdowns
<button className="text-xs cursor-pointer ..."> // antes: text-[10px]

// Footer
<span className="text-xs text-muted-foreground ..."> // antes: text-[10px]
<button className="text-[11px] px-1.5 py-0.5 ...">  // antes: text-[9px], px-1

// Bed number
className="... text-[11px] px-1.5 ..." // antes: text-[9px], px-1
```

### 2. StickerNotesColumn.tsx - Ajuste de Grid

```typescript
// Aumentar altura de slots
<div className="h-6 ..."> // antes: h-[22px]

// Aumentar ancho mínimo del contenedor
<div className="min-w-[150px] max-w-[220px] flex-1"> // antes: min-w-[140px], max-w-[200px]

// Botón de agregar más grande
<button className="... text-[11px] px-2 py-1 ..."> // antes: text-[10px], px-1.5, py-0.5
<Plus className="h-3 w-3" /> // antes: h-2.5 w-2.5
```

### 3. StickerNoteItem.tsx - Notas Más Legibles

```typescript
// Study notes
<button className="... px-1.5 py-0.5 rounded text-[11px] ..."> // antes: px-1, text-[10px]
<Check className="h-3 w-3" /> // antes: h-2.5 w-2.5
<X className="h-3 w-3" /> // antes: h-2.5 w-2.5

// Other note types
<span className="px-1.5 py-0.5 rounded text-[11px] ..."> // antes: px-1, text-[10px]
```

### 4. index.css - Sticker Base Styles

```css
/* Sticker base - aumentar padding */
.sticker {
  @apply p-2.5 rounded-lg border bg-card text-sm relative;
}

/* Staff dropdown hover area más grande */
.staff-dropdown-trigger {
  @apply min-h-[20px] min-w-[24px];
}
```

---

## Resumen de Cambios de Tamaño

### Fuentes

| Elemento | Antes | Después |
|----------|-------|---------|
| Nombre | `text-xs` (12px) | `text-sm` (14px) |
| DOB, M# | `text-[9px]` | `text-xs` (12px) |
| Elapsed time | `text-[9px]` | `text-[11px]` |
| Staff (Box/Dr/Nurse) | `text-[10px]` | `text-xs` (12px) |
| Chief Complaint | `text-[10px]` | `text-xs` (12px) |
| Status badge | `text-[9px]` | `text-[11px]` |
| Notes | `text-[10px]` | `text-[11px]` |
| Bed number | `text-[9px]` | `text-[11px]` |

### Espaciado

| Elemento | Antes | Después |
|----------|-------|---------|
| Sticker padding | `p-2` (8px) | `p-2.5` (10px) |
| Grid gap interno | `gap-1.5` | `gap-2` |
| Col 3 width | `40px` | `48px` |
| Notes container min-width | `140px` | `150px` |
| Notes container max-width | `200px` | `220px` |
| Slot height | `22px` | `24px` (h-6) |
| Status padding | `px-1` | `px-1.5` |

### Iconos

| Elemento | Antes | Después |
|----------|-------|---------|
| Check/X en notes | `h-2.5 w-2.5` | `h-3 w-3` |
| Plus button | `h-2.5 w-2.5` | `h-3 w-3` |
| MoreVertical menu | `h-3 w-3` | `h-3.5 w-3.5` |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/PatientSticker.tsx` | Fuentes más grandes, padding y gaps aumentados |
| `src/components/StickerNotesColumn.tsx` | Slots más altos, contenedor más ancho |
| `src/components/StickerNoteItem.tsx` | Notas más grandes, iconos más visibles |
| `src/index.css` | Padding base del sticker |

