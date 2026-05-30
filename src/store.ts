import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DayEntry } from './types'
import { sampleData } from './sampleData'

interface SleepStore {
  entries: DayEntry[]
  addEntry: (entry: DayEntry) => void
  updateEntry: (id: string, entry: DayEntry) => void
  deleteEntry: (id: string) => void
  getEntryByDate: (date: string) => DayEntry | undefined
  resetEntries: () => void
  loadSampleData: () => void
  claimEntriesForBaby: (babyId: string) => void
}

export const useSleepStore = create<SleepStore>()(
  persist(
    (set, get) => ({
      entries: sampleData,

      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, entry].sort((a, b) =>
            b.date.localeCompare(a.date)
          ),
        })),

      updateEntry: (id, updatedEntry) =>
        set((state) => ({
          entries: state.entries
            .map((e) => (e.id === id ? updatedEntry : e))
            .sort((a, b) => b.date.localeCompare(a.date)),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      getEntryByDate: (date) => get().entries.find((e) => e.date === date),

      resetEntries: () => set({ entries: [] }),

      loadSampleData: () => set({ entries: sampleData }),

      claimEntriesForBaby: (babyId) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.babyId ? e : { ...e, babyId })),
        })),
    }),
    {
      name: 'sono-bebe-data',
    }
  )
)
