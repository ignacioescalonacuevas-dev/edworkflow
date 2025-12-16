import { usePatientStore } from '@/store/patientStore';
import { PatientSidebar } from '@/components/PatientSidebar';
import { PatientDetail } from '@/components/PatientDetail';
import { Activity } from 'lucide-react';

const Index = () => {
  const { patients, selectedPatientId } = usePatientStore();
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Patient List */}
      <div className="w-80 lg:w-96 flex-shrink-0">
        <PatientSidebar />
      </div>

      {/* Main Content - Patient Detail */}
      <main className="flex-1 overflow-hidden">
        {selectedPatient ? (
          <PatientDetail patient={selectedPatient} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="h-16 w-16 mb-4 opacity-50" />
            <h2 className="text-xl font-medium">Seleccione un paciente</h2>
            <p className="text-sm mt-2">
              Elija un paciente de la lista para ver sus detalles
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
