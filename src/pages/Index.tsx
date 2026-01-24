import { usePatientStore } from '@/store/patientStore';
import { PatientBoard } from '@/components/PatientBoard';
import { PatientDetail } from '@/components/PatientDetail';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { patients, selectedPatientId, selectPatient } = usePatientStore();
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Main Content - Patient Board */}
      <main className="flex-1 overflow-hidden">
        <PatientBoard />
      </main>

      {/* Side Panel - Patient Detail */}
      {selectedPatient && (
        <aside className="w-[480px] border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold">{selectedPatient.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => selectPatient(null)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <PatientDetail patient={selectedPatient} />
          </div>
        </aside>
      )}
    </div>
  );
};

export default Index;
