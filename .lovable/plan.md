

# Plan: Board Autónomo sin Panel Lateral

## Resumen

Simplificar la interacción del board para que todo se maneje directamente en los stickers, sin abrir el panel de detalle. El código del panel se mantiene comentado/desactivado para uso futuro.

---

## Cambios Necesarios

### 1. Modificar `src/pages/Index.tsx`

**Cambios:**
- Comentar (no eliminar) todo el bloque del panel lateral `<aside>...</aside>`
- Remover la lógica de `selectedPatientId` ya que no se usará por ahora
- El board ocupa el 100% del espacio

**Código resultante:**
```typescript
const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Main Content - Patient Board */}
      <main className="flex-1 overflow-hidden">
        <PatientBoard />
      </main>

      {/* 
        Side Panel - Patient Detail
        DISABLED: Reserved for future multi-tablet integration
        {selectedPatient && (
          <aside className="w-[480px] border-l ...">
            <PatientDetail patient={selectedPatient} />
          </aside>
        )}
      */}
    </div>
  );
};
```

---

### 2. Modificar `src/components/PatientSticker.tsx`

**Cambios:**
- Remover prop `onClick` ya que no se necesita seleccionar
- Remover prop `isSelected` ya que no hay estado de selección
- Remover el estilo de `ring-2 ring-primary` de selección
- Mantener el cursor normal (no pointer) o dejarlo como pointer para indicar que es interactivo (las notas)

**Props actualizadas:**
```typescript
interface PatientStickerProps {
  patient: Patient;
  // onClick y isSelected removidos
}
```

---

### 3. Modificar `src/components/PatientBoard.tsx`

**Cambios:**
- Remover referencia a `selectPatient` del store
- Remover referencia a `selectedPatientId` del store
- No pasar `onClick` ni `isSelected` a PatientSticker

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Comentar panel lateral, limpiar imports |
| `src/components/PatientSticker.tsx` | Remover onClick/isSelected, simplificar |
| `src/components/PatientBoard.tsx` | Remover lógica de selección |

---

## Resultado Final

- Click en sticker: No hace nada (el sticker no se "selecciona")
- Click en columna central del sticker: Abre popover para agregar notas
- Click en checkbox de estudio: Marca/desmarca el estudio
- Click en nota existente: Permite eliminar
- Panel lateral: Desactivado pero listo para futuro uso

El coordinador puede trabajar exclusivamente desde el board, agregando pacientes y gestionando notas/estudios sin distracciones.

