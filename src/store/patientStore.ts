import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Order, OrderStatus, AdmissionData, PatientEvent } from '@/types/patient';

const DEFAULT_DOCTORS = [
  'Dr. Smith',
  'Dr. Johnson',
  'Dr. Williams',
  'Dr. Brown',
  'Dr. Davis',
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
  locations: string[];
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'events' | 'orders'>) => void;
  selectPatient: (id: string | null) => void;
  setFilterDoctor: (doctor: string | null) => void;
  setViewMode: (mode: 'active' | 'history') => void;
  
  // Doctor management
  addDoctor: (name: string) => void;
  updateDoctor: (oldName: string, newName: string) => void;
  removeDoctor: (name: string) => void;
  
  // Location management
  addLocation: (name: string) => void;
  updateLocation: (oldName: string, newName: string) => void;
  removeLocation: (name: string) => void;
  
  // Patient updates
  updatePatientLocation: (patientId: string, location: string) => void;
  updatePatientDoctor: (patientId: string, doctor: string) => void;
  updateArrivalTime: (patientId: string, time: Date) => void;
  addOrder: (patientId: string, order: Omit<Order, 'id' | 'orderedAt'>) => void;
  updateOrderStatus: (patientId: string, orderId: string, status: OrderStatus, timestamp?: Date) => void;
  updateOrderTimestamp: (patientId: string, orderId: string, field: 'orderedAt' | 'doneAt' | 'reportedAt', time: Date) => void;
  
  // Admission
  startAdmission: (patientId: string) => void;
  updateAdmission: (patientId: string, data: Partial<AdmissionData>) => void;
  completeAdmission: (patientId: string) => void;
  
  // Discharge
  dischargePatient: (patientId: string) => void;
  
  // Events
  addEvent: (patientId: string, event: Omit<PatientEvent, 'id'>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample data
const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'Mary Johnson',
    box: 'Box 3',
    doctor: 'Dr. Smith',
    arrivalTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'active',
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
    box: 'Box 7',
    doctor: 'Dr. Johnson',
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
    admission: {
      specialty: 'Surgical Registrar',
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
    box: 'Box 2',
    doctor: 'Dr. Williams',
    arrivalTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'active',
    orders: [],
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
      locations: DEFAULT_LOCATIONS,

      addPatient: (patientData) => {
        const newPatient: Patient = {
          ...patientData,
          id: generateId(),
          orders: [],
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
        }));
      },

      removeDoctor: (name) => {
        set((state) => ({
          doctors: state.doctors.filter((d) => d !== name),
          filterDoctor: state.filterDoctor === name ? null : state.filterDoctor,
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

      startAdmission: (patientId) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  status: 'admission',
                  admission: {
                    specialty: '',
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
    }),
    {
      name: 'patient-store',
    }
  )
);
