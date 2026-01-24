import { usePatientStore, getFilteredPatients } from '@/store/patientStore';
import { PatientSticker } from './PatientSticker';
import { BoardHeader } from './BoardHeader';
import { Activity } from 'lucide-react';

export function PatientBoard() {
  const store = usePatientStore();
  const filteredPatients = getFilteredPatients(store);

  // Sort by arrival time (most recent first)
  const sortedPatients = [...filteredPatients].sort(
    (a, b) => new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime()
  );

  return (
    <div className="h-full flex flex-col">
      <BoardHeader />
      
      <div className="flex-1 overflow-auto p-4">
        {sortedPatients.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3 [column-fill:auto]">
            {sortedPatients.map((patient) => (
              <div key={patient.id} className="break-inside-avoid mb-3">
                <PatientSticker patient={patient} />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="h-16 w-16 mb-4 opacity-50" />
            <h2 className="text-xl font-medium">No Patients Found</h2>
            <p className="text-sm mt-2">
              Add a new patient or adjust your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
