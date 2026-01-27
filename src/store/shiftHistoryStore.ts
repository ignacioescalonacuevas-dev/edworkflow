import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, mapStatusToProcessState, ProcessState, TriageLevel } from '@/types/patient';

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

// Helper to create a patient with default new fields
function createPatient(
  id: string,
  name: string,
  dateOfBirth: string,
  mNumber: string,
  chiefComplaint: string,
  box: string,
  doctor: string,
  nurse: string,
  arrivalTime: Date,
  status: 'treatment_room' | 'waiting_room' | 'review' | 'admission' | 'discharged' | 'transferred',
  triageLevel: TriageLevel,
  options?: {
    stickerNotes?: Patient['stickerNotes'];
    orders?: Patient['orders'];
    admission?: Patient['admission'];
    dischargedAt?: Date;
    currentLocation?: string;
  }
): Patient {
  const processState = mapStatusToProcessState(status);
  return {
    id,
    name,
    dateOfBirth,
    mNumber,
    chiefComplaint,
    box,
    assignedBox: box,
    currentLocation: options?.currentLocation ?? box,
    triageLevel,
    processState,
    doctor,
    nurse,
    arrivalTime,
    status,
    orders: options?.orders ?? [],
    stickerNotes: options?.stickerNotes ?? [],
    admission: options?.admission,
    dischargedAt: options?.dischargedAt,
    events: [{ id: `e-${id}`, timestamp: arrivalTime, type: 'arrival', description: 'Patient arrived at ED' }],
  };
}

// Sample patients from 24/01/2026 (yesterday's shift)
const HISTORY_DATE = '2026-01-24';

const yesterdayPatients: Patient[] = [
  // === TREATMENT ROOM (2) ===
  createPatient('p1', "Michael O'Brien", '18/05/1958', 'M00234567', 'Chest pain radiating to left arm', 'Resus', 'Dr. TAU', 'Nebin', new Date(`${HISTORY_DATE}T14:30:00`), 'treatment_room', 2, {
    stickerNotes: [
      { id: 'sn1', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T14:35:00`) },
      { id: 'sn2', type: 'study', text: 'ECHO', completed: false, createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
      { id: 'sn3', type: 'critical', text: 'Trop 156', createdAt: new Date(`${HISTORY_DATE}T15:20:00`) },
    ],
    currentLocation: 'Echo Room',
  }),
  createPatient('p2', 'Sarah Kelly', '03/09/1975', 'M00345678', 'Severe dyspnea, SpO2 88%', 'Treatment Room', 'Dr. Joanna', 'Beatriz', new Date(`${HISTORY_DATE}T15:45:00`), 'treatment_room', 2, {
    stickerNotes: [
      { id: 'sn4', type: 'study', text: 'CT', completed: false, createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
      { id: 'sn5', type: 'critical', text: 'Lactate 4.2', createdAt: new Date(`${HISTORY_DATE}T16:10:00`) },
    ],
    currentLocation: 'CT Room',
  }),

  // === WAITING ROOM (3) ===
  createPatient('p3', 'Patrick Byrne', '22/11/1990', 'M00456789', 'Lower back pain after lifting', 'Waiting Room', 'Dr. Caren', 'Rinku', new Date(`${HISTORY_DATE}T16:20:00`), 'waiting_room', 4, {
    stickerNotes: [
      { id: 'sn6', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T16:30:00`) },
    ],
  }),
  createPatient('p4', 'Emma Fitzgerald', '14/02/2001', 'M00567890', 'Abdominal pain, nausea', 'Waiting Room', 'Dr. Alysha', 'Rafa', new Date(`${HISTORY_DATE}T17:00:00`), 'waiting_room', 3),
  createPatient('p5', 'John Murphy', '30/06/1982', 'M00678901', 'Twisted ankle, swelling', 'Waiting Room', 'Dr. Salah', 'Nebin', new Date(`${HISTORY_DATE}T17:30:00`), 'waiting_room', 5, {
    stickerNotes: [
      { id: 'sn7', type: 'study', text: 'X-Ray', completed: false, createdAt: new Date(`${HISTORY_DATE}T17:35:00`) },
    ],
  }),

  // === REVIEW (2) ===
  createPatient('p6', 'Catherine Walsh', '08/12/1968', 'M00789012', 'Syncope at home', 'Box 1', 'Dr. TAU', 'Beatriz', new Date(`${HISTORY_DATE}T13:00:00`), 'review', 3, {
    stickerNotes: [
      { id: 'sn8', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T13:10:00`) },
      { id: 'sn9', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T13:30:00`) },
    ],
  }),
  createPatient('p7', 'Declan Ryan', '25/04/1955', 'M00890123', 'Palpitations, anxiety', 'Box 2', 'Dr. Joanna', 'Rinku', new Date(`${HISTORY_DATE}T14:00:00`), 'review', 3, {
    stickerNotes: [
      { id: 'sn10', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T14:15:00`) },
      { id: 'sn11', type: 'precaution', text: 'Flu A +', createdAt: new Date(`${HISTORY_DATE}T14:20:00`) },
    ],
  }),

  // === ADMISSION (5) ===
  createPatient('p8', 'Margaret Doyle', '19/07/1948', 'M00901234', 'Fall at nursing home, hip pain', 'Box 3', 'Dr. Caren', 'Rafa', new Date(`${HISTORY_DATE}T10:30:00`), 'admission', 2, {
    stickerNotes: [
      { id: 'sn12', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T10:45:00`) },
      { id: 'sn13', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
      { id: 'sn14', type: 'admitting', text: 'Ortho', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
    ],
    admission: { 
      specialty: 'Orthopaedics', 
      consultantName: 'Dr. Murphy',
      consultant: 'Dr. Murphy',
      bedNumber: '5N-12', 
      bedStatus: 'assigned_not_ready', 
      handoverComplete: false,
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T12:00:00`) 
    },
  }),
  createPatient('p9', 'Thomas Brennan', '11/01/1962', 'M00012345', 'Acute abdominal pain, vomiting', 'Box 4', 'Dr. Alysha', 'Nebin', new Date(`${HISTORY_DATE}T11:00:00`), 'admission', 2, {
    stickerNotes: [
      { id: 'sn15', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
      { id: 'sn16', type: 'critical', text: 'Lipase 520', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
      { id: 'sn17', type: 'admitting', text: 'Surgery', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
    ],
    admission: { 
      specialty: 'General Surgery', 
      consultantName: 'Dr. O\'Connor',
      consultant: 'Dr. O\'Connor',
      bedNumber: '', 
      bedStatus: 'not_assigned', 
      handoverComplete: false,
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T12:30:00`) 
    },
  }),
  createPatient('p10', 'Siobhan McCarthy', '28/03/1979', 'M00123456', 'Severe headache, photophobia', 'Box 5', 'Dr. Salah', 'Beatriz', new Date(`${HISTORY_DATE}T12:00:00`), 'admission', 2, {
    stickerNotes: [
      { id: 'sn18', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:20:00`) },
      { id: 'sn19', type: 'precaution', text: 'Isolation', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
      { id: 'sn20', type: 'admitting', text: 'Neuro', createdAt: new Date(`${HISTORY_DATE}T13:00:00`) },
    ],
    admission: { 
      specialty: 'Neurology', 
      consultantName: 'Dr. Walsh',
      consultant: 'Dr. Walsh',
      bedNumber: '3S-8', 
      bedStatus: 'ready_to_transfer', 
      handoverComplete: true,
      registrarCalled: true, 
      adminComplete: true, 
      idBraceletVerified: true, 
      mrsaSwabs: true, 
      fallsAssessment: true, 
      handoverNotes: 'Patient stable for transfer', 
      startedAt: new Date(`${HISTORY_DATE}T13:00:00`) 
    },
  }),
  createPatient('p11', 'Brian Gallagher', '05/09/1970', 'M00234568', 'Chest pain, diaphoresis', 'Box 6', 'Dr. TAU', 'Rinku', new Date(`${HISTORY_DATE}T13:30:00`), 'admission', 1, {
    stickerNotes: [
      { id: 'sn21', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T13:35:00`) },
      { id: 'sn22', type: 'study', text: 'ECHO', completed: true, createdAt: new Date(`${HISTORY_DATE}T14:00:00`) },
      { id: 'sn23', type: 'critical', text: 'Trop 245', createdAt: new Date(`${HISTORY_DATE}T14:30:00`) },
      { id: 'sn24', type: 'admitting', text: 'Cardio', createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
    ],
    admission: { 
      specialty: 'Cardiology', 
      consultantName: 'Dr. Kelly',
      consultant: 'Dr. Kelly',
      bedNumber: 'CCU-3', 
      bedStatus: 'assigned_not_ready', 
      handoverComplete: false,
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: true, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T15:00:00`) 
    },
  }),
  createPatient('p12', 'Mary Connolly', '16/06/1952', 'M00345679', 'Confusion, fever', 'Resus', 'Dr. Joanna', 'Rafa', new Date(`${HISTORY_DATE}T11:30:00`), 'admission', 2, {
    stickerNotes: [
      { id: 'sn25', type: 'study', text: 'CT', completed: true, createdAt: new Date(`${HISTORY_DATE}T11:45:00`) },
      { id: 'sn26', type: 'critical', text: 'WBC 18.5', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
      { id: 'sn27', type: 'precaution', text: 'COVID +', createdAt: new Date(`${HISTORY_DATE}T12:10:00`) },
      { id: 'sn28', type: 'admitting', text: 'Medicine', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) },
    ],
    admission: { 
      specialty: 'Internal Medicine', 
      consultantName: 'Dr. Byrne',
      consultant: 'Dr. Byrne',
      bedNumber: '', 
      bedStatus: 'not_assigned', 
      handoverComplete: false,
      registrarCalled: true, 
      adminComplete: false, 
      idBraceletVerified: false, 
      mrsaSwabs: false, 
      fallsAssessment: false, 
      handoverNotes: '', 
      startedAt: new Date(`${HISTORY_DATE}T12:30:00`) 
    },
  }),

  // === DISCHARGED (13) ===
  createPatient('p13', 'Kevin Nolan', '12/08/1988', 'M00456790', 'Minor laceration on hand', 'Treatment Room', 'Dr. Caren', 'Nebin', new Date(`${HISTORY_DATE}T10:00:00`), 'discharged', 5, {
    stickerNotes: [{ id: 'sn29', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T11:00:00`) }],
    dischargedAt: new Date(`${HISTORY_DATE}T11:00:00`),
  }),
  createPatient('p14', 'Aoife Kennedy', '20/04/1995', 'M00567891', 'UTI symptoms', 'Box 1', 'Dr. Alysha', 'Beatriz', new Date(`${HISTORY_DATE}T10:15:00`), 'discharged', 4, {
    stickerNotes: [
      { id: 'sn30', type: 'followup', text: 'GP', createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
      { id: 'sn31', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${HISTORY_DATE}T11:30:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T11:30:00`),
  }),
  createPatient('p15', 'Sean Duffy', '07/11/1965', 'M00678902', 'Dizziness, vertigo', 'Box 2', 'Dr. Salah', 'Rinku', new Date(`${HISTORY_DATE}T10:30:00`), 'discharged', 3, {
    stickerNotes: [
      { id: 'sn32', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T10:45:00`) },
      { id: 'sn33', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T12:00:00`),
  }),
  createPatient('p16', 'Claire Healy', '29/01/1983', 'M00789013', 'Allergic reaction, hives', 'Box 3', 'Dr. TAU', 'Rafa', new Date(`${HISTORY_DATE}T11:00:00`), 'discharged', 3, {
    stickerNotes: [{ id: 'sn34', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T12:30:00`) }],
    dischargedAt: new Date(`${HISTORY_DATE}T12:30:00`),
  }),
  createPatient('p17', 'Liam Burke', '15/03/1972', 'M00890124', 'Epigastric pain', 'Box 4', 'Dr. Joanna', 'Nebin', new Date(`${HISTORY_DATE}T11:30:00`), 'discharged', 3, {
    stickerNotes: [
      { id: 'sn35', type: 'study', text: 'US', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:00:00`) },
      { id: 'sn36', type: 'followup', text: 'Surgical Clinic', createdAt: new Date(`${HISTORY_DATE}T13:00:00`) },
      { id: 'sn37', type: 'discharge', text: 'Clinic', createdAt: new Date(`${HISTORY_DATE}T13:00:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T13:00:00`),
  }),
  createPatient('p18', 'Niamh Quinn', '08/07/1998', 'M00901235', 'Ankle sprain playing GAA', 'Waiting Room', 'Dr. Caren', 'Beatriz', new Date(`${HISTORY_DATE}T12:00:00`), 'discharged', 4, {
    stickerNotes: [
      { id: 'sn38', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:20:00`) },
      { id: 'sn39', type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${HISTORY_DATE}T13:30:00`) },
      { id: 'sn40', type: 'discharge', text: 'Clinic', createdAt: new Date(`${HISTORY_DATE}T13:30:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T13:30:00`),
  }),
  createPatient('p19', 'David Lynch', '23/05/1980', 'M00012346', 'Chest tightness, anxiety', 'Box 5', 'Dr. Alysha', 'Rinku', new Date(`${HISTORY_DATE}T12:30:00`), 'discharged', 3, {
    stickerNotes: [
      { id: 'sn41', type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${HISTORY_DATE}T12:40:00`) },
      { id: 'sn42', type: 'followup', text: 'GP', createdAt: new Date(`${HISTORY_DATE}T14:00:00`) },
      { id: 'sn43', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${HISTORY_DATE}T14:00:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T14:00:00`),
  }),
  createPatient('p20', 'Orla Sullivan', '02/10/1991', 'M00123457', 'Migraine with aura', 'Box 6', 'Dr. Salah', 'Rafa', new Date(`${HISTORY_DATE}T13:00:00`), 'discharged', 3, {
    stickerNotes: [{ id: 'sn44', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T14:30:00`) }],
    dischargedAt: new Date(`${HISTORY_DATE}T14:30:00`),
  }),
  createPatient('p21', 'Conor Maguire', '17/12/1976', 'M00234569', 'Epistaxis', 'Treatment Room', 'Dr. TAU', 'Nebin', new Date(`${HISTORY_DATE}T13:30:00`), 'discharged', 4, {
    stickerNotes: [{ id: 'sn45', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T14:30:00`) }],
    dischargedAt: new Date(`${HISTORY_DATE}T14:30:00`),
  }),
  createPatient('p22', 'Fiona Reilly', '06/04/1986', 'M00345680', 'Painful throat, difficulty swallowing', 'Waiting Room', 'Dr. Joanna', 'Beatriz', new Date(`${HISTORY_DATE}T14:00:00`), 'discharged', 4, {
    stickerNotes: [
      { id: 'sn46', type: 'followup', text: 'GP', createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
      { id: 'sn47', type: 'discharge', text: 'GP F/U', createdAt: new Date(`${HISTORY_DATE}T15:00:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T15:00:00`),
  }),
  createPatient('p23', 'Eamon Hayes', '21/08/1959', 'M00456791', 'Blood in stool', 'Box 1', 'Dr. Caren', 'Rinku', new Date(`${HISTORY_DATE}T14:30:00`), 'discharged', 3, {
    stickerNotes: [
      { id: 'sn48', type: 'followup', text: 'RACC', createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
      { id: 'sn49', type: 'discharge', text: 'RACC', createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T16:00:00`),
  }),
  createPatient('p24', 'Ruth Coleman', '13/02/1994', 'M00567892', 'Wrist pain after fall', 'Box 2', 'Dr. Alysha', 'Rafa', new Date(`${HISTORY_DATE}T15:00:00`), 'discharged', 4, {
    stickerNotes: [
      { id: 'sn50', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T15:15:00`) },
      { id: 'sn51', type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${HISTORY_DATE}T16:30:00`) },
      { id: 'sn52', type: 'discharge', text: 'Clinic', createdAt: new Date(`${HISTORY_DATE}T16:30:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T16:30:00`),
  }),
  createPatient('p25', 'Padraig Carey', '09/06/1967', 'M00678903', 'Shortness of breath, COPD exacerbation', 'Box 3', 'Dr. Salah', 'Nebin', new Date(`${HISTORY_DATE}T15:30:00`), 'discharged', 3, {
    stickerNotes: [
      { id: 'sn53', type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${HISTORY_DATE}T15:45:00`) },
      { id: 'sn54', type: 'precaution', text: 'MRSA', createdAt: new Date(`${HISTORY_DATE}T16:00:00`) },
      { id: 'sn55', type: 'discharge', text: 'Home', createdAt: new Date(`${HISTORY_DATE}T17:00:00`) },
    ],
    dischargedAt: new Date(`${HISTORY_DATE}T17:00:00`),
  }),
];

// Pre-populated history with yesterday's shift
const initialHistory: Record<string, ShiftSnapshot> = {
  '2026-01-24': {
    date: '2026-01-24',
    patients: yesterdayPatients,
    doctors: ['Dr. TAU', 'Dr. Joanna', 'Dr. Caren', 'Dr. Alysha', 'Dr. Salah'],
    nurses: ['Nebin', 'Beatriz', 'Rinku', 'Rafa'],
    locations: ['Waiting Room', 'Treatment Room', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5', 'Box 6', 'Resus'],
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
