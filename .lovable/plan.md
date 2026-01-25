

# Plan: Grilla 4×8 con Sticker Rediseñado

## Resumen

Cambiar el PatientBoard a grilla fija **4 columnas × 8 filas** (32 pacientes/página) con flujo vertical. Rediseñar el sticker en **3 columnas internas** con 6 slots para notas.

---

## Diseño del Nuevo Sticker

```text
┌─────────────────────────────────────────────────────────────────────┐
│  COL 1 (Info)          │  COL 2 (Notas 3×2)   │  COL 3 (Staff)     │
│                        │                      │                    │
│  John Smith      2h15  │  [CT] [Echo] [MRI]   │      B3            │
│  15/03/1972            │  [Lab] [  +  ] [ ]   │      TM            │
│  M12345                │                      │      RN            │
│                        │                      │                    │
├────────────────────────┴──────────────────────┴────────────────────┤
│  Chest pain                                      [Waiting Room]    │
└────────────────────────────────────────────────────────────────────┘

Columna 1: Nombre + tiempo, DOB, M-Number (stack vertical)
Columna 2: Grilla 3×2 = 6 slots para notas (reducido de 12)
Columna 3: Box arriba, Dr medio, Nurse abajo (stack vertical centrado)
Footer: Chief Complaint + Status (igual que antes)
```

---

## Proporciones Razonadas

Para una pantalla tablet grande (~1024×768 útiles):

```text
Grid 4×8 = 32 celdas

Altura disponible: ~700px para grid
  → Cada fila: ~87px
  → Con gap: ~80px por celda

Ancho disponible: ~1000px para grid
  → Cada columna: ~250px
  → Con gap: ~240px por celda

Sticker interno (240×80):
  - Col 1 (info): ~35% = 85px
  - Col 2 (notas): ~45% = 108px 
  - Col 3 (staff): ~20% = 48px
  - Footer: altura ~20px
```

---

## Visualización del Board

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ED Coordination Board         📅 Sat 25 Jan 2026        [+New] [⏱]    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────┐│
│  │ Patient 1       │ Patient 9       │ Patient 17      │ Patient 25  ││ R1
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 2       │ Patient 10      │ Patient 18      │   empty     ││ R2
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 3       │ Patient 11      │ Patient 19      │   empty     ││ R3
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 4       │ Patient 12      │ Patient 20      │   empty     ││ R4
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 5       │ Patient 13      │ Patient 21      │   empty     ││ R5
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 6       │ Patient 14      │ Patient 22      │   empty     ││ R6
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 7       │ Patient 15      │ Patient 23      │   empty     ││ R7
│  ├─────────────────┼─────────────────┼─────────────────┼─────────────┤│
│  │ Patient 8       │ Patient 16      │ Patient 24      │   empty     ││ R8
│  └─────────────────┴─────────────────┴─────────────────┴─────────────┘│
│                                                                        │
│                          [◀ Page 1 of 1 ▶]                             │
└────────────────────────────────────────────────────────────────────────┘

Flujo: Columna 1 se llena primero (1-8), luego Col 2 (9-16), etc.
```

---

## Cambios Necesarios

| Archivo | Descripción |
|---------|-------------|
| `src/components/PatientBoard.tsx` | Grid 4×8 con `grid-auto-flow: column` + paginación |
| `src/components/PatientSticker.tsx` | Rediseñar layout 3 columnas + footer |
| `src/components/StickerNotesColumn.tsx` | Reducir de 12 a 6 slots (grilla 3×2) |

---

## Sección Técnica

### 1. PatientBoard.tsx

```typescript
const COLS = 4;
const ROWS = 8;
const PATIENTS_PER_PAGE = COLS * ROWS; // 32

// Grid con flujo por columnas
<div 
  className="flex-1 grid grid-cols-4 gap-2 p-3"
  style={{ 
    gridTemplateRows: 'repeat(8, 1fr)',
    gridAutoFlow: 'column' 
  }}
>
  {Array.from({ length: PATIENTS_PER_PAGE }).map((_, index) => {
    const patient = pagePatients[index];
    return patient ? (
      <PatientSticker key={patient.id} patient={patient} />
    ) : (
      <div className="border border-dashed border-border/30 rounded-lg bg-muted/10" />
    );
  })}
</div>

// Paginación
{totalPages > 1 && (
  <div className="flex justify-center gap-3 py-2">
    <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>◀</Button>
    <span>Page {currentPage + 1} of {totalPages}</span>
    <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>▶</Button>
  </div>
)}
```

### 2. PatientSticker.tsx - Nuevo Layout

```typescript
<div className="sticker group h-full flex flex-col">
  {/* Main 3-column grid */}
  <div className="grid grid-cols-[1fr_auto_48px] gap-2 flex-1">
    
    {/* COL 1: Patient Info (vertical stack) */}
    <div className="flex flex-col justify-center min-w-0">
      <div className="flex items-baseline gap-1">
        {!isReadOnly && <StickerActionsMenu />}
        <span className="font-semibold text-sm truncate">{patient.name}</span>
        <span className="text-[10px] text-muted-foreground">{elapsedTime}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{patient.dateOfBirth}</span>
      <span className="text-[10px] text-muted-foreground font-mono">{patient.mNumber}</span>
    </div>

    {/* COL 2: Notes Grid 3×2 = 6 slots */}
    <div className="flex items-center">
      <StickerNotesColumn notes={patient.stickerNotes} ... />
    </div>

    {/* COL 3: Box + Doctor + Nurse (vertical centered) */}
    <div className="flex flex-col items-center justify-between py-1">
      <StaffDropdown type="location" displayValue={patient.box.replace('Box ', 'B')} />
      <StaffDropdown type="doctor" displayValue={getInitials(patient.doctor)} />
      <StaffDropdown type="nurse" displayValue={getInitials(patient.nurse)} />
    </div>
  </div>

  {/* Footer: Chief Complaint + Status */}
  <div className="flex items-center justify-between gap-2 pt-1 mt-1 border-t border-border/50">
    <EditableChiefComplaint />
    <StatusDropdown />
  </div>
</div>
```

### 3. StickerNotesColumn.tsx - Reducir a 6 Slots

```typescript
const TOTAL_SLOTS = 6; // Antes era 12

// Grid 3×2 en vez de 3×4
<div className="grid grid-cols-3 grid-rows-2 gap-0.5">
  {Array.from({ length: TOTAL_SLOTS }).map((_, slotIndex) => (
    <Slot key={slotIndex} ... />
  ))}
</div>
```

---

## Comparación Visual: Antes vs Después

```text
ANTES (sticker actual):
┌──────────────────────────────────────────────────┐
│ [⋮] John Smith  2h15                             │
│     15/03/1972 · M12345                          │
├──────────────────────────────────────────────────┤  ← Altura variable
│     [CT][Echo][MRI]    │  B3                     │
│     [Lab][ + ][ ]      │  TM                     │
│     [ ][ ][ ]          │  RN                     │
│     [ ][ ][ ]          │                         │
├──────────────────────────────────────────────────┤
│ Chest pain                    [Waiting Room]     │
└──────────────────────────────────────────────────┘

DESPUÉS (sticker rediseñado):
┌──────────────────────────────────────────────────┐
│ [⋮] John Smith  2h15 │ [CT][E][MR] │    B3      │
│     15/03/1972       │ [Lab][ + ][ ]│    TM      │  ← Más compacto
│     M12345           │              │    RN      │
├──────────────────────────────────────────────────┤
│ Chest pain                    [Waiting Room]     │
└──────────────────────────────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/PatientBoard.tsx` | **Modificar** - Grid 4×8 + paginación |
| `src/components/PatientSticker.tsx` | **Modificar** - Layout 3 columnas |
| `src/components/StickerNotesColumn.tsx` | **Modificar** - 6 slots (3×2) |

