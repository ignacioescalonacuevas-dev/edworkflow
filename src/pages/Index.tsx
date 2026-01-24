import { PatientBoard } from '@/components/PatientBoard';
import { DaySetup } from '@/components/DaySetup';
import { usePatientStore } from '@/store/patientStore';

const Index = () => {
  const { shiftConfigured } = usePatientStore();

  // Show setup screen if shift not configured
  if (!shiftConfigured) {
    return <DaySetup onComplete={() => {}} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Main Content - Patient Board */}
      <main className="flex-1 overflow-hidden">
        <PatientBoard />
      </main>

      {/* 
        Side Panel - Patient Detail
        DISABLED: Reserved for future multi-tablet integration
        
        import { usePatientStore } from '@/store/patientStore';
        import { PatientDetail } from '@/components/PatientDetail';
        
        const { patients, selectedPatientId, selectPatient } = usePatientStore();
        const selectedPatient = patients.find((p) => p.id === selectedPatientId);
        
        {selectedPatient && (
          <aside className="w-[480px] border-l border-border bg-card flex flex-col overflow-hidden">
            <PatientDetail patient={selectedPatient} />
          </aside>
        )}
      */}
    </div>
  );
};

export default Index;
