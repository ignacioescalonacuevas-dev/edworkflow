import { useMemo } from 'react';
import { Patient, TriageLevel, ProcessState, PROCESS_STATES } from '@/types/patient';

export interface PatientSummary {
  id: string;
  name: string;
  triageLevel: TriageLevel;
  chiefComplaint: string;
  processState: ProcessState;
  duration: number; // minutes
  assignedBox: string;
}

export interface StaffStats {
  name: string;
  patientCount: number;
  admissions: number;
  discharges: number;
  studies: Record<string, number>;
  patients: PatientSummary[];
}

export interface StudiesCounts {
  ct: number;
  ecg: number;
  echo: number;
  xray: number;
  us: number;
  vascular: number;
  labs: number;
}

export interface WaitTimeStats {
  averageWait: number | null; // minutes from arrival to being_seen
  averageTotal: number; // minutes from arrival to now/discharge
  longest: number;
  shortest: number;
  byTriage: Record<TriageLevel, { avg: number; count: number }>;
}

export interface HourlyData {
  hour: number;
  arrivals: number;
  discharges: number;
}

export interface AnalyticsData {
  // General stats
  totalPatients: number;
  activePatients: number;
  admissions: number;
  discharges: number;
  transfers: number;
  admissionRate: number;
  
  // NEW: DNW (Did Not Wait)
  dnwCount: number;
  
  // NEW: Follow-up breakdown
  followupCounts: Record<string, number>;
  
  // Triage distribution
  triageDistribution: Record<TriageLevel, number>;
  criticalCount: number; // Triage 1-2
  
  // Studies
  studiesCounts: StudiesCounts;
  totalStudies: number;
  
  // Wait times
  waitTimes: WaitTimeStats;
  
  // Staff workload
  physicianStats: StaffStats[];
  nurseStats: StaffStats[];
  
  // Time-based
  peakHour: number | null;
  hourlyData: HourlyData[];
  
  // Precautions
  precautionCounts: Record<string, number>;
  
  // Locations
  locationCounts: Record<string, number>;
}

function calculateWaitTime(patient: Patient): number | null {
  const arrival = new Date(patient.arrivalTime);
  
  // Find first "Being Seen" event
  const seenEvent = patient.events.find(e => 
    e.type === 'process_state_change' && 
    e.description.toLowerCase().includes('being seen')
  );
  
  if (seenEvent) {
    const seenTime = new Date(seenEvent.timestamp);
    return (seenTime.getTime() - arrival.getTime()) / 60000;
  }
  
  return null; // Still waiting or never marked as being seen
}

function calculateTotalTime(patient: Patient): number {
  const arrival = new Date(patient.arrivalTime);
  const end = patient.dischargedAt 
    ? new Date(patient.dischargedAt) 
    : new Date();
    
  return (end.getTime() - arrival.getTime()) / 60000;
}

function getPatientSummary(patient: Patient): PatientSummary {
  return {
    id: patient.id,
    name: patient.name,
    triageLevel: patient.triageLevel,
    chiefComplaint: patient.chiefComplaint,
    processState: patient.processState,
    duration: calculateTotalTime(patient),
    assignedBox: patient.assignedBox,
  };
}

export function useAnalytics(patients: Patient[]): AnalyticsData {
  return useMemo(() => {
    // General Stats
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => 
      !['discharged', 'transferred', 'admitted'].includes(p.processState)
    ).length;
    
    const admissions = patients.filter(p => 
      p.admission !== undefined || 
      ['admission_pending', 'bed_assigned', 'ready_transfer', 'admitted'].includes(p.processState)
    ).length;
    
    const discharges = patients.filter(p => p.processState === 'discharged').length;
    const transfers = patients.filter(p => p.processState === 'transferred').length;
    const admissionRate = totalPatients > 0 ? (admissions / totalPatients) * 100 : 0;
    
    // DNW (Did Not Wait) - patients discharged without ever being seen
    const dnwCount = patients.filter(p => 
      p.processState === 'discharged' && 
      !p.events.some(e => e.description.toLowerCase().includes('being seen'))
    ).length;
    
    // Follow-up breakdown
    const followupCounts: Record<string, number> = {};
    patients.forEach(p => {
      p.stickerNotes?.forEach(note => {
        if (note.type === 'followup') {
          followupCounts[note.text] = (followupCounts[note.text] || 0) + 1;
        }
      });
    });
    
    // Triage Distribution
    const triageDistribution: Record<TriageLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    patients.forEach(p => {
      if (p.triageLevel >= 1 && p.triageLevel <= 5) {
        triageDistribution[p.triageLevel]++;
      }
    });
    const criticalCount = triageDistribution[1] + triageDistribution[2];
    
    // Studies Counts (from stickerNotes)
    const studiesCounts: StudiesCounts = {
      ct: 0, ecg: 0, echo: 0, xray: 0, us: 0, vascular: 0, labs: 0
    };
    
    patients.forEach(p => {
      p.stickerNotes?.forEach(note => {
        if (note.type === 'study') {
          const text = note.text.toLowerCase();
          if (text === 'ct') studiesCounts.ct++;
          else if (text === 'ecg') studiesCounts.ecg++;
          else if (text === 'echo') studiesCounts.echo++;
          else if (text === 'x-ray' || text === 'xray') studiesCounts.xray++;
          else if (text === 'us') studiesCounts.us++;
          else if (text === 'vascular') studiesCounts.vascular++;
        }
      });
      
      // Count lab orders
      p.orders?.forEach(order => {
        if (order.type === 'lab') studiesCounts.labs++;
      });
    });
    
    const totalStudies = Object.values(studiesCounts).reduce((a, b) => a + b, 0);
    
    // Wait Times
    const waitTimes: WaitTimeStats = {
      averageWait: null,
      averageTotal: 0,
      longest: 0,
      shortest: Infinity,
      byTriage: {
        1: { avg: 0, count: 0 },
        2: { avg: 0, count: 0 },
        3: { avg: 0, count: 0 },
        4: { avg: 0, count: 0 },
        5: { avg: 0, count: 0 },
      }
    };
    
    const waitTimesArray: number[] = [];
    const totalTimesArray: number[] = [];
    const waitByTriage: Record<TriageLevel, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    
    patients.forEach(p => {
      const wait = calculateWaitTime(p);
      const total = calculateTotalTime(p);
      
      if (wait !== null) {
        waitTimesArray.push(wait);
        if (p.triageLevel >= 1 && p.triageLevel <= 5) {
          waitByTriage[p.triageLevel].push(wait);
        }
      }
      
      totalTimesArray.push(total);
      
      if (total > waitTimes.longest) waitTimes.longest = total;
      if (total < waitTimes.shortest) waitTimes.shortest = total;
    });
    
    if (waitTimesArray.length > 0) {
      waitTimes.averageWait = waitTimesArray.reduce((a, b) => a + b, 0) / waitTimesArray.length;
    }
    
    if (totalTimesArray.length > 0) {
      waitTimes.averageTotal = totalTimesArray.reduce((a, b) => a + b, 0) / totalTimesArray.length;
    }
    
    if (waitTimes.shortest === Infinity) waitTimes.shortest = 0;
    
    // Calculate average wait by triage
    Object.keys(waitByTriage).forEach(key => {
      const level = Number(key) as TriageLevel;
      const times = waitByTriage[level];
      if (times.length > 0) {
        waitTimes.byTriage[level] = {
          avg: times.reduce((a, b) => a + b, 0) / times.length,
          count: times.length
        };
      }
    });
    
    // Staff Workload
    const physicianMap = new Map<string, StaffStats>();
    const nurseMap = new Map<string, StaffStats>();
    
    patients.forEach(p => {
      // Physician stats
      if (p.doctor) {
        if (!physicianMap.has(p.doctor)) {
          physicianMap.set(p.doctor, {
            name: p.doctor,
            patientCount: 0,
            admissions: 0,
            discharges: 0,
            studies: {},
            patients: []
          });
        }
        const stats = physicianMap.get(p.doctor)!;
        stats.patientCount++;
        stats.patients.push(getPatientSummary(p));
        
        if (p.admission) stats.admissions++;
        if (p.processState === 'discharged') stats.discharges++;
        
        // Count studies for this physician
        p.stickerNotes?.forEach(note => {
          if (note.type === 'study') {
            stats.studies[note.text] = (stats.studies[note.text] || 0) + 1;
          }
        });
      }
      
      // Nurse stats
      if (p.nurse) {
        if (!nurseMap.has(p.nurse)) {
          nurseMap.set(p.nurse, {
            name: p.nurse,
            patientCount: 0,
            admissions: 0,
            discharges: 0,
            studies: {},
            patients: []
          });
        }
        const stats = nurseMap.get(p.nurse)!;
        stats.patientCount++;
        stats.patients.push(getPatientSummary(p));
        
        if (p.admission) stats.admissions++;
        if (p.processState === 'discharged') stats.discharges++;
      }
    });
    
    const physicianStats = Array.from(physicianMap.values())
      .sort((a, b) => b.patientCount - a.patientCount);
    const nurseStats = Array.from(nurseMap.values())
      .sort((a, b) => b.patientCount - a.patientCount);
    
    // Hourly Data
    const hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      arrivals: 0,
      discharges: 0
    }));
    
    patients.forEach(p => {
      const arrivalHour = new Date(p.arrivalTime).getHours();
      hourlyData[arrivalHour].arrivals++;
      
      if (p.dischargedAt) {
        const dischargeHour = new Date(p.dischargedAt).getHours();
        hourlyData[dischargeHour].discharges++;
      }
    });
    
    // Find peak hour
    let peakHour: number | null = null;
    let maxArrivals = 0;
    hourlyData.forEach(h => {
      if (h.arrivals > maxArrivals) {
        maxArrivals = h.arrivals;
        peakHour = h.hour;
      }
    });
    
    // Precaution Counts
    const precautionCounts: Record<string, number> = {};
    patients.forEach(p => {
      p.stickerNotes?.forEach(note => {
        if (note.type === 'precaution') {
          precautionCounts[note.text] = (precautionCounts[note.text] || 0) + 1;
        }
      });
    });
    
    // Location Counts
    const locationCounts: Record<string, number> = {};
    patients.forEach(p => {
      const loc = p.assignedBox || p.currentLocation || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    return {
      totalPatients,
      activePatients,
      admissions,
      discharges,
      transfers,
      admissionRate,
      dnwCount,
      followupCounts,
      triageDistribution,
      criticalCount,
      studiesCounts,
      totalStudies,
      waitTimes,
      physicianStats,
      nurseStats,
      peakHour,
      hourlyData,
      precautionCounts,
      locationCounts
    };
  }, [patients]);
}

// Utility function to format minutes to readable time
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}
