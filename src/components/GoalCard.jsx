import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '../lib/format'

export function GoalCard({ goal }) {
  const pct = goal.valor_alvo
    ? Math.min(100, Math.max(0, (goal.valor_atual / goal.valor_alvo) * 100))
    : null

  return (
    <Link
      to={`/investimentos/${goal.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-semibold">{goal.nome}</h3>
        {goal.prazo && (
          <span className="text-xs text-slate-500 dark:text-slate-400">até {formatDate(goal.prazo)}</span>
        )}
      </div>

      <p className="mb-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(goal.valor_atual)}
        {goal.valor_alvo ? (
          <span className="text-sm font-normal text-slate-400"> / {formatCurrency(goal.valor_alvo)}</span>
        ) : null}
      </p>

      {pct !== null && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {pct !== null && (
        <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">{pct.toFixed(0)}%</p>
      )}
    </Link>
  )
}
