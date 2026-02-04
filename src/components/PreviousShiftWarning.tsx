import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePatientStore } from '@/store/patientStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Calendar, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface PreviousShiftWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviousShiftWarning({ open, onOpenChange }: PreviousShiftWarningProps) {
  const { shiftDate, endShift } = usePatientStore();
  
  const formattedShiftDate = shiftDate 
    ? format(new Date(shiftDate), "EEEE, dd 'de' MMMM", { locale: es })
    : 'fecha desconocida';
  
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: es });
  
  const handleCloseAndStartNew = () => {
    endShift();
    onOpenChange(false);
    toast.success('Turno anterior cerrado. Configura el nuevo turno.');
  };
  
  const handleContinue = () => {
    onOpenChange(false);
    toast.info('Continuando con el turno anterior');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            Turno Anterior Sin Cerrar
          </DialogTitle>
          <DialogDescription>
            Se detectó un turno de un día anterior que no fue cerrado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Turno abierto</div>
              <div className="text-sm text-muted-foreground capitalize">{formattedShiftDate}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Hoy</div>
              <div className="text-sm text-muted-foreground capitalize">{today}</div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Puedes cerrar el turno anterior y empezar uno nuevo, o continuar trabajando en el turno existente.
          </p>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleContinue}
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Continuar Turno
          </Button>
          <Button 
            onClick={handleCloseAndStartNew}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Cerrar y Empezar Nuevo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
