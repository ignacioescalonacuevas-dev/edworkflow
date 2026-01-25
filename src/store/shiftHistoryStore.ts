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

export const useShiftHistoryStore = create<ShiftHistoryStore>()(
  persist(
    (set, get) => ({
      history: {},
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
