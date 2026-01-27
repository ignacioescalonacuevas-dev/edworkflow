import { useState } from 'react';
import { Activity, EyeOff, Eye, Calendar, ArrowLeft, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { SearchBar } from './SearchBar';
import { StaffCounters } from './StaffCounters';
import { FilterIndicator } from './FilterIndicator';
import { NewPatientForm } from './NewPatientForm';
import { ShiftSetup } from './ShiftSetup';
import { ShiftHistoryDialog } from './ShiftHistoryDialog';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BoardHeader() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const { shiftDate, hideDischargedFromBoard, setHideDischargedFromBoard } = usePatientStore();
  const { viewingDate, setViewingDate, loadShift } = useShiftHistoryStore();

  // If viewing history, show that date instead
  const displayDate = viewingDate || (shiftDate ? format(new Date(shiftDate), 'yyyy-MM-dd') : null);
  const isViewingHistory = viewingDate !== null;

  // Get the shift data if viewing history
  const historyShift = viewingDate ? loadShift(viewingDate) : null;

  return (
    <div className="border-b border-border bg-card/50 p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        {/* Title and Date */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">ED Coordination Board</h1>
            {isViewingHistory && (
              <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                READ-ONLY
              </Badge>
            )}
          </div>
          {displayDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(displayDate), 'EEEE, dd MMMM yyyy')}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {isViewingHistory ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewingDate(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Today
            </Button>
          ) : (
            <>
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

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAnalyticsOpen(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>

              <NewPatientForm />
              <ShiftSetup />
              <ShiftHistoryDialog />
              
              <AnalyticsDashboard 
                open={analyticsOpen} 
                onOpenChange={setAnalyticsOpen} 
              />
            </>
          )}
        </div>
      </div>

      {/* Staff counters row */}
      {!isViewingHistory && (
        <div className="flex items-center justify-between">
          <StaffCounters />
        </div>
      )}

      {/* Filter indicator row */}
      {!isViewingHistory && <FilterIndicator />}
    </div>
  );
}
