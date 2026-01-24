export type OrderStatus = 'ordered' | 'done' | 'reported';

export type PatientStatus = 
  | 'registration'
  | 'triage'
  | 'evaluation'
  | 'awaiting_results'
  | 'admission'
  | 'discharged'
  | 'transferred';

export interface PatientStatusConfig {
  value: PatientStatus;
  label: string;
  color: string;
}

export const PATIENT_STATUSES: PatientStatusConfig[] = [
  { value: 'registration', label: 'Registration', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'triage', label: 'Triage', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'evaluation', label: 'Evaluation', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'admission', label: 'Admission', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'discharged', label: 'Discharged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'transferred', label: 'Transferred', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

export type BedStatus = 'not_assigned' | 'assigned_not_ready' | 'ready_to_transfer';

export interface BedStatusConfig {
  value: BedStatus;
  label: string;
  color: string;
}

export const BED_STATUSES: BedStatusConfig[] = [
  { value: 'not_assigned', label: 'Not Assigned Yet', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'assigned_not_ready', label: 'Assigned - Not Ready', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'ready_to_transfer', label: 'Ready to Transfer', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
];

export interface Order {
  id: string;
  type: 'lab' | 'xray' | 'scanner' | 'medication' | 'ecg' | 'echo';
  description: string;
  status: OrderStatus;
  orderedAt: Date;
  doneAt?: Date;
  reportedAt?: Date;
}

export interface AdmissionData {
  specialty: string;
  consultantName: string;
  bedNumber: string;
  bedStatus: BedStatus;
  registrarCalled: boolean;
  adminComplete: boolean;
  idBraceletVerified: boolean;
  mrsaSwabs: boolean;
  fallsAssessment: boolean;
  handoverNotes: string;
  startedAt: Date;
  completedAt?: Date;
}

// Sticker Notes Types
export type StickerNoteType = 
  | 'study'        // CT, ECHO, ECG, etc. with checkbox
  | 'followup'     // Women's Clinic, GP, RACC
  | 'critical'     // Critical values: Trop 85, K+ 6.2
  | 'precaution'   // Flu A +, COVID +, MRSA
  | 'admitting'    // Admitting physician
  | 'note';        // Free note

export interface StickerNote {
  id: string;
  type: StickerNoteType;
  text: string;
  completed?: boolean;  // Only for type 'study'
  createdAt: Date;
}

export const STUDY_OPTIONS = ['CT', 'ECHO', 'ECG', 'US', 'X-Ray', 'Vascular'] as const;

export const FOLLOWUP_OPTIONS = ['GP', "Women's Clinic", 'RACC', 'Fracture Clinic', 'Surgical Clinic'] as const;

export const PRECAUTION_OPTIONS = ['Flu A +', 'Flu B +', 'COVID +', 'MRSA', 'Isolation'] as const;

export const NOTE_TYPE_CONFIG: Record<StickerNoteType, { label: string; color: string }> = {
  study: { label: 'Study', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  followup: { label: 'Follow-up', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  critical: { label: 'Critical Value', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  precaution: { label: 'Precaution', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  admitting: { label: 'Admitting MD', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  note: { label: 'Note', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;      // DD/MM/YYYY
  mNumber: string;          // M00000000
  chiefComplaint: string;   // Chief complaint / reason for visit
  box: string;
  doctor: string;
  nurse: string;            // Assigned nurse
  arrivalTime: Date;
  status: PatientStatus;
  orders: Order[];
  stickerNotes: StickerNote[];  // Notes for the sticker column
  admission?: AdmissionData;
  dischargedAt?: Date;
  transferredTo?: string;
  events: PatientEvent[];
}

export interface PatientEvent {
  id: string;
  timestamp: Date;
  type: 'arrival' | 'order' | 'order_done' | 'order_reported' | 'admission_started' | 'admission_completed' | 'discharged' | 'note' | 'location_change' | 'doctor_assigned' | 'status_change' | 'nurse_assigned';
  description: string;
}

export const SPECIALTIES = [
  'Medical Registrar',
  'Surgical Registrar',
  'Cardiology Registrar',
  'Orthopedics Registrar',
  'Neurology Registrar',
  'Pediatrics Registrar',
] as const;
