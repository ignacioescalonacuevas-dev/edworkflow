import { useState } from 'react';
import { format } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { XCircle, Users, LogIn, LogOut, Ambulance, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EndShiftDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EndShiftDialog({ open: controlledOpen, onOpenChange }: EndShiftDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const { patients, shiftDate, endShift } = usePatientStore();
  
  const totalPatients = patients.length;
  const admissions = patients.filter(p => 
    p.processState === 'admission' || p.admission !== undefined
  ).length;
  const discharges = patients.filter(p => p.processState === 'discharged').length;
  const transfers = patients.filter(p => p.processState === 'transferred').length;
  const pendingPatients = patients.filter(p => 
    !['discharged', 'transferred'].includes(p.processState || '')
  ).length;
  
  const handleEndShift = () => {
    endShift();
    setIsOpen(false);
    toast.success('Shift closed and saved to history');
  };
  
  const formattedDate = shiftDate 
    ? format(new Date(shiftDate), 'EEEE, MMMM d')
    : 'No date';

  const isControlled = controlledOpen !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <XCircle className="h-4 w-4" />
            End Shift
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            End Shift
          </DialogTitle>
          <DialogDescription>
            {formattedDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <h4 className="text-sm font-medium text-muted-foreground">Shift Summary</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <div className="text-xs text-muted-foreground">Total patients</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <LogIn className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{admissions}</div>
                <div className="text-xs text-muted-foreground">Admissions</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <LogOut className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{discharges}</div>
                <div className="text-xs text-muted-foreground">Discharges</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Ambulance className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{transfers}</div>
                <div className="text-xs text-muted-foreground">Transfers</div>
              </div>
            </div>
          </div>
          
          {pendingPatients > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium">There are {pendingPatients} unclosed patients.</span>
                <p className="text-muted-foreground mt-1">
                  They will be saved to history and you can reopen the shift if needed.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEndShift}>
            Close and Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
