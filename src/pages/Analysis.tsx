import { useMemo } from 'react'
import { useSleepStore } from '../store'
import { calcTagCorrelation, avgSleepHours, avgNightWakings, qualityColor } from '../utils'
import { Tag, TAG_LABELS, TAG_EMOJIS, SleepQuality } from '../types'

const ALL_TAGS: Tag[] = [
  'viagem', 'saida_de_casa', 'visita_de_pessoas', 'vacina', 'doenca', 'denticao', 'mudanca_de_rotina',
]

function scoreToLabel(score: number): { label: SleepQuality; color: string } {
  if (score >= 2.5) return { label: 'boa', color: '#7C3AED' }
  if (score >= 1.8) return { label: 'regular', color: '#8B5CF6' }
  return { label: 'ruim', color: '#A78BFA' }
}

function ScoreBar({ score }: { score: number }) {
  const pct = ((score - 1) / 2) * 100
  const { color } = scoreToLabel(score)
  return (
    <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(5, pct)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function Analysis() {
  const { entries } = useSleepStore()

  const correlations = useMemo(
    () =>
      ALL_TAGS.map((tag) => ({
        tag,
        ...calcTagCorrelation(entries, tag),
      })).filter((c) => c.count > 0),
    [entries]
  )

  const normalEntries = useMemo(
    () => entries.filter((e) => e.tags.length === 0),
    [entries]
  )

  const taggedEntries = useMemo(
    () => entries.filter((e) => e.tags.length > 0),
    [entries]
  )

  const summary = useMemo(() => generateSummary(entries, correlations), [entries, correlations])

  if (entries.length < 3) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}>
          📊
        </div>
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-1">Poucos dados ainda</p>
          <p className="text-text-secondary text-sm">
            Registre pelo menos 3 dias para ver a análise de padrões.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-extrabold text-text-primary">Análise de padrões</h2>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-text-secondary font-medium mb-1">Dias sem eventos</p>
          <p className="text-3xl font-extrabold text-brand-purple">{normalEntries.length}</p>
          <p className="text-xs text-text-muted mt-1">
            Média: {avgSleepHours(normalEntries)}h sono
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-text-secondary font-medium mb-1">Dias com eventos</p>
          <p className="text-3xl font-extrabold text-brand-purple-light">{taggedEntries.length}</p>
          <p className="text-xs text-text-muted mt-1">
            Média: {avgSleepHours(taggedEntries)}h sono
          </p>
        </div>
      </div>

      {/* Correlation table */}
      {correlations.length > 0 ? (
        <section>
          <p className="section-title">Impacto dos eventos no sono</p>
          <div className="card space-y-4">
            <div className="grid grid-cols-12 text-xs text-text-muted font-medium pb-2"
              style={{ borderBottom: '1px solid #EBE7FF' }}>
              <div className="col-span-4">Evento</div>
              <div className="col-span-2 text-center">Ocorr.</div>
              <div className="col-span-3 text-center">Com evento</div>
              <div className="col-span-3 text-center">Sem evento</div>
            </div>
            {correlations.map(({ tag, count, withTag, withoutTag }) => {
              const withInfo = scoreToLabel(withTag)
              const withoutInfo = scoreToLabel(withoutTag)
              const diff = withTag - withoutTag
              return (
                <div key={tag} className="space-y-1.5">
                  <div className="grid grid-cols-12 text-sm items-center">
                    <div className="col-span-4 flex items-center gap-1.5">
                      <span className="text-base">{TAG_EMOJIS[tag]}</span>
                      <span className="text-xs text-text-primary font-medium leading-tight">{TAG_LABELS[tag]}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs text-text-secondary font-medium">{count}x</span>
                    </div>
                    <div className="col-span-3 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold" style={{ color: withInfo.color }}>
                        {withInfo.label}
                      </span>
                      <ScoreBar score={withTag} />
                    </div>
                    <div className="col-span-3 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold" style={{ color: withoutInfo.color }}>
                        {withoutInfo.label}
                      </span>
                      <ScoreBar score={withoutTag} />
                    </div>
                  </div>
                  <div className="pl-7">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: diff < -0.3 ? 'rgba(167,139,250,0.15)' : diff > 0.3 ? 'rgba(124,58,237,0.12)' : 'rgba(139,92,246,0.12)',
                        color: diff < -0.3 ? '#A78BFA' : diff > 0.3 ? '#7C3AED' : '#8B5CF6',
                      }}
                    >
                      {diff < -0.3
                        ? `▼ Piora o sono em ${Math.abs(diff).toFixed(1)} pontos`
                        : diff > 0.3
                        ? `▲ Melhora o sono em ${diff.toFixed(1)} pontos`
                        : '~ Impacto neutro'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="card text-center py-8">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-text-secondary text-sm">
            Registre dias com diferentes eventos para ver correlações.
          </p>
        </div>
      )}

      {/* Quality distribution */}
      <section>
        <p className="section-title">Distribuição de qualidade</p>
        <QualityDistribution entries={entries} />
      </section>

      {/* Summary */}
      <section>
        <p className="section-title">Resumo dos padrões</p>
        <div className="card space-y-3">
          {summary.map((line, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0">{line.icon}</span>
              <p className="text-sm text-text-secondary leading-relaxed">{line.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function QualityDistribution({ entries }: { entries: ReturnType<typeof useSleepStore>['entries'] }) {
  const total = entries.length
  const counts = {
    boa: entries.filter((e) => e.quality === 'boa').length,
    regular: entries.filter((e) => e.quality === 'regular').length,
    ruim: entries.filter((e) => e.quality === 'ruim').length,
  }
  const items = [
    { label: 'Boa', key: 'boa' as const, color: '#7C3AED' },
    { label: 'Regular', key: 'regular' as const, color: '#8B5CF6' },
    { label: 'Ruim', key: 'ruim' as const, color: '#A78BFA' },
  ]
  return (
    <div className="card space-y-4">
      {items.map(({ label, key, color }) => {
        const pct = total ? Math.round((counts[key] / total) * 100) : 0
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold" style={{ color }}>{label}</span>
              <span className="text-text-muted">{counts[key]} noites ({pct}%)</span>
            </div>
            <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function generateSummary(
  entries: ReturnType<typeof useSleepStore>['entries'],
  correlations: { tag: Tag; count: number; withTag: number; withoutTag: number }[]
): { icon: string; text: string }[] {
  const lines: { icon: string; text: string }[] = []
  if (!entries.length) return lines

  const avgSleep = avgSleepHours(entries)
  const avgWakings = avgNightWakings(entries)

  lines.push({
    icon: '💤',
    text: `A bebê dorme em média ${avgSleep}h por dia (noite + sonecas), com ${avgWakings} despertar${avgWakings !== 1 ? 'es' : ''} por noite.`,
  })

  const worstTag = correlations
    .filter((c) => c.withoutTag > 0)
    .sort((a, b) => (a.withTag - a.withoutTag) - (b.withTag - b.withoutTag))[0]

  if (worstTag && worstTag.withTag - worstTag.withoutTag < -0.4) {
    lines.push({
      icon: '⚠️',
      text: `Noites com ${TAG_LABELS[worstTag.tag].toLowerCase()} tendem a ser mais difíceis — planeje descanso extra nesses dias.`,
    })
  }

  const bestTag = correlations
    .filter((c) => c.withoutTag > 0)
    .sort((a, b) => (b.withTag - b.withoutTag) - (a.withTag - a.withoutTag))[0]

  if (bestTag && bestTag.withTag - bestTag.withoutTag > 0.3) {
    lines.push({
      icon: '✅',
      text: `Surpreendentemente, noites com ${TAG_LABELS[bestTag.tag].toLowerCase()} têm sono de melhor qualidade.`,
    })
  }

  const goodPct = Math.round(
    (entries.filter((e) => e.quality === 'boa').length / entries.length) * 100
  )
  if (goodPct >= 60) {
    lines.push({
      icon: '🌟',
      text: `${goodPct}% das noites foram avaliadas como boas — excelente resultado!`,
    })
  } else if (goodPct <= 30) {
    lines.push({
      icon: '🔍',
      text: `Apenas ${goodPct}% das noites foram boas. Analise os eventos mais frequentes e tente isolar causas.`,
    })
  }

  const normalEntries = entries.filter((e) => e.tags.length === 0)
  const taggedEntries = entries.filter((e) => e.tags.length > 0)
  if (normalEntries.length >= 3 && taggedEntries.length >= 3) {
    const diffSleep = avgSleepHours(normalEntries) - avgSleepHours(taggedEntries)
    if (Math.abs(diffSleep) >= 0.5) {
      lines.push({
        icon: diffSleep > 0 ? '📊' : '📉',
        text:
          diffSleep > 0
            ? `Dias sem eventos especiais têm ${diffSleep.toFixed(1)}h a mais de sono que dias com eventos.`
            : `Curiosamente, dias com eventos têm ${Math.abs(diffSleep).toFixed(1)}h a mais de sono que dias normais.`,
      })
    }
  }

  if (lines.length <= 2) {
    lines.push({
      icon: '📝',
      text: 'Continue registrando para obter análises mais detalhadas e precisas.',
    })
  }

  return lines
}
