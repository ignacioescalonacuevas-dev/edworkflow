

# Plan: Agregar Campo de Notas Libres para Admisión

## Resumen

Agregar un campo de texto libre debajo del nombre del médico consultor y el número de cama, visible cuando el paciente tiene datos de admisión. Los coordinadores podrán escribir cualquier nota relevante para el proceso de admisión.

```text
Antes:
┌─────────────────────────────────────────┐
│ John Smith              [T3] [+]        │
│ 15/03/1985  ▸ Dr. González  📍 5N-23    │  ← Solo consultant + cama
│ M12345678                               │
│ ...                                     │
└─────────────────────────────────────────┘

Después:
┌─────────────────────────────────────────┐
│ John Smith              [T3] [+]        │
│ 15/03/1985  ▸ Dr. González  📍 5N-23    │
│ M12345678   IV hep ongoing, call 6pm    │  ← Nota libre editable
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## Comportamiento

| Estado | Visualización |
|--------|---------------|
| Sin nota | Placeholder `[+ Nota...]` clicable |
| Con nota | Texto visible, truncado si es muy largo |
| Click | Abre input inline para editar |
| Vacío al guardar | Desaparece el placeholder (queda oculto) |
| Siempre visible | Cuando paciente tiene datos de admisión |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/types/patient.ts` | Agregar campo `freeNote?: string` a `AdmissionData` |
| `src/components/PatientSticker.tsx` | Agregar componente `EditableFreeNote` y mostrarlo |
| `src/store/patientStore.ts` | Ya tiene `updateAdmission` que maneja campos parciales |

---

## Sección Técnica

### 1. types/patient.ts - Nuevo Campo

```typescript
export interface AdmissionData {
  // ... campos existentes ...
  freeNote?: string;  // NEW: Nota libre del coordinador
}
```

### 2. PatientSticker.tsx - Nuevo Componente

```tsx
interface EditableFreeNoteProps {
  patientId: string;
  note: string;
}

function EditableFreeNote({ patientId, note }: EditableFreeNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(note || '');
  const { updateAdmission } = usePatientStore();

  const handleSave = () => {
    updateAdmission(patientId, { freeNote: value.trim() });
    setIsEditing(false);
  };

  // Si está editando, mostrar input
  // Si hay nota, mostrar texto truncado
  // Si no hay nota, mostrar placeholder "[+ Nota...]"
}
```

### 3. Ubicación en el Sticker

Agregar debajo del M-Number, en la misma fila o en una nueva línea cuando hay datos de admisión:

```tsx
{/* Row 3: M-Number + Free Note (if admission) */}
<div className="flex items-baseline gap-1">
  <span className="text-[11px] text-muted-foreground font-mono">{patient.mNumber}</span>
  {/* Appointment badges */}
  {patient.appointments?.filter(...).map(...)}
</div>

{/* NEW: Free note for admission - debajo del M-Number */}
{hasAdmissionInfo && (
  <EditableFreeNote 
    patientId={patient.id}
    note={patient.admission?.freeNote || ''}
    readOnly={isReadOnly}
  />
)}
```

### 4. Estilo del Campo

```tsx
// Sin nota - placeholder discreto
<span className="text-[10px] text-muted-foreground/60 cursor-pointer hover:text-muted-foreground">
  [+ Nota...]
</span>

// Con nota - texto visible
<span className="text-[10px] text-cyan-600 cursor-pointer truncate max-w-[180px]">
  {note}
</span>

// Editando - input inline
<Input
  className="h-4 text-[10px] px-1 py-0 flex-1 max-w-[200px]"
  placeholder="Notas de admisión..."
/>
```

---

## Resultado Esperado

- ✅ Campo de texto libre visible cuando hay datos de admisión
- ✅ Editable con click (inline editing)
- ✅ Texto truncado si es muy largo (con tooltip al hover)
- ✅ Persistente en localStorage junto con otros datos del paciente
- ✅ Visible en modo read-only (historial de shifts)

