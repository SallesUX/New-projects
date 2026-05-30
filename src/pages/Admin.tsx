import { useState } from 'react'
import { useSleepStore } from '../store'

type ConfirmAction = 'reset' | 'loadSample' | null

export default function Admin() {
  const { entries, resetEntries, loadSampleData } = useSleepStore()
  const [pending, setPending] = useState<ConfirmAction>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const firstDate = sorted[0]?.date
  const lastDate = sorted[sorted.length - 1]?.date

  function formatDate(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  function confirm(action: ConfirmAction) {
    setPending(action)
    setFeedback(null)
  }

  function execute() {
    if (pending === 'reset') {
      resetEntries()
      setFeedback('Todos os dados foram apagados.')
    } else if (pending === 'loadSample') {
      loadSampleData()
      setFeedback('14 dias de dados de exemplo carregados.')
    }
    setPending(null)
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">Administração</h2>
        <p className="text-sm text-text-secondary mt-1">Gerencie os dados do aplicativo.</p>
      </div>

      {/* Summary card */}
      <div className="card flex flex-col gap-3">
        <p className="section-title mb-0">Dados atuais</p>
        <div className="flex items-center justify-between py-2"
          style={{ borderBottom: '1px solid #EBE7FF' }}>
          <span className="text-sm text-text-secondary">Dias registrados</span>
          <span className="text-2xl font-extrabold text-brand-purple">{entries.length}</span>
        </div>
        {entries.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Primeiro registro</span>
              <span className="text-sm font-semibold text-text-primary">{formatDate(firstDate!)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Último registro</span>
              <span className="text-sm font-semibold text-text-primary">{formatDate(lastDate!)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted italic">Nenhum registro.</p>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="rounded-2xl px-4 py-3 text-sm font-medium"
          style={{
            background: '#F5F3FF',
            border: '1px solid #DDD6FE',
            color: '#7C3AED',
          }}
        >
          {feedback}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => confirm('loadSample')}
          className="w-full py-4 px-5 rounded-[20px] bg-white text-left transition-all duration-200"
          style={{ boxShadow: '0 8px 32px rgba(235,231,255,0.95)' }}
        >
          <p className="text-sm font-semibold text-text-primary">Carregar dados de exemplo</p>
          <p className="text-xs text-text-secondary mt-0.5">Insere 14 dias de registros demo</p>
        </button>

        <button
          onClick={() => confirm('reset')}
          className="w-full py-4 px-5 rounded-[20px] text-left transition-all duration-200"
          style={{
            background: '#FFF5F5',
            boxShadow: '0 8px 32px rgba(220,38,38,0.08)',
            border: '1px solid #FECACA',
          }}
        >
          <p className="text-sm font-semibold text-brand-coral">Resetar todos os dados</p>
          <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>
            Apaga permanentemente todos os registros
          </p>
        </button>
      </div>

      {/* Confirmation modal */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-safe"
          style={{ background: 'rgba(26,26,46,0.50)' }}>
          <div
            className="bg-white w-full max-w-md rounded-t-[28px] p-6 flex flex-col gap-5"
            style={{ boxShadow: '0 -8px 40px rgba(124,58,237,0.16)' }}
          >
            {pending === 'reset' ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1"
                    style={{ background: '#FFF5F5' }}>
                    🗑️
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-coral">Resetar todos os dados</h3>
                  <p className="text-sm text-text-secondary">
                    Todos os registros serão apagados permanentemente. Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPending(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={execute}
                    className="flex-1 py-3 rounded-full font-semibold text-white transition-all duration-200"
                    style={{
                      background: '#DC2626',
                      boxShadow: '0 4px 16px rgba(220,38,38,0.30)',
                    }}
                  >
                    Apagar tudo
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}>
                    📋
                  </div>
                  <h3 className="text-lg font-extrabold text-text-primary">Carregar dados de exemplo</h3>
                  <p className="text-sm text-text-secondary">
                    Os dados atuais serão substituídos pelos 14 dias de exemplo.
                    {entries.length > 0 && ' Seus registros existentes serão perdidos.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPending(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button onClick={execute} className="btn-primary flex-1">
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
