import { useMemo } from 'react';
import { Patient, PATIENT_STATUSES } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { StickerNotesColumn } from './StickerNotesColumn';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PatientStickerProps {
  patient: Patient;
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
}

function getElapsedTime(arrivalTime: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(arrivalTime).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

export function PatientSticker({ patient }: PatientStickerProps) {
  const { addStickerNote, toggleStudyCompleted, removeStickerNote } = usePatientStore();
  
  const elapsedTime = useMemo(() => getElapsedTime(patient.arrivalTime), [patient.arrivalTime]);
  const statusConfig = PATIENT_STATUSES.find(s => s.value === patient.status);
  
  const isAdmission = patient.status === 'admission';
  const isDischarged = patient.status === 'discharged' || patient.status === 'transferred';

  const handleAddNote = (note: Parameters<typeof addStickerNote>[1]) => {
    addStickerNote(patient.id, note);
  };

  const handleToggle = (noteId: string) => {
    toggleStudyCompleted(patient.id, noteId);
  };

  const handleRemove = (noteId: string) => {
    removeStickerNote(patient.id, noteId);
  };

  return (
    <div
      className={cn(
        "sticker transition-all hover:border-primary/50",
        isAdmission && "sticker-admission",
        isDischarged && "sticker-discharged"
      )}
    >
      {/* Main 3-column grid */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        {/* Left column - Patient info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-sm truncate">{patient.name}</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{elapsedTime}</span>
          </div>
          <span className="text-xs text-muted-foreground">{patient.dateOfBirth}</span>
          <span className="text-xs font-mono text-muted-foreground">{patient.mNumber}</span>
        </div>

        {/* Middle column - Notes */}
        <StickerNotesColumn
          notes={patient.stickerNotes}
          onAddNote={handleAddNote}
          onToggle={handleToggle}
          onRemove={handleRemove}
        />

        {/* Right column - Box, Doctor, Nurse */}
        <div className="flex flex-col items-end text-xs font-medium min-w-[32px]">
          <span className="text-foreground">{patient.box.replace('Box ', 'B')}</span>
          <span className="text-primary">{getInitials(patient.doctor)}</span>
          <span className="text-muted-foreground">{getInitials(patient.nurse)}</span>
        </div>
      </div>

      {/* Bottom row - Chief Complaint + Status */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground truncate flex-1">
          {patient.chiefComplaint}
        </span>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] px-1.5 py-0 h-5 shrink-0", statusConfig?.color)}
        >
          {statusConfig?.label}
        </Badge>
      </div>

      {/* Bed number overlay for admissions */}
      {isAdmission && patient.admission?.bedNumber && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
          {patient.admission.bedNumber}
        </div>
      )}
    </div>
  );
}
