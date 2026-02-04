

# Plan: Optimize Sticker Layout - Reduce Footer, Enhance Main Content

## Overview

The footer area (chief complaint + process state) currently uses more vertical space than necessary compared to the main patient information. By reducing the footer's padding and font sizes, we can reallocate that space to make the primary content (patient name, notes grid, staff info) larger and more visible.

---

## Current vs Proposed Layout

```text
CURRENT STICKER (~100px total height)
┌──────────────────────────────────────────────────────────┐
│ Name + Triage                    │ Notes │ Box          │
│ DOB + Consultant/Bed             │ Grid  │ Dr           │  ~60px
│ M-Number + Appointments          │ (3×2) │ RN           │
├──────────────────────────────────────────────────────────┤
│ pt-1.5 mt-1.5                                            │
│ Chief Complaint          Timer        [Process State]    │  ~35-40px
│ (large padding & text-xs)                                │
└──────────────────────────────────────────────────────────┘

PROPOSED STICKER (~100px total height - rebalanced)
┌──────────────────────────────────────────────────────────┐
│ Name + Triage                    │ Notes │ Box          │
│ DOB + Consultant/Bed             │ Grid  │ Dr           │  ~70px
│ M-Number + Appointments          │ (3×2) │ RN           │  (+larger)
├──────────────────────────────────────────────────────────┤
│ pt-1 mt-1 (compact)                                      │
│ Chest pain          2h30  [Awaiting]                     │  ~25-28px
│ (text-[10px] compact)                                    │
└──────────────────────────────────────────────────────────┘
```

---

## Changes Summary

| Element | Current | Proposed |
|---------|---------|----------|
| **Footer padding** | `pt-1.5 mt-1.5` | `pt-1 mt-1` |
| **Chief complaint font** | `text-xs` (12px) | `text-[10px]` (10px) |
| **Timer font** | `text-[10px]` | `text-[9px]` (9px) |
| **Process state font** | `text-[11px]` | `text-[10px]` |
| **Process state padding** | `px-1.5 py-0.5` | `px-1 py-0.5` |
| **Patient name font** | `text-sm` (14px) | `text-[15px]` (15px) |
| **Notes grid slots** | `34×26px` | `36×28px` |
| **Notes column width** | `110px` | `114px` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/PatientSticker.tsx` | Reduce footer padding/sizes, increase name size |
| `src/components/ProcessStateDropdown.tsx` | Reduce button font and padding |
| `src/components/StickerNotesColumn.tsx` | Slightly increase slot sizes |
| `src/components/StickerNoteItem.tsx` | Increase note button sizes |

---

## Technical Section

### 1. PatientSticker.tsx

**Footer (lines 530-556):**
```tsx
// Change from:
<div className="flex items-center gap-2 pt-1.5 mt-1.5 border-t border-border/50">

// To:
<div className="flex items-center gap-1.5 pt-1 mt-1 border-t border-border/50">
```

**Chief complaint (line 205):**
```tsx
// Change from:
className="text-xs text-muted-foreground flex-1 cursor-pointer..."

// To:
className="text-[10px] text-muted-foreground flex-1 cursor-pointer..."
```

**Editable input (line 193):**
```tsx
// Change from:
className="h-5 text-xs px-1.5 py-0..."

// To:
className="h-4 text-[10px] px-1 py-0..."
```

**Timer button (line 542):**
```tsx
// Change from:
className="text-[10px] text-muted-foreground px-1 py-0.5..."

// To:
className="text-[9px] text-muted-foreground px-0.5 py-0.5..."
```

**Patient name (line 424):**
```tsx
// Change from:
<span className="font-semibold text-sm leading-tight">

// To:
<span className="font-semibold text-[15px] leading-tight">
```

### 2. ProcessStateDropdown.tsx

**Read-only state (lines 25-31):**
```tsx
// Change from:
className={cn(
  "text-[11px] px-1.5 py-0.5 shrink-0 rounded border",
  ...
)}

// To:
className={cn(
  "text-[10px] px-1 py-0.5 shrink-0 rounded border",
  ...
)}
```

**Editable button (lines 38-45):**
```tsx
// Change from:
className={cn(
  "text-[11px] px-1.5 py-0.5 shrink-0 rounded border cursor-pointer...",
  ...
)}

// To:
className={cn(
  "text-[10px] px-1 py-0.5 shrink-0 rounded border cursor-pointer...",
  ...
)}
```

### 3. StickerNotesColumn.tsx

**Column width (line 152):**
```tsx
// Change from:
className="w-[110px]"

// To:
className="w-[114px]"
```

**Slot sizes (lines 39, 62, 77):**
```tsx
// Change from:
className="w-[34px] h-[26px]..."

// To:
className="w-[36px] h-[28px]..."
```

### 4. StickerNoteItem.tsx

**Study button (line 62):**
```tsx
// Change from:
className="w-[34px] h-[26px] rounded text-[11px]..."

// To:
className="w-[36px] h-[28px] rounded text-[11px]..."
```

**Other notes (line 105):**
```tsx
// Change from:
className="w-[34px] h-[26px] rounded text-[11px]..."

// To:
className="w-[36px] h-[28px] rounded text-[11px]..."
```

### 5. Grid column adjustment (PatientSticker.tsx line 419)

```tsx
// Change from:
<div className="grid grid-cols-[1fr_90px_44px] gap-1.5 flex-1 min-h-0">

// To:
<div className="grid grid-cols-[1fr_114px_44px] gap-1.5 flex-1 min-h-0">
```

---

## Expected Result

- Footer takes ~25-28px instead of ~35-40px (30% reduction)
- Patient name larger and more readable (15px vs 14px)
- Notes grid slightly larger (36×28px vs 34×26px) 
- Better visual balance between main content and footer
- Same overall sticker height, just redistributed space

