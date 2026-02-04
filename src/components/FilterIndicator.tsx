import { useMemo } from 'react';
import { X } from 'lucide-react';
import { usePatientStore, getFilteredPatients } from '@/store/patientStore';
import { Badge } from '@/components/ui/badge';
import { ProcessState } from '@/types/patient';
import { cn } from '@/lib/utils';

// State buttons configuration - now using ProcessState directly (8 states)
const stateButtons: Array<{
  key: ProcessState;
  label: string;
  color: string;
  activeColor: string;
}> = [
  { key: 'registered', label: 'Reg', color: 'bg-muted/50 text-muted-foreground hover:bg-muted', activeColor: 'bg-muted text-foreground' },
  { key: 'did_not_wait', label: 'DNW', color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30', activeColor: 'bg-orange-500/40 text-orange-300' },
  { key: 'to_be_seen', label: 'TBS', color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30', activeColor: 'bg-purple-500/40 text-purple-300' },
  { key: 'awaiting_results', label: 'Wait', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30', activeColor: 'bg-yellow-500/40 text-yellow-300' },
  { key: 'admission', label: 'Adm', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30', activeColor: 'bg-cyan-500/40 text-cyan-300' },
  { key: 'admitted', label: "Adm'd", color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30', activeColor: 'bg-green-500/40 text-green-300' },
  { key: 'discharged', label: 'D/C', color: 'bg-muted/50 text-muted-foreground hover:bg-muted', activeColor: 'bg-muted text-foreground' },
  { key: 'transferred', label: 'Trans', color: 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30', activeColor: 'bg-slate-500/40 text-slate-300' },
];

// Terminal states (hidden by Hide D/C toggle)
const TERMINAL_STATES: ProcessState[] = ['discharged', 'transferred', 'admitted', 'did_not_wait'];

export function FilterIndicator() {
  const store = usePatientStore();
  const { 
    patients, 
    filterByDoctor, 
    filterByNurse,
    filterByPendingStudy,
    filterByProcessState,
    searchQuery,
    hideDischargedFromBoard,
    setFilterByDoctor, 
    setFilterByNurse,
    setFilterByPendingStudy,
    setFilterByProcessState,
    setSearchQuery,
    clearFilters 
  } = store;

  const filteredPatients = getFilteredPatients(store);
  const hasFilters = filterByDoctor || filterByNurse || searchQuery || filterByPendingStudy || filterByProcessState;
  
  // Count patients by state (using all patients, not filtered)
  // Now direct counting since 'admitted' is a real ProcessState
  const stateCounts = useMemo(() => {
    const counts: Record<ProcessState, number> = {
      registered: 0,
      did_not_wait: 0,
      to_be_seen: 0,
      awaiting_results: 0,
      admission: 0,
      admitted: 0,
      discharged: 0,
      transferred: 0,
    };
    patients.forEach(p => {
      if (p.processState in counts) {
        counts[p.processState]++;
      }
    });
    return counts;
  }, [patients]);
  
  // Count active patients (non-terminal states)
  const activeCount = useMemo(() => {
    return patients.filter(p => !TERMINAL_STATES.includes(p.processState)).length;
  }, [patients]);

  const handleStateClick = (stateKey: ProcessState) => {
    if (filterByProcessState === stateKey) {
      setFilterByProcessState(null);
    } else {
      setFilterByProcessState(stateKey);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm flex-wrap">
      {/* Active filters badges */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground text-xs">Filtering:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 text-xs">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filterByDoctor && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filterByDoctor}
              <button onClick={() => setFilterByDoctor(null)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filterByNurse && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filterByNurse}
              <button onClick={() => setFilterByNurse(null)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filterByPendingStudy && (
            <Badge variant="secondary" className="gap-1 text-xs bg-primary/20 text-primary border-primary">
              Pending {filterByPendingStudy}
              <button onClick={() => setFilterByPendingStudy(null)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filterByProcessState && (
            <Badge variant="secondary" className="gap-1 text-xs bg-primary/20 text-primary border-primary">
              {stateButtons.find(s => s.key === filterByProcessState)?.label || filterByProcessState}
              <button onClick={() => setFilterByProcessState(null)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <button 
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Patient counts with interactive state buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-muted-foreground">
          Showing: <span className="text-foreground font-medium">{filteredPatients.length}</span>
          {hasFilters && ` of ${patients.length}`}
        </span>
        
        <div className="h-4 w-px bg-border" />
        
        {/* State filter buttons */}
        <div className="flex items-center gap-1">
          {stateButtons.map(({ key, label, color, activeColor }) => {
            const count = stateCounts[key] || 0;
            const isActive = filterByProcessState === key;
            const isTerminal = TERMINAL_STATES.includes(key);
            const isHiddenByToggle = hideDischargedFromBoard && isTerminal && !filterByProcessState;
            
            return (
              <button
                key={key}
                onClick={() => handleStateClick(key)}
                disabled={count === 0}
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium transition-all",
                  isActive ? activeColor : color,
                  isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  count === 0 && "opacity-40 cursor-not-allowed",
                  isHiddenByToggle && count > 0 && "opacity-60"
                )}
                title={isHiddenByToggle && count > 0 ? `Hidden by "Hide D/C" toggle. Click to view.` : undefined}
              >
                {label} {count}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
