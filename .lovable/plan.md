
# Plan: Corregir Inconsistencia de Padding en Stickers

## Problema Identificado

Hay un conflicto de estilos que causa que algunos stickers se vean de diferente tamaño:

| Archivo | Línea | Valor | Problema |
|---------|-------|-------|----------|
| `src/index.css` | 131 | `p-2` | Define padding base correcto |
| `src/components/PatientSticker.tsx` | 412 | `p-2.5` | **Sobreescribe el CSS base** |

El `p-2.5` en el componente está sobreescribiendo el `p-2` del CSS, creando inconsistencias visuales.

---

## Visualización del Problema

```text
CSS Base (.sticker):     p-2 (8px)
Componente (inline):     p-2.5 (10px)  ← CONFLICTO

Tailwind aplica el último en orden de especificidad, 
pero el orden puede variar causando inconsistencias visuales.
```

---

## Solución

Eliminar el `p-2.5` del componente `PatientSticker.tsx` para que todos los stickers usen consistentemente el `p-2` definido en el CSS base.

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/PatientSticker.tsx` | Eliminar `p-2.5` de la clase del contenedor principal |

---

## Sección Técnica

### src/components/PatientSticker.tsx

**Línea 412: Eliminar p-2.5**

```tsx
// ANTES:
<div
  className={cn(
    "sticker transition-all hover:border-primary/50 group h-full flex flex-col p-2.5 relative overflow-hidden",
    isInAdmissionProcess && "sticker-admission",
    isDischarged && "sticker-discharged"
  )}
>

// DESPUÉS:
<div
  className={cn(
    "sticker transition-all hover:border-primary/50 group h-full flex flex-col relative overflow-hidden",
    isInAdmissionProcess && "sticker-admission",
    isDischarged && "sticker-discharged"
  )}
>
```

El padding `p-2` viene automáticamente de la clase `.sticker` definida en `index.css` línea 131.

---

## Resultado Esperado

- Todos los stickers tendrán exactamente el mismo padding (`p-2` = 8px)
- No habrá conflictos entre estilos CSS e inline
- Los stickers de la primera fila (Derek Hayes, Rory Quinn, etc.) se verán idénticos a los de las demás filas
