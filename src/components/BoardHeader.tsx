import { Activity, EyeOff, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { SearchBar } from './SearchBar';
import { StaffCounters } from './StaffCounters';
import { FilterIndicator } from './FilterIndicator';
import { NewPatientForm } from './NewPatientForm';
import { ShiftSetup } from './ShiftSetup';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function BoardHeader() {
  const { shiftDate, hideDischargedFromBoard, setHideDischargedFromBoard } = usePatientStore();

  return (
    <div className="border-b border-border bg-card/50 p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        {/* Title and Date */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">ED Coordination Board</h1>
          </div>
          {shiftDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(shiftDate), 'EEEE, dd MMMM yyyy')}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <SearchBar />
          
          {/* Hide Discharged Toggle */}
          <div className="flex items-center gap-2">
            {hideDischargedFromBoard ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              id="hide-discharged"
              checked={hideDischargedFromBoard}
              onCheckedChange={setHideDischargedFromBoard}
            />
            <Label htmlFor="hide-discharged" className="text-xs text-muted-foreground cursor-pointer">
              Hide D/C
            </Label>
          </div>

          <NewPatientForm />
          <ShiftSetup />
        </div>
      </div>

      {/* Staff counters row */}
      <div className="flex items-center justify-between">
        <StaffCounters />
      </div>

      {/* Filter indicator row */}
      <FilterIndicator />
    </div>
  );
}
