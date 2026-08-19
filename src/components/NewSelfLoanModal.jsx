import { useState } from 'react'
import { Modal } from './Modal'
import { useSelfLoanMutations } from '../hooks/useSelfLoans'
import { todayISO } from '../lib/format'

export function NewSelfLoanModal({ onClose }) {
  const { create } = useSelfLoanMutations()
  const [form, setForm] = useState({ valor: '', data: todayISO(), descricao: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const valorNum = Number(String(form.valor).replace(',', '.'))
    if (!valorNum || valorNum <= 0) {
      setError('Informe um valor válido.')
      return
    }
    try {
      await create.mutateAsync({
        valor: valorNum,
        data: form.data,
        descricao: form.descricao || null,
        status: 'pendente',
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    }
  }

  return (
    <Modal title="Novo 'devo a mim mesmo'" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Use isto para registrar que você retirou dinheiro de um investimento para uso pessoal e
          precisa devolver depois. Lance o resgate normalmente na meta em Investimentos e crie aqui
          o registro da dívida.
        </p>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.valor}
            onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
            className="field"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Data
          </label>
          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
            className="field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Descrição
          </label>
          <input
            type="text"
            placeholder="Opcional"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            className="field"
          />
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={create.isPending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Salvar
        </button>
      </form>
    </Modal>
  )
}
