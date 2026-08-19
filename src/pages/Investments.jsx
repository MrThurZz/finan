import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useGoals, useAllContributions } from '../hooks/useGoals'
import { GoalCard } from '../components/GoalCard'
import { NewGoalModal } from '../components/NewGoalModal'
import { PlusIcon } from '../components/icons'
import { formatCurrency, monthLabel } from '../lib/format'

export function Investments() {
  const { data: goals = [], isLoading } = useGoals()
  const { data: contributions = [] } = useAllContributions()
  const [showNew, setShowNew] = useState(false)

  const chartData = useMemo(() => {
    if (contributions.length === 0) return []
    const byMonth = new Map()
    for (const c of contributions) {
      const key = c.data.slice(0, 7)
      byMonth.set(key, (byMonth.get(key) || 0) + Number(c.valor))
    }
    const sortedKeys = [...byMonth.keys()].sort()
    let acc = 0
    return sortedKeys.map((key) => {
      acc += byMonth.get(key)
      return { mes: monthLabel(`${key}-01`), total: acc }
    })
  }, [contributions])

  const totalGeral = goals.reduce((acc, g) => acc + g.valor_atual, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Patrimônio investido</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalGeral)}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <PlusIcon className="w-4 h-4" /> Nova meta
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Evolução do patrimônio
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                width={48}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="total" stroke="#10b981" fill="url(#colorTotal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-400">Carregando...</p>}
        {!isLoading && goals.length === 0 && (
          <p className="text-sm text-slate-400">Nenhuma meta cadastrada ainda.</p>
        )}
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
      </div>

      {showNew && <NewGoalModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
