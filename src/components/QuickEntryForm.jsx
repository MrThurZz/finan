import { useMemo, useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useTransactionMutations } from '../hooks/useTransactions'
import { todayISO } from '../lib/format'

const emptyState = () => ({
  valor: '',
  tipo: 'saida',
  forma_pagamento: 'debito',
  categoria_id: '',
  descricao: '',
  data: todayISO(),
  parcelas: 2,
})

export function QuickEntryForm() {
  const { data: categories = [] } = useCategories()
  const { create } = useTransactionMutations()
  const [form, setForm] = useState(emptyState)
  const [parcelado, setParcelado] = useState(false)
  const [error, setError] = useState('')

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.tipo === form.tipo || c.tipo === 'ambos'),
    [categories, form.tipo]
  )

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function setTipo(tipo) {
    setForm((f) => ({ ...f, tipo, categoria_id: '' }))
    if (tipo === 'entrada') setParcelado(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const valorNum = Number(String(form.valor).replace(',', '.'))
    if (!valorNum || valorNum <= 0) {
      setError('Informe um valor válido.')
      return
    }
    if (!form.data) {
      setError('Informe a data.')
      return
    }

    const payload = {
      valor: valorNum,
      tipo: form.tipo,
      forma_pagamento: form.tipo === 'saida' ? form.forma_pagamento : null,
      categoria_id: form.categoria_id || null,
      descricao: form.descricao || null,
      data: form.data,
      parcelas:
        form.tipo === 'saida' && form.forma_pagamento === 'credito' && parcelado
          ? Number(form.parcelas)
          : undefined,
    }

    try {
      await create.mutateAsync(payload)
      setForm(emptyState())
      setParcelado(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar lançamento.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTipo('saida')}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            form.tipo === 'saida'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          Saída
        </button>
        <button
          type="button"
          onClick={() => setTipo('entrada')}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            form.tipo === 'entrada'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          Entrada
        </button>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Valor {parcelado ? '(da parcela)' : ''}
        </label>
        <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-slate-400">R$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.valor}
            onChange={(e) => set('valor', e.target.value)}
            className="w-full bg-transparent px-2 py-2.5 text-lg font-semibold outline-none"
            autoFocus
          />
        </div>
      </div>

      {form.tipo === 'saida' && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Forma de pagamento
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'debito', l: 'Débito' },
              { v: 'credito', l: 'Crédito' },
              { v: 'outro', l: 'Outro' },
            ].map(({ v, l }) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  set('forma_pagamento', v)
                  if (v !== 'credito') setParcelado(false)
                }}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  form.forma_pagamento === v
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.tipo === 'saida' && form.forma_pagamento === 'credito' && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={parcelado}
              onChange={(e) => setParcelado(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-600"
            />
            Parcelado
          </label>
          {parcelado && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="60"
                value={form.parcelas}
                onChange={(e) => set('parcelas', e.target.value)}
                className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">vezes</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Categoria
          </label>
          <select
            value={form.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
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
            onChange={(e) => set('data', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Descrição
        </label>
        <input
          type="text"
          placeholder="Opcional"
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={create.isPending}
        className="mt-4 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {create.isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
