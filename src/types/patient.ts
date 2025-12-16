export type OrderStatus = 'ordered' | 'done' | 'reported';

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
  status: 'active' | 'admission' | 'discharged';
  orders: Order[];
  admission?: AdmissionData;
  dischargedAt?: Date;
  events: PatientEvent[];
}

export interface PatientEvent {
  id: string;
  timestamp: Date;
  type: 'arrival' | 'order' | 'order_done' | 'order_reported' | 'admission_started' | 'admission_completed' | 'discharged' | 'note';
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

export const DOCTORS = [
  'Dr. García',
  'Dr. Martínez',
  'Dr. López',
  'Dr. Rodríguez',
  'Dr. Fernández',
] as const;
