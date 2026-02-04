

# Plan: Sistema de Gestión de Turnos y Tiempos

## Resumen

Implementar un sistema completo de gestión de turnos con:
1. **Tiempo toggleable** en el sticker (hora de llegada O tiempo transcurrido - click para cambiar)
2. **Fecha/hora real** del sistema al iniciar nuevos turnos
3. **Cerrar turno** con resumen y opcion de reabrir
4. **Deteccion de turno anterior** sin cerrar
5. **Historial limpio** guardado automaticamente

---

## Cambios a Implementar

### 1. Tiempo Toggleable en PatientSticker

El sticker mostrara:
- Por defecto: **tiempo transcurrido** (ej: `2h30`)
- Al hacer click: cambia a **hora de llegada** (ej: `14:35`)
- Click de nuevo: vuelve a tiempo transcurrido

```text
Antes:  M00123456 · 2h30
Ahora:  M00123456 · 2h30  ←  click → 14:35  ← click → 2h30...
```

Se usara un estado global en el store para que todos los stickers cambien juntos (mas consistente para el coordinador).

### 2. Fecha/Hora Real del Sistema

- Eliminar el hardcode `SHIFT_DATE = '2026-01-25'`
- Al crear un nuevo turno, usar la fecha seleccionada por el usuario (que por defecto sera `new Date()` - hoy)
- Los timestamps de nuevos pacientes usaran la hora real del sistema

### 3. Cerrar Turno (End Shift)

Nuevo boton "Cerrar Turno" en el header que:
1. Muestra dialogo con resumen del dia
2. Guarda el turno en historial
3. Resetea el board para el siguiente dia
4. Opcion de **reabrir** si se cerro por error

### 4. Deteccion de Turno Anterior

Al entrar a la app:
- Si hay un turno de un dia anterior sin cerrar
- Mostrar advertencia con opciones:
  - "Cerrar turno y empezar nuevo dia"
  - "Continuar con el turno anterior"

### 5. Historial con Reabrir

Los turnos guardados podran:
- Verse en modo solo lectura (ya implementado)
- **Reabrirse** para edicion (nuevo) - copia el turno al dia actual

---

## Flujo de Usuario

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ENTRADA A LA APP                                │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                ┌────────────────────────────────────┐
                │   ¿Hay turno activo?               │
                └────────────────────────────────────┘
                         │              │
                        NO             SI
                         │              │
                         ▼              ▼
            ┌─────────────────┐  ┌─────────────────────────────────┐
            │  Pantalla Setup │  │ ¿Es de hoy?                     │
            │  (fecha + staff)│  └─────────────────────────────────┘
            └─────────────────┘           │              │
                                         SI             NO
                                          │              │
                                          ▼              ▼
                                   ┌──────────┐  ┌─────────────────────┐
                                   │  Board   │  │ Dialogo:            │
                                   │  Normal  │  │ "Turno del 25/01    │
                                   └──────────┘  │  sin cerrar"        │
                                                 │                     │
                                                 │ [Cerrar y empezar]  │
                                                 │ [Continuar turno]   │
                                                 └─────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/store/patientStore.ts` | Eliminar hardcode, agregar `showArrivalTime`, mejorar `endShift` |
| `src/components/PatientSticker.tsx` | Toggle entre hora/tiempo con click |
| `src/components/BoardHeader.tsx` | Agregar boton "Cerrar Turno" |
| `src/pages/Index.tsx` | Detectar turno de dia anterior |

### Nuevos Componentes

| Componente | Proposito |
|------------|-----------|
| `EndShiftDialog.tsx` | Dialogo para cerrar turno con resumen |
| `PreviousShiftWarning.tsx` | Dialogo cuando hay turno anterior sin cerrar |

---

## Seccion Tecnica

### Cambios en patientStore.ts

```typescript
// ELIMINAR:
const SHIFT_DATE = '2026-01-25';

// AGREGAR al interface:
showArrivalTime: boolean;  // Toggle global para mostrar hora vs tiempo
toggleTimeDisplay: () => void;

// MODIFICAR setShiftDate:
setShiftDate: (date) => set({ 
  shiftDate: date, 
  shiftConfigured: true 
}),

// MEJORAR endShift:
endShift: () => {
  const state = get();
  
  // 1. Guardar turno en historial antes de cerrar
  if (state.shiftDate && state.patients.length > 0) {
    const dateKey = format(new Date(state.shiftDate), 'yyyy-MM-dd');
    useShiftHistoryStore.getState().saveShift({
      date: dateKey,
      patients: state.patients,
      doctors: state.doctors,
      nurses: state.nurses,
      locations: state.locations,
      summary: {
        totalPatients: state.patients.length,
        admissions: state.patients.filter(p => 
          ['admission_pending', 'bed_assigned', 'ready_transfer', 'admitted'].includes(p.processState)
        ).length,
        discharges: state.patients.filter(p => p.processState === 'discharged').length,
        transfers: state.patients.filter(p => p.processState === 'transferred').length,
      },
      savedAt: new Date().toISOString(),
    });
  }
  
  // 2. Reset
  set({
    shiftConfigured: false,
    shiftDate: null,
    patients: [],
    selectedPatientId: null,
  });
},

// NUEVO: Reabrir turno desde historial
reopenShift: (date: string) => {
  const snapshot = useShiftHistoryStore.getState().loadShift(date);
  if (!snapshot) return;
  
  set({
    shiftDate: new Date(date),
    shiftConfigured: true,
    patients: snapshot.patients,
    doctors: snapshot.doctors,
    nurses: snapshot.nurses,
    locations: snapshot.locations,
  });
},
```

### Cambios en PatientSticker.tsx

```typescript
// En la linea ~373, reemplazar el tiempo fijo por toggle
const { showArrivalTime, toggleTimeDisplay } = usePatientStore();
const arrivalTimeStr = format(new Date(patient.arrivalTime), 'HH:mm');

// En el JSX:
<span 
  className="text-[10px] text-muted-foreground/70 ml-auto cursor-pointer hover:text-foreground transition-colors"
  onClick={(e) => {
    e.stopPropagation();
    toggleTimeDisplay();
  }}
  title={showArrivalTime ? 'Ver tiempo transcurrido' : 'Ver hora de llegada'}
>
  {showArrivalTime ? arrivalTimeStr : elapsedTime}
</span>
```

### Nuevo Componente: EndShiftDialog.tsx

```typescript
// Dialogo que muestra:
// - Resumen del turno (pacientes, admisiones, altas)
// - Advertencia si hay pacientes sin cerrar
// - Boton "Cerrar y Guardar"
// - Boton "Cancelar"
```

### Nuevo Componente: PreviousShiftWarning.tsx

```typescript
// Dialogo que se muestra al detectar turno anterior:
// - Fecha del turno anterior
// - Opciones: "Cerrar y empezar hoy" / "Continuar turno"
```

### Cambios en Index.tsx

```typescript
const Index = () => {
  const { shiftConfigured, shiftDate } = usePatientStore();
  const [showPreviousShiftWarning, setShowPreviousShiftWarning] = useState(false);
  
  useEffect(() => {
    if (shiftConfigured && shiftDate) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const shiftDay = format(new Date(shiftDate), 'yyyy-MM-dd');
      
      if (shiftDay < today) {
        setShowPreviousShiftWarning(true);
      }
    }
  }, [shiftConfigured, shiftDate]);

  // Mostrar warning dialog si aplica
  // ...
};
```

---

## Resultado Final

Despues de implementar:

| Funcionalidad | Estado |
|---------------|--------|
| Click para toggle hora/tiempo en sticker | Nuevo |
| Turnos con fecha real del sistema | Nuevo |
| Boton "Cerrar Turno" con resumen | Nuevo |
| Guardar turno en historial al cerrar | Nuevo |
| Reabrir turno cerrado por error | Nuevo |
| Advertencia si turno anterior sin cerrar | Nuevo |
| Historial con opcion de ver Y reabrir | Mejorado |

