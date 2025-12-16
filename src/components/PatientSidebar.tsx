import { usePatientStore } from '@/store/patientStore';
import { PatientCard } from './PatientCard';
import { NewPatientForm } from './NewPatientForm';
import { ShiftSetup } from './ShiftSetup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, History, Users, Filter } from 'lucide-react';

export function PatientSidebar() {
  const {
    patients,
    selectedPatientId,
    filterDoctor,
    viewMode,
    doctors,
    selectPatient,
    setFilterDoctor,
    setViewMode,
  } = usePatientStore();

  const filteredPatients = patients.filter((patient) => {
    // Filter by view mode
    if (viewMode === 'active' && patient.status === 'discharged') return false;
    if (viewMode === 'history' && patient.status !== 'discharged') return false;

    // Filter by doctor
    if (filterDoctor && patient.doctor !== filterDoctor) return false;

    return true;
  });

  const activeCount = patients.filter((p) => p.status !== 'discharged').length;
  const historyCount = patients.filter((p) => p.status === 'discharged').length;

  return (
    <div className="h-full flex flex-col gradient-sidebar border-r border-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">ED Workflow</h1>
          </div>
          <ShiftSetup />
        </div>
        <NewPatientForm />
      </div>

      {/* Filters */}
      <div className="px-3 py-2 space-y-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>Filter by physician</span>
        </div>
        <Select
          value={filterDoctor || 'all'}
          onValueChange={(value) => setFilterDoctor(value === 'all' ? null : value)}
        >
          <SelectTrigger className="h-8 text-sm bg-input border-border">
            <SelectValue placeholder="All physicians" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All physicians</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor} value={doctor}>
                {doctor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="px-3 py-2 border-b border-border">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'active' | 'history')}>
          <TabsList className="w-full h-8 bg-secondary">
            <TabsTrigger value="active" className="flex-1 gap-1.5 text-sm h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3.5 w-3.5" />
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5 text-sm h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="h-3.5 w-3.5" />
              History ({historyCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Patient List */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-2 space-y-1.5">
          {filteredPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No {viewMode === 'active' ? 'active' : 'discharged'} patients
            </p>
          ) : (
            filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                isSelected={selectedPatientId === patient.id}
                onClick={() => selectPatient(patient.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
