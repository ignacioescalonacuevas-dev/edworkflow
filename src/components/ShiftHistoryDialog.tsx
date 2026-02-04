import { History, Calendar, Users, UserCheck, LogOut, RotateCcw, Copy } from 'lucide-react';
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

export function ShiftHistoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [reopenDate, setReopenDate] = useState<string | null>(null);
  const { getAvailableDates, loadShift, setViewingDate } = useShiftHistoryStore();
  const { reopenShift, shiftConfigured } = usePatientStore();
  const dates = getAvailableDates();

  const handleViewShift = (date: string) => {
    setViewingDate(date);
    setIsOpen(false);
  };

  const handleReopenShift = (date: string) => {
    // If there's an active shift, warn first
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
    toast.success(`Turno del ${format(new Date(date), 'dd/MM/yyyy')} reabierto para edición`);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Historial
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historial de Turnos
            </DialogTitle>
          </DialogHeader>
          
          {dates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay turnos guardados.</p>
              <p className="text-sm mt-1">Los turnos se guardan al cerrar el día.</p>
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
                          title="Reabrir para edición"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleViewShift(date)}
                        >
                          Ver
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
            <AlertDialogTitle>¿Reabrir turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes un turno activo. Reabrir este turno reemplazará los datos actuales con los del turno seleccionado.
              <br /><br />
              El turno actual <strong>no se guardará</strong> automáticamente. Si quieres conservarlo, cierra el turno primero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => reopenDate && confirmReopen(reopenDate)}>
              Reabrir Turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
