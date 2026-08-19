import { useState } from 'react'
import { useCategories, useCategoryMutations } from '../hooks/useCategories'
import { PlusIcon, TrashIcon, PencilIcon, XIcon, CheckIcon } from '../components/icons'

const tipoLabel = { entrada: 'Entrada', saida: 'Saída', ambos: 'Ambos' }
const palette = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#22c55e', '#14b8a6', '#64748b', '#eab308', '#06b6d4']

function CategoryFormRow({ initial, onCancel, onSubmit, pending }) {
  const [form, setForm] = useState(initial || { nome: '', tipo: 'saida', cor: palette[0] })

  return (
    <div className="space-y-3 rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
      <input
        type="text"
        placeholder="Nome da categoria"
        value={form.nome}
        onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        autoFocus
      />
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(tipoLabel).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setForm((f) => ({ ...f, tipo: v }))}
            className={`rounded-lg py-1.5 text-xs font-medium ${
              form.tipo === v
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {palette.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setForm((f) => ({ ...f, cor: c }))}
            style={{ backgroundColor: c }}
            className={`h-7 w-7 rounded-full ${form.cor === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-slate-950 dark:ring-slate-100' : ''}`}
            aria-label={c}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <XIcon className="w-4 h-4" /> Cancelar
        </button>
        <button
          onClick={() => form.nome.trim() && onSubmit(form)}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <CheckIcon className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  )
}

export function Categories() {
  const { data: categories = [], isLoading } = useCategories()
  const { create, update, remove } = useCategoryMutations()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Categorias</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <PlusIcon className="w-4 h-4" /> Nova
          </button>
        )}
      </div>

      {creating && (
        <CategoryFormRow
          onCancel={() => setCreating(false)}
          pending={create.isPending}
          onSubmit={async (values) => {
            await create.mutateAsync(values)
            setCreating(false)
          }}
        />
      )}

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-slate-400">Carregando...</p>}
        {categories.map((c) =>
          editingId === c.id ? (
            <CategoryFormRow
              key={c.id}
              initial={{ nome: c.nome, tipo: c.tipo, cor: c.cor || palette[0] }}
              pending={update.isPending}
              onCancel={() => setEditingId(null)}
              onSubmit={async (values) => {
                await update.mutateAsync({ id: c.id, ...values })
                setEditingId(null)
              }}
            />
          ) : (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: c.cor || '#64748b' }}
                />
                <div>
                  <p className="text-sm font-medium">{c.nome}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tipoLabel[c.tipo]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingId(c.id)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Editar"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Excluir a categoria "${c.nome}"?`)) remove.mutate(c.id)
                  }}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Excluir"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
