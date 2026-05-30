import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BabyProfile } from './types'

interface BabyStore {
  babies: BabyProfile[]
  activeBabyId: string | null
  addBaby: (baby: BabyProfile) => void
  updateBaby: (id: string, baby: BabyProfile) => void
  deleteBaby: (id: string) => void
  setActiveBaby: (id: string) => void
  getActiveBaby: () => BabyProfile | undefined
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      babies: [],
      activeBabyId: null,

      addBaby: (baby) =>
        set((state) => ({
          babies: [...state.babies, baby],
          activeBabyId: state.activeBabyId ?? baby.id,
        })),

      updateBaby: (id, baby) =>
        set((state) => ({
          babies: state.babies.map((b) => (b.id === id ? baby : b)),
        })),

      deleteBaby: (id) =>
        set((state) => {
          const remaining = state.babies.filter((b) => b.id !== id)
          return {
            babies: remaining,
            activeBabyId:
              state.activeBabyId === id
                ? (remaining[0]?.id ?? null)
                : state.activeBabyId,
          }
        }),

      setActiveBaby: (id) => set({ activeBabyId: id }),

      getActiveBaby: () => {
        const { babies, activeBabyId } = get()
        return babies.find((b) => b.id === activeBabyId)
      },
    }),
    { name: 'sleepbaby-profiles' }
  )
)
