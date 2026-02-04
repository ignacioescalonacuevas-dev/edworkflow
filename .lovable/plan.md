

# Plan: Optimize Sticker Spacing - Keep Structure, Remove Whitespace, Increase Fonts

## Overview

Keep the current 3-column + footer structure (which mirrors the paper system) but optimize by reducing unnecessary padding/margins and increasing font sizes for better tablet readability.

---

## Issues Identified

| Issue | Current Value | Impact |
|-------|---------------|--------|
| Container padding | `p-2.5` (10px) | Too much internal whitespace |
| Grid gap | `gap-1.5` (6px) | Could be tighter |
| Footer top spacing | `pt-1 mt-1` | Could be reduced |
| Notes grid gap | `gap-1` (4px) | Could be tighter |
| Patient name | `text-[15px]` | Good, keep |
| DOB / M-Number | `text-[11px]` | Too small for tablet |
| Chief complaint | `text-[10px]` | Too small for tablet |
| Timer | `text-[9px]` | Very hard to read |
| Process state | `text-[10px]` | Could be larger |
| Staff column padding | `py-0.5` | Adds unnecessary height |

---

## Proposed Changes

| Element | Current | Proposed | Saved/Gained |
|---------|---------|----------|--------------|
| **Container padding** | `p-2.5` | `p-2` | +4px total |
| **Grid gap** | `gap-1.5` | `gap-1` | +4px horizontal |
| **Footer spacing** | `pt-1 mt-1` | `pt-0.5 mt-0.5` | +4px vertical |
| **Notes grid gap** | `gap-1` | `gap-0.5` | Tighter notes |
| **Staff column py** | `py-0.5` | `py-0` | Removes extra space |
| **DOB / M-Number** | `text-[11px]` | `text-xs` (12px) | More readable |
| **Chief complaint** | `text-[10px]` | `text-xs` (12px) | More readable |
| **Timer** | `text-[9px]` | `text-[11px]` | More readable |
| **Process state** | `text-[10px]` | `text-xs` (12px) | More readable |
| **Admission note** | `text-[10px]` | `text-[11px]` | More readable |
| **Bed number** | `text-[10px]` | `text-[11px]` | More readable |

---

## Visual Comparison

```text
CURRENT (with excessive padding):
┌──────────────────────────────────────────────────────────────────────┐
│ ← p-2.5 (10px padding all around)                                    │
│   ┌─────────────────────┬──────────────────┬─────────────┐           │
│   │                     │     gap-1.5      │   py-0.5    │           │
│   │  Name [15px] ✓      │   ┌──┬──┬──┐     │     WR      │           │
│   │  DOB [11px] ✗       │   │  │  │  │     │     TA      │           │
│   │  M-Num [11px] ✗     │   ├──┼──┼──┤     │     NB      │           │
│   │                     │   │  │  │  │     │   py-0.5    │           │
│   │                     │   └──┴──┴──┘     │             │           │
│   └─────────────────────┴──────────────────┴─────────────┘           │
│   ┌──────────────────────────────────────────────────────┐           │
│   │ pt-1 mt-1                                            │           │
│   │ Chief [10px] ✗      Timer [9px] ✗   [State 10px] ✗   │           │
│   └──────────────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────────┘

OPTIMIZED (same structure, less whitespace, larger fonts):
┌────────────────────────────────────────────────────────────────────┐
│ ← p-2 (8px padding all around)                                      │
│  ┌─────────────────────┬──────────────────┬────────────┐            │
│  │                     │     gap-1        │    py-0    │            │
│  │  Name [15px] ✓      │   ┌──┬──┬──┐     │     WR     │            │
│  │  DOB [12px] ✓       │   │  │  │  │     │     TA     │            │
│  │  M-Num [12px] ✓     │   ├──┼──┼──┤     │     NB     │            │
│  │                     │   │  │  │  │     │            │            │
│  │                     │   └──┴──┴──┘     │            │            │
│  └─────────────────────┴──────────────────┴────────────┘            │
│  ┌──────────────────────────────────────────────────────┐           │
│  │ pt-0.5 mt-0.5 (less border spacing)                  │           │
│  │ Chief [12px] ✓      Timer [11px] ✓   [State 12px] ✓  │           │
│  └──────────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/PatientSticker.tsx` | Reduce padding, gaps, increase fonts |
| `src/components/ProcessStateDropdown.tsx` | Increase font to `text-xs` |
| `src/components/StickerNotesColumn.tsx` | Reduce grid gap |
| `src/index.css` | Update sticker base padding |

---

## Technical Section

### 1. src/index.css - Base sticker padding

```css
/* Line 131: Change from p-2.5 to p-2 */
.sticker {
  @apply p-2 rounded-lg border bg-card text-sm relative;
}
```

### 2. src/components/PatientSticker.tsx

**Line 412: Container padding already in CSS, just confirm**

**Line 419: Grid gap**
```tsx
// Change from gap-1.5 to gap-1
<div className="grid grid-cols-[1fr_114px_44px] gap-1 flex-1 min-h-0">
```

**Line 441: DOB font**
```tsx
// Change from text-[11px] to text-xs
<span className="text-xs text-muted-foreground">{patient.dateOfBirth}</span>
```

**Line 452: Bed number font**
```tsx
// Change from text-[10px] to text-[11px]
<span className="text-[11px] text-cyan-600 font-medium">
```

**Line 460: M-Number font**
```tsx
// Change from text-[11px] to text-xs
<span className="text-xs text-muted-foreground font-mono">{patient.mNumber}</span>
```

**Line 489: Staff column padding**
```tsx
// Remove py-0.5 (change to no vertical padding)
<div className="flex flex-col items-center justify-between">
```

**Line 531: Footer spacing**
```tsx
// Change from pt-1 mt-1 to pt-0.5 mt-0.5
<div className="flex items-center gap-1.5 pt-0.5 mt-0.5 border-t border-border/50">
```

**Line 533: Chief complaint read-only font**
```tsx
// Change from text-[10px] to text-xs
<span className="text-xs text-muted-foreground flex-1 truncate">
```

**Line 205 (EditableChiefComplaint): Editable font**
```tsx
// Change from text-[10px] to text-xs
className="text-xs text-muted-foreground flex-1 cursor-pointer..."
```

**Line 542: Timer font**
```tsx
// Change from text-[9px] to text-[11px]
className="text-[11px] text-muted-foreground..."
```

**Lines 109, 137, 151 (EditableFreeNote): Admission note fonts**
```tsx
// Change from text-[10px] to text-[11px]
className="text-[11px] text-cyan-600..."
```

### 3. src/components/ProcessStateDropdown.tsx

**Lines 26 and 40: Badge font**
```tsx
// Change from text-[10px] to text-xs
className={cn(
  "text-xs px-1 py-0.5 shrink-0 rounded border...",
  ...
)}
```

### 4. src/components/StickerNotesColumn.tsx

**Line 159: Grid gap**
```tsx
// Change from gap-1 to gap-0.5
<div className="grid grid-cols-3 grid-rows-2 gap-0.5">
```

---

## Expected Result

- Same 3-column + footer structure preserved
- Reduced internal whitespace (~12px saved vertically)
- All small fonts upgraded to minimum 11-12px for tablet readability
- Tighter grid gaps without losing visual separation
- Better use of available space
- Familiar layout for users transitioning from paper system

