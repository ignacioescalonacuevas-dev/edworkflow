

# Plan: Layout Comprimido Adaptativo con Abreviaciones

## Resumen

Reducir significativamente el ancho de la columna de notas usando **abreviaciones de 2-3 caracteres** y colores distintivos, manteniendo el nombre del paciente siempre visible completo.

---

## Mapa de Abreviaciones

| Tipo | Texto Original | Abreviación | Color |
|------|----------------|-------------|-------|
| **Studies** | CT | CT | Azul |
| | ECHO | ECHO | Azul |
| | ECG | ECG | Azul |
| | US (Ultrasound) | US | Azul |
| | X-Ray | XR | Azul |
| | Vascular | VA | Azul |
| **Follow-up** | GP | GP | Verde |
| | Women's Clinic | WC | Verde |
| | RACC | RA | Verde |
| | Fracture Clinic | FC | Verde |
| | Surgical Clinic | SC | Verde |
| **Precaution** | Flu A + | Flu A + | Naranja |
| | Flu B + | Flu B + | Naranja |
| | COVID + | COVID + | Naranja |
| | MRI | MRI | Amarillo |
| | Isolation | IS | Naranja |
| **Discharge** | Home | HM | Teal |
| | GP F/U | GF | Teal |
| | Clinic | CL | Teal |
| | RACC | RA | Teal |
| | AMA | AM | Teal |
| **Critical** | (valor libre) | 1ª letra | Rojo |
| **Admitting** | (médico) | 2 iniciales | Púrpura |
| **Note** | (libre) | NT | Gris |

---

## Visualización del Nuevo Sticker

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ [⋮] John Smith Johnson      2h15  │ CT EC US │   B3   │  ← Nombre COMPLETO
│     15/03/1972                    │ Lb +  ── │   TM   │  ← Grid 3×2
│     M12345                        │          │   RN   │  ← ~70px ancho
├──────────────────────────────────────────────────────────────────────────┤
│ Chest pain with radiation to left arm             [Waiting Room]        │
└──────────────────────────────────────────────────────────────────────────┘

Cada celda: ~22px × 20px
- Azul oscuro = Study pendiente
- Verde = Study completado  
- Rojo = Critical
- Naranja = Precaution
- + = Agregar (solo en primer slot vacío)
- ── = Slot vacío (no interactivo)
```

---

## Cambios de Proporciones

| Elemento | Antes | Después | Ahorro |
|----------|-------|---------|--------|
| Columna Notas | 150-220px | 70-80px | ~65% |
| Columna Info | Truncada | Espacio completo | +100px |
| Grid notas | `grid-cols-3` con gap | `grid-cols-3` compacto | -50% |
| Celda nota | `px-1.5 py-0.5 + texto largo` | `w-[22px] h-[18px]` | -70% |

---

## Sección Técnica

### 1. patient.ts - Agregar Mapa de Abreviaciones

```typescript
// Mapa de abreviaciones para cada texto de nota
export const NOTE_ABBREVIATIONS: Record<string, string> = {
  // Studies
  'CT': 'CT',
  'ECHO': 'EC',
  'ECG': 'EG',
  'US': 'US',
  'X-Ray': 'XR',
  'Vascular': 'VA',
  // Follow-ups
  'GP': 'GP',
  "Women's Clinic": 'WC',
  'RACC': 'RA',
  'Fracture Clinic': 'FC',
  'Surgical Clinic': 'SC',
  // Precautions
  'Flu A +': 'FA',
  'Flu B +': 'FB',
  'COVID +': 'CV',
  'MRSA': 'MR',
  'Isolation': 'IS',
  // Discharge
  'Home': 'HM',
  'GP F/U': 'GF',
  'Clinic': 'CL',
  'AMA': 'AM',
};

// Función para obtener abreviación
export function getAbbreviation(text: string): string {
  return NOTE_ABBREVIATIONS[text] || text.substring(0, 2).toUpperCase();
}
```

### 2. StickerNotesColumn.tsx - Layout Compacto

```typescript
// Reducir ancho del contenedor
<div 
  className="w-[72px]"  // Antes: min-w-[150px] max-w-[220px]
  onClick={(e) => e.stopPropagation()}
>
  <DndContext ...>
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from({ length: TOTAL_SLOTS }).map((_, slotIndex) => (
        <CompactSlot ... />
      ))}
    </div>
  </DndContext>
</div>
```

### 3. StickerNoteItem.tsx - Celdas Compactas

```typescript
import { getAbbreviation, NOTE_TYPE_CONFIG } from '@/types/patient';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Study type
if (note.type === 'study') {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(note.id); }}
          className={cn(
            "w-[22px] h-[18px] rounded text-[9px] font-bold flex items-center justify-center",
            note.completed 
              ? "bg-green-500/40 text-green-200 border border-green-500/50"
              : "bg-blue-500/30 text-blue-200 border border-blue-500/40"
          )}
        >
          {getAbbreviation(note.text)}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {note.text} {note.completed ? '✓' : '(pendiente)'}
      </TooltipContent>
    </Tooltip>
  );
}

// Other types (critical, precaution, etc.)
return (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className={cn(
        "w-[22px] h-[18px] rounded text-[9px] font-bold flex items-center justify-center",
        config.color
      )}>
        {getAbbreviation(note.text)}
      </span>
    </TooltipTrigger>
    <TooltipContent>{note.text}</TooltipContent>
  </Tooltip>
);
```

### 4. PatientSticker.tsx - Ajustar Grid

```typescript
// Cambiar proporciones del grid principal
<div className="grid grid-cols-[1fr_72px_44px] gap-1.5 flex-1 min-h-0">
  
  {/* COL 1: Patient Info - Ahora sin truncate */}
  <div className="flex flex-col justify-center min-w-0">
    <div className="flex items-center gap-1">
      {!isReadOnly && <StickerActionsMenu ... />}
      <span className="font-semibold text-sm leading-tight">{patient.name}</span>
    </div>
    <span className="text-[11px] text-muted-foreground">{patient.dateOfBirth}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-[11px] text-muted-foreground font-mono">{patient.mNumber}</span>
      <span className="text-[10px] text-muted-foreground/70 ml-auto">{elapsedTime}</span>
    </div>
  </div>

  {/* COL 2: Notes - Ancho fijo 72px */}
  <div className="flex items-center justify-center">
    <StickerNotesColumn ... />
  </div>

  {/* COL 3: Staff - Sin cambios */}
  <div className="flex flex-col items-center justify-between py-0.5">
    ...
  </div>
</div>
```

### 5. Slot Vacío y Botón Agregar Compactos

```typescript
// Empty slot (visual only)
<div className="w-[22px] h-[18px] rounded border border-dashed border-muted-foreground/20" />

// Add button (first empty slot only)
<Popover>
  <PopoverTrigger asChild>
    <button className="w-[22px] h-[18px] rounded border border-dashed border-muted-foreground/40 
                      hover:border-primary/60 hover:bg-primary/10 flex items-center justify-center">
      <Plus className="h-2.5 w-2.5 text-muted-foreground" />
    </button>
  </PopoverTrigger>
  <PopoverContent>...</PopoverContent>
</Popover>
```

---

## Resultado Esperado

```text
ANTES (solo 12 pacientes, nombres truncados):
┌──────────────────────────────────────────────────────────────────────────┐
│ John Smi...  │  [CT Scan] [Echo] [MRI]  │   B3   │  ← Nombre cortado
│ 15/03/1972   │  [Labs] [Note: ...] [+]  │   TM   │  ← Notas muy anchas
│ M12345       │                          │   RN   │
└──────────────────────────────────────────────────────────────────────────┘

DESPUÉS (32 pacientes, nombres completos):
┌──────────────────────────────────────────────────────────────────────────┐
│ [⋮] John Smith Johnson          │ CT EC US │   B3   │  ← Nombre COMPLETO
│     15/03/1972                   │ Lb +  ── │   TM   │  ← Notas compactas
│     M12345                  2h15 │          │   RN   │
├──────────────────────────────────────────────────────────────────────────┤
│ Chest pain with radiation                     [Waiting Room]            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Interacción

- **Hover/Tap en abreviación** → Tooltip muestra texto completo
- **Click en Study** → Toggle completado/pendiente
- **Click en +** → Popover para agregar nueva nota
- **Arrastrar nota** → Reorganizar en los 6 slots
- **Hover + X** → Eliminar nota (igual que antes)

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/types/patient.ts` | Agregar `NOTE_ABBREVIATIONS` y función `getAbbreviation()` |
| `src/components/StickerNotesColumn.tsx` | Reducir ancho a 72px, ajustar grid |
| `src/components/StickerNoteItem.tsx` | Celdas de 22×18px con tooltips |
| `src/components/PatientSticker.tsx` | Grid `[1fr_72px_44px]`, quitar truncate del nombre |

