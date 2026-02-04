import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PatientBoard } from '@/components/PatientBoard';
import { DaySetup } from '@/components/DaySetup';
import { PreviousShiftWarning } from '@/components/PreviousShiftWarning';
import { usePatientStore } from '@/store/patientStore';
import { useAppointmentReminders } from '@/hooks/useAppointmentReminders';

const Index = () => {
  const { shiftConfigured, shiftDate } = usePatientStore();
  const [showPreviousShiftWarning, setShowPreviousShiftWarning] = useState(false);
  
  // Initialize appointment reminders system
  useAppointmentReminders();
  
  // Check if there's an unclosed shift from a previous day
  useEffect(() => {
    if (shiftConfigured && shiftDate) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const shiftDay = format(new Date(shiftDate), 'yyyy-MM-dd');
      
      // If the shift is from a previous day, show warning
      if (shiftDay < today) {
        setShowPreviousShiftWarning(true);
      }
    }
  }, [shiftConfigured, shiftDate]);

  // Show setup screen if shift not configured
  if (!shiftConfigured) {
    return <DaySetup onComplete={() => {}} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Previous Shift Warning Dialog */}
      <PreviousShiftWarning 
        open={showPreviousShiftWarning} 
        onOpenChange={setShowPreviousShiftWarning} 
      />
      
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
