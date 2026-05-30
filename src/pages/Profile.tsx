import { useState } from 'react'
import { useBabyStore } from '../babyStore'
import { useSleepStore } from '../store'
import {
  BabyProfile, BabySex, BabyCondition,
  CONDITION_LABELS, CONDITION_COLORS,
} from '../types'
import { generateId, calculateAge } from '../utils'

const ALL_CONDITIONS: BabyCondition[] = [
  'autism', 'adhd', 'down', 'premature', 'reflux', 'other',
]

function avatarColor(sex: BabySex) {
  return sex === 'girl' ? '#7C3AED' : '#3B82F6'
}

// ─── Baby card ────────────────────────────────────────────────────────────────

function BabyCard({
  baby, isActive, onActivate, onEdit, onDelete,
}: {
  baby: BabyProfile
  isActive: boolean
  onActivate: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <div
      className="card space-y-3 transition-all duration-200"
      style={isActive ? { borderLeft: '4px solid #7C3AED' } : { borderLeft: '4px solid transparent' }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0"
          style={{ background: avatarColor(baby.sex) }}
        >
          {baby.name[0]?.toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-text-primary truncate">{baby.name}</span>
            {isActive && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}
              >
                Ativo
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {baby.sex === 'girl' ? '👧 Menina' : '👦 Menino'}
            {' · '}
            {calculateAge(baby.birthDate)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-text-muted hover:text-brand-purple transition-colors rounded-lg"
          >
            ✏️
          </button>
          {confirmDel ? (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => { onDelete(); setConfirmDel(false) }}
                className="text-xs text-red-500 font-semibold"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-xs text-text-muted"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Condition badges */}
      {baby.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {baby.conditions.map((c) => (
            <span
              key={c}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: CONDITION_COLORS[c].bg, color: CONDITION_COLORS[c].text }}
            >
              {c === 'other' && baby.conditionOther
                ? baby.conditionOther
                : CONDITION_LABELS[c]}
            </span>
          ))}
        </div>
      )}

      {/* Activate button */}
      {!isActive && (
        <button
          onClick={onActivate}
          className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: 'rgba(124,58,237,0.08)',
            color: '#7C3AED',
          }}
        >
          Monitorar este bebê
        </button>
      )}
    </div>
  )
}

// ─── Baby form modal ──────────────────────────────────────────────────────────

function BabyFormModal({
  initial, onSave, onClose,
}: {
  initial: BabyProfile | null
  onSave: (baby: BabyProfile) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '')
  const [sex, setSex] = useState<BabySex>(initial?.sex ?? 'girl')
  const [conditions, setConditions] = useState<BabyCondition[]>(initial?.conditions ?? [])
  const [conditionOther, setConditionOther] = useState(initial?.conditionOther ?? '')

  function toggleCondition(c: BabyCondition) {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  function handleSave() {
    if (!name.trim() || !birthDate) return
    onSave({
      id: initial?.id ?? generateId(),
      name: name.trim(),
      birthDate,
      sex,
      conditions,
      conditionOther: conditions.includes('other') ? conditionOther : undefined,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  const isValid = name.trim().length > 0 && birthDate.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(26,26,46,0.50)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-[28px] flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 -8px 40px rgba(124,58,237,0.16)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-200" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-text-primary">
            {initial ? 'Editar bebê' : 'Novo bebê'}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary text-xl leading-none p-1">
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 pb-4 space-y-5 flex-1">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Nome do bebê
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sofia"
              className="input-field"
              autoFocus
            />
          </div>

          {/* Birth date */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Data de nascimento
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input-field"
            />
            {birthDate && (
              <p className="text-xs text-text-muted mt-1.5">
                Idade: <span className="font-semibold text-brand-purple">{calculateAge(birthDate)}</span>
              </p>
            )}
          </div>

          {/* Sex */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Sexo
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'girl' as const, label: 'Menina', emoji: '👧', color: '#7C3AED' },
                { value: 'boy' as const, label: 'Menino', emoji: '👦', color: '#3B82F6' },
              ]).map(({ value, label, emoji, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSex(value)}
                  className="card flex flex-col items-center gap-2 py-4 border-2 transition-all duration-200"
                  style={{
                    borderColor: sex === value ? color : 'transparent',
                    opacity: sex === value ? 1 : 0.5,
                  }}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: sex === value ? color : '#9B8EC4' }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
              Condições especiais
            </label>
            <p className="text-xs text-text-muted mb-3">Opcional — selecione quantas quiser</p>
            <div className="flex flex-wrap gap-2">
              {ALL_CONDITIONS.map((c) => {
                const selected = conditions.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                    style={
                      selected
                        ? { background: CONDITION_COLORS[c].bg, color: CONDITION_COLORS[c].text,
                            border: `1.5px solid ${CONDITION_COLORS[c].text}` }
                        : { background: 'white', color: '#9B8EC4', border: '1.5px solid #DDD6FE' }
                    }
                  >
                    {CONDITION_LABELS[c]}
                  </button>
                )
              })}
            </div>

            {conditions.includes('other') && (
              <input
                type="text"
                value={conditionOther}
                onChange={(e) => setConditionOther(e.target.value)}
                placeholder="Descreva a condição..."
                className="input-field mt-3"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pt-3 pb-6 flex gap-3" style={{ borderTop: '1px solid #EBE7FF' }}>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {initial ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Welcome screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
      >
        👶
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-text-primary mb-2">Bem-vinda!</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Cadastre o perfil da sua bebê para começar a monitorar o sono.
        </p>
      </div>
      <button className="btn-primary px-10" onClick={onAdd}>
        Criar primeiro perfil
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Profile() {
  const { babies, activeBabyId, setActiveBaby, deleteBaby, addBaby, updateBaby } = useBabyStore()
  const { claimEntriesForBaby } = useSleepStore()

  const [showForm, setShowForm] = useState(false)
  const [editingBaby, setEditingBaby] = useState<BabyProfile | null>(null)

  function openAdd() {
    setEditingBaby(null)
    setShowForm(true)
  }

  function openEdit(baby: BabyProfile) {
    setEditingBaby(baby)
    setShowForm(true)
  }

  function handleSave(baby: BabyProfile) {
    const isFirst = babies.length === 0
    if (editingBaby) {
      updateBaby(editingBaby.id, baby)
    } else {
      addBaby(baby)
      if (isFirst) {
        claimEntriesForBaby(baby.id)
      }
    }
    setShowForm(false)
    setEditingBaby(null)
  }

  if (babies.length === 0 && !showForm) {
    return (
      <>
        <WelcomeScreen onAdd={openAdd} />
        {showForm && (
          <BabyFormModal
            initial={null}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="p-4 pb-6 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-xl font-extrabold text-text-primary">Perfis</h2>
        <span
          className="text-xs text-text-muted font-medium bg-white px-3 py-1 rounded-full flex-shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(124,58,237,0.08)' }}
        >
          {babies.length} {babies.length === 1 ? 'bebê' : 'bebês'}
        </span>
      </div>

      <div className="space-y-3">
        {babies.map((baby) => (
          <BabyCard
            key={baby.id}
            baby={baby}
            isActive={baby.id === activeBabyId}
            onActivate={() => setActiveBaby(baby.id)}
            onEdit={() => openEdit(baby)}
            onDelete={() => deleteBaby(baby.id)}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full text-white text-2xl flex items-center justify-center shadow-btn transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
        aria-label="Adicionar bebê"
      >
        +
      </button>

      {showForm && (
        <BabyFormModal
          initial={editingBaby}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingBaby(null) }}
        />
      )}
    </div>
  )
}
