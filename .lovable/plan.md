
# Plan: Eliminar Discharge Notes y Mostrar Nombre Completo del Consultant

## Resumen

Dos mejoras solicitadas:

1. **Eliminar "Discharge Notes"**: Remover este tipo de nota del sistema ya que no es necesario
2. **Nombre completo del Consultant visible**: Mostrarlo a la derecha de la fecha de nacimiento cuando el paciente está "for admission" (estados: admission_pending, bed_assigned, ready_transfer)

---

## Cambio 1: Eliminar Discharge Notes

### Archivos a modificar

**`src/types/patient.ts`**

- Eliminar `'discharge'` del tipo `StickerNoteType` (línea 156)
- Eliminar `DISCHARGE_OPTIONS` (línea 174)
- Eliminar entrada `discharge` de `NOTE_TYPE_CONFIG` (línea 182)
- Eliminar abreviaciones de discharge de `NOTE_ABBREVIATIONS` (líneas 254-257)

**`src/components/AddNotePopover.tsx`**

- Eliminar `dischargeOptions` y `addDischargeOption` del destructure del store (línea 16-17)
- Eliminar el case `'discharge'` en `handleAddCustomOption` (líneas 56-58)
- Eliminar `'discharge'` del check `hasSelectOptions` (línea 25)
- Eliminar el case `'discharge'` en `renderInput` (líneas 123-124)

**`src/store/patientStore.ts`**

- Eliminar `dischargeOptions` del estado
- Eliminar `addDischargeOption` de las acciones

---

## Cambio 2: Nombre Completo del Consultant

### Nueva posición en el sticker

El nombre del consultant irá a la derecha de la fecha de nacimiento, en un texto compacto cyan que será clickeable para editar:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ▲ [⋮] John Smith Johnson      2h15  │ CT EC US │   B3   │
│ 2     15/03/1972 ▸ Dr. García       │ Lb Fb ── │   TM   │  ← Consultant aquí
│       M12345678                     │          │   RN   │
├──────────────────────────────────────────────────────────────────────────┤
│ Chest pain                                    [Bed Assigned]            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Comportamiento

- **Solo visible** cuando `isInAdmissionProcess` es true (admission_pending, bed_assigned, ready_transfer)
- **Clickeable** para abrir el popover de edición de admisión (consultant + bed + handover)
- **Si no hay consultant**, mostrar un placeholder clickeable: `[+ Consultant]`
- El badge celeste actual con iniciales se puede mantener como indicador visual adicional, o se puede eliminar para evitar redundancia

### Modificaciones en PatientSticker.tsx

Dentro de COL 1 (Patient Info), después de la fecha de nacimiento, agregar:

```typescript
{/* Consultant name - only show if in admission process */}
{isInAdmissionProcess && (
  <ConsultantNameDisplay 
    patientId={patient.id}
    consultantName={patient.admission?.consultantName || patient.admission?.consultant}
    readOnly={isReadOnly}
  />
)}
```

### Nuevo componente: ConsultantNameDisplay

```typescript
interface ConsultantNameDisplayProps {
  patientId: string;
  consultantName?: string;
  readOnly?: boolean;
}

function ConsultantNameDisplay({ patientId, consultantName, readOnly }: ConsultantNameDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateAdmission } = usePatientStore();
  
  const display = (
    <span className={cn(
      "text-[10px] text-cyan-400 font-medium truncate max-w-[100px]",
      !readOnly && "cursor-pointer hover:text-cyan-300"
    )}>
      {consultantName ? `▸ ${consultantName}` : '[+ Consultant]'}
    </span>
  );
  
  if (readOnly) return display;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {display}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="start">
        {/* Form para editar consultant, bed, handover */}
      </PopoverContent>
    </Popover>
  );
}
```

---

## Sección Técnica

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/types/patient.ts` | Eliminar `discharge` type, options, config y abbreviations |
| `src/components/AddNotePopover.tsx` | Eliminar referencias a discharge |
| `src/store/patientStore.ts` | Eliminar `dischargeOptions` y `addDischargeOption` |
| `src/components/PatientSticker.tsx` | Agregar ConsultantNameDisplay al lado del DOB |

### Layout actualizado de COL 1

```typescript
{/* COL 1: Patient Info (vertical stack) */}
<div className="flex flex-col justify-center min-w-0">
  {/* Row 1: Name */}
  <div className="flex items-center gap-1">
    {!isReadOnly && <StickerActionsMenu patientId={patient.id} patientName={patient.name} />}
    <span className="font-semibold text-sm leading-tight truncate">{patient.name}</span>
  </div>
  
  {/* Row 2: DOB + Consultant (if in admission) */}
  <div className="flex items-center gap-1.5">
    <span className="text-[11px] text-muted-foreground">{patient.dateOfBirth}</span>
    {isInAdmissionProcess && (
      <ConsultantNameDisplay 
        patientId={patient.id}
        consultantName={patient.admission?.consultantName || patient.admission?.consultant}
        readOnly={isReadOnly}
      />
    )}
  </div>
  
  {/* Row 3: M-Number + Time */}
  <div className="flex items-baseline gap-1">
    <span className="text-[11px] text-muted-foreground font-mono">{patient.mNumber}</span>
    <span className="text-[10px] text-muted-foreground/70 ml-auto">{elapsedTime}</span>
  </div>
</div>
```

---

## Resultado Esperado

1. **Sin discharge notes**: El tipo "Discharge" ya no aparecerá en el selector de notas
2. **Consultant siempre visible**: Cuando un paciente está en proceso de admisión, el nombre completo del consultant aparecerá junto a la fecha de nacimiento
3. **Fácil edición**: Clic en el nombre del consultant abre el popover para editar consultant, cama y handover
4. **Placeholder claro**: Si no hay consultant asignado pero el paciente está for admission, muestra `[+ Consultant]` como indicador visual para agregar
