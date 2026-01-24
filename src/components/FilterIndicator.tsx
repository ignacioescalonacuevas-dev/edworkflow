import { X } from 'lucide-react';
import { usePatientStore, getFilteredPatients } from '@/store/patientStore';
import { Badge } from '@/components/ui/badge';

export function FilterIndicator() {
  const store = usePatientStore();
  const { 
    patients, 
    filterByDoctor, 
    filterByNurse, 
    searchQuery,
    hideDischargedFromBoard,
    setFilterByDoctor, 
    setFilterByNurse,
    setSearchQuery,
    clearFilters 
  } = store;

  const filteredPatients = getFilteredPatients(store);
  const hasFilters = filterByDoctor || filterByNurse || searchQuery;
  
  const activeCount = patients.filter(p => p.status !== 'discharged' && p.status !== 'transferred').length;
  const dischargedCount = patients.filter(p => p.status === 'discharged' || p.status === 'transferred').length;

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center gap-2">
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

          <button 
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Patient counts */}
      <div className="text-xs text-muted-foreground ml-auto">
        Showing: <span className="text-foreground font-medium">{filteredPatients.length}</span>
        {hasFilters && ` of ${activeCount}`}
        {!hideDischargedFromBoard && dischargedCount > 0 && (
          <span className="text-muted-foreground"> ({dischargedCount} discharged)</span>
        )}
      </div>
    </div>
  );
}
