import { History, Calendar, Users, UserCheck, LogOut, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { usePatientStore } from '@/store/patientStore';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShiftHistoryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShiftHistoryDialog({ open: controlledOpen, onOpenChange }: ShiftHistoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const [reopenDate, setReopenDate] = useState<string | null>(null);
  const { getAvailableDates, loadShift, setViewingDate } = useShiftHistoryStore();
  const { reopenShift, shiftConfigured } = usePatientStore();
  const dates = getAvailableDates();

  const handleViewShift = (date: string) => {
    setViewingDate(date);
    setIsOpen(false);
  };

  const handleReopenShift = (date: string) => {
    if (shiftConfigured) {
      setReopenDate(date);
    } else {
      confirmReopen(date);
    }
  };

  const confirmReopen = (date: string) => {
    reopenShift(date);
    setReopenDate(null);
    setIsOpen(false);
    toast.success(`Shift from ${format(new Date(date), 'MM/dd/yyyy')} reopened for editing`);
  };

  const isControlled = controlledOpen !== undefined;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {!isControlled && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Shift History
            </DialogTitle>
          </DialogHeader>
          
          {dates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No saved shifts.</p>
              <p className="text-sm mt-1">Shifts are saved when closing the day.</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {dates.map((date) => {
                  const shift = loadShift(date);
                  if (!shift) return null;
                  
                  return (
                    <div 
                      key={date} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {format(new Date(date), 'EEEE, dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {shift.summary.totalPatients}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {shift.summary.admissions}
                          </span>
                          <span className="flex items-center gap-1">
                            <LogOut className="h-3 w-3" />
                            {shift.summary.discharges}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleReopenShift(date)}
                          title="Reopen for editing"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleViewShift(date)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={reopenDate !== null} onOpenChange={(open) => !open && setReopenDate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen shift?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active shift. Reopening this shift will replace current data with the selected shift's data.
              <br /><br />
              The current shift <strong>will not be saved</strong> automatically. If you want to keep it, close the shift first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => reopenDate && confirmReopen(reopenDate)}>
              Reopen Shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
