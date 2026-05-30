import { DayEntry, SleepQuality, Tag } from './types'

export function calcTotalSleepHours(entry: DayEntry): number {
  const bedtimeMinutes = timeToMinutes(entry.bedtime)
  const wakeTimeMinutes = timeToMinutes(entry.wakeTime)

  // Night sleep (bedtime might be before midnight, wake is after)
  let nightMinutes = wakeTimeMinutes - bedtimeMinutes
  if (nightMinutes < 0) nightMinutes += 24 * 60

  // Nap sleep
  const napMinutes = entry.naps.reduce((acc, nap) => {
    const start = timeToMinutes(nap.start)
    const end = timeToMinutes(nap.end)
    const diff = end - start
    return acc + (diff < 0 ? diff + 24 * 60 : diff)
  }, 0)

  return Math.round(((nightMinutes + napMinutes) / 60) * 10) / 10
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function qualityColor(quality: SleepQuality): string {
  switch (quality) {
    case 'boa': return '#7C3AED'
    case 'regular': return '#8B5CF6'
    case 'ruim': return '#A78BFA'
  }
}

export function qualityLabel(quality: SleepQuality): string {
  switch (quality) {
    case 'boa': return 'Boa'
    case 'regular': return 'Regular'
    case 'ruim': return 'Ruim'
  }
}

export function moodEmoji(mood: number): string {
  switch (mood) {
    case 1: return '😢'
    case 2: return '😕'
    case 3: return '😐'
    case 4: return '🙂'
    case 5: return '😊'
    default: return '😐'
  }
}

export function avgSleepHours(entries: DayEntry[]): number {
  if (!entries.length) return 0
  const total = entries.reduce((acc, e) => acc + calcTotalSleepHours(e), 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function avgNightWakings(entries: DayEntry[]): number {
  if (!entries.length) return 0
  const total = entries.reduce((acc, e) => acc + e.nightWakings, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function avgNaps(entries: DayEntry[]): number {
  if (!entries.length) return 0
  const total = entries.reduce((acc, e) => acc + e.naps.length, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function avgBedtime(entries: DayEntry[]): string {
  if (!entries.length) return '--:--'
  const total = entries.reduce((acc, e) => acc + timeToMinutes(e.bedtime), 0)
  return minutesToTime(Math.round(total / entries.length))
}

export function calcTagCorrelation(
  entries: DayEntry[],
  tag: Tag
): { withTag: number; withoutTag: number; count: number } {
  const withTagEntries = entries.filter((e) => e.tags.includes(tag))
  const withoutTagEntries = entries.filter((e) => !e.tags.includes(tag))

  const qualityScore = (q: SleepQuality) => {
    switch (q) {
      case 'boa': return 3
      case 'regular': return 2
      case 'ruim': return 1
    }
  }

  const avgScore = (es: DayEntry[]) => {
    if (!es.length) return 0
    return es.reduce((acc, e) => acc + qualityScore(e.quality), 0) / es.length
  }

  return {
    withTag: avgScore(withTagEntries),
    withoutTag: avgScore(withoutTagEntries),
    count: withTagEntries.length,
  }
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const days = Math.floor((now.getTime() - birth.getTime()) / 86400000)
  if (days < 0) return 'ainda não nasceu'
  if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
  return `${years}a ${rem}m`
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year!, month! - 1, day!)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function formatDateFull(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year!, month! - 1, day!)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
