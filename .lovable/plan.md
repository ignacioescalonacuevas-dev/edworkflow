
## Objetivo
Hacer que el toggle **Hide D/C** esconda **solo** pacientes “terminales” (Discharged, Transferred, Admission completada / “Admitted”) y **no** oculte pacientes activos aunque tengan el campo legacy `status` en `discharged`.

## Diagnóstico (por qué hoy se esconden todos)
- El filtro actual de Hide D/C en `getFilteredPatients` oculta si:
  - `p.processState === 'discharged'` **o** `p.status === 'discharged'`
  - `p.processState === 'transferred'` **o** `p.status === 'transferred'`
  - `p.admission?.completedAt` existe
- Cuando cambias un paciente de `processState` (ej. a `to_be_seen`), el store **solo** actualiza `processState` pero **no** actualiza el campo legacy `status`.
- Resultado: el paciente puede quedar con `processState: 'to_be_seen'` pero `status: 'discharged'` (de antes o del sample data), y Hide D/C lo sigue escondiendo por el `status`.

## Enfoque de solución (robusto y compatible)
1) **Hacer que Hide D/C dependa del modelo nuevo (`processState`)** y de `admission.completedAt`, y usar `status` solo como fallback si `processState` no existe (pero en `getFilteredPatients` ya estamos migrando, así que siempre habrá `processState`).
2) **Sincronizar `status` cuando cambie `processState`** para que el resto de la UI (contadores, filtros auxiliares) no quede inconsistente.

---

## Cambios propuestos

### A) Corregir el filtro Hide D/C (principal)
**Archivo:** `src/store/patientStore.ts`  
**Función:** `getFilteredPatients`

**Cambio:**
- Reemplazar la lógica que revisa `p.status` directamente.
- Nueva regla de ocultamiento:
  - Ocultar si `p.processState` es `discharged` o `transferred`
  - Ocultar si `p.processState` es `admission` **y** `p.admission?.completedAt` existe (admisión completada = “admitted”)
- Importante: **no** ocultar por `p.status` cuando `processState` es activo.

**Pseudocódigo objetivo:**
```ts
if (state.hideDischargedFromBoard) {
  result = result.filter(p => {
    if (p.processState === 'discharged') return false;
    if (p.processState === 'transferred') return false;
    if (p.processState === 'admission' && p.admission?.completedAt) return false;
    return true;
  });
}
```

Con esto, aunque `status` esté “sucio” (por historia), Hide D/C responde al estado real del workflow.

---

### B) Mantener `status` consistente al cambiar `processState`
**Archivo:** `src/store/patientStore.ts`  
**Acción:** `updatePatientProcessState`

**Cambio:**
- Además de setear `processState`, setear un `status` coherente (legacy) para no romper contadores / filtros que aún miran `status`.

**Mapeo sugerido (simple):**
- `registered` → `waiting_room`
- `to_be_seen` → `treatment_room`
- `awaiting_results` → `review`
- `admission` → `admission`
- `discharged` → `discharged`
- `transferred` → `transferred`

**Además (higiene de datos al “revivir” pacientes):**
- Si el nuevo `processState` NO es `discharged`, limpiar `dischargedAt` (si existía).
- Si el nuevo `processState` NO es `transferred`, limpiar `transferredTo` (si existía).
- Si sales de `admission` o vuelves a `admission` pendiente, no tocar `admission.completedAt` automáticamente (eso debería depender del flujo de admisión), pero sí evitar que quede un `completedAt` accidental si el usuario está corrigiendo un caso (opcional: preguntar/definir regla).

---

### C) (Recomendado) Ajustar contadores que usan `status`
Ahora mismo `StaffCounters`, `StudyFilters` y partes de `FilterIndicator` calculan “activos” con:
```ts
patients.filter(p => p.status !== 'discharged' && p.status !== 'transferred')
```
Esto puede seguir dando números raros si hay datos viejos persistidos.

**Opción 1 (mínima):** dejarlo, porque con (B) a futuro se corrige cuando el usuario cambie estados.  
**Opción 2 (mejor):** cambiar esos conteos a usar `migratePatient(p).processState` o directamente reutilizar la misma lógica “terminal” que Hide D/C.

Propondré implementar la Opción 2 para coherencia total:
- Definir un helper local (o reutilizar `getFilteredPatients`) para contar “visibles” según `processState` + `admission.completedAt`.

---

## Pruebas manuales (criterios de aceptación)
1) Con Hide D/C **ON**:
   - Un paciente en `to_be_seen` se mantiene visible.
   - Si cambias ese mismo paciente a `transferred`, debe desaparecer del board.
   - Si lo cambias de vuelta a `to_be_seen`, debe reaparecer.
2) Un paciente en `admission`:
   - Si `admission.completedAt` **no** existe → visible con Hide D/C ON.
   - Si `admission.completedAt` existe → oculto con Hide D/C ON.
3) Verificar que los contadores (Showing / staff counters) no queden en 0 cuando hay activos.

---

## Riesgos / Edge cases
- Datos persistidos antiguos pueden tener combinaciones inconsistentes (`status: discharged` pero `processState: to_be_seen`). Con (A) el filtro deja de verse afectado por eso.
- Si el usuario necesita “des-admitir” a un paciente (quitar completedAt), eso hoy no está explícito en UI; la lógica no debería borrarlo automáticamente al cambiar processState a menos que definamos esa regla.

---

## Archivos a tocar (resumen)
- `src/store/patientStore.ts`
  - `getFilteredPatients`: cambiar lógica Hide D/C para usar `processState` (y `admission.completedAt`) en lugar de `status`.
  - `updatePatientProcessState`: sincronizar `status` con `processState` + limpiar campos terminales cuando corresponda.
- (Opcional pero recomendado) `src/components/StaffCounters.tsx`, `src/components/StudyFilters.tsx`, `src/components/FilterIndicator.tsx`
  - Actualizar conteos “activos” para basarse en `processState` (y admisión completada) en vez de `status`.

