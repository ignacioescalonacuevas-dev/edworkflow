import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, Order, OrderStatus, AdmissionData, PatientEvent } from '@/types/patient';

interface PatientStore {
  patients: Patient[];
  selectedPatientId: string | null;
  filterDoctor: string | null;
  viewMode: 'active' | 'history';
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'events' | 'orders'>) => void;
  selectPatient: (id: string | null) => void;
  setFilterDoctor: (doctor: string | null) => void;
  setViewMode: (mode: 'active' | 'history') => void;
  
  // Patient updates
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
    name: 'María González',
    box: 'Box 3',
    doctor: 'Dr. García',
    arrivalTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'active',
    orders: [
      {
        id: 'o1',
        type: 'lab',
        description: 'Hemograma completo',
        status: 'done',
        orderedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        doneAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'o2',
        type: 'xray',
        description: 'Rx Tórax PA',
        status: 'ordered',
        orderedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
    events: [
      {
        id: 'e1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'arrival',
        description: 'Paciente ingresa a urgencias',
      },
    ],
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    box: 'Box 7',
    doctor: 'Dr. Martínez',
    arrivalTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'admission',
    orders: [
      {
        id: 'o3',
        type: 'lab',
        description: 'Perfil hepático',
        status: 'reported',
        orderedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        doneAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'o4',
        type: 'scanner',
        description: 'TAC Abdominal',
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
      handoverNotes: 'Pendiente segunda dosis de antibiótico IV a las 22:00',
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    events: [
      {
        id: 'e2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: 'arrival',
        description: 'Paciente ingresa a urgencias',
      },
      {
        id: 'e3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'admission_started',
        description: 'Inicio proceso de admisión - Surgical Registrar',
      },
    ],
  },
  {
    id: '3',
    name: 'Ana Martínez',
    box: 'Box 2',
    doctor: 'Dr. López',
    arrivalTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'active',
    orders: [],
    events: [
      {
        id: 'e4',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'arrival',
        description: 'Paciente ingresa a urgencias',
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
              description: 'Paciente ingresa a urgencias',
            },
          ],
        };
        set((state) => ({ patients: [...state.patients, newPatient] }));
      },

      selectPatient: (id) => set({ selectedPatientId: id }),
      setFilterDoctor: (doctor) => set({ filterDoctor: doctor }),
      setViewMode: (mode) => set({ viewMode: mode }),

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
                      description: `Orden: ${orderData.description}`,
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
                      description: `${p.orders.find((o) => o.id === orderId)?.description} - ${status === 'done' ? 'Realizado' : 'Reportado'}`,
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
                      description: 'Inicio proceso de admisión',
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
                      description: `Admisión completada - ${p.admission.specialty}`,
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
                      description: 'Paciente dado de alta',
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
