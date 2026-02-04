

# Plan: Arreglar Toggle de Hora/Tiempo en Sticker

## Problema Identificado

El toggle de hora/tiempo **sí está implementado** correctamente en el código, pero no funciona bien porque:

1. **Área de click muy pequeña** - El `<span>` con `text-[10px]` (10 píxeles) es demasiado pequeño para hacer click fácilmente
2. **Color casi invisible** - `text-muted-foreground/70` (gris al 70% de opacidad) es muy difícil de ver
3. **Sin indicación visual** - No hay manera de saber que es clickeable (solo un tooltip que aparece al hacer hover)

---

## Solución

Hacer el elemento más grande, más visible, y con mejor feedback visual:

### Cambios en PatientSticker.tsx

```text
Antes:
┌────────────────────────────────┐
│  M00123456              2h30   │  ← muy pequeño, gris tenue
└────────────────────────────────┘

Después:
┌────────────────────────────────┐
│  M00123456            [2h30]   │  ← más visible, con padding, cursor diferente
└────────────────────────────────┘
```

### Mejoras específicas:

| Aspecto | Antes | Después |
|---------|-------|---------|
| Tamaño texto | `text-[10px]` | `text-[11px]` |
| Color | `text-muted-foreground/70` | `text-muted-foreground` |
| Padding | ninguno | `px-1 py-0.5` |
| Hover | solo cambia color | fondo sutíl + color |
| Borde | ninguno | borde fino al hover |
| Área clickeable | solo texto | texto + padding |

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/PatientSticker.tsx` | Mejorar estilo y área clickeable del toggle de tiempo |

---

## Sección Técnica

### Cambio en PatientSticker.tsx (líneas 375-384)

```typescript
// ANTES:
<span 
  className="text-[10px] text-muted-foreground/70 ml-auto cursor-pointer hover:text-foreground transition-colors"
  onClick={(e) => {
    e.stopPropagation();
    toggleTimeDisplay();
  }}
  title={showArrivalTime ? 'Click para ver tiempo transcurrido' : 'Click para ver hora de llegada'}
>
  {showArrivalTime ? arrivalTimeStr : elapsedTime}
</span>

// DESPUÉS:
<button 
  type="button"
  className="text-[11px] text-muted-foreground ml-auto px-1 py-0.5 rounded hover:bg-muted hover:text-foreground transition-all cursor-pointer"
  onClick={(e) => {
    e.stopPropagation();
    toggleTimeDisplay();
  }}
  title={showArrivalTime ? 'Click para ver tiempo transcurrido' : 'Click para ver hora de llegada'}
>
  {showArrivalTime ? arrivalTimeStr : elapsedTime}
</button>
```

### Por qué usar `<button>` en vez de `<span>`:

1. **Semántica correcta** - Es un elemento interactivo, debe ser un botón
2. **Accesibilidad** - Los lectores de pantalla lo reconocen como clickeable
3. **Área de click natural** - Los botones tienen mejor comportamiento de hit-testing

---

## Resultado

Después de implementar:
- El tiempo será **más visible** (color más oscuro, tamaño más grande)
- Tendrá un **efecto hover claro** (fondo gris al pasar el mouse)
- El **área de click será más grande** (incluye padding)
- **Click funcionará consistentemente** en todos los stickers

