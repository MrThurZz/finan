import { useState } from 'react'
import { Modal } from './Modal'
import { useGoalMutations } from '../hooks/useGoals'

export function NewGoalModal({ onClose }) {
  const { create } = useGoalMutations()
  const [form, setForm] = useState({ nome: '', valor_alvo: '', prazo: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Informe um nome para a meta.')
      return
    }
    try {
      await create.mutateAsync({
        nome: form.nome.trim(),
        valor_alvo: form.valor_alvo ? Number(form.valor_alvo) : null,
        prazo: form.prazo || null,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao criar meta.')
    }
  }

  return (
    <Modal title="Nova meta de investimento" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Nome
          </label>
          <input
            type="text"
            placeholder="Ex: Viagem"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            className="field"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Valor alvo (opcional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.valor_alvo}
            onChange={(e) => setForm((f) => ({ ...f, valor_alvo: e.target.value }))}
            className="field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Prazo (opcional)
          </label>
          <input
            type="date"
            value={form.prazo}
            onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
            className="field"
          />
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={create.isPending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Criar meta
        </button>
      </form>
    </Modal>
  )
}
