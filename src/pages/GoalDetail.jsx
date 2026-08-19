import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useGoals, useGoalMutations, useContributions, useContributionMutations } from '../hooks/useGoals'
import { ContributionForm } from '../components/ContributionForm'
import { ArrowLeftIcon, TrashIcon } from '../components/icons'
import { formatCurrency, formatDate } from '../lib/format'

export function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: goals = [] } = useGoals()
  const { data: contributions = [], isLoading } = useContributions(id)
  const { remove: removeContribution } = useContributionMutations(id)
  const { remove: removeGoal } = useGoalMutations()

  const goal = goals.find((g) => g.id === id)

  async function handleDeleteGoal() {
    if (!window.confirm('Excluir esta meta e todo o histórico de aportes/resgates?')) return
    await removeGoal.mutateAsync(id)
    navigate('/investimentos')
  }

  const pct = goal?.valor_alvo
    ? Math.min(100, Math.max(0, (goal.valor_atual / goal.valor_alvo) * 100))
    : null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/investimentos" className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="flex-1 truncate text-lg font-bold">{goal?.nome || 'Meta'}</h1>
        <button
          onClick={handleDeleteGoal}
          className="rounded-full p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
          aria-label="Excluir meta"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {goal && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(goal.valor_atual)}
            {goal.valor_alvo ? (
              <span className="text-sm font-normal text-slate-400"> / {formatCurrency(goal.valor_alvo)}</span>
            ) : null}
          </p>
          {goal.prazo && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Prazo: {formatDate(goal.prazo)}</p>
          )}
          {pct !== null && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      )}

      <ContributionForm goalId={id} />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Histórico
        </h2>
        {isLoading && <p className="text-sm text-slate-400">Carregando...</p>}
        {!isLoading && contributions.length === 0 && (
          <p className="text-sm text-slate-400">Nenhum aporte registrado ainda.</p>
        )}
        <div className="space-y-2">
          {contributions.map((c) => {
            const isResgate = Number(c.valor) < 0
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.descricao || (isResgate ? 'Resgate' : 'Aporte')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(c.data)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      isResgate ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatCurrency(c.valor)}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Excluir este registro?')) removeContribution.mutate(c.id)
                    }}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
