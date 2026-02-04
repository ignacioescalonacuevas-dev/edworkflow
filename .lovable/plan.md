

# Plan: Triángulo de Triage Apuntando Hacia Arriba con Número

## Resumen

Cambiar el triángulo de triage para que:
1. **Apunte hacia arriba** (como ⚠️ señal de advertencia)
2. **Muestre el número** del nivel de triage dentro
3. **Sea compacto** para ahorrar espacio
4. Quede al lado derecho del nombre del paciente

---

## Diseño Visual

```text
Antes (triángulo diagonal en esquina):
┌─┬─────────────────────────────────┐
│3│ John Smith                      │
└─┴─────────────────────────────────┘

Después (triángulo hacia arriba al lado del nombre):
┌───────────────────────────────────┐
│ John Smith ▲3                     │
└───────────────────────────────────┘
        ↑
   Triángulo warning con número dentro
```

El triángulo tendrá aproximadamente 14px de altura, con el número centrado, y el color correspondiente al nivel de triage.

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/TriageBadge.tsx` | Cambiar triángulo inline para apuntar hacia arriba con número visible |

---

## Sección Técnica

### Cambio en TriageBadge.tsx

El triángulo actual usa CSS borders para crear una forma diagonal. Lo cambiaremos a un triángulo apuntando hacia arriba usando `clip-path` o SVG inline para poder incluir el número dentro.

```typescript
// Versión inline - triángulo apuntando hacia arriba con número
if (inline) {
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center shrink-0 relative",
        interactive && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      title={`Triage ${level}: ${config.label} (${config.time})`}
      onClick={onClick}
    >
      {/* Triángulo apuntando hacia arriba usando clip-path */}
      <div 
        className={cn(
          "w-4 h-4 flex items-center justify-center",
          level === 1 && "text-red-500",
          level === 2 && "text-orange-500",
          level === 3 && "text-yellow-500",
          level === 4 && "text-green-500",
          level === 5 && "text-blue-500",
        )}
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          backgroundColor: 'currentColor',
        }}
      />
      {/* Número centrado sobre el triángulo */}
      <span className={cn(
        "absolute text-[9px] font-bold bottom-[1px]",
        level <= 2 ? "text-white" : "text-gray-900"
      )}>
        {level}
      </span>
    </div>
  );
}
```

### Alternativa con SVG (más preciso)

```typescript
if (inline) {
  const colors = {
    1: '#ef4444', // red-500
    2: '#f97316', // orange-500
    3: '#eab308', // yellow-500
    4: '#22c55e', // green-500
    5: '#3b82f6', // blue-500
  };
  
  return (
    <div 
      className={cn(
        "inline-flex items-center shrink-0 relative",
        interactive && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      title={`Triage ${level}: ${config.label} (${config.time})`}
      onClick={onClick}
    >
      <svg width="16" height="14" viewBox="0 0 16 14">
        <polygon 
          points="8,0 16,14 0,14" 
          fill={colors[level]}
        />
        <text 
          x="8" 
          y="12" 
          textAnchor="middle" 
          fontSize="8" 
          fontWeight="bold"
          fill={level <= 2 ? 'white' : '#1f2937'}
        >
          {level}
        </text>
      </svg>
    </div>
  );
}
```

---

## Resultado

| Aspecto | Antes | Después |
|---------|-------|---------|
| Forma | Diagonal (esquina) | Triángulo ▲ hacia arriba |
| Número | No visible en inline | Visible centrado |
| Tamaño | 16px diagonal | 16x14px compacto |
| Posición | Al lado del nombre | Al lado del nombre |
| Espacio | Ocupa más | Más compacto |

