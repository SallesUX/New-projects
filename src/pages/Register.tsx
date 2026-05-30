import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSleepStore } from '../store'
import { useBabyStore } from '../babyStore'
import { DayEntry, Nap, SleepQuality, Tag, TAG_LABELS, TAG_EMOJIS } from '../types'
import { generateId, formatDateFull, calculateAge } from '../utils'

const ALL_TAGS: Tag[] = [
  'viagem', 'saida_de_casa', 'visita_de_pessoas', 'vacina', 'doenca', 'denticao', 'mudanca_de_rotina',
]

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Register() {
  const navigate = useNavigate()
  const { date: paramDate } = useParams<{ date: string }>()
  const { addEntry, updateEntry, getEntryByDate } = useSleepStore()
  const { activeBabyId, babies, setActiveBaby } = useBabyStore()
  const activeBaby = babies.find((b) => b.id === activeBabyId) ?? babies[0]

  const [date, setDate] = useState(paramDate ?? todayStr())
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [naps, setNaps] = useState<Nap[]>([{ id: generateId(), start: '09:30', end: '11:00' }])
  const [bedtime, setBedtime] = useState('19:30')
  const [wakeTime, setWakeTime] = useState('06:30')
  const [nightWakings, setNightWakings] = useState(1)
  const [quality, setQuality] = useState<SleepQuality>('boa')
  const [mood, setMood] = useState(4)
  const [showBabyPicker, setShowBabyPicker] = useState(false)

  const existingEntry = getEntryByDate(date)
  const isEditing = !!existingEntry

  useEffect(() => {
    if (existingEntry) {
      setDescription(existingEntry.description)
      setTags(existingEntry.tags)
      setNaps(existingEntry.naps)
      setBedtime(existingEntry.bedtime)
      setWakeTime(existingEntry.wakeTime)
      setNightWakings(existingEntry.nightWakings)
      setQuality(existingEntry.quality)
      setMood(existingEntry.mood)
    }
  }, [date])

  function toggleTag(tag: Tag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function addNap() {
    setNaps((prev) => [...prev, { id: generateId(), start: '14:00', end: '15:30' }])
  }

  function removeNap(id: string) {
    setNaps((prev) => prev.filter((n) => n.id !== id))
  }

  function updateNap(id: string, field: 'start' | 'end', value: string) {
    setNaps((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const entry: DayEntry = {
      id: existingEntry?.id ?? generateId(),
      babyId: activeBabyId ?? undefined,
      date, description, tags, naps, bedtime, wakeTime, nightWakings, quality, mood,
    }
    if (isEditing) {
      updateEntry(entry.id, entry)
    } else {
      addEntry(entry)
    }
    navigate('/')
  }

  if (babies.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-5 text-center">
        <span className="text-4xl">👶</span>
        <div>
          <p className="text-text-primary font-semibold mb-1">Nenhum perfil cadastrado</p>
          <p className="text-text-secondary text-sm">Crie o perfil da sua bebê antes de registrar o sono.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/perfil')}>
          Criar perfil
        </button>
      </div>
    )
  }

  const qualityOptions = [
    { value: 'boa' as const, label: 'Boa', emoji: '😊', color: '#7C3AED' },
    { value: 'regular' as const, label: 'Regular', emoji: '😐', color: '#8B5CF6' },
    { value: 'ruim' as const, label: 'Ruim', emoji: '😞', color: '#A78BFA' },
  ]

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-text-primary">
          {isEditing ? 'Editar registro' : 'Novo registro'}
        </h2>
        {isEditing && (
          <span className="text-xs text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full font-medium">
            Editando
          </span>
        )}
      </div>

      {/* Baby selector */}
      {activeBaby && (
        <div className="card">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2.5">
            Registrando para
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
              style={{ background: activeBaby.sex === 'girl' ? '#7C3AED' : '#3B82F6' }}
            >
              {activeBaby.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-text-primary leading-tight">{activeBaby.name}</p>
              <p className="text-xs text-text-secondary">{calculateAge(activeBaby.birthDate)}</p>
            </div>
            {babies.length > 1 && (
              <button
                type="button"
                onClick={() => setShowBabyPicker(true)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.10)', color: '#7C3AED' }}
              >
                Trocar
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Baby picker modal */}
      {showBabyPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(26,26,46,0.50)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowBabyPicker(false) }}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-[28px]"
            style={{ boxShadow: '0 -8px 40px rgba(124,58,237,0.16)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-surface-200" />
            </div>
            <div className="px-5 pt-2 pb-6">
              <h3 className="text-base font-extrabold text-text-primary mb-4">Selecionar bebê</h3>
              <div className="space-y-2">
                {babies.map((baby) => (
                  <button
                    key={baby.id}
                    type="button"
                    onClick={() => { setActiveBaby(baby.id); setShowBabyPicker(false) }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all"
                    style={
                      baby.id === activeBabyId
                        ? { background: 'rgba(124,58,237,0.08)', border: '1.5px solid #DDD6FE' }
                        : { background: '#F5F8FF', border: '1.5px solid transparent' }
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                      style={{ background: baby.sex === 'girl' ? '#7C3AED' : '#3B82F6' }}
                    >
                      {baby.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-text-primary">{baby.name}</p>
                      <p className="text-xs text-text-secondary">{calculateAge(baby.birthDate)}</p>
                    </div>
                    {baby.id === activeBabyId && (
                      <span className="text-brand-purple font-bold text-sm flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowBabyPicker(false)}
                className="btn-secondary w-full mt-4"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
        {date && (
          <p className="text-xs text-text-muted mt-1.5 capitalize">{formatDateFull(date)}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Como foi o dia?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o dia da bebê, eventos especiais, comportamentos..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Eventos do dia
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`tag-btn ${tags.includes(tag) ? 'tag-active' : 'tag-inactive'}`}
            >
              {TAG_EMOJIS[tag]} {TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {/* Naps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Sonecas</label>
          <button type="button" onClick={addNap} className="text-xs text-brand-purple font-semibold hover:text-brand-purple-light transition-colors">
            + Adicionar
          </button>
        </div>
        {naps.length === 0 ? (
          <p className="text-xs text-text-muted py-2">Nenhuma soneca registrada.</p>
        ) : (
          <div className="space-y-2">
            {naps.map((nap, i) => (
              <div key={nap.id} className="card flex items-center gap-2">
                <span className="text-xs text-text-muted font-medium w-12 flex-shrink-0">Soneca {i + 1}</span>
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <input
                    type="time"
                    value={nap.start}
                    onChange={(e) => updateNap(nap.id, 'start', e.target.value)}
                    className="flex-1 min-w-0 bg-white rounded-xl px-2 py-2 text-sm text-text-primary focus:outline-none transition-all"
                    style={{ border: '1.5px solid #DDD6FE' }}
                  />
                  <span className="text-text-muted text-xs font-medium flex-shrink-0">até</span>
                  <input
                    type="time"
                    value={nap.end}
                    onChange={(e) => updateNap(nap.id, 'end', e.target.value)}
                    className="flex-1 min-w-0 bg-white rounded-xl px-2 py-2 text-sm text-text-primary focus:outline-none transition-all"
                    style={{ border: '1.5px solid #DDD6FE' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNap(nap.id)}
                  className="text-text-muted hover:text-brand-coral transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Night sleep */}
      <div className="card space-y-4">
        <h3 className="text-sm font-bold text-text-primary">🌙 Sono noturno</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary font-medium mb-1.5">Foi dormir</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary font-medium mb-1.5">Acordou</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-secondary font-medium mb-2">
            Vezes que acordou à noite:{' '}
            <span className="text-brand-purple font-bold">{nightWakings}</span>
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={nightWakings}
            onChange={(e) => setNightWakings(Number(e.target.value))}
            className="w-full accent-brand-purple"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Quality */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Qualidade da noite
        </label>
        <div className="grid grid-cols-3 gap-2">
          {qualityOptions.map(({ value, label, emoji, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setQuality(value)}
              className={`card flex flex-col items-center gap-1.5 py-4 border-2 transition-all duration-200 ${
                quality === value ? 'scale-105' : 'opacity-60'
              }`}
              style={{ borderColor: quality === value ? color : 'transparent' }}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-semibold" style={{ color: quality === value ? color : '#9B8EC4' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Humor ao acordar
        </label>
        <div className="flex gap-2 justify-between">
          {[
            { value: 1, emoji: '😢' },
            { value: 2, emoji: '😕' },
            { value: 3, emoji: '😐' },
            { value: 4, emoji: '🙂' },
            { value: 5, emoji: '😊' },
          ].map(({ value, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMood(value)}
              className={`flex-1 py-3 rounded-2xl text-2xl transition-all duration-200 ${
                mood === value
                  ? 'scale-110'
                  : 'opacity-40 hover:opacity-70'
              }`}
              style={{
                background: mood === value
                  ? 'linear-gradient(135deg, #EDE9FA, #C4B5FD)'
                  : '#F5F3FF',
                boxShadow: mood === value
                  ? '0 4px 12px rgba(124,58,237,0.20)'
                  : 'none',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2 pb-2">
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          {isEditing ? 'Salvar alterações' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}
