import { useMemo, useState } from 'react'
import { useSelfLoans, useSelfLoanMutations } from '../hooks/useSelfLoans'
import { NewSelfLoanModal } from '../components/NewSelfLoanModal'
import { PlusIcon, TrashIcon, CheckIcon } from '../components/icons'
import { formatCurrency, formatDate } from '../lib/format'

const filters = [
  { v: 'pendente', l: 'Pendentes' },
  { v: 'pago', l: 'Pagos' },
  { v: 'todos', l: 'Todos' },
]

export function SelfLoans() {
  const { data: loans = [], isLoading } = useSelfLoans()
  const { markPaid, remove } = useSelfLoanMutations()
  const [filter, setFilter] = useState('pendente')
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(
    () => (filter === 'todos' ? loans : loans.filter((l) => l.status === filter)),
    [loans, filter]
  )

  const totalPendente = loans
    .filter((l) => l.status === 'pendente')
    .reduce((acc, l) => acc + Number(l.valor), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total pendente</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(totalPendente)}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <PlusIcon className="w-4 h-4" /> Novo
        </button>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.v
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-slate-400">Carregando...</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-slate-400">Nenhum registro nesta categoria.</p>
        )}
        {filtered.map((loan) => (
          <div
            key={loan.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{loan.descricao || 'Empréstimo pessoal'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(loan.data)}
                {loan.status === 'pago' && loan.data_pagamento
                  ? ` · pago em ${formatDate(loan.data_pagamento)}`
                  : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-semibold">{formatCurrency(loan.valor)}</span>
              {loan.status === 'pendente' && (
                <button
                  onClick={() => markPaid.mutate(loan.id)}
                  className="rounded-full bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400"
                  aria-label="Marcar como pago"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Excluir este registro?')) remove.mutate(loan.id)
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Excluir"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNew && <NewSelfLoanModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
