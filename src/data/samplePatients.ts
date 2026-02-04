import { Patient, PatientEvent, StickerNote, ProcessState, TriageLevel } from '@/types/patient';

const SHIFT_DATE = '2026-01-25';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface CreatePatientOptions {
  stickerNotes?: Omit<StickerNote, 'id'>[];
  dischargedAt?: Date;
  transferredTo?: string;
  admission?: Patient['admission'];
}

function createPatient(
  name: string,
  dob: string,
  mNumber: string,
  chiefComplaint: string,
  assignedBox: string,
  doctor: string,
  nurse: string,
  arrivalTime: Date,
  processState: ProcessState,
  triageLevel: TriageLevel,
  options: CreatePatientOptions = {}
): Patient {
  const patientId = generateId();
  
  // Build events timeline
  const events: PatientEvent[] = [
    {
      id: generateId(),
      timestamp: arrivalTime,
      type: 'arrival',
      description: 'Patient arrived at ED',
    },
    {
      id: generateId(),
      timestamp: new Date(arrivalTime.getTime() + 5 * 60000),
      type: 'triage_change',
      description: `Triage level: ${triageLevel}`,
    },
    {
      id: generateId(),
      timestamp: new Date(arrivalTime.getTime() + 5 * 60000),
      type: 'process_state_change',
      description: 'Process state changed to: Triaged',
    },
  ];

  // Add doctor assignment if not DNW
  if (processState !== 'discharged' || options.stickerNotes?.some(n => n.type === 'study')) {
    events.push({
      id: generateId(),
      timestamp: new Date(arrivalTime.getTime() + 15 * 60000),
      type: 'doctor_assigned',
      description: `Physician assigned: ${doctor}`,
    });
    events.push({
      id: generateId(),
      timestamp: new Date(arrivalTime.getTime() + 15 * 60000),
      type: 'process_state_change',
      description: 'Process state changed to: Being Seen',
    });
  }

  // Add final state event
  if (processState === 'discharged' && options.dischargedAt) {
    events.push({
      id: generateId(),
      timestamp: options.dischargedAt,
      type: 'process_state_change',
      description: 'Process state changed to: Discharged',
    });
  } else if (processState === 'transferred' && options.transferredTo) {
    events.push({
      id: generateId(),
      timestamp: options.dischargedAt || new Date(),
      type: 'process_state_change',
      description: `Process state changed to: Transferred to ${options.transferredTo}`,
    });
  } else if (processState === 'admission' && options.admission) {
    events.push({
      id: generateId(),
      timestamp: options.admission.completedAt || new Date(),
      type: 'process_state_change',
      description: 'Process state changed to: Admission',
    });
  }

  const stickerNotes: StickerNote[] = (options.stickerNotes || []).map((note, idx) => ({
    ...note,
    id: generateId(),
    slotIndex: idx,
  }));

  return {
    id: patientId,
    name,
    dateOfBirth: dob,
    mNumber,
    chiefComplaint,
    triageLevel,
    assignedBox,
    currentLocation: assignedBox,
    processState,
    doctor,
    nurse,
    arrivalTime,
    box: assignedBox,
    status: processState === 'discharged' ? 'discharged' : 'treatment_room',
    orders: [],
    stickerNotes,
    appointments: [],
    admission: options.admission,
    dischargedAt: options.dischargedAt,
    transferredTo: options.transferredTo,
    events,
  };
}

// Helper to create admission data
function createAdmission(specialty: string, consultant: string, bedNumber: string, startedAt: Date, completedAt: Date): Patient['admission'] {
  return {
    specialty,
    consultantName: consultant,
    consultant,
    bedNumber,
    bedStatus: 'ready_to_transfer',
    handoverComplete: true,
    registrarCalled: true,
    adminComplete: true,
    idBraceletVerified: true,
    mrsaSwabs: true,
    fallsAssessment: true,
    handoverNotes: 'Patient stable, ready for ward',
    startedAt,
    completedAt,
  };
}

export const samplePatients: Patient[] = [
  // ========== 10:00-12:00 - 5 Discharged ==========
  createPatient(
    'John McCarthy', '12/05/1985', 'M00100001',
    'Headache x 3 days', 'Box 1', 'Dr. TAU', 'Nebin',
    new Date(`${SHIFT_DATE}T10:15:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T10:45:00`) },
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T12:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T12:30:00`),
    }
  ),
  createPatient(
    'Mary O\'Sullivan', '23/08/1972', 'M00100002',
    'Ankle sprain', 'Box 2', 'Dr. Joanna', 'Beatriz',
    new Date(`${SHIFT_DATE}T10:30:00`), 'discharged', 4,
    {
      stickerNotes: [
        { type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T10:50:00`) },
        { type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${SHIFT_DATE}T12:00:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T12:00:00`),
    }
  ),
  createPatient(
    'Patrick Walsh', '15/02/1990', 'M00100003',
    'Laceration right hand', 'Box 3', 'Dr. Caren', 'Rinku',
    new Date(`${SHIFT_DATE}T10:45:00`), 'discharged', 4,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T12:15:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T12:15:00`),
    }
  ),
  createPatient(
    'Siobhan Kelly', '30/11/1968', 'M00100004',
    'Chest pain - resolved', 'Box 4', 'Dr. TAU', 'Rafa',
    new Date(`${SHIFT_DATE}T11:00:00`), 'discharged', 2,
    {
      stickerNotes: [
        { type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T11:10:00`) },
        { type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T11:45:00`) },
        { type: 'followup', text: 'RACC', createdAt: new Date(`${SHIFT_DATE}T13:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T13:30:00`),
    }
  ),
  createPatient(
    'Declan Murphy', '08/07/1995', 'M00100005',
    'Minor allergic reaction', 'Box 5', 'Dr. Alysha', 'Nebin',
    new Date(`${SHIFT_DATE}T11:30:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T13:00:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T13:00:00`),
    }
  ),

  // ========== 12:00-14:00 - 4 Discharged ==========
  createPatient(
    'Aoife Brennan', '19/04/1982', 'M00100006',
    'Back pain', 'Box 6', 'Dr. Salah', 'Beatriz',
    new Date(`${SHIFT_DATE}T12:15:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T12:45:00`) },
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T14:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T14:30:00`),
    }
  ),
  createPatient(
    'Eoin Gallagher', '25/09/1978', 'M00100007',
    'Abdominal pain - gastritis', 'Box 1', 'Dr. TAU', 'Rinku',
    new Date(`${SHIFT_DATE}T12:30:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'US', completed: true, createdAt: new Date(`${SHIFT_DATE}T13:30:00`) },
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T15:00:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T15:00:00`),
    }
  ),
  createPatient(
    'Niamh Healy', '02/12/1988', 'M00100008',
    'UTI symptoms', 'Box 2', 'Dr. Joanna', 'Rafa',
    new Date(`${SHIFT_DATE}T13:00:00`), 'discharged', 4,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T14:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T14:30:00`),
    }
  ),
  createPatient(
    'Cormac Flynn', '17/01/1965', 'M00100009',
    'Dizziness - resolved', 'Box 3', 'Dr. Caren', 'Nebin',
    new Date(`${SHIFT_DATE}T13:30:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T13:45:00`) },
        { type: 'followup', text: 'RACC', createdAt: new Date(`${SHIFT_DATE}T15:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T15:30:00`),
    }
  ),

  // ========== 14:00-16:00 - 3 Admitted + 2 Discharged ==========
  createPatient(
    'Margaret Ryan', '04/06/1955', 'M00100010',
    'STEMI', 'Resus', 'Dr. TAU', 'Beatriz',
    new Date(`${SHIFT_DATE}T14:00:00`), 'admission', 1,
    {
      stickerNotes: [
        { type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T14:05:00`) },
        { type: 'study', text: 'ECHO', completed: true, createdAt: new Date(`${SHIFT_DATE}T14:30:00`) },
        { type: 'critical', text: 'Trop 450', createdAt: new Date(`${SHIFT_DATE}T14:20:00`) },
      ],
      admission: createAdmission('Cardiology Registrar', 'Dr. O\'Brien', 'CCU-3', new Date(`${SHIFT_DATE}T15:00:00`), new Date(`${SHIFT_DATE}T17:30:00`)),
    }
  ),
  createPatient(
    'Thomas Byrne', '22/03/1948', 'M00100011',
    'Stroke symptoms', 'Resus', 'Dr. Alysha', 'Rinku',
    new Date(`${SHIFT_DATE}T14:15:00`), 'admission', 1,
    {
      stickerNotes: [
        { type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T14:25:00`) },
        { type: 'critical', text: 'BP 210/120', createdAt: new Date(`${SHIFT_DATE}T14:20:00`) },
      ],
      admission: createAdmission('Neurology Registrar', 'Dr. Kelly', 'ASU-2', new Date(`${SHIFT_DATE}T15:30:00`), new Date(`${SHIFT_DATE}T18:00:00`)),
    }
  ),
  createPatient(
    'Susan Maguire', '11/10/1970', 'M00100012',
    'GI Bleed', 'Box 4', 'Dr. Salah', 'Rafa',
    new Date(`${SHIFT_DATE}T14:30:00`), 'admission', 2,
    {
      stickerNotes: [
        { type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T15:00:00`) },
        { type: 'critical', text: 'Hb 7.2', createdAt: new Date(`${SHIFT_DATE}T14:50:00`) },
      ],
      admission: createAdmission('Medical Registrar', 'Dr. Walsh', 'Ward 4B', new Date(`${SHIFT_DATE}T16:00:00`), new Date(`${SHIFT_DATE}T18:30:00`)),
    }
  ),
  createPatient(
    'Brian Doyle', '28/05/1992', 'M00100013',
    'Migraine', 'Box 5', 'Dr. Joanna', 'Nebin',
    new Date(`${SHIFT_DATE}T14:45:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T16:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T16:30:00`),
    }
  ),
  createPatient(
    'Catherine Lynch', '07/02/1983', 'M00100014',
    'Asthma exacerbation - mild', 'Box 6', 'Dr. Caren', 'Beatriz',
    new Date(`${SHIFT_DATE}T15:00:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T17:00:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T17:00:00`),
    }
  ),

  // ========== 16:00-18:00 - 2 Admitted + 3 Discharged ==========
  createPatient(
    'Kevin O\'Connor', '14/08/1960', 'M00100015',
    'Pneumonia', 'Box 1', 'Dr. TAU', 'Rinku',
    new Date(`${SHIFT_DATE}T16:00:00`), 'admission', 2,
    {
      stickerNotes: [
        { type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T16:20:00`) },
        { type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T17:00:00`) },
        { type: 'precaution', text: 'Flu A +', createdAt: new Date(`${SHIFT_DATE}T16:30:00`) },
      ],
      admission: createAdmission('Medical Registrar', 'Dr. Murphy', 'Ward 3A', new Date(`${SHIFT_DATE}T17:30:00`), new Date(`${SHIFT_DATE}T19:30:00`)),
    }
  ),
  createPatient(
    'Emma Fitzgerald', '31/12/1975', 'M00100016',
    'Sepsis query', 'Box 2', 'Dr. Alysha', 'Rafa',
    new Date(`${SHIFT_DATE}T16:30:00`), 'admission', 2,
    {
      stickerNotes: [
        { type: 'study', text: 'US', completed: true, createdAt: new Date(`${SHIFT_DATE}T17:15:00`) },
        { type: 'critical', text: 'Lactate 4.2', createdAt: new Date(`${SHIFT_DATE}T16:50:00`) },
      ],
      admission: createAdmission('Medical Registrar', 'Dr. Brennan', 'Ward 5B', new Date(`${SHIFT_DATE}T18:00:00`), new Date(`${SHIFT_DATE}T20:00:00`)),
    }
  ),
  createPatient(
    'Rory Quinn', '20/06/1998', 'M00100017',
    'Sports injury - knee', 'Box 3', 'Dr. Salah', 'Nebin',
    new Date(`${SHIFT_DATE}T16:45:00`), 'discharged', 4,
    {
      stickerNotes: [
        { type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T17:00:00`) },
        { type: 'followup', text: 'Fracture Clinic', createdAt: new Date(`${SHIFT_DATE}T18:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T18:30:00`),
    }
  ),
  createPatient(
    'Claire Nolan', '03/09/1987', 'M00100018',
    'Food poisoning', 'Box 4', 'Dr. Joanna', 'Beatriz',
    new Date(`${SHIFT_DATE}T17:00:00`), 'discharged', 4,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T19:00:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T19:00:00`),
    }
  ),
  createPatient(
    'Sean Connolly', '26/04/1980', 'M00100019',
    'Anxiety attack', 'Box 5', 'Dr. Caren', 'Rinku',
    new Date(`${SHIFT_DATE}T17:30:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T17:45:00`) },
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T19:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T19:30:00`),
    }
  ),

  // ========== 18:00-20:00 - 3 Discharged + 1 Transfer + 1 Admitted ==========
  createPatient(
    'Fiona Dempsey', '09/11/1993', 'M00100020',
    'Pelvic pain - resolved', 'Box 6', 'Dr. TAU', 'Rafa',
    new Date(`${SHIFT_DATE}T18:00:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'US', completed: true, createdAt: new Date(`${SHIFT_DATE}T18:30:00`) },
        { type: 'followup', text: "Women's Clinic", createdAt: new Date(`${SHIFT_DATE}T20:00:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T20:00:00`),
    }
  ),
  createPatient(
    'Liam Casey', '18/07/1958', 'M00100021',
    'Hip fracture', 'Resus', 'Dr. Alysha', 'Nebin',
    new Date(`${SHIFT_DATE}T18:15:00`), 'transferred', 2,
    {
      stickerNotes: [
        { type: 'study', text: 'X-Ray', completed: true, createdAt: new Date(`${SHIFT_DATE}T18:30:00`) },
        { type: 'study', text: 'CT', completed: true, createdAt: new Date(`${SHIFT_DATE}T19:00:00`) },
      ],
      transferredTo: 'St. James Hospital - Ortho Unit',
      dischargedAt: new Date(`${SHIFT_DATE}T20:30:00`),
    }
  ),
  createPatient(
    'Aisling O\'Brien', '12/01/1989', 'M00100022',
    'Vertigo', 'Box 1', 'Dr. Salah', 'Beatriz',
    new Date(`${SHIFT_DATE}T18:30:00`), 'discharged', 3,
    {
      stickerNotes: [
        { type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T18:45:00`) },
        { type: 'followup', text: 'RACC', createdAt: new Date(`${SHIFT_DATE}T20:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T20:30:00`),
    }
  ),
  createPatient(
    'Michael Kennedy', '05/03/1952', 'M00100023',
    'CHF exacerbation', 'Box 2', 'Dr. TAU', 'Rinku',
    new Date(`${SHIFT_DATE}T18:45:00`), 'admission', 2,
    {
      stickerNotes: [
        { type: 'study', text: 'ECHO', completed: true, createdAt: new Date(`${SHIFT_DATE}T19:15:00`) },
        { type: 'study', text: 'ECG', completed: true, createdAt: new Date(`${SHIFT_DATE}T19:00:00`) },
        { type: 'critical', text: 'BNP 1200', createdAt: new Date(`${SHIFT_DATE}T19:10:00`) },
      ],
      admission: createAdmission('Cardiology Registrar', 'Dr. Fitzgerald', 'Ward 6A', new Date(`${SHIFT_DATE}T19:30:00`), new Date(`${SHIFT_DATE}T21:30:00`)),
    }
  ),
  createPatient(
    'Paula Duffy', '24/10/1996', 'M00100024',
    'Tonsilitis', 'Box 3', 'Dr. Joanna', 'Rafa',
    new Date(`${SHIFT_DATE}T19:00:00`), 'discharged', 5,
    {
      stickerNotes: [
        { type: 'followup', text: 'GP', createdAt: new Date(`${SHIFT_DATE}T20:30:00`) },
      ],
      dischargedAt: new Date(`${SHIFT_DATE}T20:30:00`),
    }
  ),

  // ========== 20:00-22:00 - 1 DNW (Did Not Wait) ==========
  createPatient(
    'Derek Hayes', '16/06/1991', 'M00100025',
    'Minor cut - left without being seen', 'Waiting Room', 'Dr. Caren', 'Nebin',
    new Date(`${SHIFT_DATE}T20:30:00`), 'discharged', 5,
    {
      stickerNotes: [],
      dischargedAt: new Date(`${SHIFT_DATE}T21:15:00`),
    }
  ),
];
