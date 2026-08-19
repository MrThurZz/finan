import { useState } from 'react'
import { useContributionMutations } from '../hooks/useGoals'
import { todayISO } from '../lib/format'

export function ContributionForm({ goalId }) {
  const { create } = useContributionMutations(goalId)
  const [tipo, setTipo] = useState('aporte')
  const [form, setForm] = useState({ valor: '', data: todayISO(), descricao: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const valorNum = Number(String(form.valor).replace(',', '.'))
    if (!valorNum || valorNum <= 0) {
      setError('Informe um valor válido.')
      return
    }
    try {
      await create.mutateAsync({
        valor: tipo === 'aporte' ? valorNum : -valorNum,
        data: form.data,
        descricao: form.descricao || null,
      })
      setForm({ valor: '', data: todayISO(), descricao: '' })
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTipo('aporte')}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            tipo === 'aporte'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          Aporte
        </button>
        <button
          type="button"
          onClick={() => setTipo('resgate')}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            tipo === 'resgate'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          Resgate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Valor"
          value={form.valor}
          onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
          className="field"
        />
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
          className="field"
        />
      </div>

      <input
        type="text"
        placeholder="Descrição (opcional)"
        value={form.descricao}
        onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
        className="field"
      />

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        {create.isPending ? 'Salvando...' : 'Adicionar'}
      </button>
    </form>
  )
}
