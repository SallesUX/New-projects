export type SleepQuality = 'boa' | 'regular' | 'ruim'

export type Tag =
  | 'viagem'
  | 'saida_de_casa'
  | 'visita_de_pessoas'
  | 'vacina'
  | 'doenca'
  | 'denticao'
  | 'mudanca_de_rotina'

export interface Nap {
  id: string
  start: string // HH:MM
  end: string   // HH:MM
}

export interface DayEntry {
  id: string
  babyId?: string         // which baby this entry belongs to
  date: string           // ISO date YYYY-MM-DD
  description: string
  tags: Tag[]
  naps: Nap[]
  bedtime: string        // HH:MM
  wakeTime: string       // HH:MM
  nightWakings: number
  quality: SleepQuality
  mood: number           // 1-5
}

export const TAG_LABELS: Record<Tag, string> = {
  viagem: 'Viagem',
  saida_de_casa: 'Saída de casa',
  visita_de_pessoas: 'Visita de pessoas',
  vacina: 'Vacina',
  doenca: 'Doença',
  denticao: 'Dentição',
  mudanca_de_rotina: 'Mudança de rotina',
}

export const TAG_EMOJIS: Record<Tag, string> = {
  viagem: '✈️',
  saida_de_casa: '🚗',
  visita_de_pessoas: '👥',
  vacina: '💉',
  doenca: '🤒',
  denticao: '🦷',
  mudanca_de_rotina: '🔄',
}

// ─── Baby profiles ───────────────────────────────────────────────────────────

export type BabySex = 'girl' | 'boy'

export type BabyCondition =
  | 'autism'
  | 'adhd'
  | 'down'
  | 'premature'
  | 'reflux'
  | 'other'

export interface BabyProfile {
  id: string
  name: string
  birthDate: string  // YYYY-MM-DD
  sex: BabySex
  conditions: BabyCondition[]
  conditionOther?: string
  createdAt: string
}

export const CONDITION_LABELS: Record<BabyCondition, string> = {
  autism: 'TEA / Autismo',
  adhd: 'TDAH',
  down: 'S. de Down',
  premature: 'Prematuridade',
  reflux: 'Refluxo',
  other: 'Outra',
}

export const CONDITION_COLORS: Record<BabyCondition, { bg: string; text: string }> = {
  autism:    { bg: '#F3E8FF', text: '#7C3AED' },
  adhd:      { bg: '#FEF3C7', text: '#92400E' },
  down:      { bg: '#DBEAFE', text: '#1D4ED8' },
  premature: { bg: '#FCE7F3', text: '#9D174D' },
  reflux:    { bg: '#D1FAE5', text: '#065F46' },
  other:     { bg: '#F3F4F6', text: '#4B5563' },
}
