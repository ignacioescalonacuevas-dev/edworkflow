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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {sortedPatients.map((patient) => (
              <PatientSticker
                key={patient.id}
                patient={patient}
              />
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
