import { useMemo, useState } from 'react';
import { Patient, PatientStatus, PATIENT_STATUSES } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { StickerNotesColumn } from './StickerNotesColumn';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditableBedNumberProps {
  patientId: string;
  bedNumber: string;
}

function EditableBedNumber({ patientId, bedNumber }: EditableBedNumberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(bedNumber);
  const { updateAdmission } = usePatientStore();

  const handleSave = () => {
    updateAdmission(patientId, { bedNumber: value });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(bedNumber);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="absolute top-1 right-1 w-12 h-4 text-[9px] px-1 py-0 bg-blue-500 text-white border-blue-400 font-medium"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="absolute top-1 right-1 bg-blue-500 text-white text-[11px] px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-blue-600"
    >
      {bedNumber || '+Cama'}
    </div>
  );
}

interface EditableChiefComplaintProps {
  patientId: string;
  complaint: string;
}

function EditableChiefComplaint({ patientId, complaint }: EditableChiefComplaintProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(complaint);
  const { updatePatientChiefComplaint } = usePatientStore();

  const handleSave = () => {
    if (value.trim()) {
      updatePatientChiefComplaint(patientId, value.trim());
    } else {
      setValue(complaint);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(complaint);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-5 text-xs px-1.5 py-0 flex-1"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="text-xs text-muted-foreground flex-1 cursor-pointer hover:text-foreground transition-colors truncate"
    >
      {complaint}
    </span>
  );
}

interface StaffDropdownProps {
  type: 'doctor' | 'nurse' | 'location';
  patientId: string;
  currentValue: string;
  options: string[];
  displayValue: string;
}

function StaffDropdown({ type, patientId, currentValue, options, displayValue }: StaffDropdownProps) {
  const { updatePatientDoctor, updatePatientNurse, updatePatientLocation } = usePatientStore();

  const handleSelect = (value: string) => {
    if (type === 'doctor') {
      updatePatientDoctor(patientId, value);
    } else if (type === 'nurse') {
      updatePatientNurse(patientId, value);
    } else {
      updatePatientLocation(patientId, value);
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'doctor': return 'Médico';
      case 'nurse': return 'Enfermera';
      case 'location': return 'Ubicación';
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'doctor': return 'text-primary';
      case 'nurse': return 'text-muted-foreground';
      case 'location': return 'text-foreground font-semibold';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className={cn("text-xs cursor-pointer hover:opacity-70 transition-opacity min-h-[20px]", getColorClass())}>
          {displayValue}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-50 bg-background border shadow-lg max-h-48 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2 py-1 text-xs text-muted-foreground font-medium">{getLabel()}</div>
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              "text-xs cursor-pointer",
              currentValue === option && "bg-accent"
            )}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface StickerActionsMenuProps {
  patientId: string;
  patientName: string;
}

function StickerActionsMenu({ patientId, patientName }: StickerActionsMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { removePatient } = usePatientStore();

  const handleDelete = () => {
    removePatient(patientId);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded transition-opacity shrink-0">
            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="z-50 bg-background border shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Eliminar paciente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <strong>{patientName}</strong> del sistema. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface StatusDropdownProps {
  patientId: string;
  currentStatus: PatientStatus;
  statusConfig?: { label: string; color: string };
}

function StatusDropdown({ patientId, currentStatus, statusConfig }: StatusDropdownProps) {
  const { updatePatientStatus } = usePatientStore();

  const handleStatusChange = (newStatus: PatientStatus) => {
    updatePatientStatus(patientId, newStatus);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          className={cn(
            "text-[11px] px-1.5 py-0.5 shrink-0 rounded border cursor-pointer hover:opacity-80 transition-opacity",
            statusConfig?.color
          )}
        >
          {statusConfig?.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-50 bg-background border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {PATIENT_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            className={cn(
              "text-xs cursor-pointer",
              currentStatus === status.value && "bg-accent"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full mr-2", status.color.split(' ')[0])} />
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
  const { addStickerNote, toggleStudyCompleted, removeStickerNote, moveNoteToSlot, doctors, nurses, locations } = usePatientStore();
  const { viewingDate } = useShiftHistoryStore();
  
  const isReadOnly = viewingDate !== null;
  
  const elapsedTime = useMemo(() => getElapsedTime(patient.arrivalTime), [patient.arrivalTime]);
  const statusConfig = PATIENT_STATUSES.find(s => s.value === patient.status);
  
  const isAdmission = patient.status === 'admission';
  const isDischarged = patient.status === 'discharged' || patient.status === 'transferred';

  const handleAddNote = (note: Parameters<typeof addStickerNote>[1]) => {
    if (isReadOnly) return;
    addStickerNote(patient.id, note);
  };

  const handleToggle = (noteId: string) => {
    if (isReadOnly) return;
    toggleStudyCompleted(patient.id, noteId);
  };

  const handleRemove = (noteId: string) => {
    if (isReadOnly) return;
    removeStickerNote(patient.id, noteId);
  };

  const handleMoveToSlot = (noteId: string, slotIndex: number) => {
    if (isReadOnly) return;
    moveNoteToSlot(patient.id, noteId, slotIndex);
  };

  return (
    <div
      className={cn(
        "sticker transition-all hover:border-primary/50 group h-full flex flex-col p-2.5",
        isAdmission && "sticker-admission",
        isDischarged && "sticker-discharged"
      )}
    >
      {/* Main 3-column grid - compact notes column */}
      <div className="grid grid-cols-[1fr_72px_44px] gap-1.5 flex-1 min-h-0">
        {/* COL 1: Patient Info (vertical stack) - full name visible */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1">
            {!isReadOnly && <StickerActionsMenu patientId={patient.id} patientName={patient.name} />}
            <span className="font-semibold text-sm leading-tight">{patient.name}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{patient.dateOfBirth}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-muted-foreground font-mono">{patient.mNumber}</span>
            <span className="text-[10px] text-muted-foreground/70 ml-auto">{elapsedTime}</span>
          </div>
        </div>

        {/* COL 2: Notes Grid 3×2 = 6 slots - fixed 72px width */}
        <div className="flex items-center justify-center">
          <StickerNotesColumn
            notes={patient.stickerNotes}
            onAddNote={handleAddNote}
            onToggle={handleToggle}
            onRemove={handleRemove}
            onMoveToSlot={handleMoveToSlot}
            readOnly={isReadOnly}
          />
        </div>

        {/* COL 3: Box + Doctor + Nurse (vertical centered) */}
        <div className="flex flex-col items-center justify-between py-1">
          {isReadOnly ? (
            <>
              <span className="text-xs font-semibold">{patient.box.replace('Box ', 'B')}</span>
              <span className="text-xs text-primary">{getInitials(patient.doctor)}</span>
              <span className="text-xs text-muted-foreground">{getInitials(patient.nurse)}</span>
            </>
          ) : (
            <>
              <StaffDropdown
                type="location"
                patientId={patient.id}
                currentValue={patient.box}
                options={locations}
                displayValue={patient.box.replace('Box ', 'B')}
              />
              <StaffDropdown
                type="doctor"
                patientId={patient.id}
                currentValue={patient.doctor}
                options={doctors}
                displayValue={getInitials(patient.doctor)}
              />
              <StaffDropdown
                type="nurse"
                patientId={patient.id}
                currentValue={patient.nurse}
                options={nurses}
                displayValue={getInitials(patient.nurse)}
              />
            </>
          )}
        </div>
      </div>

      {/* Footer: Chief Complaint + Status */}
      <div className="flex items-center justify-between gap-2 pt-1.5 mt-1.5 border-t border-border/50">
        {isReadOnly ? (
          <span className="text-xs text-muted-foreground flex-1 truncate">{patient.chiefComplaint}</span>
        ) : (
          <EditableChiefComplaint 
            patientId={patient.id}
            complaint={patient.chiefComplaint}
          />
        )}
        {isReadOnly ? (
          <span
            className={cn(
              "text-[11px] px-1.5 py-0.5 shrink-0 rounded border",
              statusConfig?.color
            )}
          >
            {statusConfig?.label}
          </span>
        ) : (
          <StatusDropdown 
            patientId={patient.id}
            currentStatus={patient.status}
            statusConfig={statusConfig}
          />
        )}
      </div>

      {/* Bed number for admissions - editable */}
      {isAdmission && (
        isReadOnly ? (
          patient.admission?.bedNumber && (
            <div className="absolute top-1 right-1 bg-blue-500 text-white text-[11px] px-1.5 py-0.5 rounded font-medium">
              {patient.admission.bedNumber}
            </div>
          )
        ) : (
          <EditableBedNumber 
            patientId={patient.id}
            bedNumber={patient.admission?.bedNumber || ''}
          />
        )
      )}
    </div>
  );
}
