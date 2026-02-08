

# Plan: Corregir Contraste de Texto para Tema Claro

## Problema

Toda la aplicacion usa colores de texto pensados para fondo oscuro (ej: `text-yellow-400`, `text-orange-400`, `text-cyan-400`). En el tema claro actual, estos colores tienen muy poco contraste contra fondos blancos/claros, haciendo el texto dificil de leer.

## Donde esta el problema

Los colores afectados estan en dos lugares principales:

### 1. PROCESS_STATES en `src/types/patient.ts` (lineas 103-112)
Los badges de estado en cada sticker de paciente usan colores como:
- `text-gray-400` (Registered, Discharged) - casi invisible en fondo claro
- `text-orange-400` (Did Not Wait) - bajo contraste
- `text-purple-400` (To Be Seen) - bajo contraste
- `text-yellow-400` (Awaiting Results) - muy dificil de leer
- `text-cyan-400` (Admission) - bajo contraste
- `text-green-400` (Admitted) - bajo contraste
- `text-slate-400` (Transferred) - bajo contraste

### 2. FilterIndicator botones de estado en `src/components/FilterIndicator.tsx` (lineas 16-24)
Los mismos colores repetidos para los botones del popover "Patients".

### 3. Badge READ-ONLY en `src/components/BoardHeader.tsx` (linea 87)
`text-yellow-400` - dificil de leer.

## Solucion

Cambiar todos los colores `-400` a variantes `-700` o `-600` para texto, y ajustar los fondos a versiones mas visibles. Esto asegura contraste legible en el tema claro.

## Cambios por Archivo

| Archivo | Cambio |
|---------|--------|
| `src/types/patient.ts` | Actualizar colores en PROCESS_STATES: `-400` a `-700` para texto, `-500/20` a `-100` para fondo |
| `src/components/FilterIndicator.tsx` | Actualizar colores en stateButtons: mismos cambios |
| `src/components/BoardHeader.tsx` | Actualizar badge READ-ONLY |

---

## Seccion Tecnica

### 1. `src/types/patient.ts` - PROCESS_STATES (lineas 103-112)

```typescript
// ANTES:
{ value: 'registered', label: 'Registered', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
{ value: 'did_not_wait', label: 'Did Not Wait', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
{ value: 'to_be_seen', label: 'To Be Seen', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
{ value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
{ value: 'admission', label: 'Admission', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
{ value: 'admitted', label: 'Admitted', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
{ value: 'discharged', label: 'Discharged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
{ value: 'transferred', label: 'Transferred', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },

// DESPUES:
{ value: 'registered', label: 'Registered', color: 'bg-gray-100 text-gray-700 border-gray-300' },
{ value: 'did_not_wait', label: 'Did Not Wait', color: 'bg-orange-100 text-orange-700 border-orange-300' },
{ value: 'to_be_seen', label: 'To Be Seen', color: 'bg-purple-100 text-purple-700 border-purple-300' },
{ value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
{ value: 'admission', label: 'Admission', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
{ value: 'admitted', label: 'Admitted', color: 'bg-green-100 text-green-700 border-green-300' },
{ value: 'discharged', label: 'Discharged', color: 'bg-gray-100 text-gray-700 border-gray-300' },
{ value: 'transferred', label: 'Transferred', color: 'bg-slate-100 text-slate-700 border-slate-300' },
```

### 2. `src/components/FilterIndicator.tsx` - stateButtons (lineas 16-24)

```typescript
// ANTES:
{ key: 'registered', label: 'Reg', color: 'bg-muted/50 text-muted-foreground hover:bg-muted', activeColor: 'bg-muted text-foreground' },
{ key: 'did_not_wait', label: 'DNW', color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30', activeColor: 'bg-orange-500/40 text-orange-300' },
{ key: 'to_be_seen', label: 'TBS', color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30', activeColor: 'bg-purple-500/40 text-purple-300' },
{ key: 'awaiting_results', label: 'Wait', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30', activeColor: 'bg-yellow-500/40 text-yellow-300' },
{ key: 'admission', label: 'Adm', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30', activeColor: 'bg-cyan-500/40 text-cyan-300' },
{ key: 'admitted', label: "Adm'd", color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30', activeColor: 'bg-green-500/40 text-green-300' },
{ key: 'discharged', label: 'D/C', color: 'bg-muted/50 text-muted-foreground hover:bg-muted', activeColor: 'bg-muted text-foreground' },
{ key: 'transferred', label: 'Trans', color: 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30', activeColor: 'bg-slate-500/40 text-slate-300' },

// DESPUES:
{ key: 'registered', label: 'Reg', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', activeColor: 'bg-gray-200 text-gray-900' },
{ key: 'did_not_wait', label: 'DNW', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200', activeColor: 'bg-orange-200 text-orange-900' },
{ key: 'to_be_seen', label: 'TBS', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', activeColor: 'bg-purple-200 text-purple-900' },
{ key: 'awaiting_results', label: 'Wait', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', activeColor: 'bg-yellow-200 text-yellow-900' },
{ key: 'admission', label: 'Adm', color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200', activeColor: 'bg-cyan-200 text-cyan-900' },
{ key: 'admitted', label: "Adm'd", color: 'bg-green-100 text-green-700 hover:bg-green-200', activeColor: 'bg-green-200 text-green-900' },
{ key: 'discharged', label: 'D/C', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', activeColor: 'bg-gray-200 text-gray-900' },
{ key: 'transferred', label: 'Trans', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', activeColor: 'bg-slate-200 text-slate-900' },
```

### 3. `src/components/BoardHeader.tsx` - READ-ONLY badge (linea 87)

```typescript
// ANTES:
<Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">

// DESPUES:
<Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
```

## Resultado Esperado

- Todos los badges de estado de proceso son legibles con buen contraste
- Los botones del popover "Patients" tienen texto claro
- El badge READ-ONLY es visible
- Se mantiene la codificacion por color (cada estado tiene su color semantico)
- Consistencia visual en toda la aplicacion

