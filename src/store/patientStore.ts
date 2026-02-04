import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { Patient, Order, OrderStatus, AdmissionData, PatientEvent, PatientStatus, PATIENT_STATUSES, StickerNote, StickerNoteType, ProcessState, PROCESS_STATES, TriageLevel, mapStatusToProcessState, Appointment, APPOINTMENT_TYPES } from '@/types/patient';
import { useShiftHistoryStore } from './shiftHistoryStore';
import { samplePatients } from '@/data/samplePatients';

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
  'Waiting Room',
  'Treatment Room',
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
  
  // Note slot preferences (remembers where user places each type of note)
  noteSlotPreferences: Record<string, number>;
  
  // Shift management
  shiftDate: Date | null;
  shiftConfigured: boolean;
  
  // Time display toggle (arrival time vs elapsed time)
  showArrivalTime: boolean;
  
  // Board filters
  searchQuery: string;
  filterByDoctor: string | null;
  filterByNurse: string | null;
  hideDischargedFromBoard: boolean;
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'events' | 'orders' | 'stickerNotes' | 'appointments'>) => void;
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
  
  // Patient updates
  updatePatientLocation: (patientId: string, location: string) => void;
  updatePatientDoctor: (patientId: string, doctor: string) => void;
  updatePatientNurse: (patientId: string, nurse: string) => void;
  updatePatientStatus: (patientId: string, status: PatientStatus) => void;
  updateArrivalTime: (patientId: string, time: Date) => void;
  addOrder: (patientId: string, order: Omit<Order, 'id' | 'orderedAt'>) => void;
  updateOrderStatus: (patientId: string, orderId: string, status: OrderStatus, timestamp?: Date) => void;
  updateOrderTimestamp: (patientId: string, orderId: string, field: 'orderedAt' | 'doneAt' | 'reportedAt', time: Date) => void;
  
  // NEW: Triage, Location, and Process State
  updatePatientTriage: (patientId: string, level: TriageLevel) => void;
  updatePatientAssignedBox: (patientId: string, box: string) => void;
  updatePatientCurrentLocation: (patientId: string, location: string) => void;
  updatePatientProcessState: (patientId: string, state: ProcessState) => void;
  
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
  saveCurrentShiftToHistory: () => void;
  reopenShift: (date: string) => void;
  
  // Time display toggle
  toggleTimeDisplay: () => void;
  
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
  
  // Appointments
  addAppointment: (patientId: string, appointment: Omit<Appointment, 'id' | 'createdAt' | 'reminderTriggered' | 'status'>) => void;
  updateAppointmentStatus: (patientId: string, appointmentId: string, status: Appointment['status']) => void;
  markReminderTriggered: (patientId: string, appointmentId: string) => void;
  cancelAppointment: (patientId: string, appointmentId: string) => void;
  
  // Reset data to sample patients (for testing)
  resetToSampleData: () => void;
}

// Helper to migrate old patient data to new structure
function migratePatient(patient: Patient): Patient {
  return {
    ...patient,
    triageLevel: patient.triageLevel ?? 3,
    assignedBox: patient.assignedBox ?? patient.box ?? 'Waiting Room',
    currentLocation: patient.currentLocation ?? patient.box ?? 'Waiting Room',
    processState: patient.processState ?? mapStatusToProcessState(patient.status),
    appointments: patient.appointments ?? [],
    admission: patient.admission ? {
      ...patient.admission,
      consultant: patient.admission.consultant ?? patient.admission.consultantName ?? '',
      handoverComplete: patient.admission.handoverComplete ?? false,
    } : undefined,
  };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

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
      
      // Note slot preferences
      noteSlotPreferences: {},
      
      // Shift state - start with no configured shift (user must set up)
      shiftDate: null,
      shiftConfigured: false,
      
      // Time display toggle
      showArrivalTime: false,
      
      // Board filters
      searchQuery: '',
      filterByDoctor: null,
      filterByNurse: null,
      hideDischargedFromBoard: true,

      addPatient: (patientData) => {
        const newPatient: Patient = {
          ...patientData,
          id: generateId(),
          // Ensure new fields have defaults
          triageLevel: patientData.triageLevel ?? 3,
          assignedBox: patientData.assignedBox ?? patientData.box ?? 'Waiting Room',
          currentLocation: patientData.currentLocation ?? patientData.box ?? 'Waiting Room',
          processState: patientData.processState ?? 'registered',
          orders: [],
          stickerNotes: [],
          appointments: [],
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

      updatePatientLocation: (patientId, location) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  box: location,
                  assignedBox: location,
                  currentLocation: location,
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

      // NEW: Triage update
      updatePatientTriage: (patientId, level) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  triageLevel: level,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'triage_change',
                      description: `Triage level changed to ${level}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      // NEW: Assigned box update
      updatePatientAssignedBox: (patientId, box) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  assignedBox: box,
                  currentLocation: box, // Reset current location when box changes
                  box: box, // Keep legacy field in sync
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'location_change',
                      description: `Assigned to ${box}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      // NEW: Current location update (temporary location like CT, MRI, etc.)
      updatePatientCurrentLocation: (patientId, location) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  currentLocation: location,
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'location_change',
                      description: `Currently at ${location}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      // NEW: Process state update
      updatePatientProcessState: (patientId, processState) => {
        const stateLabel = PROCESS_STATES.find(s => s.value === processState)?.label || processState;
        const isAdmissionState = ['admission_pending', 'bed_assigned', 'ready_transfer'].includes(processState);
        
        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p;
            
            return {
              ...p,
              processState,
              // Create admission object if entering admission state and doesn't exist
              admission: isAdmissionState && !p.admission ? {
                specialty: '',
                consultantName: '',
                consultant: '',
                bedNumber: '',
                bedStatus: 'not_assigned' as const,
                handoverComplete: false,
                registrarCalled: false,
                adminComplete: false,
                idBraceletVerified: false,
                mrsaSwabs: false,
                fallsAssessment: false,
                handoverNotes: '',
                startedAt: new Date(),
              } : p.admission,
              events: [
                ...p.events,
                {
                  id: generateId(),
                  timestamp: new Date(),
                  type: 'process_state_change',
                  description: `Process state changed to: ${stateLabel}`,
                },
              ],
            };
          }),
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
      
      endShift: () => {
        const state = get();
        
        // Save current shift to history before closing
        if (state.shiftDate && state.patients.length > 0) {
          const dateKey = format(new Date(state.shiftDate), 'yyyy-MM-dd');
          const snapshot = {
            date: dateKey,
            patients: state.patients,
            doctors: state.doctors,
            nurses: state.nurses,
            locations: state.locations,
            summary: {
              totalPatients: state.patients.length,
              admissions: state.patients.filter(p => 
                ['admission_pending', 'bed_assigned', 'ready_transfer', 'admitted'].includes(p.processState || '')
              ).length,
              discharges: state.patients.filter(p => p.processState === 'discharged').length,
              transfers: state.patients.filter(p => p.processState === 'transferred').length,
            },
            savedAt: new Date().toISOString(),
          };
          
          useShiftHistoryStore.getState().saveShift(snapshot);
        }
        
        // Reset for new shift
        set({
          shiftConfigured: false,
          shiftDate: null,
          patients: [],
          selectedPatientId: null,
          searchQuery: '',
          filterByDoctor: null,
          filterByNurse: null,
        });
      },
      
      reopenShift: (date: string) => {
        const snapshot = useShiftHistoryStore.getState().loadShift(date);
        if (!snapshot) return;
        
        set({
          shiftDate: new Date(date),
          shiftConfigured: true,
          patients: snapshot.patients,
          doctors: snapshot.doctors,
          nurses: snapshot.nurses,
          locations: snapshot.locations,
        });
      },
      
      // Time display toggle
      toggleTimeDisplay: () => set((state) => ({ showArrivalTime: !state.showArrivalTime })),

      startAdmission: (patientId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  status: 'admission',
                  processState: 'admission_pending',
                  admission: {
                    specialty: '',
                    consultantName: '',
                    consultant: '',
                    bedNumber: '',
                    bedStatus: 'not_assigned',
                    handoverComplete: false,
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
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p;
            
            // Create admission if it doesn't exist
            const existingAdmission = p.admission || {
              specialty: '',
              consultantName: '',
              consultant: '',
              bedNumber: '',
              bedStatus: 'not_assigned' as const,
              handoverComplete: false,
              registrarCalled: false,
              adminComplete: false,
              idBraceletVerified: false,
              mrsaSwabs: false,
              fallsAssessment: false,
              handoverNotes: '',
              startedAt: new Date(),
            };
            
            // Sync consultant and consultantName
            const newConsultantName = data.consultantName ?? data.consultant ?? existingAdmission.consultantName;
            const newConsultant = data.consultantName ?? data.consultant ?? existingAdmission.consultant;
            
            return {
              ...p,
              admission: { 
                ...existingAdmission, 
                ...data,
                consultantName: newConsultantName,
                consultant: newConsultant,
              },
            };
          }),
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

      saveCurrentShiftToHistory: () => {
        const state = get();
        if (!state.shiftDate) return;
        
        const dateKey = format(new Date(state.shiftDate), 'yyyy-MM-dd');
        const snapshot = {
          date: dateKey,
          patients: state.patients,
          doctors: state.doctors,
          nurses: state.nurses,
          locations: state.locations,
          summary: {
            totalPatients: state.patients.length,
            admissions: state.patients.filter(p => p.status === 'admission').length,
            discharges: state.patients.filter(p => p.status === 'discharged').length,
            transfers: state.patients.filter(p => p.status === 'transferred').length,
          },
          savedAt: new Date().toISOString(),
        };
        
        useShiftHistoryStore.getState().saveShift(snapshot);
      },

      resetToSampleData: () => {
        set({
          patients: samplePatients,
          shiftDate: new Date(),
          shiftConfigured: true,
          doctors: DEFAULT_DOCTORS,
          nurses: DEFAULT_NURSES,
          locations: DEFAULT_LOCATIONS,
          searchQuery: '',
          filterByDoctor: null,
          filterByNurse: null,
          hideDischargedFromBoard: true,
        });
      },

      // Appointment actions
      addAppointment: (patientId, appointmentData) => {
        const newAppointment: Appointment = {
          ...appointmentData,
          id: generateId(),
          createdAt: new Date(),
          reminderTriggered: false,
          status: 'pending',
        };
        const typeLabel = APPOINTMENT_TYPES[appointmentData.type]?.label || appointmentData.type;
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  appointments: [...(p.appointments || []), newAppointment],
                  events: [
                    ...p.events,
                    {
                      id: generateId(),
                      timestamp: new Date(),
                      type: 'note',
                      description: `Appointment scheduled: ${typeLabel}`,
                    },
                  ],
                }
              : p
          ),
        }));
      },

      updateAppointmentStatus: (patientId, appointmentId, status) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  appointments: (p.appointments || []).map((apt) =>
                    apt.id === appointmentId ? { ...apt, status } : apt
                  ),
                }
              : p
          ),
        }));
      },

      markReminderTriggered: (patientId, appointmentId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  appointments: (p.appointments || []).map((apt) =>
                    apt.id === appointmentId ? { ...apt, reminderTriggered: true } : apt
                  ),
                }
              : p
          ),
        }));
      },

      cancelAppointment: (patientId, appointmentId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  appointments: (p.appointments || []).map((apt) =>
                    apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
                  ),
                }
              : p
          ),
        }));
      },
    }),
    {
      name: 'patient-store',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState?.patients) {
          return {
            ...persistedState,
            patients: persistedState.patients.map(migratePatient),
          };
        }
        return persistedState as PatientStore;
      },
    }
  )
);

// Selector for filtered patients with intelligent search
export const getFilteredPatients = (state: PatientStore): Patient[] => {
  let result = state.patients.map(migratePatient);
  
  // Filter by search query with intelligent matching
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    result = result.filter(p => {
      // Basic text search
      if (p.name.toLowerCase().includes(query)) return true;
      if (p.mNumber.toLowerCase().includes(query)) return true;
      if (p.doctor.toLowerCase().includes(query)) return true;
      if (p.nurse?.toLowerCase().includes(query)) return true;
      if (p.chiefComplaint.toLowerCase().includes(query)) return true;
      if (p.box.toLowerCase().includes(query)) return true;
      if (p.assignedBox?.toLowerCase().includes(query)) return true;
      if (p.currentLocation?.toLowerCase().includes(query)) return true;
      
      // Process state search
      const stateConfig = PROCESS_STATES.find(s => s.value === p.processState);
      if (stateConfig?.label.toLowerCase().includes(query)) return true;
      
      // Triage level search (e.g., "1", "triage 2", "immediate")
      if (query === String(p.triageLevel)) return true;
      const triageConfig = { 1: 'immediate', 2: 'very urgent', 3: 'urgent', 4: 'standard', 5: 'non-urgent' };
      if (triageConfig[p.triageLevel as keyof typeof triageConfig]?.includes(query)) return true;
      
      // Admission data search
      if (p.admission?.consultant?.toLowerCase().includes(query)) return true;
      if (p.admission?.consultantName?.toLowerCase().includes(query)) return true;
      if (p.admission?.bedNumber?.toLowerCase().includes(query)) return true;
      if (p.admission?.specialty?.toLowerCase().includes(query)) return true;
      
      return false;
    });
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
    result = result.filter(p => 
      p.processState !== 'discharged' && 
      p.processState !== 'transferred' && 
      p.processState !== 'admitted' &&
      p.status !== 'discharged' && 
      p.status !== 'transferred'
    );
  }
  
  return result;
};
