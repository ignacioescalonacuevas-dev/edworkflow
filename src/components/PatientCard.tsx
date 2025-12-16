import { Patient, PATIENT_STATUSES } from '@/types/patient';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, User, MapPin, Bed, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

export function PatientCard({ patient, isSelected, onClick }: PatientCardProps) {
  const [hasUrgentOrder, setHasUrgentOrder] = useState(false);

  useEffect(() => {
    // Check if any order has been "done" for more than 1 hour without being "reported"
    const checkUrgent = () => {
      const now = new Date();
      const urgent = patient.orders.some((order) => {
        if (order.status === 'done' && order.doneAt) {
          const doneTime = new Date(order.doneAt);
          const elapsed = now.getTime() - doneTime.getTime();
          return elapsed > 60 * 60 * 1000; // 1 hour
        }
        return false;
      });
      setHasUrgentOrder(urgent);
    };

    checkUrgent();
    const interval = setInterval(checkUrgent, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [patient.orders]);

  const getTimeSinceArrival = () => {
    const now = new Date();
    const arrivalTime = new Date(patient.arrivalTime);
    const diff = now.getTime() - arrivalTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const pendingOrdersCount = patient.orders.filter((o) => o.status !== 'reported').length;
  
  // Determine badge and location for history view
  const isAdmitted = patient.status === 'discharged' && patient.admission?.completedAt;
  const isTransferred = patient.status === 'transferred';
  
  // Get badge config based on outcome
  const getBadgeConfig = () => {
    if (isAdmitted) {
      return { label: 'Admitted', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    if (isTransferred) {
      return { label: 'Transferred', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    }
    return PATIENT_STATUSES.find(s => s.value === patient.status);
  };
  
  const badgeConfig = getBadgeConfig();
  
  // Determine location to display
  const getDisplayLocation = () => {
    if (isAdmitted && patient.admission?.bedNumber) {
      return { icon: Bed, location: patient.admission.bedNumber };
    }
    if (isTransferred && patient.transferredTo) {
      return { icon: Building2, location: patient.transferredTo };
    }
    return { icon: MapPin, location: patient.box };
  };
  
  const { icon: LocationIcon, location: displayLocation } = getDisplayLocation();

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-lg transition-all duration-200 animate-slide-in',
        'gradient-card shadow-card border',
        isSelected
          ? 'border-primary shadow-glow-primary'
          : 'border-border hover:border-primary/50',
        patient.status === 'admission' && 'border-l-4 border-l-status-admission',
        hasUrgentOrder && 'animate-pulse-urgent shadow-glow-urgent border-status-urgent'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{patient.name}</h3>
            {badgeConfig && (
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full border",
                badgeConfig.color
              )}>
                {badgeConfig.label}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <LocationIcon className="h-3 w-3" />
              {displayLocation}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {patient.doctor}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-xs text-primary font-mono">
            <Clock className="h-3 w-3" />
            {getTimeSinceArrival()}
          </span>
          
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full status-pending">
              {pendingOrdersCount} pending
            </span>
          )}
          
          {hasUrgentOrder && (
            <span className="flex items-center gap-1 text-xs text-status-urgent">
              <AlertTriangle className="h-3 w-3" />
              Report pending
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
