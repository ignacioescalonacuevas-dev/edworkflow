import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient } from '@/types/patient';

export interface ShiftSnapshot {
  date: string;
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
  savedAt: string;
}

interface ShiftHistoryStore {
  history: Record<string, ShiftSnapshot>;
  viewingDate: string | null;  // null = viewing current day
  
  saveShift: (snapshot: ShiftSnapshot) => void;
  loadShift: (date: string) => ShiftSnapshot | null;
  setViewingDate: (date: string | null) => void;
  getAvailableDates: () => string[];
  clearOldHistory: (keepDays: number) => void;
}

// Sample patients from 24/01/2026 (yesterday's shift)
const HISTORY_DATE = '2026-01-24';

const yesterdayPatients: Patient[] = [
  // === TREATMENT ROOM (2) ===
  {
    id: 'p1',
    name: "Michael O'Brien",
    dateOfBirth: '18/05/1958',
    mNumber: 'M00234567',
    chiefComplaint: 'Chest pain radiating to left arm',
    box: 'Resus',
    doctor: 'Dr. TAU',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T14:30:00`),
    status: 'treatment_room',
    orders: [],
    stickerNotes: [
      { id: 'sn1', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T14:35:00`) },
      { id: 'sn2', type: 'study', text: 'ECHO', completed: false, createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
      { id: 'sn3', type: 'critical', text: 'Trop 156', createdAt: new Date(`${HISTORY_DATE}T15:20:00`) },
    ],
    events: [{ id: 'e1', timestamp: new Date(`${HISTORY_DATE}T14:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p2',
    name: 'Sarah Kelly',
    dateOfBirth: '03/09/1975',
    mNumber: 'M00345678',
    chiefComplaint: 'Severe dyspnea, SpO2 88%',
    box: 'Treatment',
    doctor: 'Dr. Joanna',
    nurse: 'Beatriz',
    arrivalTime: new Date(`${HISTORY_DATE}T15:45:00`),
    status: 'treatment_room',
    orders: [],
    stickerNotes: [
      { id: 'sn4', type: 'study', text: 'CT', completed: false, createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
      { id: 'sn5', type: 'critical', text: 'Lactate 4.2', createdAt: new Date(`${HISTORY_DATE}T16:10:00`) },
    ],
    events: [{ id: 'e2', timestamp: new Date(`${HISTORY_DATE}T15:45:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },

  // === WAITING ROOM (3) ===
  {
    id: 'p3',
    name: 'Patrick Byrne',
    dateOfBirth: '22/11/1990',
    mNumber: 'M00456789',
    chiefComplaint: 'Lower back pain after lifting',
    box: 'Waiting Area',
    doctor: 'Dr. Caren',
    nurse: 'Rinku',
    arrivalTime: new Date(`${HISTORY_DATE}T16:20:00`),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [
      { id: 'sn6', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T16:30:00`) },
    ],
    events: [{ id: 'e3', timestamp: new Date(`${HISTORY_DATE}T16:20:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p4',
    name: 'Emma Fitzgerald',
    dateOfBirth: '14/02/2001',
    mNumber: 'M00567890',
    chiefComplaint: 'Abdominal pain, nausea',
    box: 'Waiting Area',
    doctor: 'Dr. Alysha',
    nurse: 'Rafa',
    arrivalTime: new Date(`${HISTORY_DATE}T17:00:00`),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [],
    events: [{ id: 'e4', timestamp: new Date(`${HISTORY_DATE}T17:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p5',
    name: 'John Murphy',
    dateOfBirth: '30/06/1982',
    mNumber: 'M00678901',
    chiefComplaint: 'Twisted ankle, swelling',
    box: 'Waiting Area',
    doctor: 'Dr. Salah',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T17:30:00`),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [
      { id: 'sn7', type: 'study', text: 'X-Ray', completed: false, createdAt: new Date(`${HISTORY_DATE}T17:35:00`) },
    ],
    events: [{ id: 'e5', timestamp: new Date(`${HISTORY_DATE}T17:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },

  // === REVIEW (2) ===
  {
    id: 'p6',
    name: 'Catherine Walsh',
    dateOfBirth: '08/12/1968',
    mNumber: 'M00789012',
    chiefComplaint: 'Syncope at home',
    box: 'Box 1',
    doctor: 'Dr. TAU',
    nurse: 'Beatriz',
    arrivalTime: new Date(`${HISTORY_DATE}T13:00:00`),
    status: 'review',
    orders: [],
    stickerNotes: [
      { id: 'sn8', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T13:10:00`) },
      { id: 'sn9', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T13:30:00`) },
    ],
    events: [{ id: 'e6', timestamp: new Date(`${HISTORY_DATE}T13:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p7',
    name: 'Declan Ryan',
    dateOfBirth: '25/04/1955',
    mNumber: 'M00890123',
    chiefComplaint: 'Palpitations, anxiety',
    box: 'Box 2',
    doctor: 'Dr. Joanna',
    nurse: 'Rinku',
    arrivalTime: new Date(`${HISTORY_DATE}T14:00:00`),
    status: 'review',
    orders: [],
    stickerNotes: [
      { id: 'sn10', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T14:15:00`) },
      { id: 'sn11', type: 'precaution', text: 'Flu A +', createdAt: new Date(`${HISTORY_DATE}T14:20:00`) },
    ],
    events: [{ id: 'e7', timestamp: new Date(`${HISTORY_DATE}T14:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },

  // === ADMISSION (5) ===
  {
    id: 'p8',
    name: 'Margaret Doyle',
    dateOfBirth: '19/07/1948',
    mNumber: 'M00901234',
    chiefComplaint: 'Fall at nursing home, hip pain',
    box: 'Box 3',
    doctor: 'Dr. Caren',
    nurse: 'Rafa',
    arrivalTime: new Date(`${HISTORY_DATE}T10:30:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn12', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T10:45:00`) },
      { id: 'sn13', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
      { id: 'sn14', type: 'admitting', text: 'Ortho', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
    ],
    admission: { 
      specialty: 'Orthopaedics', 
      consultantName: '', 
      bedNumber: '', 
      bedStatus: 'not_assigned' as const, 
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T12:00:00`) 
    },
    events: [{ id: 'e8', timestamp: new Date(`${HISTORY_DATE}T10:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p9',
    name: 'Thomas Brennan',
    dateOfBirth: '11/01/1962',
    mNumber: 'M00012345',
    chiefComplaint: 'Acute abdominal pain, vomiting',
    box: 'Box 4',
    doctor: 'Dr. Alysha',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T11:00:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn15', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
      { id: 'sn16', type: 'critical', text: 'Lipase 520', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
      { id: 'sn17', type: 'admitting', text: 'Surgery', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
    ],
    admission: { 
      specialty: 'General Surgery', 
      consultantName: '', 
      bedNumber: '', 
      bedStatus: 'not_assigned' as const, 
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T12:30:00`) 
    },
    events: [{ id: 'e9', timestamp: new Date(`${HISTORY_DATE}T11:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p10',
    name: 'Siobhan McCarthy',
    dateOfBirth: '28/03/1979',
    mNumber: 'M00123456',
    chiefComplaint: 'Severe headache, photophobia',
    box: 'Box 5',
    doctor: 'Dr. Salah',
    nurse: 'Beatriz',
    arrivalTime: new Date(`${HISTORY_DATE}T12:00:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn18', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:20:00`) },
      { id: 'sn19', type: 'precaution', text: 'Isolation', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
      { id: 'sn20', type: 'admitting', text: 'Neuro', createdAt: new Date(`${HISTORY_DATE}T13:00:00`) },
    ],
    admission: { 
      specialty: 'Neurology', 
      consultantName: '', 
      bedNumber: '', 
      bedStatus: 'not_assigned' as const, 
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T13:00:00`) 
    },
    events: [{ id: 'e10', timestamp: new Date(`${HISTORY_DATE}T12:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p11',
    name: 'Brian Gallagher',
    dateOfBirth: '05/09/1970',
    mNumber: 'M00234568',
    chiefComplaint: 'Chest pain, diaphoresis',
    box: 'Box 6',
    doctor: 'Dr. TAU',
    nurse: 'Rinku',
    arrivalTime: new Date(`${HISTORY_DATE}T13:30:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn21', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T13:35:00`) },
      { id: 'sn22', type: 'study', text: 'ECHO', completed: true, createdAt: new Date(`${HISTORY_DATE}T14:00:00`) },
      { id: 'sn23', type: 'critical', text: 'Trop 245', createdAt: new Date(`${HISTORY_DATE}T14:30:00`) },
      { id: 'sn24', type: 'admitting', text: 'Cardio', createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
    ],
    admission: { 
      specialty: 'Cardiology', 
      consultantName: '', 
      bedNumber: '', 
      bedStatus: 'not_assigned' as const, 
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T15:00:00`) 
    },
    events: [{ id: 'e11', timestamp: new Date(`${HISTORY_DATE}T13:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p12',
    name: 'Mary Connolly',
    dateOfBirth: '16/06/1952',
    mNumber: 'M00345679',
    chiefComplaint: 'Confusion, fever',
    box: 'Resus',
    doctor: 'Dr. Joanna',
    nurse: 'Rafa',
    arrivalTime: new Date(`${HISTORY_DATE}T11:30:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn25', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T11:45:00`) },
      { id: 'sn26', type: 'critical', text: 'WBC 18.5', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
      { id: 'sn27', type: 'precaution', text: 'COVID +', createdAt: new Date(`${HISTORY_DATE}T12:10:00`) },
      { id: 'sn28', type: 'admitting', text: 'Medicine', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
    ],
    admission: { 
      specialty: 'Internal Medicine', 
      consultantName: '', 
      bedNumber: '', 
      bedStatus: 'not_assigned' as const, 
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T12:30:00`) 
    },
    events: [{ id: 'e12', timestamp: new Date(`${HISTORY_DATE}T11:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },

  // === DISCHARGED (13) ===
  {
    id: 'p13',
    name: 'Kevin Nolan',
    dateOfBirth: '12/08/1988',
    mNumber: 'M00456790',
    chiefComplaint: 'Minor laceration on hand',
    box: 'Treatment',
    doctor: 'Dr. Caren',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T10:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T11:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn29', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T11:00:00`) },
    ],
    events: [{ id: 'e13', timestamp: new Date(`${HISTORY_DATE}T10:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p14',
    name: 'Aoife Kennedy',
    dateOfBirth: '20/04/1995',
    mNumber: 'M00567891',
    chiefComplaint: 'UTI symptoms',
    box: 'Box 1',
    doctor: 'Dr. Alysha',
    nurse: 'Beatriz',
    arrivalTime: new Date(`${HISTORY_DATE}T10:15:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T11:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn30', type: 'followup', text: 'GP', createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
      { id: 'sn31', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
    ],
    events: [{ id: 'e14', timestamp: new Date(`${HISTORY_DATE}T10:15:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p15',
    name: 'Sean Duffy',
    dateOfBirth: '07/11/1965',
    mNumber: 'M00678902',
    chiefComplaint: 'Dizziness, vertigo',
    box: 'Box 2',
    doctor: 'Dr. Salah',
    nurse: 'Rinku',
    arrivalTime: new Date(`${HISTORY_DATE}T10:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T12:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn32', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T10:45:00`) },
      { id: 'sn33', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
    ],
    events: [{ id: 'e15', timestamp: new Date(`${HISTORY_DATE}T10:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p16',
    name: 'Claire Healy',
    dateOfBirth: '29/01/1983',
    mNumber: 'M00789013',
    chiefComplaint: 'Allergic reaction, hives',
    box: 'Box 3',
    doctor: 'Dr. TAU',
    nurse: 'Rafa',
    arrivalTime: new Date(`${HISTORY_DATE}T11:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T12:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn34', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
    ],
    events: [{ id: 'e16', timestamp: new Date(`${HISTORY_DATE}T11:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p17',
    name: 'Liam Burke',
    dateOfBirth: '15/03/1972',
    mNumber: 'M00890124',
    chiefComplaint: 'Epigastric pain',
    box: 'Box 4',
    doctor: 'Dr. Joanna',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T11:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T13:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn35', type: 'study', text: 'US', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
      { id: 'sn36', type: 'followup', text: "Surgical Clinic", createdAt: new Date(`${HISTORY_DATE}T13:00:00`) },
      { id: 'sn37', type: 'discharge', text: 'Clinic', createdAt: new Date(`${HISTORY_DATE}T13:00:00`) },
    ],
    events: [{ id: 'e17', timestamp: new Date(`${HISTORY_DATE}T11:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p18',
    name: 'Niamh Quinn',
    dateOfBirth: '08/07/1998',
    mNumber: 'M00901235',
    chiefComplaint: 'Ankle sprain playing GAA',
    box: 'Waiting Area',
    doctor: 'Dr. Caren',
    nurse: 'Beatriz',
    arrivalTime: new Date(`${HISTORY_DATE}T12:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T13:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn38', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:20:00`) },
      { id: 'sn39', type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${HISTORY_DATE}T13:30:00`) },
      { id: 'sn40', type: 'discharge', text: 'Clinic', createdAt: new Date(`${HISTORY_DATE}T13:30:00`) },
    ],
    events: [{ id: 'e18', timestamp: new Date(`${HISTORY_DATE}T12:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p19',
    name: 'David Lynch',
    dateOfBirth: '23/05/1980',
    mNumber: 'M00012346',
    chiefComplaint: 'Chest tightness, anxiety',
    box: 'Box 5',
    doctor: 'Dr. Alysha',
    nurse: 'Rinku',
    arrivalTime: new Date(`${HISTORY_DATE}T12:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T14:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn41', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:40:00`) },
      { id: 'sn42', type: 'followup', text: 'GP', createdAt: new Date(`${HISTORY_DATE}T14:00:00`) },
      { id: 'sn43', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${HISTORY_DATE}T14:00:00`) },
    ],
    events: [{ id: 'e19', timestamp: new Date(`${HISTORY_DATE}T12:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p20',
    name: 'Orla Sullivan',
    dateOfBirth: '02/10/1991',
    mNumber: 'M00123457',
    chiefComplaint: 'Migraine with aura',
    box: 'Box 6',
    doctor: 'Dr. Salah',
    nurse: 'Rafa',
    arrivalTime: new Date(`${HISTORY_DATE}T13:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T14:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn44', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T14:30:00`) },
    ],
    events: [{ id: 'e20', timestamp: new Date(`${HISTORY_DATE}T13:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p21',
    name: 'Conor Maguire',
    dateOfBirth: '17/12/1976',
    mNumber: 'M00234569',
    chiefComplaint: 'Epistaxis',
    box: 'Treatment',
    doctor: 'Dr. TAU',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T13:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T14:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn45', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T14:30:00`) },
    ],
    events: [{ id: 'e21', timestamp: new Date(`${HISTORY_DATE}T13:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p22',
    name: 'Fiona Reilly',
    dateOfBirth: '06/04/1986',
    mNumber: 'M00345680',
    chiefComplaint: 'Painful throat, difficulty swallowing',
    box: 'Waiting Area',
    doctor: 'Dr. Joanna',
    nurse: 'Beatriz',
    arrivalTime: new Date(`${HISTORY_DATE}T14:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T15:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn46', type: 'followup', text: 'GP', createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
      { id: 'sn47', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
    ],
    events: [{ id: 'e22', timestamp: new Date(`${HISTORY_DATE}T14:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p23',
    name: 'Eamon Hayes',
    dateOfBirth: '21/08/1959',
    mNumber: 'M00456791',
    chiefComplaint: 'Blood in stool',
    box: 'Box 1',
    doctor: 'Dr. Caren',
    nurse: 'Rinku',
    arrivalTime: new Date(`${HISTORY_DATE}T14:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T16:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn48', type: 'followup', text: 'RACC', createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
      { id: 'sn49', type: 'discharge', text: 'RACC', createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
    ],
    events: [{ id: 'e23', timestamp: new Date(`${HISTORY_DATE}T14:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p24',
    name: 'Ruth Coleman',
    dateOfBirth: '13/02/1994',
    mNumber: 'M00567892',
    chiefComplaint: 'Wrist pain after fall',
    box: 'Box 2',
    doctor: 'Dr. Alysha',
    nurse: 'Rafa',
    arrivalTime: new Date(`${HISTORY_DATE}T15:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T16:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn50', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T15:15:00`) },
      { id: 'sn51', type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${HISTORY_DATE}T16:30:00`) },
      { id: 'sn52', type: 'discharge', text: 'Clinic', createdAt: new Date(`${HISTORY_DATE}T16:30:00`) },
    ],
    events: [{ id: 'e24', timestamp: new Date(`${HISTORY_DATE}T15:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
  {
    id: 'p25',
    name: 'Padraig Carey',
    dateOfBirth: '09/06/1967',
    mNumber: 'M00678903',
    chiefComplaint: 'Shortness of breath, COPD exacerbation',
    box: 'Box 3',
    doctor: 'Dr. Salah',
    nurse: 'Nebin',
    arrivalTime: new Date(`${HISTORY_DATE}T15:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${HISTORY_DATE}T17:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn53', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T15:45:00`) },
      { id: 'sn54', type: 'precaution', text: 'MRSA', createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
      { id: 'sn55', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T17:00:00`) },
    ],
    events: [{ id: 'e25', timestamp: new Date(`${HISTORY_DATE}T15:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
];

// Pre-populated history with yesterday's shift
const initialHistory: Record<string, ShiftSnapshot> = {
  '2026-01-24': {
    date: '2026-01-24',
    patients: yesterdayPatients,
    doctors: ['Dr. TAU', 'Dr. Joanna', 'Dr. Caren', 'Dr. Alysha', 'Dr. Salah'],
    nurses: ['Nebin', 'Beatriz', 'Rinku', 'Rafa'],
    locations: ['Waiting Area', 'Treatment', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5', 'Box 6', 'Resus'],
    summary: {
      totalPatients: 25,
      admissions: 5,
      discharges: 13,
      transfers: 0,
    },
    savedAt: '2026-01-24T23:59:00.000Z',
  },
};

export const useShiftHistoryStore = create<ShiftHistoryStore>()(
  persist(
    (set, get) => ({
      history: initialHistory,
      viewingDate: null,
      
      saveShift: (snapshot) => {
        set((state) => ({
          history: {
            ...state.history,
            [snapshot.date]: snapshot,
          },
        }));
      },
      
      loadShift: (date) => get().history[date] || null,
      
      setViewingDate: (date) => set({ viewingDate: date }),
      
      getAvailableDates: () => Object.keys(get().history).sort().reverse(),
      
      clearOldHistory: (keepDays) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - keepDays);
        set((state) => ({
          history: Object.fromEntries(
            Object.entries(state.history).filter(
              ([date]) => new Date(date) >= cutoff
            )
          ),
        }));
      },
    }),
    { name: 'shift-history' }
  )
);
