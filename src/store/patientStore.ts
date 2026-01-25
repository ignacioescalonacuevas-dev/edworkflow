import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Order, OrderStatus, AdmissionData, PatientEvent, PatientStatus, PATIENT_STATUSES, StickerNote, StickerNoteType } from '@/types/patient';

const DEFAULT_DOCTORS = [
  'Dr. TAU',
  'Dr. Joanna',
  'Dr. Caren',
  'Dr. Alysha',
  'Dr. Salah',
];

const DEFAULT_NURSES = [
  'Nebin',
  'Beatriz',
  'Rinku',
  'Rafa',
];

const DEFAULT_LOCATIONS = [
  'Waiting Area',
  'Treatment',
  'Box 1',
  'Box 2',
  'Box 3',
  'Box 4',
  'Box 5',
  'Box 6',
  'Resus',
];

interface PatientStore {
  patients: Patient[];
  selectedPatientId: string | null;
  filterDoctor: string | null;
  viewMode: 'active' | 'history';
  doctors: string[];
  nurses: string[];
  locations: string[];
  
  // Dynamic options for notes
  studyOptions: string[];
  followupOptions: string[];
  precautionOptions: string[];
  dischargeOptions: string[];
  
  // Note slot preferences (remembers where user places each type of note)
  noteSlotPreferences: Record<string, number>;
  
  // Shift management
  shiftDate: Date | null;
  shiftConfigured: boolean;
  
  // Board filters
  searchQuery: string;
  filterByDoctor: string | null;
  filterByNurse: string | null;
  hideDischargedFromBoard: boolean;
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'events' | 'orders' | 'stickerNotes'>) => void;
  selectPatient: (id: string | null) => void;
  setFilterDoctor: (doctor: string | null) => void;
  setViewMode: (mode: 'active' | 'history') => void;
  
  // Doctor management
  addDoctor: (name: string) => void;
  updateDoctor: (oldName: string, newName: string) => void;
  removeDoctor: (name: string) => void;
  
  // Nurse management
  addNurse: (name: string) => void;
  updateNurse: (oldName: string, newName: string) => void;
  removeNurse: (name: string) => void;
  
  // Location management
  addLocation: (name: string) => void;
  updateLocation: (oldName: string, newName: string) => void;
  removeLocation: (name: string) => void;
  
  // Note options management
  addStudyOption: (option: string) => void;
  addFollowupOption: (option: string) => void;
  addPrecautionOption: (option: string) => void;
  addDischargeOption: (option: string) => void;
  
  // Patient updates
  updatePatientLocation: (patientId: string, location: string) => void;
  updatePatientDoctor: (patientId: string, doctor: string) => void;
  updatePatientNurse: (patientId: string, nurse: string) => void;
  updatePatientStatus: (patientId: string, status: PatientStatus) => void;
  updateArrivalTime: (patientId: string, time: Date) => void;
  addOrder: (patientId: string, order: Omit<Order, 'id' | 'orderedAt'>) => void;
  updateOrderStatus: (patientId: string, orderId: string, status: OrderStatus, timestamp?: Date) => void;
  updateOrderTimestamp: (patientId: string, orderId: string, field: 'orderedAt' | 'doneAt' | 'reportedAt', time: Date) => void;
  
  // Sticker Notes
  addStickerNote: (patientId: string, note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
  updateStickerNote: (patientId: string, noteId: string, updates: Partial<StickerNote>) => void;
  removeStickerNote: (patientId: string, noteId: string) => void;
  toggleStudyCompleted: (patientId: string, noteId: string) => void;
  moveNoteToSlot: (patientId: string, noteId: string, slotIndex: number) => void;
  
  // Board filters
  setSearchQuery: (query: string) => void;
  setFilterByDoctor: (doctor: string | null) => void;
  setFilterByNurse: (nurse: string | null) => void;
  setHideDischargedFromBoard: (hide: boolean) => void;
  clearFilters: () => void;
  clearShift: () => void;
  
  // Shift management
  setShiftDate: (date: Date) => void;
  setShiftStaff: (physicians: string[], nurses: string[]) => void;
  loadPreviousShift: () => void;
  endShift: () => void;
  
  // Admission
  startAdmission: (patientId: string) => void;
  updateAdmission: (patientId: string, data: Partial<AdmissionData>) => void;
  completeAdmission: (patientId: string) => void;
  
  // Discharge & Transfer
  dischargePatient: (patientId: string) => void;
  transferPatient: (patientId: string, hospitalName: string) => void;
  
  // Patient removal
  removePatient: (patientId: string) => void;
  
  // Chief Complaint
  updatePatientChiefComplaint: (patientId: string, complaint: string) => void;
  
  // Events
  addEvent: (patientId: string, event: Omit<PatientEvent, 'id'>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample data for 24/01/2026 - Realistic ED shift
const SHIFT_DATE = '2026-01-24';

const samplePatients: Patient[] = [
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
    arrivalTime: new Date(`${SHIFT_DATE}T14:30:00`),
    status: 'treatment_room',
    orders: [],
    stickerNotes: [
      { id: 'sn1', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T14:35:00`) },
      { id: 'sn2', type: 'study', text: 'ECHO', completed: false, createdAt: new Date(`${SHIFT_DATE}T15:00:00`) },
      { id: 'sn3', type: 'critical', text: 'Trop 156', createdAt: new Date(`${SHIFT_DATE}T15:20:00`) },
    ],
    events: [{ id: 'e1', timestamp: new Date(`${SHIFT_DATE}T14:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T15:45:00`),
    status: 'treatment_room',
    orders: [],
    stickerNotes: [
      { id: 'sn4', type: 'study', text: 'CT', completed: false, createdAt: new Date(`${SHIFT_DATE}T16:00:00`) },
      { id: 'sn5', type: 'critical', text: 'Lactate 4.2', createdAt: new Date(`${SHIFT_DATE}T16:10:00`) },
    ],
    events: [{ id: 'e2', timestamp: new Date(`${SHIFT_DATE}T15:45:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T16:20:00`),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [
      { id: 'sn6', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T16:30:00`) },
    ],
    events: [{ id: 'e3', timestamp: new Date(`${SHIFT_DATE}T16:20:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T17:00:00`),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [],
    events: [{ id: 'e4', timestamp: new Date(`${SHIFT_DATE}T17:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T17:30:00`),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [
      { id: 'sn7', type: 'study', text: 'X-Ray', completed: false, createdAt: new Date(`${SHIFT_DATE}T17:35:00`) },
    ],
    events: [{ id: 'e5', timestamp: new Date(`${SHIFT_DATE}T17:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T13:00:00`),
    status: 'review',
    orders: [],
    stickerNotes: [
      { id: 'sn8', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T13:10:00`) },
      { id: 'sn9', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T13:30:00`) },
    ],
    events: [{ id: 'e6', timestamp: new Date(`${SHIFT_DATE}T13:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T14:00:00`),
    status: 'review',
    orders: [],
    stickerNotes: [
      { id: 'sn10', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T14:15:00`) },
      { id: 'sn11', type: 'precaution', text: 'Flu A +', createdAt: new Date(`${SHIFT_DATE}T14:20:00`) },
    ],
    events: [{ id: 'e7', timestamp: new Date(`${SHIFT_DATE}T14:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T10:30:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn12', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T10:45:00`) },
      { id: 'sn13', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T11:30:00`) },
      { id: 'sn14', type: 'admitting', text: 'Ortho', createdAt: new Date(`${SHIFT_DATE}T12:00:00`) },
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
      startedAt: new Date(`${SHIFT_DATE}T12:00:00`) 
    },
    events: [{ id: 'e8', timestamp: new Date(`${SHIFT_DATE}T10:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T11:00:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn15', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T11:30:00`) },
      { id: 'sn16', type: 'critical', text: 'Lipase 520', createdAt: new Date(`${SHIFT_DATE}T12:00:00`) },
      { id: 'sn17', type: 'admitting', text: 'Surgery', createdAt: new Date(`${SHIFT_DATE}T12:30:00`) },
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
      startedAt: new Date(`${SHIFT_DATE}T12:30:00`) 
    },
    events: [{ id: 'e9', timestamp: new Date(`${SHIFT_DATE}T11:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T12:00:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn18', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T12:20:00`) },
      { id: 'sn19', type: 'precaution', text: 'Isolation', createdAt: new Date(`${SHIFT_DATE}T12:30:00`) },
      { id: 'sn20', type: 'admitting', text: 'Neuro', createdAt: new Date(`${SHIFT_DATE}T13:00:00`) },
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
      startedAt: new Date(`${SHIFT_DATE}T13:00:00`) 
    },
    events: [{ id: 'e10', timestamp: new Date(`${SHIFT_DATE}T12:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T13:30:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn21', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T13:35:00`) },
      { id: 'sn22', type: 'study', text: 'ECHO', completed: true, createdAt: new Date(`${SHIFT_DATE}T14:00:00`) },
      { id: 'sn23', type: 'critical', text: 'Trop 245', createdAt: new Date(`${SHIFT_DATE}T14:30:00`) },
      { id: 'sn24', type: 'admitting', text: 'Cardio', createdAt: new Date(`${SHIFT_DATE}T15:00:00`) },
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
      startedAt: new Date(`${SHIFT_DATE}T15:00:00`) 
    },
    events: [{ id: 'e11', timestamp: new Date(`${SHIFT_DATE}T13:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T11:30:00`),
    status: 'admission',
    orders: [],
    stickerNotes: [
      { id: 'sn25', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T11:45:00`) },
      { id: 'sn26', type: 'critical', text: 'WBC 18.5', createdAt: new Date(`${SHIFT_DATE}T12:00:00`) },
      { id: 'sn27', type: 'precaution', text: 'COVID +', createdAt: new Date(`${SHIFT_DATE}T12:10:00`) },
      { id: 'sn28', type: 'admitting', text: 'Medicine', createdAt: new Date(`${SHIFT_DATE}T12:30:00`) },
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
      startedAt: new Date(`${SHIFT_DATE}T12:30:00`) 
    },
    events: [{ id: 'e12', timestamp: new Date(`${SHIFT_DATE}T11:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T10:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T11:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn29', type: 'discharge', text: 'Home', createdAt: new Date(`${SHIFT_DATE}T11:00:00`) },
    ],
    events: [{ id: 'e13', timestamp: new Date(`${SHIFT_DATE}T10:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T10:15:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T11:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn30', type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T11:30:00`) },
      { id: 'sn31', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${SHIFT_DATE}T11:30:00`) },
    ],
    events: [{ id: 'e14', timestamp: new Date(`${SHIFT_DATE}T10:15:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T10:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T12:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn32', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T10:45:00`) },
      { id: 'sn33', type: 'discharge', text: 'Home', createdAt: new Date(`${SHIFT_DATE}T12:00:00`) },
    ],
    events: [{ id: 'e15', timestamp: new Date(`${SHIFT_DATE}T10:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T11:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T12:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn34', type: 'discharge', text: 'Home', createdAt: new Date(`${SHIFT_DATE}T12:30:00`) },
    ],
    events: [{ id: 'e16', timestamp: new Date(`${SHIFT_DATE}T11:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T11:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T13:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn35', type: 'study', text: 'US', completed: true, createdAt: new Date(`${SHIFT_DATE}T12:00:00`) },
      { id: 'sn36', type: 'followup', text: "Surgical Clinic", createdAt: new Date(`${SHIFT_DATE}T13:00:00`) },
      { id: 'sn37', type: 'discharge', text: 'Clinic', createdAt: new Date(`${SHIFT_DATE}T13:00:00`) },
    ],
    events: [{ id: 'e17', timestamp: new Date(`${SHIFT_DATE}T11:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T12:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T13:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn38', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T12:20:00`) },
      { id: 'sn39', type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${SHIFT_DATE}T13:30:00`) },
      { id: 'sn40', type: 'discharge', text: 'Clinic', createdAt: new Date(`${SHIFT_DATE}T13:30:00`) },
    ],
    events: [{ id: 'e18', timestamp: new Date(`${SHIFT_DATE}T12:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T12:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T14:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn41', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T12:40:00`) },
      { id: 'sn42', type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T14:00:00`) },
      { id: 'sn43', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${SHIFT_DATE}T14:00:00`) },
    ],
    events: [{ id: 'e19', timestamp: new Date(`${SHIFT_DATE}T12:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T13:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T14:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn44', type: 'discharge', text: 'Home', createdAt: new Date(`${SHIFT_DATE}T14:30:00`) },
    ],
    events: [{ id: 'e20', timestamp: new Date(`${SHIFT_DATE}T13:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T13:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T14:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn45', type: 'discharge', text: 'Home', createdAt: new Date(`${SHIFT_DATE}T14:30:00`) },
    ],
    events: [{ id: 'e21', timestamp: new Date(`${SHIFT_DATE}T13:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T14:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T15:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn46', type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T15:00:00`) },
      { id: 'sn47', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${SHIFT_DATE}T15:00:00`) },
    ],
    events: [{ id: 'e22', timestamp: new Date(`${SHIFT_DATE}T14:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T14:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T16:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn48', type: 'followup', text: 'RACC', createdAt: new Date(`${SHIFT_DATE}T16:00:00`) },
      { id: 'sn49', type: 'discharge', text: 'RACC', createdAt: new Date(`${SHIFT_DATE}T16:00:00`) },
    ],
    events: [{ id: 'e23', timestamp: new Date(`${SHIFT_DATE}T14:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T15:00:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T16:30:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn50', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T15:15:00`) },
      { id: 'sn51', type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${SHIFT_DATE}T16:30:00`) },
      { id: 'sn52', type: 'discharge', text: 'Clinic', createdAt: new Date(`${SHIFT_DATE}T16:30:00`) },
    ],
    events: [{ id: 'e24', timestamp: new Date(`${SHIFT_DATE}T15:00:00`), type: 'arrival', description: 'Patient arrived at ED' }],
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
    arrivalTime: new Date(`${SHIFT_DATE}T15:30:00`),
    status: 'discharged',
    dischargedAt: new Date(`${SHIFT_DATE}T17:00:00`),
    orders: [],
    stickerNotes: [
      { id: 'sn53', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T15:45:00`) },
      { id: 'sn54', type: 'precaution', text: 'MRSA', createdAt: new Date(`${SHIFT_DATE}T16:00:00`) },
      { id: 'sn55', type: 'discharge', text: 'Home', createdAt: new Date(`${SHIFT_DATE}T17:00:00`) },
    ],
    events: [{ id: 'e25', timestamp: new Date(`${SHIFT_DATE}T15:30:00`), type: 'arrival', description: 'Patient arrived at ED' }],
  },
];

export const usePatientStore = create<PatientStore>()(
  persist(
    (set, get) => ({
      patients: samplePatients,
      selectedPatientId: null,
      filterDoctor: null,
      viewMode: 'active',
      doctors: DEFAULT_DOCTORS,
      nurses: DEFAULT_NURSES,
      locations: DEFAULT_LOCATIONS,
      
      // Dynamic note options
      studyOptions: ['CT', 'ECHO', 'ECG', 'US', 'X-Ray', 'Vascular'],
      followupOptions: ['GP', "Women's Clinic", 'RACC', 'Fracture Clinic', 'Surgical Clinic'],
      precautionOptions: ['Flu A +', 'Flu B +', 'COVID +', 'MRSA', 'Isolation'],
      dischargeOptions: ['Home', 'GP F/U', 'Clinic', 'RACC', 'AMA'],
      
      // Note slot preferences
      noteSlotPreferences: {},
      
      // Shift state - initialized with sample data date
      shiftDate: new Date(SHIFT_DATE),
      shiftConfigured: true,
      
      // Board filters
      searchQuery: '',
      filterByDoctor: null,
      filterByNurse: null,
      hideDischargedFromBoard: true,

      addPatient: (patientData) => {
        const newPatient: Patient = {
          ...patientData,
          id: generateId(),
          orders: [],
          stickerNotes: [],
          events: [
            {
              id: generateId(),
              timestamp: patientData.arrivalTime,
              type: 'arrival',
              description: 'Patient arrived at ED',
            },
          ],
        };
        set((state) => ({ patients: [...state.patients, newPatient] }));
      },

      selectPatient: (id) => set({ selectedPatientId: id }),
      setFilterDoctor: (doctor) => set({ filterDoctor: doctor }),
      setViewMode: (mode) => set({ viewMode: mode }),

      addDoctor: (name) => {
        set((state) => ({
          doctors: [...state.doctors, name],
        }));
      },

      updateDoctor: (oldName, newName) => {
        set((state) => ({
          doctors: state.doctors.map((d) => (d === oldName ? newName : d)),
          patients: state.patients.map((p) =>
            p.doctor === oldName ? { ...p, doctor: newName } : p
          ),
          filterDoctor: state.filterDoctor === oldName ? newName : state.filterDoctor,
          filterByDoctor: state.filterByDoctor === oldName ? newName : state.filterByDoctor,
        }));
      },

      removeDoctor: (name) => {
        set((state) => ({
          doctors: state.doctors.filter((d) => d !== name),
          filterDoctor: state.filterDoctor === name ? null : state.filterDoctor,
          filterByDoctor: state.filterByDoctor === name ? null : state.filterByDoctor,
        }));
      },

      addNurse: (name) => {
        set((state) => ({
          nurses: [...state.nurses, name],
        }));
      },

      updateNurse: (oldName, newName) => {
        set((state) => ({
          nurses: state.nurses.map((n) => (n === oldName ? newName : n)),
          patients: state.patients.map((p) =>
            p.nurse === oldName ? { ...p, nurse: newName } : p
          ),
          filterByNurse: state.filterByNurse === oldName ? newName : state.filterByNurse,
        }));
      },

      removeNurse: (name) => {
        set((state) => ({
          nurses: state.nurses.filter((n) => n !== name),
          filterByNurse: state.filterByNurse === name ? null : state.filterByNurse,
        }));
      },

      addLocation: (name) => {
        set((state) => ({
          locations: [...state.locations, name],
        }));
      },

      updateLocation: (oldName, newName) => {
        set((state) => ({
          locations: state.locations.map((l) => (l === oldName ? newName : l)),
          patients: state.patients.map((p) =>
            p.box === oldName ? { ...p, box: newName } : p
          ),
        }));
      },

      removeLocation: (name) => {
        set((state) => ({
          locations: state.locations.filter((l) => l !== name),
        }));
      },

      addStudyOption: (option) => {
        set((state) => ({
          studyOptions: state.studyOptions.includes(option) 
            ? state.studyOptions 
            : [...state.studyOptions, option],
        }));
      },

      addFollowupOption: (option) => {
        set((state) => ({
          followupOptions: state.followupOptions.includes(option) 
            ? state.followupOptions 
            : [...state.followupOptions, option],
        }));
      },

      addPrecautionOption: (option) => {
        set((state) => ({
          precautionOptions: state.precautionOptions.includes(option) 
            ? state.precautionOptions 
            : [...state.precautionOptions, option],
        }));
      },

      addDischargeOption: (option) => {
        set((state) => ({
          dischargeOptions: state.dischargeOptions.includes(option) 
            ? state.dischargeOptions 
            : [...state.dischargeOptions, option],
        }));
      },

      updatePatientLocation: (patientId, location) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  box: location,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'location_change',
                      description: `Moved to ${location}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updatePatientDoctor: (patientId, doctor) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  doctor,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'doctor_assigned',
                      description: doctor ? `Physician assigned: ${doctor}` : 'Physician unassigned',
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updatePatientNurse: (patientId, nurse) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  nurse,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'nurse_assigned',
                      description: nurse ? `Nurse assigned: ${nurse}` : 'Nurse unassigned',
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updatePatientStatus: (patientId, status) => {
        const statusLabel = PATIENT_STATUSES.find(s => s.value === status)?.label || status;
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  status,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'status_change',
                      description: `Status changed to: ${statusLabel}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updateArrivalTime: (patientId, time) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId ? { ...p, arrivalTime: time } : p
          ),
        }));
      },

      addOrder: (patientId, orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: generateId(),
          orderedAt: new Date(),
        };
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  orders: [...p.orders, newOrder],
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'order',
                      description: `Order placed: ${orderData.description}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updateOrderStatus: (patientId, orderId, status, timestamp) => {
        const now = timestamp || new Date();
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  orders: p.orders.map((o) =>
                    o.id === orderId
                      ? {
                          ...o,
                          status,
                          ...(status === 'done' && { doneAt: now }),
                          ...(status === 'reported' && { reportedAt: now }),
                        }
                      : o
                  ),
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: now,
                      type: status === 'done' ? 'order_done' : 'order_reported',
                      description: `${p.orders.find((o) => o.id === orderId)?.description} - ${status === 'done' ? 'Completed' : 'Reported'}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updateOrderTimestamp: (patientId, orderId, field, time) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  orders: p.orders.map((o) =>
                    o.id === orderId ? { ...o, [field]: time } : o
                  ),
                }
              : p
          ),
        }));
      },

      // Sticker Notes
      addStickerNote: (patientId, noteData) => {
        set((state) => {
          const patient = state.patients.find(p => p.id === patientId);
          if (!patient) return state;
          
          // Check for saved preference for this note type
          const preferenceKey = `${noteData.type}:${noteData.text}`;
          const preferredSlot = state.noteSlotPreferences[preferenceKey];
          
          // Find used slots
          const usedSlots = new Set(patient.stickerNotes.map(n => n.slotIndex ?? 0));
          
          let finalSlot: number;
          
          // If there's a preference and that slot is free, use it
          if (preferredSlot !== undefined && !usedSlots.has(preferredSlot)) {
            finalSlot = preferredSlot;
          } else {
            // Find first available slot (fallback)
            finalSlot = 0;
            for (let i = 0; i < 9; i++) {
              if (!usedSlots.has(i)) {
                finalSlot = i;
                break;
              }
            }
          }
          
          const newNote: StickerNote = {
            ...noteData,
            id: generateId(),
            createdAt: new Date(),
            slotIndex: noteData.slotIndex ?? finalSlot,
          };
          
          return {
            patients: state.patients.map((p) =>
              p.id === patientId
                ? { ...p, stickerNotes: [...p.stickerNotes, newNote] }
                : p
            ),
          };
        });
      },

      updateStickerNote: (patientId, noteId, updates) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  stickerNotes: p.stickerNotes.map((n) =>
                    n.id === noteId ? { ...n, ...updates } : n
                  ),
                }
              : p
          ),
        }));
      },

      removeStickerNote: (patientId, noteId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, stickerNotes: p.stickerNotes.filter((n) => n.id !== noteId) }
              : p
          ),
        }));
      },

      toggleStudyCompleted: (patientId, noteId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  stickerNotes: p.stickerNotes.map((n) =>
                    n.id === noteId && n.type === 'study'
                      ? { ...n, completed: !n.completed }
                      : n
                  ),
                }
              : p
          ),
        }));
      },

      moveNoteToSlot: (patientId, noteId, targetSlotIndex) => {
        set((state) => {
          const patient = state.patients.find(p => p.id === patientId);
          if (!patient) return state;
          
          const movingNote = patient.stickerNotes.find(n => n.id === noteId);
          if (!movingNote) return state;
          
          // Find if there's a note already in the target slot
          const noteInTargetSlot = patient.stickerNotes.find(n => n.slotIndex === targetSlotIndex);
          const movingNoteCurrentSlot = movingNote.slotIndex ?? 0;
          
          // Save preference for this note type
          const preferenceKey = `${movingNote.type}:${movingNote.text}`;
          
          return {
            patients: state.patients.map((p) => {
              if (p.id !== patientId) return p;
              
              // Swap slots if target is occupied, otherwise just move
              return {
                ...p,
                stickerNotes: p.stickerNotes.map((n) => {
                  if (n.id === noteId) {
                    return { ...n, slotIndex: targetSlotIndex };
                  }
                  if (noteInTargetSlot && n.id === noteInTargetSlot.id) {
                    return { ...n, slotIndex: movingNoteCurrentSlot };
                  }
                  return n;
                }),
              };
            }),
            // Update the preference for this note type
            noteSlotPreferences: {
              ...state.noteSlotPreferences,
              [preferenceKey]: targetSlotIndex,
            },
          };
        });
      },

      // Board filters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterByDoctor: (doctor) => set({ filterByDoctor: doctor }),
      setFilterByNurse: (nurse) => set({ filterByNurse: nurse }),
      setHideDischargedFromBoard: (hide) => set({ hideDischargedFromBoard: hide }),
      
      clearFilters: () => set({
        searchQuery: '',
        filterByDoctor: null,
        filterByNurse: null,
      }),

      clearShift: () => set({
        patients: [],
        selectedPatientId: null,
        searchQuery: '',
        filterByDoctor: null,
        filterByNurse: null,
      }),

      // Shift management
      setShiftDate: (date) => set({ shiftDate: date, shiftConfigured: true }),
      
      setShiftStaff: (physicians, nurses) => set({
        doctors: physicians.length > 0 ? physicians : ['Dr. Smith'],
        nurses: nurses.length > 0 ? nurses : ['N. Garcia'],
        patients: [],
        shiftConfigured: true,
      }),
      
      loadPreviousShift: () => set({ shiftConfigured: true }),
      
      endShift: () => set({
        shiftConfigured: false,
        shiftDate: null,
      }),

      startAdmission: (patientId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  status: 'admission',
                    admission: {
                      specialty: '',
                      consultantName: '',
                      bedNumber: '',
                      bedStatus: 'not_assigned',
                      registrarCalled: false,
                      adminComplete: false,
                      idBraceletVerified: false,
                      mrsaSwabs: false,
                      fallsAssessment: false,
                      handoverNotes: '',
                      startedAt: new Date(),
                    },
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'admission_started',
                      description: 'Admission process started',
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updateAdmission: (patientId, data) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId && p.admission
              ? {
                  ...p,
                  admission: { ...p.admission, ...data },
                }
              : p
          ),
        }));
      },

      completeAdmission: (patientId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId && p.admission
              ? {
                  ...p,
                  admission: { ...p.admission, completedAt: new Date() },
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'admission_completed',
                      description: `Admission completed - ${p.admission.specialty}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      dischargePatient: (patientId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  status: 'discharged',
                  dischargedAt: new Date(),
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'discharged',
                      description: 'Patient discharged',
                    },
                  ],
                }
              : p
          ),
        }));
      },

      transferPatient: (patientId, hospitalName) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  status: 'transferred',
                  dischargedAt: new Date(),
                  transferredTo: hospitalName,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'discharged',
                      description: `Patient transferred to ${hospitalName}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      addEvent: (patientId, event) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  events: [...p.events, { ...event, id: generateId() }],
                }
              : p
          ),
        }));
      },

      removePatient: (patientId) => {
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== patientId),
          selectedPatientId: state.selectedPatientId === patientId 
            ? null 
            : state.selectedPatientId,
        }));
      },

      updatePatientChiefComplaint: (patientId, complaint) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId ? { ...p, chiefComplaint: complaint } : p
          ),
        }));
      },
    }),
    {
      name: 'patient-store',
    }
  )
);

// Selector for filtered patients
export const getFilteredPatients = (state: PatientStore): Patient[] => {
  let result = state.patients;
  
  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.mNumber.toLowerCase().includes(query) ||
      p.doctor.toLowerCase().includes(query) ||
      p.nurse?.toLowerCase().includes(query) ||
      p.chiefComplaint.toLowerCase().includes(query) ||
      p.box.toLowerCase().includes(query)
    );
  }
  
  // Filter by doctor
  if (state.filterByDoctor) {
    result = result.filter(p => p.doctor === state.filterByDoctor);
  }
  
  // Filter by nurse
  if (state.filterByNurse) {
    result = result.filter(p => p.nurse === state.filterByNurse);
  }
  
  // Hide discharged
  if (state.hideDischargedFromBoard) {
    result = result.filter(p => p.status !== 'discharged' && p.status !== 'transferred');
  }
  
  return result;
};
