

# Plan: Add Study Filters for Pending Imaging

## Overview

Add quick filter buttons to show patients who are pending specific imaging studies (CT, MRI, X-Ray, etc.). This helps coordinators quickly identify who needs to go to imaging.

```text
Current Layout:
┌────────────────────────────────────────────────────────────────┐
│ ED Coordination Board                     [Search] [Controls]  │
├────────────────────────────────────────────────────────────────┤
│ MD: TAU (5) Joanna (3)  │  RN: Nebin (4) Beatriz (3)          │  ← Staff counters
├────────────────────────────────────────────────────────────────┤
│ Showing: 25 of 25                                              │  ← Filter indicator
└────────────────────────────────────────────────────────────────┘

Proposed Layout:
┌────────────────────────────────────────────────────────────────┐
│ ED Coordination Board                     [Search] [Controls]  │
├────────────────────────────────────────────────────────────────┤
│ MD: TAU (5) Joanna (3)  │  RN: Nebin (4) Beatriz (3)          │  ← Staff counters
│ Pending: CT (3) MRI (1) XR (2) ECHO (0) US (1)                 │  ← NEW: Study filters
├────────────────────────────────────────────────────────────────┤
│ Showing: 3 of 25  [Pending CT ×]                               │  ← Filter indicator
└────────────────────────────────────────────────────────────────┘
```

---

## Behavior

| Action | Result |
|--------|--------|
| Click "CT (3)" | Shows only patients with pending CT study |
| Click again | Clears the filter |
| Multiple clicks | Only one study filter active at a time |
| Study count = 0 | Button shown but grayed out, not clickable |
| Clear in FilterIndicator | Also clears study filter |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/store/patientStore.ts` | Add `filterByPendingStudy` state and action |
| `src/components/StudyFilters.tsx` | NEW: Study filter buttons component |
| `src/components/BoardHeader.tsx` | Include StudyFilters component |
| `src/components/FilterIndicator.tsx` | Show pending study filter badge |

---

## Technical Section

### 1. patientStore.ts - New State and Action

```typescript
// New state in PatientStore interface
filterByPendingStudy: string | null;  // e.g., 'CT', 'MRI', 'X-Ray'

// New action
setFilterByPendingStudy: (study: string | null) => void;

// Update clearFilters to include study filter
clearFilters: () => {
  set({ 
    searchQuery: '', 
    filterByDoctor: null, 
    filterByNurse: null,
    filterByPendingStudy: null,  // NEW
  });
};

// Update getFilteredPatients
if (state.filterByPendingStudy) {
  result = result.filter(p => 
    p.stickerNotes.some(note => 
      note.type === 'study' && 
      !note.completed && 
      note.text === state.filterByPendingStudy
    )
  );
}
```

### 2. StudyFilters.tsx - New Component

```tsx
import { usePatientStore } from '@/store/patientStore';
import { cn } from '@/lib/utils';

const STUDY_TYPES = ['CT', 'MRI', 'X-Ray', 'ECHO', 'US', 'ECG'] as const;

export function StudyFilters() {
  const { 
    patients, 
    filterByPendingStudy, 
    setFilterByPendingStudy,
    hideDischargedFromBoard 
  } = usePatientStore();

  // Only count active patients
  const activePatients = hideDischargedFromBoard
    ? patients.filter(p => p.status !== 'discharged' && p.status !== 'transferred')
    : patients;

  // Count pending studies
  const studyCounts = STUDY_TYPES.map(study => ({
    name: study,
    count: activePatients.filter(p => 
      p.stickerNotes.some(note => 
        note.type === 'study' && !note.completed && note.text === study
      )
    ).length,
  }));

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground text-xs mr-1">Pending:</span>
      {studyCounts.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => count > 0 && setFilterByPendingStudy(
            filterByPendingStudy === name ? null : name
          )}
          disabled={count === 0}
          className={cn(
            "study-filter text-xs px-2 py-1 rounded border transition-colors",
            count === 0 && "opacity-40 cursor-not-allowed",
            filterByPendingStudy === name 
              ? "bg-blue-500/20 text-blue-400 border-blue-500" 
              : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
          )}
        >
          {name}
          <span className="ml-1 opacity-70">({count})</span>
        </button>
      ))}
    </div>
  );
}
```

### 3. BoardHeader.tsx - Include Component

```tsx
import { StudyFilters } from './StudyFilters';

// In the staff counters row, add StudyFilters:
{!isViewingHistory && (
  <div className="flex items-center justify-between flex-wrap gap-2">
    <StaffCounters />
    <div className="h-4 w-px bg-border" />
    <StudyFilters />
  </div>
)}
```

### 4. FilterIndicator.tsx - Show Study Filter Badge

```tsx
const { filterByPendingStudy, setFilterByPendingStudy, ... } = usePatientStore();

const hasFilters = filterByDoctor || filterByNurse || searchQuery || filterByPendingStudy;

// Add in the filter badges section:
{filterByPendingStudy && (
  <Badge variant="secondary" className="gap-1 text-xs bg-blue-500/20 text-blue-400">
    Pending {filterByPendingStudy}
    <button onClick={() => setFilterByPendingStudy(null)} className="hover:text-destructive">
      <X className="h-3 w-3" />
    </button>
  </Badge>
)}
```

---

## Expected Result

- Quick filter buttons for CT, MRI, X-Ray, ECHO, US, ECG
- Real-time count of patients pending each study
- Click to filter, click again to clear
- Grayed out buttons when count is 0
- Consistent styling with existing staff counters
- Filter badge in indicator row with clear button

