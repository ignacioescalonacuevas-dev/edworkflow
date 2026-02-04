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

  // Only count active patients using processState (exclude terminal states if hidden)
  const activePatients = hideDischargedFromBoard
    ? patients.filter(p => {
        if (p.processState === 'discharged') return false;
        if (p.processState === 'transferred') return false;
        if (p.processState === 'admission' && p.admission?.completedAt) return false;
        return true;
      })
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
            "text-xs px-2 py-1 rounded border transition-colors",
            count === 0 && "opacity-40 cursor-not-allowed",
            filterByPendingStudy === name 
              ? "bg-primary/20 text-primary border-primary" 
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
