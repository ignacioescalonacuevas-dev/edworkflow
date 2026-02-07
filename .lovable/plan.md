
# Plan: Compactar Header con Staff Siempre Visible

## Resumen

Reorganizar el header para maximizar espacio vertical. Los contadores de staff (MD/RN) se mantienen siempre visibles porque son la herramienta principal del coordinador para distribuir carga.

## Layout Visual

```text
ANTES (3 filas):
+----------------------------------------------------------------------+
| ED Coordination Board              [Search] [Hide] [Analytics] ...   |
| Monday, 07 February 2026           [Agenda] [+] [Setup] [End] [Hist]|
|                                                                      |
| MD: Garcia(3) Lopez(2) | Pending: CT(1) MRI(2) ECG(0) US(0)        |
|                                                                      |
| Showing: 25 [Reg 2][DNW 0][TBS 4][Wait 3][Adm 1][Adm'd 5][D/C 8]  |
+----------------------------------------------------------------------+

DESPUES (compacto):
+----------------------------------------------------------------------+
| ED Board | Mon 07 Feb | [Search] [Hide D/C] [+Patient] [Ignacio v]  |
| MD: Garcia(3) Lopez(2) RN: Ana(4) | [Patients 25 v] [Pending 3 v]  |
+----------------------------------------------------------------------+
  (dropdown Ignacio: Analytics, Agenda, Shift Setup, End Shift,
                     History, Reset, Sign Out)
  (expandir "Patients 25": botones Reg, DNW, TBS, Wait, Adm, Adm'd...)
  (expandir "Pending 3": CT(1) MRI(2) ECHO(0) US(0) ECG(0) X-Ray(0))
```

## Que se mantiene siempre visible

- Titulo + fecha
- SearchBar
- Hide D/C toggle
- New Patient button
- **StaffCounters (MD/RN)** - siempre visibles, clickeables para filtrar
- Badges de filtros activos (cuando hay filtros aplicados)

## Que se oculta en el dropdown del usuario

- Analytics
- Agenda
- Shift Setup (solo coordinador)
- End Shift (solo coordinador)
- Reset Data (solo coordinador)
- Shift History
- Sign Out

## Que se oculta en colapsables

- **"Patients 25"**: al expandir muestra los 8 botones de estado (Reg, DNW, TBS, Wait, Adm, Adm'd, D/C, Trans)
- **"Pending 3"**: al expandir muestra los filtros de estudios (CT, MRI, ECHO, US, ECG, X-Ray)

## Cambios por Archivo

| Archivo | Cambio |
|---------|--------|
| `src/components/PatientBoard.tsx` | Quitar `gridAutoFlow: 'column'` para llenar izquierda a derecha |
| `src/components/BoardHeader.tsx` | Reestructurar: 2 filas compactas, dropdown usuario, colapsables |
| `src/components/FilterIndicator.tsx` | Separar en dos partes: badges activos vs botones de estado |
| `src/components/AgendaPanel.tsx` | Aceptar props `open`/`onOpenChange` para control externo |
| `src/components/ShiftSetup.tsx` | Aceptar props `open`/`onOpenChange` para control externo |
| `src/components/EndShiftDialog.tsx` | Aceptar props `open`/`onOpenChange` para control externo |
| `src/components/ShiftHistoryDialog.tsx` | Aceptar props `open`/`onOpenChange` para control externo |

---

## Seccion Tecnica

### 1. PatientBoard.tsx - Grid Row-by-Row

Quitar `gridAutoFlow: 'column'` en linea 52 para que el grid llene de izquierda a derecha:

```typescript
style={{ 
  gridTemplateRows: 'repeat(8, minmax(100px, auto))',
  // gridAutoFlow removed = default 'row' = left-to-right
}}
```

### 2. Dialogs Controlados Externamente

Los 4 componentes (AgendaPanel, ShiftSetup, EndShiftDialog, ShiftHistoryDialog) necesitan aceptar props opcionales para abrirse desde el dropdown. Patron:

```typescript
interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShiftSetup({ open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  // ... usa isOpen/setIsOpen en Dialog
}
```

Cuando se controlan externamente, el `DialogTrigger` no se renderiza (el componente se abre directamente desde el DropdownMenuItem).

Aplicar a:
- `AgendaPanel` (Sheet) - ya usa `open`/`setOpen`; agregar props externas
- `ShiftSetup` (Dialog) - ya usa `isOpen`/`setIsOpen`; agregar props externas
- `EndShiftDialog` (Dialog) - ya usa `open`/`setOpen`; agregar props externas
- `ShiftHistoryDialog` (Dialog) - ya usa `isOpen`/`setIsOpen`; agregar props externas

Para cada uno: si `controlledOpen` es `undefined`, el componente usa su estado interno y renderiza su trigger. Si `controlledOpen` es proporcionado, omite el trigger y usa el estado externo.

### 3. BoardHeader.tsx - Reestructuracion

**Imports nuevos:**
```typescript
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
         DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, History, Settings, XCircle, CalendarClock } from 'lucide-react';
```

**Estados para dialogs controlados:**
```typescript
const [agendaOpen, setAgendaOpen] = useState(false);
const [shiftSetupOpen, setShiftSetupOpen] = useState(false);
const [endShiftOpen, setEndShiftOpen] = useState(false);
const [historyOpen, setHistoryOpen] = useState(false);
```

**Estructura del header (2 filas compactas):**

Fila 1: Titulo + fecha | Search + Hide D/C + NewPatient + UserDropdown

```typescript
<div className="flex items-center justify-between gap-3">
  <div className="flex items-center gap-2 shrink-0">
    <Activity className="h-5 w-5 text-primary" />
    <h1 className="text-lg font-semibold">ED Board</h1>
    {displayDate && (
      <span className="text-xs text-muted-foreground">
        {format(new Date(displayDate), 'EEE dd MMM')}
      </span>
    )}
  </div>
  <div className="flex items-center gap-2">
    <SearchBar />
    <Switch .../> <Label>D/C</Label>
    <NewPatientForm />
    {/* User Dropdown */}
    <DropdownMenu>
      <DropdownMenuTrigger>
        <User /> {displayName} <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover">
        <div className="px-2 py-1.5 text-xs">{roleLabel}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setAnalyticsOpen(true)}>Analytics</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAgendaOpen(true)}>Agenda</DropdownMenuItem>
        <DropdownMenuSeparator />
        {role === 'coordinator' && <>
          <DropdownMenuItem onClick={() => setShiftSetupOpen(true)}>Shift Setup</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEndShiftOpen(true)}>End Shift</DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetData}>Reset Data</DropdownMenuItem>
          <DropdownMenuSeparator />
        </>}
        <DropdownMenuItem onClick={() => setHistoryOpen(true)}>Shift History</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

Fila 2: StaffCounters (siempre visible) | Popover "Patients N" | Popover "Pending N"

```typescript
<div className="flex items-center justify-between gap-2 flex-wrap">
  {/* Staff counters - SIEMPRE VISIBLES */}
  <StaffCounters />
  
  <div className="flex items-center gap-2 ml-auto">
    {/* Badges de filtros activos */}
    <ActiveFilterBadges />

    {/* Patients popover */}
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-xs px-2 py-1 rounded bg-muted/50 hover:bg-muted flex items-center gap-1">
          Patients <span className="font-medium">{filteredCount}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-popover">
        {/* 8 botones de estado: Reg, DNW, TBS, Wait, Adm, Adm'd, D/C, Trans */}
        <div className="flex items-center gap-1 flex-wrap">
          {stateButtons.map(...)}
        </div>
      </PopoverContent>
    </Popover>

    {/* Pending popover */}
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-xs px-2 py-1 rounded bg-muted/50 hover:bg-muted flex items-center gap-1">
          Pending <span className="font-medium">{totalPending}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-popover">
        <StudyFilters />
      </PopoverContent>
    </Popover>
  </div>
</div>
```

**Dialogs renderizados sin trigger (controlados):**
```typescript
<AgendaPanel open={agendaOpen} onOpenChange={setAgendaOpen} />
<ShiftSetup open={shiftSetupOpen} onOpenChange={setShiftSetupOpen} />
<EndShiftDialog open={endShiftOpen} onOpenChange={setEndShiftOpen} />
<ShiftHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
<AnalyticsDashboard open={analyticsOpen} onOpenChange={setAnalyticsOpen} />
```

### 4. FilterIndicator.tsx - Separar en partes

Extraer la logica en dos partes usables desde BoardHeader:

1. **Badges de filtros activos** (inline en fila 2): muestra badges con X para search, doctor, nurse, study, process state activos
2. **Botones de estado** (dentro del Popover "Patients"): los 8 botones clickeables con conteo

La forma mas limpia: mover los stateButtons y stateCounts al BoardHeader directamente (inline dentro del Popover), y mantener FilterIndicator solo para los badges activos. O alternativamente, exportar dos sub-componentes desde FilterIndicator.

Se optara por: BoardHeader calcula los counts y renderiza los botones de estado dentro del Popover, y FilterIndicator se simplifica a solo mostrar los badges de filtros activos.

### 5. Nota sobre Popovers vs Collapsibles

Se usa `Popover` en lugar de `Collapsible` para "Patients" y "Pending" porque:
- Los Popovers se superponen al contenido (no empujan el layout)
- Se cierran automaticamente al hacer clic fuera
- Mejor UX para filtros que se consultan brevemente

## Resultado Esperado

1. Grid llena de izquierda a derecha, arriba a abajo
2. Header reducido a 2 filas compactas
3. **StaffCounters siempre visibles** con sus conteos clickeables
4. Acciones secundarias en dropdown del usuario
5. Botones de estado de pacientes en popover "Patients N"
6. Estudios pendientes en popover "Pending N"
7. Mas espacio vertical para el grid de pacientes
