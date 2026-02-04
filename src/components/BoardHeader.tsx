import { useState } from 'react';
import { Activity, EyeOff, Eye, Calendar, ArrowLeft, BarChart3, RotateCcw, LogOut, User } from 'lucide-react';
import { format } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { SearchBar } from './SearchBar';
import { StaffCounters } from './StaffCounters';
import { FilterIndicator } from './FilterIndicator';
import { NewPatientForm } from './NewPatientForm';
import { ShiftSetup } from './ShiftSetup';
import { ShiftHistoryDialog } from './ShiftHistoryDialog';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import RoleGate from './RoleGate';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  coordinator: 'Coordinator',
  admission: 'Admission',
  viewer: 'Viewer',
};

export function BoardHeader() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const { shiftDate, hideDischargedFromBoard, setHideDischargedFromBoard, resetToSampleData } = usePatientStore();
  const { viewingDate, setViewingDate, loadShift } = useShiftHistoryStore();
  const { signOut, user } = useAuth();
  const { displayName, role, canConfigureShift, canCreatePatients } = useUserRole();

  const handleResetData = () => {
    resetToSampleData();
    toast.success('Data reset to 25 sample patients');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

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

        {/* User info and Controls */}
        <div className="flex items-center gap-3">
          {/* User display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{displayName || user?.email?.split('@')[0] || 'User'}</span>
              {role && (
                <span className="text-xs text-muted-foreground">{roleLabels[role] || role}</span>
              )}
            </div>
          </div>

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

              <RoleGate allowedRoles={['coordinator']}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetData}
                  className="gap-2 text-muted-foreground"
                  title="Reset to sample data"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </RoleGate>

              <RoleGate allowedRoles={['coordinator', 'admission']}>
                <NewPatientForm />
              </RoleGate>
              
              <RoleGate allowedRoles={['coordinator']}>
                <ShiftSetup />
              </RoleGate>
              
              <ShiftHistoryDialog />
              
              <AnalyticsDashboard 
                open={analyticsOpen} 
                onOpenChange={setAnalyticsOpen} 
              />
            </>
          )}

          {/* Logout button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="gap-2 text-muted-foreground hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
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
