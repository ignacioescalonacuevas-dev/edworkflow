import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { XCircle, Users, LogIn, LogOut, Ambulance, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function EndShiftDialog() {
  const [open, setOpen] = useState(false);
  const { patients, shiftDate, endShift } = usePatientStore();
  
  // Calculate summary stats
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
    setOpen(false);
    toast.success('Turno cerrado y guardado en historial');
  };
  
  const formattedDate = shiftDate 
    ? format(new Date(shiftDate), "EEEE, dd 'de' MMMM", { locale: es })
    : 'Sin fecha';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <XCircle className="h-4 w-4" />
          Cerrar Turno
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cerrar Turno
          </DialogTitle>
          <DialogDescription>
            {formattedDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <h4 className="text-sm font-medium text-muted-foreground">Resumen del Turno</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <div className="text-xs text-muted-foreground">Total pacientes</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <LogIn className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{admissions}</div>
                <div className="text-xs text-muted-foreground">Admisiones</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <LogOut className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{discharges}</div>
                <div className="text-xs text-muted-foreground">Altas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Ambulance className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{transfers}</div>
                <div className="text-xs text-muted-foreground">Traslados</div>
              </div>
            </div>
          </div>
          
          {pendingPatients > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium">Hay {pendingPatients} pacientes sin cerrar.</span>
                <p className="text-muted-foreground mt-1">
                  Se guardarán en el historial y podrás reabrir el turno si es necesario.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEndShift}>
            Cerrar y Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
