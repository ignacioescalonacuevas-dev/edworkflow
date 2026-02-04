
# Plan: Reposicionar Info de Admisión y Mantenerla Visible

## Resumen

1. Mover el nombre del consultor y número de cama a la **derecha del DOB** (en la misma línea)
2. **No borrar** esta información cuando el paciente es transferido/admitido - mantenerla visible para referencia

---

## Cambio Visual

```text
Antes:
┌───────────────────────────────────────────┐
│ John Smith ▲3 📅                          │
│ 15/03/1985                                │
│ ▸ Dr. Garcia  📍5N-23    ← Línea separada │
│ M00123456                                 │
└───────────────────────────────────────────┘

Después:
┌───────────────────────────────────────────┐
│ John Smith ▲3 📅                          │
│ 15/03/1985  ▸ Dr. Garcia 📍5N-23  ← Misma línea
│ M00123456                                 │
└───────────────────────────────────────────┘
```

---

## Lógica de Visibilidad

| Estado del Paciente | Info de Admisión Visible |
|---------------------|--------------------------|
| admission_pending   | ✅ Sí |
| bed_assigned        | ✅ Sí |
| ready_transfer      | ✅ Sí |
| **transferred**     | ✅ Sí (NUEVO - antes no) |
| **admitted**        | ✅ Sí (NUEVO - antes no) |
| discharged          | ❌ No (no aplica) |

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/PatientSticker.tsx` | Reorganizar layout para poner admisión en línea con DOB, expandir condición de visibilidad |

---

## Sección Técnica

### Cambio en PatientSticker.tsx

Cambiar de:
```tsx
{/* Row 2: DOB */}
<span className="text-[11px] text-muted-foreground">{patient.dateOfBirth}</span>
{/* Row 3: Consultant + Bed (if in admission) */}
{isInAdmissionProcess && (
  <div className="flex items-center gap-1.5">
    <ConsultantNameDisplay ... />
    {patient.admission?.bedNumber && ...}
  </div>
)}
```

A:
```tsx
{/* Row 2: DOB + Consultant/Bed (same line) */}
<div className="flex items-center gap-1.5">
  <span className="text-[11px] text-muted-foreground">{patient.dateOfBirth}</span>
  {/* Mostrar si tiene datos de admisión (incluso después de transfer) */}
  {hasAdmissionInfo && (
    <>
      <ConsultantNameDisplay ... />
      {patient.admission?.bedNumber && (
        <span className="text-[10px] text-cyan-600 font-medium">
          📍{patient.admission.bedNumber}
        </span>
      )}
    </>
  )}
</div>
```

### Nueva Condición de Visibilidad

```tsx
// Mostrar info de admisión si tiene datos, incluyendo pacientes ya transferidos
const hasAdmissionInfo = patient.admission && 
  (patient.admission.consultantName || patient.admission.consultant || patient.admission.bedNumber);
```

Esto asegura que la información de "a dónde fue" el paciente se mantiene visible incluso después de que se marque como `transferred` o `admitted`.
