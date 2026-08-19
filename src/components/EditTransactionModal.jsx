import { useMemo, useState } from 'react'
import { Modal } from './Modal'
import { useCategories } from '../hooks/useCategories'
import { useTransactionMutations } from '../hooks/useTransactions'

export function EditTransactionModal({ transaction, onClose }) {
  const { data: categories = [] } = useCategories()
  const { update, remove, removeGroup } = useTransactionMutations()
  const [form, setForm] = useState({
    valor: transaction.valor,
    categoria_id: transaction.categoria_id || '',
    descricao: transaction.descricao || '',
    data: transaction.data,
  })
  const [error, setError] = useState('')

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.tipo === transaction.tipo || c.tipo === 'ambos'),
    [categories, transaction.tipo]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    const valorNum = Number(String(form.valor).replace(',', '.'))
    if (!valorNum || valorNum <= 0) {
      setError('Informe um valor válido.')
      return
    }
    try {
      await update.mutateAsync({
        id: transaction.id,
        valor: valorNum,
        categoria_id: form.categoria_id || null,
        descricao: form.descricao || null,
        data: form.data,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao salvar.')
    }
  }

  async function handleDelete() {
    const isParceled = !!transaction.grupo_parcelamento_id
    const confirmMsg = isParceled
      ? 'Excluir apenas esta parcela, ou todas as parcelas deste parcelamento?'
      : 'Excluir este lançamento?'
    if (!window.confirm(confirmMsg + (isParceled ? '\n\nOK = apenas esta / Cancelar = manter' : ''))) {
      if (!isParceled) return
    }
    try {
      if (isParceled) {
        const excluirTudo = window.confirm(
          'Deseja excluir TODAS as parcelas deste grupo? OK = todas, Cancelar = apenas esta.'
        )
        if (excluirTudo) {
          await removeGroup.mutateAsync(transaction.grupo_parcelamento_id)
        } else {
          await remove.mutateAsync(transaction.id)
        }
      } else {
        await remove.mutateAsync(transaction.id)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao excluir.')
    }
  }

  return (
    <Modal title="Editar lançamento" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.valor}
            onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
            className="field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Categoria
          </label>
          <select
            value={form.categoria_id}
            onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}
            className="field"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
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
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            className="field"
          />
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
          >
            Excluir
          </button>
          <button
            type="submit"
            disabled={update.isPending}
            className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </Modal>
  )
}
