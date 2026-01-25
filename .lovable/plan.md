

# Plan: Aumentar Slots Disponibles para Notas

## Situación Actual

```text
Cuadrícula actual: 3x3 = 9 slots
┌─────┬─────┬─────┐
│  0  │  1  │  2  │
├─────┼─────┼─────┤
│  3  │  4  │  5  │
├─────┼─────┼─────┤
│  6  │  7  │  8  │
└─────┴─────┴─────┘
```

---

## Propuesta: Expandir a 4x4 = 16 slots

```text
Nueva cuadrícula: 4x4 = 16 slots
┌─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │
├─────┼─────┼─────┼─────┤
│  4  │  5  │  6  │  7  │
├─────┼─────┼─────┼─────┤
│  8  │  9  │ 10  │ 11  │
├─────┼─────┼─────┼─────┤
│ 12  │ 13  │ 14  │ 15  │
└─────┴─────┴─────┴─────┘
```

Esto proporciona casi el doble de posiciones para organizar notas según las preferencias del coordinador.

---

## Cambios Necesarios

### Archivo: `src/components/StickerNotesColumn.tsx`

| Línea | Cambio |
|-------|--------|
| 16 | Cambiar `TOTAL_SLOTS = 9` a `TOTAL_SLOTS = 16` |
| 148 | Cambiar `grid-cols-3` a `grid-cols-4` |
| 141 | Ajustar `max-w-[140px]` a `max-w-[180px]` para acomodar la columna extra |

---

## Código Modificado

```typescript
const TOTAL_SLOTS = 16; // 4x4 grid

// En el contenedor:
<div 
  className="min-w-[120px] max-w-[180px]" 
  onClick={(e) => e.stopPropagation()}
>
  ...
  <div className="grid grid-cols-4 gap-0.5">
```

---

## Resultado Esperado

- 16 posiciones disponibles en lugar de 9
- Más flexibilidad para organizar notas según preferencia del coordinador
- Las notas existentes mantienen sus posiciones (slots 0-8)
- Nuevos slots disponibles (9-15) para expansión

