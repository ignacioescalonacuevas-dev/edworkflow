

# Plan: Centrar y Expandir el Área de Notas en el Sticker

## Problema Actual

```text
┌────────────────────────────────────────────────────────┐
│ Nombre    [notas muy   │ B1  │ ← Notas muy arriba,    │
│ DOB · M#   angostas]   │ MD  │   no ocupan el espacio │
│                        │ RN  │   disponible al centro │
├────────────────────────────────────────────────────────┤
│ Chief Complaint                              Status    │
└────────────────────────────────────────────────────────┘
```

## Solución Propuesta

Centrar verticalmente la cuadrícula de notas y expandir su ancho para ocupar mejor el espacio disponible.

```text
┌────────────────────────────────────────────────────────┐
│ Nombre              [    notas centradas    ] │ B1    │
│ DOB · M#            [    y más anchas       ] │ MD    │
│                     [                       ] │ RN    │
├────────────────────────────────────────────────────────┤
│ Chief Complaint                              Status    │
└────────────────────────────────────────────────────────┘
```

---

## Cambios Necesarios

### 1. PatientSticker.tsx - Centrar verticalmente la columna de notas

**Línea 355**: Agregar `items-center` al contenedor principal para alinear verticalmente todas las columnas.

**Línea 368-375**: Agregar `flex items-center` al contenedor de notas para centrarlo.

### 2. StickerNotesColumn.tsx - Expandir el ancho

**Línea 141**: Cambiar las restricciones de ancho:
- De: `min-w-[100px] max-w-[140px]`  
- A: `min-w-[140px] max-w-[200px] flex-1`

Esto permite que la columna de notas crezca para ocupar el espacio disponible.

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/PatientSticker.tsx` | Agregar alineación vertical centrada |
| `src/components/StickerNotesColumn.tsx` | Expandir restricciones de ancho |

---

## Sección Técnica

### PatientSticker.tsx

```typescript
// Línea 355 - Agregar items-center al grid principal
<div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">

// Líneas 368-375 - Envolver en contenedor centrado  
{/* Middle column - Notes (centered) */}
<div className="flex items-center justify-center">
  <StickerNotesColumn
    notes={patient.stickerNotes}
    onAddNote={handleAddNote}
    onToggle={handleToggle}
    onRemove={handleRemove}
    onMoveToSlot={handleMoveToSlot}
  />
</div>
```

### StickerNotesColumn.tsx

```typescript
// Línea 141 - Expandir ancho y permitir crecimiento
<div 
  className="min-w-[140px] max-w-[200px] flex-1"
  onClick={(e) => e.stopPropagation()}
>
```

---

## Resultado Visual Esperado

| Antes | Después |
|-------|---------|
| Notas pegadas arriba | Notas centradas verticalmente |
| Ancho fijo 100-140px | Ancho flexible 140-200px |
| Espacio blanco desperdiciado | Mejor uso del espacio central |

