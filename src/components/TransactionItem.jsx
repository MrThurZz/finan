import { useState } from 'react'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import { EditTransactionModal } from './EditTransactionModal'

export function TransactionItem({ transaction }) {
  const [editing, setEditing] = useState(false)
  const isFuture = transaction.data > todayISO()
  const isEntrada = transaction.tipo === 'entrada'
  const cor = transaction.categories?.cor || '#64748b'

  return (
    <>
      <button
        onClick={() => setEditing(true)}
        className={`flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 ${
          isFuture ? 'opacity-60' : ''
        }`}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: cor }}
        >
          {(transaction.categories?.nome || '?').slice(0, 1).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {transaction.descricao || transaction.categories?.nome || 'Sem descrição'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(transaction.data)}
            {transaction.categories?.nome ? ` · ${transaction.categories.nome}` : ''}
            {transaction.parcela_total ? ` · ${transaction.parcela_atual}/${transaction.parcela_total}` : ''}
            {isFuture ? ' · futuro' : ''}
          </p>
        </div>

        <span
          className={`shrink-0 text-sm font-semibold ${
            isEntrada ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isEntrada ? '+' : '-'} {formatCurrency(transaction.valor)}
        </span>
      </button>

      {editing && <EditTransactionModal transaction={transaction} onClose={() => setEditing(false)} />}
    </>
  )
}
