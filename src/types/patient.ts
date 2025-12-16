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

export interface Order {
  id: string;
  type: 'lab' | 'xray' | 'scanner' | 'medication';
  description: string;
  status: OrderStatus;
  orderedAt: Date;
  doneAt?: Date;
  reportedAt?: Date;
}

export interface AdmissionData {
  specialty: string;
  consultantName: string;
  registrarCalled: boolean;
  adminComplete: boolean;
  idBraceletVerified: boolean;
  mrsaSwabs: boolean;
  fallsAssessment: boolean;
  handoverNotes: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface Patient {
  id: string;
  name: string;
  box: string;
  doctor: string;
  arrivalTime: Date;
  status: PatientStatus;
  orders: Order[];
  admission?: AdmissionData;
  dischargedAt?: Date;
  events: PatientEvent[];
}

export interface PatientEvent {
  id: string;
  timestamp: Date;
  type: 'arrival' | 'order' | 'order_done' | 'order_reported' | 'admission_started' | 'admission_completed' | 'discharged' | 'note' | 'location_change' | 'doctor_assigned' | 'status_change';
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

