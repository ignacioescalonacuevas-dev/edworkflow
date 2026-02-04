import { useState } from 'react';
import { usePatientStore, getFilteredPatients } from '@/store/patientStore';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { PatientSticker } from './PatientSticker';
import { BoardHeader } from './BoardHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const COLS = 4;
const ROWS = 8;
const PATIENTS_PER_PAGE = COLS * ROWS; // 32

export function PatientBoard() {
  const [currentPage, setCurrentPage] = useState(0);
  const store = usePatientStore();
  const { viewingDate, loadShift } = useShiftHistoryStore();
  
  // Si estamos viendo historial, usar esos pacientes
  const historyShift = viewingDate ? loadShift(viewingDate) : null;
  
  // Determinar qué pacientes mostrar
  const patients = historyShift 
    ? historyShift.patients 
    : getFilteredPatients(store);

  // Sort by arrival time (most recent first)
  const sortedPatients = [...patients].sort(
    (a, b) => new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sortedPatients.length / PATIENTS_PER_PAGE));
  const pagePatients = sortedPatients.slice(
    currentPage * PATIENTS_PER_PAGE,
    (currentPage + 1) * PATIENTS_PER_PAGE
  );

  // Reset to first page if current page is out of bounds
  if (currentPage >= totalPages && currentPage > 0) {
    setCurrentPage(0);
  }

  return (
    <div className="h-full flex flex-col">
      <BoardHeader />
      
      <div className="flex-1 overflow-auto p-3">
        {/* Grid 4×8 con flujo por columnas */}
        <div 
          className="grid grid-cols-4 gap-2"
          style={{ 
            gridTemplateRows: 'repeat(8, minmax(100px, auto))',
            gridAutoFlow: 'column' 
          }}
        >
          {Array.from({ length: PATIENTS_PER_PAGE }).map((_, index) => {
            const patient = pagePatients[index];
            return patient ? (
              <PatientSticker key={patient.id} patient={patient} />
            ) : (
              <div 
                key={`empty-${index}`} 
                className="border border-dashed border-border/30 rounded-lg bg-muted/5" 
              />
            );
          })}
        </div>
        
        {/* Paginación - solo si hay más de 1 página */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => p - 1)} 
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => p + 1)} 
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
