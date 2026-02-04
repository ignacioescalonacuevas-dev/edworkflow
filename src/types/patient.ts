export type OrderStatus = 'ordered' | 'done' | 'reported';

export type PatientStatus = 
  | 'treatment_room'
  | 'waiting_room'
  | 'review'
  | 'ct'
  | 'mri'
  | 'echo'
  | 'vascular'
  | 'admission'
  | 'discharged'
  | 'transferred';

export interface PatientStatusConfig {
  value: PatientStatus;
  label: string;
  color: string;
}

export const PATIENT_STATUSES: PatientStatusConfig[] = [
  { value: 'treatment_room', label: 'Treatment Room', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'waiting_room', label: 'Waiting Room', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'review', label: 'Review', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'ct', label: 'CT', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'mri', label: 'MRI', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { value: 'echo', label: 'Echo', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { value: 'vascular', label: 'Vascular', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
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

// ============= NEW: Triage Manchester Categories =============
export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export const TRIAGE_CONFIG: Record<TriageLevel, { label: string; color: string; bgColor: string; time: string }> = {
  1: { label: 'Immediate', color: 'text-white', bgColor: 'bg-red-500', time: '0 min' },
  2: { label: 'Very Urgent', color: 'text-white', bgColor: 'bg-orange-500', time: '10 min' },
  3: { label: 'Urgent', color: 'text-black', bgColor: 'bg-yellow-400', time: '60 min' },
  4: { label: 'Standard', color: 'text-white', bgColor: 'bg-green-500', time: '120 min' },
  5: { label: 'Non-Urgent', color: 'text-white', bgColor: 'bg-blue-500', time: '240 min' },
};

// ============= NEW: Physical Locations =============
export const ED_LOCATIONS = [
  'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5', 'Box 6',
  'Waiting Room', 'Treatment Room', 'Procedure Room', 'Resus'
] as const;

export const IMAGING_LOCATIONS = [
  'CT Room', 'MRI Room', 'X-Ray Room', 'US Room', 'Echo Room', 'RACC'
] as const;

export const ALL_LOCATIONS = [...ED_LOCATIONS, ...IMAGING_LOCATIONS] as const;

export const LOCATION_ABBREVIATIONS: Record<string, string> = {
  'Box 1': 'B1', 'Box 2': 'B2', 'Box 3': 'B3', 
  'Box 4': 'B4', 'Box 5': 'B5', 'Box 6': 'B6',
  'Waiting Room': 'WR', 'Treatment Room': 'TR',
  'Procedure Room': 'PR', 'Resus': 'RS',
  'CT Room': 'CT', 'MRI Room': 'MRI', 'X-Ray Room': 'XR',
  'US Room': 'US', 'Echo Room': 'EC', 'RACC': 'RA',
  // Legacy support
  'Waiting Area': 'WA', 'Treatment': 'TR',
};

export function getLocationAbbreviation(location: string): string {
  return LOCATION_ABBREVIATIONS[location] || location.substring(0, 2).toUpperCase();
}

// ============= NEW: Process States (Clinical Workflow) =============
export type ProcessState = 
  | 'registered'
  | 'triaged'
  | 'being_seen'
  | 'awaiting_results'
  | 'results_review'
  | 'disposition'
  | 'admission_pending'
  | 'bed_assigned'
  | 'ready_transfer'
  | 'discharged'
  | 'transferred'
  | 'admitted';

export interface ProcessStateConfig {
  value: ProcessState;
  label: string;
  color: string;
}

export const PROCESS_STATES: ProcessStateConfig[] = [
  { value: 'registered', label: 'Registered', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'triaged', label: 'Triaged', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'being_seen', label: 'Being Seen', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'awaiting_results', label: 'Awaiting Results', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'results_review', label: 'Results Review', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'disposition', label: 'Disposition', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { value: 'admission_pending', label: 'Admission Pending', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'bed_assigned', label: 'Bed Assigned', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'ready_transfer', label: 'Ready Transfer', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'discharged', label: 'Discharged', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'transferred', label: 'Transferred', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'admitted', label: 'Admitted', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
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
  consultant: string;           // NEW: Nombre del consultant que acepta
  bedNumber: string;
  bedStatus: BedStatus;
  handoverComplete: boolean;    // NEW: Handover nurse-to-nurse completado
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
  slotIndex?: number;   // Position in the grid (0-8 for 3x3)
}

// ============= Appointments =============
export type AppointmentType = 
  | 'mri' | 'ct' | 'ultrasound' | 'echo' | 'xray' 
  | 'racc' | 'procedure' | 'consult' | 'other';

export interface Appointment {
  id: string;
  type: AppointmentType;
  scheduledTime: Date;          // Hora programada (ej: 18:00)
  reminderMinutes: number;      // Cuanto antes avisar (30, 15, 10)
  reminderTriggered: boolean;   // Ya se mostro el recordatorio?
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;               // Notas adicionales
  createdAt: Date;
}

export const APPOINTMENT_TYPES: Record<AppointmentType, { label: string; color: string; abbrev: string }> = {
  mri: { label: 'MRI', color: 'bg-pink-500', abbrev: 'MRI' },
  ct: { label: 'CT', color: 'bg-orange-500', abbrev: 'CT' },
  ultrasound: { label: 'Ultrasound', color: 'bg-cyan-500', abbrev: 'US' },
  echo: { label: 'Echo', color: 'bg-indigo-500', abbrev: 'EC' },
  xray: { label: 'X-Ray', color: 'bg-amber-500', abbrev: 'XR' },
  racc: { label: 'RACC', color: 'bg-green-500', abbrev: 'RA' },
  procedure: { label: 'Procedure', color: 'bg-purple-500', abbrev: 'PR' },
  consult: { label: 'Consult', color: 'bg-blue-500', abbrev: 'CO' },
  other: { label: 'Other', color: 'bg-gray-500', abbrev: 'OT' },
};

export const REMINDER_OPTIONS = [
  { value: 60, label: '60 min antes' },
  { value: 30, label: '30 min antes' },
  { value: 15, label: '15 min antes' },
  { value: 10, label: '10 min antes' },
  { value: 5, label: '5 min antes' },
] as const;

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
  
  // NEW: Triage, Location, and Process State
  triageLevel: TriageLevel;
  assignedBox: string;           // Box donde "vive" (Box 1-6, Treatment Room, etc.)
  currentLocation: string;       // Ubicación física actual (puede ser CT Room, MRI, etc.)
  processState: ProcessState;    // Estado del flujo clínico
  
  // Staff (always visible)
  doctor: string;
  nurse: string;            // Assigned nurse
  arrivalTime: Date;
  
  // Deprecated (keep for migration compatibility)
  box: string;
  status: PatientStatus;
  
  orders: Order[];
  stickerNotes: StickerNote[];  // Notes for the sticker column
  appointments: Appointment[];  // Scheduled appointments (MRI, RACC, etc.)
  admission?: AdmissionData;
  dischargedAt?: Date;
  transferredTo?: string;
  events: PatientEvent[];
}

export interface PatientEvent {
  id: string;
  timestamp: Date;
  type: 'arrival' | 'order' | 'order_done' | 'order_reported' | 'admission_started' | 'admission_completed' | 'discharged' | 'note' | 'location_change' | 'doctor_assigned' | 'status_change' | 'nurse_assigned' | 'process_state_change' | 'triage_change';
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

// Mapa de abreviaciones para cada texto de nota
export const NOTE_ABBREVIATIONS: Record<string, string> = {
  // Studies
  'CT': 'CT',
  'ECHO': 'ECHO',
  'ECG': 'ECG',
  'US': 'US',
  'X-Ray': 'XR',
  'Vascular': 'VA',
  // Follow-ups
  'GP': 'GP',
  "Women's Clinic": 'WC',
  'RACC': 'RA',
  'Fracture Clinic': 'FC',
  'Surgical Clinic': 'SC',
  // Precautions
  'Flu A +': 'FA',
  'Flu B +': 'FB',
  'COVID +': 'CV',
  'MRSA': 'MR',
  'Isolation': 'IS',
};

// Función para obtener abreviación
export function getAbbreviation(text: string): string {
  return NOTE_ABBREVIATIONS[text] || text.substring(0, 2).toUpperCase();
}

// ============= Migration Helpers =============
export function mapStatusToProcessState(status: PatientStatus): ProcessState {
  const map: Partial<Record<PatientStatus, ProcessState>> = {
    'waiting_room': 'triaged',
    'treatment_room': 'being_seen',
    'review': 'results_review',
    'ct': 'awaiting_results',
    'mri': 'awaiting_results',
    'echo': 'awaiting_results',
    'vascular': 'awaiting_results',
    'admission': 'admission_pending',
    'discharged': 'discharged',
    'transferred': 'transferred',
  };
  return map[status] ?? 'registered';
}

// Shift History Types
export interface ShiftSnapshot {
  date: string;                    // "2026-01-24" (key)
  patients: Patient[];
  doctors: string[];
  nurses: string[];
  locations: string[];
  summary: {
    totalPatients: number;
    admissions: number;
    discharges: number;
    transfers: number;
  };
  savedAt: string;                 // ISO timestamp
}
