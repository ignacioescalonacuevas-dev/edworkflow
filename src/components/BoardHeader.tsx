import { useState } from 'react';
import { Activity, EyeOff, Eye, Calendar, ArrowLeft, BarChart3, RotateCcw, LogOut, User, ChevronDown, History, Settings, XCircle, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { SearchBar } from './SearchBar';
import { StaffCounters } from './StaffCounters';
import { StudyFilters } from './StudyFilters';
import { FilterIndicator } from './FilterIndicator';
import { NewPatientForm } from './NewPatientForm';
import { ShiftSetup } from './ShiftSetup';
import { ShiftHistoryDialog } from './ShiftHistoryDialog';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { EndShiftDialog } from './EndShiftDialog';
import { AgendaPanel } from './AgendaPanel';
import RoleGate from './RoleGate';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  coordinator: 'Coordinator',
  admission: 'Admission',
  viewer: 'Viewer',
};

export function BoardHeader() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [shiftSetupOpen, setShiftSetupOpen] = useState(false);
  const [endShiftOpen, setEndShiftOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { shiftDate, hideDischargedFromBoard, setHideDischargedFromBoard, resetToSampleData, patients } = usePatientStore();
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

  const displayDate = viewingDate || (shiftDate ? format(new Date(shiftDate), 'yyyy-MM-dd') : null);
  const isViewingHistory = viewingDate !== null;
  const historyShift = viewingDate ? loadShift(viewingDate) : null;

  // Count total pending studies for the popover trigger
  const STUDY_TYPES = ['CT', 'MRI', 'X-Ray', 'ECHO', 'US', 'ECG'] as const;
  const totalPending = patients.reduce((acc, p) => {
    return acc + p.stickerNotes.filter(note => 
      note.type === 'study' && !note.completed && STUDY_TYPES.includes(note.text as any)
    ).length;
  }, 0);

  return (
    <div className="border-b border-border bg-card/50 px-4 py-2 space-y-1.5">
      {/* Row 1: Title + date | Controls + User dropdown */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Title + date */}
        <div className="flex items-center gap-2 shrink-0">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">ED Board</h1>
          {displayDate && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(displayDate), 'EEE dd MMM')}
            </span>
          )}
          {isViewingHistory && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              READ-ONLY
            </Badge>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {isViewingHistory ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewingDate(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <>
              <SearchBar />
              
              {/* Hide D/C toggle compact */}
              <div className="flex items-center gap-1.5">
                {hideDischargedFromBoard ? (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <Switch
                  id="hide-discharged"
                  checked={hideDischargedFromBoard}
                  onCheckedChange={setHideDischargedFromBoard}
                />
                <Label htmlFor="hide-discharged" className="text-xs text-muted-foreground cursor-pointer">
                  D/C
                </Label>
              </div>

              <RoleGate allowedRoles={['coordinator', 'admission']}>
                <NewPatientForm />
              </RoleGate>
            </>
          )}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{displayName || user?.email?.split('@')[0] || 'User'}</span>
                  {role && (
                    <span className="text-[10px] text-muted-foreground leading-tight">{roleLabels[role] || role}</span>
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isViewingHistory && (
                <>
                  <DropdownMenuItem onClick={() => setAnalyticsOpen(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgendaOpen(true)}>
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Agenda
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {role === 'coordinator' && (
                    <>
                      <DropdownMenuItem onClick={() => setShiftSetupOpen(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Shift Setup
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEndShiftOpen(true)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        End Shift
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleResetData}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                    <History className="h-4 w-4 mr-2" />
                    Shift History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 2: StaffCounters (always visible) | FilterIndicator + Pending popover */}
      {!isViewingHistory && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StaffCounters />
          
          <div className="flex items-center gap-2 ml-auto">
            <FilterIndicator />

            {/* Pending studies popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border bg-muted/50 hover:bg-muted transition-colors">
                  Pending <span className="font-medium">{totalPending}</span>
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <StudyFilters />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Controlled dialogs (no triggers, opened via dropdown) */}
      <AgendaPanel open={agendaOpen} onOpenChange={setAgendaOpen} />
      <ShiftSetup open={shiftSetupOpen} onOpenChange={setShiftSetupOpen} />
      <EndShiftDialog open={endShiftOpen} onOpenChange={setEndShiftOpen} />
      <ShiftHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <AnalyticsDashboard 
        open={analyticsOpen} 
        onOpenChange={setAnalyticsOpen} 
      />
    </div>
  );
}
