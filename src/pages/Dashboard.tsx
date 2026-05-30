import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useSleepStore } from '../store'
import { useBabyStore } from '../babyStore'
import {
  calcTotalSleepHours, avgSleepHours, avgNightWakings, avgNaps, avgBedtime,
  qualityColor, qualityLabel, formatDate, moodEmoji,
} from '../utils'
import { DayEntry, Tag, TAG_EMOJIS } from '../types'

export default function Dashboard() {
  const { entries: allEntries } = useSleepStore()
  const { activeBabyId, babies } = useBabyStore()
  const navigate = useNavigate()

  const entries = useMemo(
    () => activeBabyId
      ? allEntries.filter((e) => e.babyId === activeBabyId)
      : allEntries,
    [allEntries, activeBabyId]
  )

  const last7 = useMemo(
    () => entries.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(-7),
    [entries]
  )

  const chartData = useMemo(
    () => last7.map((e) => ({
      date: formatDate(e.date),
      hours: calcTotalSleepHours(e),
      quality: e.quality,
      color: qualityColor(e.quality),
    })),
    [last7]
  )

  const allMetrics = useMemo(() => {
    const recent = entries.slice(0, 30)
    return {
      avgSleep: avgSleepHours(recent),
      avgWakings: avgNightWakings(recent),
      avgNapsCount: avgNaps(recent),
      avgBed: avgBedtime(recent),
    }
  }, [entries])

  const patterns = useMemo(() => detectPatterns(entries), [entries])

  const header = (
    <div className="flex flex-col items-center pt-10 pb-5 px-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
      >
        🌙
      </div>
      <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">SleepBaby</h1>
    </div>
  )

  if (babies.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 pb-10">
        {header}
        <div className="text-center mt-4 mb-6">
          <p className="text-text-primary font-semibold mb-1">Nenhum perfil cadastrado</p>
          <p className="text-text-secondary text-sm">Crie o perfil da sua bebê para começar</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/perfil')}>
          Criar perfil
        </button>
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center px-6 pb-10">
        {header}
        <div className="text-center mt-4 mb-6">
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
    <div className="space-y-0">
      {header}

      <div className="px-4 pb-2 space-y-4">
        <p className="section-title">Médias dos últimos 30 dias</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Sono total"
            value={`${allMetrics.avgSleep}h`}
            icon="💤"
            positive={allMetrics.avgSleep >= 12}
          />
          <MetricCard
            label="Despertares"
            value={allMetrics.avgWakings.toString()}
            icon="🌙"
            positive={allMetrics.avgWakings <= 2}
            suffix="/noite"
          />
          <MetricCard
            label="Sonecas"
            value={allMetrics.avgNapsCount.toString()}
            icon="☁️"
            positive
            suffix="/dia"
          />
          <MetricCard
            label="Hora de dormir"
            value={allMetrics.avgBed}
            icon="🛏️"
            positive={timeIsEarly(allMetrics.avgBed)}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Chart */}
        <section>
          <p className="section-title">Horas de sono — últimos 7 dias</p>
          <div className="card">
            <div className="flex gap-4 mb-3 text-xs">
              {(['boa', 'regular', 'ruim'] as const).map((q) => (
                <span key={q} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: qualityColor(q) }} />
                  <span className="text-text-secondary">{qualityLabel(q)}</span>
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FA" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9B8EC4', fontSize: 10, fontFamily: 'Poppins' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9B8EC4', fontSize: 10, fontFamily: 'Poppins' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'dataMax + 2']}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DDD6FE',
                    borderRadius: 12,
                    color: '#1A1A2E',
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgba(124,58,237,0.12)',
                  }}
                  formatter={(value) => [`${value}h`, 'Sono']}
                  labelStyle={{ color: '#9B8EC4' }}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Patterns */}
        {patterns.length > 0 && (
          <section>
            <p className="section-title">Padrões identificados</p>
            <div className="space-y-2">
              {patterns.map((p, i) => (
                <PatternCard key={i} {...p} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section>
          <p className="section-title">Registros recentes</p>
          <div className="space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <RecentEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function MetricCard({
  label, value, icon, positive, suffix,
}: {
  label: string
  value: string
  icon: string
  positive: boolean
  suffix?: string
}) {
  return (
    <div className="card flex flex-col gap-1.5">
      <span className="text-xl">{icon}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-extrabold"
          style={{ color: positive ? '#7C3AED' : '#A78BFA' }}
        >
          {value}
        </span>
        {suffix && <span className="text-xs text-text-muted">{suffix}</span>}
      </div>
      <span className="text-xs text-text-secondary font-medium">{label}</span>
    </div>
  )
}

function RecentEntryRow({ entry }: { entry: DayEntry }) {
  const totalHours = calcTotalSleepHours(entry)
  return (
    <div className="card flex items-center gap-3">
      <div
        className="w-1.5 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: qualityColor(entry.quality) }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{formatDate(entry.date)}</span>
          {entry.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-xs">{TAG_EMOJIS[t as Tag]}</span>
          ))}
        </div>
        <div className="text-xs text-text-secondary mt-0.5">
          {totalHours}h · {entry.nightWakings} despertar{entry.nightWakings !== 1 ? 'es' : ''}
        </div>
      </div>
      <span className="text-lg">{moodEmoji(entry.mood)}</span>
    </div>
  )
}

function PatternCard({ icon, title, description, positive }: {
  icon: string
  title: string
  description: string
  positive: boolean
}) {
  return (
    <div
      className="card border-l-4"
      style={{ borderLeftColor: positive ? '#7C3AED' : '#A78BFA' }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  )
}

function timeIsEarly(time: string): boolean {
  const [h] = time.split(':').map(Number)
  return (h ?? 0) <= 20
}

interface Pattern {
  icon: string
  title: string
  description: string
  positive: boolean
}

function detectPatterns(entries: DayEntry[]): Pattern[] {
  const patterns: Pattern[] = []
  if (entries.length < 5) return patterns

  const recent = entries.slice(0, 14)

  const travelEntries = recent.filter((e) => e.tags.includes('viagem'))
  if (travelEntries.length >= 1) {
    const travelAvgWakings = travelEntries.reduce((a, e) => a + e.nightWakings, 0) / travelEntries.length
    const normalEntries = recent.filter((e) => !e.tags.includes('viagem') && e.tags.length === 0)
    const normalAvgWakings = normalEntries.length
      ? normalEntries.reduce((a, e) => a + e.nightWakings, 0) / normalEntries.length
      : 0
    if (travelAvgWakings > normalAvgWakings + 1) {
      patterns.push({
        icon: '✈️',
        title: 'Viagens afetam o sono',
        description: `Noites com viagem têm ${(travelAvgWakings - normalAvgWakings).toFixed(1)} despertares a mais.`,
        positive: false,
      })
    }
  }

  const vaccineEntries = recent.filter((e) => e.tags.includes('vacina'))
  if (vaccineEntries.length >= 1) {
    const badNights = vaccineEntries.filter((e) => e.quality === 'ruim').length
    if (badNights / vaccineEntries.length >= 0.5) {
      patterns.push({
        icon: '💉',
        title: 'Vacinas causam noites difíceis',
        description: `${Math.round((badNights / vaccineEntries.length) * 100)}% das noites pós-vacina foram ruins.`,
        positive: false,
      })
    }
  }

  let streak = 0
  for (const e of entries) {
    if (e.quality === 'boa') streak++
    else break
  }
  if (streak >= 3) {
    patterns.push({
      icon: '🌟',
      title: `${streak} noites boas seguidas`,
      description: 'A rotina está funcionando bem! Mantenha o padrão.',
      positive: true,
    })
  }

  const teethingEntries = recent.filter((e) => e.tags.includes('denticao'))
  if (teethingEntries.length >= 2) {
    const teethAvg = teethingEntries.reduce((a, e) => a + e.nightWakings, 0) / teethingEntries.length
    if (teethAvg >= 3) {
      patterns.push({
        icon: '🦷',
        title: 'Dentição perturbando o sono',
        description: `Média de ${teethAvg.toFixed(1)} despertares nas noites com dentição.`,
        positive: false,
      })
    }
  }

  const earlyBed = recent.filter((e) => {
    const [h] = e.bedtime.split(':').map(Number)
    return (h ?? 0) <= 19
  })
  if (earlyBed.length >= 3) {
    const earlyQuality = earlyBed.filter((e) => e.quality === 'boa').length / earlyBed.length
    if (earlyQuality >= 0.7) {
      patterns.push({
        icon: '🌙',
        title: 'Horário cedo melhora o sono',
        description: `${Math.round(earlyQuality * 100)}% das noites com dormir antes das 19h são boas.`,
        positive: true,
      })
    }
  }

  return patterns.slice(0, 4)
}
