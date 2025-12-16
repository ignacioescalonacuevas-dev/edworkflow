import { Patient, PATIENT_STATUSES, PatientStatus } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { TimerDisplay } from './TimerDisplay';
import { OrderPanel } from './OrderPanel';
import { AdmissionForm } from './AdmissionForm';
import { LogGenerator } from './LogGenerator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, MapPin, Stethoscope, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientDetailProps {
  patient: Patient;
}

export function PatientDetail({ patient }: PatientDetailProps) {
  const {
    updateArrivalTime,
    updatePatientLocation,
    updatePatientDoctor,
    updatePatientStatus,
    addOrder,
    updateOrderStatus,
    updateOrderTimestamp,
    startAdmission,
    updateAdmission,
    completeAdmission,
    dischargePatient,
    locations,
    doctors,
  } = usePatientStore();

  const isEditable = patient.status !== 'discharged' && patient.status !== 'transferred';
  const currentStatusConfig = PATIENT_STATUSES.find(s => s.value === patient.status);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
          <div className="flex items-center gap-3">
            {/* Location Selector */}
            {isEditable ? (
              <Select value={patient.box} onValueChange={(value) => updatePatientLocation(patient.id, value)}>
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {patient.box}
              </span>
            )}

            {/* Doctor Selector */}
            {isEditable ? (
              <Select 
                value={patient.doctor || '__unassigned__'} 
                onValueChange={(value) => updatePatientDoctor(patient.id, value === '__unassigned__' ? '' : value)}
              >
                <SelectTrigger className="w-[200px] bg-input border-border">
                  <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Not assigned" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="__unassigned__">Not assigned</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc} value={doc}>
                      {doc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Stethoscope className="h-4 w-4" />
                {patient.doctor || 'Not assigned'}
              </span>
            )}

            {/* Status Selector */}
            {isEditable ? (
              <Select 
                value={patient.status} 
                onValueChange={(value) => updatePatientStatus(patient.id, value as PatientStatus)}
              >
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {PATIENT_STATUSES.filter(s => s.value !== 'discharged' && s.value !== 'transferred').map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md border",
                currentStatusConfig?.color
              )}>
                <Activity className="h-4 w-4" />
                {currentStatusConfig?.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <LogGenerator patient={patient} />
          {patient.status !== 'discharged' && (
            <Button
              variant="outline"
              className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => dischargePatient(patient.id)}
            >
              <LogOut className="h-4 w-4" />
              Discharge
            </Button>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="rounded-xl gradient-card border border-border p-4">
        <TimerDisplay
          startTime={patient.arrivalTime}
          onEdit={patient.status !== 'discharged' ? (time) => updateArrivalTime(patient.id, time) : undefined}
        />
      </div>

      {/* Admission Form */}
      <AdmissionForm
        admission={patient.admission}
        onStartAdmission={() => startAdmission(patient.id)}
        onUpdateAdmission={(data) => updateAdmission(patient.id, data)}
        onCompleteAdmission={() => completeAdmission(patient.id)}
        patientStatus={patient.status}
      />

      {/* Orders */}
      <div className="rounded-xl gradient-card border border-border p-4">
        <OrderPanel
          orders={patient.orders}
          onAddOrder={(type, description) => addOrder(patient.id, { type, description, status: 'ordered' })}
          onUpdateStatus={(orderId, status) => updateOrderStatus(patient.id, orderId, status)}
          onUpdateTimestamp={(orderId, field, time) => updateOrderTimestamp(patient.id, orderId, field, time)}
        />
      </div>

      {/* Status Badge */}
      {(patient.status === 'discharged' || patient.status === 'transferred') && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
          <span className="text-lg font-medium text-muted-foreground">
            Patient {patient.status === 'discharged' ? 'Discharged' : 'Transferred'}
          </span>
        </div>
      )}
    </div>
  );
}
