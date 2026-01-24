import { usePatientStore } from '@/store/patientStore';
import { cn } from '@/lib/utils';

export function StaffCounters() {
  const { 
    patients, 
    doctors, 
    nurses, 
    filterByDoctor, 
    filterByNurse, 
    setFilterByDoctor, 
    setFilterByNurse,
    hideDischargedFromBoard 
  } = usePatientStore();

  // Count active patients (exclude discharged/transferred if hidden)
  const activePatients = hideDischargedFromBoard
    ? patients.filter(p => p.status !== 'discharged' && p.status !== 'transferred')
    : patients;

  const doctorCounts = doctors.map(doctor => ({
    name: doctor,
    count: activePatients.filter(p => p.doctor === doctor).length,
  })).filter(d => d.count > 0);

  const nurseCounts = nurses.map(nurse => ({
    name: nurse,
    count: activePatients.filter(p => p.nurse === nurse).length,
  })).filter(n => n.count > 0);

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {/* Doctors */}
      {doctorCounts.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs mr-1">MD:</span>
          {doctorCounts.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setFilterByDoctor(filterByDoctor === name ? null : name)}
              className={cn(
                "staff-counter text-xs",
                filterByDoctor === name && "staff-counter-active"
              )}
            >
              {name.replace('Dr. ', '')}
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Separator */}
      {doctorCounts.length > 0 && nurseCounts.length > 0 && (
        <div className="h-4 w-px bg-border" />
      )}

      {/* Nurses */}
      {nurseCounts.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs mr-1">RN:</span>
          {nurseCounts.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setFilterByNurse(filterByNurse === name ? null : name)}
              className={cn(
                "staff-counter text-xs",
                filterByNurse === name && "staff-counter-active"
              )}
            >
              {name.replace('N. ', '')}
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
