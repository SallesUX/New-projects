import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSleepStore } from '../store'
import { useBabyStore } from '../babyStore'
import { calcTotalSleepHours, qualityColor, qualityLabel, formatDate, moodEmoji } from '../utils'
import { SleepQuality, Tag, TAG_LABELS, TAG_EMOJIS } from '../types'

export default function History() {
  const { entries: allEntries, deleteEntry } = useSleepStore()
  const { activeBabyId, babies } = useBabyStore()
  const babyMap = useMemo(
    () => Object.fromEntries(babies.map((b) => [b.id, b])),
    [babies]
  )
  const navigate = useNavigate()

  const entries = useMemo(
    () => activeBabyId
      ? allEntries.filter((e) => e.babyId === activeBabyId)
      : allEntries,
    [allEntries, activeBabyId]
  )
  const [filterQuality, setFilterQuality] = useState<SleepQuality | 'all'>('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = entries.filter(
    (e) => filterQuality === 'all' || e.quality === filterQuality
  )

  if (!entries.length) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg, #C4A4F5, #EDE9FA)' }}>
          📋
        </div>
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-1">Nenhum registro ainda</p>
          <p className="text-text-secondary text-sm">Comece registrando o sono de hoje</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/registrar')}>
          Registrar primeiro dia
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-text-primary">Histórico</h2>
        <span className="text-xs text-text-muted font-medium bg-white px-3 py-1 rounded-full flex-shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(124,58,237,0.08)' }}>
          {entries.length}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([
          { value: 'all', label: 'Todos' },
          { value: 'boa', label: 'Boa' },
          { value: 'regular', label: 'Regular' },
          { value: 'ruim', label: 'Ruim' },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterQuality(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              filterQuality === value
                ? 'bg-brand-purple text-white'
                : 'bg-white text-text-secondary hover:text-brand-purple'
            }`}
            style={{
              boxShadow: filterQuality === value
                ? '0 2px 8px rgba(124,58,237,0.30)'
                : '0 1px 4px rgba(124,58,237,0.08)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((entry) => {
          const totalHours = calcTotalSleepHours(entry)
          const isConfirming = confirmDelete === entry.id

          return (
            <div key={entry.id} className="card space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: qualityColor(entry.quality) }}
                  />
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {formatDate(entry.date)}
                  </span>
                  {babies.length > 1 && entry.babyId && babyMap[entry.babyId] && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: babyMap[entry.babyId]!.sex === 'girl'
                          ? 'rgba(124,58,237,0.10)' : 'rgba(59,130,246,0.10)',
                        color: babyMap[entry.babyId]!.sex === 'girl' ? '#7C3AED' : '#3B82F6',
                      }}
                    >
                      {babyMap[entry.babyId]!.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-lg">{moodEmoji(entry.mood)}</span>
                  <button
                    onClick={() => navigate(`/registrar/${entry.date}`)}
                    className="text-sm text-text-muted hover:text-brand-purple transition-colors p-1"
                  >
                    ✏️
                  </button>
                  {isConfirming ? (
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          deleteEntry(entry.id)
                          setConfirmDelete(null)
                        }}
                        className="text-xs text-brand-coral font-semibold hover:text-brand-coral-light transition-colors"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(entry.id)}
                      className="text-sm text-text-muted hover:text-brand-coral transition-colors p-1"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <StatChip icon="💤" value={`${totalHours}h`} label="sono" />
                <StatChip
                  icon="🌙"
                  value={entry.nightWakings.toString()}
                  label={entry.nightWakings === 1 ? 'despertar' : 'despertares'}
                />
                <StatChip
                  icon="☁️"
                  value={entry.naps.length.toString()}
                  label={entry.naps.length === 1 ? 'soneca' : 'sonecas'}
                />
                <div className="ml-auto">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: qualityColor(entry.quality) + '18',
                      color: qualityColor(entry.quality),
                    }}
                  >
                    {qualityLabel(entry.quality)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-surface-100 text-text-secondary px-2.5 py-1 rounded-full font-medium"
                    >
                      {TAG_EMOJIS[tag as Tag]} {TAG_LABELS[tag as Tag]}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {entry.description && (
                <p className="text-xs text-text-muted line-clamp-2">{entry.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatChip({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span>{icon}</span>
      <span className="font-semibold text-text-primary">{value}</span>
      <span className="text-text-muted">{label}</span>
    </div>
  )
}
