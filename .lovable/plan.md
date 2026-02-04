

# Plan: Add Scroll to Patient Board

## Problem

The current layout uses `overflow-hidden` at multiple levels, preventing any scrolling. If the 4×8 grid doesn't fit on the screen, patients are cut off and invisible.

## Solution

Change from a fixed-height grid that forces content to fit, to a scrollable container that allows natural content flow. This gives users the ability to scroll down to see all patients when the screen is too small.

---

## Changes

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Change `overflow-hidden` to `overflow-auto` on main element |
| `src/components/PatientBoard.tsx` | Change grid from `1fr` rows to `minmax()` rows for minimum height, add scroll wrapper |

---

## Technical Section

### 1. Index.tsx - Enable overflow

```tsx
// Line 35: Keep overflow-hidden on outer container (prevents body scroll)
<div className="flex h-screen w-full overflow-hidden bg-background">

// Line 43: Change overflow-hidden to overflow-auto
<main className="flex-1 overflow-auto">
```

### 2. PatientBoard.tsx - Scrollable grid

```tsx
// Line 46: Change from flex-1 to auto height, add overflow-auto
<div className="flex-1 overflow-auto p-3">

// Lines 48-53: Change grid rows from 1fr to min-height
<div 
  className="grid grid-cols-4 gap-2"
  style={{ 
    gridTemplateRows: 'repeat(8, minmax(100px, auto))',
    gridAutoFlow: 'column' 
  }}
>
```

This gives each row a minimum height of 100px but allows it to grow if needed, and the parent container becomes scrollable.

---

## Expected Result

- Users can scroll down to see all patient stickers
- Each sticker has a minimum height of ~100px for readability
- The fixed 4×8 grid structure is preserved
- Pagination still works for more than 32 patients
- Works well on smaller tablet screens

