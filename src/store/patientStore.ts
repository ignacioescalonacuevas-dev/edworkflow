import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Order, OrderStatus, AdmissionData, PatientEvent, PatientStatus, PATIENT_STATUSES, StickerNote, StickerNoteType } from '@/types/patient';

const DEFAULT_DOCTORS = [
  'Dr. Smith',
  'Dr. Johnson',
  'Dr. Williams',
  'Dr. Brown',
  'Dr. Davis',
];

const DEFAULT_NURSES = [
  'N. Garcia',
  'N. Brown',
  'N. Wilson',
  'N. Taylor',
];

const DEFAULT_LOCATIONS = [
  'Waiting Area',
  'Treatment Area',
  'Box 1',
  'Box 2',
  'Box 3',
  'Box 4',
  'Box 5',
  'CT Room',
  'MRI Room',
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
  reorderStickerNotes: (patientId: string, fromIndex: number, toIndex: number) => void;
  
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

// Sample data
const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'Mary Johnson',
    dateOfBirth: '15/03/1985',
    mNumber: 'M00012345',
    chiefComplaint: 'Chest pain, shortness of breath',
    box: 'Box 3',
    doctor: 'Dr. Smith',
    nurse: 'N. Garcia',
    arrivalTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'treatment_room',
    orders: [
      {
        id: 'o1',
        type: 'lab',
        description: 'Complete Blood Count',
        status: 'done',
        orderedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        doneAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'o2',
        type: 'xray',
        description: 'Chest X-Ray PA',
        status: 'ordered',
        orderedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
    stickerNotes: [
      { id: 'sn1', type: 'study', text: 'CT', completed: true, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { id: 'sn2', type: 'study', text: 'ECHO', completed: false, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
      { id: 'sn3', type: 'critical', text: 'Trop 85', createdAt: new Date(Date.now() - 20 * 60 * 1000) },
    ],
    events: [
      {
        id: 'e1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'arrival',
        description: 'Patient arrived at ED',
      },
    ],
  },
  {
    id: '2',
    name: 'James Wilson',
    dateOfBirth: '22/07/1970',
    mNumber: 'M00067890',
    chiefComplaint: 'Abdominal pain',
    box: 'Box 7',
    doctor: 'Dr. Johnson',
    nurse: 'N. Brown',
    arrivalTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'admission',
    orders: [
      {
        id: 'o3',
        type: 'lab',
        description: 'Liver Function Panel',
        status: 'reported',
        orderedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        doneAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'o4',
        type: 'scanner',
        description: 'Abdominal CT',
        status: 'reported',
        orderedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        doneAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
    stickerNotes: [
      { id: 'sn4', type: 'study', text: 'CT', completed: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: 'sn5', type: 'admitting', text: 'Dr. Adams', createdAt: new Date(Date.now() - 30 * 60 * 1000) },
      { id: 'sn6', type: 'precaution', text: 'Flu A +', createdAt: new Date(Date.now() - 25 * 60 * 1000) },
    ],
    admission: {
      specialty: 'Surgical Registrar',
      consultantName: "Dr. O'Brien",
      bedNumber: 'Ward B-5',
      bedStatus: 'assigned_not_ready',
      registrarCalled: true,
      adminComplete: true,
      idBraceletVerified: true,
      mrsaSwabs: false,
      fallsAssessment: false,
      handoverNotes: 'Pending second IV antibiotic dose at 22:00',
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    events: [
      {
        id: 'e2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: 'arrival',
        description: 'Patient arrived at ED',
      },
      {
        id: 'e3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'admission_started',
        description: 'Admission process started - Surgical Registrar',
      },
    ],
  },
  {
    id: '3',
    name: 'Anna Martinez',
    dateOfBirth: '10/11/1992',
    mNumber: 'M00024680',
    chiefComplaint: 'Headache, dizziness',
    box: 'Box 2',
    doctor: 'Dr. Williams',
    nurse: 'N. Wilson',
    arrivalTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'waiting_room',
    orders: [],
    stickerNotes: [],
    events: [
      {
        id: 'e4',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'arrival',
        description: 'Patient arrived at ED',
      },
    ],
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
      
      // Shift state
      shiftDate: null,
      shiftConfigured: false,
      
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
        const newNote: StickerNote = {
          ...noteData,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, stickerNotes: [...p.stickerNotes, newNote] }
              : p
          ),
        }));
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

      reorderStickerNotes: (patientId, fromIndex, toIndex) => {
        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p;
            const newNotes = [...p.stickerNotes];
            const [removed] = newNotes.splice(fromIndex, 1);
            newNotes.splice(toIndex, 0, removed);
            return { ...p, stickerNotes: newNotes };
          }),
        }));
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
